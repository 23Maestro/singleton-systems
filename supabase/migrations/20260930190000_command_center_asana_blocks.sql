-- Asana owns tasks; Supabase stores their calendar placement only.
alter table public.command_center_blocks
  drop constraint if exists command_center_blocks_owner_check;
alter table public.command_center_blocks
  add constraint command_center_blocks_owner_check
  check (owner in ('linear', 'asana', 'notion', 'home', 'crm'));
