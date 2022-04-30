import {AppProps} from 'next/app';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import '../styles/globals.css';
import {theme} from '@root/shared/theme';
import createEmotionCache from '@root/shared/createEmotionCache';
import {CacheProvider} from '@emotion/react';
import {UserProvider} from '@root/shared/components/UserProvider';
import {ToastContainer} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const clientSideEmotionCache = createEmotionCache();

function MyApp({
    Component,
    pageProps,
    emotionCache = clientSideEmotionCache,
}: AppProps & {emotionCache?: any}) {
    return (
        <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
                <UserProvider>
                    <CssBaseline />
                    <Head>
                        <title> Voting Poker </title>
                        <meta name="viewport" content="initial-scale=1, width=device-width" />
                    </Head>
                    <Component {...pageProps} />
                    <ToastContainer icon={false} closeButton={<></>} />
                </UserProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default MyApp;
