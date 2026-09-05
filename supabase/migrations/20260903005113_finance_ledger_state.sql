begin;

create table public.finance_ledger_state (
  id text primary key check (id = 'personal'),
  revision bigint not null default 0 check (revision >= 0),
  data jsonb not null check (
    data ?& array['schemaVersion','transactions','planEntries','plannedPayments','currentBalance','balanceSet']
    and data->>'schemaVersion' = '2'
    and jsonb_typeof(data->'transactions') = 'array'
    and jsonb_typeof(data->'planEntries') = 'array'
    and jsonb_typeof(data->'plannedPayments') = 'array'
    and jsonb_typeof(data->'currentBalance') = 'number'
    and jsonb_typeof(data->'balanceSet') = 'boolean'
  ),
  legacy_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.finance_ledger_operations (
  id uuid primary key,
  request_hash text not null check (length(request_hash) = 64),
  kind text not null check (kind in ('entry','payment','reconcile','save-item')),
  revision bigint not null unique,
  created_at timestamptz not null default now()
);
alter table public.finance_ledger_state enable row level security;
alter table public.finance_ledger_operations enable row level security;
revoke all on public.finance_ledger_state, public.finance_ledger_operations from public, anon, authenticated;
grant select, insert, update on public.finance_ledger_state to service_role;
grant select, insert on public.finance_ledger_operations to service_role;

create function public.commit_finance_ledger(p_id uuid, p_hash text, p_revision bigint, p_data jsonb, p_kind text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  current_row public.finance_ledger_state%rowtype;
  previous_hash text;
begin
  select * into strict current_row from public.finance_ledger_state where id='personal' for update;
  select request_hash into previous_hash from public.finance_ledger_operations where id=p_id;
  if found then
    if previous_hash <> p_hash then raise exception 'Confirmation was already used with different details.'; end if;
    return jsonb_build_object('data', current_row.data, 'revision', current_row.revision, 'replayed', true);
  end if;
  if current_row.revision <> p_revision then return jsonb_build_object('conflict', true); end if;
  if p_data is null or p_hash is null or p_id is null then raise exception 'Invalid ledger command.'; end if;
  update public.finance_ledger_state set data=p_data, revision=revision+1, updated_at=now()
    where id='personal' returning * into current_row;
  insert into public.finance_ledger_operations(id, request_hash, kind, revision)
    values(p_id,p_hash,p_kind,current_row.revision);
  return jsonb_build_object('data',current_row.data,'revision',current_row.revision);
end;
$$;
revoke all on function public.commit_finance_ledger(uuid,text,bigint,jsonb,text) from public,anon,authenticated;
grant execute on function public.commit_finance_ledger(uuid,text,bigint,jsonb,text) to service_role;

-- Keep old previews from writing to a second owner after cutover.
create function public.finance_legacy_read_only() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if exists(select 1 from public.finance_ledger_state where id='personal') then
    raise exception 'This Ledger preview is retired. Open the current Ledger preview to save changes.';
  end if;
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;
revoke all on function public.finance_legacy_read_only() from public,anon,authenticated;
create trigger finance_legacy_read_only before insert or update or delete on public.finance_entries
  for each row execute function public.finance_legacy_read_only();

commit;
