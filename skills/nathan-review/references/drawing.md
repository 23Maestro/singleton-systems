# Draw clear ideas

## The look

The reference is Nathan Onn's whiteboard art. The inspected examples are his
November 13 image pipeline, November 6 coding ladder, and October 23 crew chart.
Dates here follow the newsletter's own headings.

Use a clean white page, thick uneven black marker lines, and colored-pencil
fills with visible strokes. Use large rounded hand lettering. Give the main
steps room. Use orange for action arrows, blue for inputs, yellow for decisions,
and green for a checked result. Use fewer colors when the idea needs fewer.

Colored pencil belongs in the drawings. It does not set the page theme.

## Required page rules

For the Singleton Systems repo page, keep these choices unless Jerami changes
them. Do not replace them with a new design on each run.

- Use the real Singleton Systems wordmarks, favicon, and Geist font from the
  existing page and `public/brand`. Do not draw a new company logo.
- Use a white light mode and a black dark mode, with neutral gray panels and
  dots like Obsidian Canvas. No green background or green dark theme.
- Keep the main title exactly `How Your Work Fits Together`. Use title case
  for this page's display titles. Keep the main subtitle absent. This is a
  page-specific choice, not a change to the shared writing rules.
- Keep the larger type already used on the page. Main card labels should be
  at least 22 px and descriptions at least 16 px before zoom. Check their
  rendered size on desktop and phone; fitting the map must not make them tiny.
- Give each folder a drawing that explains its purpose. Content Editor uses
  a video timeline. Use a distinct, relevant object for each other purpose;
  reuse a drawing only when the meaning matches. Keep a text label too.
- Match the inspected Nathan references closely in black marker weight,
  uneven outlines, pencil texture, simple objects, and open spacing. Compare
  the new drawing beside those references before calling it ready. Generic
  flat icons, emoji, and smooth stock vectors do not meet this drawing rule.
- Keep labels, arrows, file counts, and clickable areas in HTML or SVG above
  the artwork. The art must not hide the data or make the page a flat image.

Keep original compositions and Singleton Systems branding. Use Nathan's art
as a reference for the medium and treatment, without his logo or signature.

Small paper notes, folders, tools, or friendly doodles may explain a step.
Leave out mascots that add no meaning. Keep labels short. Use 3 to 6 main nodes
per panel. Split a dense flow into panels. Use 16:9 for a broad flow unless the
destination needs another size. Do not add Nathan's name, logo, or signature.

## The source comes first

Write the exact labels and links in Mermaid or structured data. Use the existing
LikeC4 source for a system map. Do not invent an edge to fill space. Mark a guess
as a guess. The drawing must keep every required branch and arrow direction.

For a data chart, use plotting code to fix values, axes, units, and scale. Apply
the hand-drawn look to the chart theme. Image generation may add art around it;
it must not redraw precise plotted data from a text guess. Save the data and
chart source so the result can be checked and edited.

## The image route

Read `codex-imagegen/SKILL.md`. Run its shell helper with Homebrew Bash and an
explicit output folder. Use a fresh folder per run. First use `--dry-run` to
confirm `gpt-6-luna`, effort `max`, and the destination. The user may override
the model or effort for a specific request. Never change the main coding model.

The machine file is `~/.codex/imagegen.config.toml`. The verified model slug on
November 16, 2026 was `gpt-6-luna`, with `max` supported. Check `codex debug models`
again if a run rejects it. Stop on unavailable model or login; do not silently
switch to Sol, Astra, or API billing.

Reference images are in the gate's `references/nathan-newsletter` folder:
`pipeline.png`, `ladder.png`, `crew.png`, and `one-tank.png`. Inspect them before
use. Give their paths to the image session and label them as style references.
The upstream helper's `refs/` folder does not attach them by itself. Tell the
image session to open the paths before calling the image tool. If that fails,
report the missing reference use instead of claiming the images guided the run.

## Prompt shape

```text
Use case: infographic-diagram.
Draw an original hand-drawn teaching diagram on clean white paper.
Use thick black marker outlines, colored-pencil fills, and large rounded labels.
Use the attached or inspected references for medium, line weight, and spacing.
Keep these exact labels: [labels].
Keep these exact directed edges: [edges].
Layout: [reading order and panels].
Do not add steps, claims, logos, or decorative text.
Save as [unique filename] in [external destination].
```

Make 1 draft unless Jerami asks for variants. Inspect it at normal size and a
small mobile size. Check spelling, all edges, contrast, and clipping. Give the
source file and image path. Label the result as a draft until Jerami accepts it.
For page assets, also check both themes, the real brand marks, and readable
labels in the page. A saved image alone does not pass the page check.

## Limits

Luna carries the prompt to the image tool. It is not the image model. The exact
image backend may be chosen by the tool; report its ID only when returned.
ChatGPT login draws from plan usage. It does not give unlimited generation.
The author's API price ratios do not prove the same savings on a subscription.
OpenAI's pricing page says image turns use more of the general allowance.
