import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceRoot = "/Users/singleton23/Library/Mobile Documents/com~apple~CloudDocs/Downloads";
const outputRoot = path.resolve("cavalry/assets/researchers");

const sources = [
  ["researcher-01", "Researcher1/vecteezy_black-and-white-artwork-of-an-employee_49045472.jpg"],
  ["researcher-02", "Researcher2/vecteezy_distinguished-elderly-man-with-glasses-artistic-portrait_55281705.jpg"],
  ["researcher-03", "Researcher3/vecteezy_vintage-man-portrait-silhouette-ideal-for-art-prints-and_55276604.jpg"],
  ["researcher-04", "Researcher4/vecteezy_retro-man-writing-with-glasses-art-illustration-for-vintage_55284803.jpg"],
];

await fs.mkdir(outputRoot, { recursive: true });

for (const [name, relativeSource] of sources) {
  const source = path.join(sourceRoot, relativeSource);
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luminance = (red + green + blue) / 3;

    // Convert the JPG's white paper to alpha while preserving a little ink
    // softness around the etched lines.
    data[index + 3] = luminance >= 248 ? 0 : Math.min(255, Math.max(0, (248 - luminance) * 1.22));
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(path.join(outputRoot, `${name}.png`));
}

console.log(`Prepared ${sources.length} transparent researcher assets in ${outputRoot}`);
