-- Contacts are the CRM owner. Existing contacts have no rows at the time of this design.
alter table public.contacts
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists lane text not null default 'AI Consultant',
  add column if not exists linear_project_id text,
  add column if not exists invoice_url text,
  add column if not exists payment_note text,
  add column if not exists next_action text,
  add column if not exists next_action_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists contacts_next_action_at_idx
  on public.contacts (next_action_at) where next_action_at is not null;

create table if not exists public.crm_interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id bigint not null references public.contacts(id) on delete cascade,
  channel text not null check (channel in ('email', 'call', 'message', 'meeting', 'other')),
  summary text not null check (length(btrim(summary)) > 0),
  occurred_at timestamptz not null default now(),
  external_url text,
  created_at timestamptz not null default now()
);
create index if not exists crm_interactions_contact_time_idx
  on public.crm_interactions (contact_id, occurred_at desc);

create table if not exists public.command_center_blocks (
  id uuid primary key default gen_random_uuid(),
  owner text not null check (owner in ('linear', 'notion', 'home', 'crm')),
  owner_id text not null,
  selected_date date not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint command_center_block_time_pair check
    ((starts_at is null and ends_at is null) or (starts_at is not null and ends_at is not null and ends_at > starts_at))
);
create index if not exists command_center_blocks_selected_date_idx
  on public.command_center_blocks (selected_date);
create index if not exists command_center_blocks_owner_idx
  on public.command_center_blocks (owner, owner_id);

create table if not exists public.command_center_work_lanes (
  owner text not null check (owner in ('linear', 'notion')),
  owner_id text not null,
  lane text not null check (lane in ('AI Consultant', 'Content Editor', 'Development')),
  updated_at timestamptz not null default now(),
  primary key (owner, owner_id)
);

create table if not exists public.crm_message_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  lane text not null check (lane in ('AI Consultant', 'Content Editor', 'Development')),
  subject text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contacts enable row level security;
alter table public.crm_interactions enable row level security;
alter table public.command_center_blocks enable row level security;
alter table public.command_center_work_lanes enable row level security;
alter table public.crm_message_drafts enable row level security;

revoke all on public.contacts, public.crm_interactions, public.command_center_blocks, public.command_center_work_lanes, public.crm_message_drafts from anon, authenticated;
grant select, insert, update, delete on public.contacts, public.crm_interactions, public.command_center_blocks, public.command_center_work_lanes, public.crm_message_drafts to service_role;
grant usage, select on sequence public.contacts_id_seq to service_role;
