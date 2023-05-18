import {Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme, useTheme} from '@mui/material';
import {groupBy, isNaN} from 'lodash';
import {PieChart} from 'react-minimal-pie-chart';
import {valueToColor} from '@root/helpers/valueColorScale';
import {ResultValue} from './ResultValue';
import {User} from '@root/types/User';

const useStyle = makeStyles((theme: Theme) => ({
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(2),
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

  return (
    <Box className={classes.content}>
      <Box className={classes.hero}>
        <Typography variant="h4">Nicely done!</Typography>
      </Box>
      <Box className={classes.resultContainer}>
        <PieChart
          startAngle={180}
          lengthAngle={180}
          lineWidth={15}
          rounded
          className={classes.resultsChart}
          data={results}
        />
        <Typography className={classes.resultValue} variant="h2">
          {sessionVotesResult.length} 🗳
        </Typography>
      </Box>
      <Box className={classes.resultsList}>
        {results.map(({title, percentage, color, from}) => (
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
  );
};

export default Results;
