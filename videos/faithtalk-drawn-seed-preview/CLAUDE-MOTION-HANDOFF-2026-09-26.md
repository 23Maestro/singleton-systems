# FaithTalk motion integration

Implement the remaining intro and outro treatments from [the assembly brief](PREMIUM-ASSEMBLY-2026-09-26.md) and [detailed spec](premium-assembly-2026-09-26.json). Preserve the latest approved artwork and static layouts. Read the [readiness audit](references/envato-motion-preset-2026-09-26/READINESS-AUDIT.md) before the first scene; it covers required GLTV branding, source bindings and unresolved inputs.

## Prior Figma work

Parent: [23M-194 — Outro: match Concept 02 before adding motion](https://linear.app/23maestro/issue/23M-194/outro-match-concept-02-before-adding-motion).

Verified Done on September26:

- [23M-197 — reference measurements and Figma mapping](https://linear.app/23maestro/issue/23M-197/measure-page-7-and-map-the-four-reference-cards-to-figma).
- [23M-198 — Connect](https://linear.app/23maestro/issue/23M-198/match-contactconnect-to-its-approved-reference).
- [23M-199 — Story](https://linear.app/23maestro/issue/23M-199/match-share-your-story-to-its-approved-reference).
- [23M-200 — Prayer](https://linear.app/23maestro/issue/23M-200/match-call-to-prayer-to-its-approved-reference).
- [23M-201 — Next Week](https://linear.app/23maestro/issue/23M-201/match-next-week-teaser-to-its-approved-reference).

[23M-202 — animate the matched cards](https://linear.app/23maestro/issue/23M-202/animate-the-matched-outro-cards-and-verify-the-reading-holds) remains Todo. Its60–120-second duration is superseded below. Latest local static refinements supersede older ticket geometry.

## Execution method

Use [$implement](/Users/singleton23/.codex/skills/implement/SKILL.md) and [$tdd](/Users/singleton23/.codex/skills/tdd/SKILL.md). Work one scene at a time: expected behavior → failing proof → smallest implementation → verified playback. Finish that scene’s integration before expanding. Stop at its review boundary for Jerami’s review.

Proposed automated-test boundaries are rendered scene playback/seek and integrated playback with audio. Confirm them before writing tests, as the TDD skill requires. Use independent approved references for expected results. Visual review remains necessary for motion quality.

**Intro:** update the existing composition directly. Keep scenes1–4 centered at one fixed anchor while growth unfolds in place. Apply the planned gold/emerald stroke accents. Preserve approved people holds and v6.1 logo choreography. Baseline runtime remains36.5 seconds.

**Outro:** animate each individual composition in **Figma Motion first**, inspect it, then integrate the verified result into the final video. Preserve original masks and editable copy. Use the [preconfigured Envato motion preset](references/envato-motion-preset-2026-09-26/README.md) for frame-numbered entrances, easing curves and transitions. Source observations and adaptation settings are labeled; verify these settings in Figma playback instead of rediscovering timings. The GLTV examples inform reading clarity only.

## Outro timing and music

Target **6–7 seconds per scene; four scenes around28 seconds total**. Starting grid: Connect0–7, Story7–14, Prayer14–21, Next Week21–28. Entrances and transitions belong inside that budget. Keep full-copy reading holds; shorten decorative entrances before sacrificing readability.

Maintain the locked page-wide reading order and custom icon sequences. Preserve the Story underline, spaced glass credits and approved teaser layout. Do not append an extra scene to reach the duration.

**Add music to the outro.** Use one continuous selected bed, with transitions shaped to its phrasing and a clean ending. Duck beneath speech. Identify the approved track before final assembly; label any temporary bed. Check music and animation together in the final playback.

Report each scene’s verified result and remaining gaps. No new purchases, agent dispatch or Git publication is part of this handoff.
