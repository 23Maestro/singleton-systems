---
name: lineups-editor
description: Use for Catena Media Lineups episodes, approved lanes, Figma or Blender builds and reviewed delivery.
---

# Lineups editor

Start with the [stage index](references/lineups-treatment-system.md) and
[current corrections](references/lineups-corrections.md). Load the references
for the current stage. Keep lane, option, setting and engine separate.

| Work | Read |
| --- | --- |
| Ingest or close an episode; recover prior work | [Episode lifecycle](references/lineups-episode-lifecycle.md) |
| Review the transcript and choose scenes | SELECT in the stage index |
| Find or prepare art | ASSET; [asset search](references/lineups-asset-search.md) for missing art |
| Build or repair a scene | BUILD; TEAM when the scene uses team cards |
| Bind speech and motion | [Motion contract](references/lineups-motion-contract.md) |
| Export, import or deliver | REVIEW; [delivery contract](references/lineups-delivery-contract.md) |

Use `s-systems:client-video-storyboard` for shared intake and Premiere handoff.
Asana owns the episode task. Eagle owns source assets. The episode record keeps
scene IDs, transcript revisions, engine choices and review evidence.

## Start from chat

When Jerami says a Lineups episode is ready to start, resolve
the exact episode record and verify its Asana task in the Catena section
of Content Editor. If the episode is ambiguous, resolve it before starting.
Start or resume its Catena Media project in Studio.
Run from the repository root. Set `LINEUPS_SKILL_DIR` to the directory that
contains this skill.

```sh
node --env-file=.env.local "$LINEUPS_SKILL_DIR/scripts/studio-lineups-start.mjs" --episode EPISODE_RECORD --title "Episode title"
```

Use the configured `STUDIO_ORIGIN` and server-side producer credential.
Return the Studio link from the command. If it fails, report that Studio
did not confirm the project. A closed project stays closed. The project
link records intake. Follow the episode lifecycle and its review gates
before building or delivering.

## Send the storyboard to Studio

At the storyboard review gate, set `CATENA_PREVIEW_DIRECTORY` to a folder for
the episode under the verified Catena preview root on HomeSSD. Keep the source
packet and Studio assets there. Follow the Studio packet build in the
repository's `tools/review_workspace/README.md`. Use the same episode record
and title.

```sh
node --env-file=.env.local "$LINEUPS_SKILL_DIR/scripts/studio-lineups-start.mjs" --episode "$EPISODE_RECORD" --title "$EPISODE_TITLE" \
  --packet "$CATENA_PREVIEW_DIRECTORY/studio/packet.json"
```

The command uploads the review assets, attaches the scene versions to the
Catena Media project, and binds the current Codex thread and producer host.
If the environment does not supply either ID, pass the verified ID with
`--chat-id` or `--host-id`. Read back the project, packet revision and chat
before handing Jerami the Studio link. Attach updated artwork and motion with
the same command and project. The project keeps its source chat. If the chat
or host is unknown, stop and report the missing ID.

In Studio, **Open source chat** opens the bound thread. **Send to chat** is the
separate action for sending reviewed feedback. Use the saved batch and require
a delivery receipt for that exact thread before reporting it sent.

Follow the [episode order](references/lineups-episode-lifecycle.md#fixed-flow).
Studio holds the candidate packet, review and finished art. It replaces the
Pre-Figma and Post-Figma pages for new episodes. Builds wait for Jerami's
candidate approval. Each approved scene uses its recorded Figma or Blender
route. Unreal is retired for new builds.

Before Figma work, load `singleton-figma-system` and its Lineups production
reference. Reuse the current registered source. Bind speech cues before mutation.
Preserve live user edits and scoped approvals. Recover the matching prior handoff
before calling a source missing; reconcile a conflicting rule at its owner.

The [contract gate](references/lineups-contract-gate.md) owns shared
build and handoff checks. Follow the episode's declared order. A passing check
cannot supply visual approval or prove delivery. Use the shared review engine
for frame comments, review batches and sending.
