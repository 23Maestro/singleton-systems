-- Keep one versioned source outside Codex's repository skill discovery path.
insert into public.harness_skills
  (skill_key, canonical_path, activation, reason, source_revision)
values
  ('firecrawl-research', 'skills/firecrawl-research', 'core',
   'General public-source inspection, hashed research evidence and component reference audits.',
   '2026-10-27-lineups-editor-v1')
on conflict (skill_key) do update set
  canonical_path = excluded.canonical_path,
  activation = excluded.activation,
  reason = excluded.reason,
  source_revision = excluded.source_revision,
  updated_at = now();
