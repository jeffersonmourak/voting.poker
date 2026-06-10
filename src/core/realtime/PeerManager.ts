export type PeerMessage = {
  name: string;
  data: Record<string, any>;
};

export type SignalPayload = {
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

export type RelayReason =
  | "timeout"
  | "connection_failed"
  | "channel_closed"
  | "webrtc_unavailable";

export type RelayFallbackInfo = {
  reason: RelayReason;
  /** ms between the peer entry being created and the fallback. */
  timeSinceConnectMs: number;
  peerCount: number;
};

export type ChannelOpenInfo = {
  /** ms between the peer entry being created and the channel opening. */
  timeToOpenMs: number;
  /** True when this channel re-opened after a failure or relay spell. */
  reconnect: boolean;
  peerCount: number;
  /** Local ICE candidate type in use ("host", "srflx", …); best-effort. */
  candidateType?: string;
};

type PeerManagerCallbacks = {
  /** Carry an SDP description or ICE candidate to `target` over the signaling layer (Ably). */
  onSignal: (target: string, payload: SignalPayload) => void;
  /** A pool event arrived from a peer over its data channel. */
  onMessage: (from: string, message: PeerMessage) => void;
  /**
   * The peer fell back to relay mode (channel never opened, or the connection
   * failed). `undelivered` holds messages queued for that peer; the caller must
   * republish them over the signaling layer.
   */
  onRelay: (
    peerId: string,
    undelivered: PeerMessage[],
    info: RelayFallbackInfo
  ) => void;
  /** A peer's data channel opened (or re-opened). Telemetry only. */
  onChannelOpen?: (peerId: string, info: ChannelOpenInfo) => void;
};

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
];

const DATA_CHANNEL_LABEL = "events";
const OPEN_TIMEOUT_MS = 10_000;

type Peer = {
  id: string;
  /** Null when RTCPeerConnection construction failed (WebRTC blocked/absent). */
  connection: RTCPeerConnection | null;
  channel: RTCDataChannel | null;
  /** Perfect-negotiation role: the polite side rolls back on offer collision. */
  polite: boolean;
  makingOffer: boolean;
  ignoreOffer: boolean;
  /** Messages waiting for the channel to open. */
  queue: PeerMessage[];
  /** True while this peer's traffic must be relayed over the signaling layer. */
  relay: boolean;
  openTimer: ReturnType<typeof setTimeout> | null;
  createdAt: number;
  everOpened: boolean;
};

/** Best-effort: the local candidate type of the selected ICE pair. */
async function selectedCandidateType(
  connection: RTCPeerConnection
): Promise<string | undefined> {
  try {
    const stats = await connection.getStats();
    const entries = [...stats.values()];
    const transport = entries.find(
      (entry) => entry.type === "transport" && entry.selectedCandidatePairId
    );
    const pair = transport
      ? stats.get(transport.selectedCandidatePairId)
      : entries.find(
          (entry) =>
            entry.type === "candidate-pair" &&
            entry.nominated &&
            entry.state === "succeeded"
        );
    const local = pair && stats.get(pair.localCandidateId);

    return local?.candidateType;
  } catch {
    return undefined;
  }
}

/**
 * A full mesh of WebRTC data channels, one per peer, with Ably demoted to
 * signaling. Within each pair the lower user id is the dialer (it creates the
 * data channel, which kicks off negotiation) and the impolite side of the
 * perfect-negotiation pattern; the higher id answers and is polite. Messages
 * sent before a channel opens are queued; if the channel never opens the peer
 * flips to relay mode and the caller falls back to publishing over Ably.
 */
class PeerManager {
  #selfId: string;
  #peers = new Map<string, Peer>();
  #callbacks: PeerManagerCallbacks;

  constructor(selfId: string, callbacks: PeerManagerCallbacks) {
    this.#selfId = selfId;
    this.#callbacks = callbacks;
  }

  /** Idempotent: ensures a connection to `peerId` exists, dialing if we are the lower id. */
  connect(peerId: string) {
    if (peerId === this.#selfId) {
      return;
    }

    const peer = this.#peers.get(peerId) ?? this.#createPeer(peerId);

    if (this.#selfId < peerId && peer.connection && !peer.channel) {
      this.#attachChannel(
        peer,
        peer.connection.createDataChannel(DATA_CHANNEL_LABEL)
      );
    }
  }

  async handleSignal(from: string, payload: SignalPayload) {
    if (from === this.#selfId) {
      return;
    }

    const peer = this.#peers.get(from) ?? this.#createPeer(from);
    const { connection } = peer;
    const { description, candidate } = payload;

    if (!connection) {
      return;
    }

    try {
      if (description) {
        const offerCollision =
          description.type === "offer" &&
          (peer.makingOffer || connection.signalingState !== "stable");

        peer.ignoreOffer = !peer.polite && offerCollision;
        if (peer.ignoreOffer) {
          return;
        }

        await connection.setRemoteDescription(description);

        if (description.type === "offer") {
          await connection.setLocalDescription();
          this.#signalLocalDescription(peer);
        }
      } else if (candidate) {
        try {
          await connection.addIceCandidate(candidate);
        } catch (error) {
          if (!peer.ignoreOffer) {
            throw error;
          }
        }
      }
    } catch {
      // A broken negotiation leaves the channel unopened; the open timer
      // flips the peer to relay mode.
    }
  }

  /**
   * Send to one peer. Returns false when the message must be relayed over the
   * signaling layer instead (peer unknown or already in relay mode).
   */
  send(peerId: string, message: PeerMessage): boolean {
    const peer = this.#peers.get(peerId);

    if (!peer || peer.relay) {
      return false;
    }

    if (peer.channel?.readyState === "open") {
      peer.channel.send(JSON.stringify(message));
    } else {
      peer.queue.push(message);
    }

    return true;
  }

  /** Send to every peer. Returns true if at least one peer needs the relay fallback. */
  broadcast(message: PeerMessage): boolean {
    let needsRelay = false;

    for (const peer of this.#peers.values()) {
      needsRelay = !this.send(peer.id, message) || needsRelay;
    }

    return needsRelay;
  }

  isOpen(peerId: string): boolean {
    return this.#peers.get(peerId)?.channel?.readyState === "open";
  }

  disconnect(peerId: string) {
    const peer = this.#peers.get(peerId);

    if (!peer) {
      return;
    }

    this.#peers.delete(peerId);

    if (peer.openTimer) {
      clearTimeout(peer.openTimer);
    }

    peer.channel?.close();
    peer.connection?.close();
  }

  /**
   * Close every connection. Re-entrant rather than terminal: under React
   * StrictMode the owning effect runs setup → cleanup → setup on mount, and
   * presence events arriving after the remount must be able to dial again.
   */
  destroy() {
    for (const peerId of this.#peers.keys()) {
      this.disconnect(peerId);
    }
  }

  #createPeer(peerId: string): Peer {
    let connection: RTCPeerConnection | null = null;

    try {
      connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    } catch {
      // WebRTC blocked or absent (privacy browsers/extensions). The peer is
      // born in relay mode so its traffic rides the signaling layer instead.
    }

    const peer: Peer = {
      id: peerId,
      connection,
      channel: null,
      polite: this.#selfId > peerId,
      makingOffer: false,
      ignoreOffer: false,
      queue: [],
      relay: false,
      openTimer: null,
      createdAt: Date.now(),
      everOpened: false,
    };

    if (!connection) {
      peer.relay = true;
      this.#peers.set(peerId, peer);
      this.#callbacks.onRelay(peerId, [], {
        reason: "webrtc_unavailable",
        timeSinceConnectMs: 0,
        peerCount: this.#peers.size,
      });

      return peer;
    }

    peer.openTimer = setTimeout(
      () => this.#fallBackToRelay(peer, "timeout"),
      OPEN_TIMEOUT_MS
    );

    connection.onnegotiationneeded = async () => {
      try {
        peer.makingOffer = true;
        await connection.setLocalDescription();
        this.#signalLocalDescription(peer);
      } catch {
        // Same recovery as handleSignal: the open timer covers a dead negotiation.
      } finally {
        peer.makingOffer = false;
      }
    };

    connection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.#callbacks.onSignal(peer.id, { candidate: candidate.toJSON() });
      }
    };

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === "failed") {
        this.#fallBackToRelay(peer, "connection_failed");
        connection.restartIce();
      }
    };

    connection.ondatachannel = ({ channel }) =>
      this.#attachChannel(peer, channel);

    this.#peers.set(peerId, peer);

    return peer;
  }

  #attachChannel(peer: Peer, channel: RTCDataChannel) {
    peer.channel = channel;

    channel.onopen = () => {
      if (peer.openTimer) {
        clearTimeout(peer.openTimer);
        peer.openTimer = null;
      }

      peer.relay = false;

      const queued = peer.queue;
      peer.queue = [];

      for (const message of queued) {
        channel.send(JSON.stringify(message));
      }

      const reconnect = peer.everOpened;
      peer.everOpened = true;

      if (this.#callbacks.onChannelOpen && peer.connection) {
        void selectedCandidateType(peer.connection).then((candidateType) => {
          this.#callbacks.onChannelOpen?.(peer.id, {
            timeToOpenMs: Date.now() - peer.createdAt,
            reconnect,
            peerCount: this.#peers.size,
            candidateType,
          });
        });
      }
    };

    channel.onmessage = ({ data }) => {
      try {
        this.#callbacks.onMessage(peer.id, JSON.parse(data));
      } catch {
        // Ignore malformed payloads; CoreClient.backendCallback is the real gate.
      }
    };

    channel.onclose = () => {
      if (this.#peers.has(peer.id)) {
        this.#fallBackToRelay(peer, "channel_closed");
      }
    };
  }

  #signalLocalDescription(peer: Peer) {
    const localDescription = peer.connection?.localDescription;

    if (localDescription) {
      this.#callbacks.onSignal(peer.id, {
        description: localDescription.toJSON(),
      });
    }
  }

  #fallBackToRelay(peer: Peer, reason: RelayReason) {
    if (peer.openTimer) {
      clearTimeout(peer.openTimer);
      peer.openTimer = null;
    }

    if (peer.relay) {
      return;
    }

    peer.relay = true;

    const undelivered = peer.queue;
    peer.queue = [];

    this.#callbacks.onRelay(peer.id, undelivered, {
      reason,
      timeSinceConnectMs: Date.now() - peer.createdAt,
      peerCount: this.#peers.size,
    });
  }
}

export { PeerManager };
