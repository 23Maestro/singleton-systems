#!/usr/bin/env python3
"""Plan review dates from verified outreach facts. Reads JSON and prints JSON."""

import argparse
import json
import sys
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo


STOP = {
    "closed_won": "Hand off to the client task.",
    "closed_lost": "Close the opportunity.",
    "opt_out": "Record suppression.",
    "hard_bounce": "Suppress the failed address and review contact details.",
    "temporary_failure": "Resolve delivery state before another send.",
    "review": "Resolve the missing or conflicting fact.",
}
WAITS = {
    "cold": (4,),
    "permission": (4,),
    "sample_sent": (3,),
    "booking_pending": (2, 5),
    "proposal": (3, 5),
    "no_show": (1,),
}
ACTIONS = {
    "not_contacted": "Prepare the first offer.",
    "cold": "Draft the cold follow-up.",
    "permission": "Draft the sample-permission nudge.",
    "sample_sent": "Draft a useful question about the shared sample.",
    "permission_granted": "Prepare or share the promised sample.",
    "interested": "Answer the request and choose the next step.",
    "objection": "Answer the stated concern with checked facts.",
    "booking_pending": "Help choose a time for the agreed call.",
    "call_booked": "Prepare for the confirmed call.",
    "no_show": "Draft a request to find another time.",
    "post_call": "Prepare the agreed recap and next step.",
    "proposal": "Draft a question about the proposal decision.",
    "later": "Review the agreed topic on the requested date.",
    "out_of_office": "Review the absence and next suitable step.",
    "parked": "Review the history and choose a useful next step before more contact.",
}


def day(value, timezone):
    if not isinstance(value, str):
        raise ValueError("A source date is required.")
    if len(value) == 10:
        return date.fromisoformat(value)
    timestamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if timestamp.tzinfo is None:
        raise ValueError("Timestamps need a time-zone offset.")
    return timestamp.astimezone(timezone).date()


def eligible(value, blocked):
    return value.weekday() < 5 and value not in blocked


def roll(value, blocked, direction=1):
    while not eligible(value, blocked):
        value += timedelta(days=direction)
    return value


def business_days(value, count, blocked):
    direction = 1 if count >= 0 else -1
    for _ in range(abs(count)):
        value = roll(value + timedelta(days=direction), blocked, direction)
    return value


def count(record, name):
    value = record.get(name)
    if type(value) is not int or value < 0:
        raise ValueError(f"{name} must be a verified nonnegative integer.")
    return value


def plan(record, as_of, blocked=()):
    if not isinstance(record, dict):
        raise ValueError("Each lead must be a JSON object.")
    result = {
        "who": record.get("who", ""),
        "stage": record.get("stage"),
        "next_action": None,
        "due_date": None,
        "review_on": None,
        "overdue": False,
        "send_authorized": False,
    }
    stage = record.get("stage")
    if record.get("suppressed") is True:
        stage = "opt_out"
        result["stage"] = stage
    if stage in STOP:
        result["next_action"] = STOP[stage]
        return result
    if stage not in ACTIONS:
        raise ValueError(f"Unknown stage {stage!r}.")
    if record.get("history_verified") is not True:
        raise ValueError("Read the live history before planning a date.")
    timezone = ZoneInfo(record["timezone"])
    blocked = set(blocked)
    anchor = None
    if stage != "not_contacted":
        anchor = day(record.get("anchor_at"), timezone)
        if anchor > as_of:
            raise ValueError("The anchor must be an actual past or present event.")
    action = ACTIONS[stage]
    planned = record.get("followup_plan")
    plan_applied = False
    if stage == "parked" and planned is not None:
        if not isinstance(planned, dict) or planned.get("resume_stage") not in ("cold", "permission", "sample_sent"):
            raise ValueError("A parked followup_plan needs a reviewed resume_stage.")
        stage = planned["resume_stage"]
        action = ACTIONS[stage]
    if stage in ("cold", "permission", "sample_sent"):
        total = count(record, "total_unanswered_sent")
        if total < 1:
            raise ValueError("A waiting stage needs an actual sent message.")
        result["total_unanswered_sent"] = total
        if planned is not None:
            if not isinstance(planned, dict) or planned.get("accepted") is not True:
                raise ValueError("followup_plan must be an accepted action.")
            if not isinstance(planned.get("reason"), str) or not planned["reason"].strip():
                raise ValueError("followup_plan needs a useful reason.")
            if count(planned, "observed_unanswered_sent") != total:
                raise ValueError("followup_plan observed count must match current history.")
            due = roll(day(planned.get("review_date"), timezone), blocked)
            plan_applied = True
        elif stage == "sample_sent" and total >= 2:
            stage = "parked"
            action = ACTIONS[stage]
    if stage in WAITS and not plan_applied:
        followups = count(record, "followups_sent")
        waits = WAITS[stage]
        if stage in ("cold", "permission"):
            if followups != total - 1:
                raise ValueError("Cold send counts conflict; verify history across threads.")
            if "cold_waits_business_days" in record:
                waits = record["cold_waits_business_days"]
                if (record.get("cadence_reviewed") is not True or not isinstance(waits, list)
                        or not 1 <= len(waits) <= 4
                        or any(type(value) is not int or not 1 <= value <= 60 for value in waits)):
                    raise ValueError("A reviewed cadence needs 1–4 integer waits of 1–60 business days.")
        if followups >= len(waits):
            stage = "parked"
            action = ACTIONS[stage]
        else:
            due = business_days(anchor, waits[followups], blocked)
    if stage == "call_booked":
        meeting = day(record.get("meeting_at"), timezone)
        if meeting < as_of:
            raise ValueError("The meeting passed. Verify its outcome before planning.")
        due = business_days(meeting, -1, blocked)
    elif stage == "no_show":
        meeting = day(record.get("meeting_at"), timezone)
        if meeting > as_of or record.get("meeting_missed_verified") is not True:
            raise ValueError("Verify the missed meeting before planning recovery.")
        due = business_days(meeting, 1, blocked)
    elif stage == "out_of_office":
        if record.get("out_through"):
            due = roll(day(record["out_through"], timezone) + timedelta(days=1), blocked)
        elif record.get("return_date"):
            due = roll(day(record["return_date"], timezone), blocked)
        else:
            due = business_days(anchor, 10, blocked)
    elif stage == "later":
        if not record.get("promised_date"):
            raise ValueError("The requested later date is missing.")
        due = roll(day(record["promised_date"], timezone), blocked)
    elif stage == "parked":
        due = roll(anchor + timedelta(days=30), blocked)
    elif stage not in WAITS and not plan_applied:
        due = roll(anchor or as_of, blocked)
    if record.get("promised_date") and stage not in ("parked", "out_of_office", "call_booked"):
        due = roll(day(record["promised_date"], timezone), blocked)
    elif record.get("review_date_override") and not plan_applied and stage not in ("parked", "out_of_office", "call_booked"):
        due = roll(day(record["review_date_override"], timezone), blocked)
    result.update(
        stage=stage,
        next_action=action,
        due_date=due.isoformat(),
        review_on=roll(max(due, as_of), blocked).isoformat(),
        overdue=due < as_of,
        followup_plan_applied=plan_applied,
    )
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", help="JSON file. Default is stdin.")
    parser.add_argument("--as-of", required=True, type=date.fromisoformat)
    parser.add_argument("--blocked", action="append", default=[], type=date.fromisoformat)
    args = parser.parse_args()
    try:
        if args.input:
            with open(args.input, encoding="utf-8") as source:
                records = json.load(source)
        else:
            records = json.load(sys.stdin)
        if isinstance(records, list):
            output = [plan(record, args.as_of, args.blocked) for record in records]
        else:
            output = plan(records, args.as_of, args.blocked)
    except (ValueError, KeyError, TypeError, OSError) as error:
        parser.exit(2, f"Cannot plan outreach: {error}\n")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
