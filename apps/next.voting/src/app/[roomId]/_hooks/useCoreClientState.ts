import CoreClient from 'core';
import { useEffect, useRef, useState } from 'react';

export function useCoreClientState(roomId: string) {
  const client = useRef(new CoreClient(roomId));
  const [state, setState] = useState(client.current.state);

  useEffect(() => {
    const subscription = client.current.subscribeAs(
      {
        name: 'jefferson',
        avatar: 'hello',
        emoji: '🙈',
        moderator: true,
        vote: null,
      },
      setState
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return [state, client.current] as const;
}
