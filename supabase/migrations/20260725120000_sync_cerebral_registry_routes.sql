-- Keep the live routing path aligned with config/cerebral-registry.json.
-- `surface` is local-only metadata; cerebral_routes does not persist it.
insert into public.cerebral_routes (
  route_key, trigger_patterns, lane, owner, intent, shape, required_tools,
  review_gate, priority, enabled, source_revision
) values
  ('systems-tool-harness', array['SSystems','s-systems','tool[- ]harness','singleton23-local','plugin://s-systems','skill.*path','hook contract'], 'all_buckets', 'Docs/skills', 'Route SSystems plugin, skill, hook, and contract work through the canonical contract.', 'operating rule', array['s-systems:cerebral-router'], 'Run registry and hook checks before completion.', 10, true, '2026-07-22-systems-source-consolidation'),
  ('freelance-proposal', array['upwork','fiverr','contra','freelance','client post','paid client','gig proposal','freelance proposal'], 'all_buckets', 'Opportunity HQ', 'Turn a marketplace opportunity into a reviewed proposal or next action.', 'task', array['s-systems:freelance-gig-proposals'], 'Final Human Pass before showing or sending a proposal.', 20, true, '2026-07-22-systems-source-consolidation'),
  ('agency-growth', array['cold email','outbound','prospecting','ICP','ideal customer','objection','direct lead','sales sequence'], 'all_buckets', 'Opportunity HQ', 'Plan or execute direct B2B client acquisition from real signals and proof.', 'task', array['s-systems:agency-growth'], 'Final Human Pass before showing copy as final.', 30, true, '2026-07-22-systems-source-consolidation'),
  ('job-application', array['job application','resume','job post','survival job','blue collar job','white collar job'], 'all_buckets', 'Opportunity HQ', 'Tailor a truthful application or resume angle.', 'task', array['s-systems:job-application-resume'], 'Verify claims against source proof before final.', 40, false, '2026-07-22-systems-source-consolidation'),
  ('cover-note', array['cover letter','cover note','application message'], 'all_buckets', 'Opportunity HQ', 'Write a short, human note for an application or reply.', 'task', array['s-systems:cover-letter-casual'], 'Final Human Pass before final.', 45, false, '2026-07-22-systems-source-consolidation'),
  ('proof-packaging', array['eagle proof','portfolio asset','proof asset','project screenshot','workflow demo'], 'Portfolio', 'Eagle', 'Turn a real asset into a proof block or claim.', 'proof', array['s-systems:career-proof-packager','s-systems:eagle'], 'Verify the asset and claim source before publishing.', 50, true, '2026-07-22-systems-source-consolidation'),
  ('offer-content', array['linkedin post','instagram','content idea','social post','content calendar','proof content'], 'all_buckets', 'Docs/skills', 'Turn real proof into useful offer-aligned content.', 'proof', array['s-systems:offer-proof-content'], 'Final Human Pass before final.', 55, true, '2026-07-22-systems-source-consolidation'),
  ('opportunity-hq', array['opportunity hq','career hq','career task','career project','plan today','work date','goal horizon'], 'all_buckets', 'Opportunity HQ', 'Shape durable project or task work before mutation.', 'task', array['s-systems:opportunity-hq-updater'], 'Show task shape before mutation unless directly requested.', 60, true, '2026-07-22-systems-source-consolidation'),
  ('planning-routing', array['raw idea','someday','dependency','time block','planning logic','research lead','workflow idea'], 'all_buckets', 'Docs/skills', 'Classify a mixed idea and choose its owner surface.', 'operating rule', array['s-systems:planning-idea-routing'], 'Do not mutate a live surface until owner and next action are clear.', 65, true, '2026-07-22-systems-source-consolidation'),
  ('system-dashboard', array['career tracker','outreach dashboard','follow-up dashboard','active week dashboard','seven[- ]day dashboard','focused dashboard'], 'all_buckets', 'Next/Vercel', 'Define the seven-day review surface and its owner-backed dashboard contract.', 'prototype', array['design-canvas','paper-desktop:code-to-design'], 'Create the Paper frame only after Paper Desktop is connected; keep task state in its owners.', 68, true, '2026-07-22-systems-source-consolidation'),
  ('linear-action-gateway', array['linear graphql','linear api gateway','linear inbox','share sheet linear','raycast linear','mobile linear workflow','desktop linear workflow'], 'all_buckets', 'Linear', 'Serve /linear-inbox as the shared desktop and mobile create-or-update surface, backed by one server-side GraphQL gateway; the iOS Shortcut and Android share_target are thin capture pipes into it, not separate clients.', 'prototype', array['linear:linear','supabase:supabase'], 'Keep credentials server-side; verify GET context, create, update, draft capture, and the webhook status poll before changing the gateway.', 69, true, '2026-07-22-systems-source-consolidation'),
  ('visualization', array['likec4','architecture map','visual map','draw.io','diagram'], 'all_buckets', 'LikeC4', 'Create or update a reviewed visual system map.', 'HTML comp', array['s-systems:singleton-visualizer'], 'Validate the source map and human-readable output.', 70, true, '2026-07-22-systems-source-consolidation'),
  ('website-offer', array['website','landing page','hero','offer wording','workflow cleanup offer'], 'all_buckets', 'Docs/skills', 'Make an offer or site decision from the Singleton Systems business model.', 'operating rule', array['s-systems:singleton-systems'], 'Use real proof and Final Human Pass for publishable copy.', 75, true, '2026-07-22-systems-source-consolidation'),
  ('eagle-library', array['eagle library','eagle tag','eagle folder','find image','organize asset'], 'Portfolio', 'Eagle', 'Operate the Eagle asset library.', 'proof', array['s-systems:eagle'], 'Verify the selected asset before changing metadata.', 80, true, '2026-07-22-systems-source-consolidation')
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
