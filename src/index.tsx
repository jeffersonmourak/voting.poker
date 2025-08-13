import { serve } from "bun";
import index from "./index.html";
import notFound from "./404.html";
import { generatePages } from "scripts/generatePages";

const server = serve({
	routes: {
		// Serve index.html for all unmatched routes.
		"/": index,
		"/*": notFound,
	},

	development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
