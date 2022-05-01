import {Room} from '@root/types/Room';
import {User} from '@root/types/User';
import {useContext, useState} from 'react';

import {post} from '../../helpers/request';
import {UserContext} from '../components/UserProvider';

const useAddUserToRoom = (roomId: string) => {
    const {nextUserId, setUser} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Room | null>(null);
    const [error, setError] = useState<any>(null);

    const addUser = async (user: Partial<User>) => {
        setLoading(true);

        try {
            const userData = await post(`/api/rooms/${roomId}/users`, {...user, id: nextUserId});
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
        addUser,
    };
};

export default useAddUserToRoom;
