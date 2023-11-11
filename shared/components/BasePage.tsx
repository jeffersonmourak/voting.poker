import { keyframes } from '@emotion/css';
import { Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode } from 'react';
interface BasePageProps {
  children: ReactNode;
}

const bounce = keyframes`
  from, 20%, 53%, 80%, to {
    transform: scale(1);
  }

  40%, 43% {
    transform: scale(1.1);
  }

  70% {
    transform: scale(1.04);
  }

  90% {
    transform: scale(1.1);
  }
`;

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
  link: {
    color: theme.palette.secondary.main,
  },
  heart: {
    color: 'red',
    animation: `${bounce} 1s ease infinite`,
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
        Made with&nbsp;<span className={classes.heart}>♥︎</span>&nbsp;by&nbsp;
        <a className={classes.link} href="https://github.com/jeffersonmourak" target="_blank">
          jeffersonmourak
        </a>
      </Grid>
    </Grid>
  );
};

export default BasePage;
