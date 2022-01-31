import {useState} from 'react';

import {post} from '../../helpers/request';

const useEndSession = (roomId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const endSession = async () => {
        setLoading(true);

        try {
            await post(`/api/rooms/${roomId}/endSession`, {});
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        endSession,
    };
};

export default useEndSession;
