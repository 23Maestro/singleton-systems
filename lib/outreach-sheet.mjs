import { randomUUID } from "node:crypto";
import { getSheetsClient } from "./google-sheets.ts";
import { hashValue } from "./transactions/contract.mjs";
import { taskRequestSchema, verifyOutreachDraft } from "./task-request.ts";

export const OUTREACH_SHEET = "1RI6OGmv9HF5NTmHJu4Vk6QInT3Fs5-lOeXUZPTp8y28";
const TAB = "Prospects", TAB_ID = 755295409;
const HEADERS = ["Prospect", "Contact", "Status", "Sent at (ET)", "Follow-up due", "Next action", "Email thread", "Sample", "Market", "Relationship", "Contact source", "Video / service", "Evidence date", "Minutes", "Fit / qualification", "Website", "Stage order", "Board key"];
export const OUTREACH_FIELDS = ["Lead ID", "Assigned chat", "Request ID", "Request status", "Draft", "Draft request ID", "Draft source revision", "Draft updated at"];
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const text = cell => String(cell?.formattedValue ?? cell?.userEnteredValue?.stringValue ?? "");
const uri = `https://docs.google.com/spreadsheets/d/${OUTREACH_SHEET}/edit#gid=${TAB_ID}`;

export function outreachRow(cells, rowNumber) {
  const source = Object.fromEntries(HEADERS.slice(0, 16).map((header, i) => [header, { text: text(cells[i]), url: cells[i]?.hyperlink ?? null }]));
  const leadId = text(cells[18]) || null;
  if (leadId && !UUID.test(leadId)) throw new Error(`Invalid lead ID in row ${rowNumber}.`);
  return { leadId, rowNumber, name: source.Prospect.text, status: source.Status.text, source, sourceRevision: hashValue(source), assignedChat: text(cells[19]), requestId: text(cells[20]), requestStatus: text(cells[21]), draftBaseline: Array.from({ length: 4 }, (_, i) => text(cells[22 + i])), uri };
}

export async function readOutreachSheet(options = {}) {
  const sheets = options.sheets ?? await getSheetsClient();
  const { data } = await sheets.spreadsheets.get({ spreadsheetId: OUTREACH_SHEET, ranges: [`${TAB}!A6:Z1000`], includeGridData: true, fields: "spreadsheetId,sheets(properties(sheetId,title,gridProperties),data(startRow,rowData(values(formattedValue,userEnteredValue,hyperlink))))" });
  const sheet = data.sheets?.find(s => s.properties?.sheetId === TAB_ID && s.properties.title === TAB);
  if (data.spreadsheetId !== OUTREACH_SHEET || !sheet || (sheet.properties.gridProperties?.rowCount ?? 0) < 1000 || (sheet.properties.gridProperties?.columnCount ?? 0) < 26) throw new Error("The outreach Sheet or its bounds changed.");
  const block = sheet.data?.find(block => block.startRow === 5);
  const rows = block?.rowData;
  if (!rows?.length || HEADERS.some((header, i) => text(rows[0].values?.[i]) !== header)) throw new Error("The outreach headers changed; review the Sheet before writing.");
  const extra = Array.from({ length: 8 }, (_, i) => text(rows[0].values?.[18 + i]));
  if (extra.some((value, i) => value && value !== OUTREACH_FIELDS[i])) throw new Error("Reserved outreach columns contain other data; preserve them and review the mapping.");
  const leads = rows.slice(1).map((row, i) => outreachRow(row.values ?? [], i + 7)).filter(row => row.name);
  const ids = leads.map(row => row.leadId).filter(Boolean);
  if (new Set(ids).size !== ids.length) throw new Error("The Sheet has duplicate lead IDs.");
  return { sheets, fieldsReady: extra.every((value, i) => value === OUTREACH_FIELDS[i]), leads };
}

async function writeCells(sheets, range, values) {
  await sheets.spreadsheets.values.update({ spreadsheetId: OUTREACH_SHEET, range: `${TAB}!${range}`, valueInputOption: "RAW", requestBody: { values } });
}

function selected(snapshot, id) {
  const matches = snapshot.leads.filter(lead => lead.leadId === id);
  if (matches.length !== 1) throw new Error("The selected lead is missing or duplicated.");
  return matches[0];
}

export async function identifyOutreachLead(selection, options = {}) {
  const snapshot = await readOutreachSheet(options);
  const matches = snapshot.leads.filter(lead => lead.rowNumber === selection.rowNumber && lead.name === selection.name && lead.sourceRevision === selection.sourceRevision);
  if (matches.length !== 1) throw new Error("The selected lead changed; read and select it again.");
  const lead = matches[0];
  if (!snapshot.fieldsReady) {
    if (snapshot.leads.some(lead => lead.assignedChat || lead.requestId || lead.requestStatus || lead.draftBaseline.some(Boolean))) throw new Error("Unlabeled outreach columns contain data; preserve them.");
    await writeCells(snapshot.sheets, "S6:Z6", [OUTREACH_FIELDS]);
  }
  const id = lead.leadId ?? randomUUID();
  if (!lead.leadId) await writeCells(snapshot.sheets, `S${lead.rowNumber}`, [[id]]);
  const verified = await readOutreachSheet({ sheets: snapshot.sheets });
  const after = selected(verified, id);
  if (!verified.fieldsReady || after.sourceRevision !== selection.sourceRevision) throw new Error("The lead changed during identification; review the source.");
  return after;
}

export function prepareOutreachRequest(lead, destination, requestId = randomUUID(), createdAt = new Date().toISOString()) {
  if (!UUID.test(lead.leadId ?? "") || !["Awaiting reply", "Replied"].includes(lead.status)) throw new Error("Choose an identified lead that has already been contacted.");
  const record = { owner: "google-sheet", recordId: lead.leadId, uri: lead.uri };
  return taskRequestSchema.parse({ schemaVersion: 1, requestId, workflow: "outreach-followup", source: { ...record, revision: lead.sourceRevision }, destination, returnTo: record, context: { lead: lead.source, draftBaseline: lead.draftBaseline }, createdAt });
}

export async function bindOutreachRequest(envelope, options = {}) {
  const request = taskRequestSchema.parse(envelope);
  if (request.workflow !== "outreach-followup" || request.source.uri !== uri) throw new Error("This request does not belong to the outreach Sheet.");
  const snapshot = await readOutreachSheet(options), lead = selected(snapshot, request.source.recordId);
  if (!snapshot.fieldsReady || lead.sourceRevision !== request.source.revision) throw new Error("The lead changed after request review.");
  const destination = `${request.destination.hostId}:${request.destination.threadId}`;
  if (lead.requestId === request.requestId && lead.assignedChat === destination && lead.requestStatus === "Draft ready" && lead.draftBaseline[1] === request.requestId && lead.draftBaseline[2] === request.source.revision) return lead;
  if (lead.requestId && lead.requestId !== request.requestId && ["Queued", "Working"].includes(lead.requestStatus)) throw new Error("This lead already has pending work.");
  if (hashValue(lead.draftBaseline) !== hashValue(request.context.draftBaseline)) throw new Error("The saved draft changed after request review.");
  if (lead.requestId !== request.requestId || lead.assignedChat !== destination || lead.requestStatus !== "Queued") await writeCells(snapshot.sheets, `T${lead.rowNumber}:V${lead.rowNumber}`, [[destination, request.requestId, "Queued"]]);
  const after = selected(await readOutreachSheet({ sheets: snapshot.sheets }), lead.leadId);
  if (after.requestId !== request.requestId || after.assignedChat !== destination || after.sourceRevision !== request.source.revision) throw new Error("The Sheet did not confirm the request binding.");
  return after;
}

export async function returnOutreachDraft(envelope, draft, options = {}) {
  const request = taskRequestSchema.parse(envelope), result = verifyOutreachDraft(draft, request);
  if (request.source.uri !== uri) throw new Error("This draft does not belong to the outreach Sheet.");
  const snapshot = await readOutreachSheet(options), lead = selected(snapshot, request.source.recordId);
  const content = `${result.subject}\n\n${result.body}`;
  const destination = `${request.destination.hostId}:${request.destination.threadId}`;
  if (!snapshot.fieldsReady || lead.sourceRevision !== request.source.revision || lead.requestId !== request.requestId || lead.assignedChat !== destination) throw new Error("The lead, request or assigned chat changed. Keep this draft for review.");
  if (lead.draftBaseline[0] === content && lead.draftBaseline[1] === request.requestId && lead.draftBaseline[2] === request.source.revision && lead.requestStatus === "Draft ready") return lead;
  if (!["Queued", "Working"].includes(lead.requestStatus)) throw new Error("This request is no longer pending. Keep the returned draft for review.");
  if (hashValue(lead.draftBaseline) !== hashValue(request.context.draftBaseline)) throw new Error("The existing draft changed. Preserve it and review the returned draft.");
  // shortcut: Sheet writes use read/check/write; the single relay must keep the prior draft in its receipt.
  await writeCells(snapshot.sheets, `V${lead.rowNumber}:Z${lead.rowNumber}`, [["Draft ready", content, request.requestId, request.source.revision, new Date().toISOString()]]);
  const after = selected(await readOutreachSheet({ sheets: snapshot.sheets }), lead.leadId);
  if (after.sourceRevision !== request.source.revision || after.requestId !== request.requestId || after.draftBaseline[0] !== content || after.draftBaseline[1] !== request.requestId || after.draftBaseline[2] !== request.source.revision || after.requestStatus !== "Draft ready") throw new Error("The Sheet did not confirm the returned draft.");
  return after;
}
