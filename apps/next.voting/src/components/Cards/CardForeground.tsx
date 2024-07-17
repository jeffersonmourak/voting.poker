import {cx} from '@emotion/css';
import {Box, Theme, Typography, alpha, lighten, useTheme} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {FloatValue} from './FloatValue';

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    position: 'absolute',
    width: 180,
    height: 250,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 180,
    height: 250,
    background: lighten(theme.palette.primary.main, 0.1),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: theme.transitions.create('height'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    backgroundColor: alpha(theme.palette.common.white, 0.6),
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
  },
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
}));

interface CardBaseProps {
  value: string;
}

export const CardForeground = ({value}: CardBaseProps) => {
  const {palette} = useTheme();
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Box className={classes.background}>
        <FloatValue value={value} background={lighten(palette.primary.main, 0.1)} top left />
        <FloatValue value={value} background={lighten(palette.primary.main, 0.1)} top right />
        <Box data-value={value} className={cx(classes.value)}>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <FloatValue value={value} background={lighten(palette.primary.main, 0.1)} bottom left />
        <FloatValue value={value} background={lighten(palette.primary.main, 0.1)} bottom right />
      </Box>
    </Box>
  );
};
