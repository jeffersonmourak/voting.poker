import {Room} from '@root/types/Room';
import { v4 as uuidV4 } from 'uuid';
import { useRef, useState} from 'react';

const generateNewRoomData = (): Room => {
    const roomId = uuidV4();

    return {
        id: roomId,
        name: '',
        users: [],
        sessions: [],
        createdAt: new Date(),
    };
}

const useAddRoom = () => {
    const roomData = useRef<Room>(generateNewRoomData()).current;
    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const addRoom = async () => {
        setLoading(true);
        setRoom(roomData)
    };

    const handleReset = () => {
        setError(null);
    };

    return {
        loading,
        room,
        error,
        addRoom,
        reset: handleReset,
    };
};

export default useAddRoom;
