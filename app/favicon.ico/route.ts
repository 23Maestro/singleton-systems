import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const favicon = await readFile(path.join(process.cwd(), "public/ledger/favicon.ico"));
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
