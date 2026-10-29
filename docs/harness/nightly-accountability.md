# Nightly accountability

The existing Cerebral `UserPromptSubmit` hook calls
`.codex/hooks/nightly_accountability.py` in this repository. A human prompt
between 12:30 a.m. and 6:00 a.m. America/New_York adds one brief accountability
check to the assistant context. Daylight saving time follows that timezone.

Ask whether the work has a real deadline or consequence before morning.
For work that can wait, suggest saving, leaving a resume sentence and signing
off. For urgent work, ask for the smallest finish and a stopping time. Honor
an answer already supplied. Continue authorized work; the check never blocks.

Scheduled heartbeat messages, empty prompts and other hook events stay quiet.
One private date marker under
`~/.local/state/singleton-systems/nightly-accountability/` limits the nudge to
once per night across sessions on this Mac. The marker stores no prompt text.
It records context emission, not proof that Jerami saw or answered the check.
Storage failure leaves the request unblocked. No process runs while inactive.

This hook applies to chats using this repository's existing Cerebral hook.
It does not install a global hook for unrelated projects. The older scheduled
check is paused after activation to avoid duplicate reminders.

Verify with `python3 scripts/test_nightly_accountability.py` and the Cerebral
contract, hook-routing and registry checks. A fixture proves the registered
guard emits the context; the next real late-night prompt proves live delivery.
