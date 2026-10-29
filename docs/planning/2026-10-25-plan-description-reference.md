# Plan and description reference

Jerami supplied 4 new photos. Photo 2 shows the dashboard gap. Photos 1 and 3 show the target Plan sheet; photo 4 shows the description toolbar.

## Changes

Plan now has date/week/month icons, right-aligned weekday/range/month labels and the Time Slot search prompt. The labels describe each button's actual action. Later today chooses the next whole hour after 2 hours; late-night choices roll to tomorrow at 9 AM. The existing Monday planning-week boundary stays unchanged.

The footer uses small Day and No time buttons. Day opens the free shadcn calendar with month navigation, outside days and a red selected date. Selecting a day updates the draft and closes the calendar. Escape first closes the calendar, then Plan. Done confirms valid typed date/time text. The No time button can start a time choice on an unplanned task; it uses Today when no date exists. Task Save remains the durable commit.

The description toolbar has bold, italic, underline, strikethrough, H1, H2, numbered lists, bullets, checklists and keyboard dismissal. It has no Subtask button. Checklist conversion remains in the task menu. A viewport resize keeps the toolbar within the mobile editing area. No priority control is added.

## Checks

The new toolbar and Plan-row checks failed before the changes. Rendered tests cover date labels, calendar day selection, H1 creation, formatted notes after save/reload and keyboard dismissal in a shorter viewport. Planning and responsive checks retain Save/Cancel, exact time, duration, navigation and brand behavior.

The calendar source comes from the official free shadcn registry. Dependencies are pinned to react-day-picker 10.0.2 and date-fns 4.4.0. Existing shadcn Button and utility imports are reused.

The hosted review uses sample records and browser-only edits. Named Time Slot search still requires the separate slot model in 23M-284. Physical iPhone keyboard behavior and human visual approval remain review gates; emulated viewport checks do not prove a real iOS keyboard session.
