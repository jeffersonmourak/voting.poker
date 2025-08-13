/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { hydrateRoot, createRoot } from "react-dom/client";
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
	const root =
		import.meta.hot.data.root ??
		hydrateRoot(elem, app, {
			onRecoverableError(error) {},
		});
	// root.render(app);
} else {
	// The hot module reloading API is not available in production.
	hydrateRoot(elem, app);
}
