import {Button, Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import ArrowIcon from '@root/shared/components/ArrowIcon';
import BasePage from '@root/shared/components/BasePage';
import useAddRoom from '@root/shared/hooks/useAddRoom';
import {NextPage} from 'next';
import {useRouter} from 'next/router';

const useStyle = makeStyles((theme: Theme) => ({
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    hero: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(8, 0, 6),
        gap: theme.spacing(4),
    },
    action: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
}));

const Home: NextPage = () => {
    const classes = useStyle();
    const router = useRouter();
    const {room, addRoom} = useAddRoom();

    if (room) {
        router.push(`/${room.id}`);
    }

    return (
        <BasePage>
            <Box className={classes.content}>
                <Box className={classes.hero}>
                    <Typography variant="h1">Voting Poker</Typography>
                    <Typography variant="subtitle1">Agile Planning Tool for cool teams</Typography>
                </Box>
                <Box className={classes.action}>
                    <Button onClick={() => addRoom()}>
                        <Box className={classes.button}>
                            Create a room
                            <ArrowIcon />
                        </Box>
                    </Button>
                </Box>
            </Box>
        </BasePage>
    );
};

export default Home;
