with lane_updates(route_key, lane) as (
  values
    ('systems-tool-harness', 'System Maintenance'),
    ('freelance-proposal', 'AI Consultant'),
    ('agency-growth', 'AI Consultant'),
    ('job-application', 'Portfolio'),
    ('cover-note', 'Writing Review'),
    ('portfolio-packaging', 'Portfolio'),
    ('offer-content', 'Content Editor'),
    ('opportunity-hq', 'System Maintenance'),
    ('planning-routing', 'System Maintenance'),
    ('system-dashboard', 'Development'),
    ('linear-action-gateway', 'Development'),
    ('visualization', 'Development'),
    ('website-offer', 'AI Consultant'),
    ('eagle-library', 'Portfolio'),
    ('client-video', 'Content Editor')
)
update public.cerebral_routes as route
set
  lane = lane_updates.lane,
  source_revision = '2026-08-22-shared-delivery-gate',
  updated_at = now()
from lane_updates
where route.route_key = lane_updates.route_key;

insert into public.cerebral_routes (
  route_key,
  trigger_patterns,
  lane,
  owner,
  intent,
  shape,
  required_tools,
  review_gate,
  priority,
  enabled,
  source_revision,
  updated_at
)
values (
  'writing-review',
  array[
    'writing review',
    'say less pass',
    'rewrite.*email',
    'rewrite.*client',
    'edit.*client update',
    'tighten.*linear issue',
    'tighten.*notion',
    'compress.*handoff'
  ],
  'Writing Review',
  'Docs/skills',
  'Compress a reviewable artifact to the current truth, useful context, and next action required by its audience.',
  'review result',
  array['s-systems:cerebral-router'],
  'Keep source detail behind a link; show only the information the reader needs to act or decide.',
  47,
  true,
  '2026-08-22-shared-delivery-gate',
  now()
)
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
  updated_at = excluded.updated_at;

update public.harness_skills
set source_revision = '2026-08-22-shared-delivery-gate', updated_at = now();

update public.harness_capabilities
set source_revision = '2026-08-22-shared-delivery-gate', updated_at = now();
