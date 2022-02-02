import {realtimeDB} from '@root/firebase/clientApp';
import {ref, onDisconnect, set} from 'firebase/database';

const usePresence = (roomId: string, userId?: string) => {
    if (userId) {
        const presenceRef = ref(realtimeDB, `rooms/${roomId}/users/${userId}/online`);
        set(presenceRef, true);
        onDisconnect(presenceRef).remove();
    }
};

export default usePresence;
