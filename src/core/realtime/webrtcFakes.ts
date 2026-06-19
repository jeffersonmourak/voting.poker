/**
 * Minimal WebRTC test doubles for PeerManager unit tests. They implement just
 * the surface PeerManager touches; negotiation is driven manually from tests
 * (e.g. `channel.simulateOpen()`).
 */

export class FakeRTCDataChannel {
  readyState: RTCDataChannelState = "connecting";
  sent: string[] = [];
  onopen: ((event: unknown) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: unknown) => void) | null = null;

  constructor(public label: string) {}

  send(data: string) {
    if (this.readyState !== "open") {
      throw new Error("send on non-open channel");
    }
    this.sent.push(data);
  }

  close() {
    if (this.readyState === "closed") {
      return;
    }
    this.readyState = "closed";
    this.onclose?.({});
  }

  simulateOpen() {
    this.readyState = "open";
    this.onopen?.({});
  }

  simulateMessage(data: string) {
    this.onmessage?.({ data });
  }
}

export class FakeRTCPeerConnection {
  static instances: FakeRTCPeerConnection[] = [];

  connectionState: RTCPeerConnectionState = "new";
  signalingState: RTCSignalingState = "stable";
  localDescription: { type: string; toJSON: () => object } | null = null;
  channels: FakeRTCDataChannel[] = [];

  onnegotiationneeded: (() => void) | null = null;
  onicecandidate: ((event: { candidate: unknown }) => void) | null = null;
  onconnectionstatechange: (() => void) | null = null;
  ondatachannel: ((event: { channel: FakeRTCDataChannel }) => void) | null =
    null;

  constructor(public config: unknown) {
    FakeRTCPeerConnection.instances.push(this);
  }

  createDataChannel(label: string) {
    const channel = new FakeRTCDataChannel(label);
    this.channels.push(channel);
    return channel;
  }

  async setLocalDescription() {
    this.localDescription = {
      type: "offer",
      toJSON: () => ({ type: "offer", sdp: "fake" }),
    };
  }

  async setRemoteDescription(_description: unknown) {}

  async addIceCandidate(_candidate?: unknown) {}

  async getStats() {
    return new Map<string, unknown>();
  }

  restartIceCount = 0;
  restartIce() {
    this.restartIceCount += 1;
  }

  close() {
    this.connectionState = "closed";
  }

  simulateFailure() {
    this.connectionState = "failed";
    this.onconnectionstatechange?.();
  }

  /** The remote side created the channel (we are the answerer). */
  simulateRemoteChannel() {
    const channel = new FakeRTCDataChannel("events");
    this.channels.push(channel);
    this.ondatachannel?.({ channel });
    return channel;
  }
}

class UnavailableRTCPeerConnection {
  constructor() {
    throw new Error("WebRTC is disabled");
  }
}

type MutableGlobal = {
  RTCPeerConnection?: unknown;
};

export function installFakeWebRTC({ unavailable = false } = {}) {
  const host = globalThis as MutableGlobal;
  const original = host.RTCPeerConnection;

  FakeRTCPeerConnection.instances = [];
  host.RTCPeerConnection = unavailable
    ? UnavailableRTCPeerConnection
    : FakeRTCPeerConnection;

  return () => {
    host.RTCPeerConnection = original;
  };
}
