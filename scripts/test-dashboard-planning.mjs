import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";

// The rendered app uses its real fetch path. Tests stub only the public HTTP owner boundary.
const root = process.cwd();
const output = path.join(root, ".scratch/dashboard-planning-tests");
await mkdir(output, { recursive: true });
async function run(args, env = process.env) {
  const child = spawn(process.execPath, args, { cwd: root, env, stdio: "inherit" });
  await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Check exited ${code}`)));
  });
}
await build({
  entryPoints: ["tools/dashboard-preview/owner-test.tsx"], bundle: true,
  outfile: path.join(output, "app.js"), jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' }, tsconfig: "tsconfig.json",
});
await run(["node_modules/tailwindcss/lib/cli.js", "-i", "tools/dashboard-preview/preview.css", "-o", path.join(output, "app.css"), "--minify"]);
const css = await Promise.all([path.join(output, "app.css"), ...["command-center.css", "shadcn.css", "visual-refresh.css"].map((file) => path.join(root, "app/command-center", file))].map((file) => readFile(file, "utf8")));
await writeFile(path.join(output, "app.css"), css.join("\n"));
const server = createServer(async (request, response) => {
  const file = request.url?.split("?")[0];
  if (file === "/") {
    response.setHeader("Content-Type", "text/html");
    response.end('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script src="/app.js"></script></body></html>');
  } else if (file === "/app.js" || file === "/app.css") {
    response.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : "text/css");
    response.end(await readFile(path.join(output, file.slice(1))));
  } else { response.writeHead(404); response.end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  await run(["node_modules/@playwright/test/cli.js", "test", process.env.DASHBOARD_TEST_FILE ?? "tools/dashboard-preview/planning.test.mjs", "--workers=1", "--reporter=line", "--timeout=10000", ...process.argv.slice(2)], {
    ...process.env, DASHBOARD_OWNER_TEST_URL: `http://127.0.0.1:${server.address().port}`,
  });
} finally { await new Promise((resolve) => server.close(resolve)); }
