-- Keep resume, experience, and career-reference requests on the live route.
insert into public.cerebral_routes (
  route_key, trigger_patterns, lane, owner, intent, shape, required_tools,
  review_gate, priority, enabled, source_revision
) values
  ('job-application', array['job application','resume','job post','survival job','blue collar job','white collar job','career','career experience','work experience','work history','career reference','reference letter','professional reference'], 'all_buckets', 'Opportunity HQ', 'Use canonical resume JSON to give a truthful resume, experience, or career-reference angle without requiring PDF extraction.', 'task', array['s-systems:job-application-resume'], 'Verify claims against the canonical resume JSON or source evidence before final.', 40, true, '2026-07-22-systems-source-consolidation'),
  ('cover-note', array['cover letter','cover note','application message'], 'all_buckets', 'Opportunity HQ', 'Write a short, human note for an application or reply.', 'task', array['s-systems:cover-letter-casual'], 'Final Human Pass before final.', 45, true, '2026-07-22-systems-source-consolidation')
on conflict (route_key) do update set
  trigger_patterns = excluded.trigger_patterns,
  lane = excluded.lane,
  owner = excluded.owner,
  intent = excluded.intent,
  shape = excluded.shape,
  required_tools = excluded.required_tools,
  review_gate = excluded.review_gate,
  priority = excluded.priority,
  enabled = excluded.enabled,
  source_revision = excluded.source_revision,
  updated_at = now();
