-- Run in one transaction and roll back all regression changes.
do $test$
declare
  result jsonb;
  state jsonb := '{"schemaVersion":2,"balanceSet":true,"currentBalance":59,"transactions":[],"plannedPayments":[],"planEntries":[]}'::jsonb;
  request_id uuid := gen_random_uuid();
  mismatch_rejected boolean := false;
begin
  if exists(select 1 from public.finance_ledger_state where id='personal') then
    raise exception 'Run this test before live cutover, or use a disposable test database.';
  end if;
  insert into public.finance_ledger_state(id,data,legacy_snapshot) values('personal',state,'[]');
  result := public.commit_finance_ledger(request_id,repeat('a',64),0,jsonb_set(state,'{currentBalance}','2059'),'entry');
  if result->>'revision' <> '1' or result->'data'->>'currentBalance' <> '2059' then raise exception 'Atomic write failed'; end if;
  result := public.commit_finance_ledger(request_id,repeat('a',64),0,jsonb_set(state,'{currentBalance}','4059'),'entry');
  if result->>'revision' <> '1' or result->'data'->>'currentBalance' <> '2059' or result->>'replayed' <> 'true' then raise exception 'Replay failed'; end if;
  result := public.commit_finance_ledger(gen_random_uuid(),repeat('b',64),0,state,'entry');
  if result->>'conflict' <> 'true' then raise exception 'Stale write was accepted'; end if;
  begin
    perform public.commit_finance_ledger(request_id,repeat('c',64),1,state,'entry');
  exception when others then mismatch_rejected := true;
  end;
  if not mismatch_rejected then raise exception 'Reused key accepted different details'; end if;
  if has_table_privilege('anon','public.finance_ledger_state','SELECT') or has_table_privilege('authenticated','public.finance_ledger_state','UPDATE')
     or has_function_privilege('anon','public.commit_finance_ledger(uuid,text,bigint,jsonb,text)','EXECUTE')
     or has_function_privilege('authenticated','public.commit_finance_ledger(uuid,text,bigint,jsonb,text)','EXECUTE') then
     raise exception 'Ledger permissions are too broad';
  end if;
end;
$test$;
select 'PASS: atomic write, replay, stale revision, key mismatch, private grants. All test changes rolled back.' as result;
