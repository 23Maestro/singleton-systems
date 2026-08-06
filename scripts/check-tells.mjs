#!/usr/bin/env node
// Greps changed markdown for AI writing tells.
// Source of truth for the word list: docs/harness/writing-rules.md
// Usage: node scripts/check-tells.mjs [file.md ...] | --all | --strict | --self-test
// Default: outward-facing artifact paths fail; internal repo docs are skipped.

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const RULES = "docs/harness/writing-rules.md";
const STRICT_PATHS = [
  /^docs\/outreach\//,
  /^docs\/offer\//,
  /^docs\/resumes\//,
  /^docs\/handoffs\//,
  /^docs\/portfolio\//,
  /^public\//,
  /^app\//,
];

// Files that legitimately contain the banned words because they define or mirror them.
const EXEMPT = new Set([RULES, "CLAUDE.md", "scripts/check-tells.mjs"]);

function isExempt(file) {
  return EXEMPT.has(file) || /(^|\/)writing-rules\.md$/.test(file);
}

function isStrictArtifact(file, forceStrict = false) {
  return forceStrict || STRICT_PATHS.some((re) => re.test(file));
}

function isScanned(file, forceStrict = false) {
  return isStrictArtifact(file, forceStrict);
}

function bannedWords() {
  const doc = readFileSync(RULES, "utf8");
  const m = doc.match(/\*\*Words\.\*\*([\s\S]*?)\n\n/);
  if (!m) throw new Error(`No "**Words.**" paragraph in ${RULES}`);
  return m[1]
    .replace(/\s+/g, " ")
    .split(",")
    .map((w) => w.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function phraseRules(words) {
  return [
    [new RegExp(`\\b(${words.join("|")})\\b`, "gi"), "banned word"],
    [/\bnot just\b[^.!?]{1,60}?\bbut\b/gi, "negative parallelism (not just X but Y)"],
    [/\bnot\b[^.!?]{1,40}?,\s*but\b/gi, "negative parallelism (not X, but Y)"],
    [/\brather than\b/gi, "negative parallelism (X rather than Y)"],
    [/\bserves as\b/gi, 'copula dodge (write "is")'],
    [/\bfeatures\s+(a|an|the|\d+|two|three|four|five|six|seven|eight|nine|ten)\b/gi, 'copula dodge (write "has")'],
    [/\b(experts|observers|analysts|critics)\s+(argue|say|note|have)\b/gi, "vague attribution"],
    [/\b(industry )?reports?\s+suggest\b/gi, "vague attribution"],
    [/\befforts are ongoing\b/gi, "vague attribution"],
    [/\bnestled in the\b|\bmarking a pivotal\b|\brich cultural\b/gi, "puffery"],
    [/^\s*[-*]\s*\*\*[^*]+\*\*:/gm, "bold inline list header"],
  ];
}

// Strips fenced code blocks so code identifiers don't trip the word list.
function stripCode(text) {
  return text.replace(/^```[\s\S]*?^```/gm, (block) => block.replace(/[^\n]/g, " "));
}

function titleCaseHeadings(text) {
  const hits = [];
  for (const [i, line] of text.split("\n").entries()) {
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (!h) continue;
    const words = h[1].split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
    const caps = words.filter((w) => /^[A-Z]/.test(w));
    if (words.length >= 3 && caps.length === words.length) {
      hits.push({ line: i + 1, rule: "Title Case Heading", text: h[1] });
    }
  }
  return hits;
}

function emDashDensity(text) {
  const sentences = text.split(/[.!?]\s/).filter((s) => s.trim().length > 20);
  if (sentences.length < 5) return null;
  const withDash = sentences.filter((s) => s.includes("—")).length;
  const pct = withDash / sentences.length;
  return pct > 0.3 ? Math.round(pct * 100) : null;
}

function scan(file, rules, options = {}) {
  const raw = readFileSync(file, "utf8");
  const text = stripCode(raw);
  const lines = text.split("\n");
  const hits = [];
  const level = "fail";

  for (const [re, label] of rules) {
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split("\n").length;
      hits.push({ line, rule: label, text: m[0].trim().slice(0, 60) });
    }
  }
  const warns = [];
  if (options.strict) warns.push(...titleCaseHeadings(text));
  const dash = emDashDensity(text);
  if (options.strict && dash) warns.push({ line: 1, rule: "em dash density", text: `${dash}% of sentences` });

  const tag = (arr, level) =>
    arr.sort((a, b) => a.line - b.line).map((h) => ({ ...h, file, level }));

  return [...tag(hits, level), ...tag(warns, "warn")];
}

function targets(argv) {
  if (argv.includes("--all")) {
    return execSync("git ls-files '*.md'", { encoding: "utf8" }).trim().split("\n");
  }
  const explicit = argv.filter((a) => a.endsWith(".md"));
  if (explicit.length) return explicit;
  const changed = execSync("git diff --name-only HEAD; git ls-files --others --exclude-standard", {
    encoding: "utf8",
  });
  return [...new Set(changed.trim().split("\n"))].filter((f) => f.endsWith(".md"));
}

function selfTest() {
  const rules = phraseRules(["delve", "showcase"]);
  const probe = (s) => rules.some(([re]) => (re.lastIndex = 0, re.test(s)));

  console.assert(probe("Let us delve into it."), "banned word missed");
  console.assert(probe("It serves as the entry point."), "serves as missed");
  console.assert(probe("It features four spaces."), "features+number missed");
  console.assert(probe("not a mirror, but a portal"), "not X but Y missed");
  console.assert(probe("Use a hook rather than a script."), "rather than missed");
  console.assert(probe("- **Thing**: explanation"), "bold list header missed");
  console.assert(!probe("The build has four steps."), "false positive on clean prose");
  console.assert(!probe("New features shipped today."), "false positive on noun 'features'");

  console.assert(titleCaseHeadings("## The Big Red Dog").length === 1, "title case missed");
  console.assert(titleCaseHeadings("## The build gate").length === 0, "title case false positive");

  const code = stripCode("```\ndelve\n```\nclean");
  console.assert(!/delve/.test(code), "code fence not stripped");

  console.log("check-tells self-test passed");
}

const argv = process.argv.slice(2);

if (argv.includes("--self-test")) {
  selfTest();
  process.exit(0);
}

if (!existsSync(RULES)) {
  console.error(`missing ${RULES}`);
  process.exit(1);
}

const rules = phraseRules(bannedWords());
const forceStrict = argv.includes("--strict");
const files = targets(argv).filter((f) => f && !isExempt(f) && existsSync(f) && isScanned(f, forceStrict));
const all = files.flatMap((f) => scan(f, rules, { strict: forceStrict }));

const fails = all.filter((h) => h.level === "fail");
const warns = all.filter((h) => h.level === "warn");

for (const h of warns) {
  console.log(`warn  ${h.file}:${h.line}  ${h.rule}  ->  ${h.text}`);
}

if (!fails.length) {
  console.log(`tells check passed: ${files.length} markdown file(s), ${warns.length} warning(s)`);
  process.exit(0);
}

for (const h of fails) {
  console.error(`${h.file}:${h.line}  ${h.rule}  ->  ${h.text}`);
}
console.error(`\n${fails.length} tell(s) in ${new Set(fails.map((h) => h.file)).size} file(s).`);
console.error(`Rules: ${RULES}. Scan everything: node scripts/check-tells.mjs --all`);
process.exit(1);
