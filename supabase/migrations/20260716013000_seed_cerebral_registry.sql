-- The hook has a local fallback, but this is the canonical live seed. Keep it
-- idempotent so a plugin refresh can be reseeded through the service script.
insert into public.cerebral_routes (
  route_key, trigger_patterns, lane, owner, intent, shape, required_tools,
  review_gate, priority, enabled, source_revision
) values
  ('systems-tool-harness', array['SSystems','s-systems','tool[- ]harness','singleton23-local','plugin://s-systems','skill.*path','hook contract'], 'Offer', 'Docs/skills', 'Route SSystems plugin, skill, hook, and harness work through the canonical contract.', 'operating rule', array['s-systems:tool-harness','s-systems:cerebral-router'], 'Run registry and hook checks before completion.', 10, true, '2026-07-16'),
  ('freelance-proposal', array['upwork','fiverr','contra','freelance','client post','paid client','gig proposal'], 'Freelance', 'Opportunity HQ', 'Turn a marketplace opportunity into a reviewed proposal or next action.', 'task', array['s-systems:freelance-gig-proposals'], 'Final Human Pass before showing or sending a proposal.', 20, true, '2026-07-16'),
  ('agency-growth', array['cold email','outbound','prospecting','ICP','ideal customer','objection','direct lead','sales sequence'], 'Offer', 'Opportunity HQ', 'Plan or execute direct B2B client acquisition from real signals and proof.', 'task', array['s-systems:agency-growth'], 'Final Human Pass before showing copy as final.', 30, true, '2026-07-16'),
  ('job-application', array['job application','resume','job post','survival job','blue collar job','white collar job'], 'Career Jobs', 'Opportunity HQ', 'Tailor a truthful application or resume angle.', 'task', array['s-systems:job-application-resume'], 'Verify claims against source proof before final.', 40, true, '2026-07-16'),
  ('cover-note', array['cover letter','cover note','application message'], 'Career Jobs', 'Opportunity HQ', 'Write a short, human note for an application or reply.', 'task', array['s-systems:cover-letter-casual'], 'Final Human Pass before final.', 45, true, '2026-07-16'),
  ('proof-packaging', array['eagle proof','portfolio asset','proof asset','project screenshot','workflow demo'], 'Portfolio', 'Eagle', 'Turn a real asset into a proof block or claim.', 'proof', array['s-systems:career-proof-packager','s-systems:eagle'], 'Verify the asset and claim source before publishing.', 50, true, '2026-07-16'),
  ('offer-content', array['linkedin post','instagram','content idea','social post','content calendar','proof content'], 'Offer', 'Docs/skills', 'Turn real proof into useful offer-aligned content.', 'proof', array['s-systems:offer-proof-content'], 'Final Human Pass before final.', 55, true, '2026-07-16'),
  ('opportunity-hq', array['opportunity hq','career hq','notion task','notion project','plan today','work date','goal horizon'], 'all_buckets', 'Opportunity HQ', 'Shape durable project or task work before mutation.', 'task', array['s-systems:opportunity-hq-updater'], 'Show task shape before mutation unless directly requested.', 60, true, '2026-07-16'),
  ('planning-routing', array['raw idea','someday','dependency','time block','planning logic','research lead','workflow idea'], 'all_buckets', 'Docs/skills', 'Classify a mixed idea and choose its owner surface.', 'operating rule', array['s-systems:planning-idea-routing'], 'Do not mutate a live surface until owner and next action are clear.', 65, true, '2026-07-16'),
  ('visualization', array['likec4','architecture map','visual map','draw.io','diagram'], 'Offer', 'LikeC4', 'Create or update a reviewed visual system map.', 'HTML comp', array['s-systems:singleton-visualizer'], 'Validate the source map and human-readable output.', 70, true, '2026-07-16'),
  ('website-offer', array['website','landing page','hero','offer wording','workflow cleanup offer'], 'Offer', 'Docs/skills', 'Make an offer or site decision from the Singleton Systems business model.', 'operating rule', array['s-systems:singleton-systems'], 'Use real proof and Final Human Pass for publishable copy.', 75, true, '2026-07-16'),
  ('eagle-library', array['eagle library','eagle tag','eagle folder','find image','organize asset'], 'Portfolio', 'Eagle', 'Operate the Eagle asset library.', 'proof', array['s-systems:eagle'], 'Verify the selected asset before changing metadata.', 80, true, '2026-07-16')
on conflict (route_key) do update set
  trigger_patterns = excluded.trigger_patterns, lane = excluded.lane, owner = excluded.owner,
  intent = excluded.intent, shape = excluded.shape, required_tools = excluded.required_tools,
  review_gate = excluded.review_gate, priority = excluded.priority, enabled = excluded.enabled,
  source_revision = excluded.source_revision, updated_at = now();

insert into public.harness_skills (skill_key, activation, reason, source_revision) values
  ('ad-creative-strategist', 'disabled', 'Generic Agency wrapper; offer-proof-content owns SSystems proof content.', '2026-07-16'),
  ('agency-growth', 'core', 'Direct B2B acquisition and outbound.', '2026-07-16'),
  ('auto-logger', 'disabled', 'Internal logging helper, not a prompt-facing route.', '2026-07-16'),
  ('bear', 'disabled', 'Archive/import only.', '2026-07-16'),
  ('career-proof-packager', 'core', 'Proof and portfolio packaging.', '2026-07-16'),
  ('cerebral-router', 'core', 'Front-door route selection.', '2026-07-16'),
  ('content-creator', 'disabled', 'Generic Agency wrapper; offer-proof-content owns SSystems content.', '2026-07-16'),
  ('cover-letter-casual', 'core', 'Short application notes.', '2026-07-16'),
  ('eagle-skill', 'core', 'Eagle operator contract; exposed as s-systems:eagle.', '2026-07-16'),
  ('foundation-pass', 'disabled', 'Wayfinder owns the active broad-build route.', '2026-07-16'),
  ('freelance-gig-proposals', 'core', 'Marketplace proposals.', '2026-07-16'),
  ('instagram-curator', 'disabled', 'Generic Agency wrapper; offer-proof-content owns SSystems social proof.', '2026-07-16'),
  ('job-application-resume', 'core', 'Application and resume work.', '2026-07-16'),
  ('linkedin-content-creator', 'disabled', 'Generic Agency wrapper; offer-proof-content owns SSystems LinkedIn proof.', '2026-07-16'),
  ('offer-proof-content', 'core', 'Proof-led content.', '2026-07-16'),
  ('opportunity-hq-updater', 'core', 'Durable task and project shaping.', '2026-07-16'),
  ('outbound-strategist', 'disabled', 'Consolidated into agency-growth.', '2026-07-16'),
  ('planning-idea-routing', 'core', 'Idea ownership and next action.', '2026-07-16'),
  ('podcast-strategist', 'disabled', 'Preserved Agency wrapper for Chinese podcast work; outside normal SSystems routing.', '2026-07-16'),
  ('sales-outreach', 'disabled', 'Consolidated into agency-growth.', '2026-07-16'),
  ('singleton-systems', 'core', 'Business and offer-level cross-surface decisions.', '2026-07-16'),
  ('singleton-visualizer', 'core', 'Visual system maps.', '2026-07-16'),
  ('tool-harness', 'core', 'Tool scope, review, and verification selection.', '2026-07-16'),
  ('wayfinder', 'core', 'Fuzzy or multi-session build direction.', '2026-07-16')
on conflict (skill_key) do update set
  activation = excluded.activation, reason = excluded.reason,
  source_revision = excluded.source_revision, updated_at = now();

insert into public.harness_capabilities (
  capability_key, capability_type, canonical_name, installed, status, path,
  command, verification_command, evidence, source_revision
) values
  ('s-systems-plugin', 'plugin', 's-systems@singleton23-local', true, 'verified', '/Users/singleton23/plugins/s-systems', '/Applications/ChatGPT.app/Contents/Resources/codex plugin list', '/Applications/ChatGPT.app/Contents/Resources/codex plugin list | rg ''s-systems@singleton23-local.*installed, enabled''', 'The local SSystems plugin is installed and enabled from its canonical source path.', '2026-07-16'),
  ('pdf-skill', 'skill', 'pdf:pdf', null, 'verify-on-use', null, '/Applications/ChatGPT.app/Contents/Resources/codex plugin list', '/Applications/ChatGPT.app/Contents/Resources/codex plugin list | rg ''pdf@openai-primary-runtime.*installed, enabled''', 'The PDF runtime path is versioned and must be discovered from the live plugin list before a path claim.', '2026-07-16'),
  ('homebrew', 'tool', 'Homebrew', null, 'verify-on-use', null, 'brew --prefix', 'brew --prefix', 'Homebrew prefix is machine-specific; discover it on use rather than storing a fixed path.', '2026-07-16'),
  ('repo-npm-binary', 'tool', 'repo-local npm binary', null, 'verify-on-use', 'node_modules/.bin', 'npm exec -- <tool>', 'ls -l node_modules/.bin/<tool>', 'Package binaries may be repo-local rather than global PATH commands.', '2026-07-16')
on conflict (capability_key) do update set
  capability_type = excluded.capability_type, canonical_name = excluded.canonical_name,
  installed = excluded.installed, status = excluded.status, path = excluded.path,
  command = excluded.command, verification_command = excluded.verification_command,
  evidence = excluded.evidence, source_revision = excluded.source_revision, updated_at = now();
