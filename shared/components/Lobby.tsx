import { cx } from '@emotion/css';
import { Box, Theme, Typography, darken } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import WaitingRoomGraphic from '@root/public/graphics/brazuca_catching_up.png';
import ModeratorWarningGraphic from '@root/public/graphics/brazuca_sitting_on_wheelchair.png';
import Image from 'next/image';

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(6),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(2),
    flex: 1,
    padding: theme.spacing(4),
  },
  card: {
    display: 'flex',
  },
  heroText: {
    fontFamily: ['Mont', 'sans-serif'].join(', '),
    ...theme.typography.h2,
    fontWeight: 700,
    textAlign: 'center',
    color: theme.palette.text.primary,
    letterSpacing: -2,
    wordSpacing: 2,

    [theme.breakpoints.down('sm')]: {
      ...theme.typography.h4,
    },
  },
  text1: {
    backgroundColor: '#FBAB7E',
    backgroundImage: 'linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%)',
  },
  waitingBlock: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  waitingGraphicBlock: {
    position: 'relative',
    width: 600,
    height: 250,
  },
  waitingGraphic: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
  },
  moderatorWarningBlock: {
    backgroundColor: darken(theme.palette.background.paper, 0.4),
    borderRadius: theme.spacing(2),
    padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
    display: 'flex',
    gap: theme.spacing(3),
  },
  moderatorWarningGraphicBlock: {
    position: 'relative',
    width: 80,
    transform: 'scale(0.7)',
  },
  moderatorWarningGraphic: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moderatorNote: {
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    backgroundColor: '#646876',
    borderRadius: theme.spacing(1),
  },
}));

interface LobbyProps {
  moderator?: boolean;
}

const Lobby = ({moderator = false}: LobbyProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.waitingBlock}>
        <Box className={classes.waitingGraphicBlock}>
          <Image
            layout="fill"
            className={classes.waitingGraphic}
            objectFit="cover"
            src={WaitingRoomGraphic}
            alt="Graphic of people chatting in the living room. Brazuca, By Cezar Berje"
          />
        </Box>
        <Typography variant="h1" className={cx(classes.heroText)}>
          Waiting for next session
        </Typography>
      </Box>
      {moderator && (
        <Box className={classes.moderatorWarningBlock}>
          <Box className={classes.moderatorWarningGraphicBlock}>
            <Image
              layout="fill"
              className={classes.moderatorWarningGraphic}
              objectFit="cover"
              src={ModeratorWarningGraphic}
              alt="Graphic of person waving on a wheelchair. Brazuca, By Cezar Berje"
            />
          </Box>

          <Box gap={1} display={'flex'} flexDirection={'column'}>
            <Typography variant="body1">
              Hello there! <br />
              You are the moderator of this room, and can start a session whenever you are ready!
              <br />
              just by clicking at &quot;<strong>Start</strong>&quot; button.
            </Typography>
            <Typography className={classes.moderatorNote} variant="body1">
              <strong>Note:</strong>
              <br />
              Any users that connect after you&apos;ve started a session will not be able to vote
              until the next session.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Lobby;
