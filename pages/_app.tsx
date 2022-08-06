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
import type { NextWebVitalsMetric } from "next/app";

import 'react-toastify/dist/ReactToastify.css';
import {DataCollectionNotification} from '@root/shared/components/DataCollectionNotification';
import {AnalyticsProvider} from '@root/shared/components/AnalyticsProvider';
import { event } from '../shared/analytics'
 
const clientSideEmotionCache = createEmotionCache();

export function reportWebVitals({id, name, label, value}: NextWebVitalsMetric) {
    event({
        action: name,
        category: label,
        value: Math.round(name === "CLS" ? value * 1000 : value),
        label: id,
        nonInteraction: true,
    });
}


function MyApp({
    Component,
    pageProps,
    emotionCache = clientSideEmotionCache,
}: AppProps & {emotionCache?: any}) {
    return (
        <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
                <AnalyticsProvider>
                    <UserProvider>
                        <CssBaseline />
                        <Head>
                            <title> Voting Poker </title>
                            <meta name="viewport" content="initial-scale=1, width=device-width" />
                        </Head>
                        <Component {...pageProps} />
                        <ToastContainer icon={false} closeButton={<></>} />
                        <DataCollectionNotification />
                    </UserProvider>
                </AnalyticsProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default MyApp;
