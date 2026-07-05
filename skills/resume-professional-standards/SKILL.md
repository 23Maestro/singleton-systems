---
name: resume-professional-standards
description: Use when creating, reviewing, or revising resume PDFs, ReportLab resume builders, resume layout standards, ATS-aware formatting, typography, spacing, page breaks, and final visual/text verification.
---

# Resume Professional Standards

Use this skill with `pdf` for resume PDF generation and verification.

## Standards

- Use ReportLab for generated resume PDFs.
- Use the PDF skill workflow for final verification: render every page to PNG, inspect visually, and extract text with `pypdf` or `pdfplumber`.
- Keep the user's preferred Pearson-style structure unless the user explicitly asks for a different layout.
- Do not claim Jobscan, Harvard, ATS, or other sources support a design rule or font size unless that source was actually checked in the current turn.
- Use real text, standard fonts, consistent headings, plain bullets, and predictable reading order.
- Avoid heavy frames, colored background blocks, tables, text boxes, icons, graphics, photos, and oversized names.
- A restrained text-only color accent is acceptable for the name or section headings.

## Default Typography

Use these as starting points for professional readability:

```text
body: 11-12 pt
bullets: 10.5-11 pt
metadata/date lines: 10 pt
role titles: 11.5-12 pt
section headings: 13-15 pt
name: 28-30 pt
leading: about 120% of font size
```

Do not shrink below readable standards just to force content onto one page. Let
content move to page 2, reduce excess whitespace, or shorten the weakest bullets.

## Verification

Before saying a resume is ready:

1. Render the PDF with the pinned resume/ReportLab wrapper when working in `singleton-systems`.
2. Extract text and verify all required roles, education, keywords, and no forbidden claims.
3. Rasterize every page with `pdftoppm`.
4. Inspect each rendered page for clipping, overlap, tiny text, bad page breaks, broken divider lines, and inconsistent spacing.
5. Report any limitation honestly if visual rendering tools are unavailable.
