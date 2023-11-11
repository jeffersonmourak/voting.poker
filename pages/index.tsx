import { cx } from '@emotion/css';
import { Button, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Box, Theme, darken } from '@mui/system';
import BrazucaGraphic from '@root/public/graphics/brazuca.jpg';
import BasePage from '@root/shared/components/BasePage';
import { LandingGrahic } from '@root/shared/components/LandingGraphic';
import { NavBar } from '@root/shared/components/NavBar';
import { generateRoomId } from '@root/shared/helpers/room';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const ROOM_ID = generateRoomId();

const useStyle = makeStyles((theme: Theme) => ({
  section: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    paddingTop: 128,
  },
  hero: {
    paddingLeft: 40,
    paddingRight: 40,
  },
  sectionCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  action: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  callToActionWrapper: {
    position: 'absolute',
    width: '32%',
    bottom: 0,
    left: '-8%',
    display: 'flex',
    flexDirection: 'column',

    [theme.breakpoints.down('lg')]: {
      position: 'relative',
      left: 0,
      width: '100%',
      alignItems: 'center',
    },

    [theme.breakpoints.up('md')]: {
      gap: theme.spacing(2),
    },
  },
  callToActionText: {
    color: theme.palette.common.white,
    textAlign: 'right',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '24px',
    width: 300,

    [theme.breakpoints.up('sm')]: {
      width: '100%',
    },
  },
  link: {
    color: '#43BA7F !important',
    textDecoration: 'none',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
  actionButton: {
    background: 'rgba(255, 255, 255, 0.35)',
    color: theme.palette.common.white,

    '&:hover, &:focus': {
      color: theme.palette.common.black,
    },
  },
  manifest: {
    backgroundColor: '#F8C3A9',
    maxHeight: 1200,
    minHeight: 1200,

    [theme.breakpoints.up('sm')]: {
      paddingLeft: 112,
      paddingRight: 112,
    },
  },
  manifestCard: {
    borderRadius: 40,
    background: 'linear-gradient(315deg, #F6F7FC 0%, rgba(246, 247, 252, 0.50) 100%)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    padding: theme.spacing(5),
    flex: 1,

    [theme.breakpoints.up('lg')]: {
      gap: 112,
      maxHeight: 900,
    },
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column-reverse',
      padding: theme.spacing(2),
      borderRadius: 0,
    },
  },
  manifestContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    color: '#1D1F26',
    flex: 1,
    gap: theme.spacing(4),

    [theme.breakpoints.up('lg')]: {
      paddingLeft: 112,
    },

    maxWidth: 500,
  },
  title: {
    color: '#1D1F26',
    fontSize: '88px',
    fontWeight: 700,
    paddingTop: theme.spacing(2),
    lineHeight: '88px /* 100% */',
    [theme.breakpoints.up('sm')]: {
      paddingTop: 112,
    },

    [theme.breakpoints.down('sm')]: {
      paddingTop: 112,
      fontSize: '78px !important',
      textAlign: 'center',
    },
  },
  manifestText: {
    color: '#646876',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '25px /* 160% */',

    [theme.breakpoints.down('sm')]: {
      fontSize: '14px !important',
      fontWeight: 500,
      lineHeight: '22px /* 160% */',
      textAlign: 'left',
    },
  },
  manifestButton: {
    background: '#F1A05E',
    color: theme.palette.common.white,

    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },

    '&:hover, &:focus': {
      background: darken('#F1A05E', 0.1),
    },
  },
  manifestGraphicWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',

    [theme.breakpoints.down('sm')]: {
      height: 400,
    },

    [theme.breakpoints.up('sm')]: {
      flex: 1,
    },
  },
  manifestGraphic: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.spacing(3),
    overflow: 'hidden',
  },
  manifestGraphicCredits: {
    display: 'flex',
    width: '267px',
    height: '46px',
    padding: '10px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
    borderRadius: '20px 0px 0px 0px',
    background: 'rgba(255, 255, 255, 0.60)',
    backdropFilter: 'blur(8px)',
    color: theme.palette.common.black,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
}));

const Home: NextPage = () => {
  const classes = useStyle();

  return (
    <BasePage>
      <NavBar />
      <Box className={cx(classes.section, classes.hero, classes.sectionCenter)}>
        <LandingGrahic>
          <Box className={classes.callToActionWrapper}>
            <Box className={classes.callToActionText}>
              Voting Poker is an{' '}
              <a
                className={classes.link}
                target="_blank"
                href="https://github.com/jeffersonmourak/voting.poker">
                {`{open source}`}
              </a>{' '}
              project that aims to help teams to plan your sprints fast and free
            </Box>
            <Box
              width={'100%'}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'row-reverse'}>
              <Link href={`/${ROOM_ID}`} passHref>
                <Button className={classes.actionButton} variant="contained" color="secondary">
                  Get a room
                </Button>
              </Link>
            </Box>
          </Box>
        </LandingGrahic>
      </Box>
      <Box id="pricing" className={cx(classes.section, classes.manifest)}>
        <Box className={classes.manifestCard}>
          <Box className={classes.manifestContent}>
            <Box gap={3} display={'flex'} flexDirection={'column'}>
              <Typography variant="h2" className={classes.title}>{`It's Free!`}</Typography>
              <Typography className={classes.manifestText}>
                Open-source software catalyzes developers&apos; innovation, promoting collaboration,
                transparency, and collective advancement. It empowers the global developer community
                to collaboratively enhance, personalize, and accelerate solutions, propelling rapid
                progress across diverse domains. Prioritizing open source fuels technical evolution
                and cultivates a culture of shared knowledge and skill refinement, laying the
                foundation for a future where technology is democratized, and creativity knows no
                bounds.
              </Typography>
            </Box>
            <Link href={`/${ROOM_ID}`} passHref>
              <Button className={classes.manifestButton} variant="contained" color="secondary">
                Create a room
              </Button>
            </Link>
          </Box>
          <Box className={classes.manifestGraphicWrapper}>
            <Image
              layout="fill"
              className={classes.manifestGraphic}
              objectFit="cover"
              src={BrazucaGraphic}
              alt="Graphic of people chatting in an airport. Brazuca, By Cezar Berje"
            />
            <Typography className={classes.manifestGraphicCredits}>
              Brazuca, By Cezar Berje
            </Typography>
          </Box>
        </Box>
      </Box>
    </BasePage>
  );
};

export default Home;
