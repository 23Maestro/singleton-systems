alter table public.harness_skills
  add column if not exists canonical_path text
  generated always as ('plugins/s-systems/skills/' || skill_key) stored;

alter table public.harness_skills
  drop constraint if exists harness_skills_key_format_check;

alter table public.harness_skills
  add constraint harness_skills_key_format_check
  check (skill_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

drop policy if exists harness_skills_read_registry on public.harness_skills;
create policy harness_skills_read_registry
  on public.harness_skills for select
  to anon, authenticated
  using (true);

grant select on table public.harness_skills to anon, authenticated;
