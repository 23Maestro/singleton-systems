alter table public.cerebral_routes
  add column if not exists surface text,
  add column if not exists project text;

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

  if exists (
    select 1
    from jsonb_to_recordset(p_routes) as route_row(route_key text, surface text)
    where nullif(btrim(route_row.surface), '') is null
  ) then
    raise exception 'Route surfaces must not be blank';
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

  update public.cerebral_routes as registry_route
  set
    surface = route_row.surface,
    project = route_row.project
  from jsonb_to_recordset(p_routes) as route_row(route_key text, surface text, project text)
  where registry_route.route_key = route_row.route_key;

  return next;
end;
$$;
