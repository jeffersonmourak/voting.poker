import {
  GifOverlayProps,
  Grid,
  SearchBar,
  SearchContext,
  SearchContextManager,
} from '@giphy/react-components';
import {IGif} from '@giphy/js-types';
import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {cx} from '@emotion/css';
import Box from '@mui/material/Box';
import {Theme, Typography} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const SelectContext = createContext<{selectedGif: IGif | null}>({
  selectedGif: null,
});

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    gap: theme.spacing(2),
    flexDirection: 'column',
  },
  grid: {
    display: 'flex',
    justifyContent: 'center',
    height: 300,
    overflow: 'auto',
  },
  gifOverlay: {
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
  },
  gifHovered: {
    backgroundColor: theme.palette.background.paper,
  },
  gifSelected: {
    backgroundColor: theme.palette.success.dark,
  },
  gifDiselected: {
    backgroundColor: theme.palette.error.dark,
  },
  searchBar: {
    backgroundColor: `${theme.palette.background.default} !important`,
    borderRadius: `${theme.spacing(3)} !important`,
    overflow: 'hidden',
    padding: `${theme.spacing(1)} ${theme.spacing(0)} ${theme.spacing(1)} ${theme.spacing(2)}`,

    ['& input']: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
    },
    ['& div']: {
      padding: `${theme.spacing(0)} ${theme.spacing(2)}`,
      width: '80px',
    },

    ['& div:hover']: {
      ['& > div']: {
        background: `${theme.palette.success.dark} !important`,
      },
    },

    ['& div > div']: {
      background: `${theme.palette.primary.light} !important`,
      color: theme.palette.text.secondary,
      borderRadius: theme.spacing(3),
      padding: `${theme.spacing(0)} ${theme.spacing(2)}`,
      transition: 'background-color 0.2s ease',
    },

    ['& div > div::before']: {
      background: `transparent !important`,
      content: '',
      animation: 'none',
    },
  },
}));

const Overlay = ({gif, isHovered}: GifOverlayProps) => {
  const classes = useStyles();
  const {selectedGif} = useContext(SelectContext);

  const isSelected = gif.id === selectedGif?.id;

  if (!isHovered) {
    return (
      <Box className={cx(classes.gifOverlay, {[classes.gifSelected]: isSelected})}>
        {isSelected && (
          <>
            <CheckRoundedIcon sx={{fontSize: '4rem'}} />
          </>
        )}
      </Box>
    );
  }

  return (
    <Box
      className={cx(classes.gifOverlay, {
        [classes.gifHovered]: isHovered && !isSelected,
        [classes.gifDiselected]: isHovered && isSelected,
      })}>
      {!isSelected && (
        <>
          <CheckRoundedIcon />
          <Typography variant="body1">Choose</Typography>
        </>
      )}
      {isSelected && (
        <>
          <CloseRoundedIcon />
          <Typography variant="body1">Cancel</Typography>
        </>
      )}
    </Box>
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
  const classes = useStyles();
  const {fetchGifs, searchKey} = useContext(SearchContext);

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
    <Box className={classes.root}>
      <SearchBar className={classes.searchBar} />
      <Box className={classes.grid}>
        <SelectContext.Provider value={{selectedGif}}>
          <Grid
            noLink
            onGifClick={handleSelectGif}
            key={searchKey}
            columns={3}
            width={600}
            fetchGifs={fetchGifs}
            overlay={Overlay}
          />
        </SelectContext.Provider>
      </Box>
    </Box>
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
