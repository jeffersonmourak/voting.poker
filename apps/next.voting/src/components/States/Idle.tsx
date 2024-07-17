import { Box, darken, styled, Typography } from "@mui/material";
import WaitingRoomGraphic from '@root/public/graphics/brazuca_catching_up.png';
import ModeratorWarningGraphic from '@root/public/graphics/brazuca_sitting_on_wheelchair.png';
import { AnyIdleResultState } from "core";
import Image from 'next/image';

const Root = styled(Box)(({ theme }) => ({
  minHeight: '75vh',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  gap: theme.spacing(6),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(2),
  flex: 1,
  padding: theme.spacing(4),
}));

const WaitingBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const WaitingGraphicBlock = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 600,
  height: 250,
}));

const WaitingGraphic = styled(Image)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
}));

const HeroText = styled(Typography)(({ theme }) => ({
  fontFamily: ['var(--mont)', 'sans-serif'].join(', '),
  ...theme.typography.h2,
  fontWeight: 700,
  textAlign: 'center',
  color: theme.palette.text.primary,
  letterSpacing: -2,
  wordSpacing: 2,

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.h4,
  },
}));

const ModeratorWarningBlock = styled(Box)(({ theme }) => ({
  backgroundColor: darken(theme.palette.background.paper, 0.4),
  borderRadius: theme.spacing(2),
  padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
  display: 'flex',
  gap: theme.spacing(3),
}));

const ModeratorWarningGraphicBlock = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 80,
  transform: 'scale(0.7)',
}));

const ModeratorWarningGraphicImage = styled(Image)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}));

const ModeratorNote = styled(Typography)(({ theme }) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  backgroundColor: '#646876',
  borderRadius: theme.spacing(1),
}));



interface PoolStateComponentProps {
  state: AnyIdleResultState;
}

const IdleStateComponent: React.FC<PoolStateComponentProps> = ({ state }) => {
  return (
    <Root>
      <WaitingBlock>
        <WaitingGraphicBlock>
          <WaitingGraphic
            layout="fill"
            objectFit="cover"
            src={WaitingRoomGraphic}
            alt="Graphic of people chatting in the living room. Brazuca, By Cezar Berje"
          />
        </WaitingGraphicBlock>
        <HeroText variant="h1">
          Waiting for next session
        </HeroText>
      </WaitingBlock>
      {state.moderator && (
        <ModeratorWarningBlock>
          <ModeratorWarningGraphicBlock>
            <ModeratorWarningGraphicImage
              layout="fill"
              objectFit="contain"
              src={ModeratorWarningGraphic}
              alt="Graphic of person waving on a wheelchair. Brazuca, By Cezar Berje"
            />
          </ModeratorWarningGraphicBlock>

          <Box gap={2} display={'flex'} flexDirection={'column'}>
            <Typography variant="body1">
              Hello there! <br />
              You are the moderator of this room, and can start a session whenever you are ready!
              <br />
              just by clicking at &quot;<strong>Start</strong>&quot; button.
            </Typography>
            <ModeratorNote variant="body1">
              <strong>Note:</strong>
              <br />
              Any users that connect after you&apos;ve started a session will not be able to vote
              until the next session.
            </ModeratorNote>
          </Box>
        </ModeratorWarningBlock>
      )
      }
    </Root >
  );
}

export default IdleStateComponent;