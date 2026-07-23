insert into storage.buckets (id, name, public)
values ('linear-inbox-drafts', 'linear-inbox-drafts', false)
on conflict (id) do nothing;
