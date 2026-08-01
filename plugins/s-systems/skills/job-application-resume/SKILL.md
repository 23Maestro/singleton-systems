---
name: job-application-resume
description: Use for blue-collar or white-collar applications, resume tailoring, job-post positioning, or repeated application details.
---

# Job Application Resume

Read `references/resume-workflow.md` for the repeatable workflow.

1. Start with the canonical Reactive Resume JSON for resume, experience, or
   career-reference requests. Do not require PDF extraction when that JSON is
   available. Tailor only truthful summary, skills, and relevant bullets;
   never mutate the source resume.
2. Read the actual post only when the request is job-specific. Use Reactive
   Resume for serious white-collar applications when available; otherwise use
   the documented clean, single-column-safe approach.
3. Verify remote claims against the post. Surface paywalls, subscriptions,
   location constraints, and vehicle requirements.
4. Extract text and visually inspect an exported PDF only when an export is
   requested before calling that export ready.
5. Read [references/application-detail-ledger.md](references/application-detail-ledger.md)
   only for repeated form fields or upload conflicts. Do not automate a browser
   until the repeated pain and target behavior are concrete.

For a full application, return the angle, summary, bullet swaps, keywords,
needed application details, and proof gaps. For quick asks, give only the
highest-impact edits.
