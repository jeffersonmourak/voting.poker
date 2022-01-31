import {Room} from '@root/types/Room';
import {User} from '@root/types/User';
import {useContext, useState} from 'react';

import {post} from '../../helpers/request';
import {UserContext} from '../components/UserProvider';

const useVote = (roomId: string) => {
    const {user} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<string | null>(null);
    const [error, setError] = useState<any>(null);

    const vote = async (value: string) => {
        setLoading(true);

        try {
            await post(`/api/rooms/${roomId}/vote`, {
                userId: user?.id,
                value,
            });
            setData(value);
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
        vote,
    };
};

export default useVote;
