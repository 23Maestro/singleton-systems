# Singleton Systems 🎬

I edit video and build the tools behind the edit.

I'm Jerami Singleton. I run Singleton Systems. The same prep work kept taking
time from my edits, so I built scripts and tools to handle the repeat steps.

This repo holds that work: video prep tools and the rules that help AI work
across my apps. I use AI to help build. I set the flow, check the code, and
review the result before it goes into a final cut.

## 🎞️ From spoken words to a scene

For a YouTube sports betting channel, I use each video's transcript to pick
graphics and time them to the host's words.

- A source check ties each scene to real words and their time in the video.
- Each passage is checked against 7 graphic lanes, such as stats or player
  comparisons. A lane can have no fit. The system does not need filler.
- My Figma tool builds a new scene from a reusable design. It adds a title
  and places the chosen images in their slots.
- Timing checks tie each graphic cue to the spoken words. I review the look
  and pace before the scene goes into Premiere.

See the [transcript checks](tools/lineups_motion/discovery.py) and
[Figma scene builder](tools/figma/lineups-topic-builder/src/code.ts).

## 🧭 SSystems gives each job a lane

[SSystems](plugins/s-systems/) is my plugin for Codex and Claude. It holds
skills: small guides for a known job. Cerebral matches each request to its
work lane, tools, and review rules.

Each kind of work has a clear home:

- Development tasks live in Linear. GitHub holds the code and its history.
- Video editing and AI consulting tasks live in Asana.
- Client and portfolio records live in Notion.
- Eagle holds reusable media and approved video assets.

These work lanes choose who owns the job. The 7 graphic lanes choose what
fits a video scene. Each has its own rules.

The [routing hook](.codex/hooks/cerebral_singleton_guard.py) reads the live
rules from Supabase. Checks catch drift between the rules and plugin files.

## 🛠️ The code checks the handoff

I build with Python and TypeScript, with Node.js scripts to connect the steps.

- [Timing proof](tools/lineups_motion/timing_evidence.py) tracks the source
  version. Change the transcript, and the old proof stops passing.
- [Asset checks](tools/lineups_motion/assets.py) test cutout pixels and keep
  a link to the original image.
- [Storage checks](scripts/developer-storage/storage-gate.mjs) check the
  drive and free space before files are written.
- [Code review records](lib/reviews/engine.mjs) bind checks to the code
  version. Later edits need a fresh review.

A passed check proves that step passed. I still review the work people see.

## 👋 See the work

[Visit Singleton Systems](https://www.singleton-systems.com) for my work and
services. [CODEX.md](CODEX.md) explains the repo for people working in the code.
