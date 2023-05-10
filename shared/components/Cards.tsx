import {Grid} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import Card from './Card';
import {useSession} from '../hooks/useSession';

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '82vh',
  },
  card: {
    display: 'flex',
  },
}));

interface CardsProps {
  roomId: string;
  userId: string;
}

const CARD_VALUES = ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕️'];

const Cards = ({roomId, userId}: CardsProps) => {
  const {vote, votes} = useSession(roomId);
  const selected = votes[userId];

  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.root}>
      {CARD_VALUES.map((value) => (
        <Grid key={value} className={classes.card} item md={2} xs={6}>
          <Card
            value={value}
            onClick={() => vote(userId, value)}
            selected={value === selected}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default Cards;
