# Akiflow slot observation

October 24, 2026. Signed-in macOS app, through native computer use. The retained app version from the earlier pass is 2.83.8. This pass used new named test records only.

| Action | Visible result |
| --- | --- |
| Right-click the October 24 calendar at 2 PM → Add new time slot | Task / Event / Slot capture opens in Slot mode with a 1-hour duration. |
| Enter Clone slot proof and press Enter | Time slot created successfully. The calendar shows the named 2–3 PM container. |
| Open the slot → Add new task → enter Clone slot member one | Task created successfully. It appears inside the slot and in Today. Its displayed duration is 30 minutes in this account. |
| Add Clone slot member two | The slot count becomes 2. Both members show 30 minutes. Newest appears first. |
| Select the calendar slot and press Enter | Slot details open with the title, date/time/duration, Repeat, member list and Add new task. |
| Set the slot start time to 4 PM | Reopening the time picker reads 4 PM. The initial Today rows still briefly showed 2 PM. |
| Enter 90 minutes in slot Duration | The slot duration reads 1h 30m. A time-slot updated toast appears. |
| Navigate to Inbox, then back to Today; reopen the slot | The calendar shows 4–5:30 PM and count 2. Both members remain in the slot. Both Today rows now show 4 PM and 30 minutes. |

## Build implications

The slot is a named container. Its 90-minute length is separate from the members' combined 60 minutes. This journey did not allocate the members into consecutive start times. Both showed the container's 4 PM start after navigation. Keep membership and task ownership intact when replanning the container.

New task capture remains ready for another member after Enter. Escape exits that capture field. In the observed slot details, Escape alone did not reliably close the whole panel; selecting another view did. Enter opened the selected calendar slot.

## Limits and remaining work

The native drag attempt did not produce a verified position change. Movement and duration change were proved through explicit controls. Pointer dragging, drag-edge resizing, full Tab order, zero slot duration and repeating-slot edits remain unproved. Search exposed Tasks and Events; searching Events for the slot name returned no result. This does not prove every search path excludes slots.

This establishes visible behavior and persistence across navigation. It does not establish the remote storage model. No debugger, sync experiment or external-calendar write was used.

The named test slot and its 2 members remain in Akiflow for inspection. No existing production task was edited, completed or deleted.
