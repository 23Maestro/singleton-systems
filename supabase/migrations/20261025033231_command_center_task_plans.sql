-- Dashboard planning is separate from source-task deadlines and calendar blocks.
create table public.command_center_task_plans (
  owner text not null check (owner in ('linear', 'asana', 'notion')),
  owner_id text not null check (length(owner_id) between 1 and 160),
  period text not null default 'inbox' check (period in ('inbox', 'day', 'week', 'month', 'someday')),
  planned_date date,
  duration_minutes integer check (duration_minutes between 5 and 1440 and duration_minutes % 5 = 0),
  updated_at timestamptz not null default now(),
  primary key (owner, owner_id),
  constraint task_plan_date check (
    (period in ('inbox', 'someday') and planned_date is null)
    or (period in ('day', 'week', 'month') and planned_date is not null)
  ),
  constraint task_plan_week check (period <> 'week' or extract(isodow from planned_date) = 1),
  constraint task_plan_month check (period <> 'month' or extract(day from planned_date) = 1)
);
alter table public.command_center_task_plans enable row level security;
revoke all on public.command_center_task_plans from anon, authenticated;
grant select, insert, update, delete on public.command_center_task_plans to service_role;
