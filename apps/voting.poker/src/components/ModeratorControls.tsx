import { Box, Button, styled, Tooltip } from '@mui/material';
import { VotingStates } from '@voting.poker/core';
import { useRoom } from '@voting.poker/next/hooks/useRoom';

const Root = styled(Box)<{ inSession: boolean }>(({ theme, inSession }) => ({
  display: 'flex',
  gap: theme.spacing(inSession ? 0 : 2),
  transition: theme.transitions.create(['gap']),
  width: 200,
}));

const ReleaseButton = styled(Button)<{ inSession: boolean }>(({ theme, inSession }) => ({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  paddingLeft: inSession ? 0 : theme.spacing(3),
  paddingRight: inSession ? 0 : theme.spacing(3),
  minWidth: inSession ? 0 : theme.spacing(8),
  flex: inSession ? 0 : 1,
  transition: theme.transitions.create(['min-width', 'padding', 'flex']),
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,

  '&:hover, &:focus, &:active': {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.common.white,
  },
}));


interface ModeratorControlsProps {
  onSessionStart: () => void;
  onSessionEnd: () => void;
  onReleaseModerator: () => void;
}

const ModeratorControls = ({
  onSessionStart,
  onSessionEnd,
  onReleaseModerator,
}: ModeratorControlsProps) => {
  const room = useRoom();
  const inSession = [VotingStates.Pool, VotingStates.PoolVote].includes(room.state.state);

  return (
    <Root inSession={inSession}>
      {inSession && (
        <Tooltip title="Stop and reveal the votes">
          <Button sx={{ flex: 1 }} variant="contained" color="secondary" onClick={onSessionEnd}>
            Stop
          </Button>
        </Tooltip>
      )}
      {!inSession && (
        <Tooltip title="Start a new voting session">
          <Button sx={{ flex: 1 }} variant="contained" color="secondary" onClick={onSessionStart}>
            Start
          </Button>
        </Tooltip>
      )}

      <Tooltip title="Release moderator seat">
        <ReleaseButton
          inSession={inSession}
          variant="contained"
          color="secondary"
          onClick={onReleaseModerator}>
          Release
        </ReleaseButton>
      </Tooltip>
    </Root>
  );
};

export default ModeratorControls;
