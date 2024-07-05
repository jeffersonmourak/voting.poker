'use client'

import IdleStateComponent from "@/components/States/Idle";
import PoolStateComponent from "@/components/States/Pool";
import ResultStateComponent from "@/components/States/Result";
import { CoreClientState, VotingStates } from "core";
import { useRoom } from "./_hooks/useRoom";

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
    <main>
      <h1>Room page {params.roomId}</h1>
      <SwitchViews state={room.state} />
    </main>
  );
}
