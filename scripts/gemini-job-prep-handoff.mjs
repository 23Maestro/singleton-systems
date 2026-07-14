#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);

function argValue(name) {
  const index = args.indexOf(name);
  return index === -1 ? "" : args[index + 1] || "";
}

function readStdin() {
  if (process.stdin.isTTY) {
    return "";
  }
  return fs.readFileSync(0, "utf8");
}

const leadFile = argValue("--lead-file");
const outFile = argValue("--out");
const model = argValue("--model") || "gemini-2.5-flash";
const leadText = leadFile ? fs.readFileSync(leadFile, "utf8") : readStdin();
const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
const hasVertexConfig = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true" &&
  Boolean(process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION);

if (!leadText.trim()) {
  console.error("Pass lead data with --lead-file path or stdin.");
  process.exit(2);
}

if (!hasApiKey && !hasVertexConfig) {
  console.error([
    "Gemini CLI auth is not configured for headless use.",
    "Set GEMINI_API_KEY from Google AI Studio, or configure Vertex with GOOGLE_GENAI_USE_VERTEXAI=true, GOOGLE_CLOUD_PROJECT, and GOOGLE_CLOUD_LOCATION.",
    "Google-account Gemini Code Assist auth is no longer a viable headless path for this setup.",
  ].join("\n"));
  process.exit(2);
}

const prompt = [
  "You are a local job-application prep handoff agent for Jerami Singleton.",
  "Do not apply to jobs, send email, invent experience, or mutate files.",
  "Use the lead data plus the resume facts below to produce a manual prep packet.",
  "",
  "Resume facts:",
  "- AI-assisted workflow systems, Raycast command surfaces, FastAPI adapters, Supabase source-of-truth contracts, prompt/output review, audit scripts.",
  "- High-volume video editing, course migration, FFmpeg, transcript/naming/encoding/QC workflows, broadcast production.",
  "- Strong lanes: AI workflow specialist, workflow automation, creative/content/media operations, educational video, post production coordinator, digital asset management.",
  "",
  "Return Markdown with:",
  "1. Gate verdict: apply, verify first, or skip.",
  "2. Remote/local verification notes, including any hidden location preference risk.",
  "3. Why this matches the resume.",
  "4. Resume bullet angle, grounded only in the facts above.",
  "5. Short casual cover note angle.",
  "6. Questions to answer before manual application.",
  "",
  "Lead data:",
  leadText.trim(),
].join("\n");

const result = spawnSync(
  "gemini",
  [
    "--skip-trust",
    "--approval-mode",
    "plan",
    "--model",
    model,
    "--prompt",
    prompt,
  ],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      GEMINI_CLI_TRUST_WORKSPACE: "true",
    },
    maxBuffer: 1024 * 1024 * 20,
  }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  process.exit(result.status || 1);
}

if (outFile) {
  fs.writeFileSync(outFile, result.stdout);
} else {
  process.stdout.write(result.stdout);
}
