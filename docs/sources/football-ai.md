# Football AI source index

Checked November 1, 2026. This is a source record. The product scope is open.

## Recovered notes

8 distinct docs were found. 4 more copies have the same bytes.

Jerami named User Input Prompt Ideas.md, Untitled.md, overview_map.md,
saas_roadmap.md, and the July revival brief as the most useful sources for
this work.

| Source | What it holds |
| --- | --- |
| Game Plan.md | Early Google Video Intelligence plan. Uses shot changes to propose play times. |
| User Input Prompt Ideas.md | Role and position prompts. Clip order. Returner and coverage rules. |
| Untitled.md | Offense and defense Dropover shelf note. |
| Archived README.md | Local editor pitch and proposed upload-to-export flow. |
| Archived file_tree.md | Proposed SaaS file tree. Some listed files do not exist. |
| Archived overview_map.md | YOLO, OpenCV, and Roboflow learning plan. |
| Archived saas_roadmap.md | Snap/end detection. Position-based player choices. User picks a player and adds an indicator. |
| [July revival brief](../archive/football-ai-assistant-revival-notes.md) | Acquisition goal. Dead-space MVP. Human review queue. |

The Obsidian originals are here:

```text
/Volumes/HomeSSD/23Maestro/Football AI Assistant
```

Their 3 iCloud copies match. A trashed Game Plan copy also matches.

The old code and its 4 docs are here:

```text
/Users/singleton23/Library/Mobile Documents/com~apple~CloudDocs/ARCHIVE/CODE_PROJECTS/AiFootballAssistant
```

## Preserved source bundle

```text
/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/references/football-ai/2026-11-01-source-recovery
```

`manifest.json` maps each copy to its source and SHA-256 hash. The bundle keeps source text, current intent, and search evidence. Code stays in its old project.

## What the code proves

The source has local FFmpeg trimming, frame-motion scoring, and SQLite project storage. Its YOLO code detects people, then filters fixed screen zones by position hints.

The browser edit and export controls are placeholders. Planned auth files are absent. This review found no working hosted payment or customer storage system. Runtime and model quality remain untested.

The old Git tree is dirty. It has no commits on local main. Its tracked origin/main is gone.

## Cloud search

Both connected Google Drive accounts were searched by project terms and related names. No dedicated football AI doc was found within those results.

[Prospect ID workflow audit](https://docs.google.com/document/d/1qgMmGVWguHmuh5Qn0Ic56XKKLwyOSifS/edit) has related athlete and video intake work. It is a separate project. The generic Video + AI Workflow Audit is also separate. Both are marked as related sources in the bundle.

## Keep open

Jerami now wants a paid website for parents and athletes, with a long-term acquisition goal. This replaces the old local-only assumption as the goal to explore.

Jerami confirmed the first buyer on November 1, 2026: a parent paying for their athlete. Buyer means the paying parent. Athlete means the player whose film is used. Who operates the editor remains open.

Jerami agreed that the first paid result is a recruiting reel to send coaches.
Jerami confirmed the first product milestone: a parent uploads individual
plays, gets help trimming them, identifies the athlete, adjusts the marker,
and exports a recruiting reel. The parent or athlete can reorder plays before
export. Upload order is the starting order.
Jerami chose Roboflow for the vision work. The old app is an early scaffold;
reuse its code only if it helps the current goal. The recovered idea docs are
the more useful starting point.
For storage, Jerami's starting preference is to keep a family's clips and
reels while they have an account. Limits and deletion details remain open.
The first version starts with individual play clips. A play clip is a
separate video of a play supplied as input. Jerami also wants to explore a
long highlight file that can be split into plays. Its first-release scope is open.

## Editing direction

The parent and athlete choose the plays and have final say. AI does not rank
their clips in the current discussion. Onboarding collects sides of the ball
and 1 or more positions. Special teams is a separate question.

The editor can offer help to trim a play and find the athlete. A user reviews
the suggested trim and can change it later. Player suggestions use the chosen
positions; the user selects the correct player. An arrow or circle can mark the
player near the snap, with timing that the user can move. The exact controls
and model behavior still need review.

The default in the finished reel is a freeze frame before the snap with a
marker pointing to the athlete. The play then continues. The app chooses the
hold duration; users do not adjust its length. The exact duration remains open.

When an athlete selects multiple positions on the same side, show candidates
for all selected positions together. For example, show the running back
candidate and all possible receivers for an athlete who plays both. The user
does not need to choose a position for that play first.

Jerami confirmed that the parent or athlete can select the player directly if
the suggestions are wrong or missing. For special teams, he wants simple role
choices such as kicker, returner, or another role. Showing more player choices
for other roles is an idea to test. The exact prompts are open.

Jerami proposed 500 pre-snap still frames as a starting target, drawn from
football highlight clips. A possible 35/35/30 split is 175 offense, 175 defense,
and 150 special teams frames. He cites prior soccer research as the basis for
the target. The exact source has not been recovered. The intended model finds
position candidates in a still frame. Player tracking is outside this task.

On November 1, 2026, Roboflow returned the existing object-detection project
`23maestro/aifootballassistant`. It contains 4 annotated images and 45 total
annotations, mostly offense position labels. All 4 are in the validation split.
The connector returned 1 dataset version and no trained models. Jerami wants
to build on this work using stills from his Prospect ID highlight edits.

There is no upfront tagging carousel. For an athlete who plays offense and
defense, Find me asks which side applies to the current play. The exact
special-teams prompts remain open. Finding cuts in a long highlight file also
needs testing.

Film rights, model quality, auth, payments, and storage remain open. Old dataset counts and vendor claims need fresh checks. Linear will own the Wayfinder map after its destination is agreed.
