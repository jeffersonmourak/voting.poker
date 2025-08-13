import { BASE_URL } from "@/constants";
import { generateStaticHTML, type Meta } from "./codegen";
import App from "@/App";
import Session from "@/Session";
import { build } from "bun";
import path from "node:path";

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

export async function generatePages() {
  // First, generate the HTML files using codegen
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

  const indexPath = path.resolve(__dirname, "../src/_generated_index.html");
  const notFoundPath = path.resolve(__dirname, "../src/_generated_404.html");

  cleanupFilesList.push(indexPath, notFoundPath);

  console.log("📝 Generating index.html...");
  await generateStaticHTML(App, indexPath, {
    bootstrapScripts: ["./home-bootstrap.tsx"],
    meta: bundleList,
  });

  console.log("📝 Generating 404.html...");
  await generateStaticHTML(Session, notFoundPath, {
    bootstrapScripts: ["./session-bootstrap.tsx"],
    meta: bundleList,
  });

  console.log("✅ HTML files generated successfully!");

  return async () => {
    console.log("🧹 Cleaning up...");
    for (const file of cleanupFilesList) {
      await Bun.file(file).delete();
    }

    console.log("✅ Cleanup completed successfully!");
  };
}
