# Context map

## Contexts

- [Shared delivery gate](./CONTEXT.md) — routes work across writing, Linear, Asana, Notion and Supabase.
- [Broadcast engine](./docs/broadcast-engine/CONTEXT.md) — turns LineUps scene data into lit broadcast graphics.

## Relationships

- Shared delivery gate to broadcast engine. The gate's Lane is a work initiative. The engine's Graphic lane is a LineUps graphic type. The two words never stand in for each other.
- Broadcast engine to LineUps workflow. The engine reuses LineUps templates, cues and review gates. It adds Blender as an engine; it does not replace the LineUps skill.
