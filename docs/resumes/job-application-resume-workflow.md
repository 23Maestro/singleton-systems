# Job Application Resume Workflow

## Mandatory Repeated Workflow

This workflow is the same every time for resume tailoring. Do not improvise a
new resume structure unless explicitly requested.

1. Open and inspect the current source resume first.
   - White-collar: inspect the original PDF visually if text extraction fails.
   - Blue-collar: inspect the source Markdown.
2. Preserve the source resume's role history, section order, truth, and
   Pearson-style structure unless the user explicitly asks for a different
   layout.
   - Do not add arbitrary sections such as "Selected Match", "Core Strengths",
     or a second profile header unless the source already has them or the user
     asks for them.
   - Do not repeat the user's name, title, or contact header in multiple places.
3. Read the job description and tailor the existing resume language to the job.
   - Revise summary, skills, and relevant bullets.
   - Add truthful power words and job keywords from the post.
   - Include `singleton-systems.com` in the portfolio/contact link area along
     with the user's portfolio and LinkedIn.
   - Emphasize fit without inventing responsibilities, dates, current roles, or
     continuous freelance history.
4. Preserve truth over positioning.
   - Never create a current or ongoing role unless the source/ledger confirms
     it.
   - Never convert older freelance/event work into "Remote | 2014-Present" or
     any other unconfirmed continuous job.
5. Export exactly one user-facing file: a final PDF in `~/Documents`, unless
   the user explicitly asks for another folder.
   - Do not place `.docx`, `.md`, `.html`, screenshots, or source sidecars in
     the delivery folder unless explicitly requested.
6. For serious white-collar applications, default to Reactive Resume:
   confirmed source data -> tailored copy -> Reactive Resume v5 JSON ->
   Reactive template -> PDF export.
   - Keep Reactive API config in ignored `.env.local`; never commit API keys or
     generated private resume JSON.
   - Use `docs/resumes/application-tools/build_reactive_resume.py --job bealls-ai-specialist`
     as the first confirmed reusable Reactive workflow example. The older
     Bealls-specific script remains a compatibility wrapper only.
   - After export, extract text and create a visual preview before saying the
     resume is ready.
7. A single-column ATS-max version is optional only when explicitly requested.
   Blue-collar copy can be simpler, but it should still use clean formatting,
   plain text, consistent bullets, and no heavy design.

## ATS Formatting Findings

Use these findings when updating either blue-collar or white-collar resume
templates:

- Jobscan warns that ATS parsers commonly read left-to-right/top-to-bottom, so
  sidebars, tables, columns, grids, text boxes, graphics, and heavy design can
  scramble or hide resume content.
- Harvard's resume guidance emphasizes clean professional writing, standard
  resume conventions, no personal pronouns, no photos, no references unless
  requested, and considering both human readers and ATS systems.
- Reactive Resume is the preferred serious-application rendering path when API
  access is available because the template, typography, and export surface can
  stay stable while Codex only swaps truthful structured copy.
- ReportLab remains the fallback path for fully custom PDFs or when Reactive
  hosted/self-hosted export is unavailable.
- Use `/Users/singleton23/Documents/Development/singleton-systems/skills/resume-professional-standards/SKILL.md`
  for resume PDF typography, layout, and verification standards.

Clean Pearson-style builder rules:

```text
left stats rail plus thin divider
standard headings: Summary, Skills, Experience, Education, Portfolio
plain paragraphs and hyphen bullets
no tables, text boxes, grids, icons, graphics, outer frames, or background blocks
small text-only color accents are allowed for the name or section headings
extract PDF text after rendering and confirm reading order
visual preview after rendering before calling it ready
```

Professional typography default:

```text
body: 11-12 pt
bullets: 10.5-11 pt
metadata/date lines: 10 pt
role titles: 11.5-12 pt
section headings: 13-15 pt
name: 28-30 pt
leading: about 120% of font size
```

## Source Rules

White-collar source resume:

```text
docs/resumes/white-collar_Jerami_Singleton_Resume2026.pdf
```

Use this as the go-to content baseline, but use the clean Pearson-style builder
as the default layout for job-specific white-collar variants submitted through
portals.
For a specific job, revise only the copy for that job, render one finished
application PDF to `~/Documents`, and leave the source PDF untouched.

Blue-collar source resume:

```text
docs/resumes/blue-collar_Jerami_Singleton_Resume2026.md
```

Build this from confirmed job-history details. Use `Job List.pdf` only as
starter evidence.

Use the clean Pearson-style resume shape as the visual reference for blue-collar
exports when a designed resume is wanted: simple header, clean section spacing,
direct bullets, and no heavy design system.

Job-specific variants follow the same path for both lanes:

```text
source resume -> copy for current job -> revise copy -> render one PDF to ~/Documents
```

Tailoring rule:

```text
Read the job post.
Pull the exact truthful keywords: job title, duties, tools, schedule, vehicle,
warehouse/customer-service terms, and required experience.
Revise the summary, skills, and top 2-3 bullets to mirror that posting.
Render one named PDF copy to ~/Documents unless the user named another folder.
Never overwrite the source resume.
```

Final delivery rule:

```text
~/Documents
```

Documents is the default destination for every job-specific resume unless the
user explicitly asks for another folder, such as iCloud `_Inbox` for mobile
upload. Deliver exactly one file: the final PDF. Do not put `.docx`, `.md`,
`.html`, screenshots, or source sidecars in the delivery folder unless the user
explicitly asks for editable/source files. Temporary working files can stay in
an ignored temp folder, but the user-facing output is one PDF.

Pinned resume render environment:

```text
docs/resumes/application-tools/run_resume_python.sh
/Users/singleton23/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3.12
```

Use the wrapper above for ReportLab resume rendering instead of plain
`python3`. Verified on 2026-06-30: this interpreter imports ReportLab `5.0.0`
from `/Users/singleton23/.local/lib/python3.12/site-packages/reportlab`.
If `/usr/bin/python3` cannot import ReportLab, do not treat ReportLab as
missing; use the pinned wrapper/interpreter first.

Portfolio link rule:

```text
Always include singleton-systems.com in resume portfolio/contact links unless
the user explicitly says to omit it.
```

Reactive Resume white-collar builder baseline:

```text
docs/resumes/application-tools/build_reactive_resume.py --job bealls-ai-specialist
```

This is the first confirmed reusable Reactive Resume workflow. It builds a
complete v5 resume JSON payload, validates it against
`https://rxresu.me/schema.json`, imports it with `POST /resumes/import`, and
downloads the PDF with `GET /resumes/{id}/pdf`.

For a new job variant, add the job-specific headline, summary, notes, output
filenames, skills, and truthful bullet swaps in the builder's job config first.
Keep the shared API, schema-validation, import, and PDF-download code unchanged
unless Reactive Resume itself changes. `build_reactive_bealls_resume.py` exists
only so the original Bealls command still works.

Local config:

```text
.env.local
REACTIVE_RESUME_BASE_URL=https://rxresu.me/api/openapi
REACTIVE_RESUME_API_KEY=<local only>
```

Do not run Reactive AI endpoints unless a separate provider key is configured.
The Reactive API key is used as the `x-api-key` header for Reactive Resume, not
as an OpenAI/Anthropic/Gemini provider key.

White-collar clean Pearson-style ReportLab fallback:

```text
docs/resumes/application-tools/build_white_collar_pearson_clean_resume_pdf.py
```

Use this builder only as a fallback or comparison artifact. It keeps the left
stats rail and divider while applying the direct ATS-formatting feedback: no
heavy frame, no colored background block, no tables, no text boxes, no graphics,
no oversized name, consistent headings, and plain bullets. Preserve full
confirmed work history unless the user explicitly asks for a shorter targeted
resume.

Single-column ATS-max copies are optional only when the user explicitly asks for
that layout. Do not make single-column the default.

Older Pearson reference builder:

```text
docs/resumes/application-tools/build_white_collar_pearson_resume_pdf.py
```

Keep this as a historical/reference builder. Do not use its heavy blue frame as
the default.

## Blue-Collar Resume Shape

Target roles:

```text
delivery driver
customer service
warehouse / logistics support
airport / airline support
```

Search filter:

```text
Prefer employee delivery roles with a company vehicle / work vehicle provided.
Avoid early leads that require a personal vehicle, mileage-heavy contractor
driving, or "bring your own truck/car" language.
```

Positioning:

```text
Reliable customer-service and delivery worker with experience in logistics,
airport support, route-based work, and fast-paced service environments.
Comfortable following procedures, handling time-sensitive work, communicating
with customers and teammates, and keeping work moving safely and on schedule.
```

Core skills to shape around:

```text
Customer service
Delivery / route work
Package handling
Loading and unloading
Time management
Safety procedures
Team communication
Inventory / order accuracy
Problem solving under pressure
```

## White-Collar / Freelance-Adjacent Shape

Treat resume-based remote video editing, educational video, course/content
editing, workflow cleanup, and contract media roles as white-collar even when
they overlap with freelance work. Use the white-collar resume and portfolio assets
for these.

Confirmed timeline context:

```text
Upwork origin:
  Prospect ID and NurseHub both came through Upwork and became long contracts.

NurseHub:
  August 2024-August 2025: roughly full-time, 40 hours/week.
  Q4 2025: slower but still consistent work.
  December 2025: backlog work ended abruptly.

Prospect ID:
  Continued after NurseHub through June 2026.

Portfolio:
  Prospect ID and NurseHub examples are both valid website/portfolio-system assets.
```

Weekly search shape:

```text
Time box: 20-30 minutes, not 60, unless the user asks for deep research.
Recency: posted in the last 14 days whenever the platform supports it.
Priority:
  1. Remote white-collar video/content/workflow roles
  2. Tampa-area hybrid roles
  3. Tampa-area in-person roles
  4. Company-vehicle delivery/customer-service/logistics roles
  5. Upwork/Lifted/Fiverr/freelance leads, capped and selective
Skip:
  FlexJobs
  old reposts
  personal-vehicle delivery roles
  vague contractor courier listings
```

Use sources that can surface current jobs quickly: LinkedIn, Indeed, ZipRecruiter,
Google Jobs, company career pages, Pearson, Cengage, McGraw Hill, EdTechJobs,
ProductionHUB/Mandy-style creative boards, Upwork, Lifted, Fiverr, Contra, and
direct local-business outreach targets. Do not treat Upwork and Fiverr as the
only freelance paths.

Mobile application helper comes after the desktop work-history filler covers
roughly 80% of repeated fields. Use iOS Userscripts as the first mobile test.

## Simple Form-Fill Ledger Rule

Keep one shared ledger for mobile userscripts and desktop Hammerspoon:

```text
blue-collar_work-history-application-ledger.md
white-collar_work-history-application-ledger.md
```

The form-fill scope is intentionally small: type visible text fields and selects
for profile, work history, and education. Do not click submit, next, apply,
upload, save, or other workflow buttons. If the first pass fills only part of a
page, run the same entry again after the next fields appear.

When updating the iOS userscript, always return the complete userscript text in
the final answer. The phone copy is the real install surface, so a repo diff is
not enough.

Possible later split, after addresses and contact/reference data are consistent:

```text
Main work history -> company, role, description, dates
Address block     -> one focused employer-address fill
Contact block     -> one focused reference/contact fill
```

Important quirks:

```text
Desktop and mobile should both match similar job-form fields by labels, names,
ids, placeholders, and visible text. Avoid site-specific command names such as
paylocity.* unless the script truly only supports that site.

Deleting an employer-specific automation does not delete that employer from job
history. Keep resume/application history intact unless the user explicitly asks
to scrub the history data too.

Buttons stay out of scope: no submit, next, apply, upload, save, or workflow
button clicks from the job-history filler.
```

Default shared application answers:

```text
Work Authorization: Authorized to work in the United States; no sponsorship required.
Availability / Start Date: As soon as possible
Desired Pay - Cash Jobs: $21+/hour
Desired Pay - Career Jobs: $30+/hour
```

## Draft Job History

These entries came from the user's confirmed spoken update. Tighten exact
contact details and any employer-specific wording before a final application.

### Sarasota Memorial Hospital

```text
Company: Sarasota Memorial Hospital
Title: Valet
City/State: Sarasota, Florida
Dates: May 2019-October 2019
Duties: valet service, vehicle handling, hospital guest support
Equipment/tools: vehicles, valet/customer-service flow
Customer-service/delivery details: helped patients, visitors, and staff at the hospital entrance
Reason for leaving: only add if an application requires it
```

### GAT Airline

```text
Company: GAT Airline
Title: Passenger Assistant
City/State: Sarasota, Florida
Dates: November 2019-March 2020
Duties: passenger assistance, bags, wheelchair assistance, boarding/deplaning support
Equipment/tools: wheelchairs, baggage handling
Customer-service/delivery details: helped passengers onto and off planes
Reason for leaving: only add if an application requires it
```

### Optimal U.S. Logistics

```text
Company: Optimal U.S. Logistics
Title: Amazon Delivery Driver
City/State: Palmetto, Florida
Dates: March 2020-December 2020
Duties: Amazon package delivery, loading, route completion, customer drop-offs
Equipment/tools: delivery vehicle, packages, route/navigation tools
Customer-service/delivery details: delivered Amazon packages on assigned routes
Reason for leaving: only add if an application requires it
```

### Pepsi Warehouse

```text
Company: Pepsi Warehouse
Title: Warehouse Associate
City/State: Tampa, Florida
Dates: April 2023-June 2023
Duties: warehouse support, product movement, pallet jack work
Equipment/tools: pallet jack
Customer-service/delivery details: distribution/warehouse support
Reason for leaving: only add if an application requires it
```

### Amazon Flex

```text
Company: Amazon Flex
Title: Delivery Driver
City/State: Sarasota / Tampa Bay Area, Florida
Dates: August 2023-August 2024
Duties: picked up delivery blocks, delivered packages, managed routes
Equipment/tools: personal vehicle, Amazon Flex app, packages
Customer-service/delivery details: worked like a full-time route schedule, often 4-5 days per week
Reason for leaving: started NurseHub, only add if an application requires it
```

### HSN

```text
Use white-collar source resume. Do not force into blue-collar resume unless a
specific application benefits from the customer-support angle.
```

## Fields To Confirm

Before final application use, confirm:

```text
whether Pepsi should stay on the resume for each application
whether HSN should be added as extra customer-support experience for a specific job
```
