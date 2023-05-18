import {Box} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import Card from './Card';
import {useSession} from '../../hooks/useSession';
import {Theme} from '@mui/system';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    justifyContent: 'center',
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
      {CARD_VALUES.map((value) => (
        <Card
          key={value}
          value={value}
          onClick={() => vote(userId, value)}
          selected={value === selected}
        />
      ))}
    </Box>
  );
};

export default Cards;
