# Claude handoff: custom Opportunity HQ icon system

Build a custom, branded icon set for Singleton Systems and wire it into the
Notion CLI workflow. This is not a request to merely import Phosphor icons.
Phosphor supplies the glyph geometry; every final asset must be a custom
Singleton Systems app icon.

## Sources

- Installed library: `@phosphor-icons/react@2.1.10`
- Local package path:
  `/Users/singleton23/Documents/Development/singleton-systems/node_modules/@phosphor-icons/react`
- Optional visual references:
  `/Users/singleton23/Library/Mobile Documents/com~apple~CloudDocs/ssystem/Codex`
- Brand guide, if useful:
  `/Users/singleton23/Library/Mobile Documents/com~apple~CloudDocs/ssystem/Codex/Brand & Visual Style Guide SS.pdf`
- Notion CLI: `/opt/homebrew/bin/ntn`
- Canonical skill source:
  `/Users/singleton23/Documents/Development/singleton-systems/plugins/s-systems/skills/opportunity-hq-updater/SKILL.md`

Do not edit the plugin-cache copy directly. The current canonical skill does
not yet contain a durable icon contract, so add one there after the design is
approved.

## Visual contract

Every final icon uses this template:

- 512x512 master with true alpha.
- Raycast-style breathing room and readable small-size silhouette.
- Gunmetal border, glass surface, restrained inner glow.
- No outside background, no floating square behind the icon, no extra depth.
- Crisp edges. Do not make the glass treatment muddy or over-rendered.
- Duotone for databases, projects, clients, and parent deliverables.
- Fill for subtasks.
- Duotone uses one strong primary and one related secondary color. Fill uses
  the same client/project palette, not a random replacement.

## Locked starting families

Create these as custom icons, not stock exports:

| Key | Phosphor geometry | Weight | Direction |
| --- | --- | --- | --- |
| `client.active` | `UserCheck` | duotone | No circle. Contact plus check. Emerald/cyan family. |
| `client.lead` | compose `User` + `Asterisk` | duotone | Active lead with no delivery task. Amber/magenta family. Ginain Grayes is the example. |
| `project.client-work` | `AddressBookTabs` | duotone | Client delivery hub. |
| `project.ai-consulting` | `Target` | duotone | Keep the target concept, rebuilt through the custom template. |
| `project.content-editing` | `FilmSlate` | duotone | Comparable visual weight to Target. |
| `project.portfolio` | `BriefcaseMetal` | duotone | Proof and portfolio work. |
| `task.vsl` | `FilmScript` | duotone | Parent VSL deliverable. |
| `task.video-package` | `VideoCamera` | duotone | Parent multi-video deliverable. |
| `subtask.vsl` | `FilmScript` | fill | All VSL subtasks reuse this family. |
| `subtask.video-package` | `VideoCamera` | fill | All related package subtasks reuse this family. |

Useful secondary Phosphor options include `FilmStrip`, `Subtitles`,
`ClosedCaptioning`, `Scissors`, `MagicWand`, `MonitorPlay`, `Export`, and
`CheckCircle`. Only add one when it represents a genuinely different task
family.

## Client color rule

Each active client receives one locked palette in the registry. Parent tasks
use duotone; their subtasks use fill from that same palette.

Query the live Clients and Tasks databases with `ntn` before assigning other
clients. Status drives the client icon:

- `Active` -> `client.active`
- `Lead` -> `client.lead`

Do not invent a task icon for a lead who has no active delivery work.

## Drift prevention

Create one canonical manifest inside the canonical skill, for example:

`plugins/s-systems/skills/opportunity-hq-updater/assets/icon-registry.json`

The manifest must lock:

- icon key
- Phosphor component name or composition
- weight (`duotone` or `fill`)
- primary and secondary colors
- source/output paths
- asset checksum
- assignment rule or exact Notion page IDs
- version

Generate every SVG and PNG deterministically from that manifest. Do not hand
edit generated files after export.

All Notion icon writes must resolve an `icon_key` through the registry. Missing
or unknown keys must fail closed. Never fall back to emoji, a native Notion
icon, or a guessed Phosphor icon.

Use the current Notion API capability through `ntn`: upload the approved PNG as
a File Upload and patch the page icon with `type: file_upload`, or use an
already-approved stable external asset URL. Base64 is allowed as the generation
interchange, but do not send a raw data URL to Notion.

Add a dry-run command that prints:

`page title -> page id -> icon key -> asset -> action`

After each write, retrieve the page and verify the icon type. Add drift checks
for missing registry keys, missing assets, checksum mismatches, and skill text
that bypasses the registry.

## Work order and stop point

1. Inspect the installed Phosphor components and the optional references.
2. Produce a compact contact/project preview sheet.
3. Show the preview and proposed manifest to Jerami.
4. Stop. Do not mutate Notion before explicit approval.
5. After approval, implement the registry, generator, `ntn` apply path, and
   verification.
6. Sync the canonical plugin and run the repository drift and Cerebral checks.

Keep this system lean. The goal is a coherent visual language and deterministic
Notion writes, not a giant icon-management product.
