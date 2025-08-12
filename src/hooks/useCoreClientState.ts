'use client';

import {
  CoreClient,
  CoreClientState,
  REGISTER_USER_ACTION_KEY,
  REMOVE_USER_ACTION_KEY,
  UPDATE_USER_ACTION_KEY,
} from '@voting.poker/core';
import { useEffect, useMemo, useState } from 'react';
import { useAblyBackend } from './useAblyBackend';

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

  const client = useMemo(() => new CoreClient(roomId, user), [roomId]);
  const [state, setState] = useState(client.state);

  client.tapUserEvents = (event) => {
    publish(event);
  };

  const handleSubscription = (clientState: CoreClientState) => {
    setState(clientState);
  };

  useEffect(() => {
    const subscription = client.subscribe(handleSubscription);

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return { state, client, publish } as const;
}
