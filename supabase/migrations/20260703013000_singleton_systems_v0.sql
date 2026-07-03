create table if not exists public.content_references (
  id bigint generated always as identity primary key,
  platform text not null,
  reference_set text not null,
  source_url text,
  direct_style text,
  post_format text,
  attack_type text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.outreach_attempts (
  id bigint generated always as identity primary key,
  target text not null,
  platform text not null,
  attempt_type text,
  message_summary text,
  reference_set text,
  status text not null default 'planned',
  attempted_at timestamptz not null default now(),
  next_action_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.content_posts (
  id bigint generated always as identity primary key,
  platform text not null,
  post_format text,
  direct_style text,
  attack_type text,
  source_asset text,
  status text not null default 'draft',
  published_url text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id bigint generated always as identity primary key,
  name text not null,
  company text,
  platform text,
  relationship_context text,
  source_url text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_assets (
  id bigint generated always as identity primary key,
  title text not null,
  asset_type text,
  eagle_item_id text,
  public_url text,
  related_task text,
  related_post bigint references public.content_posts(id) on delete set null,
  status text not null default 'captured',
  created_at timestamptz not null default now()
);

create index if not exists content_references_platform_reference_set_idx
  on public.content_references (platform, reference_set);

create index if not exists outreach_attempts_platform_attempted_at_idx
  on public.outreach_attempts (platform, attempted_at desc);

create index if not exists outreach_attempts_status_next_action_at_idx
  on public.outreach_attempts (status, next_action_at);

create index if not exists content_posts_platform_status_idx
  on public.content_posts (platform, status);

create index if not exists content_posts_published_at_idx
  on public.content_posts (published_at desc);

create index if not exists contacts_platform_status_idx
  on public.contacts (platform, status);

create index if not exists portfolio_assets_status_idx
  on public.portfolio_assets (status);

create index if not exists portfolio_assets_related_post_idx
  on public.portfolio_assets (related_post);

alter table public.content_references enable row level security;
alter table public.outreach_attempts enable row level security;
alter table public.content_posts enable row level security;
alter table public.contacts enable row level security;
alter table public.portfolio_assets enable row level security;
