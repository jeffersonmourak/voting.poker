import {cx} from '@emotion/css';
import {Typography} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {Box, Theme} from '@mui/system';
import Image from 'next/image';
import React from 'react';

import Illustration1 from '@root/public/graphics/illustration_1.png';
import Illustration2 from '@root/public/graphics/illustration_2.png';
import Illustration3 from '@root/public/graphics/illustration_3.png';
import Illustration4 from '@root/public/graphics/illustration_4.png';
import Illustration5 from '@root/public/graphics/illustration_5.png';
import Illustration6 from '@root/public/graphics/illustration_6.png';
import Illustration7 from '@root/public/graphics/illustration_7.png';
import Illustration8 from '@root/public/graphics/illustration_8.png';

const BASE_SIZE = 80;
const VARIATION = 0.8;

const px = (multiplier: number) => multiplier * BASE_SIZE * VARIATION;

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    padding: `40px 0 40px`,
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '10px',
    },
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      width: 'auto',
    },
  },
  smallHidden: {
    [theme.breakpoints.down('md')]: {
      display: 'none !important',
    },
  },
  text: {
    fontSize: '11.42857rem',
    fontStyle: 'normal;',
    fontWeight: '700;',
    lineHeight: '11.42857rem',
    letterSpacing: '-0.45714rem',

    [theme.breakpoints.down('lg')]: {
      fontSize: '9.71429rem',
      lineHeight: '9.71429rem',
    },

    [theme.breakpoints.down('md')]: {
      fontSize: '4.71429rem !important',
      lineHeight: '4.71429rem !important',
      letterSpacing: '-0.25714rem',
      width: 'auto',
    },
  },
  group: {
    display: 'flex',
    alignItems: 'center',

    [theme.breakpoints.down('md')]: {
      width: 'auto',
    },
  },

  firstLine: {
    gap: theme.spacing(10),
    [theme.breakpoints.down('md')]: {
      gap: theme.spacing(2),
    },
  },

  secondLine: {
    gap: theme.spacing(10),
    [theme.breakpoints.down('lg')]: {
      gap: theme.spacing(5),
    },
  },

  thirdLine: {
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
  },

  fourthLine: {
    gap: theme.spacing(2),
    justifyContent: 'flex-end',

    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },

  circles: {
    paddingLeft: theme.spacing(3),
  },
}));

interface LandingGrahicProps {
  children?: React.ReactNode;
}

export const LandingGrahic = ({children}: LandingGrahicProps) => {
  const classes = useStyle();

  return (
    <Box className={classes.root}>
      <Box className={classes.row}>
        <Box className={cx(classes.group, classes.smallHidden)}>
          <Image
            placeholder="blur"
            layout="fixed"
            objectFit="contain"
            src={Illustration8}
            width={px(3)}
            height={px(1.5)}
            alt={'White Arrow with Orange Circle Graphic'}
          />
        </Box>
        <Box className={cx(classes.group, classes.firstLine)}>
          <Typography variant="h3" className={classes.text}>
            Plan
          </Typography>
          <Box className={classes.smallHidden}>
            <Image
              placeholder="blur"
              layout="fixed"
              objectFit="contain"
              src={Illustration5}
              width={px(1)}
              height={px(1.5)}
              alt={'White Arrow with underscore Graphic'}
            />
          </Box>
        </Box>
        <Box className={cx(classes.group, classes.circles, classes.smallHidden)}>
          <Image
            placeholder="blur"
            layout="fixed"
            objectFit="contain"
            src={Illustration6}
            width={px(1)}
            height={px(1)}
            className={classes.group}
            alt={'Blue Circle Graphic'}
          />

          <Image
            placeholder="blur"
            layout="fixed"
            objectFit="contain"
            src={Illustration4}
            width={px(0.5)}
            height={px(0.5)}
            className={classes.group}
            alt={'White Cross Graphic'}
          />

          <Image
            placeholder="blur"
            layout="fixed"
            objectFit="contain"
            src={Illustration7}
            width={px(1)}
            height={px(1)}
            className={classes.group}
            alt={'Green Circle Graphic'}
          />
        </Box>
      </Box>
      <Box className={cx(classes.row, classes.secondLine)}>
        <Typography variant="h3" className={classes.text}>
          together
        </Typography>
        <Box className={cx(classes.group, classes.smallHidden)}>
          <Image
            placeholder="blur"
            layout="fixed"
            objectFit="contain"
            src={Illustration1}
            width={px(4)}
            height={px(2)}
            className={classes.group}
            alt={'White Arrow with underscore Graphic'}
          />
        </Box>
      </Box>
      <Box className={cx(classes.row, classes.thirdLine)}>
        <Box className={cx(classes.group, classes.smallHidden)}>
          <Image
            placeholder="blur"
            layout="fixed"
            objectFit="contain"
            src={Illustration3}
            width={px(2)}
            height={px(2)}
            className={classes.group}
            alt={'White Arrow with underscore Graphic'}
          />
        </Box>
        <Typography variant="h3" className={classes.text}>
          and grow
        </Typography>
      </Box>
      <Box className={cx(classes.row, classes.fourthLine)}>
        <Typography variant="h3" className={classes.text}>
          Faster
        </Typography>
        <Box className={cx(classes.group, classes.smallHidden)}>
          <Image
            placeholder="blur"
            layout="fixed"
            objectFit="contain"
            src={Illustration2}
            width={px(4)}
            height={px(2)}
            alt={'White Arrow with underscore Graphic'}
          />
        </Box>
      </Box>
      {children}
    </Box>
  );
};
