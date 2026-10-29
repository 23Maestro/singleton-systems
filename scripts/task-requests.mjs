import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { hashValue } from "../lib/transactions/contract.mjs";
import { identifyOutreachLead, prepareOutreachRequest, readOutreachSheet } from "../lib/outreach-sheet.mjs";
import { enqueueOutreachRequest, processOutreachRequest, taskQueueClient } from "../lib/task-request-relay.mjs";

try {
  const [command = "help", ...args] = process.argv.slice(2), flags = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, "");
    if (!args[i]?.startsWith("--") || !args[i + 1] || args[i + 1].startsWith("--") || !["row", "name", "source-revision", "lead", "thread", "file", "approved-hash", "request", "wait-seconds"].includes(key) || Object.hasOwn(flags, key)) throw new Error("Use known options with one value each.");
    flags[key] = args[i + 1];
  }
  let result;
  if (command === "help" || command === "--help") result = { usage: "list; identify --row N --name NAME --source-revision HASH; plan --lead UUID --thread UUID; enqueue --file PLAN --approved-hash HASH; status --request UUID; relay --request UUID [--wait-seconds 30]. Delivery uses the selected local Codex chat. The hosted queue must be configured; no local queue is substituted." };
  else if (command === "list") {
    const sheet = await readOutreachSheet();
    result = { fieldsReady: sheet.fieldsReady, leads: sheet.leads.map(lead => ({ leadId: lead.leadId, row: lead.rowNumber, name: lead.name, status: lead.status, sourceRevision: lead.sourceRevision })) };
  } else if (command === "identify") {
    const lead = await identifyOutreachLead({ rowNumber: Number(flags.row), name: flags.name, sourceRevision: flags["source-revision"] });
    result = { leadId: lead.leadId, name: lead.name, sourceRevision: lead.sourceRevision };
  } else if (command === "plan") {
    const sheet = await readOutreachSheet(), lead = sheet.leads.find(lead => lead.leadId === flags.lead);
    if (!lead) throw new Error("Choose an identified outreach lead.");
    const request = prepareOutreachRequest(lead, { hostId: "local", threadId: flags.thread });
    result = { request, approvedHash: hashValue(request) };
  } else if (command === "enqueue") {
    if (!flags.file) throw new Error("Choose a reviewed request file.");
    const input = JSON.parse(fs.readFileSync(flags.file, "utf8"));
    const row = await enqueueOutreachRequest(input.request ?? input, { approvedHash: flags["approved-hash"] });
    result = { requestId: row.requestId, status: row.status };
  } else if (command === "status" || command === "relay") {
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(flags.request ?? "")) throw new Error("Choose an exact request ID.");
    const queue = taskQueueClient(command === "relay" ? "relay" : "backend");
    let row = await queue.read(flags.request);
    if (!row) throw new Error("The selected request was not found.");
    if (command === "status") result = { requestId: row.requestId, status: row.status, turnId: row.turnId, error: row.error };
    else {
      const wait = Number(flags["wait-seconds"] ?? 30);
      if (!Number.isInteger(wait) || wait < 0 || wait > 60) throw new Error("Wait 0–60 seconds.");
      const workerId = randomUUID();
      row = await queue.command({ action: row.status === "queued" ? "claim" : "resume", workerId, requestId: flags.request });
      if (!row) throw new Error("Another relay already claimed this request.");
      const deadline = Date.now() + wait * 1000;
      do {
        result = await processOutreachRequest(row, { queue, workerId });
        if (result.outcome !== "working" || Date.now() >= deadline) break;
        await new Promise(resolve => setTimeout(resolve, 2000));
        row = await queue.read(flags.request);
      } while (row);
      result = { outcome: result.outcome, requestId: flags.request, turnId: result.turnId, draft: result.result, error: result.error };
    }
  } else throw new Error("Use list, identify, plan, enqueue, status or relay.");
  console.log(JSON.stringify(result));
  if (result.outcome === "needs_review" || result.outcome === "failed") process.exitCode = 1;
} catch (error) {
  console.log(JSON.stringify({ outcome: "incomplete", error: error.message }));
  process.exitCode = 1;
}
