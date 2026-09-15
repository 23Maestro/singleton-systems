alter table public.ai_intake_requests
  add column if not exists offer text
  check (
    offer is null or offer in (
      'start-with-one-thing',
      'build-it-for-me',
      'keep-it-working',
      'build-my-ai-system'
    )
  );
