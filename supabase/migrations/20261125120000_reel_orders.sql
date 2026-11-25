-- A parent's chosen highlight order. One row per submit; the latest row wins.
create table public.reel_orders (
  id uuid primary key default gen_random_uuid(),
  reel_id text not null,
  clip_order text[] not null,
  trashed text[] not null default '{}',
  submitted_at timestamptz not null default now()
);
create index reel_orders_reel_submitted on public.reel_orders(reel_id,submitted_at desc);
alter table public.reel_orders enable row level security;
revoke all on public.reel_orders from public,anon,authenticated;
grant select,insert on public.reel_orders to service_role;
