'use client';

import { darken, styled } from '@mui/system';

import { useTheme } from '@mui/material';
import AppLogo from '@voting.poker/next/assets/logo.svg';
import { useVisibleSection } from './hooks/useVisibleSection';

const Root = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
})

const AppTitle = styled('h1')(({ theme }) => ({
  color: theme.palette.common.white,
  fontSize: '28px !important',
  fontStyle: 'normal',
  fontWeight: 900,
  lineHeight: 'normal',
  letterSpacing: -0.56,

  [theme.breakpoints.down('md')]: {
    fontSize: '16px !important',
  },
}))

const Logo = styled(AppLogo)(({ theme }) => ({
  width: 37,
  height: 37,

  [theme.breakpoints.down('md')]: {
    width: 24,
    height: 24,
  },
}));

export default function AppIdentification() {
  const { visibleSection } = useVisibleSection(64);
  const isDark = visibleSection > 0;

  const theme = useTheme();
  const manifestBackgroundColor = theme.palette.augmentColor({ color: { main: '#F8C3A9' } });

  return (
    <Root>
      <Logo sx={isDark ? {
        color: darken(manifestBackgroundColor.dark, 0.5)
      } : undefined} />
      <AppTitle sx={isDark ? {
        color: darken(manifestBackgroundColor.dark, 0.5)
      } : undefined}>Voting Poker</AppTitle>
    </Root>
  );
};
