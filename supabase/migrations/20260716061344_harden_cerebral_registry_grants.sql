revoke all privileges on table public.cerebral_routes from anon, authenticated;
revoke all privileges on table public.harness_capabilities from anon, authenticated;
revoke all privileges on table public.harness_skills from anon, authenticated;
revoke all privileges on table public.harness_verification_events from anon, authenticated;

grant select on table public.cerebral_routes to anon, authenticated;
grant select on table public.harness_capabilities to authenticated;
grant select on table public.harness_skills to authenticated;
grant select on table public.harness_verification_events to authenticated;
