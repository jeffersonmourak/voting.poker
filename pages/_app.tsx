import {AppProps} from 'next/app';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import '../styles/globals.css';
import {theme} from '@root/shared/theme';
import createEmotionCache from '@root/shared/createEmotionCache';
import {CacheProvider} from '@emotion/react';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {DataCollectionNotification} from '@root/shared/components/DataCollectionNotification';
import {AnalyticsProvider} from '@root/shared/components/AnalyticsProvider';
import {ErrorBoundary} from '@highlight-run/react';

const clientSideEmotionCache = createEmotionCache();

function MyApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: AppProps & {emotionCache?: any}) {
  return (
    <ErrorBoundary>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <AnalyticsProvider>
            <CssBaseline />
            <Head>
              <title> Voting Poker </title>
              <meta name="viewport" content="initial-scale=1, width=device-width" />
            </Head>
            <Component {...pageProps} />
            <ToastContainer icon={false} closeButton={<></>} />
            <DataCollectionNotification />
          </AnalyticsProvider>
        </ThemeProvider>
      </CacheProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
