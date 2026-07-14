# AppSheet Chores Build Log

Date: 2026-07-14

Owner account:

```text
flow@singleton-systems.com
```

Live AppSheet app:

```text
Room Chores
```

Core idea:

```text
Use Google Sheets and Forms as the simple data layer, Apps Script for the parts
Google APIs do not expose cleanly, and AppSheet as the mobile front end.
```

## Natural Language Walkthrough

We started with a personal annoyance, not an app idea. The goal was to stop
keeping chore tasks in a vague mental list and build a dead-simple personal ops
hub: open a form, dump a task, assign it to a room, give it a rough duration,
and decide whether it belongs in Pending or Today.

The first major decision was to keep the schema lean. We did not build a project
management system. We removed extra stages, review dates, and template-style
metadata. The confirmed chore task shape became:

```text
Task ID
Room
Task
Duration
Plan
Notes
```

`Task ID` is the stable backend key. AppSheet can call the user-facing table
`Home Tasks`, while the Google Sheet tab can remain `Chores` as the source tab.
That gives the mobile app a clean name without creating another source of truth.

`Plan` only has:

```text
Pending
Today
```

`Duration` has:

```text
5m
10m
15m
30m
45m
60m
90m
2h
4h+
```

The confirmed rooms are:

```text
Auto
Bathroom
Garage
Kitchen
Laundry
Living Room
Office
```

The Google setup handled the source data. The local Workspace CLI and Apps
Script project created or updated the Sheet, Form, validations, and scripts.
The important lesson was that different Google tools own different jobs:

```text
Sheets API  -> spreadsheet tabs, headers, validation, rows
Forms API   -> form fields and options
Apps Script -> linking a Form response destination to a Sheet
AppSheet    -> mobile app UI on top of the Sheet
```

One annoying but important discovery was that the Google Forms API does not own
linking a Form to a response Sheet. That link is still handled through
`FormApp.setDestination()` in Apps Script, so Apps Script stayed in the stack
even though the CLI handled most setup work.

After the Google source layer existed, we moved to AppSheet. Gemini helped
generate a starting app, but the template tried to take over. It created a
separate `Rooms` table with sample room data like `Bedroom 1`, `Dining Room`,
and `Patio`. That looked fine at first, but it was wrong for the real system.
The app was supposed to use the confirmed chore schema, not a generic template.

The key fix was changing the `Room` field on the real task table from a
template `Ref` into a plain `Enum`. A `Ref` made AppSheet look up room options
from the template `Rooms` table. A plain enum made the picker use our confirmed
room list directly.

The second AppSheet trap was subtler: `Room` was still marked as the row key.
That meant AppSheet treated every `Kitchen` chore as the same row and blocked a
second Kitchen task with an error like:

```text
There is already a row with the key: 'Kitchen'
```

That was wrong because rooms are categories, not records. The emergency mobile
unblock was to use `_RowNumber`, but the durable fix was adding a real
`Task ID` column to the Sheet. AppSheet should use `Task ID` as the key, hide it
from the form, keep `Room` as a category enum, and use `Task` as the label.
After that, multiple tasks can live under the same room.

Once that was fixed, we verified the live mobile form. The Room picker only
showed the confirmed rooms, with no template leftovers. Then we sorted the Room
dropdown alphabetically so it felt clean on mobile:

```text
Auto
Bathroom
Garage
Kitchen
Laundry
Living Room
Office
```

The final app is intentionally boring in the best way. It lets someone add a
chore, pick the room, choose how long it should take, mark it Pending or Today,
and review the daily task list from a phone. The app stays small enough to
trust, but the data is structured enough to later feed an Excalidraw visual
planning board.

## Linear Replay Steps

1. Define the smallest real workflow:

   ```text
   Dump chore task -> assign room -> estimate duration -> choose Pending or Today.
   ```

2. Lock the lean source schema:

   ```text
   Task ID, Room, Task, Duration, Plan, Notes
   ```

3. Reject bloat early:

   ```text
   No review dates.
   No project stages.
   No extra metadata.
   No template-owned task schema.
   ```

4. Set the confirmed option contracts:

   ```text
   Plan: Pending, Today
   Duration: 5m, 10m, 15m, 30m, 45m, 60m, 90m, 2h, 4h+
   Room: Auto, Bathroom, Garage, Kitchen, Laundry, Living Room, Office
   ```

5. Use Google Workspace CLI for the pieces APIs handle well:

   ```text
   Create/update Sheet tabs.
   Create/update Form questions.
   Set Sheet validation.
   Verify readback from the live Google files.
   ```

6. Use Apps Script for the piece the Forms API does not own:

   ```text
   FormApp.setDestination()
   ```

7. Create the AppSheet app from the Sheet.

8. Use Gemini/AppSheet generation only as a starting point.

9. Inspect the generated AppSheet schema before trusting it.

10. Remove template thinking:

    ```text
    Do not let generated Rooms/Durations/Tasks tables become the source of truth.
    ```

11. Fix the core AppSheet field mismatch:

    ```text
    Chores 2.Room changed from Ref to Enum.
    ```

12. Enter only confirmed Room enum values.

13. Fix the AppSheet row identity bug:

    ```text
    Task ID    -> Key on, hidden
    _RowNumber -> Key off
    Room       -> Key off, Label off
    Task       -> Label on
    ```

14. Save the AppSheet app.

15. Open the live app preview.

16. Open the add/edit task form.

17. Verify the Room dropdown does not show template rooms.

18. Verify two tasks can share the same room.

19. Sort Room values alphabetically.

20. Save again.

21. Verify the live Room dropdown order.

22. Keep the future Excalidraw role separate:

    ```text
    Excalidraw reviews and visually promotes tasks.
    Google/AppSheet remain the task data source.
    ```

## Video Talk Track

I would frame the video like this:

```text
I did not start by building an app. I started by naming a tiny workflow I kept
needing in real life: chores by room, with a quick decision about whether each
task belongs today or later.
```

Then show the schema:

```text
The whole app is basically five fields: Room, Task, Duration, Plan, and Notes.
That is the point. The power is not in making the schema fancy. The power is in
making the workflow easy enough to actually use from my phone.
```

Then show the Google setup:

```text
The AI helped wire up the Google side: Sheets for the source data, Forms for
fast capture, and Apps Script for the weird gap where the Forms API does not
link responses to a Sheet by itself.
```

Then show the AppSheet correction:

```text
The annoying part was the template. AppSheet generated something close, but it
also brought sample data with it. The real fix was making sure the app used my
confirmed schema instead of a template Rooms table.
```

Then show the payoff:

```text
Now the mobile app is simple: add a chore, pick the room, pick the duration,
mark it Pending or Today, and move on. This is the kind of custom internal app
that usually sounds expensive, but with AI plus Google Workspace, it becomes a
buildable personal system.
```

## Friction Notes

- AppSheet generation is useful, but it can introduce template tables that feel
  real until you inspect the schema.
- A `Ref` field is powerful, but it was wrong for this flow because it pointed
  at template room data.
- A room must not be the AppSheet key. The key identifies one row; the room
  groups many task rows.
- `_RowNumber` can unblock testing, but `Task ID` is the stable production key.
- The cleanest AppSheet fix was a plain `Enum` for Room.
- Google Forms API can update questions, but Apps Script still owns setting a
  response Sheet destination.
- The app needed live verification in the mobile form, not just trust in the
  editor.
- Alphabetical option order matters on a phone because the picker is the app's
  main interaction surface.
