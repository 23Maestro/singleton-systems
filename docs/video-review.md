# Frame review

[23M-324](https://linear.app/23maestro/issue/23M-324/save-frame-reviews-online)
saves frame notes through the shared viewer, Next API and Convex database and
file storage. Hosted upload and 5-note recovery proof passed on
October 28, 2026. The review preview uses the dedicated `singleton-systems-review`
Convex project. The production website was not replaced.

## Render and note ownership

A trusted producer registers a render with `POST /api/video-reviews`. It sends
a review UUID, render UUID, title, revision, source URL, SHA-256, dimensions,
duration and origin host/chat IDs. A render ID cannot be rebound to new bytes
or another origin. Every revision keeps the review's creation origin. A null
origin stays unbound. The viewer never supplies the
active chat as a fallback. Producer integration with Figma and Unreal is pending.

The producer can upload a review MP4 with 3 requests:

1. `POST /api/video-reviews/uploads` with its producer bearer token returns a
   direct upload URL.
2. POST the raw MP4 bytes to that URL with `Content-Type: video/mp4`. Keep the
   returned `storageId`.
3. Register the render with `media: {storageId, width, height, duration}`. The
   server derives its URL and hash from stored metadata. Supplying an existing
   source URL and hash is also supported.

The MP4 goes directly to Convex, without passing through a Next request body.
Keep original client media in its current durable storage. Uploaded review
copies are extra copies. Abandoned uploads and older revisions have no automatic
deletion policy; review exact files before cleanup.

`/decision-maps/review/[reviewId]` is a public review link. Anyone with the link
can watch and leave frame notes without a password or account. Its public API
omits origin IDs. The random review ID identifies the shared review. Client
material registered here is available to anyone with its link.

The review link permits note writes. Capture freezes the last presented video
frame and its media timestamp, then pauses playback. The viewer hashes the
source and plays those verified bytes from a Blob URL. Capture stays disabled
if the hash differs. The source must allow browser CORS reads. The full file
is loaded in memory; large-file behavior is unproved.
The player keeps its position and play/pause state when switching to verified
bytes.

Notes retain their render ID, timestamp, source hash and full-frame PNG hash.
The server checks PNG dimensions and stores the image in Convex. Retrying the
same note ID and content returns the saved note. Reusing an ID with changed
content fails. The UI keeps the draft on failure and confirms Saved only after
reading the matching record back. Unsaved drafts do not survive a page reload.

## Configuration

Set these server variables on Next:

- `VIDEO_REVIEW_SITE_URL`: Convex HTTP site URL.
- `VIDEO_REVIEW_PRODUCER_TOKEN`: trusted render registration credential.
- `VIDEO_REVIEW_PRODUCER_HOST_ID`: host that producer may bind.
- `VIDEO_REVIEW_BACKEND_TOKEN`: credential for the Convex HTTP action.

Use 2 distinct random tokens, each at least 32 characters. Set the same backend
token on Convex. Keep both tokens server-side. Note writes require a matching
Origin. A review link cannot register renders, upload source media or change
the originating Codex chat.

## Verification and next slice

`node --test tests/video-review-flow.test.mjs` checks the original note path.
`node --test tests/video-review-public.test.mjs` verifies password-free capture,
save and reload on an existing shared review link. Set
`VIDEO_REVIEW_PUBLIC_TEST_URL` to that link.
`node --test tests/video-review-hosted.test.mjs` checks direct upload and 5 notes
through the same UI/API, against local or hosted services. Supply
`VIDEO_REVIEW_TEST_URL`, `VIDEO_REVIEW_TEST_MEDIA`, `VIDEO_REVIEW_TEST_MEDIA_V2`,
`VIDEO_REVIEW_TEST_THREAD_ID`, plus the server variables above. The fixtures are
26-second and 2-second, 640×360 MP4s with different bytes. Proof covers playing,
paused and rapid-seek capture, failed-save retry, hashes, second-browser recovery
at a mobile viewport and preserved notes after rerender. Physical phone and
large-file checks remain open.

The hosted evidence folder is
`/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/references/2026-10-28-video-review-hosted/`.
It contains deployment scope, red/green logs and a saved-note receipt. Exclude
credential files and deployment staging folders from shared evidence.

Choices and replies remain open. Drawing, Send to Codex receipts and Max reel
pairing belong to later tickets. This slice publishes a review preview. It does
not activate a production client workflow.
