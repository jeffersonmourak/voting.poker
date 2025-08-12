import {
	renderToReadableStream,
	renderToStaticMarkup,
	renderToString,
} from "react-dom/server";
import App from "../src/App";
import path from "node:path";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";

import createCache from "@emotion/cache";
import theme from "../src/theme";

function createEmotionCache() {
	return createCache({ key: "css" });
}

function renderFullPage(html: string, css: string) {
	return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>My page</title>
          ${css}
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          />
          <link rel="stylesheet" href="./globals.css" />
        </head>
        <body>
          <div id="root">${html}</div>
          <script type="module" src="./frontend.tsx"></script>
        </body>
      </html>
    `;
}

async function generateHTML() {
	const cache = createEmotionCache();
	const { extractCriticalToChunks, constructStyleTagsFromChunks } =
		createEmotionServer(cache);

	// Render the component to a string.
	const html = renderToString(
		<CacheProvider value={cache}>
			<ThemeProvider theme={theme}>
				{/* CssBaseline kickstart an elegant, consistent, and simple baseline
            to build upon. */}
				<CssBaseline />
				<App />
			</ThemeProvider>
		</CacheProvider>,
	).replaceAll(path.resolve(__dirname, "../src"), ".");

	// Grab the CSS from emotion
	const emotionChunks = extractCriticalToChunks(html);
	const emotionCss = constructStyleTagsFromChunks(emotionChunks);

	await Bun.write("src/index.html", renderFullPage(html, emotionCss));
}

generateHTML().catch(console.error);
