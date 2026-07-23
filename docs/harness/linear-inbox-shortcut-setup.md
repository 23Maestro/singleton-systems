# Linear Inbox: iOS Share Sheet Setup

Manual setup step for the `linear-action-gateway` route (see
`config/cerebral-registry.json`). iOS Safari has no Web Share Target API, so
a one-action Shortcut is the only way to get share-sheet input onto
`/linear-inbox`. This Shortcut makes no decisions — project, template,
new/update, all of that lives on the website now, not here.

## Build

1. Shortcuts app -> new Shortcut -> Details -> enable **Show in Share Sheet**.
   Under **Share Sheet Types**, accept URLs, Images, and Files (leave Text on
   too, for shared plain-text snippets).
2. Add **Get Contents of URL**:
   - URL: `https://singleton-systems.com/api/linear/inbox/draft`
   - Method: `POST`
   - Request Body: `Form`
     - Field `url` -> Shortcut Input (only takes effect when the input is a
       URL; harmless otherwise)
     - Field `file` -> Shortcut Input (only takes effect when the input is an
       image or file)
3. Add **Get Dictionary Value** -> key `id` from the previous step's result.
4. Add **Open URLs** ->
   `https://singleton-systems.com/linear-inbox?draft=` + the `id` value.

That's the whole Shortcut: share sheet in, one POST, one redirect. Android
doesn't need this — `public/linear-inbox.webmanifest` registers a native
`share_target` that does the same draft-creation-then-redirect server-side
via `app/api/linear/inbox/share/route.ts`.

## Verify

Share a link from Safari using the Shortcut and confirm it opens
`/linear-inbox` with the link already showing under "Attached from share."
