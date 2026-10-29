create table public.command_center_inbox (
 id uuid primary key,
 title text not null check (length(title) between 1 and 255),
 description text not null default '' check (length(description) <= 10000),
 lane text check (lane in ('Content Editor', 'AI Consultant', 'Development')),
 status text not null default 'Todo' check (status in ('Todo', 'In Progress', 'Done')),
 parent_id uuid references public.command_center_inbox(id),
 project_id text,
 project_name text,
 due_date date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (id <> parent_id)
);
alter table public.command_center_inbox enable row level security;
revoke all on public.command_center_inbox from anon, authenticated;
grant select, insert, update on public.command_center_inbox to service_role;
alter table public.command_center_task_plans drop constraint command_center_task_plans_owner_check;
alter table public.command_center_task_plans add constraint command_center_task_plans_owner_check check (owner in ('linear','asana','notion','dashboard'));
alter table public.command_center_blocks drop constraint command_center_blocks_owner_check;
alter table public.command_center_blocks add constraint command_center_blocks_owner_check check (owner in ('linear','asana','notion','home','crm','dashboard'));
