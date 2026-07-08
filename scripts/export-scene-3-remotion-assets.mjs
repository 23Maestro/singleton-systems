import { mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderFrames, selectComposition } from "@remotion/renderer";

const root = process.cwd();
const entryPoint = path.join(root, "remotion/index.ts");
const outputRoot = path.join(root, "output/scene-3");
const textDir = path.join(outputRoot, "food-mania-text-sequence");

await rm(outputRoot, { recursive: true, force: true });
await mkdir(textDir, { recursive: true });

console.log("Bundling Remotion project...");
const serveUrl = await bundle({
  entryPoint,
  onProgress: (progress) => {
    if (progress === 1) console.log("Bundle complete.");
  },
});

const composition = await selectComposition({
  serveUrl,
  id: "FoodManiaTextLayer",
  inputProps: {},
});

console.log("Rendering Scene 3 food mania text sequence...");
await renderFrames({
  serveUrl,
  composition,
  outputDir: textDir,
  inputProps: {},
  imageFormat: "png",
  frameRange: [0, 149],
  concurrency: 5,
  onStart: ({ frameCount }) => console.log(`Rendering ${frameCount} text frames...`),
  onFrameUpdate: (framesRendered) => {
    if (framesRendered % 30 === 0 || framesRendered === 150) {
      console.log(`Rendered ${framesRendered}/150 text frames`);
    }
  },
});

const renderedFrames = await readdir(textDir);
await Promise.all(
  renderedFrames
    .filter((frame) => frame.startsWith("element-") && frame.endsWith(".png"))
    .map((frame) => {
      const number = frame.match(/\d+/)?.[0] ?? "0";
      return rename(
        path.join(textDir, frame),
        path.join(textDir, `food-mania-${number.padStart(3, "0")}.png`),
      );
    }),
);

console.log(`Scene 3 Remotion assets exported to ${outputRoot}`);
