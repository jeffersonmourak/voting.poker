import {cx} from '@emotion/css';
import {Button, CircularProgress, TextField, Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import ArrowIcon from '@root/shared/components/ArrowIcon';
import BasePage from '@root/shared/components/BasePage';
import useAddRoom from '@root/shared/hooks/useAddRoom';
import useRoomSummary from '@root/shared/hooks/useRoomSummary';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';

const useStyle = makeStyles((theme: Theme) => ({
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 32px)',

        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
        },
    },
    hero: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(8),
        gap: theme.spacing(4),
        flex: 1,
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
        },
    },
    action: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
    heroText: {
        fontFamily: ['"Source Code Pro"', 'monospace'].join(', '),
        fontWeight: 900,
        WebkitBackgroundClip: 'text',
        MozBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        MozTextFillColor: 'transparent',
    },
    text1: {
        backgroundColor: '#FBAB7E',
        backgroundImage: 'linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)',
    },
    text2: {
        backgroundColor: '#85FFBD',
        backgroundImage: 'linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)',
    },
    text3: {
        backgroundColor: '#8BC6EC',
        backgroundImage: 'linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)',
    },
}));

const Home: NextPage = () => {
    const classes = useStyle();
    const router = useRouter();
    const [roomId, setRoomId] = useState('');
    const [loading, setLoading] = useState(false);
    const {room, addRoom, error} = useAddRoom();

    const {loading: loadingRoomData, roomExists} = useRoomSummary(room?.id || '');

    useEffect(() => {
        if (room?.id && !loadingRoomData && roomExists) {
            router.push(`/${room.id}`);
        }
    }, [roomExists, loadingRoomData, room]);

    useEffect(() => {
        if (error) {
            setLoading(false);
        }
    }, [error]);

    const handleJoinRoom = () => {
        router.push(`/${roomId}`);
    };

    const handleCrateRoom = () => {
        setLoading(true);
        addRoom();
    };

    return (
        <BasePage>
            <Box className={classes.content}>
                <Box className={classes.hero}>
                    <Typography variant="h1" className={cx(classes.heroText, classes.text1)}>
                        Read
                    </Typography>
                    <Typography variant="h1" className={cx(classes.heroText, classes.text2)}>
                        Discuss
                    </Typography>
                    <Typography variant="h1" className={cx(classes.heroText, classes.text3)}>
                        Vote
                    </Typography>
                    <Typography variant="subtitle1">Agile Planning Tool for cool teams</Typography>
                    <Box>
                        <Typography variant="subtitle1">I am open source btw,</Typography>
                        <a href="https://github.com/jeffersonmourak/voting.poker" target="_blank">
                            check it out and give a ⭐️
                        </a>
                    </Box>
                </Box>
                <Box className={classes.action}>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={loading}
                        onClick={handleCrateRoom}>
                        <Box className={classes.button}>
                            {loading ? (
                                <>
                                    Creating...
                                    <CircularProgress size={20} variant="indeterminate" />
                                </>
                            ) : (
                                <>
                                    Create a room
                                    <ArrowIcon color="#000" />
                                </>
                            )}
                        </Box>
                    </Button>
                    <Typography variant="button">Or</Typography>
                    <Box>
                        <TextField
                            color="primary"
                            label="Room code"
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                        <Button variant="contained" type="submit" onClick={handleJoinRoom}>
                            <Box className={classes.button}>
                                Join
                                <ArrowIcon />
                            </Box>
                        </Button>
                    </Box>
                </Box>
            </Box>
        </BasePage>
    );
};

export default Home;
