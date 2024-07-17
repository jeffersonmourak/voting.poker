import { avatarProps } from '@/helpers/avatarProps';
import { Avatar, AvatarGroup, Box, Theme, Tooltip, Typography, darken, styled } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { User } from 'core';

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  backgroundColor: darken(theme.palette.background.paper, 0.4),
  borderRadius: theme.spacing(2),
  padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
}))

const Result = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(2),
  width: theme.spacing(50),

  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const ResultTitle = styled(Typography)<{ small: boolean }>(({ theme, small, color }) => ({
  position: 'relative',
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius,
  color: 'transparent',
  transform: `rotate(45deg)`,
  backgroundColor: color as string,
  width: theme.spacing(10),
  height: theme.spacing(10),

  '&::before': {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    content: 'attr(data-value)',
    ...(small ? theme.typography.h4 : theme.typography.h3),
    color: darken(color as string, 0.9),
    transform: `rotate(-45deg)`,
    width: theme.spacing(10),
    height: theme.spacing(10),
    top: 2,
    left: 2,
  }
}));

const People = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
}));

const Totals = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(3),
}));

const useStyle = makeStyles<Theme, { color: string }>((theme) => ({
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
    backgroundColor: ({ color }) => color,
    width: theme.spacing(10),
    height: theme.spacing(10),

    '&::before': {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      content: 'attr(data-value)',
      ...theme.typography.h3,
      color: ({ color }) => darken(color, 0.9),
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

export const ResultValueBig = ({ value, percentage, color, from }: ResultValueBigProps) => {
  return (
    <Root>
      <Result>
        <Totals>
          <ResultTitle color={color} small={value.length > 2} data-value={value}>
            {value}
          </ResultTitle>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>{Math.ceil(percentage)}%</Typography>
        </Totals>
        <People>
          <AvatarGroup>
            <>
              {from.map((user) => (
                <Tooltip key={user.id} title={user.name}>
                  <Avatar {...avatarProps(user.name, value, { paddingTop: 0.1 })} />
                </Tooltip>
              ))}
            </>
          </AvatarGroup>
        </People>
      </Result>
    </Root>
  );
};
