import { useCallback, useEffect, useMemo, useState } from "react";
import { useAblyBackend } from "./useAblyBackend";
import { CoreClient, type CoreClientState } from "@/lib/core";
import {
  REGISTER_USER_ACTION_KEY,
  UPDATE_USER_ACTION_KEY,
  REMOVE_USER_ACTION_KEY,
} from "@/lib/machines/voting/actions";

export function useCoreClientState(roomId: string) {
  const { publish, user } = useAblyBackend(
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

    return () => {
      subscription.unsubscribe();
    };
  }, [client, handleSubscription]);

  return { state, client, publish } as const;
}
