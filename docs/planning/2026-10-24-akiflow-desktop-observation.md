# Akiflow desktop observation — October 24, 2026

Akiflow 2.83.8, signed-in native macOS app. Jerami handed control back in chat. Scope: one new task named Dashboard review test. Observations below come from computer-use accessibility state and 2 visual inspections, not REA runtime capture. Times use EDT as shown by the app.

## Observed journey

| Evidence | Action | Visible result |
| --- | --- | --- |
| UI-01 | Today → Add new task; enter Dashboard review test and press Enter | Task created successfully; one To-do with Today date. No start time was chosen. |
| UI-02 | Open task → Duration | Searchable popover. Presets: 10, 15, 20, 30, 45 minutes and 1 hour. Placeholder accepts examples such as 30 minutes and 1h. |
| UI-03 | Enter 5 minutes and select its result | Duration chip changes to 5m. Task list total becomes 5m. This was accepted; no minimum or complete supported range was established. |
| UI-04 | Select date → October 25, then navigate to Upcoming → Days | Under Sun, Oct 25: To-dos 1 5m; Dashboard review test; Tmw; 5m. Date and duration survived navigation without a clock time. |
| UI-05 | Reopen task → Select time → 9 AM | Task moves into Scheduled on calendar 1 5m. Expand group: task displays 9 AM 5m. Reopening retains the 5m chip. |
| UI-06 | Select time; select all, clear the input and press Enter | Task displays 12 AM 5m. This action did not remove time. This is 1 observed interaction, not a complete explanation of validation. |
| UI-07 | Task options → Replan → Tomorrow | Toast: Task planned for Tomorrow. Task returns to To-dos 1 5m, displaying Tmw and 5m, with no scheduled clock time. |
| UI-08 | Close task; quit and relaunch Akiflow; navigate to Upcoming → Days | Same named task remains under Sun, Oct 25 in To-dos 1 5m with Tmw and 5m. No calendar start time is shown. App sync indicator returns to Open sync center. |

Selections visibly update the task and show a success/Undo toast. This alone does not establish when a remote write completes. Escape closed the task detail view after changes; it did not undo the saved duration or date. The observed task editor did not require a global Save button for these actions. New-task capture required Enter. Later recurrence observation exposed an additional confirmation step.

## Design findings

- Desktop task duration uses a search/preset list. The supplied mobile Slot photo uses an hours/minutes wheel. Use a shared duration value with an input suited to each screen; do not assume identical controls.
- Task details reveal date, time, duration and repeat controls on demand. Title and description take the main space; metadata tools sit together below.
- Untimed tasks and scheduled tasks have separate groups with counts and total duration. Scheduled tasks were collapsed behind Toggle section in Upcoming Days.
- Desktop date selection opens a calendar. Replan opens quick choices: ASAP, Today, Tomorrow, This week, Next week, This month, Someday and Remove. Mobile Photo 4 shows a different quick-plan sheet.
- The app includes trial promotion and onboarding overlays. These are not needed for the Singleton dashboard direction.

## Proposed dashboard behavior for review

Keep the approved clean title, tabs and board direction on all screens. Open Plan or Duration only when requested. Use a duration wheel on mobile if its keyboard and direct-entry behavior are sound; use a searchable value/presets on desktop. Keep a clear text alternative on both.

Save planned date without requiring a clock time. Retain duration when the task becomes untimed. Provide an explicit Remove time action that clears placement timestamps while keeping planned date and duration. Never turn empty input into midnight without a clear user choice.

Duration selection must allow short tasks without silent rounding. The observed 5-minute value supports reviewing that capability; it does not establish all accepted steps. Existing dashboard 15-minute placement rules need an explicit decision before implementation. Keep effort estimates separate from calendar duration.

Keep the dashboard's existing explicit save/cancel contract until changing it is separately reviewed. Akiflow's immediate updates are observed reference behavior, not approval to replace the dashboard's save flow.

## Evidence limits and remaining work

This section records the first walkthrough only. The [responsive UX follow-up](2026-10-24-akiflow-responsive-ux.md) adds duration removal, recurrence, command-menu and slot-editor observations, records temporary runtime research and its cleanup, and defines the current remaining work. Its test-task state supersedes the final paragraph below.

These findings establish visible state and persistence across navigation and app restart. They do not prove the remote storage model, offline sync, cross-device sync, failure recovery or write ordering. The native main process had no listening TCP endpoint in the targeted lsof check. No CDP endpoint was selected, no debugging flags were enabled and no REA runtime capture was performed.

Prior static REA Evidence ev_bb4e54178af5003f0668f4ccb9f1f0e1b67fc02d634adff1b6529f00182700c0 remains partial and separate. Its unpacked native-extension integrity mismatch does not establish a UI defect. No inference about that mismatch is made from this walkthrough.

Task/Slot parity, slot runtime behavior, zero/unset duration, full keyboard/focus behavior, recurrence and error/cancel recovery remain unobserved. Scope review decides which warrant another observation. No external calendars were connected and no existing production tasks were edited.

The test task remains in Akiflow for October 25, untimed, duration 5 minutes, available for inspection. It was not deleted or marked complete.
