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

export type PeerDiagnostics = {
  id: string;
  /** How this peer's events travel right now. */
  transport: "p2p" | "relay" | "connecting";
  channelState: RTCDataChannelState | null;
  connectionState: RTCPeerConnectionState | null;
  polite: boolean;
  queuedMessages: number;
  everOpened: boolean;
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

// STUN yields host/server-reflexive candidates; public TURN (Open Relay
// Project, keyless static credentials — same publishable-key model as the Ably
// and Giphy keys in src/app/constants.ts) relays the rest, so symmetric-NAT
// peers still connect P2P instead of looping ICE restarts and riding the Ably
// signaling channel forever. Best-effort: if these endpoints are unreachable
// the peer simply falls back to relay, as it did before. Multiple ports/TCP
// give corporate firewalls that block UDP a path on 443.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
  {
    urls: [
      "turn:openrelay.metered.ca:80",
      "turn:openrelay.metered.ca:443",
      "turn:openrelay.metered.ca:443?transport=tcp",
    ],
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

const DATA_CHANNEL_LABEL = "events";
const OPEN_TIMEOUT_MS = 10_000;
/**
 * ICE restarts allowed on a `failed` connection before we give up on P2P for
 * that peer. Without a cap an un-connectable pair (e.g. symmetric NAT with no
 * working TURN) restarts ICE on every `failed` transition, and each restart
 * re-floods the Ably signaling channel with a fresh offer + candidate batch.
 */
const MAX_ICE_RESTARTS = 1;

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
  /** ICE restarts spent since the last clean open; caps the retry loop. */
  iceRestarts: number;
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
type PeerManagerOptions = {
  /** How long a data channel may stay unopened before falling back to relay. */
  openTimeoutMs?: number;
};

class PeerManager {
  #selfId: string;
  #peers = new Map<string, Peer>();
  #callbacks: PeerManagerCallbacks;
  #openTimeoutMs: number;

  constructor(
    selfId: string,
    callbacks: PeerManagerCallbacks,
    options: PeerManagerOptions = {}
  ) {
    this.#selfId = selfId;
    this.#callbacks = callbacks;
    this.#openTimeoutMs = options.openTimeoutMs ?? OPEN_TIMEOUT_MS;
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

  /** Live per-peer diagnostics (powers the `nerdPoking` console inspector). */
  snapshot(): PeerDiagnostics[] {
    return [...this.#peers.values()].map((peer) => ({
      id: peer.id,
      transport: peer.relay
        ? "relay"
        : peer.channel?.readyState === "open"
          ? "p2p"
          : "connecting",
      channelState: peer.channel?.readyState ?? null,
      connectionState: peer.connection?.connectionState ?? null,
      polite: peer.polite,
      queuedMessages: peer.queue.length,
      everOpened: peer.everOpened,
    }));
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
      iceRestarts: 0,
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
      this.#openTimeoutMs
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
      if (connection.connectionState !== "failed") {
        return;
      }

      // Relay covers the gap while we retry. Cap the retries: once the budget
      // is spent we abandon P2P for this peer so it stops re-flooding signaling.
      this.#fallBackToRelay(peer, "connection_failed");

      if (peer.iceRestarts < MAX_ICE_RESTARTS) {
        peer.iceRestarts += 1;
        connection.restartIce();
      } else {
        this.#abandonConnection(peer);
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
      peer.iceRestarts = 0;

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

  /**
   * Permanently give up on P2P for this peer: tear the RTCPeerConnection down so
   * it stops emitting ICE candidates and renegotiation offers over the signaling
   * layer. The peer entry stays in the map in relay mode (its traffic keeps
   * flowing over Ably) and is never re-dialed — connect()'s guard sees no
   * connection. A fresh connect() after the peer leaves and rejoins builds a new
   * connection from scratch.
   */
  #abandonConnection(peer: Peer) {
    const { connection } = peer;

    if (!connection) {
      return;
    }

    peer.connection = null;
    peer.channel = null;
    connection.onicecandidate = null;
    connection.onnegotiationneeded = null;
    connection.onconnectionstatechange = null;
    connection.ondatachannel = null;
    connection.close();
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
