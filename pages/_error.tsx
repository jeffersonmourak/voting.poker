import {Button, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {Box} from '@mui/system';
import {Theme} from '@mui/system/createTheme';
import {NextPageContext} from 'next';
import {useRouter} from 'next/router';

const useStyle = makeStyles((theme: Theme) => ({
    content: {
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
        flexDirection: 'column',
        gap: theme.spacing(4),
    },
}));

interface ErrorProps {
    statusCode?: number;
}

const errorMessage = (statusCode?: number) => {
    switch (statusCode) {
        case 404:
            return 'This room could not be found.';
        case 500:
            return 'Internal server error.';
        default:
            return 'An unexpected error has occurred.';
    }
};

const Error = ({statusCode}: ErrorProps) => {
    const classes = useStyle();
    const router = useRouter();

    return (
        <Box className={classes.content}>
            <Box className={classes.hero}>
                <Typography variant="h1">Oops... 🤕</Typography>
            </Box>
            <Box className={classes.action}>
                <Typography variant="h4">{errorMessage(statusCode)}</Typography>
                <Button variant="contained" color="secondary">
                    <Typography variant="button" onClick={() => router.push('/')}>
                        Go back
                    </Typography>
                </Button>
            </Box>
        </Box>
    );
};

Error.getInitialProps = ({res, err}: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return {statusCode};
};

export default Error;
