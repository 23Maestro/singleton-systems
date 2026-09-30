# 745 visual contract

[Source visual direction](https://docs.google.com/document/d/1AmoyonXDcWnqPpYkCecxGnOVVxBk1dJbpdMSaRLkaSc/edit)
governs the content lanes. `config/745-creative/visual-contract.json` owns the
machine-readable treatments. `active-edit.json` binds one exact Premiere
sequence, client, lane, source, and headline.

Ben and Eric each have a `visual-contract.json` under
`config/745-creative/pastor-ben/` and `config/745-creative/eric-miller/`.
The shared contract indexes these files. The hook resolves them before loading
rules, so there is one definition per client. Jev selected this file structure;
the source documents govern the treatments.

Ben uses Modern Earth with gray-blue and Cambria/Calibri. His cover has a clear,
bold headline; his teaching video stays minimal. Cambria remains pending.
Eric uses After Hours with the daytime warm base and Roboto/Arial. His later
brand direction supplies the palette missing from the estimate brief.

Each client file records framing, color, opening treatment, on-screen text,
cover direction, source links, and review checks for all four listed lanes.
There is no invented mandatory intro or universal series label. Family/music
and property reference lanes do not add work to the requested 14 Ben and 16
Eric videos. Their Premiere templates and measured baselines remain unbuilt.

John Prayer uses the supplied reference: John prominent, violet “A Prayer For”
label, short white/violet headline, dark lower fade, and breathing room. The
preview is 178×222; the output remains 1080×1920. The reference is stored on
MediaSSD and checked by SHA-256. The Premiere title and cover remain unbuilt.

## Locked and adjustable

Client, content lane, font family, palette, required label, hierarchy, graphic
density, and caption ownership are fixed. Jerami allows up to ±10% changes in
size, spacing, position, crop scale, and opening hold within the lane treatment.
Headline, line breaks, and source frame are per-video content slots.

The percentage is relative to a measured template baseline. No pixel baseline
exists yet. This policy is not a visual similarity score.

Premiere owns visuals and covers. Opus Clip owns captions. Asana owns task
state. The JSON contract does not mark videos done or send client messages.

## Commands

```bash
python3 .codex/hooks/creative_745.py show
python3 .codex/hooks/creative_745.py show --client pastor_john --lane bold_beliefs
python3 .codex/hooks/creative_745.py show --client pastor_ben --lane teaching
python3 .codex/hooks/creative_745.py show --client eric_miller --lane market
python3 .codex/hooks/creative_745.py suggest --client pastor_john --state 'John addresses the viewer in a complete prayer.'
npm run check:745:visual
```

For the next video, inspect its source and sequence first. Bind the verified
values with `bind --client ID --lane ID --sequence UUID --project ABS_PATH
--source ABS_PATH --headline TEXT`. Optional `--adjustments-json` accepts only
the listed percentage fields, each within ±10. Binding resets visual completion
to unverified. Jev suggests only; it never binds or edits automatically.

## Hooks and limits

Matching prompts load the correct lane. Ambiguous prompts show the lane menu;
they do not inherit Prayer by default. Scoped Premiere mutations validate the
binding, reference hash, caption owner, and declared adjustment allowance.
Native-caption creation is blocked for the enrolled sequence, including static
calls inside `functions.exec`. Other explicit sequences are unaffected.

Native UI calls receive reminders. Hooks cannot determine the selected UI
sequence, parse arbitrary dynamic JavaScript, or certify rendered typography,
position, color, or thumbnail appearance. Inspect actual output before claiming
visual alignment. Unscoped calls are not treated as enrolled writes.

Project hook configuration is wired in `.codex/hooks.json`. Runner discovery
must be verified separately; a subprocess test does not prove a current app
session has reloaded that configuration. Approve new hooks through the app's
normal trust prompt when shown. Do not edit global trusted hashes to bypass it.
