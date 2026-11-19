"""Date and stop-rule regression cases. Run with python3 test_next_action.py."""

import unittest
from datetime import date
from next_action import plan


class OutreachDates(unittest.TestCase):
    def record(self, stage="permission", **changes):
        record = {
            "who": "Example",
            "stage": stage,
            "history_verified": True,
            "timezone": "America/New_York",
            "anchor_at": "2026-11-06T12:00:00-05:00",
            "total_unanswered_sent": 1,
            "followups_sent": 0,
        }
        record.update(changes)
        return record

    def result(self, record, as_of="2026-11-06", blocked=()):
        return plan(record, date.fromisoformat(as_of), blocked)

    def test_friday_cold_nudge_skips_weekend(self):
        self.assertEqual(self.result(self.record())["due_date"], "2026-11-12")

    def test_blackouts_are_excluded_from_intervals(self):
        blocked = {date(2026, 11, 26), date(2026, 11, 27)}
        result = self.result(self.record("proposal", anchor_at="2026-11-24"), "2026-11-24", blocked)
        self.assertEqual(result["due_date"], "2026-12-01")

    def test_timestamp_uses_recipient_calendar_date(self):
        result = self.result(self.record(anchor_at="2026-11-07T01:00:00Z"))
        self.assertEqual(result["due_date"], "2026-11-12")

    def test_two_unanswered_sends_park_across_threads(self):
        result = self.result(self.record(total_unanswered_sent=2, followups_sent=1))
        self.assertEqual(result["stage"], "parked")
        self.assertEqual(result["due_date"], "2026-12-07")

    def accepted_plan(self, **changes):
        value = {"accepted": True, "reason": "Useful review after a long gap",
                 "review_date": "2026-11-19", "observed_unanswered_sent": 2}
        value.update(changes)
        return value

    def test_accepted_later_followup_keeps_prior_exposure(self):
        result = self.result(self.record("cold", anchor_at="2026-10-19",
            total_unanswered_sent=2, followups_sent=1,
            followup_plan=self.accepted_plan()), "2026-11-19")
        self.assertEqual(result["stage"], "cold")
        self.assertEqual(result["due_date"], "2026-11-19")
        self.assertEqual(result["total_unanswered_sent"], 2)
        self.assertTrue(result["followup_plan_applied"])
        self.assertFalse(result["send_authorized"])

    def test_accepted_plan_must_match_current_exposure(self):
        with self.assertRaisesRegex(ValueError, "observed"):
            self.result(self.record(total_unanswered_sent=3,
                followup_plan=self.accepted_plan()))

    def test_plan_requires_acceptance_reason_and_date(self):
        for change in ({"accepted": False}, {"reason": " "},
                       {"review_date": None}, {"observed_unanswered_sent": True}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.result(self.record(total_unanswered_sent=2,
                    followup_plan=self.accepted_plan(**change)))

    def test_plan_cannot_bypass_missing_history(self):
        with self.assertRaisesRegex(ValueError, "live history"):
            self.result(self.record(history_verified=False,
                followup_plan=self.accepted_plan()))

    def test_plan_cannot_bypass_reply_absence_or_closed_stage(self):
        for stage in ("interested", "objection", "out_of_office", "closed_lost", "opt_out", "temporary_failure"):
            result = self.result(self.record(stage, followup_plan=self.accepted_plan()))
            self.assertEqual(result["stage"], stage)
            self.assertFalse(result.get("followup_plan_applied", False))

    def test_suppression_wins_over_accepted_plan(self):
        result = self.result(self.record("cold", suppressed=True,
            followup_plan=self.accepted_plan()))
        self.assertEqual(result["stage"], "opt_out")
        self.assertIsNone(result["due_date"])

    def test_promised_date_wins_over_later_plan(self):
        result = self.result(self.record(total_unanswered_sent=2,
            followup_plan=self.accepted_plan(), promised_date="2026-11-23"))
        self.assertEqual(result["due_date"], "2026-11-23")

    def test_internal_override_alone_does_not_reopen_exhausted_sequence(self):
        result = self.result(self.record(total_unanswered_sent=2,
            followups_sent=1, review_date_override="2026-11-19"))
        self.assertEqual(result["stage"], "parked")

    def test_reviewed_rh_calendar_option_allows_second_followup(self):
        result = self.result(self.record("cold", total_unanswered_sent=2,
            followups_sent=1, cadence_reviewed=True, cold_waits_business_days=[2, 6]))
        self.assertEqual(result["stage"], "cold")
        self.assertEqual(result["due_date"], "2026-11-16")

    def test_rh_option_exhausts_at_third_send(self):
        result = self.result(self.record("cold", total_unanswered_sent=3,
            followups_sent=2, cadence_reviewed=True, cold_waits_business_days=[2, 6]))
        self.assertEqual(result["stage"], "parked")

    def test_changed_subject_cannot_reset_cold_followups(self):
        with self.assertRaisesRegex(ValueError, "counts"):
            self.result(self.record("cold", total_unanswered_sent=2, followups_sent=0))

    def test_cadence_requires_review_and_bounded_integer_waits(self):
        for changes in ({"cold_waits_business_days": [2, 6]},
                        {"cadence_reviewed": True, "cold_waits_business_days": []},
                        {"cadence_reviewed": True, "cold_waits_business_days": [True]},
                        {"cadence_reviewed": True, "cold_waits_business_days": [9999]}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                self.result(self.record("cold", **changes))

    def test_parked_lead_needs_explicit_resume_stage(self):
        with self.assertRaisesRegex(ValueError, "resume_stage"):
            self.result(self.record("parked", total_unanswered_sent=2,
                followup_plan=self.accepted_plan()))
        result = self.result(self.record("parked", total_unanswered_sent=2,
            followup_plan=self.accepted_plan(resume_stage="permission")))
        self.assertEqual(result["stage"], "permission")
        self.assertTrue(result["followup_plan_applied"])

    def test_unverified_history_is_held(self):
        with self.assertRaisesRegex(ValueError, "live history"):
            self.result(self.record(history_verified=False))

    def test_naive_timestamp_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "offset"):
            self.result(self.record(anchor_at="2026-11-06T12:00:00"))

    def test_missing_timezone_is_held(self):
        record = self.record()
        del record["timezone"]
        with self.assertRaises(KeyError):
            self.result(record)

    def test_future_anchor_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "actual"):
            self.result(self.record(anchor_at="2026-11-09"))

    def test_missing_cold_send_count_is_held(self):
        with self.assertRaisesRegex(ValueError, "integer"):
            self.result(self.record(total_unanswered_sent=None))

    def test_sample_followup_limit_parks(self):
        self.assertEqual(self.result(self.record("sample_sent", followups_sent=1))["stage"], "parked")

    def test_shared_sample_cannot_reset_unanswered_send_cap(self):
        self.assertEqual(self.result(self.record("sample_sent", total_unanswered_sent=2))["stage"], "parked")

    def test_second_proposal_nudge_uses_actual_previous_send(self):
        self.assertEqual(self.result(self.record("proposal", followups_sent=1))["due_date"], "2026-11-13")

    def test_exhausted_proposal_needs_internal_review(self):
        self.assertEqual(self.result(self.record("proposal", followups_sent=2))["stage"], "parked")

    def test_promised_date_takes_priority(self):
        self.assertEqual(self.result(self.record("proposal", promised_date="2026-11-16"))["due_date"], "2026-11-16")

    def test_existing_user_chosen_date_is_preserved(self):
        result = self.result(self.record(anchor_at="2026-10-20", review_date_override="2026-10-29"))
        self.assertEqual(result["due_date"], "2026-10-29")
        self.assertTrue(result["overdue"])

    def test_prospect_promise_precedes_internal_override(self):
        result = self.result(self.record("proposal", promised_date="2026-11-16", review_date_override="2026-11-13"))
        self.assertEqual(result["due_date"], "2026-11-16")

    def test_later_date_rolls_weekend_forward(self):
        self.assertEqual(self.result(self.record("later", promised_date="2026-11-14"))["due_date"], "2026-11-16")

    def test_later_without_date_needs_review(self):
        with self.assertRaisesRegex(ValueError, "later date"):
            self.result(self.record("later"))

    def test_absence_return_on_and_out_through_differ(self):
        on = self.result(self.record("out_of_office", return_date="2026-11-09"))
        through = self.result(self.record("out_of_office", out_through="2026-11-09"))
        self.assertEqual(on["due_date"], "2026-11-09")
        self.assertEqual(through["due_date"], "2026-11-10")

    def test_absence_without_date_is_a_review(self):
        self.assertEqual(self.result(self.record("out_of_office"))["due_date"], "2026-11-20")

    def test_call_preparation_rolls_back_before_blackout(self):
        result = self.result(self.record("call_booked", meeting_at="2026-11-30T10:00:00-05:00"), blocked={date(2026, 11, 27)})
        self.assertEqual(result["due_date"], "2026-11-26")

    def test_same_day_verified_no_show_gets_next_business_day(self):
        result = self.result(self.record("no_show", meeting_at="2026-11-06T09:00:00-05:00", meeting_missed_verified=True))
        self.assertEqual(result["due_date"], "2026-11-09")

    def test_no_show_needs_outcome_verification(self):
        with self.assertRaisesRegex(ValueError, "missed meeting"):
            self.result(self.record("no_show", meeting_at="2026-11-06T09:00:00-05:00"))

    def test_overdue_keeps_original_date(self):
        result = self.result(self.record(anchor_at="2026-10-20"))
        self.assertEqual(result["due_date"], "2026-10-26")
        self.assertEqual(result["review_on"], "2026-11-06")
        self.assertTrue(result["overdue"])

    def test_suppression_wins_over_interest_and_promise(self):
        result = self.result(self.record("interested", suppressed=True, promised_date="2026-11-09"))
        self.assertEqual(result["stage"], "opt_out")
        self.assertIsNone(result["due_date"])

    def test_closed_and_failed_delivery_have_no_send_date(self):
        for stage in ("closed_won", "closed_lost", "opt_out", "hard_bounce", "temporary_failure", "review"):
            with self.subTest(stage=stage):
                result = self.result({"stage": stage})
                self.assertIsNone(result["due_date"])
                self.assertFalse(result["send_authorized"])

    def test_all_action_stages_produce_reviewable_results(self):
        for stage in ("not_contacted", "permission_granted", "interested", "objection", "post_call", "booking_pending", "sample_sent", "cold"):
            with self.subTest(stage=stage):
                result = self.result(self.record(stage))
                self.assertIsNotNone(result["due_date"])
                self.assertFalse(result["send_authorized"])


if __name__ == "__main__":
    unittest.main()
