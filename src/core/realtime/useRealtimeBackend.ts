import { ablyKey } from "@/app/constants";
import type { User } from "@/core/CoreClient";
import {
  type REGISTER_USER_ACTION_KEY_Type,
  type REMOVE_USER_ACTION_KEY_Type,
  type UPDATE_USER_ACTION_KEY_Type,
  REGISTER_USER_ACTION_KEY,
  UPDATE_USER_ACTION_KEY,
  REMOVE_USER_ACTION_KEY,
} from "@/core/machine/actions";
import { type Events, VotingEvents } from "@/core/machine/events";
import { capture } from "@/features/analytics/analytics";
import {
  BaseRealtime,
  FetchRequest,
  RealtimePresence,
  WebSocketTransport,
} from "ably/modular";
import { useCallback, useEffect, useMemo } from "react";
import sillyname from "sillyname";
import { v4 as uuidV4 } from "uuid";
import { PeerManager, type PeerMessage } from "./PeerManager";

const DefaultUser: User = {
  id: uuidV4(),
  name: sillyname(),
  avatar: "",
  emoji: "🙈",
  moderator: false,
  vote: null,
};

const ablyClient = new BaseRealtime({
  key: ablyKey,
  clientId: DefaultUser.id,
  // We apply our own events optimistically (CoreClient#publishEvent) and register
  // the local user explicitly, so we never need our own publishes echoed back.
  // Dropping the echo removes one self-copy from every signal/vote/presence we send.
  echoMessages: false,
  plugins: {
    WebSocketTransport,
    RealtimePresence,
    FetchRequest,
  },
});

type PresenceAction =
  | REGISTER_USER_ACTION_KEY_Type
  | REMOVE_USER_ACTION_KEY_Type
  | UPDATE_USER_ACTION_KEY_Type;

type PresenceFn = (user: User, action: PresenceAction) => void;

type PoolEventFn = (event: Events) => void;

// Pool events arrive over two transports — peer data channels (primary) and
// Ably pub/sub (relay fallback + legacy clients) — but both carry the same
// named messages, so they share this single decoder.
function toPoolEvent(
  name: string,
  clientId: string,
  data: PeerMessage["data"]
): Events | null {
  switch (name) {
    case "START_SESSION":
      return { type: VotingEvents.StartPool, createdBy: clientId };
    case "END_SESSION":
      return { type: VotingEvents.EndPool, createdBy: clientId };
    case "VOTE":
      return { type: VotingEvents.Vote, createdBy: clientId, vote: data.vote };
    case "MODERATOR_SYNC":
      if (data.target !== DefaultUser.id) {
        return null;
      }
      return {
        type: VotingEvents.ModeratorSync,
        createdBy: clientId,
        state: data.state,
        votes: data.votes,
        target: data.target,
      };
    default:
      return null;
  }
}

export function useRealtimeBackend(
  roomId: string,
  presenceCallback: PresenceFn,
  poolEventCallback: PoolEventFn
) {
  const channel = useMemo(
    () =>
      ablyClient.channels.get(roomId, {
        modes: ["PUBLISH", "SUBSCRIBE", "PRESENCE", "PRESENCE_SUBSCRIBE"],
      }),
    [roomId]
  );

  const peers = useMemo(
    () =>
      new PeerManager(DefaultUser.id, {
        onSignal: (target, payload) => {
          channel.publish("RTC_SIGNAL", { target, payload });
        },
        onMessage: (from, message) => {
          const event = toPoolEvent(message.name, from, message.data);

          if (event) {
            poolEventCallback(event);
          }
        },
        onRelay: (_peerId, undelivered, info) => {
          for (const message of undelivered) {
            channel.publish(message.name, message.data);
          }

          capture("p2p_relay_fallback", {
            room_id: roomId,
            reason: info.reason,
            time_since_connect_ms: info.timeSinceConnectMs,
            peer_count: info.peerCount,
            undelivered_count: undelivered.length,
          });
        },
        onChannelOpen: (_peerId, info) => {
          capture("p2p_channel_opened", {
            room_id: roomId,
            time_to_open_ms: info.timeToOpenMs,
            reconnect: info.reconnect,
            peer_count: info.peerCount,
            candidate_type: info.candidateType,
          });
        },
      }),
    [channel]
  );

  // Runs once: the channel is created per-room and its subscriptions are wired
  // up a single time, then torn down on unmount. Subscribing in the render body
  // leaked a fresh presence listener on every render; adding channel/callbacks
  // as deps would re-subscribe on every change, so exhaustive-deps is disabled
  // for this file in .oxlintrc.json.
  useEffect(() => {
    channel.presence.subscribe(
      ["enter", "leave", "present", "update"],
      (presence) => {
        const id = presence.clientId;
        const userData = presence.data;
        const user: User = { ...userData, id };

        const actionKeys: Record<string, PresenceAction> = {
          present: REGISTER_USER_ACTION_KEY,
          enter: REGISTER_USER_ACTION_KEY,
          update: UPDATE_USER_ACTION_KEY,
          leave: REMOVE_USER_ACTION_KEY,
        };

        if (!actionKeys[presence.action]) {
          return;
        }

        // Presence doubles as peer discovery: dial (or tear down) the WebRTC
        // connection before the roster callback runs, so a ModeratorSync fired
        // by CoreClient.register finds the peer entry and queues on it.
        if (id !== DefaultUser.id) {
          if (presence.action === "leave") {
            peers.disconnect(id);
          } else {
            peers.connect(id);
          }
        }

        presenceCallback(user, actionKeys[presence.action]);
      }
    );

    channel.subscribe((message) => {
      const { data, name, clientId } = message;

      if (!clientId || !name) {
        return;
      }

      if (name === "RTC_SIGNAL") {
        if (clientId !== DefaultUser.id && data.target === DefaultUser.id) {
          void peers.handleSignal(clientId, data.payload);
        }
        return;
      }

      // Ably pool messages are the relay fallback. While the sender's data
      // channel is open its events arrive there instead; drop the Ably copy so
      // the two transports cannot interleave the same sender's events.
      if (clientId !== DefaultUser.id && peers.isOpen(clientId)) {
        return;
      }

      const event = toPoolEvent(name, clientId, data);

      if (event) {
        poolEventCallback(event);
      }
    });

    const { id: _, ...presenceUser } = DefaultUser;

    channel.presence.enter(presenceUser);

    // Register the local user up front rather than waiting to receive our own
    // presence "enter" back: echoMessages is off, and self-registration must not
    // depend on an echo. The machine's register is idempotent, so if the echo
    // does arrive the second register is a no-op.
    presenceCallback(DefaultUser, REGISTER_USER_ACTION_KEY);

    return () => {
      peers.destroy();
      channel.presence.unsubscribe();
      channel.presence.leave();
      channel.unsubscribe();
    };
  }, []);

  const publish = (state: Events) => {
    switch (state.type) {
      case VotingEvents.RegisterUser:
        channel.presence.update(DefaultUser);
        break;
      case VotingEvents.UpdateUser:
        channel.presence.update({
          ...DefaultUser,
          ...state.payload,
        });
        break;
      case VotingEvents.RemoveUser:
        channel.presence.leave();
        break;
      case VotingEvents.StartPool: {
        const message = {
          name: "START_SESSION",
          data: { ...state, id: roomId },
        };

        if (peers.broadcast(message)) {
          channel.publish(message.name, message.data);
        }
        break;
      }
      case VotingEvents.EndPool: {
        const message = { name: "END_SESSION", data: { ...state, id: roomId } };

        if (peers.broadcast(message)) {
          channel.publish(message.name, message.data);
        }
        break;
      }
      case VotingEvents.Vote: {
        const message = {
          name: "VOTE",
          data: { userId: DefaultUser.id, ...state },
        };

        if (peers.broadcast(message)) {
          channel.publish(message.name, message.data);
        }
        break;
      }
      case VotingEvents.ModeratorSync: {
        // Targeted at one newcomer: goes straight down that peer's channel
        // (queued until it opens), with Ably as the fallback.
        if (
          !peers.send(state.target, { name: "MODERATOR_SYNC", data: state })
        ) {
          channel.publish("MODERATOR_SYNC", state);
        }
        break;
      }
      default:
        break;
    }
  };

  const connections = useCallback(() => peers.snapshot(), [peers]);

  return {
    user: DefaultUser,
    publish,
    connections,
  };
}
