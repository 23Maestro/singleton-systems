import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const outputDir =
  process.env.FUTURE_VOICES_GRAPHICS_DIR ??
  "/Volumes/MediaSSD/05_FINISHED/Future Voices/Social/Graphics";

const compositions = [
  ["FutureVoicesCalloutAlgae", "01-algae-in-the-reflecting-pool-alpha.mov"],
  [
    "FutureVoicesCalloutBiggerThanOnePool",
    "02-bigger-than-one-reflecting-pool-alpha.mov",
  ],
  ["FutureVoicesCalloutLakesAndOceans", "03-all-our-lakes-and-oceans-alpha.mov"],
  ["FutureVoicesCalloutBiggerProblem", "04-bigger-problem-than-people-realize-alpha.mov"],
];

mkdirSync(outputDir, { recursive: true });

for (const [composition, filename] of compositions) {
  const outputPath = path.join(outputDir, filename);
  const result = spawnSync(
    path.resolve("node_modules/.bin/remotion"),
    [
      "render",
      "remotion/index.ts",
      composition,
      outputPath,
      "--codec=prores",
      "--prores-profile=4444",
      "--pixel-format=yuva444p10le",
      "--image-format=png",
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Rendered ${compositions.length} transparent callouts to ${outputDir}`);
