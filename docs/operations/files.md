# File homes

Choose a home by purpose. JSON can be source, proof or a temporary file.

## Canonical folders

| Folder or file | Owns |
| --- | --- |
| `docs/story-and-career/` | Shared story, career facts and source records |
| `docs/operations/README.md` | Operations entry point |
| `docs/operations/content-editor/` | Editing offers, audience, clients, growth and outreach |
| `docs/operations/ai-consulting/` | Consulting offers, audience, clients, growth and outreach |
| `docs/operations/clients-and-outreach.md` | Shared client and outreach record rules |
| `docs/operations/development/README.md` | Technical execution rules |
| `docs/website/` | Shared brand, SEO checks, form owners and website routing |
| `docs/website/content-editor/` and `docs/website/ai-consulting/` | Lane-specific page and search decisions |
| `docs/harness/writing-rules.md` | Shared writing and app formatting |
| `development/` | Technical project index; `internal-systems/` and `service-builds/` link their project homes |

Each service Lane uses `README.md`, `offers.md`, `audience.md`, `clients.md`,
`growth.md` and `outreach.md`. Use these names consistently. Development has
no sales offer or audience file. Add a new guide only for a distinct owner.

A focused plan gets its own folder inside the Lane it serves, such as
`docs/operations/content-editor/product-ads/`. Its research notes live beside it.
Plans and research never go to HomeSSD Generated.
Website code stays in its existing code folders.

## Records and work files

| File or record | Home |
| --- | --- |
| Code, reusable recipes, schemas and small configuration | The owning Git repository |
| Current operating rules | This guide and the owning skill; link shared rules |
| Open-job media and active caches | HomeSSD / Active Work |
| Kept templates, references and finished files | HomeSSD / Media Library, grouped by client |
| Finished videos, once confirmed done | `/Volumes/MediaSSD/05_FINISHED`, in a product folder such as `Product-Ads` |
| Reviewed disposable byproducts | HomeSSD / Generated; delete once the final copy exists. Old contents still need migration checks |
| Irreplaceable footage and original source | Eagle or MediaSSD, with a durable backup |
| Job IDs and receipt links needed for queries | Supabase; task status stays in Asana or Linear |

Use the [video storage rule](../video-storage-workflow.md) for the exact volume
check and client/type folders. Use dev-storage for caches and worktrees.
Keep a receipt with the job evidence and link it from the task. A database link
is not a backup of a video. Never rely on a remembered deletion exception to
protect an important record.

## Retire old docs

Move useful story and career material to [Story and career](../story-and-career/README.md).
Keep Lane offers in their existing folders. Update callers, check the exact
retirement list, then remove obsolete files and redirects from the active tree.
Do not leave a second source of current facts. Git keeps the retired history.

## Real-job lookup

[Edit Week 10 Rankings](https://app.asana.com/1/1216086803382161/project/1218890014545436/task/1220404457026180)
is in Content Editor / Catena. Its task links the
[Studio review](https://www.singleton-systems.com/studio/review.html?project=e4fcae4d-ff63-4c5a-a784-ff85bbd8e125).
The [review gate](../../config/lineups/review-gates.json) points to its transcript,
cue proof and HomeSSD preview packet. Eagle holds its source under
Catena Media / LineUps / 11-10-NFL-WK-10-POWER-RANKINGS.

The task's live readback still calls for scene approval, builds, Premiere work
and delivery. A review page is not proof of a finished client export.

## Cleanup

The storage skill owns the 14-day review. Each review needs current exact-file
checks and the required approval. Automatic retirement is not implemented.
Retire only the exact files reviewed for the current task. Check useful content
and callers first. Media cleanup remains a separate job.

## Keep, work and clear

Use [the storage gate](../video-storage-workflow.md) for new output paths.
Each Lane README links this file-home guide and its client template owners.
The template reference names the working source, owner, reuse steps and final
file/receipt home. Docs hold those links; the real source stays with its owner.

At closeout, verify the final file and receipt, preserve reusable source, then
list exact disposable byproducts. The cleanup owner checks any move and editor
relink. Generated is not fully clearable until its legacy inventory is resolved.
