/**
 * Client entry for the landing page (`index.html`): mounts the App
 * (Home) tree into #root.
 */

import { hydrateRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./App";

const elem = document.getElementById("root");
if (!elem) {
	throw new Error("Root element not found");
}

const app = (
	<StrictMode>
		<App />
	</StrictMode>
);

if (import.meta.hot) {
	// With hot module reloading, `import.meta.hot.data` is persisted.
	const root = import.meta.hot.data.root ?? hydrateRoot(elem, app);
} else {
	// The hot module reloading API is not available in production.
	hydrateRoot(elem, app);
}
