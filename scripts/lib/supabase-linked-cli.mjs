import fs from "node:fs";
import { spawnSync } from "node:child_process";

const DEFAULT_CLI_PATH = "/opt/homebrew/bin/supabase";

export function resolveSupabaseCli(environment = process.env) {
  const cliPath = environment.SUPABASE_CLI_PATH || DEFAULT_CLI_PATH;
  if (!fs.existsSync(cliPath)) {
    throw new Error(`Supabase CLI was not found at ${cliPath}`);
  }
  return cliPath;
}

export function quoteJsonb(value, label) {
  const serialized = JSON.stringify(value);
  const tag = `$singleton_${label}$`;
  if (serialized.includes(tag)) throw new Error(`JSON payload contains reserved SQL tag ${tag}`);
  return `${tag}${serialized}${tag}::jsonb`;
}

function parseCliJson(stdout) {
  const trimmed = stdout.trim();
  const objectStart = trimmed.indexOf("{");
  const arrayStart = trimmed.indexOf("[");
  const starts = [objectStart, arrayStart].filter((index) => index >= 0);
  if (starts.length === 0) throw new Error("Supabase CLI returned no JSON payload");
  const parsed = JSON.parse(trimmed.slice(Math.min(...starts)));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.rows)) return parsed.rows;
  throw new Error("Supabase CLI JSON payload has no rows array");
}

export function linkedQuery(sql, options = {}) {
  const cliPath = options.cliPath ?? resolveSupabaseCli(options.environment);
  const result = spawnSync(
    cliPath,
    [
      "db",
      "query",
      "--linked",
      "--workdir",
      options.root ?? process.cwd(),
      "--output",
      "json",
      "--agent=yes",
      sql,
    ],
    {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      env: options.environment ?? process.env,
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Supabase CLI query failed").trim());
  }
  return parseCliJson(result.stdout);
}
