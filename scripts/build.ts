#!/usr/bin/env bun

import { build } from "bun";
import { generateStaticHTML, type Meta } from "./homepage-codegen";
import App from "@/App";
import path from "node:path";

// const BASE_URL = "https://voting.poker";
const BASE_URL = "https://jeffersonmourak.com/voting.poker";

async function bundleMeta(metaList: Meta[]) {
  const bundledMeta: Meta[] = [];
  const toBeDeleted = new Set<string>();

  for (const metaItem of metaList) {
    const key = "name" in metaItem ? metaItem.name : metaItem.property;

    if (!key.endsWith("image") && !key.endsWith("icon")) {
      bundledMeta.push(metaItem);
      continue;
    }

    const contentPath = path.resolve(__dirname, metaItem.content);

    const bundleResult = await build({
      entrypoints: [contentPath],
      outdir: "./dist",
      loader: {
        ".png": "file",
      },
    });

    const [entryPoint, result] = bundleResult.outputs;

    const dirPath = path.dirname(result.path);

    bundledMeta.push({
      ...metaItem,
      content: result.path.replace(dirPath, BASE_URL),
    });

    toBeDeleted.add(entryPoint.path);
  }

  return [bundledMeta, Array.from(toBeDeleted)] as const;
}

async function main() {
  console.log("🚀 Starting build process...");

  try {
    // First, generate the HTML files using homepage-codegen
    console.log("📝 Generating HTML files...");

    const SEOMeta = [
      {
        name: "description",
        content:
          "Voting Poker is an open-source, real-time, collaborative voting tool for remote teams.",
      },
      {
        property: "og:title",
        content: "Voting Poker",
      },
      {
        property: "og:description",
        content:
          "Voting Poker is an open-source, real-time, collaborative voting tool for remote teams.",
      },
      {
        property: "og:url",
        content: BASE_URL,
      },
      {
        property: "og:site_name",
        content: "Voting Poker",
      },
      {
        property: "og:image",
        content: "../src/assets/OG/OpenGraphFigure.png",
      },
      {
        property: "og:image:width",
        content: "800",
      },
      {
        property: "og:image:alt",
        content: "Voting Poker",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:description",
        content:
          "Voting Poker is an open-source, real-time, collaborative voting tool for remote teams.",
      },
      {
        name: "twitter:image",
        content: "../src/assets/OG/OpenGraphFigure.png",
      },
      {
        name: "twitter:image:width",
        content: "800",
      },
      {
        name: "twitter:image:height",
        content: "400",
      },
      {
        name: "twitter:image:alt",
        content: "Voting Poker",
      },
      {
        name: "link:icon",
        content: "../src/favicon.ico",
      },
    ];

    const [bundleList, cleanupFilesList] = await bundleMeta(SEOMeta);

    const indexPath = path.resolve(__dirname, "../src/index.html");
    const notFoundPath = path.resolve(__dirname, "../src/404.html");

    cleanupFilesList.push(indexPath, notFoundPath);

    console.log("📝 Generating index.html...");
    await generateStaticHTML(App, indexPath, {
      bootstrapScripts: ["./frontend.tsx"],
      meta: bundleList,
    });

    console.log("📝 Generating 404.html...");
    await generateStaticHTML(() => "Hello 404", notFoundPath);

    console.log("✅ HTML files generated successfully!");

    // Build index.html first
    console.log("📄 Building index.html...");
    const indexResult = await build({
      entrypoints: ["./src/index.html"],
      outdir: "./dist",
      sourcemap: "external",
      target: "browser",
      //   minify: true,
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      env: "BUN_PUBLIC_*",
    });

    // Build 404.html second
    console.log("📄 Building 404.html...");
    const notFoundResult = await build({
      entrypoints: ["./src/404.html"],
      outdir: "./dist",
      sourcemap: "external",
      target: "browser",
      //   minify: true,
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      env: "BUN_PUBLIC_*",
    });

    console.log("✅ Build completed successfully!");
    console.log("📁 Output directory: ./dist");

    if (indexResult.outputs) {
      console.log(
        `📄 Generated ${indexResult.outputs.length} files from index.html`
      );
    }

    if (notFoundResult.outputs) {
      console.log(
        `📄 Generated ${notFoundResult.outputs.length} files from 404.html`
      );
    }

    console.log("🧹 Cleaning up...");
    for (const file of cleanupFilesList) {
      await Bun.file(file).delete();
    }

    console.log("✅ Cleanup completed successfully!");
    console.log("📁 Output directory: ./dist");

    process.exit(0);
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

main();
