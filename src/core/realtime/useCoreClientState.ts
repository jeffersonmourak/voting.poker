import { useCallback, useEffect, useState } from "react";
import { attachNerdPoking } from "./nerdPoking";
import { useRealtimeBackend } from "./useRealtimeBackend";
import {
  CoreClient,
  type CoreClientState,
  type User,
} from "@/core/CoreClient";
import type { Events } from "@/core/machine/events";
import {
  REGISTER_USER_ACTION_KEY,
  UPDATE_USER_ACTION_KEY,
  REMOVE_USER_ACTION_KEY,
  type REGISTER_USER_ACTION_KEY_Type,
  type REMOVE_USER_ACTION_KEY_Type,
  type UPDATE_USER_ACTION_KEY_Type,
} from "@/core/machine/actions";

export function useCoreClientState(roomId: string) {
  const { publish, user, connections } = useRealtimeBackend(
    roomId,
    handlePresence,
    handlePoolEvent
  );

  // One CoreClient per mount: `user` is the module-stable DefaultUser and the
  // room id is fixed by the URL, so the client never needs recreating. It is
  // created (and its network tap bound) during the first render because the
  // transport's mount effect registers the local user before any effect here
  // could run; `publish` closes only over per-room memoized values, so the
  // first render's instance never goes stale.
  const [client] = useState(() => {
    const coreClient = new CoreClient(roomId, user);
    coreClient.tapUserEvents = (event) => {
      publish(event);
    };
    return coreClient;
  });

  const [state, setState] = useState(client.state);

  const handleSubscription = useCallback((clientState: CoreClientState) => {
    setState(clientState);
  }, []);

  useEffect(() => {
    const subscription = client.subscribe(handleSubscription);
    const detachNerdPoking = attachNerdPoking(client, user.id, connections);

    return () => {
      detachNerdPoking();
      subscription.unsubscribe();
    };
  }, [client, handleSubscription, connections, user.id]);

  function handlePresence(
    presenceUser: User,
    action:
      | REGISTER_USER_ACTION_KEY_Type
      | UPDATE_USER_ACTION_KEY_Type
      | REMOVE_USER_ACTION_KEY_Type
  ) {
    switch (action) {
      case REGISTER_USER_ACTION_KEY:
        client.register(presenceUser);
        break;
      case UPDATE_USER_ACTION_KEY:
        client.update(presenceUser);
        break;
      case REMOVE_USER_ACTION_KEY:
        client.remove(presenceUser);
        break;
    }
  }

  function handlePoolEvent(event: Events) {
    client.backendCallback(event);
  }

  return { state, client, publish } as const;
}
