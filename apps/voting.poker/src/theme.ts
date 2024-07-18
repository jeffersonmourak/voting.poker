'use client';

import { createTheme } from '@mui/material/styles';
import { darken, getLuminance, lighten } from '@mui/system';

import { Property } from 'csstype';

export const colors = {
  primary: {
    main: '#000000',
  },
  secondary: {
    main: '#ffffff',
  },
  background: {
    default: '#000000',
    paper: '#292929',
  },
  text: {
    primary: '#ffffff',
    secondary: '#bbbbbb',
    disabled: '#969696',
  },
  success: {
    main: '#00de0a',
  },
};

export const gridSize = 8;
export const getSize = (size: number) => size * gridSize;

// Button styles for the color variants
const buttonVariationOverrides = (color: string) => ({
  backgroundColor: color,
  color: getLuminance(color) < 0.6 ? lighten(color, 0.9) : darken(color, 0.9),
  padding: `${getSize(2)}px ${getSize(3)}px`,
  borderRadius: getSize(2),
  leadingTrim: 'both',
  textEdge: 'cap',
  fontFamily: ['var(--mont)', 'sans-serif'].join(', '),
  fontSize: 12.25,
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: 'normal',
  textTransform: 'none' as Property.TextTransform,

  '&:hover, &:focus': {
    backgroundColor: darken(color, 0.1),
  },
  '&:active': {
    backgroundColor: darken(color, 0.3),
    color: getLuminance(color) < 0.6 ? lighten(color, 0.6) : darken(color, 0.9),
  },
  '&.Mui-disabled': {
    backgroundColor: color,
    color: getLuminance(color) < 0.6 ? lighten(color, 0.9) : darken(color, 0.9),
  },
});

const labelShrinked = {
  transform: `translate(${getSize(2)}px, ${getSize(1) + 1}px) scale(.8)`,
  color: lighten(colors.background.paper, 0.8),
  '& + .MuiOutlinedInput-root > input': {
    paddingTop: getSize(3),
  },
};

const theme = createTheme({
  typography: {
    fontFamily: ['var(--mont)', 'sans-serif'].join(', '),
  },
  palette: {
    ...colors,
  },
  shape: {
    borderRadius: getSize(2),
  },
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        filled: labelShrinked,
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          transform: `translate(${getSize(2)}px, ${getSize(2) + 1}px) scale(1)`,
          '&.Mui-focused': labelShrinked,
        },
        shrink: labelShrinked,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          transition: `padding-top 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms`,
          padding: getSize(2),
          backgroundColor: darken(colors.background.paper, 0.03),
          borderRadius: getSize(1),
        },
        root: {
          borderRadius: getSize(1),
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
            borderWidth: 1,
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },

          '& .MuiOutlinedInput-notchedOutline legend': {
            width: 0,
          },
        },
        notchedOutline: {
          borderColor: 'transparent',
        },
        multiline: {
          padding: 0,
        },
        inputMultiline: {
          padding: getSize(2),
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableFocusRipple: true,
      },
      styleOverrides: {
        containedPrimary: buttonVariationOverrides(colors.primary.main),
        containedSecondary: buttonVariationOverrides(colors.secondary.main),
        root: {
          padding: getSize(1),
          borderRadius: getSize(4) + 2,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            opacity: 0.7,
          },
        },
      },
    },
  },
});

export default theme;
