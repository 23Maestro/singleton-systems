create table if not exists public.linear_inbox_drafts (
  id uuid primary key default gen_random_uuid(),
  sources jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);

create index if not exists linear_inbox_drafts_expires_at_idx
  on public.linear_inbox_drafts (expires_at);

create table if not exists public.linear_inbox_submissions (
  id bigint generated always as identity primary key,
  issue_id text not null unique,
  identifier text,
  title text,
  state text,
  label_names text[] not null default '{}',
  assignee_name text,
  status text not null default 'created' check (status in ('created', 'agent_updated', 'confirmed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists linear_inbox_submissions_issue_id_idx
  on public.linear_inbox_submissions (issue_id);

alter table public.linear_inbox_drafts enable row level security;
alter table public.linear_inbox_submissions enable row level security;

revoke all privileges on table public.linear_inbox_drafts from anon, authenticated;
revoke all privileges on table public.linear_inbox_submissions from anon, authenticated;
