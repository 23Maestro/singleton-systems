import fs from "node:fs/promises";
import sharp from "sharp";

// One outlined master keeps browser, Apple and PWA icons identical and font-free.
const light = await fs.readFile("public/ledger/mark-light.svg", "utf8");
// Replace independently so background and glyph colors do not collide.
const darkMark = light.replace('fill="#fff"', 'fill="BACKGROUND"').replaceAll('#08090b', '#ffffff').replace('BACKGROUND', '#08090b');
await fs.writeFile("public/ledger/mark-dark.svg", darkMark);
const adaptive = light.replace('<rect ', '<style>@media(prefers-color-scheme:dark){.tile{fill:#08090b}.ink{fill:#fff}.star{stroke:#fff}}</style><rect class="tile" ').replace('<g fill=', '<g class="ink" fill=').replace('<g stroke=', '<g class="star" stroke=');
await fs.writeFile("app/icon.svg", adaptive);
for (const path of ["app/apple-icon.svg", "public/apple-icon.svg"]) await fs.writeFile(path, darkMark);
for (const size of [192, 512]) await sharp(Buffer.from(darkMark)).resize(size, size).png().toFile(`public/ledger/ledger-${size}.png`);
await sharp(Buffer.from(darkMark)).resize(180, 180).png().toFile("public/ledger/apple-touch-icon.png");
const png = await sharp(Buffer.from(darkMark)).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22); header.writeUInt16LE(1,2); header.writeUInt16LE(1,4); header[6]=48; header[7]=48; header.writeUInt16LE(1,10); header.writeUInt16LE(32,12); header.writeUInt32LE(png.length,14); header.writeUInt32LE(22,18);
const favicon = Buffer.concat([header,png]);
for (const path of ["app/favicon.ico", "public/ledger/favicon.ico"]) await fs.writeFile(path, favicon);
console.log("Generated SVG, 48px ICO, 180px Apple, and 192/512px app icons.");
