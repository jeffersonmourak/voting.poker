import {useContext} from 'react';

import {remove} from '@root/helpers/request';
import {UserContext} from '../components/UserProvider';

const useRemoveRoomUser = () => {
    const {removeUser: deleteUser} = useContext(UserContext);

    const removeUser = async (userId: string, roomId: string) => {
        try {
            await remove(`/api/rooms/${roomId}/users/${userId}`);
            deleteUser();
        } catch (error) {
            console.error(error);
        }
    };

    return {
        removeUser,
    };
};

export default useRemoveRoomUser;
