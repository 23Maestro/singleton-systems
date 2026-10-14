import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const checker = new URL("./check-tells.mjs", import.meta.url).pathname;
function fixture(t, name, content, supplied = false) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "writing-origin-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, name);
  fs.writeFileSync(file, content);
  if (supplied) fs.writeFileSync(`${file}.writing-origin.json`, JSON.stringify({
    origin: "client-source", source: "Client recording, transcribed verbatim",
    contentSha256: createHash("sha256").update(content).digest("hex"),
  }));
  return file;
}
const run = (file) => spawnSync(process.execPath, [checker, file], { encoding: "utf8" });

test("client speech stays unchanged and does not fail the prose gate", (t) => {
  const words = "This is a testament to a robust defense.\n";
  const file = fixture(t, "speaker.txt", words, true);
  const result = run(file);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(file, "utf8"), words);
});

test("authored emails, proposals and documentation still fail on verbose word choice", (t) => {
  for (const name of ["email.eml", "upwork-proposal.txt", "documentation.md", "transcript-guide.md"]) {
    const result = run(fixture(t, name, "This is a robust approach.\n"));
    assert.equal(result.status, 1, name);
    assert.match(result.stderr, /banned word/);
  }
});

test("editing a source record invalidates its exemption", (t) => {
  const file = fixture(t, "speaker.txt", "Supplied words.\n", true);
  fs.appendFileSync(file, "New authored copy.\n");
  const result = run(file);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /provenance is stale/);
});

test("source excerpts are preserved while authored text around them is checked", (t) => {
  const supplied = "<!-- writing-source:start -->\n# Client words\nThis is a robust defense.\n<!-- writing-source:end -->\n";
  const file = fixture(t, "review.md", `${supplied}\nThis is a robust summary.\n`);
  const result = run(file);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /review\.md:6 .*banned word/);
  assert.doesNotMatch(result.stderr, /review\.md:3 /);
  fs.writeFileSync(file, `${supplied}\nThe defense stopped the run.\n`);
  assert.equal(run(file).status, 0);
});
