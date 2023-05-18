import {cx} from '@emotion/css';
import {Box, Theme, Typography, alpha, darken} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {FloatValue} from './FloatValue';
import {toBackgroundColor} from './helpers/toBackgroundColor';
import Image from 'next/image';

const useStyles = makeStyles<Theme, {height: number; background: string; isImage?: boolean}>(
  (theme) => ({
    root: ({height}) => ({
      position: 'absolute',
      width: 180,
      height,
      bottom: 0,
      left: 0,
      overflow: 'hidden',
      transition: theme.transitions.create('height'),
    }),
    background: ({background, isImage}) => ({
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 180,
      height: 250,
      background: isImage ? 'rgba(0, 0, 0, 0)' : background,
      transition: theme.transitions.create('height'),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    value: (props) => ({
      backgroundColor: darken(
        toBackgroundColor(props, alpha(theme.palette.background.paper, 0.9)),
        0.6
      ),
      minWidth: theme.spacing(10),
      minHeight: theme.spacing(10),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.shape.borderRadius,
      transition: theme.transitions.create(['background-color', 'color']),
      zIndex: 1,
      color: 'transparent',
      transform: `rotate(45deg)`,
      ['&::before']: {
        content: 'attr(data-value)',
        position: 'absolute',
        ...theme.typography.h4,
        color: theme.palette.text.primary,
        transform: `rotate(-45deg)`,
      },
    }),
    floatValue: {
      position: 'absolute',
      fontFamily: theme.typography.fontFamily,
    },

    top: {
      top: theme.spacing(2),
    },
    bottom: {
      bottom: theme.spacing(2),
      transform: `rotate(180deg)`,
    },
    left: {
      left: theme.spacing(2),
    },
    right: {
      right: theme.spacing(2),
    },
  })
);

interface CardBaseProps {
  value: string;
  height: number;
  background: string;
  isImage?: boolean;
}

export const CardBackground = ({height, background, isImage, value}: CardBaseProps) => {
  const classes = useStyles({height, background, isImage});

  return (
    <Box className={classes.root}>
      {isImage && background !== 'transparent' && (
        <Image layout="fixed" objectFit="cover" src={background} width={180} height={250} alt={value} />
      )}
      <Box className={classes.background}>
        <FloatValue value={value} background={background} isImage={isImage} top left />
        <FloatValue value={value} background={background} isImage={isImage} top right />
        <Box data-value={value} className={cx(classes.value)}>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <FloatValue value={value} background={background} isImage={isImage} bottom left />
        <FloatValue value={value} background={background} isImage={isImage} bottom right />
      </Box>
    </Box>
  );
};
