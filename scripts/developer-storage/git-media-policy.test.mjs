import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repo = new URL("../../", import.meta.url).pathname;

function ignored(path) {
  const result = spawnSync("git", ["check-ignore", "-q", path], {
    cwd: repo,
    encoding: "utf8",
  });
  assert.notEqual(result.status, null, result.error?.message);
  return result.status === 0;
}

test("raw video production data cannot enter Git or Codex turn snapshots", () => {
  assert.equal(
    ignored(
      "videos/faithtalk-drawn-seed-preview/assets/client-replacements-2026-09-25/footage/example.mov",
    ),
    true,
  );
  assert.equal(
    ignored("videos/faithtalk-drawn-seed-preview/renders/example.mp4"),
    true,
  );
  assert.equal(
    ignored("videos/faithtalk-drawn-seed-preview/snapshots/example.png"),
    true,
  );
  assert.equal(
    ignored("videos/faithtalk-drawn-seed-preview/references/example.mov"),
    true,
  );
  assert.equal(
    ignored("videos/faithtalk-drawn-seed-preview/.hyperframes/backup/example"),
    true,
  );
  assert.equal(
    ignored("videos/faithtalk-drawn-seed-preview/.thumbnails/example.jpg"),
    true,
  );
});

test("video project code and metadata remain eligible for version control", () => {
  assert.equal(
    ignored("videos/faithtalk-drawn-seed-preview/compositions/scene.ts"),
    false,
  );
  assert.equal(
    ignored("videos/faithtalk-drawn-seed-preview/STORYBOARD.md"),
    false,
  );
});
