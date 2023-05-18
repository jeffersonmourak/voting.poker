import {ButtonBase, Theme, lighten} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';
import {makeStyles} from '@mui/styles';
import {
  CardBackgroundData,
  cardBackgroundObservable,
} from '../../observables/cardBackgroundObservable';
import {Subscription} from 'rxjs';
import {CardBackground} from './CardBackground';
import {CardForeground} from './CardForeground';

const useStyles = makeStyles<Theme, {height: number; background: string; isImage?: boolean}>(
  (theme) => ({
    root: {
      flex: `0 0 180px`,
      height: '250px',
      backgroundColor: lighten(theme.palette.primary.main, 0.1),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(8, 0, 6),
      gap: theme.spacing(4),
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      transition: theme.transitions.create('background-color'),
      overflow: 'hidden',
    },
  })
);

interface CardProps {
  value: string;
  selected?: boolean;
  onClick?: () => void;
}

const useBackground = (value: string) => {
  const [hover, setHover] = useState(false);
  const cardBackgroundRef = useRef<Subscription>();
  const [background, setBackground] = useState<CardBackgroundData>({
    background: 'transparent',
    height: 0,
    value,
    isImage: true,
  });

  useEffect(() => {
    cardBackgroundRef.current = cardBackgroundObservable(value).subscribe(setBackground);
    return () => {
      cardBackgroundRef.current?.unsubscribe();
    };
  }, [value]);

  return {...background, setHover, hover};
};

const Card = ({value, selected, onClick = () => {}}: CardProps) => {
  const {background, height, isImage, setHover, hover} = useBackground(value);
  const classes = useStyles({height, background, isImage});

  return (
    <ButtonBase
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={classes.root}
      onClick={onClick}>
      <CardForeground value={value} />
      <CardBackground
        height={hover || selected ? (selected ? 250 : height) : 0}
        background={background}
        isImage={isImage}
        value={value}
      />
    </ButtonBase>
  );
};

export default Card;
