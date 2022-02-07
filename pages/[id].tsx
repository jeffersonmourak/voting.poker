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

const Room: NextPage = () => {
    const router = useRouter();
    const {user} = useContext(UserContext);

    const {id} = router.query as {id: string};
    const {users, reveal: ended, hasModerator, loading} = useRoomSummary(id);
    usePresence(id, user?.id);

    if (!user) {
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
