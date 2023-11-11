import { Box, Button, Theme, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles<Theme, {inSession: boolean}>((theme) => ({
  root: {
    display: 'flex',
    gap: ({inSession}) => theme.spacing(inSession ? 0 : 2),
    transition: theme.transitions.create(['gap']),
  },
  release: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    paddingLeft: ({inSession}) => (inSession ? 0 : theme.spacing(2)),
    paddingRight: ({inSession}) => (inSession ? 0 : theme.spacing(2)),
    minWidth: ({inSession}) => (inSession ? 0 : theme.spacing(8)),
    flex: ({inSession}) => (inSession ? 0 : 1),
    transition: theme.transitions.create(['min-width', 'padding', 'flex']),
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,

    '&:hover, &:focus, &:active': {
      backgroundColor: theme.palette.error.dark,
      color: theme.palette.common.white,
    },
  },
}));

interface ModeratorControlsProps {
  sessionId: string | null;
  ended: boolean;
  onSessionStart: () => void;
  onSessionEnd: () => void;
  onReleaseModerator: () => void;
}

const ModeratorControls = ({
  sessionId,
  ended,
  onSessionStart,
  onSessionEnd,
  onReleaseModerator,
}: ModeratorControlsProps) => {
  const inSession = !!sessionId && !ended;

  const classes = useStyles({inSession});
  return (
    <Box className={classes.root}>
      {inSession && (
        <Tooltip title="Stop and reveal the votes">
          <Button sx={{flex: 1}} variant="contained" color="secondary" onClick={onSessionEnd}>
            Stop
          </Button>
        </Tooltip>
      )}
      {!inSession && (
        <Tooltip title="Start a new voting session">
          <Button sx={{flex: 1}} variant="contained" color="secondary" onClick={onSessionStart}>
            start
          </Button>
        </Tooltip>
      )}

      <Tooltip title="Release moderator seat">
        <Button
          className={classes.release}
          variant="contained"
          color="secondary"
          onClick={onReleaseModerator}>
          Release
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ModeratorControls;
