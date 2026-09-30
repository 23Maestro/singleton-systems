import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = new URL("./storage-gate.mjs", import.meta.url);
const repositoryRoot = path.resolve(path.dirname(script.pathname), "../..");
const GIB = 1024 ** 3;

function fixture({ uuid = "TEST-HOMESSD", freeBytes = 200 * GIB, readOnly = false } = {}) {
  const sandbox = mkdtempSync(path.join(tmpdir(), "storage-gate-test-"));
  const root = path.join(sandbox, "Generated");
  const volumeRoot = sandbox;
  const diskutil = path.join(sandbox, "diskutil");
  mkdirSync(root, { recursive: true });
  writeFileSync(
    diskutil,
    `#!/bin/sh
test "$2" = "${volumeRoot}" || exit 64
printf '%s\n' \\
  '   Volume Name:               HomeSSD' \\
  '   Mounted:                   Yes' \\
  '   Volume UUID:               ${uuid}' \\
  '   Container Free Space:      200.0 GB (${freeBytes} Bytes) (exactly 400000000 512-Byte-Units)' \\
  '   Media Read-Only:           ${readOnly ? "Yes" : "No"}' \\
  '   Volume Read-Only:          ${readOnly ? "Yes" : "No"}'
`,
  );
  chmodSync(diskutil, 0o755);
  return {
    sandbox,
    root,
    env: {
      ...process.env,
      STORAGE_GATE_DISKUTIL: diskutil,
      STORAGE_GATE_EXPECTED_UUID: "TEST-HOMESSD",
      STORAGE_GATE_MIN_FREE_BYTES: String(50 * GIB),
      STORAGE_GATE_ROOT: root,
      STORAGE_GATE_VOLUME_ROOT: volumeRoot,
    },
  };
}

function run(args, { env, input = "" }) {
  return spawnSync(process.execPath, [script.pathname, ...args], {
    encoding: "utf8",
    env,
    input,
  });
}

test("route creates the normalized client and media-kind directory", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));

  const result = run(["route", "--client", "FaithTalk TV", "--kind", "renders"], setup);

  const expected = path.join(setup.root, "FAITHTALK_TV", "renders");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), expected);
  assert.equal(existsSync(expected), true);
});

test("route uses the inbox when client context is missing", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));

  const result = run(["route", "--kind", "previews"], setup);

  const expected = path.join(setup.root, "_INBOX", "previews");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), expected);
  assert.equal(existsSync(expected), true);
});

test("route refuses an unknown media kind", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));

  const result = run(["route", "--client", "FaithTalk", "--kind", "mystery"], setup);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /INVALID_KIND/);
  assert.equal(existsSync(path.join(setup.root, "FAITHTALK", "mystery")), false);
});

test("route refuses the wrong physical volume", (context) => {
  const setup = fixture({ uuid: "WRONG-UUID" });
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));

  const result = run(["route", "--client", "FaithTalk", "--kind", "renders"], setup);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /WRONG_VOLUME/);
});

test("route refuses a missing volume with no internal fallback", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  rmSync(setup.root, { recursive: true });

  const result = run(["route", "--client", "FaithTalk", "--kind", "renders"], setup);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /VOLUME_MISSING/);
  assert.equal(existsSync(setup.root), false);
});

test("route refuses a read-only or low-space volume", (context) => {
  const readOnly = fixture({ readOnly: true });
  const lowSpace = fixture({ freeBytes: GIB });
  context.after(() => rmSync(readOnly.sandbox, { recursive: true, force: true }));
  context.after(() => rmSync(lowSpace.sandbox, { recursive: true, force: true }));

  const readOnlyResult = run(["route", "--kind", "renders"], readOnly);
  const lowSpaceResult = run(["route", "--kind", "renders"], lowSpace);

  assert.notEqual(readOnlyResult.status, 0);
  assert.match(readOnlyResult.stderr, /VOLUME_READ_ONLY/);
  assert.notEqual(lowSpaceResult.status, 0);
  assert.match(lowSpaceResult.stderr, /INSUFFICIENT_SPACE/);
});

test("route refuses escaping and dangling client links before creating folders", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const outside = path.join(setup.sandbox, "outside-generated");
  mkdirSync(outside);
  symlinkSync(outside, path.join(setup.root, "ESCAPE"));
  symlinkSync(path.join(setup.sandbox, "missing"), path.join(setup.root, "DANGLING"));

  for (const client of ["ESCAPE", "DANGLING"]) {
    const result = run(["route", "--client", client, "--kind", "renders"], setup);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /UNSAFE_PATH/);
  }
  assert.equal(existsSync(path.join(outside, "renders")), false);
  assert.equal(existsSync(path.join(setup.sandbox, "missing")), false);
});

test("route accepts a client link that stays inside the generated root", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const target = path.join(setup.root, "REAL_CLIENT");
  mkdirSync(target);
  symlinkSync(target, path.join(setup.root, "CLIENT"));

  const result = run(["route", "--client", "CLIENT", "--kind", "renders"], setup);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(path.join(target, "renders")), true);
});

test("route refuses a generated root linked outside the verified volume", (context) => {
  const setup = fixture();
  const outside = mkdtempSync(path.join(tmpdir(), "storage-gate-outside-"));
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  context.after(() => rmSync(outside, { recursive: true, force: true }));
  rmSync(setup.root, { recursive: true });
  symlinkSync(outside, setup.root);

  const result = run(["route", "--client", "CLIENT", "--kind", "renders"], setup);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /UNSAFE_PATH/);
  assert.equal(existsSync(path.join(outside, "CLIENT")), false);
});

test("hook requires an explicit extracted-frame cache path", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const output = path.join(setup.root, "CLIENT", "renders", "review.mp4");
  const result = run(["hook"], {
    env: setup.env,
    input: JSON.stringify({
      tool_name: "Bash",
      tool_input: { command: `npx hyperframes render . --output "${output}"` },
    }),
  });
  assert.equal(result.status, 0, result.stderr);
  const response = JSON.parse(result.stdout).hookSpecificOutput;
  assert.equal(response.permissionDecision, "deny");
  assert.match(response.permissionDecisionReason, /--frames-cache-dir/);
});

for (const linkedPath of ["client", "client followed by ..", "output file", "cache"]) {
  test(`hook refuses an escaping ${linkedPath} link`, (context) => {
    const setup = fixture();
    context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
    const outside = path.join(setup.sandbox, "outside-generated");
    const output = linkedPath === "client followed by .."
      ? `${setup.root}/CLIENT/../OTHER/renders/review.mp4`
      : path.join(setup.root, "CLIENT", "renders", "review.mp4");
    const cache = path.join(setup.root, "hyperframes", "cache", "extracted-frames");
    mkdirSync(outside);
    if (linkedPath === "client" || linkedPath === "client followed by ..") {
      symlinkSync(outside, path.join(setup.root, "CLIENT"));
    } else if (linkedPath === "output file") {
      mkdirSync(path.dirname(output), { recursive: true });
      const target = path.join(outside, "review.mp4");
      writeFileSync(target, "unchanged");
      symlinkSync(target, output);
    } else {
      symlinkSync(outside, path.join(setup.root, "hyperframes"));
    }

    const result = run(["hook"], {
      env: setup.env,
      input: JSON.stringify({
        tool_name: "Bash",
        tool_input: {
          command: `npx hyperframes render . --output "${output}" --frames-cache-dir "${cache}"`,
        },
      }),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, "deny");
    assert.equal(existsSync(path.join(outside, "renders")), false);
    assert.equal(existsSync(path.join(outside, "cache")), false);
    if (linkedPath === "output file") {
      assert.equal(readFileSync(path.join(outside, "review.mp4"), "utf8"), "unchanged");
    }
  });
}

test("hook denies an internal HyperFrames render and supplies corrected paths", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const payload = {
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    cwd: "/Users/singleton23/Documents/Development/singleton-systems",
    tool_input: {
      command:
        "npx hyperframes@0.8.70 render . --output /Users/singleton23/Documents/render.mp4 --frames-cache-dir /tmp/frames",
    },
  };

  const result = run(["hook"], { env: setup.env, input: JSON.stringify(payload) });
  const response = JSON.parse(result.stdout);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(response.hookSpecificOutput.permissionDecision, "deny");
  assert.match(
    response.hookSpecificOutput.permissionDecisionReason,
    /npx hyperframes@0\.8\.70 render \./,
  );
  assert.match(
    response.hookSpecificOutput.permissionDecisionReason,
    new RegExp(path.join(setup.root, "_INBOX", "renders", "render.mp4").replaceAll("/", "\\/")),
  );
  assert.match(response.hookSpecificOutput.permissionDecisionReason, /hyperframes\/cache\/extracted-frames/);
});

test("hook accepts a HomeSSD HyperFrames render and ignores unrelated commands", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const output = path.join(setup.root, "FAITHTALK", "renders", "review.mp4");
  const cache = path.join(setup.root, "hyperframes", "cache", "extracted-frames");
  const renderPayload = {
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    cwd: "/Users/singleton23/Documents/Development/singleton-systems",
    tool_input: {
      command: `npx hyperframes render . --output "${output}" --frames-cache-dir "${cache}"`,
    },
  };
  const unrelatedPayload = {
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: { command: "git status --short" },
  };
  const internalCachePayload = {
    ...renderPayload,
    tool_input: {
      command: `npx hyperframes render . --output "${output}" --frames-cache-dir /tmp/frames`,
    },
  };

  const accepted = run(["hook"], { env: setup.env, input: JSON.stringify(renderPayload) });
  const deniedCache = run(["hook"], {
    env: setup.env,
    input: JSON.stringify(internalCachePayload),
  });
  const unrelated = run(["hook"], { env: setup.env, input: JSON.stringify(unrelatedPayload) });

  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(accepted.stdout.trim(), "");
  assert.equal(
    JSON.parse(deniedCache.stdout).hookSpecificOutput.permissionDecision,
    "deny",
  );
  assert.equal(unrelated.status, 0, unrelated.stderr);
  assert.equal(unrelated.stdout.trim(), "");
});

test("repository exposes the CLI and a dedicated Bash PreToolUse hook", () => {
  const packageJson = JSON.parse(
    readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
  );
  const hookConfig = JSON.parse(
    readFileSync(path.join(repositoryRoot, ".codex", "hooks.json"), "utf8"),
  );
  const preToolUse = hookConfig.hooks.PreToolUse;

  assert.equal(
    packageJson.scripts["storage:gate"],
    "node scripts/developer-storage/storage-gate.mjs",
  );
  assert.equal(
    packageJson.scripts["check:storage-gate"],
    "node --test scripts/developer-storage/storage-gate.test.mjs scripts/developer-storage/git-media-policy.test.mjs",
  );
  assert.equal(
    preToolUse.some(
      (entry) =>
        entry.matcher === "Bash" &&
        entry.hooks.some((hook) => /storage-gate\.mjs\"? hook/.test(hook.command)),
    ),
    true,
  );
});
