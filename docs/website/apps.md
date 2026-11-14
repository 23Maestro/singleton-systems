# Website apps

This is the one list of www.singleton-systems.com app links. It names each
link's job, its Lane and its quirks. Code lives in `app/`, `public/` and `lib/`.
Lane rules live in [operations](../operations/README.md).

## Standing rules

- **Deploy every change.** This repository is the site's source. Push to
  `main`; Vercel project `singleton-systems` deploys it to production. Open the
  live link after the deploy before calling the change done. A saved file or a
  passing test is not a live change.
- **Links are public.** A new or changed app opens for anyone with the link.
  Do not add sign-in pages, passcodes or private-link steps. Keep one guard
  only where a stranger could break or erase work: deleting, replacing or
  listing all records may need the producer key.
- **Data is not code.** A new Studio packet or form record is stored data. It
  needs no deploy.

## Content Editor

| Link | Job | Quirks |
| --- | --- | --- |
| `/studio/review.html?project=ID` | Studio review: plan, artwork and motion for each scene, with notes | Opens each scene on its newest built version; `P` flips every scene to the plan. A built scene plays its ready video with no dropdown. Notes and statuses save by themselves. Picking a storyboard card plays its motion from the start. Motion versions carry the client's audio. Packets publish through the Lineups `studio-lineups-start.mjs` script. Source is [tools/review_workspace](../../tools/review_workspace/README.md); copy it to `public/studio`. |
| `/studio` | Studio project list | Public. Opens without a private link or browser session. Project management stays guarded. |
| `/video-inquiry` | Client footage intake for test edits and bundles | Public form. |
| `/recruiting-highlights` | Athlete highlight-reel offer page | Public page. |
| `/decision-maps`, `/decision-maps/review/ID` | Dated decision maps and video review pages | Public by link. |

## AI Consulting

| Link | Job | Quirks |
| --- | --- | --- |
| `/AI-consultant` (also `/ai-consultant`) | Consulting offer page | Lowercase path is a rewrite. |
| `/tampa-ai-consultant` | Local consulting landing page | Public page. |
| `/ai-workflow-session` | Consulting intake form | Public form. |
| `/ai-workflow-portfolio` | Consulting case studies | Public page. |
| `/rouse-and-holder` | Client-specific plan page | Public by link. |

## Development and operations

| Link | Job | Quirks |
| --- | --- | --- |
| `/linear-inbox` | Capture to Linear from desktop or phone | Server route sends the Linear key raw. |
| `/command-center`, `/business-ops`, `/dashboard` | Work dashboards and business tools | `command-center` keeps its session for mail. |
| `/links`, `/business-links` | Link hubs | Public. |
| `/visual-maps`, `/portfolio-c4-plan` | LikeC4 architecture maps and plan | Built by `npm run visual-maps:build`. |
| `/wemby-shot-lab`, `/flowzone` | Separate Vercel projects | Reached through rewrites in `next.config.mjs`; their code is not here. |

## Personal

| Link | Job | Quirks |
| --- | --- | --- |
| `/home-tasks` | Room chores | Google Sheets backend. |
| `/fitness` | Workout routine | Has its own session route. |
| `/finances`, `/finances-plan`, `/finances-calendar`, `/finances-form` | Money tracking | Has its own session route. |

Add a row when you add an app. Change the row when its job or quirk changes.
