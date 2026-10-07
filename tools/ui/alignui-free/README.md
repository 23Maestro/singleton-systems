# AlignUI free source library

Shared component source for Singleton Systems websites, tools and video UI.
This folder does not replace the live website's CSS or import components into it.

## Contents

- `upstream/components/ui/`: free component source, including notifications,
  alerts, status badges, tags and toast wrappers.
- `upstream/utils/` and `upstream/hooks/`: supporting code.
- `upstream/tailwind.config.ts` and `upstream/app/globals.css`: original styles.
- `styles/alignui.css`: isolated Tailwind 4 tokens from AlignUI CLI 0.0.19.
- `inventory.json`: exact source URLs, commit, hashes and import date.
- `upstream/LICENSE`: MIT notice; retain it with copied code.
- `upstream-dependencies.json`: original dependencies for adaptation. The old
  starter's Next.js version is reference metadata; do not install it into the site.

The public starter is pinned to `f37bd913a058ceca39d5bfc2369ec420018e5716`.
Toast wrappers come from the current free documentation. This is a source
library, not a claim that every current v1.2 revision is included.

## Reuse

Copy only the chosen component and its local dependencies into the consuming
project. Resolve `@/components/ui`, `@/utils` and `@/hooks` aliases there. Add only
the required runtime dependencies. Review React and Tailwind compatibility.
The upstream snapshot uses React 18 and Tailwind 3; generated CLI styles use
Tailwind 4. Do not combine those styles without an adaptation pass.

For video: design the fixed-copy UI, export alpha assets, then use the video
workflow for timing and composition. Do not ship a live toast controller just
to animate a pill. Jerami's fonts and supplied references own the treatment;
the upstream Inter font is not a project-wide default.

## Commands

From the Singleton Systems root:

```sh
npm --prefix tools/ui/alignui-free run check
npm --prefix tools/ui/alignui-free run check:styles
```

The importer refuses to overwrite an existing inventory. `styles:init` changes
this tool's stylesheet, PostCSS setup and local dependencies when run from this
folder. CLI defaults used: blue primary, gray neutral, OKLCH, no class prefix.

Free code only. No Pro components, paid Figma kit, account or purchase.
The source checks cover integrity and syntax. A consuming app still needs
type, interaction and visual checks.

## Verification · October 4, 2026

53 UI source files imported, plus hooks, utilities and license. Source hashes,
free-only provenance, TypeScript syntax and local aliases passed. Generated
Tailwind 4 CSS compiled. The live site's CSS, dependencies and Tailwind config
are unchanged. No paid Figma assets were imported.

The repository-wide typecheck still fails in the existing
`tools/business-time/glaze/` sources, including missing `@glaze/core` modules
and `window.glazeAPI` types. AlignUI is excluded from that website program.
Imported components still need consuming-app compatibility and visual review.
