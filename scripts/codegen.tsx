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
import type { FunctionComponent } from "react";

function createEmotionCache() {
	return createCache({ key: "css" });
}

type NameMeta = {
	name: string;
	content: string;
};

type PropertyMeta = {
	property: string;
	content: string;
};

export type Meta = NameMeta | PropertyMeta;

type RenderFullPageProps = {
	bootstrapScripts?: string[];
	title?: string;
	meta?: Meta[];
	appendHead?: string;
};

function renderFullPage(
	html: string,
	css: string,
	{
		bootstrapScripts = [],
		title = "Voting Poker",
		meta = [],
		appendHead = "",
	}: RenderFullPageProps,
) {
	return `
      <!DOCTYPE html>
      <html>
        <head>
          <!-- This is an auto-generated file. Do not edit. -->
          <meta charset="utf-8" />
          <title>${title}</title>
          ${appendHead}
          ${meta.map((m) => `<meta ${"property" in m ? `property="${m.property}"` : `name="${m.name}"`} content="${m.content}" />`).join("\n")}
          ${css}
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link rel="stylesheet" href="./globals.css" />
		  <link rel="icon" href="./favicon.ico" type="image/x-icon" sizes="101x100" />
        </head>
        <body>
          <div id="root">${html}</div>
          ${bootstrapScripts.map((script) => `<script type="module" src="${script}"></script>`).join("\n")}
        </body>
      </html>
    `;
}

export async function generateStaticHTML(
	Page: FunctionComponent,
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
				<Page />
			</ThemeProvider>
		</CacheProvider>,
	).replaceAll(path.resolve(__dirname, "../src"), ".");

	// Grab the CSS from emotion
	const emotionChunks = extractCriticalToChunks(html);
	const emotionCss = constructStyleTagsFromChunks(emotionChunks);

	await Bun.write(filename, renderFullPage(html, emotionCss, props));
}
