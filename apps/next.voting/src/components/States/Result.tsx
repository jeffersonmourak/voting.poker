import { valueToColor } from "@/helpers/valueColorScale";
import { Box, styled, Typography, useTheme } from "@mui/material";
import { AnyIdleResultState, User } from "core";
import { groupBy } from "lodash";
import { ResultValue } from "../Results/ResultValue";
import { ResultValueBig } from "../Results/ResultValueBig";

const Content = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4, 6),
  flex: 1,
}));

const Hero = styled(Box)<{ empty: boolean }>(({ theme, empty }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 0, 6),
  gap: theme.spacing(4),
  height: empty ? '100%' : 'unset',
}));

const ResultList = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(10),
}));


interface Result {
  state: AnyIdleResultState;
}

const toResultData = (
  sessionVotesResult: [
    string,
    User & {
      vote: string;
    }
  ][],
  users: User[],
  stringColors: Record<string, string>
) => ([value, votesWithIds]: [
  string,
  [
    string,
    User & {
      vote: string;
    }
  ][]
]) => {
    const { color } = isNaN(Number(value))
      ? { color: stringColors[value] || '#f0f' }
      : valueToColor(Number(value));

    const fromIds = votesWithIds.filter(([, { vote }]) => vote === value).map(([id]) => id);

    return {
      title: value,
      value: votesWithIds.length,
      from: users.filter(({ id }) => fromIds.includes(id)),
      percentage: (votesWithIds.length / sessionVotesResult.length) * 100,
      color,
    };
  };

const ResultStateComponent: React.FC<Result> = ({ state }) => {
  const theme = useTheme();
  const sessionVotesResult = Object.entries(state.votes).map(([id, vote]) => {
    const user = state.users.find(user => user.id === id);

    const pairVotes = Object.entries(state.votes).filter(([_, userVote]) => userVote === vote);

    console.log({ pairVotes, votes: state.votes })

    if (!user) {
      return null;
    }

    return [id, {
      ...user,
      vote,
    }];
  }).filter((vote): vote is [string, User & { vote: string }] => !!vote);

  const results = Object.entries(groupBy(sessionVotesResult, ([_, user]) => user.vote)).map(
    toResultData(sessionVotesResult, state.users, {
      '?': theme.palette.info.dark,
      '☕️': theme.palette.warning.dark,
    })
  );

  const [firstPlace, ...rest] = results;

  return (
    <Content>
      <Hero empty={results.length === 0}>
        <Typography variant="h1">
          {results.length > 0 ? <strong>Well Done!</strong> : <strong>Well... No votes casted</strong>}
        </Typography>
      </Hero>
      <ResultList>
        {firstPlace && (<ResultValueBig
          value={firstPlace.title}
          percentage={firstPlace.percentage}
          color={firstPlace.color}
          from={firstPlace.from}
        />)}
        <Box>
          {rest.map(({ title, percentage, color, from }) => (
            <ResultValue
              key={title}
              value={title}
              percentage={percentage}
              color={color}
              from={from}
            />
          ))}
        </Box>
      </ResultList>
    </Content>
  );
}

export default ResultStateComponent;