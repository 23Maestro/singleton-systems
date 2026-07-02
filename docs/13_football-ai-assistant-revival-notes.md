# Football AI Assistant Revival Notes

Date: 2026-07-01

## Purpose

Capture the revived shape of the football computer-vision idea before any
rebuild work starts.

This is a strategy and product-shape note, not an implementation plan yet.

## Recovered Source Material

Main old code project:

```text
/Users/singleton23/Library/Mobile Documents/com~apple~CloudDocs/Work/Code Projects/AiFootballAssistant
```

Older planning notes:

```text
/Volumes/HomeSSD/Obsidian/23Maestro/Football AI Assistant
```

The old project already contains a local Cursor MCP setup:

```text
.cursor/mcp.json
mcpServer/local_server.py
mcpServer/tools/cv_tools.py
mcpServer/tools/video_tools.py
football_label_definitions.py
frontend/
desktop/
project_docs/
```

The current Roboflow MCP marketplace release makes the old idea feel worth
revisiting because the agent can now help create projects, upload data, train
models, build workflows, and deploy vision applications without manually wiring
every step first.

## Origin Story

The original inspiration was a friend's comment about Balltime, the volleyball
AI app, and the thought that similar sport-specific AI video tools could be a
lucrative business.

The current thesis:

```text
Build the football version of the sports AI video assistant:
not a Hudl replacement, but a focused product that could become strategically
interesting to Hudl or a similar sports-video platform.
```

Desired founder outcome:

```text
Make the idea real enough to become acquirable.
Do not build a forever lifestyle SaaS.
Aim for a sharp wedge, portfolio, users, and a credible exit path.
```

## Product Concept

The app helps football players upload film and get position-aware, role-aware
video analysis and highlight organization.

The important football-specific insight:

```text
Jersey number alone is not reliable.
Broadcast/coach-film perspective, occlusion, angle, and jersey visibility make
number-based player ID fragile.
```

Better first classification:

```text
Side of ball -> unit -> position group -> likely alignment -> clip category
```

The app should understand whether the athlete plays:

```text
Offense
Defense
Special Teams
```

Then it should use the user's declared role to guide what the model looks for,
how clips are categorized, and how highlights are organized.

## Intended User Flow

1. Ask the player what their primary football role is.
2. Let them choose one or more groups:

```text
Offense
Defense
Special Teams
All
```

3. Based on the selected group, show a position layout.

For offense, use an X's-and-O's style layout with position slots:

```text
WR
WR2
WR3
QB
RB
FB
TE
LT
LG
C
RG
RT
```

The exact layout should feel like a football formation, not a plain dropdown.

4. If defense is selected, show a defensive layout with defensive position
slots.

5. If special teams is selected, show a simpler special-teams role picker:

```text
K
P
LS
RET
Gunner
Holder
Kickoff Coverage
Punt Coverage
```

6. Upload film:

```text
One long game video
One existing highlight reel
Multiple clips
Position-specific clips
```

7. Analyze with Roboflow / model workflow.

8. Output role-aware clip groups and highlight candidates.

## Dataset Starting Point

Current user estimate:

```text
Rough base target: 300 annotated images
Current Roboflow state: around 9 annotated offensive-set images
```

Possible first split:

```text
125 offense images
125 defense images
50 special teams images
```

This is a reasonable planning number, but it should not be treated as a magic
threshold. The real question is whether the model can produce useful enough
clip grouping on a narrow task.

## Annotation Strategy

Start with role and alignment labels before attempting identity.

Good first labels:

```text
QB
RB
FB
WR
TE
LT
LG
C
RG
RT
DE
DT
OLB
ILB
MLB
CB
S
K
P
LS
RET
Gunner
Football
```

Avoid overcommitting early to:

```text
jersey number recognition
individual player identity
perfect special teams role recognition
full tactical understanding
```

The app can still use jersey details later as supporting evidence, but the
core workflow should not depend on them.

## Special Teams Risk

Special teams is likely harder than offense/defense because alignment and role
can be more situational.

Recommended product treatment:

```text
Do not make special teams the first demo.
Support it as a profile option.
Keep the first model milestone focused on offense or defense.
```

Special teams can become a second model or later workflow once the main
position-aware analysis is credible.

## Real Acquisition Logic

The acquisition path probably does not require a full enterprise SaaS first.
It needs evidence that a bigger platform would care about:

```text
1. A sharp football-specific workflow.
2. A labeled dataset or model that improves over time.
3. A user wedge with players, trainers, parents, or small programs.
4. A repeatable upload -> analyze -> highlight result.
5. Portfolio that users will pay, share, or keep uploading film.
```

The realistic no-money wedge is not "build Hudl." It is:

```text
Build the smallest football-specific assistant that creates a result players
or parents immediately understand.
```

## First Useful Wedge

Best first wedge:

```text
Offensive player highlight assistant for one or two positions.
```

Candidate starting positions:

```text
RB
WR
QB
```

Reason:

```text
They are easier for non-technical users to understand, easier to demo, and
more directly tied to recruiting highlight expectations.
```

Better first demo than full automation:

```text
Upload a clip -> choose position -> detect formation/players/ball enough to
suggest candidate moments -> output a reviewable highlight queue.
```

Human review is acceptable in v1. Fully automatic highlight generation can come
later.

## Dead-Space MVP

The first product wedge may be smaller than the full football AI assistant:

```text
Upload one long film file or multiple clips.
Remove dead space before and after each play.
Stitch the cleaned clips into one fast-hitting highlight reel.
```

This is a stronger first wedge than trying to solve the entire recruiting
highlight workflow immediately. It has two core promises:

```text
1. Split a full film file into likely plays.
2. Trim each play so the final reel feels tight.
```

Do not add arrows, music, captions, jersey-number recognition, rankings,
player scoring, or coach dashboards until this works.

## Upload Modes

Support two input modes:

```text
Full film upload
  The system must find play boundaries first, then trim dead space inside each
  detected play.

Multiple clip upload
  The system can skip initial play splitting and focus on trimming dead space
  before stitching clips together.
```

These should be separate modes in the product logic even if the UI presents
them simply. Full-film processing and clip cleanup are not the same technical
problem.

## Dead-Space Detection Theory

Audio should not be the core signal.

Reasons:

```text
Some clips have weak or missing audio.
Crowd noise, whistles, commentary, and sideline noise can mislead detection.
Football action can start without a clean audio spike.
```

The stronger first signal is visual motion around the snap/action-start area:

```text
football movement
center hand movement
offensive line movement
backfield movement
whole-formation acceleration
```

The system should look for the moment where the frame changes from setup state
to play state, then cut a little before it.

Starting cut rule:

```text
Find first clear action-start moment.
Set clip in-point 2-3 seconds before that moment.
```

This gives the highlight a little breathing room without keeping the dead
pre-snap waiting.

## Annotation Targets For Dead Space

Do not think of the annotation job only as "identify every player."

For the dead-space MVP, useful targets may include:

```text
football
center / snap area
offensive line
backfield
motion cluster
active play state
dead pre-snap state
dead post-play state
```

The exact Roboflow label design still needs testing. The key is that the model
does not need to understand football perfectly. It needs to help detect when
the clip becomes useful.

Possible model outputs:

```text
football detected / not detected
snap-area motion confidence
players-in-formation confidence
active-play confidence
dead-space confidence
```

## Play-End Problem

The start of a play is probably easier than the end.

End detection is harder because plays end in several visual shapes:

```text
tackle pile
player runs out of bounds
incomplete pass
touchdown
quarterback slide
whistle after forward progress
camera follows the wrong area
camera stays wide while players slow down
```

The first version should avoid pretending it can perfectly know the whistle.

Safer ending rule:

```text
Detect when action intensity drops below a threshold after the main movement.
Then keep 1-2 seconds of tail room.
```

If the system is unsure, keep extra tail instead of cutting too tight. A clip
with one extra second is better than a clip that cuts off the result.

## Scene Detection Reality

Premiere-style scene detection helps when the visual scene changes clearly. It
can fail when every clip looks similar, such as the same field, same camera
angle, same gym, or same broadcast layout.

Football full-game film often has repeated visual structure:

```text
same field
same angle
same uniforms
same camera zoom level
same pre-snap shape
```

So scene detection alone is not the product. It can be one support signal, but
the real product needs football-specific action detection.

## Review UX Between Automation And Manual Editing

The app needs an in-between state before fully automatic highlight generation.

Better v1 review flow:

```text
1. Upload film.
2. Choose role / position context.
3. System creates candidate clips.
4. User sees thumbnails or short previews.
5. User accepts, rejects, or adjusts the in/out points.
6. System stitches accepted clips into a cleaned highlight reel.
```

This is similar in spirit to "Is this you?" identity confirmation, but the
first question is more practical:

```text
Is this a good play segment?
Should the start or end move?
Keep it or remove it?
```

This keeps the app useful even before the model is perfect.

## Initial Product Boundary

The smallest useful version can be private and simple:

```text
Position-aware onboarding
Upload full film or clips
Detect likely play starts
Trim pre-play dead space
Conservative post-play trimming
Review queue
Export stitched reel
```

Delay:

```text
automatic best-play scoring
perfect play-end understanding
jersey-number identity
full side-of-ball intelligence
special-teams precision
public portfolio documentation
```

## What "Bring It Back To Life" Means

Do not start by modernizing the whole old repo.

First revival slice:

```text
1. Inventory the old code.
2. Confirm whether the local MCP server still starts.
3. Export or preserve the existing Roboflow annotations.
4. Pick one wedge: offense-only, one or two positions.
5. Build a single demo flow around upload, position selection, and analysis.
6. Use Roboflow MCP only where it reduces manual setup.
```

## Open Questions

```text
What exact Roboflow project contains the 9 annotated images?
Which sport/model/video inspired the soccer comparison?
Which first position has the most available film and clearest value?
Who is the first buyer: athlete, parent, trainer, coach, or small program?
Is the first win highlight creation, dead-space removal, player tagging, or
position-aware sorting?
```

## Current Market References

Verified quick references:

```text
Hudl announced Balltime acquisition on 2025-02-06.
Roboflow Universe has soccer datasets/models and sports CV examples.
Roboflow has reusable sports computer-vision tooling and examples.
```

Useful links:

```text
https://www.hudl.com/blog/hudl-expands-volleyball-focus-through-game-changing-acquisition-of-balltime
https://www.hudl.com/hudl-balltime
https://github.com/roboflow/sports
https://universe.roboflow.com/browse/sports/soccer
https://universe.roboflow.com/roboflow-universe-projects/soccer-players-ckbru
```

## Routing

Opportunity HQ lane:

```text
Offer / Portfolio
```

Recommended durable task title:

```text
Revive Football AI Assistant as acquisition-style portfolio wedge
```

Suggested status:

```text
Queued
```

Suggested money priority:

```text
Strategic
```

Do not let this displace Critical Money Clock work unless it becomes a paid,
externally committed opportunity.
