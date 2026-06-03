/**
 * Client entry for the room SPA. Served via `404.html` (the GitHub Pages
 * fallback that backs every `/<roomId>` URL); mounts the Session tree
 * into #root.
 */

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import Session from "./Session";

const elem = document.getElementById("root");
if (!elem) {
	throw new Error("Root element not found");
}

const app = (
	<StrictMode>
		<Session />
	</StrictMode>
);

if (import.meta.hot) {
	// With hot module reloading, `import.meta.hot.data` is persisted.
	const root = import.meta.hot.data.root ?? createRoot(elem);
	root.render(app);
} else {
	// The hot module reloading API is not available in production.
	createRoot(elem).render(app);
}
