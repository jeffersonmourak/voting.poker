import {Box, Grid, Modal} from '@mui/material';
import BasePage from '@root/shared/components/BasePage';
import Cards from '@root/shared/components/Cards';
import Identify from '@root/shared/components/Identify';
import ModeratorModal from '@root/shared/components/ModeratorModal';
import Results from '@root/shared/components/Results';
import RoomDetails from '@root/shared/components/RoomDetails';
import SessionVotesSummary from '@root/shared/components/SessionVotesSummary';
import {UserContext} from '@root/shared/components/UserProvider';
import useRoomSummary from '@root/shared/hooks/useRoomSummary';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React, {useContext} from 'react';
import usePresence from '@root/shared/hooks/usePresence';
import Error from './_error';

const Room: NextPage = () => {
    const router = useRouter();
    const {id} = router.query as {id: string};
    usePresence(id);

    const {user} = useContext(UserContext);
    const {users, reveal: ended, hasModerator, loading, roomExists} = useRoomSummary(id);

    if (!loading && !roomExists) {
        return <Error statusCode={404} />;
    }

    if (!user?.name) {
        return <Identify loading={loading} roomId={id} />;
    }

    return (
        <BasePage>
            <Modal open={!hasModerator}>
                <ModeratorModal roomId={id} />
            </Modal>
            <Box px={4}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <SessionVotesSummary roomId={id} />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item md={3} xs={12}>
                        <RoomDetails ended={ended} roomId={id} />
                    </Grid>
                    <Grid item md={8} xs={12}>
                        {!ended && <Cards roomId={id} />}
                        {ended && <Results roomId={id} users={users} />}
                    </Grid>
                    <Grid item md={1} />
                </Grid>
            </Box>
        </BasePage>
    );
};

export default Room;
