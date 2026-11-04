-- Private source snapshot; task plans and calendar blocks keep their existing owner IDs.
alter table public.command_center_inbox add column source jsonb;
alter table public.command_center_inbox add constraint command_center_inbox_source_check
  check (source is null or coalesce(
    jsonb_typeof(source) = 'object'
    and source->>'provider' = 'craft'
    and source->>'spaceId' = 'f5b0a75f-1553-cc83-3804-f83592a53df1'
    and source->>'taskId' ~ '^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$'
    and length(source->>'title') between 1 and 255, false));
create unique index command_center_inbox_source_identity
  on public.command_center_inbox ((source->>'provider'), (source->>'spaceId'), (source->>'taskId'))
  where source is not null;

create function public.command_center_craft_import(p_tasks jsonb)
returns setof public.command_center_inbox
language plpgsql security invoker set search_path = public as $$
begin
  if jsonb_typeof(p_tasks) <> 'array' or jsonb_array_length(p_tasks) > 1000 then
    raise exception 'Invalid Craft inbox batch';
  end if;
  return query
  insert into public.command_center_inbox as prior (id, title, due_date, source)
  select incoming.id, incoming.title, incoming.due_date, incoming.source
  from jsonb_to_recordset(p_tasks) as incoming(id uuid, title text, due_date date, source jsonb)
  on conflict (id) do update
  set title = excluded.title, due_date = excluded.due_date, source = excluded.source,
      updated_at = case when (prior.title, prior.due_date, prior.source)
        is distinct from (excluded.title, excluded.due_date, excluded.source)
        then now() else prior.updated_at end
  where prior.source->>'provider' = 'craft'
    and prior.source->>'spaceId' = excluded.source->>'spaceId'
    and prior.source->>'taskId' = excluded.source->>'taskId'
  returning prior.*;
end;
$$;
revoke all on function public.command_center_craft_import(jsonb) from public, anon, authenticated;
grant execute on function public.command_center_craft_import(jsonb) to service_role;
