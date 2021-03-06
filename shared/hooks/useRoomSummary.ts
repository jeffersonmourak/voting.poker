import {firebaseApp} from '@root/firebase/clientApp';
import {Room} from '@root/types/Room';
import {Session} from '@root/types/Session';
import {getFirestore, doc} from 'firebase/firestore';
import {isUndefined, last} from 'lodash';
import {useDocument} from 'react-firebase-hooks/firestore';
import {DateTime} from 'luxon';

const lastSession = (sessions: Session[]) => last(sessions);

const getSessionVotes = (sessions: Session[]) => {
    const currentSession = lastSession(sessions);

    if (!currentSession) {
        return [];
    }

    return Object.values(currentSession.votes);
};

const useRoomSummary = (roomId: string) => {
    const documentRef = roomId ? doc(getFirestore(firebaseApp), 'rooms', roomId) : null;

    const [value, loading] = useDocument(documentRef);

    const isLoading = isUndefined(value) || loading;

    const room = value?.data() as Room;
    const sessionVotes = room ? getSessionVotes(room.sessions) : [];
    const session = lastSession(room?.sessions || []);

    const users = room?.users.map((user) => {
        return {
            ...user,
            vote: sessionVotes.find((vote) => vote.userId === user.id),
        };
    });

    const hasModerator = users?.some((user) => user.moderator);

    return {
        users,
        reveal: session?.ended || false,
        hasModerator,
        startedAt: session ? DateTime.fromJSDate(session?.startedAt.toDate()) : null,
        roomExists: value?.exists(),
        loading: isLoading,
    };
};

export default useRoomSummary;
