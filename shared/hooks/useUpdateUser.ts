import {Room} from '@root/types/Room';
import {User} from '@root/types/User';
import {useContext, useState} from 'react';

import {put} from '../../helpers/request';
import {UserContext} from '../components/UserProvider';

const useUpdateUser = (roomId: string) => {
    const {setUser} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Room | null>(null);
    const [error, setError] = useState<any>(null);

    const updateUser = async (user: Partial<User>) => {
        setLoading(true);

        try {
            const userData = await put(`/api/rooms/${roomId}/users/${user.id}`, user);
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
        updateUser,
    };
};

export default useUpdateUser;
