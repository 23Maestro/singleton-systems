import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";

export async function GET() {
  const html = await readFile(path.join(process.cwd(), "public", "visual-maps", "index.html"), "utf8");

  return new Response(html, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
