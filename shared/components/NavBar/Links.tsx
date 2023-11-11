import {Box} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Theme} from '@mui/system';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import {useVisibleSection} from './hooks/useVisibleSection';
import {cx} from '@emotion/css';

const useStyle = makeStyles((theme: Theme) => {
  console.log(theme);
  return {
    root: {
      display: 'flex',
      gap: 48,
      height: 40,
    },

    link: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      color: theme.palette.common.white,
      textAlign: 'center',
      fontSize: 14,
      fontStyle: 'normal',
      lineHeight: '100%',
      opacity: 0.5,
      textDecoration: 'none',
      transition: 'opacity 0.2s ease-in-out',
      gap: theme.spacing(1),

      [`&::before`]: {
        position: 'absolute',
        bottom: 0,
        content: '""',
        width: '0%',
        transition: 'width 0.2s ease-in-out',
        height: 2,
        borderRadius: 1,
        backgroundColor: 'currentColor',
        display: 'block',
        marginRight: theme.spacing(1),
      },

      [`& svg`]: {
        fontSize: '1rem',
        transition: 'all 0.2s ease-in-out',
        opacity: 0,
        transform: 'translateY(8px)',
      },

      '&:hover': {
        opacity: 1,

        [`&::before`]: {
          width: '100%',
        },

        [`& svg`]: {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
    },
    dark: {
      color: theme.palette.common.black,
    },
  };
});

export const Links = () => {
  const classes = useStyle();
  const {visibleSection} = useVisibleSection(64);
  const isDark = visibleSection > 0;
  return (
    <Box className={classes.root}>
      <a className={cx(classes.link, {[classes.dark]: isDark})} href="#pricing">
        Pricing
      </a>
      <a
        className={cx(classes.link, {[classes.dark]: isDark})}
        target="_blank"
        href="https://github.com/jeffersonmourak/voting.poker">
        Github <OpenInNewRoundedIcon />
      </a>
    </Box>
  );
};
