# Dashboard visual pass

The first review uses the actual dashboard components with sample data.

[Open the visual review](https://singleton-dashboard-visual-review.super-cedar-2285.chatgpt.site).

The preview blocks owner writes. It does not prove live saves or outreach routing.

## Scope

- 23M-274: register the free Studio catalog and install selected shadcn controls.
- 23M-275: refresh navigation and calendar styles; add a queue toggle.
- 23M-281: open Clients as a company board. Use Content Editor → Active → dated Asana deliverables. Open each card in the shared task editor.

Keep Contacts available through its own button. Pending rules and the outreach connection remain open. Estimates still need their owner-backed implementation.

## Component sources

Official shadcn supplied Button, Card, Badge and Tabs through CLI 4.22.1. Studio supplied its free `button-01` example without a login. `components.json` registers the free namespace with the explicit `new-york-v4` style. Selected primitives use the official Tailwind 3-compatible `new-york` source. No Tailwind 4 migration or bulk catalog import was made.

- [Official components configuration](https://ui.shadcn.com/docs/components-json)
- [Studio free registry](https://shadcnstudio.com/docs/getting-started/how-to-use-shadcn-cli)
- [shadcn MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)

Next 16.3.4, React 19.2.7 and Tailwind 3.4.16 are retained. The first CLI attempt selected pnpm. The npm lockfile and dependency tree were restored before the successful install.

## Review boundary

The starting commit is `7aab5f2c64bdee68ebc1333489de1d88fa731282`.

Jerami asked for visuals and shadcn first, then commit/merge and code review. The working tree has unrelated changes. Review only the selected dashboard patch. Keep the unfinished routing work outside its commit.

The requested code-review skill will run separate Standards and Spec passes after a non-empty committed comparison exists. The visual review does not approve a production release.

Theme choice persists in browser storage. Queue visibility and board tabs last until reload. Calendar width starts from the viewport size. Saved view preferences remain part of 23M-275.

The browser pass checked desktop, 834-pixel tablet and 390-pixel phone widths. The board scrolls inside its panel. The task modal shows subtasks, closes with Escape and restores card focus. The preview blocks saves and sends.

The initial repository review found that the earlier canonical-JSON extraction made closeout hooks depend on TypeScript loading. Moving that shared helper to plain ESM restored the existing no-TypeScript hook test. All 21 lifecycle tests, transaction checks and typecheck passed after the fix.

## Asana decision

Jerami confirmed free Asana on October 24. The lifecycle will use linked task references for dependencies. The native dependency path remains unsupported by this account. 23M-288 owns the follow-up implementation and real client-delivery proof.
