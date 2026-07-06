import fs from "node:fs";
import path from "node:path";
import React from "react";
import satori from "satori";

const root = process.cwd();
const views = [
  "ai_workflow_readme_map",
  "scouting_coordinator_bucket_map",
  "resume_timeline_map",
  "review_first_implementation_loop",
];
const viewConfig = {
  ai_workflow_readme_map: {
    width: 1200,
    height: 1544,
    padding: 28,
    fit: "contain",
  },
  scouting_coordinator_bucket_map: {
    width: 1600,
    height: 980,
    padding: 32,
    fit: "contain",
  },
  resume_timeline_map: {
    width: 1600,
    height: 980,
    padding: 32,
    fit: "contain",
  },
  review_first_implementation_loop: {
    width: 1600,
    height: 980,
    padding: 32,
    fit: "contain",
  },
};
const schemes = [
  {
    name: "light",
    page: "#f8fafc",
    panel: "#ffffff",
    border: "#dfe7f1",
  },
  {
    name: "dark",
    page: "#07080a",
    panel: "#101114",
    border: "#292b31",
  },
];

const outRoot = path.join(root, "public/portfolio/likec4-static");

function imageDataUri(file) {
  const png = fs.readFileSync(file);
  return `data:image/png;base64,${png.toString("base64")}`;
}

fs.rmSync(outRoot, { recursive: true, force: true });

for (const scheme of schemes) {
  const outDir = path.join(outRoot, scheme.name);
  fs.mkdirSync(outDir, { recursive: true });

  for (const view of views) {
    const config = viewConfig[view];
    const width = config.width;
    const height = config.height;
    const padding = config.padding;
    const src = path.join(root, `public/portfolio/likec4-${scheme.name}/${view}.png`);
    const svg = await satori(
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            width,
            height,
            padding,
            backgroundColor: scheme.page,
            alignItems: "center",
            justifyContent: "center",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              width: "100%",
              height: "100%",
              backgroundColor: scheme.panel,
              border: `2px solid ${scheme.border}`,
              borderRadius: 34,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            },
          },
          React.createElement("img", {
            src: imageDataUri(src),
            width: width - padding * 2,
            height: height - padding * 2,
            style: {
              objectFit: config.fit,
            },
          }),
        ),
      ),
      { width, height },
    );

    fs.writeFileSync(path.join(outDir, `${view}.svg`), svg);
  }
}

console.log(`Generated ${views.length * schemes.length} LikeC4 static SVG wrappers in ${path.relative(root, outRoot)}`);
