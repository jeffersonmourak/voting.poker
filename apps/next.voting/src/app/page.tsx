'use client'

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

import CoreClient, { VotingStates } from 'core';

function useCoreClientState() {
  const client = useRef(new CoreClient(
    'room_id',
  ))

  const [state, setState] = useState(client.current.state);

  useEffect(() => {
    const subscription = client.current.subscribe(setState);

    return () => {
      subscription.unsubscribe();
    }

  }, [client]);

  return [state, client.current] as const;
}

export default function Home() {
  const [state, client] = useCoreClientState();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Welcome to Next.js!</h1>
      <button onClick={() => {
        if (client.state.state === VotingStates.Idle && client.state.moderator) {
          client.state.startSession();
        }
      }} >start</button>
    </main>
  );
}
