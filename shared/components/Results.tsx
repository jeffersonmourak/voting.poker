import {Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import stringToColor from '@root/helpers/stringToColor';
import {User} from '@root/types/User';
import {Vote} from '@root/types/Vote';
import {groupBy, maxBy} from 'lodash';
import {PieChart} from 'react-minimal-pie-chart';

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
    button: {
        display: 'flex',
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
    users: (User & {vote: undefined | Vote})[];
    roomId: string;
}

const Results = ({users, roomId}: ResultsProps) => {
    const classes = useStyle();

    const votedUsers = users.filter(({vote}) => !!vote);

    const results = Object.entries(
        groupBy(
            users.filter(({vote}) => !!vote),
            'vote.value'
        )
    ).map(([value, users]) => ({
        title: value,
        value: users.length,
        percentage: (users.length / votedUsers.length) * 100,
        color: stringToColor(users[0].name),
    }));

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
                    {votedUsers.length} 🗳
                </Typography>
            </Box>
            {results.map(({title, percentage, color}) => (
                <Box
                    key={title}
                    gap={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color={color}>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="h6">{percentage.toFixed(2)}%</Typography>
                </Box>
            ))}
        </Box>
    );
};

export default Results;
