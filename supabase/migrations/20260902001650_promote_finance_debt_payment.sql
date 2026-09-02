create or replace function public.promote_finance_debt_payment(
  p_debt_id uuid,
  p_amount numeric,
  p_entry_date date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  debt_row public.finance_entries%rowtype;
  payment_row public.finance_entries%rowtype;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'payment amount must be positive';
  end if;

  select * into debt_row
  from public.finance_entries
  where id = p_debt_id and kind = 'debt'
  for update;

  if not found then
    raise exception 'debt entry was not found';
  end if;
  if p_amount > debt_row.amount then
    raise exception 'payment exceeds the remaining debt balance';
  end if;

  update public.finance_entries
  set amount = amount - p_amount, updated_at = now()
  where id = p_debt_id
  returning * into debt_row;

  insert into public.finance_entries (kind, name, category, amount, entry_date, paid)
  values ('expense', debt_row.name || ' — extra payment', 'Debt', p_amount, p_entry_date, true)
  returning * into payment_row;

  return jsonb_build_object('debt', to_jsonb(debt_row), 'payment', to_jsonb(payment_row));
end;
$$;

revoke all on function public.promote_finance_debt_payment(uuid, numeric, date) from public, anon, authenticated;
grant execute on function public.promote_finance_debt_payment(uuid, numeric, date) to service_role;;
