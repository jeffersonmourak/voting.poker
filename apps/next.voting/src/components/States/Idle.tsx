import { AnyIdleResultState } from "core";

interface PoolStateComponentProps {
  state: AnyIdleResultState;
}

const IdleStateComponent: React.FC<PoolStateComponentProps> = ({ state }) => {

  if (state.moderator) {
    return <>
      Moderator Idle State Component
      <button onClick={() => state.startSession()} >Start Pool</button>
    </>
  }

  return <>Idle State Component</>
}

export default IdleStateComponent;