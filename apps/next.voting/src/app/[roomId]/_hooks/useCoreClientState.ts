'use client';

import CoreClient, {
  CoreClientState,
  REGISTER_USER_ACTION_KEY,
  REMOVE_USER_ACTION_KEY,
  UPDATE_USER_ACTION_KEY,
} from 'core';
import { useEffect, useMemo, useState } from 'react';
import { useAblyBackend } from './useAblyBackend';

export function useCoreClientState(roomId: string) {
  const {publish, user} = useAblyBackend(
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
    (event, clientId, vote) => client.backendCallback(event, clientId, vote)
  );

  const client = useMemo(() => new CoreClient(roomId), [roomId]);
  const [state, setState] = useState(client.state);

  client.tapUserEvents = (events) => publish(events);

  const handleSubscription = (clientState: CoreClientState) => {
    setState(clientState);
  };

  useEffect(() => {
    const subscription = client.subscribeAs(user, handleSubscription);

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return [state, client] as const;
}
