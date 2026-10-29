# Responsive dashboard interaction findings

Current implementation target: [Akiflow clone plan](2026-10-24-akiflow-clone-plan.md). Jerami selected visual and functional Akiflow parity, including the mobile duration dial. Earlier candidate wording below records the research stage.

October 24, 2026. Follow-up to the desktop observation. This is one responsive website: desktop and mobile share tasks, views and actions; layout and input controls adapt to the screen.

## Design direction

- Make the next action clear. Client cards lead with the deliverable, due date and useful estimate. Remove subtitles and WORK VIEW on both screen sizes.
- Narrow the work before adding filters. Keep the Content Editor / Video Outreach parent selector and contextual tabs. Content Editor Active keeps company columns; details open from the deliverable card.
- Make capture small. Contact entry starts with Name, Company and Email; secondary fields sit under More details without losing their values.
- Reveal planning controls when needed. Date, clock time, duration and repeat are separate choices. A planned day does not require a clock time. Removing time keeps the day and duration.
- Offer quick duration presets and direct entry on both screens. A mobile wheel is a candidate, not a required dependency or a verified shadcn component. Keyboard and touch must both reach the same choices.
- Keep shortcuts discoverable beside actions. A command menu can expose Plan, Duration and Assign to slot without adding permanent buttons to each card. Every shortcut needs a visible button/menu equivalent.
- Use slots to group work into a time block when useful. Keep this optional; client boards should still show the next deliverable without requiring slot setup.

## Additional observed behavior

| Interaction | Evidence and limit |
| --- | --- |
| Clear task duration | Selecting 0 minutes removed the duration chip and list total. A later editor also exposed Remove duration. |
| Cancel duration entry | Typing a value then Escape before selecting it left the prior duration unchanged. |
| Command menu | Task actions included Plan, Assign to a time slot, Duration, Priority and Focus mode. Escape could first return to the action list, then close it. Full focus order remains untested. |
| Recurrence | Custom repetition exposed interval, weekdays and Never / Until / After endings. Editing a repeating task prompted Only this task versus This and all future tasks. Recurring tasks disabled subtasks in the observed app. This restriction is not a dashboard requirement. |
| Slot editor | Calendar creation offered Task / Event / Slot. Slot mode showed a title, date, time, duration, repeat, Add new task and project. The empty draft defaulted to one hour. No completed slot creation/reopen journey was proved. |

The research task remains undeleted. Its last observed duration was five minutes, planned October 25 without a clock time. It now carries a repeat rule limited to one occurrence; it was not restored to its original nonrecurring state.

## Existing ticket and test boundaries

Use the four approved slices, 23M-297 through 23M-300. Apply chrome and form simplification to both screen sizes. Keep dashboard Save/Cancel semantics until a change is reviewed. The remaining UX observations are slot creation/reopening and keyboard/focus behavior; they do not require a sync investigation.

For 23M-300, test visible create/edit/plan/save/reload actions: an untimed planned day, a short duration without silent rounding, explicit removal of time, cancel without unwanted changes, and retained task values across responsive layouts. Review five-minute duration versus the existing fifteen-minute placement rule before implementation. Estimates of human effort remain distinct from calendar block duration.

## Retained technical evidence

REA runtime evidence is retained at `/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/references/2026-10-24-akiflow-mobile/rea-runtime-deep-evidence.json`. It includes loaded-code observations and a bounded failed-write/retry experiment. Those findings do not establish cross-device behavior or general write ordering, and create no dashboard sync requirement. Further sync research is parked.

The temporary debugger was stopped, its loopback port was verified closed, and Akiflow was reopened normally. The earlier static native-extension integrity finding remains separate from UI behavior.
