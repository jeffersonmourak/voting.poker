import React from 'react';
import Document, {Html, Head, Main, NextScript} from 'next/document';
import {ServerStyleSheets} from '@mui/styles';

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <meta name="theme-color" content="#000" />
                    <meta name="viewport" content="initial-scale=1, width=device-width" />
                    <link
                        rel="preload"
                        href="/fonts/MonumentGrotesk-Mono/MonumentGrotesk-Mono.woff2"
                        as="font"
                        crossOrigin=""
                    />
                    <link
                        rel="preload"
                        href="/fonts/MonumentGrotesk-Mono/MonumentGrotesk-Mono.woff"
                        as="font"
                        crossOrigin=""
                    />
                    <link
                        rel="preload"
                        href="/fonts/MonumentGrotesk-Mono/MonumentGrotesk-Mono.ttf"
                        as="font"
                        crossOrigin=""
                    />
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@900&display=swap"
                        rel="stylesheet"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

MyDocument.getInitialProps = async (ctx) => {
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
        });

    const initialProps = await Document.getInitialProps(ctx);

    return {
        ...initialProps,
        // Styles fragment is rendered after the app and page rendering finish.
        styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
    };
};
