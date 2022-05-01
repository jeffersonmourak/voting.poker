import {Room} from '@root/types/Room';
import {useState} from 'react';

import {post} from '../../helpers/request';

const useAddRoom = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Room | null>(null);
    const [error, setError] = useState<any>(null);

    const addRoom = async () => {
        setLoading(true);

        try {
            const roomData = await post('/api/rooms', {});
            setData(roomData);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setData(null);
        setError(null);
    };

    return {
        loading,
        room: data,
        error,
        addRoom,
        reset: handleReset,
    };
};

export default useAddRoom;
