import { randomUUID } from "node:crypto";
import { prepareExpenseBatch, commitExpenseBatch, type BatchEntry } from "./batch.ts";
import type { AppData } from "./types.ts";
import { todayISO } from "./dates.ts";

type Snapshot = { data: AppData; revision: number };
type Draft = { id: string; entries: BatchEntry[]; revision: number; expires: number; threadId: string };

// Drafts remain in memory and are bound to the exact entries and ledger revision reviewed.
export function createExpenseReview(options: {
  read: () => Promise<Snapshot>;
  commit: Parameters<typeof commitExpenseBatch>[0]["commit"];
  now?: () => number;
}) {
  const drafts = new Map<string, Draft>();
  const now = options.now ?? Date.now;
  return {
    async prepare(output: { threadId: string; entries: BatchEntry[]; questions: string[] }) {
      if (!output || typeof output.threadId !== "string" || !Array.isArray(output.questions) || output.questions.some(q => typeof q !== "string"))
        throw new Error("The screenshot result could not be read.");
      if (output.questions.length) return { status: "questions" as const, questions: output.questions };
      const id = randomUUID();
      // Validation rejects invalid dates, amounts, names, categories and empty lists.
      const batch = prepareExpenseBatch(id, output.entries);
      const entries = batch.commands.map(command => {
        if (command.type !== "entry" || command.entry.type !== "expense" || !command.entry.category) throw new Error("Invalid expense.");
        const { name, amount, date, category } = command.entry;
        if (date > todayISO()) throw new Error("An expense date is in the future. Check the date.");
        return { name, amount, date, category };
      });
      const snapshot = await options.read();
      const duplicates = entries.map((entry, index) => ({ index, matches: snapshot.data.transactions.filter(t =>
        t.type === "expense" && t.date === entry.date && t.amount === entry.amount).map(t => t.name) })).filter(x => x.matches.length);
      for (const [key, draft] of drafts) if (draft.expires < now()) drafts.delete(key);
      drafts.set(id, { id, entries, revision: snapshot.revision, expires: now() + 30 * 60 * 1000, threadId: output.threadId });
      return { status: "review" as const, id, threadId: output.threadId, entries, duplicates, currentBalance: snapshot.data.currentBalance };
    },
    async confirm(id: string) {
      const draft = drafts.get(id);
      if (!draft || draft.expires < now()) { drafts.delete(id); throw new Error("This review expired. Start again."); }
      const result = await commitExpenseBatch({ batchId: draft.id, entries: draft.entries, reviewedRevision: draft.revision,
        timestamp: new Date(now()).toISOString(), read: options.read, commit: options.commit });
      const current = await options.read();
      return { status: "saved" as const, revision: result.revision, replayed: result.replayed, balance: current.data.currentBalance, threadId: draft.threadId };
    },
  };
}
