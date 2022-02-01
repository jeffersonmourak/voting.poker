import {cx} from '@emotion/css';
import {Button, TextField, Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import ArrowIcon from '@root/shared/components/ArrowIcon';
import BasePage from '@root/shared/components/BasePage';
import useAddRoom from '@root/shared/hooks/useAddRoom';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import {useState} from 'react';

const useStyle = makeStyles((theme: Theme) => ({
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 32px)',
    },
    hero: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(8),
        gap: theme.spacing(4),
        flex: 1,
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
    const {room, addRoom} = useAddRoom();

    if (room) {
        router.push(`/${room.id}`);
    }

    const handleJoinRoom = () => {
        router.push(`/${roomId}`);
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
                </Box>
                <Box className={classes.action}>
                    <Button variant="contained" color="secondary" onClick={() => addRoom()}>
                        <Box className={classes.button}>
                            Create a room
                            <ArrowIcon color="#000" />
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
