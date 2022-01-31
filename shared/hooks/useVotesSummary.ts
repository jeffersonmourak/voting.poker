import {firebaseApp} from '@root/firebase/clientApp';
import {Room} from '@root/types/Room';
import {Session} from '@root/types/Session';
import {getFirestore, doc} from 'firebase/firestore';
import {last} from 'lodash';
import {useDocument} from 'react-firebase-hooks/firestore';

const lastSession = (sessions: Session[]) => last(sessions);

const getSessionVotes = (sessions: Session[]) => {
    const currentSession = lastSession(sessions);

    if (!currentSession) {
        return [];
    }

    return Object.values(currentSession.votes);
};

const useVotesSummary = (roomId: string) => {
    const documentRef = roomId ? doc(getFirestore(firebaseApp), 'rooms', roomId) : null;

    const [value] = useDocument(documentRef);

    const room = value?.data() as Room;
    const sessionVotes = room ? getSessionVotes(room.sessions) : [];
    const session = lastSession(room?.sessions || []);

    const users = room?.users.map((user) => {
        return {
            ...user,
            vote: sessionVotes.find((vote) => vote.userId === user.id),
        };
    });

    return {users, reveal: session?.ended || false};
};

export default useVotesSummary;