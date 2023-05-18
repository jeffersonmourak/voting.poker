import {cx} from '@emotion/css';
import {Box, Theme, Typography, alpha, darken, getLuminance, lighten} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {toBackgroundColor} from './helpers/toBackgroundColor';

const useStyles = makeStyles<Theme, {background: string; isImage?: boolean}>((theme) => ({
  floatValue: (props) => ({
    position: 'absolute',
    fontFamily: theme.typography.fontFamily,
    transform: `rotate(45deg)`,
    color: 'transparent',
    borderRadius: 4,
    width: 20,
    height: 20,
    backgroundColor: props.isImage
      ? darken(toBackgroundColor(props, alpha(theme.palette.background.paper, 0.9)), 0.6)
      : 'transparent',

    '&::before': {
      position: 'absolute',
      fontFamily: theme.typography.fontFamily,
      content: 'attr(data-value)',
      ...theme.typography.button,
      transform: `rotate(-45deg)`,
      color: props.isImage
        ? theme.palette.text.primary
        : getLuminance(props.background) > 0.5
        ? darken(props.background, 0.9)
        : lighten(props.background, 0.9),
    },
  }),

  top: {
    top: theme.spacing(2),
  },
  bottom: {
    bottom: theme.spacing(2),

    '&::before': {
      transform: `rotate(135deg) !important`,
    },
  },
  left: {
    left: theme.spacing(2),
  },
  right: {
    right: theme.spacing(2),
  },
}));

type XPositions =
  | {
      left: true;
    }
  | {
      right: true;
    };

type YPositions =
  | {
      top: true;
    }
  | {
      bottom: true;
    };

type FloatValuePositions = XPositions & YPositions;

const useFloatValueStyles = ({value, background, isImage, ...position}: FloatValueProps) => {
  const classes = useStyles({background, isImage});

  const placement: string[] = [];

  if ('top' in position) {
    placement.push(classes.top);
  } else {
    placement.push(classes.bottom);
  }

  if ('left' in position) {
    placement.push(classes.left);
  } else {
    placement.push(classes.right);
  }

  return {
    classes,
    value,
    placement,
  };
};

type FloatValueProps = FloatValuePositions & {
  value: string;
  background: string;
  isImage?: boolean;
};

export const FloatValue = (props: FloatValueProps) => {
  const {classes, value, placement} = useFloatValueStyles(props);
  return (
    <Box data-value={value} className={cx(classes.floatValue, ...placement)}>
      <Typography variant="button">{value}</Typography>
    </Box>
  );
};
