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
  const root = path.join(sandbox, "Active Work");
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

test("new media defaults to Active Work and leaves legacy Generated untouched", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  delete setup.env.STORAGE_GATE_ROOT;
  const legacy = path.join(setup.sandbox, "Generated", "keep-until-migration.txt");
  mkdirSync(path.dirname(legacy));
  writeFileSync(legacy, "existing work");
  const result = run(["route", "--client", "FaithTalk", "--kind", "renders"], setup);
  const expected = path.join(setup.sandbox, "Active Work", "FAITHTALK", "renders");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), expected);
  assert.equal(existsSync(expected), true);
  assert.equal(readFileSync(legacy, "utf8"), "existing work");
  assert.equal(existsSync(path.join(setup.sandbox, "Generated", "FAITHTALK")), false);
});

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
  setup.env.STORAGE_GATE_VOLUME_ROOT = path.join(setup.sandbox, "missing-volume");

  const result = run(["route", "--client", "FaithTalk", "--kind", "renders"], setup);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /VOLUME_MISSING/);
  assert.equal(existsSync(setup.env.STORAGE_GATE_VOLUME_ROOT), false);
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
        entry.matcher === "^(?:Bash|exec_command)$" &&
        entry.hooks.some((hook) => /storage-gate\.mjs\"? hook/.test(hook.command)),
    ),
    true,
  );
});

for (const alias of [false, true]) {
  test(`route rejects Generated as an active root${alias ? " through a link" : ""}`, (context) => {
    const setup = fixture();
    context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
    const generated = path.join(setup.sandbox, "Generated");
    mkdirSync(generated);
    setup.env.STORAGE_GATE_ROOT = generated;
    if (alias) {
      const link = path.join(setup.sandbox, "Work alias");
      symlinkSync(generated, link);
      setup.env.STORAGE_GATE_ROOT = link;
    }
    const result = run(["route", "--kind", "renders"], setup);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /DISPOSABLE_ROOT/);
    assert.equal(existsSync(path.join(generated, "_INBOX")), false);
  });
}

test("kept templates, references and deliverables route to Media Library", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  for (const [kind, folder] of [["templates", "Templates"], ["references", "References"], ["deliverables", "Deliverables"]]) {
    const result = run(["route", "--area", "library", "--client", "745 Creative", "--kind", kind], setup);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), path.join(setup.sandbox, "Media Library", "745_CREATIVE", folder));
  }
  for (const args of [["--area", "generated", "--kind", "renders"], ["--area", "library", "--kind", "renders"]]) {
    const result = run(["route", ...args], setup);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /INVALID_AREA|INVALID_KIND/);
  }
});

test("both shell payloads reject old Generated renders and caches", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  for (const tool of ["Bash", "exec_command"]) {
    for (const legacy of ["output", "cache"]) {
      const generated = path.join(setup.sandbox, "Generated");
      const output = path.join(legacy === "output" ? generated : setup.root, "CLIENT", "renders", "job.mp4");
      const cache = path.join(legacy === "cache" ? generated : setup.root, "hyperframes", "cache", "extracted-frames");
      const command = `npx hyperframes render . --output "${output}" --frames-cache-dir "${cache}"`;
      const result = run(["hook"], {env: setup.env, input: JSON.stringify({tool_name:tool,tool_input:tool === "Bash" ? {command} : {cmd:command}})});
      assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, "deny");
    }
  }
});

test("hook ignores a quoted render example in a file-writing command", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const command = 'cat > test.mjs <<\'EOF\'\nconst example = "npx hyperframes render . --output /tmp/test.mp4";\nEOF';
  const result = run(["hook"], {env:setup.env,input:JSON.stringify({tool_name:"Bash",tool_input:{command}})});
  assert.equal(result.stdout, "");
});

test("check-output validates a producer destination without moving or writing media", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const good = path.join(setup.root, "CATENA_MEDIA", "renders", "test.mp4");
  const result = run(["check-output", "--path", good], setup);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), good);
  assert.equal(existsSync(good), false);
  for (const bad of [path.join(setup.sandbox, "Generated", "CATENA_MEDIA", "renders", "test.mp4"), path.join(setup.root, "unknown", "test.mp4")]) {
    const denied = run(["check-output", "--path", bad], setup);
    assert.notEqual(denied.status, 0);
    assert.match(denied.stderr, /INVALID_OUTPUT/);
  }
});

test("plans and research route to the repo Lane folder, never HomeSSD", (context) => {
  const setup = fixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const repo = path.join(setup.sandbox, "repo");
  mkdirSync(path.join(repo, "docs", "operations"), { recursive: true });
  const env = { ...setup.env, STORAGE_GATE_REPO_ROOT: repo };
  for (const kind of ["plan", "research"]) {
    const result = run(["route", "--kind", kind, "--lane", "content-editor", "--name", "Product Ads"], { env });
    const expected = path.join(repo, "docs", "operations", "content-editor", "product-ads");
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), expected);
    assert.equal(existsSync(expected), true);
  }
  const missing = run(["route", "--client", "SINGLETON_SYSTEMS", "--kind", "plan"], { env });
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /PLAN_HOME: .*docs\/operations\/<lane>\/<plan>\//);
  assert.equal(existsSync(path.join(setup.sandbox, "Active Work", "SINGLETON_SYSTEMS")), false);
  assert.equal(existsSync(path.join(setup.sandbox, "Generated")), false);
});

function finishedFixture(options) {
  const setup = fixture({ uuid: "TEST-MEDIASSD", ...options });
  mkdirSync(path.join(setup.sandbox, "05_FINISHED"));
  setup.env = {
    ...setup.env,
    STORAGE_GATE_FINISHED_VOLUME_ROOT: setup.sandbox,
    STORAGE_GATE_FINISHED_UUID: "TEST-MEDIASSD",
  };
  return setup;
}

test("finished videos route to MediaSSD 05_FINISHED after the volume check", (context) => {
  const setup = finishedFixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const result = run(["route", "--kind", "finished", "--product", "Product-Ads"], setup);
  const expected = path.join(setup.sandbox, "05_FINISHED", "Product-Ads");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), expected);
  assert.equal(existsSync(expected), true);
  for (const product of [[], ["--product", "../escape"]]) {
    const refused = run(["route", "--kind", "finished", ...product], setup);
    assert.equal(refused.status, 2);
    assert.match(refused.stderr, /^PRODUCT_REQUIRED: .*05_FINISHED\/<Product>\//);
  }
});

test("finished route refuses a wrong, read-only or missing MediaSSD", (context) => {
  for (const [options, code] of [[{ uuid: "OTHER" }, "WRONG_VOLUME"], [{ readOnly: true }, "VOLUME_READ_ONLY"]]) {
    const setup = finishedFixture(options);
    context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
    const result = run(["route", "--kind", "finished", "--product", "Product-Ads"], setup);
    assert.equal(result.status, 2);
    assert.match(result.stderr, new RegExp(`^${code}:`));
  }
  const setup = finishedFixture();
  context.after(() => rmSync(setup.sandbox, { recursive: true, force: true }));
  const env = { ...setup.env, STORAGE_GATE_FINISHED_VOLUME_ROOT: path.join(setup.sandbox, "offline") };
  const offline = run(["route", "--kind", "finished", "--product", "Product-Ads"], { env });
  assert.equal(offline.status, 2);
  assert.match(offline.stderr, /^VOLUME_MISSING:/);
});
