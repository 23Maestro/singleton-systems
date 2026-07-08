import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderFrames, renderStill, selectComposition } from "@remotion/renderer";

const root = process.cwd();
const entryPoint = path.join(root, "remotion/index.ts");
const outputRoot = path.join(root, "output/scene-2");
const gridDir = path.join(outputRoot, "grid-sequence");
const calendarDir = path.join(outputRoot, "calendar");

await rm(outputRoot, { recursive: true, force: true });
await mkdir(gridDir, { recursive: true });
await mkdir(calendarDir, { recursive: true });

console.log("Bundling Remotion project...");
const serveUrl = await bundle({
  entryPoint,
  onProgress: (progress) => {
    if (progress === 1) console.log("Bundle complete.");
  },
});

const gridComposition = await selectComposition({
  serveUrl,
  id: "StarvationGridLayer",
  inputProps: {},
});

console.log("Rendering transparent starvation grid sequence...");
await renderFrames({
  serveUrl,
  composition: gridComposition,
  outputDir: gridDir,
  inputProps: {},
  imageFormat: "png",
  frameRange: [0, 179],
  concurrency: 5,
  onStart: ({ frameCount }) => console.log(`Rendering ${frameCount} grid frames...`),
  onFrameUpdate: (framesRendered) => {
    if (framesRendered % 30 === 0 || framesRendered === 180) {
      console.log(`Rendered ${framesRendered}/180 grid frames`);
    }
  },
});

for (let month = 1; month <= 6; month += 1) {
  const composition = await selectComposition({
    serveUrl,
    id: `CalendarMonth${month}`,
    inputProps: {},
  });
  const output = path.join(calendarDir, `month-${String(month).padStart(2, "0")}.png`);
  console.log(`Rendering calendar texture ${month}...`);
  await renderStill({
    serveUrl,
    composition,
    output,
    inputProps: {},
    imageFormat: "png",
  });
}

console.log(`Scene 2 Remotion assets exported to ${outputRoot}`);
