# Stages and dates

A due date is for review. It never permits a send.
Read full live history across subjects. Preserve lifetime exposure and actual
send IDs. Use the last real relevant event as the anchor. Drafts, reminders and
check runs do not reset it. A new thread does not erase earlier sends.

## Choose the treatment

Keep the short sequence as an available default: first message plus 1 nudge,
with 4 eligible business days after the actual send. Exhaustion means review
before more contact. It is not a permanent ban.

The supplied R&H option is 3 total emails: a first follow-up about 48 hours
later, then a final one 5–7 eligible business days later. The helper can model
2 and 6 business days as a calendar-based test. That is our adaptation of the
48-hour interval. Choose and record it before use; do not silently change an
accepted lead's schedule. Neither option is a universal best cadence.

Choose timing from the buyer, useful reason, prior exposure and current offer.
Use more touches only while their value justifies the exposure. Stop on a
human reply and route the conversation. Keep clear declines out of automatic
recycling. Suppress opt-outs.

## Plan later contact

Two close sends in an old conversation do not exhaust all future follow-up.
Review the full history and choose a useful message. Jerami may accept a
specific follow-up to the existing offer after a long gap. A new coverage cycle
needs a materially different angle or newly relevant reason. A fresh external
event is optional. Time passing alone does not start a cycle.

Keep the old counts. Record the accepted reason, review date and observed
unanswered-send count. A saved plan applies only to that count. After another
actual send or reply, review it again. Never auto-enroll old sheet rows.

## Stage rules

| Stage | Review default or next step |
| --- | --- |
| not_contacted | Prepare the chosen offer |
| cold / permission | Selected sequence after last actual send |
| sample_sent | Useful question after 3 business days; review after 1 |
| permission_granted | Fulfill the requested sample |
| interested / objection | Answer the actual request or concern |
| booking_pending | 2, then 5 business days from each actual step |
| call_booked | Prepare 1 eligible business day before the call |
| no_show | Verify the missed call, then review next business day |
| post_call | Prepare the agreed recap and next action |
| proposal | 3, then 5 business days from each actual send |
| later | Prospect's requested date |
| out_of_office | Pause; use return date rules below |
| parked | Internal review after 30 calendar days; no automatic message |
| closed_won / closed_lost / opt_out | Handoff, close or suppress; no timer |
| hard_bounce / temporary_failure / review | Resolve the exact issue; no timer |

The post-reply waits and 30-day internal review are local defaults. Promised
or accepted dates win. Keep a passed due date visible and choose today's next
eligible review day; never rewrite history to make an action look on time.

## Calendar

Use the recipient's verified time zone and accepted calendar. The helper uses
Monday–Friday, plus supplied holiday and blackout dates. Missing location needs
a recorded market fallback or a hold. Move due dates to the next eligible day.
Exclude blackouts from intervals. Match send hours to reply coverage separately.

For absence, resume no earlier than a stated return date. If out through a date,
use the next eligible day. With no date, review after 10 business days. Recheck
history and suppression; send no overdue messages together.

## Date helper

Resolve the installed skill's real folder. Run Python with the absolute helper
path, `--as-of YYYY-MM-DD`, optional `--input FILE` and repeated `--blocked DATE`.
Without a file it reads JSON from stdin. It never calls Gmail, Sheets or Asana.

Input requires `stage`, `history_verified: true`, `timezone`, and an actual
`anchor_at` for an existing conversation. Waiting stages need verified
`followups_sent`. Cold/sample stages also need `total_unanswered_sent` across
all related threads since the last human reply. Keep lifetime events in the
source record even after a reply. Dates may be ISO dates or offset timestamps.

An accepted nondefault cold sequence needs `cadence_reviewed: true` and
`cold_waits_business_days`, such as `[2, 6]`. The helper uses the full known
unanswered count; it never invents a new cycle or resets that count.

For 1 explicitly accepted later follow-up, pass:

```json
{
  "who": "Example",
  "stage": "cold",
  "history_verified": true,
  "timezone": "America/New_York",
  "anchor_at": "2026-10-19T12:00:00-04:00",
  "total_unanswered_sent": 2,
  "followups_sent": 1,
  "followup_plan": {
    "accepted": true,
    "reason": "Useful follow-up to the existing offer after a long gap",
    "review_date": "2026-11-19",
    "observed_unanswered_sent": 2
  }
}
```

`followup_plan` bypasses the exhausted sequence only for that reviewed action.
For an already parked record, add `resume_stage` set to `cold`, `permission`
or `sample_sent` after review. It cannot bypass a reply, suppression, failure,
absence or closed state.
`promised_date` takes precedence. `review_date_override` preserves an existing
internal date within an eligible sequence; it alone cannot reopen a parked lead.
Output always has `send_authorized: false`. A parked result is internal review,
not an email to draft. A plan is not send permission.
