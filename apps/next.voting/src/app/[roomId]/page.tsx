'use client'

import BasePage from "@/components/BasePage";
import ModeratorModal from "@/components/ModeratorModal";
import RoomDetails from "@/components/RoomDetails";
import IdleStateComponent from "@/components/States/Idle";
import PoolStateComponent from "@/components/States/Pool";
import ResultStateComponent from "@/components/States/Result";
import { useRoom } from "@/hooks/useRoom";
import { Box, Modal, styled } from '@mui/material';
import { CoreClientState, VotingStates } from "core";

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  flexDirection: 'column',

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    gap: theme.spacing(1),
  },
}));

interface SwitchViewsProps {
  state: CoreClientState
}

function SwitchViews({ state }: SwitchViewsProps) {
  switch (state.state) {
    case VotingStates.Idle:
      return <IdleStateComponent state={state} />
    case VotingStates.Pool:
    case VotingStates.PoolVote:
      return <PoolStateComponent state={state} />
    case VotingStates.PoolResult:
      return <ResultStateComponent state={state} />
  }
}

interface RoomPageProps {
  params: { roomId: string };
}


export default function RoomPage({ params }: RoomPageProps) {
  const room = useRoom();
  return (
    <BasePage>
      <Modal open={room.state.moderatorEmpty}>
        <ModeratorModal />
      </Modal>
      <Root>
        <RoomDetails
          users={room.state.users}
          user={room.state.currentUser}
          roomId={params.roomId}
        />

        <SwitchViews state={room.state} />
      </Root>
    </BasePage>
  );
}
