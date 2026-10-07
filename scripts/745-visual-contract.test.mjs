import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import test from "node:test";
import { after } from "node:test";
import { createHash } from "node:crypto";

const root = process.cwd();
const hook = path.join(root, ".codex/hooks/creative_745.py");
// Gate tests use an isolated reference fixture, not Jerami's mounted media.
const testConfig = fs.mkdtempSync(path.join(os.tmpdir(), "745-hook-fixture-"));
after(() => fs.rmSync(testConfig, { recursive: true, force: true }));
fs.cpSync(path.join(root, "config/745-creative"), testConfig, { recursive: true });
const testReference = path.join(testConfig, "reference-fixture.bin");
fs.writeFileSync(testReference, "745 reference hash fixture; not production artwork");
const testContractFile = path.join(testConfig, "visual-contract.json");
const testContract = JSON.parse(fs.readFileSync(testContractFile, "utf8"));
Object.assign(testContract.clients.pastor_john.lanes.prayer.reference, {
  path: testReference,
  sha256: createHash("sha256").update(fs.readFileSync(testReference)).digest("hex"),
});
fs.writeFileSync(testContractFile, JSON.stringify(testContract));
const run = (payload, configDir) => spawnSync("/usr/bin/python3", [hook], {
  cwd: root, input: JSON.stringify({ cwd: root, ...payload }), encoding: "utf8",
  env: { ...process.env, CREATIVE_745_CONFIG_DIR: configDir || testConfig },
});
const sequenceId = JSON.parse(fs.readFileSync(path.join(testConfig, "active-edit.json"), "utf8")).sequenceId;
const mutate = (toolName = "mcp__premiere_pro__add_text_overlay", toolInput = { sequenceId }, configDir) =>
  run({ hook_event_name: "PreToolUse", tool_name: toolName, tool_input: toolInput }, configDir);
const output = (result) => { assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout).hookSpecificOutput; };
function fixture(t, change) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "745-contract-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(testConfig, dir, { recursive: true });
  const file = path.join(dir, "active-edit.json");
  const active = JSON.parse(fs.readFileSync(file, "utf8"));
  change(active);
  fs.writeFileSync(file, JSON.stringify(active));
  return dir;
}

test("John Prayer prompt loads the source-backed visual treatment", () => {
  const result = run({ hook_event_name: "UserPromptSubmit", prompt: "745 Creative: Pastor John Prayer, Afraid of Tomorrow" });
  assert.equal(result.status, 0, result.stderr);
  const context = JSON.parse(result.stdout).hookSpecificOutput.additionalContext;
  assert.match(context, /pastor_john\/prayer/);
  assert.match(context, /A Prayer For/);
  assert.match(context, /Softer and more personal/);
  assert.match(context, /Poppins/);
  assert.match(context, /Opus/);
  assert.match(context, /1AmoyonXDcWnqPpYkCecxGnOVVxBk1dJbpdMSaRLkaSc/);
});

test("John Prayer resolves the approved native fade and measured title master", () => {
  const contract = JSON.parse(fs.readFileSync(path.join(root, "config/745-creative/visual-contract.json"), "utf8"));
  const lane = contract.clients.pastor_john.lanes.prayer;
  assert.equal(lane.productionMaster.record, "figma-masters/pastor-john-prayer.json");
  assert.equal(lane.productionMaster.status, "approved for same-lane reuse");
  assert.equal(lane.productionMaster.backing.engine, "Premiere Pro native Graphic + Ramp");
  assert.equal(lane.productionMaster.backing.blendMode, "Multiply");
  const master = JSON.parse(fs.readFileSync(path.join(root, "config/745-creative", lane.productionMaster.record), "utf8"));
  assert.equal(master.approval.laneId, "prayer");
  assert.equal(master.approval.status, "approved for same-lane reuse");
  assert.equal(master.approvedBaseline.title.fontSize, 112);
  assert.equal(master.approvedBaseline.title.y, 1236);
  assert.equal(master.approvedBaseline.nativeBacking.rampStartNormalized[1], 0.4953125);
  assert.ok(fs.existsSync(path.join(root, "config/745-creative", master.reusableNativeTemplate.projectFile)));
  const context = output(run({ hook_event_name: "UserPromptSubmit", prompt: "745 Pastor John Prayer" })).additionalContext;
  assert.match(context, /approved for same-lane reuse/);
  assert.match(context, /Multiply/);
  assert.match(context, /premiere-masters\/john-prayer-native-fade-v1.prproj/);
});

test("Prayer batch records completed Premiere transcripts without claiming final delivery", () => {
  const batch = JSON.parse(fs.readFileSync(path.join(root, "config/745-creative/john-prayer-batch.json"), "utf8"));
  assert.equal(batch.records.length, 17);
  assert.equal(batch.laneSourceCount, 18);
  assert.equal(batch.fullEditsApproved, 0);
  assert.equal(new Set(batch.records.map(r => r.sequenceId)).size, 17);
  assert.equal(new Set(batch.records.map(r => r.figmaFrameId)).size, 17);
  for (const r of batch.records) {
    assert.equal(r.transcript.provider, "Adobe Premiere Pro");
    assert.equal(r.transcript.status, "Completed");
    assert.equal(r.nativeReadback.fadeBlendModeValue, 17);
    assert.equal(r.nativeReadback.colorSpace, "Rec. 709");
    assert.equal(r.nativeReadback.autoToneMap, true);
    assert.equal(r.nativeReadback.openingEndSeconds, 3.003);
    assert.ok(Math.abs(r.nativeReadback.audioDurationSeconds - r.durationSeconds) < 0.001);
    assert.ok(Math.abs(r.sourceRange.outSeconds - r.sourceRange.inSeconds - r.durationSeconds) < 0.001);
    assert.match(r.files.title, /\/Volumes\/HomeSSD\/Generated\/745_CREATIVE\/renders\//);
    assert.match(r.status.audio, /pending/);
    assert.equal(r.status.export, "not exported");
  }
});

test("bound edit receives the reference and 10% allowance", () => {
  const result = output(mutate());
  assert.match(result.additionalContext, /ENROLLMENT PASSED/);
  assert.match(result.additionalContext, /reference-fixture.bin/);
  assert.match(result.additionalContext, /maxDeviationPercent": 10/);
});

test("out-of-allowance and fixed-field adjustments are denied", (t) => {
  for (const adjustments of [{ fontSizePercent: 11 }, { fontSizePercent: -11 }, { fontSizePercent: true }, { palette: 3 }]) {
    const dir = fixture(t, (active) => { active.adjustments = adjustments; });
    assert.equal(output(mutate(undefined, undefined, dir)).permissionDecision, "deny");
  }
});

test("exactly +/-10 percent within existing treatment remains allowed", (t) => {
  const dir = fixture(t, (active) => { active.adjustments = { spacingPercent: -10, fontSizePercent: 10 }; });
  assert.match(output(mutate(undefined, undefined, dir)).additionalContext, /ENROLLMENT PASSED/);
});

test("unlisted lane cannot borrow another template", (t) => {
  const dir = fixture(t, (active) => { active.laneId = "invented_prayer_lane"; });
  assert.match(output(mutate(undefined, undefined, dir)).permissionDecisionReason, /Unknown 745 client\/lane/);
});

test("binding cannot override the fixed palette or font", (t) => {
  const dir = fixture(t, (active) => { active.fontFamily = "Comic Sans"; });
  assert.match(output(mutate(undefined, undefined, dir)).permissionDecisionReason, /unapproved style overrides/);
});

test("missing reference stops enrolled visual mutation", (t) => {
  const dir = fixture(t, () => {});
  const file = path.join(dir, "visual-contract.json");
  const contract = JSON.parse(fs.readFileSync(file, "utf8"));
  contract.clients.pastor_john.lanes.prayer.reference.path = path.join(dir, "missing-reference.png");
  fs.writeFileSync(file, JSON.stringify(contract));
  assert.match(output(mutate(undefined, undefined, dir)).permissionDecisionReason, /reference unavailable/);
});

test("changed reference hash stops enrolled mutation", (t) => {
  const dir = fixture(t, () => {});
  const file = path.join(dir, "visual-contract.json");
  const contract = JSON.parse(fs.readFileSync(file, "utf8"));
  contract.clients.pastor_john.lanes.prayer.reference.sha256 = "0".repeat(64);
  fs.writeFileSync(file, JSON.stringify(contract));
  assert.match(output(mutate(undefined, undefined, dir)).permissionDecisionReason, /hash changed/);
});

test("captions stay in Opus for the enrolled sequence", () => {
  assert.match(output(mutate("mcp__premiere_pro__create_caption_track")).permissionDecisionReason, /Opus Clip/);
});

test("nested Premiere caption call is gated at functions.exec", () => {
  const result = mutate("functions.exec", { code: `await tools.mcp__premiere_pro__create_caption_track({sequenceId:"${sequenceId}"});` });
  assert.equal(output(result).permissionDecision, "deny");
  const mixed = mutate("functions.exec", { code: `await tools.mcp__codex_apps__figma_use_figma({description:"745 John Prayer"}); await tools.mcp__premiere_pro__create_caption_track({sequenceId:"${sequenceId}"});` });
  assert.equal(output(mixed).permissionDecision, "deny");
});

test("read-only calls, unrelated projects, and other clients stay unaffected", () => {
  assert.equal(mutate("mcp__premiere_pro__get_sequence_settings").stdout, "");
  assert.equal(mutate(undefined, { sequenceId: "025002ca-2740-4de3-bbce-a9636becdb21" }).stdout, "");
  assert.equal(run({ hook_event_name: "UserPromptSubmit", prompt: "Help with FlowZone" }).stdout, "");
  const ben = output(run({ hook_event_name: "UserPromptSubmit", prompt: "745 Pastor Ben talking head" })).additionalContext;
  assert.match(ben, /pastor_ben\/teaching/);
  assert.doesNotMatch(ben, /A PRAYER FOR/);
});

test("native UI is explicitly a reminder, not a false visual guarantee", () => {
  const result = output(mutate("mcp__cua_repl__js", { code: "await premiereApp.click(74);" }));
  assert.match(result.additionalContext, /UI REMINDER ONLY/);
});

test("hook configuration wires prompts, Premiere, native UI, and nested exec", () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, ".codex/hooks.json"), "utf8"));
  assert.ok(config.hooks.UserPromptSubmit.some((entry) => entry.hooks.some((h) => h.command.includes("creative_745.py"))));
  const gate = config.hooks.PreToolUse.find((entry) => entry.hooks.some((h) => h.command.includes("creative_745.py")));
  const gateIndex = config.hooks.PreToolUse.indexOf(gate);
  const indexOfCommand = (name) => config.hooks.PreToolUse.findIndex((entry) => entry.hooks.some((h) => h.command.includes(name)));
  assert.ok(indexOfCommand("cerebral_singleton_guard.py") < indexOfCommand("lineups_enforcement.py"));
  assert.ok(indexOfCommand("lineups_enforcement.py") < gateIndex);
  const storageIndex = indexOfCommand("storage-gate.mjs");
  if (storageIndex !== -1) assert.ok(storageIndex < indexOfCommand("cerebral_singleton_guard.py"));
  for (const name of ["mcp__premiere_pro__add_text_overlay", "mcp__cua_repl__js", "functions.exec", "Bash", "exec_command"])
    assert.match(name, new RegExp(gate.matcher));
});

test("Ben and Eric have separate indexed contracts with source-backed visual passes", () => {
  const shared = JSON.parse(fs.readFileSync(path.join(root, "config/745-creative/visual-contract.json"), "utf8"));
  for (const [clientId, count] of [["pastor_ben", 14], ["eric_miller", 16]]) {
    const entry = shared.clients[clientId];
    assert.deepEqual(Object.keys(entry), ["contractFile"]);
    const file = JSON.parse(fs.readFileSync(path.join(root, "config/745-creative", entry.contractFile), "utf8"));
    assert.equal(file.clientId, clientId);
    assert.equal(file.schemaVersion, 1);
    assert.equal(file.client.batch.requestedDeliverables, count);
    assert.equal(file.client.productionStatus.pixelBaseline, null);
    assert.equal(file.client.productionStatus.premiereTemplate, "not built or verified");
    assert.ok(file.sources.visualDirection);
    assert.ok(file.sources.editBrief);
    assert.ok(file.sources.brandBook);
    for (const lane of Object.values(file.client.lanes)) {
      for (const pass of ["framing", "color", "opening", "onScreenText", "cover"])
        assert.ok(lane.visualPasses[pass], `${clientId}/${lane.name} missing ${pass}`);
      assert.ok(lane.visualReview.length > 0);
      assert.equal(lane.requiredLabel, null);
    }
  }
});

test("Ben preserves bold cover direction without adding heavy video titles", () => {
  const context = output(run({ hook_event_name: "UserPromptSubmit", prompt: "745 Pastor Ben teaching" })).additionalContext;
  assert.match(context, /bold headline/i);
  assert.match(context, /only when needed/i);
  assert.match(context, /Cambria pending/);
  assert.doesNotMatch(context, /A PRAYER FOR|Stadium Lights|violetPop/);
});

test("Eric uses the later brand direction and keeps invented intros out", () => {
  const context = output(run({ hook_event_name: "UserPromptSubmit", prompt: "745 Eric Miller market takes" })).additionalContext;
  assert.match(context, /eric_miller\/market/);
  assert.match(context, /After Hours/);
  assert.match(context, /No mandatory intro card/);
  assert.match(context, /No Eric thumbnail reference/);
  assert.doesNotMatch(context, /A PRAYER FOR|Cambria pending|Stadium Lights/);
});

test("missing or mismatched client contracts stop enrolled writes", (t) => {
  for (const mismatch of [false, true]) {
    const dir = fixture(t, (active) => { active.clientId = "pastor_ben"; active.laneId = "teaching"; });
    const file = path.join(dir, "pastor-ben/visual-contract.json");
    if (mismatch) {
      const contract = JSON.parse(fs.readFileSync(file, "utf8"));
      contract.clientId = "eric_miller";
      fs.writeFileSync(file, JSON.stringify(contract));
    } else fs.unlinkSync(file);
    assert.equal(output(mutate(undefined, undefined, dir)).permissionDecision, "deny");
  }
});

test("client index cannot load contracts outside its directory", (t) => {
  const dir = fixture(t, () => {});
  const file = path.join(dir, "visual-contract.json");
  const contract = JSON.parse(fs.readFileSync(file, "utf8"));
  contract.clients.pastor_ben.contractFile = "../foreign-client.json";
  fs.writeFileSync(file, JSON.stringify(contract));
  assert.match(output(mutate(undefined, undefined, dir)).permissionDecisionReason, /must stay inside/);
});

function graphicsFixture(t, storageFixture = false) {
  const dir = fixture(t, () => {});
  const source = path.join(dir, "source.mov");
  const project = path.join(dir, "sample.prproj");
  fs.writeFileSync(source, "source fixture");
  fs.writeFileSync(project, "project fixture");
  const activeFile = path.join(dir, "active-edit.json");
  const active = JSON.parse(fs.readFileSync(activeFile, "utf8"));
  Object.assign(active, { source, projectPath: project });
  fs.writeFileSync(activeFile, JSON.stringify(active));
  const probe = path.join(dir, "ffprobe");
  fs.writeFileSync(probe, `#!/usr/bin/env python3
import json, sys
name = sys.argv[-1]
if name.endswith('.png'):
    stream = {"codec_type":"video", "codec_name":"png", "pix_fmt":"rgba", "width":1080, "height":1920}
else:
    stream = {"codec_type":"video", "codec_name":"prores", "profile":"4444", "pix_fmt":"yuva444p10le", "width":1080, "height":1920, "avg_frame_rate":"30000/1001", "duration":"3.003"}
print(json.dumps({"streams":[stream]}))
`, { mode: 0o755 });
  const env = { ...process.env, CREATIVE_745_CONFIG_DIR: dir, CREATIVE_745_FFPROBE: probe };
  if (storageFixture) {
    const generated = path.join(dir, "Generated");
    const file = path.join(dir, "visual-contract.json");
    const contract = JSON.parse(fs.readFileSync(file, "utf8"));
    contract.workflow.graphics.outputRoot = path.join(generated, "745_CREATIVE", "renders");
    fs.mkdirSync(contract.workflow.graphics.outputRoot, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(contract));
    const diskutil = path.join(dir, "diskutil");
    fs.writeFileSync(diskutil, `#!/usr/bin/env python3
print("Volume UUID: 0EB7E204-D359-47B2-B9B1-89B2DC77BC5A")
print("Container Free Space: 100 GB (107374182400 Bytes)")
print("Volume Read-Only: No")
print("Media Read-Only: No")
`, { mode: 0o755 });
    Object.assign(env, { STORAGE_GATE_ROOT: generated, STORAGE_GATE_VOLUME_ROOT: dir, STORAGE_GATE_DISKUTIL: diskutil });
  }
  const cli = (...args) => spawnSync("/usr/bin/python3", [hook, ...args], {
    cwd: root, encoding: "utf8",
    env,
  });
  return { dir, cli, activeFile, env, project };
}

test("graphics plan binds both outputs to current direction without approving pixels", (t) => {
  const { cli } = graphicsFixture(t);
  const result = cli("graphics-plan", "--opening", "overlay", "--opening-seconds", "3.003");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.clientId, "pastor_john");
  assert.equal(plan.laneId, "prayer");
  assert.equal(plan.captionOwner, "Opus Clip");
  assert.equal(plan.frameRate, "30000/1001");
  assert.equal(plan.style.brand.font, "Poppins");
  assert.equal(plan.style.lane.requiredLabel, "A PRAYER FOR");
  assert.equal(plan.outputs.cover.format, "png");
  assert.equal(plan.authoring, "Figma");
  assert.equal(plan.renderer, "figma");
  assert.equal(plan.outputs.opening.format, "png");
  assert.equal(plan.outputs.opening.alpha, true);
  assert.match(plan.outputs.opening.path, /opening\.png$/);
  assert.match(plan.style.policy.componentRefinement.policy, /role-matched/);
  assert.equal(plan.visualApproval, "pending");
  assert.match(plan.outputRoot, /745_CREATIVE\/renders$/);
});

test("Prayer cannot omit its opening treatment; optional Eric title can be omitted", (t) => {
  const { cli, activeFile } = graphicsFixture(t);
  assert.notEqual(cli("graphics-plan", "--opening", "none").status, 0);
  const active = JSON.parse(fs.readFileSync(activeFile, "utf8"));
  Object.assign(active, { clientId: "eric_miller", laneId: "market" });
  fs.writeFileSync(activeFile, JSON.stringify(active));
  const result = cli("graphics-plan", "--opening", "none");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).outputs.opening, null);
});

test("graphics planning excludes reference-only lanes and keeps Ben fonts pending", (t) => {
  const { cli, activeFile } = graphicsFixture(t);
  const active = JSON.parse(fs.readFileSync(activeFile, "utf8"));
  Object.assign(active, { laneId: "sermon" });
  fs.writeFileSync(activeFile, JSON.stringify(active));
  assert.match(cli("graphics-plan", "--opening", "none").stderr, /current batch/);
  Object.assign(active, { clientId: "pastor_ben", laneId: "teaching" });
  fs.writeFileSync(activeFile, JSON.stringify(active));
  const result = cli("graphics-plan", "--opening", "none");
  assert.equal(result.status, 0, result.stderr);
  assert.match(JSON.parse(result.stdout).style.brand.fontStatus, /Cambria pending/);
});

test("graphics check rejects stale plans and technically invalid pairs", (t) => {
  const { cli, dir, activeFile } = graphicsFixture(t);
  const result = cli("graphics-plan", "--opening", "overlay", "--opening-seconds", "3.003");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  const file = path.join(dir, "graphics-plan.json");
  fs.writeFileSync(file, JSON.stringify(plan));
  // No storage or image output is produced here. Probe fixtures exercise metadata checks only.
  const cover = path.join(dir, "cover.png");
  const opening = path.join(dir, "opening.mov");
  fs.writeFileSync(cover, "cover fixture");
  fs.writeFileSync(opening, "overlay fixture");
  const outside = cli("graphics-check", "--plan", file, "--cover", cover, "--opening", opening);
  assert.match(outside.stderr, /HomeSSD/);
  const active = JSON.parse(fs.readFileSync(activeFile, "utf8"));
  active.headline = "CHANGED COPY";
  fs.writeFileSync(activeFile, JSON.stringify(active));
  assert.match(cli("graphics-check", "--plan", file, "--cover", cover, "--opening", opening).stderr, /stale/);
});

test("scoped HyperFrames renders require the bound graphics variables plan", () => {
  const result = output(run({ hook_event_name: "PreToolUse", tool_name: "Bash",
    tool_input: { command: "hyperframes render videos/745-creative --output /Volumes/HomeSSD/Generated/745_CREATIVE/renders/opening.mov" } }));
  assert.equal(result.permissionDecision, "deny");
  assert.match(result.permissionDecisionReason, /graphics-plan/);
  assert.equal(run({ hook_event_name: "PreToolUse", tool_name: "Bash",
    tool_input: { command: "hyperframes render videos/lineups --output elsewhere.mov" } }).stdout, "");
});

test("nominal source rate governs the graphics plan, not its VFR average", (t) => {
  const { cli, dir } = graphicsFixture(t);
  const probe = path.join(dir, "ffprobe");
  fs.writeFileSync(probe, `#!/usr/bin/env python3
import json
print(json.dumps({"streams":[{"codec_type":"video", "r_frame_rate":"60000/1001", "avg_frame_rate":"1056600/17621"}]}))
`, { mode: 0o755 });
  const result = cli("graphics-plan", "--opening", "overlay", "--opening-seconds", "3");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.frameRate, "60000/1001");
  assert.equal(plan.sourceFrameRates.average, "1056600/17621");
});

test("graphics metadata checks accept an alpha pair and reject wrong geometry, codec, rate and duration", () => {
  const code = `import json,sys
sys.path.insert(0, ${JSON.stringify(path.join(root, ".codex/hooks"))})
from creative_745_graphics import check_streams
data=json.load(sys.stdin)
check_streams(data["metadata"], data["plan"], data["kind"])
`;
  const plan = { width: 1080, height: 1920, frameRate: "30000/1001", openingSeconds: 3.003 };
  const opening = { codec_type: "video", codec_name: "prores", profile: "4444", pix_fmt: "yuva444p10le",
    width: 1080, height: 1920, avg_frame_rate: "30000/1001", duration: "3.003" };
  const check = (streams, kind = "opening") => spawnSync("/usr/bin/python3", ["-c", code], {
    input: JSON.stringify({ metadata: { streams }, plan, kind }), encoding: "utf8",
  });
  assert.equal(check([opening]).status, 0);
  assert.equal(check([{ codec_type: "video", codec_name: "png", width: 1080, height: 1920 }], "cover").status, 0);
  for (const changed of [{ width: 1920 }, { codec_name: "h264" }, { pix_fmt: "yuv444p10le" },
    { avg_frame_rate: "30/1" }, { duration: "5" }, { duration: "nan" }])
    assert.notEqual(check([{ ...opening, ...changed }]).status, 0, JSON.stringify(changed));
  assert.notEqual(check([opening, { codec_type: "audio" }]).status, 0);
});

test("generated graphics import requires the adjacent current plan; raw footage remains unrelated", () => {
  const result = output(mutate("mcp__premiere_pro__import_media", {
    paths: ["/Volumes/HomeSSD/Generated/745_CREATIVE/renders/no-plan/cover.png"],
  }));
  assert.equal(result.permissionDecision, "deny");
  assert.match(result.permissionDecisionReason, /graphics-plan/);
  const nested = output(mutate("functions.exec", { code:
    'await tools.mcp__premiere_pro__import_media({paths:["/Volumes/HomeSSD/Generated/745_CREATIVE/renders/no-plan/cover.png"]});',
  }));
  assert.equal(nested.permissionDecision, "deny");
  assert.match(nested.permissionDecisionReason, /graphics-plan/);
  assert.equal(mutate("mcp__premiere_pro__import_media", { paths: ["/Volumes/MediaSSD/unrelated.mov"] }).stdout, "");
});

test("current pair completes the technical check and explicit import gate in an isolated storage fixture", (t) => {
  const { cli, env, project } = graphicsFixture(t, true);
  const result = cli("graphics-plan", "--renderer", "hyperframes", "--opening", "overlay", "--opening-seconds", "3.003");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  fs.mkdirSync(plan.jobDirectory, { recursive: true });
  fs.writeFileSync(plan.planPath, JSON.stringify(plan));
  fs.writeFileSync(plan.outputs.cover.path, "cover metadata fixture");
  fs.writeFileSync(plan.outputs.opening.path, "opening metadata fixture");
  // Normal project saves must not make this immutable graphics binding stale.
  fs.appendFileSync(project, "saved edit");
  const pair = cli("graphics-check", "--plan", plan.planPath, "--cover", plan.outputs.cover.path,
    "--opening", plan.outputs.opening.path);
  assert.equal(pair.status, 0, pair.stderr);
  const receipt = JSON.parse(pair.stdout);
  assert.equal(receipt.technicalStatus, "passed");
  assert.equal(receipt.visualApproval, "pending");
  assert.match(receipt.outputs.opening.sha256, /^[a-f0-9]{64}$/);
  const render = spawnSync("/usr/bin/python3", [hook], { encoding: "utf8", env,
    input: JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: {
      command: `hyperframes render videos/745-creative --variables-file '${plan.planPath}' --format mov --output '${plan.outputs.opening.path}' --frames-cache-dir '${env.STORAGE_GATE_ROOT}/hyperframes/cache/extracted-frames'`,
    } }),
  });
  assert.match(output(render).additionalContext, /GRAPHICS PLAN PASSED/);
  const imported = spawnSync("/usr/bin/python3", [hook], { encoding: "utf8", env,
    input: JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "mcp__premiere_pro__import_media", tool_input: {
      paths: [plan.outputs.cover.path, plan.outputs.opening.path],
    } }),
  });
  assert.match(output(imported).additionalContext, /TECHNICAL HANDOFF PASSED/);
});

test("Figma static PNG pair passes the manual check without approving pixels or licensing", (t) => {
  const { cli } = graphicsFixture(t, true);
  const result = cli("graphics-plan", "--opening", "overlay", "--opening-seconds", "3");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  fs.mkdirSync(plan.jobDirectory, { recursive: true });
  fs.writeFileSync(plan.planPath, JSON.stringify(plan));
  fs.writeFileSync(plan.outputs.cover.path, "PNG metadata fixture, not visual proof");
  fs.writeFileSync(plan.outputs.opening.path, "PNG metadata fixture, not visual proof");
  const checked = cli("graphics-check", "--plan", plan.planPath, "--cover", plan.outputs.cover.path,
    "--opening", plan.outputs.opening.path);
  assert.equal(checked.status, 0, checked.stderr);
  assert.equal(JSON.parse(checked.stdout).visualApproval, "pending");
});

test("static opening requires PNG alpha metadata; animated Figma handoff requires explicit MOV", (t) => {
  const { cli } = graphicsFixture(t);
  const result = cli("graphics-plan", "--opening", "overlay", "--opening-seconds", "3", "--opening-format", "mov");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.renderer, "figma");
  assert.equal(plan.outputs.opening.codec, "prores_4444");
  assert.notEqual(cli("graphics-plan", "--renderer", "hyperframes", "--opening-format", "png",
    "--opening", "overlay", "--opening-seconds", "3").status, 0);
  const code = `import json,sys
sys.path.insert(0, ${JSON.stringify(path.join(root, ".codex/hooks"))})
from creative_745_graphics import check_streams
data=json.load(sys.stdin)
check_streams(data, {"width":1080,"height":1920,"openingFormat":"png"}, "opening")
`;
  const check = (codec_name, pix_fmt) => spawnSync("/usr/bin/python3", ["-c", code], {
    encoding: "utf8", input: JSON.stringify({ streams: [{codec_type:"video",codec_name,pix_fmt,width:1080,height:1920}] }),
  });
  assert.equal(check("png", "rgba").status, 0);
  assert.notEqual(check("png", "rgb24").status, 0);
  assert.notEqual(check("h264", "rgba").status, 0);
});

test("HyperFrames cannot consume a Figma renderer plan silently", (t) => {
  const { cli, env } = graphicsFixture(t, true);
  const result = cli("graphics-plan", "--opening", "overlay", "--opening-seconds", "3");
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  fs.mkdirSync(plan.jobDirectory, { recursive: true });
  fs.writeFileSync(plan.planPath, JSON.stringify(plan));
  const rendered = spawnSync("/usr/bin/python3", [hook], { encoding:"utf8", env,
    input:JSON.stringify({hook_event_name:"PreToolUse",tool_name:"Bash",tool_input:{
      command:`hyperframes render videos/745-creative --variables-file '${plan.planPath}' --format mov --output '${plan.outputs.opening.path}'`,
    }}),
  });
  assert.match(output(rendered).permissionDecisionReason, /explicit.*fallback/);
});

test("745 Figma context is a reminder, keeps lane selection explicit and ignores other clients", () => {
  const result = output(mutate("mcp__codex_apps__figma_use_figma", {description:"745 Pastor John Bold Beliefs master"}));
  assert.match(result.additionalContext, /not a node-level mutation gate/);
  assert.match(result.additionalContext, /do not inherit active Prayer/);
  assert.match(result.additionalContext, /Required series-label container/);
  assert.equal(mutate("mcp__codex_apps__figma_use_figma", {description:"Lineups title master"}).stdout, "");
  const config = JSON.parse(fs.readFileSync(path.join(root, ".codex/hooks.json"), "utf8"));
  const gate = config.hooks.PreToolUse.find((entry) => entry.hooks.some((h) => h.command.includes("creative_745.py")));
  assert.match("mcp__codex_apps__figma_use_figma", new RegExp(gate.matcher));
});
