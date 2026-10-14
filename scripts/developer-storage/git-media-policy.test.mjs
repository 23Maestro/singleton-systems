import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repo = new URL("../../", import.meta.url).pathname;

function ignored(path) {
  const result = spawnSync("git", ["check-ignore", "--no-index", "-q", path], {
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


test("local client drafts and Lineups production records stay out of Git", () => {
  for (const file of [
    ".scratch/acee/contracts/narration.txt",
    "config/lineups/episodes/2099-01-01-example/episode.json",
    "config/lineups/intake/2099-01-01/readback.json",
    "config/lineups/receipts/S01.premiere-placement.receipt.json",
    "videos/faithtalk-episode-2-social/9x16/assets/photo.jpg",
    "videos/trevor-stadium-depthflow/assets/source.jpg",
    "videos/lineups-template-2-5/assets",
    "videos/lineups-template-2-5/vendor",
    "public/decision-maps/2099-01-01-example-pre-figma-review/evidence/transcript-lanes.txt",
  ]) assert.equal(ignored(file), true, file);
});

test("canonical contracts, fixtures, plugins and composition code stay visible", () => {
  for (const file of [
    "config/lineups/review-gates.json",
    "config/lineups/fixtures/valid/render-proof.mp4",
    "plugins/repo-housekeeping/skills/repo-maintenance/scripts/audit_repo_maintenance.py",
    "videos/lineups-template-2-5/scene.js",
    "public/portfolio/example.mp4",
  ]) assert.equal(ignored(file), false, file);
});
