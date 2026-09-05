import fs from "node:fs/promises";
import sharp from "sharp";

// Downloads are build-time only. The app always serves bundled assets.
const sources = {
  google: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
  figma: "https://static.figma.com/app/icon/2/favicon.svg",
  screenstudio: "https://screen.studio/icon.png",
  raycast: "https://raycast.com/favicon-production.png",
  brigit: "https://www.hellobrigit.com/wp-content/uploads/2026/06/cropped-BG-Do-not-export-12-192x192.png",
  albert: "https://albert.com/_next_public/assets/android-chrome-512x512.png",
  vola: "https://volafinance.com/_next/static/media/apple-touch-icon.7507e32a.png",
  hsn: "https://www.hsn.com/cassette.axd/file/apple-touch-icon-120x120-af968907bda9afbe9cfff7bc04e1ebb80a5fb806.png",
  discover: "https://www.discover.com/content/dam/discover/en_us/global/logos/discover-logo.svg",
  cashapp: "https://cdn.simpleicons.org/cashapp/00D64F",
};
const manifest = JSON.parse(await fs.readFile("lib/ledger/icon-sources.json", "utf8"));
for (const [id, url] of Object.entries(sources)) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(bytes).metadata();
    if (metadata.format !== "svg" && Math.min(metadata.width, metadata.height) < 96) throw new Error(`Too small: ${metadata.width}×${metadata.height}`);
    const file = `${id}-hq.${metadata.format === "svg" ? "svg" : "png"}`;
    await fs.writeFile(`public/ledger/icons/${file}`, metadata.format === "svg" ? bytes : await sharp(bytes).png().toBuffer());
    Object.assign(manifest.find(a => a.id === id), { file, assetSource: url, width: metadata.width, height: metadata.height });
    console.log(`${id}: ${metadata.format} ${metadata.width}×${metadata.height}`);
  } catch (error) { console.error(`${id}: ${error.message}`); process.exitCode = 1; }
}
for (const file of ["lib/ledger/icon-sources.json", "public/ledger/icons/sources.json"]) await fs.writeFile(file, JSON.stringify(manifest, null, 2) + "\n");
