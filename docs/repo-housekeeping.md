# Repository housekeeping

Git keeps reusable source, schemas, fixtures, templates and approved website
assets. Client footage and exports follow the video storage workflow. File
extensions alone cannot decide what belongs in Git.

Local client drafts belong in `.scratch/`. Episode records, intake evidence and
transaction receipts under `config/lineups/` stay local and available to runtime.
Generated Pre-Figma review packets stay local until approved publication.
Existing tracked published review pages keep their history.
Ignoring them does not delete them or relax review gates. Keep their recovery
copies with the project. Reusable code must move into a tested source directory.
Canonical Lineups configuration and `config/lineups/fixtures/` remain tracked.

Unfinished source belongs on its own branch and checkout. A dated verified
archive preserves dirty and untracked work before cleanup. Do not hide source
with broad ignore rules or commit unfinished work as a completed change.

`plugins/repo-housekeeping/` contains Git cleanup, repository maintenance and
repo prune review. Its provenance file pins upstream sources and records local
adapters. `.agents/skills/repo-prune-review` is a compatibility link to the plugin.
Install its local marketplace with Codex, then install
`repo-housekeeping@singleton-housekeeping`. No hooks or background jobs run.

Branch removal requires evidence and the exact target authorization specified
by the Git cleanup skill. Production records can be archived only after checking
active references and their project recovery copy. Review checks keep the full
suite; its timeout is ten minutes because the suite exceeded three minutes.
