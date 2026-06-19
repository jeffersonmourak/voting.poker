import { afterEach, describe, expect, test } from "bun:test";
import {
  type PeerMessage,
  PeerManager,
  type RelayFallbackInfo,
} from "./PeerManager";
import { FakeRTCPeerConnection, installFakeWebRTC } from "./webrtcFakes";

type RelayCall = {
  peerId: string;
  undelivered: PeerMessage[];
  info: RelayFallbackInfo;
};

function makeManager(
  selfId: string,
  { unavailable = false, openTimeoutMs = 5 } = {}
) {
  const restore = installFakeWebRTC({ unavailable });
  cleanups.push(restore);

  const signals: { target: string; payload: unknown }[] = [];
  const messages: { from: string; message: PeerMessage }[] = [];
  const relays: RelayCall[] = [];

  const manager = new PeerManager(
    selfId,
    {
      onSignal: (target, payload) => signals.push({ target, payload }),
      onMessage: (from, message) => messages.push({ from, message }),
      onRelay: (peerId, undelivered, info) =>
        relays.push({ peerId, undelivered, info }),
    },
    { openTimeoutMs }
  );
  cleanups.push(() => manager.destroy());

  return { manager, signals, messages, relays };
}

const cleanups: (() => void)[] = [];
afterEach(() => {
  while (cleanups.length) {
    cleanups.pop()?.();
  }
});

const lastConnection = () => FakeRTCPeerConnection.instances.at(-1)!;
const MSG: PeerMessage = { name: "VOTE", data: { vote: "5" } };

describe("dialing rule", () => {
  test("the lower self id dials: it creates the data channel", () => {
    const { manager } = makeManager("aaa");
    manager.connect("zzz");

    expect(lastConnection().channels).toHaveLength(1);
  });

  test("the higher self id answers: no channel until ondatachannel", () => {
    const { manager } = makeManager("zzz");
    manager.connect("aaa");

    expect(lastConnection().channels).toHaveLength(0);
    expect(manager.isOpen("aaa")).toBe(false);

    lastConnection().simulateRemoteChannel().simulateOpen();
    expect(manager.isOpen("aaa")).toBe(true);
  });

  test("connect is idempotent and never dials itself", () => {
    const { manager } = makeManager("aaa");
    manager.connect("aaa");
    expect(FakeRTCPeerConnection.instances).toHaveLength(0);

    manager.connect("bbb");
    manager.connect("bbb");
    expect(FakeRTCPeerConnection.instances).toHaveLength(1);
    expect(manager.snapshot()).toHaveLength(1);
  });
});

describe("send queue", () => {
  test("messages queue while connecting and flush in order on open", () => {
    const { manager } = makeManager("aaa");
    manager.connect("bbb");
    const channel = lastConnection().channels[0];

    expect(manager.send("bbb", { name: "A", data: {} })).toBe(true);
    expect(manager.send("bbb", { name: "B", data: {} })).toBe(true);
    expect(channel.sent).toHaveLength(0);

    channel.simulateOpen();

    expect(channel.sent.map((raw) => JSON.parse(raw).name)).toEqual([
      "A",
      "B",
    ]);

    manager.send("bbb", { name: "C", data: {} });
    expect(channel.sent).toHaveLength(3);
  });

  test("send returns false for an unknown peer", () => {
    const { manager } = makeManager("aaa");
    expect(manager.send("nobody", MSG)).toBe(false);
  });

  test("incoming channel messages reach onMessage", () => {
    const { manager, messages } = makeManager("aaa");
    manager.connect("bbb");
    const channel = lastConnection().channels[0];
    channel.simulateOpen();

    channel.simulateMessage(JSON.stringify(MSG));

    expect(messages).toEqual([{ from: "bbb", message: MSG }]);
  });
});

describe("relay fallback", () => {
  test("open timeout flips the peer to relay and hands back the queue", async () => {
    const { manager, relays } = makeManager("aaa", { openTimeoutMs: 2 });
    manager.connect("bbb");
    manager.send("bbb", MSG);

    await Bun.sleep(10);

    expect(relays).toHaveLength(1);
    expect(relays[0].peerId).toBe("bbb");
    expect(relays[0].info.reason).toBe("timeout");
    expect(relays[0].undelivered).toEqual([MSG]);

    expect(manager.send("bbb", MSG)).toBe(false);
    expect(manager.broadcast(MSG)).toBe(true);
    expect(manager.snapshot()[0].transport).toBe("relay");
  });

  test("connection failure triggers the fallback", () => {
    const { manager, relays } = makeManager("aaa", { openTimeoutMs: 60_000 });
    manager.connect("bbb");

    lastConnection().simulateFailure();

    expect(relays).toHaveLength(1);
    expect(relays[0].info.reason).toBe("connection_failed");
  });

  test("a closing channel triggers the fallback", () => {
    const { manager, relays } = makeManager("aaa", { openTimeoutMs: 60_000 });
    manager.connect("bbb");
    const channel = lastConnection().channels[0];
    channel.simulateOpen();

    channel.close();

    expect(relays).toHaveLength(1);
    expect(relays[0].info.reason).toBe("channel_closed");
  });

  test("a reopened channel returns the peer to p2p", async () => {
    const { manager } = makeManager("aaa", { openTimeoutMs: 2 });
    manager.connect("bbb");
    const channel = lastConnection().channels[0];

    await Bun.sleep(10);
    expect(manager.snapshot()[0].transport).toBe("relay");

    channel.simulateOpen();

    expect(manager.snapshot()[0].transport).toBe("p2p");
    expect(manager.send("bbb", MSG)).toBe(true);
  });

  test("WebRTC unavailable: peers are relay-born and broadcast still relays", () => {
    const { manager, relays } = makeManager("aaa", { unavailable: true });
    manager.connect("bbb");

    expect(relays).toHaveLength(1);
    expect(relays[0].info.reason).toBe("webrtc_unavailable");
    expect(manager.send("bbb", MSG)).toBe(false);
    expect(manager.broadcast(MSG)).toBe(true);
    expect(manager.snapshot()[0].transport).toBe("relay");
  });
});

describe("ICE restart cap", () => {
  test("caps ICE restarts, then tears the connection down to stop signaling", () => {
    const { manager } = makeManager("aaa", { openTimeoutMs: 60_000 });
    manager.connect("bbb");
    const connection = lastConnection();

    // First failure: relay covers the gap and we retry once.
    connection.simulateFailure();
    expect(connection.restartIceCount).toBe(1);
    expect(connection.connectionState).toBe("failed");

    // Second failure: retry budget spent, so the connection is torn down — no
    // further ICE restart, handlers detached so it stops emitting signaling.
    connection.simulateFailure();
    expect(connection.restartIceCount).toBe(1);
    expect(connection.connectionState).toBe("closed");
    expect(connection.onicecandidate).toBeNull();
    expect(connection.onnegotiationneeded).toBeNull();

    // The peer stays tracked and relayed; broadcast still routes it over Ably.
    expect(manager.snapshot()[0].transport).toBe("relay");
    expect(manager.broadcast(MSG)).toBe(true);
  });

  test("a clean reopen restores the ICE-restart budget", () => {
    const { manager } = makeManager("aaa", { openTimeoutMs: 60_000 });
    manager.connect("bbb");
    const connection = lastConnection();
    const channel = connection.channels[0];

    connection.simulateFailure();
    expect(connection.restartIceCount).toBe(1);

    // A successful open resets the budget, so a later failure retries again
    // rather than abandoning the connection.
    channel.simulateOpen();
    connection.simulateFailure();

    expect(connection.restartIceCount).toBe(2);
    expect(connection.connectionState).toBe("failed");
  });
});

describe("broadcast", () => {
  test("reaches every open peer and reports relay need for the rest", () => {
    const { manager } = makeManager("aaa", { unavailable: false });
    manager.connect("bbb");
    const open = lastConnection().channels[0];
    open.simulateOpen();
    manager.connect("ccc");
    lastConnection().simulateFailure();

    const needsRelay = manager.broadcast(MSG);

    expect(needsRelay).toBe(true);
    expect(open.sent.map((raw) => JSON.parse(raw).name)).toEqual(["VOTE"]);
  });

  test("returns false when every peer is reachable", () => {
    const { manager } = makeManager("aaa");
    manager.connect("bbb");
    lastConnection().channels[0].simulateOpen();

    expect(manager.broadcast(MSG)).toBe(false);
  });
});

describe("lifecycle", () => {
  test("disconnect removes the peer without a relay event", () => {
    const { manager, relays } = makeManager("aaa");
    manager.connect("bbb");
    lastConnection().channels[0].simulateOpen();

    manager.disconnect("bbb");

    expect(relays).toHaveLength(0);
    expect(manager.snapshot()).toHaveLength(0);
    expect(manager.isOpen("bbb")).toBe(false);
  });

  test("destroy is re-entrant: connecting works again afterwards", () => {
    // Regression: React StrictMode runs the owning effect's cleanup once on
    // mount in dev; a terminal destroy() silently disabled all P2P.
    const { manager } = makeManager("aaa");
    manager.connect("bbb");

    manager.destroy();
    expect(manager.snapshot()).toHaveLength(0);

    manager.connect("bbb");
    expect(manager.snapshot()).toHaveLength(1);
  });

  test("handleSignal from an unknown sender creates the peer entry", async () => {
    const { manager } = makeManager("zzz");

    await manager.handleSignal("aaa", {
      description: { type: "offer", sdp: "fake" },
    });

    expect(manager.snapshot()).toHaveLength(1);
    expect(manager.snapshot()[0].id).toBe("aaa");
  });

  test("snapshot reports the diagnostic shape", () => {
    const { manager } = makeManager("aaa");
    manager.connect("bbb");
    manager.send("bbb", MSG);

    expect(manager.snapshot()[0]).toEqual({
      id: "bbb",
      transport: "connecting",
      channelState: "connecting",
      connectionState: "new",
      polite: false,
      queuedMessages: 1,
      everOpened: false,
    });
  });
});
