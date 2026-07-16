create table if not exists public.cerebral_routes (
  id bigint generated always as identity primary key,
  route_key text not null unique,
  trigger_patterns text[] not null,
  lane text not null,
  owner text not null,
  intent text not null,
  shape text not null,
  required_tools text[] not null,
  review_gate text not null,
  priority integer not null default 100,
  enabled boolean not null default true,
  source_revision text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.harness_capabilities (
  id bigint generated always as identity primary key,
  capability_key text not null unique,
  capability_type text not null,
  canonical_name text not null,
  installed boolean,
  status text not null,
  path text,
  command text,
  interpreter text,
  verification_command text not null,
  evidence text not null,
  last_verified_at timestamptz,
  source_revision text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.harness_skills (
  id bigint generated always as identity primary key,
  skill_key text not null unique,
  activation text not null check (activation in ('core', 'disabled')),
  reason text not null,
  source_revision text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.harness_verification_events (
  id bigint generated always as identity primary key,
  capability_key text not null references public.harness_capabilities(capability_key) on delete cascade,
  verification_command text not null,
  result text not null,
  evidence text not null,
  verified_at timestamptz not null default now(),
  source_revision text not null
);

create index if not exists cerebral_routes_enabled_priority_idx
  on public.cerebral_routes (enabled, priority);

create index if not exists harness_capabilities_status_idx
  on public.harness_capabilities (status, capability_type);

create index if not exists harness_skills_activation_idx
  on public.harness_skills (activation);

create index if not exists harness_verification_events_capability_verified_idx
  on public.harness_verification_events (capability_key, verified_at desc);

alter table public.cerebral_routes enable row level security;
alter table public.harness_capabilities enable row level security;
alter table public.harness_skills enable row level security;
alter table public.harness_verification_events enable row level security;

drop policy if exists cerebral_routes_read_registry on public.cerebral_routes;
create policy cerebral_routes_read_registry
  on public.cerebral_routes for select
  to anon, authenticated
  using (enabled = true);

drop policy if exists harness_capabilities_read_registry on public.harness_capabilities;
create policy harness_capabilities_read_registry
  on public.harness_capabilities for select
  to anon, authenticated
  using (true);

drop policy if exists harness_skills_read_registry on public.harness_skills;
create policy harness_skills_read_registry
  on public.harness_skills for select
  to anon, authenticated
  using (true);

drop policy if exists harness_verification_events_read_registry on public.harness_verification_events;
create policy harness_verification_events_read_registry
  on public.harness_verification_events for select
  to anon, authenticated
  using (true);
