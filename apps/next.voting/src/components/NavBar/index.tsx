import { generateRoomId } from '@/helpers/room';
import { Box, Button, useTheme } from '@mui/material';
import { alpha, styled } from '@mui/system';
import Link from 'next/link';
import AppIdentification from './AppIdentification';
import { useVisibleSection } from './hooks/useVisibleSection';
import { Links } from './Links';

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  padding: 40,
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 128,
  position: 'fixed',
  zIndex: 999,
  backdropFilter: 'blur(16px)',
  transition: 'background 0.2s ease-in-out',

  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(1),
  },
}));

const LinksContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 48,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: theme.palette.common.white,

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },

  '&:hover, &:focus': {
    color: theme.palette.common.black,
  },
}));

const ROOM_ID = generateRoomId();

export const NavBar = () => {
  const { visibleSection } = useVisibleSection(64);
  const theme = useTheme();

  const manifestBackgroundColor = theme.palette.augmentColor({ color: { main: '#F8C3A9' } });
  const isDark = visibleSection > 0;

  return (
    <Root sx={isDark ? {
      background: alpha(manifestBackgroundColor.light, 0.35),
    } : undefined} >
      <AppIdentification />
      <LinksContainer>
        <Links />
        <Link href={`/${ROOM_ID}`} passHref>
          <ActionButton
            sx={isDark ? {
              background: manifestBackgroundColor.dark,

              '&:hover, &:focus': {
                color: theme.palette.common.white,
              },
            } : undefined}
            variant="contained"
            color={isDark ? 'primary' : 'secondary'}>
            Get a room
          </ActionButton>
        </Link>
      </LinksContainer>
    </Root>
  );
};
