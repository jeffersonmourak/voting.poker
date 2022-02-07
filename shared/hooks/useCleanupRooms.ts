import {get} from '../../helpers/request';

const useCleanupRooms = () => {
    const clean = async () => {
        try {
            await get(`/api/cleanup`);
        } catch (_e) {
            console.log(_e);
        }
    };
    

    return {
        clean,
    };
};

export default useCleanupRooms;
