# My workspace

A Sites review page for the repo, with a full reader for `docs/operations`.

Open folders, read the source files and switch between light and dark mode.
The canvas uses generated marker-and-pencil drawings. Content Editor has a video timeline. The page uses the approved Singleton Systems wordmarks, favicon and Geist font. Both themes use neutral black and white.

Run `node tools/docs-canvas/build.mjs` from the main repository to refresh
its 17-file snapshot. The export reads Markdown bodies only in `docs/operations`.
`folders.mjs` selects 23 main folders and gives them plain labels. The overview
exports only their first level of names and file types. It skips hidden files,
links, dependencies, generated folders, and credential file names. Other file
bodies stay out of the export. The page marks those areas as folder listings.
Search covers folder names, listed items, and the 17 readable docs.
Each file keeps its source path, original text and SHA-256 hash. Links come
straight from Markdown. A link outside this scope is marked in the reader.

The map shows folder contents and guide links. It does not claim that a link
is a live workflow or task state. Graphify stays scoped to code; this view reads
folder names and doc links directly. Jev chose the expandable HTML/SVG approach.

The visual reference is [Obsidian Canvas](https://help.obsidian.md/plugins/canvas).
The website source lives in src/. The build writes sites/docs-canvas/dist/. Deployment archives and screenshots belong in
the storage gate's HomeSSD paths. Sites owns the hosted review; the existing
production website stays on its current host.

The drawing atlas is an intentional website asset in src/assets/. The original
generation and prompt stay in HomeSSD Active Work / SINGLETON_SYSTEMS / renders /
docs-canvas-drawings-2026-11-17. Luna used the inspected Nathan newsletter images
as style references. The artwork does not carry source labels or graph edges.

The [Nathan page guide](../../skills/nathan-review/references/repo-page.md) owns
the plain-language map rules. Its [drawing guide](../../skills/nathan-review/references/drawing.md)
owns the required page look. New areas extend the current map in small steps.
