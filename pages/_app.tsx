import {AppProps} from 'next/app';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import '../styles/globals.css';
import {theme} from '@root/shared/theme';
import createEmotionCache from '@root/shared/createEmotionCache';
import {CacheProvider} from '@emotion/react';
import {UserProvider} from '@root/shared/components/UserProvider';

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
                    <Component {...pageProps} />
                </UserProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default MyApp;
