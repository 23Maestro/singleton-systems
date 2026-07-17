# Singleton Systems Truth Matrix

## Purpose

This matrix names the owner for each kind of Singleton Systems truth so the
system stays professional without turning every idea into a database, folder, or
automation.

## Owner Matrix

| Truth type | Owner | Notes |
| --- | --- | --- |
| Raw thoughts, rough links, messy captures | Obsidian | Fast capture only. Promote after review. Legacy exports stay outside active folders until needed. |
| Active work, status, dates, dependencies | Opportunity HQ | Durable task/project queue. |
| Portfolio assets, screenshots, clips, examples | Eagle | Files and visual evidence live here. |
| Operating rules, prompts, routing contracts | Repo docs and skills | Versioned text stays in Git. |
| Desktop actions and launchers | Raycast | Buttons and wrappers, not business logic. |
| Routing/front-door judgment | Cerebral | System-prompt layer: inspect, route, review, verify. |
| Context packets and tool selection | Tool harness | Docs-only control surface until repetition earns code. |
| Durable business facts and event logs | Supabase | Use only when facts need querying, joins, reporting, or multi-surface reads. |

## Supabase Content Spine

These tables were deployed by migration `20260703013000_singleton_systems_v0`.
They are an optional queryable content/outreach spine, not the routing brain and
not a replacement for Opportunity HQ, Eagle, Obsidian, docs, or skills.

```text
content_references
  platform, reference_set (artist), source_url, direct_style, post_format, attack_type, notes

outreach_attempts
  target, platform, attempt_type, message_summary, reference_set, status, attempted_at, next_action_at

content_posts
  platform, post_format, direct_style, attack_type, source_asset, status, published_url, published_at

contacts
  name, company, platform, relationship_context, source_url, status, notes

portfolio_assets
  title, asset_type, eagle_item_id, public_url, related_task, related_post, status
```

Lean content shape:

```text
Platform -> Artist -> Attack -> Proof -> Post
```

`artist` is the working label for the reviewed creator/reference set; the
deployed table keeps its existing `reference_set` column. `template` remains
repo-owned skill/docs logic. Supabase stores metadata and real records, never
template copy or routing rules.

Initial platform map:

| Platform | Artist/reference | Proof direction |
| --- | --- | --- |
| LinkedIn | Zander Whitehurst + Aishwarya Srinivasan | Operator lesson, workflow proof |
| X | Pending real reference capture | Sharp insight, build note |
| Instagram | Pending real reference capture | Carousel, screenshot teardown, before/after |
| TikTok | Pending real reference capture | Fast demo, voiceover, visual proof |
| YouTube | Pending real reference capture | Walkthrough, case study, build log |

Only LinkedIn is canonical today. The other platform artists remain pending
until a real source is captured and reviewed.

Promotion flow:

```text
Obsidian or Opportunity HQ idea
  -> planning-idea-routing reviews whether it is reusable
  -> content_references stores approved source metadata
  -> offer-proof-content combines the reference with real proof
  -> portfolio_assets links Eagle evidence
  -> content_posts records the resulting draft or published output
```

Creator inspiration belongs in `content_references`. A person being contacted
belongs in `contacts` and `outreach_attempts`. Do not automatically copy every
idea, task page, draft, or template into Supabase.

Cerebral route packets belong in repo docs, skills, and the local route helper.
For example:

```text
[route] offer-content
[shape] working-brief
[tools] s-systems:offer-proof-content
[query] Turn this creator reference into a proof-led content angle.
```

The packet can point toward Supabase-backed references, but Supabase should only
store the approved source facts that need querying. If usage logging later
repeats enough to justify it, store metadata such as `route_key`, `shape`,
`requested_tool`, `created_at`, and linked owner IDs. Do not store packet
templates, prompt copy, or routing rules there.

## Non-Goals

```text
Do not move skill text into Supabase.
Do not create a social scheduler yet.
Do not make Supabase replace Opportunity HQ.
Do not make Eagle files duplicate database rows unless querying/reporting needs it.
Do not add a runtime harness, daemon, bot, or agent framework.
```

## First Implementation Gate

Before any additional Supabase migration, run a read-only design pass:

```text
1. Inventory current writers/readers.
2. Confirm which facts repeat at least 3 times.
3. Propose the smallest table set.
4. Name the verification path.
5. Get review before mutation.
```
