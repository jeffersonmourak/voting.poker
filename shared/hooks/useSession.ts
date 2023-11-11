import { useChannel } from '@ably-labs/react-hooks';
import { User } from '@root/types/User';
import { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

type Session = {
  id: string;
  timestamp: Date;
  revealed: boolean;
};

export const useSession = (roomId: string) => {
  const [sessionData, setSession] = useState<Session | null>(null);
  const [votes, setVotes] = useState<Record<string, User & {vote: string}>>({});

  const [channel] = useChannel(roomId, ({name, data, timestamp}) => {
    switch (name) {
      case 'START_SESSION':
        setSession({
          id: data.id,
          timestamp: new Date(timestamp),
          revealed: false,
        });
        setVotes({});
        return;
      case 'END_SESSION':
        setSession({
          id: data.id,
          timestamp: new Date(timestamp),
          revealed: true,
        });
        return;
      case 'VOTE': {
        setVotes((prevVotes) => ({
          ...prevVotes,
          [data.userId]: data,
        }));
        return;
      }
      default:
        return;
    }
  });

  const startSession = () => {
    const sessionId = uuidV4();

    channel.publish('START_SESSION', {
      id: sessionId,
    });
    setVotes({});
  };

  const endSession = () => {
    if (!sessionData) {
      return;
    }
    channel.publish('END_SESSION', {
      id: sessionData.id,
    });
  };

  const vote = (userId: string, vote: string) => {
    channel.publish('VOTE', {
      userId,
      vote,
    });
  };

  return {
    sessionId: sessionData?.id ?? null,
    session: sessionData,
    startSession,
    endSession,
    vote,
    votes,
  };
};
