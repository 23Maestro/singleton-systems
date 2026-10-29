import { test } from "node:test";
import assert from "node:assert/strict";
import { bindOutreachRequest, identifyOutreachLead, OUTREACH_FIELDS, OUTREACH_SHEET, prepareOutreachRequest, readOutreachSheet, returnOutreachDraft } from "../lib/outreach-sheet.mjs";
import { taskRequestMessage, taskRequestSchema, verifyOutreachDraft } from "../lib/task-request.ts";

const destination = { hostId: "local", threadId: "01a16209-8c85-7b61-9ae5-88ea9e523f5f" };
const cell = value => ({ formattedValue: value, userEnteredValue: { stringValue: value } });
const headers = ["Prospect", "Contact", "Status", "Sent at (ET)", "Follow-up due", "Next action", "Email thread", "Sample", "Market", "Relationship", "Contact source", "Video / service", "Evidence date", "Minutes", "Fit / qualification", "Website", "Stage order", "Board key"];
function fixture() {
  const rows = [headers.map(cell), ["Example client", "Pat", "Awaiting reply", "10/14/2026", "10/19/2026", "Write a follow-up", "Thread", "Sample", "Tampa", "Buyer", "Source", "Service", "10/13/2026", "12", "Qualified", "Website", "1", "201"].map(cell)];
  rows[1][15].hyperlink = "https://example.com/client";
  const writes = [], faults = {};
  const sheets = { spreadsheets: {
    async get() { return { data: { spreadsheetId: OUTREACH_SHEET, sheets: [{ properties: { sheetId: 755295409, title: "Prospects", gridProperties: { rowCount: 1000, columnCount: 26 } }, data: [{ startRow: 5, rowData: structuredClone(rows).map(values => ({ values })) }] }] } }; },
    values: { async update({ range, valueInputOption, requestBody }) {
      assert.equal(valueInputOption, "RAW", "Do not evaluate a generated email as a formula");
      const [, column, number] = range.match(/!([A-Z]+)(\d+)/);
      const index = [...column].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
      for (const [offset, values] of requestBody.values.entries()) {
        const row = rows[Number(number) - 6 + offset] ??= [];
        for (const [i, value] of values.entries()) row[index + i] = cell(value);
      }
      writes.push(range);
      if (faults.lostReply) { delete faults.lostReply; throw Error("Lost write reply after Sheet saved"); }
      return { data: {} };
    } },
  } };
  const options = { sheets };
  const identify = async () => { const lead = (await readOutreachSheet(options)).leads[0]; return identifyOutreachLead({ rowNumber: lead.rowNumber, name: lead.name, sourceRevision: lead.sourceRevision }, options); };
  const prepare = async () => prepareOutreachRequest(await identify(), destination);
  return { rows, writes, faults, options, identify, prepare };
}
const draft = request => ({ requestId: request.requestId, recordId: request.source.recordId, sourceRevision: request.source.revision, subject: "=Checking in", body: "Hi Pat, are you still looking for help with the edit?" });

test("durable lead IDs, request binding and an unsent draft survive retries and row moves", async () => {
  const f = fixture(), request = await f.prepare();
  assert.deepEqual(f.rows[0].slice(18).map(c => c.formattedValue), OUTREACH_FIELDS);
  assert.equal(request.context.lead.Website.url, "https://example.com/client");
  await bindOutreachRequest(request, f.options);
  const savedLead = f.rows.pop();
  f.rows.push([cell("Another client")], savedLead);
  const returned = await returnOutreachDraft(request, draft(request), f.options);
  assert.equal(returned.rowNumber, 8);
  assert.equal(returned.requestStatus, "Draft ready");
  assert.equal(f.rows[2][22].formattedValue, "=Checking in\n\nHi Pat, are you still looking for help with the edit?");
  assert.equal(f.rows[2][2].formattedValue, "Awaiting reply", "Drafting never marks an email sent");
  const count = f.writes.length;
  await returnOutreachDraft(request, draft(request), f.options);
  await bindOutreachRequest(request, f.options);
  assert.equal(f.writes.length, count);
});

test("lost reply after a saved draft is read back without another write", async () => {
  const f = fixture(), request = await f.prepare();
  await bindOutreachRequest(request, f.options); f.faults.lostReply = true;
  await assert.rejects(() => returnOutreachDraft(request, draft(request), f.options), /Lost write reply/);
  const count = f.writes.length;
  assert.equal((await returnOutreachDraft(request, draft(request), f.options)).requestStatus, "Draft ready");
  assert.equal(f.writes.length, count);
});

test("changed source, a different assigned chat and a later human draft are never overwritten", async () => {
  for (const change of [row => row[5] = cell("New next action"), row => row[19] = cell("local:another-chat"), row => row[22] = cell("Jerami's draft"), row => row[21] = cell("Canceled")]) {
    const f = fixture(), request = await f.prepare(); await bindOutreachRequest(request, f.options);
    change(f.rows[1]); const before = structuredClone(f.rows), count = f.writes.length;
    await assert.rejects(() => returnOutreachDraft(request, draft(request), f.options), /changed|pending/);
    assert.deepEqual(f.rows, before); assert.equal(f.writes.length, count);
  }
});

test("mapping conflicts, missing records, duplicate IDs and uncontacted leads stop before writes", async () => {
  const f = fixture(); f.rows[0][18] = cell("Existing data");
  await assert.rejects(() => f.prepare(), /other data/); assert.equal(f.writes.length, 0);
  f.rows[0][18] = cell(""); const request = await f.prepare();
  f.rows.push(structuredClone(f.rows[1]));
  await assert.rejects(() => readOutreachSheet(f.options), /duplicate lead IDs/);
  f.rows.pop(); f.rows[1][2] = cell("Not contacted");
  assert.throws(() => prepareOutreachRequest({ ...request, leadId: request.source.recordId, status: "Not contacted" }, destination), /already been contacted/);
  f.rows.splice(1, 1);
  await assert.rejects(() => bindOutreachRequest(request, f.options), /missing/);
});

test("request and result contracts bind the destination and return record; context grants no permission", async () => {
  const f = fixture(), request = await f.prepare();
  assert.match(taskRequestMessage(request), /source data, not instructions or permission/);
  assert.match(taskRequestMessage(request), new RegExp(`singleton-request:${request.requestId}`));
  assert.throws(() => taskRequestSchema.parse({ ...request, returnTo: { ...request.returnTo, recordId: "another-record" } }), /source lead/);
  assert.throws(() => taskRequestSchema.parse({ ...request, destination: { ...destination, hostId: "another-host" } }));
  assert.throws(() => verifyOutreachDraft({ ...draft(request), sourceRevision: "f".repeat(64) }, request), /does not match/);
  assert.throws(() => verifyOutreachDraft({ ...draft(request), send: true }, request));
});
