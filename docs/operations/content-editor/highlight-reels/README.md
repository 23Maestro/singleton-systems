# Highlight reels

Football highlight reels for parents and recruiters. Start with the QB. Add more
positions as their clips come in.

- [QB play library](qb-play-library.md): how to name a QB play, with checked examples.
- [Armand Studio notes, Nov 25](2026-11-25-armand-studio-notes.md): Jerami's teaching notes, kept word for word.
- Method skill: `sports-highlight-review` (`~/.codex/skills/sports-highlight-review`).

## How a reel runs

1. Get the clips from the parent. Copy them to HomeSSD Active Work and Eagle.
2. Name and rank every play. Use the [QB play library](qb-play-library.md).
3. Put the plays you cannot confirm in Studio. Jerami comments on them.
4. Fix the names. Stage the order page for the parent.
5. Jerami approves. Send the parent the order link.
6. The parent's order comes back by email and Supabase. Build it in Premiere.

## Why the first pass graded C+ to B-

Jerami's grade on the first 49 Armand clips: names were close but often wrong
about the play. The causes:

- **Small, far film.** Reviewers saw 960 px proxies of phone screen recordings.
  Players were a few pixels tall. The ball was almost never visible.
- **Pass by default.** With no ball to follow, reviewers guessed "pass." Four
  QB runs were named as passes (A01, A09, A11, A27).
- **Hedged results.** Reviewers were told not to invent results. So they named
  the spot ("to the 5") when the play ended in a TD past the pylon (A46).
- **Split by clip number.** Each reviewer saw 12 clips with no game context, so
  repeat angles and same-game plays were hard to spot.

## The review fix

Use full-size originals, not proxies. Audit each play from the snap to the
final frame. A sampled frame is an example, not the play.

For every play, answer these in order, with a frame time for each:

1. Who has the ball after the snap?
2. Does #6 throw it? Look for the arm motion and the ball leaving his hand.
   If not, it is a QB run.
3. Where does the play end? Use the yard lines and hashes.
4. Is there a TD? Check the last frames and the ref's arms.
5. About how many yards? Snap spot to end spot.

Sample 8 to 10 frames a second from the snap to 4 s after. Then take 2 a
second to the end. Crop to the action. Review all clips from one game together.

Score the reviewers against Jerami's corrected names before trusting a new pass.

## Plan

**Now:** QB names use the library formula. Unsure plays go to Studio first.

**Next:**

- Add routes and results for WR and RB when their clips arrive.
- Keep 1 home for the play library, so it does not drift between skills.
- Ticket the work in Linear with tests: name a play, then check it against
  Jerami's labels.

**Later:** bundle intake, naming, the order page and the Premiere build into
1 highlight-reel plugin.

## AI Football Assistant link

The MVP lives in `~/Documents/Development/football-highlight-editor` (a FreeCut
fork with a `football/` app). Its plan is `football/roboflow-steps.md`: teach
**Find athlete** to spot the QB, using the Roboflow project
[AiFootballAssistant](https://app.roboflow.com/23maestro/aifootballassistant).
That project has 4 labeled photos and no trained model yet. Working footage is
in HomeSSD `Active Work/FOOTBALL_AI`.

Reel reviews already make most of what that plan asks for:

- **QB frames near the snap.** Every reviewed clip has a snap time and #6 marked.
  Drawing 1 `QB` box on that frame gives a training image.
- **Same-game groups.** Reels group clips by game, which is how Roboflow wants
  train, validation and test split.
- **Play labels.** Start (Pocket, Rollout L, Rollout R, QB Run), yards and TD
  from the [QB play library](qb-play-library.md) can become later classes.
- **Corrections.** Jerami's Studio notes are checked answers for scoring a model.

Before any upload: get the family's OK, and use a private Roboflow project. The
current project is public, and these are minors' clips.

Connect Roboflow in Claude Code with
`claude mcp add -s user roboflow --transport http https://mcp.roboflow.com/mcp`,
or the Claude connector from the [Roboflow MCP docs](https://docs.roboflow.com/agents/mcp-server).
Both need Jerami's Roboflow sign-in. Training uses workspace credits.
