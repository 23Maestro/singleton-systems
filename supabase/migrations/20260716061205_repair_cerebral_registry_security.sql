drop policy if exists harness_capabilities_read_registry on public.harness_capabilities;
create policy harness_capabilities_read_registry
  on public.harness_capabilities for select
  to authenticated
  using (true);

drop policy if exists harness_skills_read_registry on public.harness_skills;
create policy harness_skills_read_registry
  on public.harness_skills for select
  to authenticated
  using (true);

drop policy if exists harness_verification_events_read_registry on public.harness_verification_events;
create policy harness_verification_events_read_registry
  on public.harness_verification_events for select
  to authenticated
  using (true);

revoke all privileges on table public.cerebral_routes from anon, authenticated;
revoke all privileges on table public.harness_capabilities from anon, authenticated;
revoke all privileges on table public.harness_skills from anon, authenticated;
revoke all privileges on table public.harness_verification_events from anon, authenticated;

grant select on table public.cerebral_routes to anon, authenticated;
grant select on table public.harness_capabilities to authenticated;
grant select on table public.harness_skills to authenticated;
grant select on table public.harness_verification_events to authenticated;

create or replace function public.seed_cerebral_registry(
  p_routes jsonb,
  p_skills jsonb,
  p_capabilities jsonb,
  p_source_revision text
)
returns table(routes_count integer, skills_count integer, capabilities_count integer)
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_routes is null
     or jsonb_typeof(p_routes) is distinct from 'array'
     or p_skills is null
     or jsonb_typeof(p_skills) is distinct from 'array'
     or p_capabilities is null
     or jsonb_typeof(p_capabilities) is distinct from 'array'
  then
    raise exception 'Registry payloads must be JSON arrays';
  end if;

  if nullif(btrim(p_source_revision), '') is null then
    raise exception 'Source revision must not be blank';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('public.seed_cerebral_registry', 0));

  insert into public.cerebral_routes (
    route_key,
    trigger_patterns,
    lane,
    owner,
    intent,
    shape,
    required_tools,
    review_gate,
    priority,
    enabled,
    source_revision,
    updated_at
  )
  select
    route_key,
    trigger_patterns,
    lane,
    owner,
    intent,
    shape,
    required_tools,
    review_gate,
    priority,
    enabled,
    p_source_revision,
    now()
  from jsonb_to_recordset(p_routes) as route_row(
    route_key text,
    trigger_patterns text[],
    lane text,
    owner text,
    intent text,
    shape text,
    required_tools text[],
    review_gate text,
    priority integer,
    enabled boolean
  )
  on conflict (route_key) do update set
    trigger_patterns = excluded.trigger_patterns,
    lane = excluded.lane,
    owner = excluded.owner,
    intent = excluded.intent,
    shape = excluded.shape,
    required_tools = excluded.required_tools,
    review_gate = excluded.review_gate,
    priority = excluded.priority,
    enabled = excluded.enabled,
    source_revision = excluded.source_revision,
    updated_at = excluded.updated_at;

  update public.cerebral_routes
  set
    enabled = false,
    source_revision = p_source_revision,
    updated_at = now()
  where route_key not in (
    select route_key
    from jsonb_to_recordset(p_routes) as route_row(route_key text)
  );

  insert into public.harness_skills (
    skill_key,
    activation,
    reason,
    source_revision,
    updated_at
  )
  select
    skill_key,
    activation,
    reason,
    p_source_revision,
    now()
  from jsonb_to_recordset(p_skills) as skill_row(
    skill_key text,
    activation text,
    reason text
  )
  on conflict (skill_key) do update set
    activation = excluded.activation,
    reason = excluded.reason,
    source_revision = excluded.source_revision,
    updated_at = excluded.updated_at;

  update public.harness_skills
  set
    activation = 'disabled',
    source_revision = p_source_revision,
    updated_at = now()
  where skill_key not in (
    select skill_key
    from jsonb_to_recordset(p_skills) as skill_row(skill_key text)
  );

  insert into public.harness_capabilities (
    capability_key,
    capability_type,
    canonical_name,
    installed,
    status,
    path,
    command,
    interpreter,
    verification_command,
    evidence,
    last_verified_at,
    source_revision,
    updated_at
  )
  select
    capability_key,
    capability_type,
    canonical_name,
    installed,
    status,
    path,
    command,
    interpreter,
    verification_command,
    evidence,
    last_verified_at,
    p_source_revision,
    now()
  from jsonb_to_recordset(p_capabilities) as capability_row(
    capability_key text,
    capability_type text,
    canonical_name text,
    installed boolean,
    status text,
    path text,
    command text,
    interpreter text,
    verification_command text,
    evidence text,
    last_verified_at timestamptz
  )
  on conflict (capability_key) do update set
    capability_type = excluded.capability_type,
    canonical_name = excluded.canonical_name,
    installed = excluded.installed,
    status = excluded.status,
    path = excluded.path,
    command = excluded.command,
    interpreter = excluded.interpreter,
    verification_command = excluded.verification_command,
    evidence = excluded.evidence,
    last_verified_at = excluded.last_verified_at,
    source_revision = excluded.source_revision,
    updated_at = excluded.updated_at;

  update public.harness_capabilities
  set
    installed = false,
    status = 'retired',
    source_revision = p_source_revision,
    updated_at = now()
  where capability_key not in (
    select capability_key
    from jsonb_to_recordset(p_capabilities) as capability_row(capability_key text)
  );

  routes_count := jsonb_array_length(p_routes);
  skills_count := jsonb_array_length(p_skills);
  capabilities_count := jsonb_array_length(p_capabilities);
  return next;
end;
$$;

revoke all on function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text) from public;
revoke all on function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text) from anon;
revoke all on function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text) from authenticated;
grant execute on function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text) to service_role;
