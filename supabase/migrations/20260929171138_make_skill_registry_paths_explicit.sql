alter table public.harness_skills
  alter column canonical_path drop expression;

drop policy if exists harness_capabilities_read_registry on public.harness_capabilities;
create policy harness_capabilities_read_registry
  on public.harness_capabilities for select
  to anon, authenticated
  using (true);

grant select on table public.harness_capabilities to anon, authenticated;

alter function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text)
  rename to seed_cerebral_registry_without_skill_paths;

create function public.seed_cerebral_registry(
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
  if exists (
    select 1
    from jsonb_to_recordset(p_skills) as skill_row(skill_key text, canonical_path text)
    where nullif(btrim(skill_row.canonical_path), '') is null
       or skill_row.canonical_path not in (
         '.agents/skills/' || skill_row.skill_key,
         'plugins/s-systems/skills/' || skill_row.skill_key,
         'skills/' || skill_row.skill_key
       )
  ) then
    raise exception 'Skill canonical paths must identify their repository skill folder';
  end if;

  select seeded.routes_count, seeded.skills_count, seeded.capabilities_count
  into routes_count, skills_count, capabilities_count
  from public.seed_cerebral_registry_without_skill_paths(
    p_routes,
    p_skills,
    p_capabilities,
    p_source_revision
  ) as seeded;

  update public.harness_skills as skill
  set canonical_path = skill_row.canonical_path
  from jsonb_to_recordset(p_skills) as skill_row(skill_key text, canonical_path text)
  where skill.skill_key = skill_row.skill_key;

  return next;
end;
$$;

revoke all on function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text) from public;
revoke all on function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text) from anon;
revoke all on function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text) from authenticated;
grant execute on function public.seed_cerebral_registry(jsonb, jsonb, jsonb, text) to service_role;
