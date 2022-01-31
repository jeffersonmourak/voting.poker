import {Grid, Theme} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, {useEffect, useState} from 'react';
import useVote from '../hooks/useVote';
import Card from './Card';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        minHeight: '82vh',
    },
    card: {
        display: 'flex',
    },
}));

interface CardsProps {
    roomId: string;
}

const CARD_VALUES = ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕️'];

const Cards = ({roomId}: CardsProps) => {
    const [selected, setSelected] = useState('');
    const {vote} = useVote(roomId);

    useEffect(() => {
        vote(selected);
    }, [selected]);

    const classes = useStyles();

    return (
        <Grid container spacing={3} className={classes.root}>
            {CARD_VALUES.map((value) => (
                <Grid key={value} className={classes.card} item md={3} xs={12}>
                    <Card
                        value={value}
                        onClick={() => setSelected(value)}
                        selected={value === selected}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default Cards;
