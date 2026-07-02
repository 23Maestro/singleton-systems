# Singleton Systems Truth Matrix

## Purpose

This matrix names the owner for each kind of Singleton Systems truth so the
system stays professional without turning every idea into a database, folder, or
automation.

## Owner Matrix

| Truth type | Owner | Notes |
| --- | --- | --- |
| Raw thoughts, rough links, messy captures | Bear | Fast capture only. Promote after review. |
| Active work, status, dates, dependencies | Opportunity HQ | Durable task/project queue. |
| Portfolio assets, screenshots, clips, examples | Eagle | Files and visual evidence live here. |
| Operating rules, prompts, routing contracts | Repo docs and skills | Versioned text stays in Git. |
| Desktop actions and launchers | Raycast | Buttons and wrappers, not business logic. |
| Routing/front-door judgment | Cerebral | System-prompt layer: inspect, route, review, verify. |
| Context packets and tool selection | Tool harness | Docs-only control surface until repetition earns code. |
| Durable business facts and event logs | Supabase | Use only when facts need querying, joins, reporting, or multi-surface reads. |

## Supabase V0 Candidates

These are candidate tables, not approved migrations.

```text
content_references
  platform, reference_set, source_url, direct_style, post_format, attack_type, notes

outreach_attempts
  target, platform, attempt_type, message_summary, reference_set, status, attempted_at, next_action_at

content_posts
  platform, post_format, direct_style, attack_type, source_asset, status, published_url, published_at

contacts
  name, company, platform, relationship_context, source_url, status, notes

portfolio_assets
  title, asset_type, eagle_item_id, public_url, related_task, related_post, status
```

## Non-Goals

```text
Do not move skill text into Supabase.
Do not create a social scheduler yet.
Do not make Supabase replace Opportunity HQ.
Do not make Eagle files duplicate database rows unless querying/reporting needs it.
Do not add a runtime harness, daemon, bot, or agent framework.
```

## First Implementation Gate

Before any Supabase migration, run a read-only design pass:

```text
1. Inventory current writers/readers.
2. Confirm which facts repeat at least 3 times.
3. Propose the smallest table set.
4. Name the verification path.
5. Get review before mutation.
```
