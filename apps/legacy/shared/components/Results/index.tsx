import { Box, Theme, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { valueToColor } from '@root/helpers/valueColorScale';
import { User } from '@root/types/User';
import { groupBy, isNaN } from 'lodash';
import { ResultValue } from './ResultValue';
import { ResultValueBig } from './ResultValueBig';

const useStyle = makeStyles((theme: Theme) => ({
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4, 6),
    flex: 1,
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8, 0, 6),
    gap: theme.spacing(4),
  },
  resultContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  resultsList: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(10),
  },
  resultsChart: {
    height: theme.spacing(40),
  },
  resultValue: {
    position: 'absolute',
    top: theme.spacing(12),
  },
}));

interface ResultsProps {
  votes: Record<string, User & {vote: string}>;
  users: User[];
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
  const {color} = isNaN(Number(value))
    ? {color: stringColors[value] || '#f0f'}
    : valueToColor(Number(value));

  const fromIds = votesWithIds.filter(([, {vote}]) => vote === value).map(([id]) => id);

  return {
    title: value,
    value: votesWithIds.length,
    from: users.filter(({id}) => fromIds.includes(id)),
    percentage: (votesWithIds.length / sessionVotesResult.length) * 100,
    color,
  };
};

const Results = ({votes, users}: ResultsProps) => {
  const classes = useStyle();
  const theme = useTheme();
  const sessionVotesResult = Object.entries(votes);

  const results = Object.entries(groupBy(sessionVotesResult, ([, vote]) => vote.vote)).map(
    toResultData(sessionVotesResult, users, {
      '?': theme.palette.info.dark,
      '☕️': theme.palette.warning.dark,
    })
  );

  const [firstPlace, ...rest] = results;

  return (
    <Box className={classes.content}>
      <Box className={classes.hero}>
        <Typography variant="h1">
          <strong>Well Done!</strong>
        </Typography>
      </Box>
      <Box className={classes.resultsList}>
        <ResultValueBig
          value={firstPlace.title}
          percentage={firstPlace.percentage}
          color={firstPlace.color}
          from={firstPlace.from}
        />
        <Box>
          {rest.map(({title, percentage, color, from}) => (
            <ResultValue
              key={title}
              value={title}
              percentage={percentage}
              color={color}
              from={from}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Results;
