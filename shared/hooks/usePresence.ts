import {realtimeDB} from '@root/firebase/clientApp';
import {ref, onDisconnect, set, remove} from 'firebase/database';
import {useContext, useEffect} from 'react';
import {AblyProviderContext} from '../components/AblyProvider';

const usePresence = (roomId: string) => {
    const {user, removeUser} = useContext(AblyProviderContext);

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
