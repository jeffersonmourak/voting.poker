import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { useVisibleSection } from './hooks/useVisibleSection';

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 48,
  height: 40,
}));

const Link = styled('a')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.common.white,
  textAlign: 'center',
  fontSize: '0.9rem',
  fontStyle: 'normal',
  lineHeight: '100%',
  opacity: 0.5,
  textDecoration: 'none',
  transition: 'opacity 0.2s ease-in-out',
  gap: theme.spacing(1),

  [`&::before`]: {
    position: 'absolute',
    bottom: 0,
    content: '""',
    width: '0%',
    transition: 'width 0.2s ease-in-out',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'currentColor',
    display: 'block',
    marginRight: theme.spacing(1),
  },

  [`& svg`]: {
    fontSize: '1rem',
    transition: 'all 0.2s ease-in-out',
    opacity: 0,
    transform: 'translateY(8px)',
  },

  '&:hover': {
    opacity: 1,

    [`&::before`]: {
      width: '100%',
    },

    [`& svg`]: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));



export const Links = () => {
  const { visibleSection } = useVisibleSection(64);
  const isDark = visibleSection > 0;
  return (
    <Root>
      <Link sx={isDark ? {
        color: 'common.black',
      } : undefined} href="#pricing">
        Pricing
      </Link>
      <Link
        sx={isDark ? {
          color: 'common.black',
        } : undefined}
        target="_blank"
        href="https://github.com/jeffersonmourak/voting.poker">
        Github <OpenInNewRoundedIcon />
      </Link>
    </Root>
  );
};
