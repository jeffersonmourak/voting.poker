import {realtimeDB} from '@root/firebase/clientApp';
import {ref, onDisconnect, set, remove} from 'firebase/database';
import {useContext, useEffect} from 'react';
import {UserContext} from '../components/UserProvider';

const usePresence = (roomId: string) => {
    const {user, removeUser} = useContext(UserContext);

    const userId = user?.id;

    if (userId) {
        const presenceRef = ref(realtimeDB, `rooms/${roomId}/users/${userId}/online`);
        set(presenceRef, true);
        onDisconnect(presenceRef).remove();
    }

    useEffect(() => {
        return () => {
            if (userId) {
                const presenceRef = ref(realtimeDB, `rooms/${roomId}/users/${userId}/online`);
                remove(presenceRef);
                removeUser();
            }
        };
    }, [userId]);
};

export default usePresence;
