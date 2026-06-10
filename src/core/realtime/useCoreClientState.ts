import { useCallback, useEffect, useMemo, useState } from "react";
import { attachNerdPoking } from "./nerdPoking";
import { useRealtimeBackend } from "./useRealtimeBackend";
import { CoreClient, type CoreClientState } from "@/core/CoreClient";
import {
  REGISTER_USER_ACTION_KEY,
  UPDATE_USER_ACTION_KEY,
  REMOVE_USER_ACTION_KEY,
} from "@/core/machine/actions";

export function useCoreClientState(roomId: string) {
  const { publish, user, connections } = useRealtimeBackend(
    roomId,
    (user, action) => {
      switch (action) {
        case REGISTER_USER_ACTION_KEY:
          client.register(user);
          break;
        case UPDATE_USER_ACTION_KEY:
          client.update(user);
          break;
        case REMOVE_USER_ACTION_KEY:
          client.remove(user);
          break;
      }
    },
    (e) => client.backendCallback(e)
  );

  const client = useMemo(() => new CoreClient(roomId, user), [roomId, user]);
  const [state, setState] = useState(client.state);

  client.tapUserEvents = (event) => {
    publish(event);
  };

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

  return { state, client, publish } as const;
}
