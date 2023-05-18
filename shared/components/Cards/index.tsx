import {Box} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import Card from './Card';
import {useSession} from '../../hooks/useSession';
import {Theme} from '@mui/system';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4, 6),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  cards: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    justifyContent: 'center',
    maxWidth: theme.spacing(125),
    flex: 1,
  },
}));

interface CardsProps {
  roomId: string;
  userId: string;
}

const CARD_VALUES = ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕️'];

const Cards = ({roomId, userId}: CardsProps) => {
  const {vote, votes} = useSession(roomId);
  const selected = votes[userId]?.vote;

  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.cards}>
        {CARD_VALUES.map((value) => (
          <Card
            key={value}
            value={value}
            onClick={() => vote(userId, value)}
            selected={value === selected}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Cards;
