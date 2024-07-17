import { IGif } from '@giphy/js-types';
import {
  GifOverlayProps,
  Grid,
  SearchBar,
  SearchContext,
  SearchContextManager,
} from '@giphy/react-components';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Theme, Typography, lighten, styled, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { useWindowSize } from '@uidotdev/usehooks';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SelectContext = createContext<{ selectedGif: IGif | null }>({
  selectedGif: null,
});

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexDirection: 'column',
}));

const GiphySearchBar = styled(SearchBar)(({ theme }) => ({
  backgroundColor: `transparent !important`,
  borderRadius: `${theme.spacing(1)} !important`,
  overflow: 'hidden',
  padding: 0,
  display: 'flex',
  gap: theme.spacing(2),

  ['& input']: {
    backgroundColor: '#292929',
    color: theme.palette.text.primary,
    padding: `${theme.spacing(1)} ${theme.spacing(0)} ${theme.spacing(1)} ${theme.spacing(2)}`,
    height: 42,
    borderRadius: `${theme.spacing(1)} !important`,
  },
  ['& div']: {
    padding: `${theme.spacing(0)} ${theme.spacing(2)}`,
    width: '80px',
    ['& > div']: {
      background: `${theme.palette.common.black} !important`,
    },
  },

  ['& div:hover']: {
    ['& > div']: {
      background: `${lighten(theme.palette.common.black, 0.4)} !important`,
    },
  },

  ['& div > div']: {
    background: `${theme.palette.primary.light} !important`,
    color: theme.palette.text.secondary,
    borderRadius: theme.spacing(1),
    padding: `${theme.spacing(0)} ${theme.spacing(2)}`,
    transition: 'background-color 0.2s ease',
  },

  ['& div > div::before']: {
    background: `transparent !important`,
    content: '""',
    animation: 'none',
  },
}));

const GridBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  height: 300,
  overflow: 'auto',

  [theme.breakpoints.down('md')]: {
    height: 'unset',
    overflow: 'unset',
    marginBottom: theme.spacing(20),
  }
}));

const toBackgroundColor = (theme: Theme, isSelected: boolean, isHovered: boolean) => {
  if (isSelected) {
    return isHovered ? theme.palette.error.dark : theme.palette.success.dark;
  }
  if (isHovered) {
    return theme.palette.background.paper;
  }
  return 'unset';
}

const GifOverlay = styled(Box)<{ isSelected: boolean, isHovered: boolean }>(({ theme, isSelected, isHovered }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  color: theme.palette.common.white,
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'background-color 0.2s ease',
  cursor: 'pointer',
  opacity: 0.8,
  flexDirection: 'column',
  gap: theme.spacing(1),
  backgroundColor: toBackgroundColor(theme, isSelected, isHovered),
}));

const Overlay = ({ gif, isHovered }: GifOverlayProps) => {
  const { selectedGif } = useContext(SelectContext);

  const isSelected = gif.id === selectedGif?.id;


  return (
    <GifOverlay isSelected={isSelected} isHovered={isHovered}>
      {isHovered ? isSelected ? (
        <>
          <CloseRoundedIcon />
          <Typography variant="body1">Cancel</Typography>
        </>
      ) : (
        <>
          <CheckRoundedIcon />
          <Typography variant="body1">Choose</Typography>
        </>
      ) : isSelected && (
        <CheckRoundedIcon sx={{ fontSize: '4rem' }} />
      )}
    </GifOverlay>
  );
};

const Components = ({
  onSelect,
  avatarUrl,
}: {
  avatarUrl: string | null;
  onSelect: (url: string | null) => void;
}) => {
  const [selectedGif, setSelectedGif] = useState<IGif | null>(null);
  const { fetchGifs, searchKey } = useContext(SearchContext);
  const { width } = useWindowSize();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const gridWidth = isMobile ? width ?? window.screen.width : 600;
  const gridColumns = (width ?? window.screen.width) < 500 ? 2 : 3;

  useEffect(() => {
    if (avatarUrl !== selectedGif?.images.downsized_large.url) {
      setSelectedGif(null);
    }
  }, [selectedGif, setSelectedGif, avatarUrl]);

  const handleSelectGif = useCallback(
    (gif: IGif) => {
      if (selectedGif?.id === gif.id) {
        setSelectedGif(null);
        onSelect(null);
        return;
      }
      setSelectedGif(gif);
      onSelect(gif.images.downsized_large.url);
    },
    [selectedGif]
  );

  return (
    <Root>
      <GiphySearchBar />
      <GridBox>
        <SelectContext.Provider value={{ selectedGif }}>
          <Grid
            noLink
            onGifClick={handleSelectGif}
            key={searchKey}
            columns={gridColumns}
            width={gridWidth}
            fetchGifs={fetchGifs}
            overlay={Overlay}
          />
        </SelectContext.Provider>
      </GridBox>
    </Root>
  );
};

export const GiphySearch = ({
  avatarUrl,
  onSelect,
}: {
  avatarUrl: string | null;
  onSelect: (url: string | null) => void;
}) => {
  if (!process.env.NEXT_PUBLIC_GIPHY_KEY) {
    return null;
  }

  return (
    <SearchContextManager apiKey={process.env.NEXT_PUBLIC_GIPHY_KEY}>
      <Components avatarUrl={avatarUrl} onSelect={onSelect} />
    </SearchContextManager>
  );
};
