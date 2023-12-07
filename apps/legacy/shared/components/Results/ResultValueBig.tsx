import { cx } from '@emotion/css';
import { Avatar, AvatarGroup, Box, Theme, Tooltip, Typography, darken } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { avatarProps } from '@root/helpers/avatarProps';
import { User } from '@root/types/User';

const useStyle = makeStyles<Theme, {color: string}>((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
    backgroundColor: darken(theme.palette.background.paper, 0.4),
    borderRadius: theme.spacing(2),
    padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(3),
  },
  people: {
    marginTop: theme.spacing(2),
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
    width: theme.spacing(10),
    height: theme.spacing(10),

    '&::before': {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      content: 'attr(data-value)',
      ...theme.typography.h3,
      color: ({color}) => darken(color, 0.9),
      transform: `rotate(-45deg)`,
      width: theme.spacing(10),
      height: theme.spacing(10),
      top: 0,
      left: 0,
    },
  },
  resultTitleSmall: {
    '&::before': {
      ...theme.typography.h4,
    },
  },
}));

interface ResultValueBigProps {
  value: string;
  percentage: number;
  color: string;
  from: User[];
}

export const ResultValueBig = ({value, percentage, color, from}: ResultValueBigProps) => {
  const classes = useStyle({color});

  return (
    <Box className={classes.root}>
      <Box className={classes.result}>
        <Box className={classes.totals}>
          <Typography
            data-value={value}
            className={cx(classes.resultTitle, {[classes.resultTitleSmall]: value.length > 2})}>
            {value}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>{Math.ceil(percentage)}%</Typography>
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
