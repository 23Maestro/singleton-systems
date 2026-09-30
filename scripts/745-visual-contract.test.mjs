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
const sequenceId = "db95fd6e-2826-4b79-b9b8-7d78125bdb78";
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
  for (const name of ["mcp__premiere_pro__add_text_overlay", "mcp__cua_repl__js", "functions.exec"])
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
