import { styled, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Image from 'next/image';
import React from 'react';

const BASE_SIZE = 80;
const VARIATION = 0.8;

const px = (multiplier: number) => multiplier * BASE_SIZE * VARIATION;

const Root = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: `0 0 40px`,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '10px',
  },
}));

const GroupSmallHidden = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    display: 'none !important',
    width: 'auto',
  },
}));

const GroupFirstLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(10),

  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
    width: 'auto',
  },
}));

const GroupCirclesSmallHidden = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(3),

  [theme.breakpoints.down('md')]: {
    display: 'none !important',
    width: 'auto',
  },
}));

const FirstLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    width: 'auto',
  },
}));

const Text = styled(Typography)(({ theme }) => ({
  fontSize: '11.42857rem',
  fontStyle: 'normal',
  fontWeight: 600,
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
}));

const SmallHiddenGraphic = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'none !important',
  },
}));

const GroupGraphic = styled(Image)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    width: 'auto',
  },
}));

const SecondLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(10),
  [theme.breakpoints.down('lg')]: {
    gap: theme.spacing(5),
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    width: 'auto',
  },
}));

const ThirdLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  justifyContent: 'flex-end',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    width: 'auto',
  },
}));

const FourthLine = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'flex-end',

  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: 'auto',
  },
}));

interface LandingGrahicProps {
  children?: React.ReactNode;
}

export const LandingGrahic = ({ children }: LandingGrahicProps) => {
  return (
    <Root>
      <FirstLine>
        <GroupSmallHidden>
          <Image
            placeholder="empty"
            layout="fixed"
            objectFit="contain"
            src={'/graphics/illustration_8.png'}
            width={px(3)}
            height={px(1.5)}
            alt={'White Arrow with Orange Circle Graphic'}
          />
        </GroupSmallHidden>
        <GroupFirstLine>
          <Text variant="h3">
            Plan
          </Text>
          <SmallHiddenGraphic>
            <Image
              placeholder="empty"
              layout="fixed"
              objectFit="contain"
              src={'/graphics/illustration_5.png'}
              width={px(1)}
              height={px(1.5)}
              alt={'White Arrow with underscore Graphic'}
            />
          </SmallHiddenGraphic>
        </GroupFirstLine>
        <GroupCirclesSmallHidden>
          <GroupGraphic
            placeholder="empty"
            layout="fixed"
            objectFit="contain"
            src={'/graphics/illustration_6.png'}
            width={px(1)}
            height={px(1)}
            alt={'Blue Circle Graphic'}
          />

          <GroupGraphic
            placeholder="empty"
            layout="fixed"
            objectFit="contain"
            src={'/graphics/illustration_4.png'}
            width={px(0.5)}
            height={px(0.5)}
            alt={'White Cross Graphic'}
          />

          <GroupGraphic
            placeholder="empty"
            layout="fixed"
            objectFit="contain"
            src={'/graphics/illustration_7.png'}
            width={px(1)}
            height={px(1)}
            alt={'Green Circle Graphic'}
          />
        </GroupCirclesSmallHidden>
      </FirstLine>
      <SecondLine>
        <Text variant="h3">
          together
        </Text>
        <GroupSmallHidden>
          <GroupGraphic
            placeholder="empty"
            layout="fixed"
            objectFit="contain"
            src={'/graphics/illustration_1.png'}
            width={px(4)}
            height={px(2)}
            alt={'White Arrow with underscore Graphic'}
          />
        </GroupSmallHidden>
      </SecondLine>
      <ThirdLine>
        <GroupSmallHidden>
          <GroupGraphic
            placeholder="empty"
            layout="fixed"
            objectFit="contain"
            src={'/graphics/illustration_3.png'}
            width={px(2)}
            height={px(2)}
            alt={'White Arrow with underscore Graphic'}
          />
        </GroupSmallHidden>
        <Text variant="h3">
          and grow
        </Text>
      </ThirdLine>
      <FourthLine sx={{ justifyContent: 'flex-start' }}>
        <Text variant="h3">
          Stronger
        </Text>
      </FourthLine>
      {children}
    </Root>
  );
};
