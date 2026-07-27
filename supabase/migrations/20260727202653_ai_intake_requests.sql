create table if not exists public.ai_intake_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (char_length(trim(email)) between 3 and 320),
  ai_wish text not null check (char_length(trim(ai_wish)) between 1 and 5000),
  helpful_context text,
  audio_object_path text,
  audio_file_name text,
  audio_content_type text,
  notion_page_id text,
  notion_delivery_state text not null default 'pending'
    check (notion_delivery_state in ('pending', 'delivered', 'failed')),
  notion_delivery_error text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists ai_intake_requests_created_at_idx
  on public.ai_intake_requests (created_at desc);

create index if not exists ai_intake_requests_notion_delivery_state_idx
  on public.ai_intake_requests (notion_delivery_state);

alter table public.ai_intake_requests enable row level security;
revoke all privileges on table public.ai_intake_requests from anon, authenticated;

insert into storage.buckets (id, name, public)
values ('ai-intake-voice-memos', 'ai-intake-voice-memos', false)
on conflict (id) do nothing;
