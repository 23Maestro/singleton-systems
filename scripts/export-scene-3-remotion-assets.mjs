import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const root = process.cwd();
const entryPoint = path.join(root, "remotion/index.ts");
const outputRoot = path.join(root, "output/scene-3");
const labelsDir = path.join(outputRoot, "labels");
const labels = ["hoarded", "hid", "recipes"];

await rm(labelsDir, { recursive: true, force: true });
await mkdir(labelsDir, { recursive: true });

console.log("Bundling Remotion project...");
const serveUrl = await bundle({
  entryPoint,
  onProgress: (progress) => {
    if (progress === 1) console.log("Bundle complete.");
  },
});

for (const label of labels) {
  const composition = await selectComposition({
    serveUrl,
    id: `FoodManiaLabel-${label}`,
    inputProps: {},
  });

  const output = path.join(labelsDir, `${label}.png`);
  console.log(`Rendering Scene 3 label texture: ${label}`);
  await renderStill({
    serveUrl,
    composition,
    inputProps: {},
    output,
    imageFormat: "png",
    frame: 0,
  });
}

console.log(`Scene 3 Remotion label textures exported to ${labelsDir}`);
