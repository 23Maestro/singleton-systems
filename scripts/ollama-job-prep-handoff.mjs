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
const model = argValue("--model") || "gemma4:31b-cloud";
const leadText = leadFile ? fs.readFileSync(leadFile, "utf8") : readStdin();

if (!leadText.trim()) {
  console.error("Pass lead data with --lead-file path or stdin.");
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

const result = spawnSync("ollama", ["run", model, "--hidethinking", "--think", "false", "--nowordwrap"], {
  cwd: process.cwd(),
  input: prompt,
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 20,
});

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
