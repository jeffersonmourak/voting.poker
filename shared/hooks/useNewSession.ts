import {useState} from 'react';

import {post} from '../../helpers/request';

const useNewSession = (roomId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const newSession = async () => {
        setLoading(true);

        try {
            await post(`/api/rooms/${roomId}/session`, {});
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        newSession,
    };
};

export default useNewSession;
