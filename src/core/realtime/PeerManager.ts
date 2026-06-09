export type PeerMessage = {
  name: string;
  data: Record<string, any>;
};

export type SignalPayload = {
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
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
  onRelay: (peerId: string, undelivered: PeerMessage[]) => void;
};

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
];

const DATA_CHANNEL_LABEL = "events";
const OPEN_TIMEOUT_MS = 10_000;

type Peer = {
  id: string;
  connection: RTCPeerConnection;
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
};

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

    if (this.#selfId < peerId && !peer.channel) {
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
    peer.connection.close();
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
    const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

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
    };

    peer.openTimer = setTimeout(
      () => this.#fallBackToRelay(peer),
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
        this.#fallBackToRelay(peer);
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
        this.#fallBackToRelay(peer);
      }
    };
  }

  #signalLocalDescription(peer: Peer) {
    const { localDescription } = peer.connection;

    if (localDescription) {
      this.#callbacks.onSignal(peer.id, {
        description: localDescription.toJSON(),
      });
    }
  }

  #fallBackToRelay(peer: Peer) {
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

    this.#callbacks.onRelay(peer.id, undelivered);
  }
}

export { PeerManager };
