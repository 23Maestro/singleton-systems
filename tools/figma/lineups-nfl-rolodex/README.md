# Lineups NFL Rolodex

Eagle stays the asset store. This development Figma plugin searches a local bridge, previews matching images, and inserts one chosen Eagle file. It never imports an Eagle folder or stores a library copy in Figma.

## Product contract

The Rolodex grows from each Lineups transcript.

1. Extract every named NFL player and coach from the transcript.
2. Compare that list with the full Eagle Rolodex, not only the current episode folder.
3. Return two lists: available and missing.
4. Use Eagle text search and AI Search to recover assets that already exist under weak filenames.
5. For a genuinely missing person, let an agent search the web and return candidate images with their source links.
6. Review the candidate once, check for an existing copy, and import the approved image into Eagle.
7. Make the new Eagle item available to the Figma plugin immediately.

Eagle AI Search searches the existing local library. It does not acquire images from the web. The bridge now searches Openverse anonymously for commercially usable, modifiable image candidates. Openverse results stay in review mode. The bridge does not import them into Eagle.

The plugin does not impose edit timing. It supports any short player, coach, or team mention by swapping assets in the selected Figma scene. The editor or agent decides placement from the transcript and edit timing.

## Audit result

The live `NFL Players` folder has 39 files. All 39 have no Eagle tags or annotations. Embedded image descriptions identify 38 single-subject files. One file contains both Jaxson Dart and Cam Skattebo and stays in the review list. The proposed rows are in [`metadata/identification-manifest.json`](metadata/identification-manifest.json). No Eagle names, tags, files, folders, or annotations were changed.

The current metadata contract approves official team names as the only Eagle tag class. Person names remain a future decision. Role, position, image context, source, confidence, and review state exist only in this proof's read-only sidecar manifest. The plugin and bridge never apply them to Eagle.

Eagle 4.0 Build 23 is installed. The V2 API answers on port 41595 and reports the active `Content Editor` library. The current bridge proof still uses the older V1 routes and is scheduled to move to V2 before the Figma insert proof is final. Eagle returns local image paths, so the bridge supplies image bytes and resizes files above Figma’s 4096 px limit into a temporary cache.

## Architecture

```text
Figma plugin UI -> localhost:41723 bridge -> Eagle local API :41595
                 search JSON + image bytes    canonical files
                         |
                         +-> Openverse licensed-image search
```

The bridge binds to localhost, accepts GET only, checks item IDs and library paths, and allows Figma or null sandbox origins. Sidecar metadata makes generic Eagle names searchable without changing Eagle.

## Setup

```bash
cd tools/figma/lineups-nfl-rolodex
npm install
npm run verify
npm run bridge
```

In Figma desktop, open **Plugins → Development → Import plugin from manifest** and choose this folder’s `manifest.json`. Select a frame. Run **Lineups NFL Rolodex**. Search `Patrick Mahomes`, `Dak Prescott`, or `Andy Reid`. Choose an image-fill target and click **Replace fill**, or click **Insert layer**.

## Delivery envelope

- Source: live Eagle library on `127.0.0.1:41595`
- Surface: Figma design file
- Primary engine: Figma Plugin API
- Output: local development plugin and bridge
- Review owner: Jerami
- Premiere: untouched
