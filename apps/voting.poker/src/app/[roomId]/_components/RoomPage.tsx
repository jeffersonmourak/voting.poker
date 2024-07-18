'use client';

import { Box, Modal, styled } from '@mui/material';
import { CoreClientState, VotingStates } from "@voting.poker/core";
import { AvatarContext } from '@voting.poker/next/components/AvatarProvider';
import ModeratorModal from "@voting.poker/next/components/ModeratorModal";
import RoomDetails from "@voting.poker/next/components/RoomDetails";
import IdleStateComponent from "@voting.poker/next/components/States/Idle";
import PoolStateComponent from "@voting.poker/next/components/States/Pool";
import ResultStateComponent from "@voting.poker/next/components/States/Result";
import { useRoom } from "@voting.poker/next/hooks/useRoom";
import { useContext } from 'react';
import Providers from './Providers';

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  flexDirection: 'column',
  height: '100%',

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

function RoomPageContent({ params }: RoomPageProps) {
  const room = useRoom();
  const { open: isAvatarOpen } = useContext(AvatarContext);

  return <>
    <Modal open={!isAvatarOpen && room.state.moderatorEmpty}>
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
  </>
}

export default function RoomPage({ params }: RoomPageProps) {

  return (
    <Providers roomId={params.roomId}>
      <RoomPageContent params={params} />
    </Providers>
  );
}
