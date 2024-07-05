import { AnyIdleResultState } from "core";

interface Result {
  state: AnyIdleResultState;
}

const ResultStateComponent: React.FC<Result> = ({ state }) => {
  if (state.moderator) {
    return <>
      Moderator Result State Component
      <button onClick={() => state.startSession()} >Start new Pool</button>
    </>
  }
  return <>Result State Component</>
}

export default ResultStateComponent;