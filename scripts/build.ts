#!/usr/bin/env bun

import { build } from "bun";
import { generatePages } from "./generatePages";
import fs from "node:fs/promises";

import { BunImageTransformPlugin } from "bun-image-transform";

async function main() {
  console.log("🚀 Starting build process...");

  try {
    const cleanup = await generatePages();

    // Build index.html first
    console.log("📄 Building index.html...");
    const indexResult = await build({
      entrypoints: ["./src/_generated_index.html"],
      outdir: "./dist",
      sourcemap: "external",
      target: "browser",
      //   minify: true,
      define: {
        "process.env.NODE_ENV": '"development"',
      },
      env: "inline",
    });

    // Build 404.html second
    console.log("📄 Building 404.html...");
    const notFoundResult = await build({
      entrypoints: ["./src/_generated_404.html"],
      outdir: "./dist",
      sourcemap: "external",
      target: "browser",
      //   minify: true,
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      env: "BUN_PUBLIC_*",
      plugins: [BunImageTransformPlugin()],
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

    // rename _generated_index.html to index.html
    await fs.rename("./dist/_generated_index.html", "./dist/index.html");
    // rename _generated_404.html to 404.html
    await fs.rename("./dist/_generated_404.html", "./dist/404.html");

    await cleanup();

    console.log("📁 Output directory: ./dist");

    process.exit(0);
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

main();
