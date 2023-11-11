import {AppProps} from 'next/app';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import '../styles/globals.css';
import {theme} from '@root/shared/theme';
import createEmotionCache from '@root/shared/createEmotionCache';
import {CacheProvider} from '@emotion/react';
import {DataCollectionNotification} from '@root/shared/components/DataCollectionNotification';
import {AnalyticsProvider} from '@root/shared/components/AnalyticsProvider';
import {ErrorBoundary} from '@highlight-run/react';
import {isDev} from '@root/shared/constants';

const clientSideEmotionCache = createEmotionCache();

function VotingPokerApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: AppProps & {emotionCache?: any}) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <AnalyticsProvider>
          <CssBaseline />
          <Head>
            <title> Voting Poker </title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <Component {...pageProps} />
          <DataCollectionNotification />
        </AnalyticsProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

function MyApp(props: AppProps & {emotionCache?: any}) {
  if (isDev) {
    return <VotingPokerApp {...props} />;
  }

  return (
    <ErrorBoundary>
      <VotingPokerApp {...props} />
    </ErrorBoundary>
  );
}

export default MyApp;
