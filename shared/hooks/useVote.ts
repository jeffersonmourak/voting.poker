import { useChannel } from '@ably-labs/react-hooks';

const useVote = (roomId: string, userId: string) => {
    const [channel] = useChannel(roomId, () => {});

    const vote = async (value: string) => {
        channel.publish('VOTE', { userId, value, timestamp: Date.now() });
    };

    return {
        vote,
    };
};

export default useVote;
