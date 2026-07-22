---
name: job-application-resume
description: Use for blue-collar or white-collar applications, resume tailoring, job-post positioning, or repeated application details.
---

# Job Application Resume

Use the repeatable workflow in
`docs/resumes/job-application-resume-workflow.md` in the Singleton Systems
repository.

1. Read the source resume and actual post. Tailor only truthful summary, skills,
   and relevant bullets; never mutate the source resume.
2. Use Reactive Resume for serious white-collar applications when available;
   otherwise use the documented clean, single-column-safe approach.
3. Verify remote claims against the post. Surface paywalls, subscriptions,
   location constraints, and vehicle requirements.
4. Extract text and visually inspect every exported PDF before calling it ready.
5. Read [references/application-detail-ledger.md](references/application-detail-ledger.md)
   only for repeated form fields or upload conflicts. Do not automate a browser
   until the repeated pain and target behavior are concrete.

For a full application, return the angle, summary, bullet swaps, keywords,
needed application details, and proof gaps. For quick asks, give only the
highest-impact edits.
