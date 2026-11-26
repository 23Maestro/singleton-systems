# Studio review

Studio is the review page for any video work. It lives at
`https://www.singleton-systems.com/studio`. Anyone with the link can watch and
leave notes. Lineups is 1 client lane that uses it. It is not the only one.

## Pick a way in

Both ways need the producer token in `~/.config/singleton-systems/studio.env`.

**1. The shared script.** Use it when the review should link back to this chat.
It uploads local media and binds the chat for **Send to chat**.

```sh
node --env-file=.env.local scripts/studio-start.mjs \
  --client "Singleton Systems" --slug colasante-qb-reel --task linear:23M-123 \
  --title "Armand QB reel" --packet "$REVIEW_DIR/packet.json"
```

- `--client` is 1 of the names in `studioClient` in `lib/studio-projects.ts`.
  Add a new client there first.
- `--task` is `asana:ID` or `linear:ID`.
- `--packet` also needs the current chat and host IDs. The script reads
  `CODEX_THREAD_ID` and `VIDEO_REVIEW_PRODUCER_HOST_ID`, or takes `--chat-id`
  and `--host-id`.
- Without `--packet`, the script only starts the project and prints its link.
- Run it again with the same task to add new versions. It reuses the project.

Lineups runs this script through its own wrapper,
`plugins/s-systems/skills/lineups-editor/scripts/studio-lineups-start.mjs`.

**2. The `create` and `packet` commands.** Use them for a review with no chat
link. POST to `/api/studio/projects` with `Authorization: Bearer TOKEN`:

```text
{ "action": "create", "projectId": "NEW-UUID", "client": "Singleton Systems",
  "title": "Armand QB reel", "task": { "owner": "linear", "id": "23M-123" } }
{ "action": "packet", "projectId": "SAME-UUID", "packet": "PACKET AS A JSON STRING" }
```

This way does not upload files. Every media `url` must already be HTTPS.
For local files, use way 1.

## Build the packet

The viewer says "episode" and "scene" because Lineups came first. For other
work, a scene is 1 clip or 1 section to review.

```json
{
  "episodeId": "colasante-qb-reel",
  "revision": "SHA-256 OF THE PACKET",
  "fps": 30,
  "initialScene": "clip-01",
  "scenes": [{
    "id": "clip-01",
    "title": "Rollout TD",
    "duration": 8.4,
    "thumbnail": "assets/clip-01.jpg",
    "versions": [{
      "id": "clip-01-v1", "label": "Cut 1", "stage": "Motion", "kind": "video",
      "sha256": "SHA-256 OF THE FILE", "url": "assets/clip-01.mp4",
      "poster": "assets/clip-01.jpg"
    }]
  }]
}
```

- `episodeId` must match `--slug`.
- `id` values use letters, numbers, `-` and `_`. Keep them the same across
  versions so notes stay on the right clip.
- `stage` is `Plan`, `Artwork`, `Motion` or `Revisions`. Plain video review
  uses `Motion`, which shows as **Scene Ready**.
- `kind` is `video`, `image` or `plan`. Video and image need a `url`.
- List the newest version first in each scene.
- With way 1, media paths are `assets/NAME.ext` next to `packet.json`.
  Files are mp4, webm, jpg, png or webp, up to 25 MiB each.
- The script fills in `revision`. With way 2, set it to the SHA-256 of the
  packet text.

The full rules are `studioReviewPacket` in `lib/studio-projects.ts`. The Lineups
packet builder is `tools/review_workspace/build.py`. Other lanes write the packet
directly.

## After review

Notes and statuses save by themselves. Read them back with
`GET /api/studio/projects?projectId=ID` and the producer token. Close the
project through task closeout with `--studio-project ID`.
