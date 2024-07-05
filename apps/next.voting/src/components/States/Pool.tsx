import { AnyPoolState } from "core";

interface PoolStateComponentProps {
  state: AnyPoolState;
}

const PoolStateComponent: React.FC<PoolStateComponentProps> = ({ state }) => {
  const moderatorView = state.moderator ? <>
    Moderator Pool State Component
    <button onClick={() => state.endSession()} >End Pool</button>
  </> : null


  return <>
    Pool State Component
    <button onClick={() => state.vote(`Vote - ${Math.random()}`)} >Vote</button>
    <br />
    {moderatorView}
  </>
}

export default PoolStateComponent;