# Repeat implementation order

23M-277 and 23M-284 own repeat and series behavior. The reference showed quick repeat choices, custom intervals and weekdays, Never / Until / After endings, and Only this task / This and all future tasks. Those observations do not prove every calendar edge case.

Supabase will own the dashboard repeat rule, series identity and occurrence progress. Linear and Asana remain the task owners. A rule must not change existing source deadlines or calendar duration. Saving a rule must not create duplicate task trees.

Build these slices through the approved public UI and route:

1. Configure a rule, save, reload and reopen it. Include No repeat and custom endings. Show the next planned occurrence before the rule is saved.
2. Complete the current occurrence and create the next source task once. Stop at the chosen count or end date. Use stable occurrence identity and provider readback before retrying an uncertain create.
3. Edit only this occurrence or the future series. Preserve task ownership, project, client section and context. Keep task planning dates separate from source deadlines.
4. Expose any partial completion/create failure in Updates with a safe retry path. Prove duplicate retry and recovery through the public route.

The CLI lifecycle code has useful stable identity and provider readback patterns. Its local filesystem journal is not a durable store for this website. The website needs a server-owned journal before recurring owner writes are accepted.

The rule editor alone will not complete Repeat. Full acceptance needs next-occurrence creation, endings, series edit scope, failure recovery and the integrated reference review. Client deadline rules remain for the later client interview; they must not be inferred from a plan date.
