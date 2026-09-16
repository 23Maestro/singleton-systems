import fs from "node:fs/promises";
import sharp from "sharp";

// One clearly named, outlined source keeps browser, Vercel, Apple, and PWA icons identical.
const faviconSourcePath = "public/brand/singleton-systems-favicon.svg";
const faviconSource = await fs.readFile(faviconSourcePath, "utf8");

for (const size of [180, 192, 512]) {
  await sharp(Buffer.from(faviconSource))
    .resize(size, size)
    .png()
    .toFile(`public/brand/singleton-systems-favicon-${size}.png`);
}

const png = await sharp(Buffer.from(faviconSource)).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22); header.writeUInt16LE(1,2); header.writeUInt16LE(1,4); header[6]=48; header[7]=48; header.writeUInt16LE(1,10); header.writeUInt16LE(32,12); header.writeUInt32LE(png.length,14); header.writeUInt32LE(22,18);
const favicon = Buffer.concat([header,png]);
await fs.writeFile("public/brand/singleton-systems-favicon.ico", favicon);
console.log(`Generated favicon derivatives from ${faviconSourcePath}.`);
