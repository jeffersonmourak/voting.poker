import BasePage from '@root/shared/components/BasePage';
import Cards from '@root/shared/components/Cards';
import {UserContext} from '@root/shared/components/UserProvider';
import useRemoveRoomUser from '@root/shared/hooks/useRemoveRoomUser';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React, {useContext, useEffect} from 'react';

const Room: NextPage = () => {
    const router = useRouter();
    const {user} = useContext(UserContext);

    const {id} = router.query as {id: string};
    const {removeUser} = useRemoveRoomUser();

    const handleRemoveUser = () => {
        if (user) {
            removeUser(user.id, id);
        }
    };

    useEffect(() => {
        if (!user) {
            router.push(`/identify?roomId=${id}`);
        }

        window.onbeforeunload = handleRemoveUser;
        return handleRemoveUser;
    }, [id, user]);

    return (
        <BasePage>
            <h1>Room {id}</h1>
            <Cards roomId={id} />
        </BasePage>
    );
};

export default Room;
