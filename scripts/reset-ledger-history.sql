-- Approved clean slate: three old entries removed; HSN's first payment retained.
-- Original records remain recoverable in finance_entries and legacy_snapshot.
begin;
do $$
declare
  current_row public.finance_ledger_state%rowtype;
  next_data jsonb;
  kept jsonb;
begin
  select * into strict current_row from public.finance_ledger_state where id='personal' for update;
  if exists(select 1 from public.finance_ledger_operations where id='e094fa1d-e3e8-4c14-885f-9b684b9ca975') then
    return;
  end if;
  if current_row.revision <> 2 or current_row.data->>'currentBalance' <> '0'
     or jsonb_array_length(current_row.data->'transactions') <> 4
     or jsonb_array_length(current_row.data->'plannedPayments') <> 0 then
    raise exception 'Ledger changed since approval. Review before resetting.';
  end if;
  if not exists(select 1 from jsonb_array_elements(current_row.data->'planEntries') e where e->>'id'='d2' and e->>'balance'='769.24') then
    raise exception 'HSN balance changed. Review before resetting.';
  end if;
  if (select count(*) from jsonb_array_elements(current_row.data->'transactions') t where
    (t->>'id'='f02c1a01-a1e2-4cd0-9cda-ccdcabedecd1' and t->>'name'='Catena Media' and t->>'amount'='595') or
    (t->>'id'='890b80d0-b9b6-47c0-b65a-b7e9e290d360' and t->>'name'='Future Voices (Arrow)' and t->>'amount'='51') or
    (t->>'id'='62332e53-3ba8-4a6c-835c-0a14f390347e' and t->>'name'='Daycare' and t->>'amount'='340')) <> 3 then
    raise exception 'The approved removal targets do not match.';
  end if;
  select t || jsonb_build_object('name','HSN / Synchrony — first payment','historical',true,'planEntryId','d2') into strict kept
    from jsonb_array_elements(current_row.data->'transactions') t
    where t->>'id'='8c86daca-d3de-4d5f-9cbf-2704212043f9' and t->>'amount'='150' and t->>'date'='2026-08-19';
  next_data := current_row.data || jsonb_build_object('transactions',jsonb_build_array(kept),'balanceSet',true,'currentBalance',0);
  perform public.commit_finance_ledger('e094fa1d-e3e8-4c14-885f-9b684b9ca975',
    '6d38e9ce429b932f4a9a3c51d0b358f70a5c68e3e4be0280cb7ef723e82aac7a', current_row.revision, next_data, 'reconcile');
end;
$$;
commit;
select revision, data->'currentBalance' as cash, data->'transactions' as retained_history,
  jsonb_array_length(data->'planEntries') as plan_items,
  jsonb_array_length(legacy_snapshot) as recoverable_legacy_records
from public.finance_ledger_state where id='personal';
