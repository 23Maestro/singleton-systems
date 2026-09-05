begin;

do $$
declare
  operation_id constant uuid := 'd384193c-9965-4812-9357-59051e3e327b';
  request_hash constant text := '060f9cdeac7b7f54e0f3f6d8aa53648023b7f60b1fb711650101a94e86bb6202';
  current_row public.finance_ledger_state%rowtype;
  current_usaa jsonb;
  next_data jsonb;
  result jsonb;
begin
  select * into strict current_row
  from public.finance_ledger_state
  where id = 'personal'
  for update;

  if exists(select 1 from public.finance_ledger_operations where id = operation_id) then
    return;
  end if;

  if current_row.revision <> 3 then
    raise exception 'Finances changed since USAA was reviewed. Review before updating.';
  end if;

  select item.value into strict current_usaa
  from jsonb_array_elements(current_row.data->'planEntries') item(value)
  where item.value->>'id' = 'd6' and item.value->>'name' = 'USAA';

  if current_usaa->>'balance' <> '1000'
     or current_usaa->>'balanceDisplay' <> 'around $1,000 or less'
     or current_usaa->>'isApproximate' <> 'true' then
    raise exception 'USAA no longer matches the reviewed approximate total.';
  end if;

  select jsonb_set(
    current_row.data,
    '{planEntries}',
    jsonb_agg(
      case
        when item.value->>'id' = 'd6' then
          (item.value - 'amountDisplay' - 'balanceDisplay' - 'balanceQualifier' - 'isApproximate')
          || jsonb_build_object('balance', 1035)
        else item.value
      end
      order by item.ordinality
    )
  ) into next_data
  from jsonb_array_elements(current_row.data->'planEntries') with ordinality item(value, ordinality);

  result := public.commit_finance_ledger(
    operation_id,
    request_hash,
    current_row.revision,
    next_data,
    'save-item'
  );

  if coalesce((result->>'revision')::bigint, -1) <> 4 then
    raise exception 'USAA update was not confirmed: %', result;
  end if;
end;
$$;

commit;

select
  state.revision,
  item.value->>'name' as name,
  (item.value->>'balance')::numeric as total,
  item.value ? 'isApproximate' as still_approximate,
  item.value ? 'balanceDisplay' as has_approximate_display
from public.finance_ledger_state state
cross join lateral jsonb_array_elements(state.data->'planEntries') item(value)
where state.id = 'personal' and item.value->>'id' = 'd6';
