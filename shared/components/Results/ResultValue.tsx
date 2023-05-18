import {Avatar, Box, Theme, Typography, darken, AvatarGroup, Tooltip} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {User} from '@root/types/User';
import {avatarProps} from '@root/helpers/avatarProps';

const useStyle = makeStyles<Theme, {color: string}>((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  result: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(2),
    width: theme.spacing(50),

    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  totals: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(2),
  },
  people: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
  },
  resultTitle: {
    position: 'relative',
    textAlign: 'center',
    borderRadius: theme.shape.borderRadius,
    color: 'transparent',
    transform: `rotate(45deg)`,
    backgroundColor: ({color}) => color,
    width: theme.spacing(6),
    height: theme.spacing(6),

    '&::before': {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      content: 'attr(data-value)',
      ...theme.typography.h6,
      color: ({color}) => darken(color, 0.9),
      transform: `rotate(-45deg)`,
      width: theme.spacing(6),
      height: theme.spacing(6),
      top: 0,
      left: 0,
    },
  },
}));

interface ResultValueProps {
  value: string;
  percentage: number;
  color: string;
  from: User[];
}

export const ResultValue = ({value, percentage, color, from}: ResultValueProps) => {
  const classes = useStyle({color});

  return (
    <Box className={classes.root} color={color}>
      <Box className={classes.result}>
        <Box className={classes.totals}>
          <Typography data-value={value} className={classes.resultTitle}>
            {value}
          </Typography>
          <Typography variant="h6">{percentage.toFixed(2)}%</Typography>
        </Box>
        <Box className={classes.people}>
          <AvatarGroup>
            <>
              {from.map((user) => (
                <Tooltip key={user.id} title={user.name}>
                  <Avatar {...avatarProps(user.name, value)} />
                </Tooltip>
              ))}
            </>
          </AvatarGroup>
        </Box>
      </Box>
    </Box>
  );
};
