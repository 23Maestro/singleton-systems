import http from "node:http";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const data = JSON.parse(input);
const tables = {
  cerebral_routes: data.routes,
  harness_skills: data.skills,
  harness_capabilities: data.capabilities,
};
const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const table = url.pathname.replace(/^\/rest\/v1\//, "");
  if (request.method !== "GET" || !tables[table]) {
    response.writeHead(404).end();
    return;
  }
  let rows = tables[table];
  if (url.searchParams.get("enabled") === "eq.true") rows = rows.filter((row) => row.enabled);
  if (url.searchParams.get("activation") === "eq.core") rows = rows.filter((row) => row.activation === "core");
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(rows));
});
server.listen(0, "127.0.0.1", () => console.log(`http://127.0.0.1:${server.address().port}`));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
