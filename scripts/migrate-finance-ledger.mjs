import { execFileSync } from "node:child_process";
import { SEED } from "../lib/ledger/seed.ts";
import { importLegacy } from "../lib/ledger/import-legacy.ts";
const cli = "/opt/homebrew/bin/supabase";
const run = (sql) => {
  const output = execFileSync(cli, ["db", "query", "--linked", sql], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  const result = JSON.parse(output);
  return result.rows;
};
const rows = run("select coalesce(jsonb_agg(to_jsonb(e) order by created_at,id),'[]'::jsonb) as entries from public.finance_entries e")[0].entries;
const data = importLegacy(rows, SEED);
if (!process.argv.includes("--apply")) {
  console.log(JSON.stringify({ mode: "read-only", legacyRecords: rows.length, catalogItems: data.planEntries.length, historicalTransactions: data.transactions.length, balanceSet: data.balanceSet }));
} else {
  const literal = value => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
  const snapshot = literal(rows);
  const sql = `begin;
    lock table public.finance_entries in share mode;
    do $check$ begin
      if (select coalesce(jsonb_agg(to_jsonb(e) order by created_at,id),'[]'::jsonb) from public.finance_entries e) <> ${snapshot}
      then raise exception 'Legacy records changed during migration. Retry the readback.'; end if;
    end $check$;
    insert into public.finance_ledger_state(id,data,legacy_snapshot) values('personal',${literal(data)},${snapshot}) on conflict(id) do nothing;
    commit;
    select revision,jsonb_array_length(legacy_snapshot) as legacy_records,jsonb_array_length(data->'planEntries') as catalog_items,jsonb_array_length(data->'transactions') as historical_transactions from public.finance_ledger_state where id='personal';`;
  console.log(JSON.stringify(run(sql)));
}
