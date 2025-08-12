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

type RenderFullPageProps = {
	bootstrapScripts?: string[];
	title?: string;
};

function renderFullPage(
	html: string,
	css: string,
	{ bootstrapScripts = [], title = "Voting Poker" }: RenderFullPageProps,
) {
	return `
      <!DOCTYPE html>
      <html>
        <head>
          <!-- This is an auto-generated file. Do not edit. -->
          <meta charset="utf-8" />
          <title>${title}</title>
          ${css}
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link rel="stylesheet" href="./globals.css" />
        </head>
        <body>
          <div id="root">${html}</div>
          ${bootstrapScripts.map((script) => `<script type="module" src="${script}"></script>`).join("\n")}
        </body>
      </html>
    `;
}

async function generateStaticHTML(
	page: React.ReactNode,
	filename: string,
	props: RenderFullPageProps = {},
) {
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
				{page}
			</ThemeProvider>
		</CacheProvider>,
	).replaceAll(path.resolve(__dirname, "../src"), ".");

	// Grab the CSS from emotion
	const emotionChunks = extractCriticalToChunks(html);
	const emotionCss = constructStyleTagsFromChunks(emotionChunks);

	await Bun.write(`src/${filename}`, renderFullPage(html, emotionCss, props));
}

generateStaticHTML(<App />, "index.html", {
	bootstrapScripts: ["./frontend.tsx"],
}).catch(console.error);
generateStaticHTML(<>Hello 404</>, "404.html").catch(console.error);
