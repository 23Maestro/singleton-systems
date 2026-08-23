create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('income', 'bill', 'debt', 'expense')),
  name text not null,
  category text not null check (category in ('Income', 'Bill', 'Debt', 'Child Support', 'Food', 'Gas', 'Other')),
  amount numeric(12,2) not null check (amount >= 0),
  entry_date date,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists finance_entries_kind_idx
  on public.finance_entries (kind);
create index if not exists finance_entries_entry_date_idx
  on public.finance_entries (entry_date);
alter table public.finance_entries enable row level security;
revoke all privileges on table public.finance_entries from anon, authenticated;
