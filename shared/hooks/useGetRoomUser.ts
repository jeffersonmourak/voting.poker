import {Room} from '@root/types/Room';
import {User} from '@root/types/User';
import {useContext, useState} from 'react';

import {get} from '../../helpers/request';
import {UserContext} from '../components/UserProvider';

const useGetRoomUser = (roomId: string) => {
    const {setUser} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Room | null>(null);
    const [error, setError] = useState<any>(null);

    const getUser = async (userId: string) => {
        setLoading(true);

        try {
            const userData = await get(`/api/rooms/${roomId}/users/${userId}`);
            setUser(userData, roomId);
            setData(userData);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        user: data,
        error,
        getUser,
    };
};

export default useGetRoomUser;
