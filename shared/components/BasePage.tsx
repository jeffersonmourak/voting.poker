import {ReactNode} from 'react';
import {Grid, Theme} from '@mui/material';
import {makeStyles} from '@mui/styles';
interface BasePageProps {
    children: ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: '100%',
        height: '100vh',
        flexWrap: 'nowrap',
    },
    content: {
        flex: 1,
    },
    footer: {
        height: theme.spacing(4),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

const BasePage = ({children}: BasePageProps) => {
    const classes = useStyles();
    return (
        <Grid className={classes.root} container direction="column">
            <Grid className={classes.content} item>
                {children}
            </Grid>
            <Grid item className={classes.footer}>
                Made with ❤️ by{' '}
                <a href="https://www.instrument.com/" target="_blank">
                    Instrument
                </a>{' '}
                team
            </Grid>
        </Grid>
    );
};

export default BasePage;
