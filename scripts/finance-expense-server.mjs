import { createServer } from "node:http";
import { Readable } from "node:stream";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { realpathSync, statfsSync } from "node:fs";
import path from "node:path";
import { createExpenseReview } from "../lib/ledger/expense-review.ts";
import { createExpenseHttp } from "../lib/ledger/expense-http.ts";
import { interpretExpenseImages } from "../lib/ledger/codex-expense-parser.mjs";
import { todayISO } from "../lib/ledger/dates.ts";
import { createShareHttp } from "../lib/codex-share/http.mjs";
import { startSharedThread } from "../lib/codex-share/start-thread.mjs";

const cwd = path.resolve(import.meta.dirname, "..");
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tailscale = JSON.parse(execFileSync("tailscale", ["status", "--json"], { encoding: "utf8" }));
const login = tailscale.User?.[tailscale.Self?.UserID]?.LoginName;
if (tailscale.BackendState !== "Running" || !login) throw new Error("Tailscale owner identity is unavailable.");
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
async function db(endpoint, body) {
  if (!url || !key) throw new Error("Finance server connection is unavailable.");
  const response = await fetch(`${url}/rest/v1/${endpoint}`, { headers, ...(body ? { method: "POST", body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Finance database request failed.");
  return response.json();
}
const read = async () => {
  const rows = await db("finance_ledger_state?id=eq.personal&select=data,revision");
  if (!rows?.[0]) throw new Error("Finance ledger is unavailable.");
  return rows[0];
};
const review = createExpenseReview({ read, commit: input => db("rpc/commit_finance_ledger", input) });
function checkStorage() {
  execFileSync("node", ["scripts/developer-storage/storage-gate.mjs", "route", "--client", "SINGLETON_SYSTEMS", "--kind", "references"], { cwd, stdio: "ignore" });
  if (realpathSync("/Volumes/HomeSSD") !== "/Volumes/HomeSSD") throw new Error("HomeSSD is unavailable.");
  const disk = statfsSync("/Volumes/HomeSSD");
  if (Number(disk.bavail) * Number(disk.bsize) < 100_000_000) throw new Error("HomeSSD needs free space.");
}
async function writeImages(images, root) {
  checkStorage();
  await mkdir(root, { recursive: true, mode: 0o700 });
  const folder = await mkdtemp(path.join(root, "batch-"));
  const paths = [];
  for (let i = 0; i < images.length; i++) {
    const bytes = Buffer.from(images[i], "base64");
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (!jpeg && !png) throw new Error("Use JPEG or PNG screenshots.");
    const file = path.join(folder, `${i}.${jpeg ? "jpg" : "png"}`);
    await writeFile(file, bytes, { mode: 0o600, flag: "wx" }); paths.push(file);
  }
  return { folder, paths };
}
async function parseImages(images, note) {
  const root = "/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/references/codex-shares";
  const { paths } = await writeImages(images, root);
  return interpretExpenseImages({ paths, note, today: todayISO(), cwd });
}
const handle = createExpenseHttp({ login, review, parseImages });
const share = createShareHttp({ login,
  saveImages: async images => (await writeImages(images, "/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/references/codex-shares")).paths,
  startThread: input => startSharedThread({ ...input, cwd }),
  prepareExpenses: async (images, note) => review.prepare(await parseImages(images, note)) });
const port = Number(process.env.FINANCE_EXPENSE_PORT || 43871);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid service port.");
const server = createServer(async (incoming, outgoing) => {
  try {
    const request = new Request(`http://127.0.0.1:${port}${incoming.url}`, { method: incoming.method, headers: incoming.headers,
      ...(incoming.method === "GET" || incoming.method === "HEAD" ? {} : { body: Readable.toWeb(incoming), duplex: "half" }) });
    const result = await (new URL(request.url).pathname === "/share" ? share(request) : handle(request));
    outgoing.writeHead(result.status, Object.fromEntries(result.headers));
    outgoing.end(Buffer.from(await result.arrayBuffer()));
  } catch { if (!outgoing.headersSent) outgoing.writeHead(500); outgoing.end(); }
});
server.listen(port, "127.0.0.1", () => console.log(`Finance expense service listening on loopback port ${port}.`));
