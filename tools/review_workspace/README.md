# Studio

Source for `/studio` and the private review preview. The project list starts
empty under Catena Media, Intent Solutions and Singleton Systems. The Lineups
handoff records the scene packet and the originating Codex thread together.

Build the packet for the current episode. Run the storage check first and set
`CATENA_PREVIEW_DIRECTORY` to an episode folder under the returned root.

```sh
node scripts/developer-storage/storage-gate.mjs route --client CATENA_MEDIA --kind previews
verified_review=$(python3 scripts/render-lineups-review.py \
  --episode "$EPISODE_DIRECTORY" \
  --destination "$CATENA_PREVIEW_DIRECTORY/source")
python3 tools/review_workspace/build.py \
  --packet "$verified_review" \
  --output "$CATENA_PREVIEW_DIRECTORY/studio" \
  --title "$EPISODE_TITLE"
```

Use an isolated Catena preview directory for each episode. The domain bundle
serves the project list and viewer at `/studio`. Pass the generated
`packet.json` to `studio-lineups-start.mjs --packet` from the Lineups skill.
The command uploads the adjacent `assets/` into the project and verifies their
hashes before attaching the packet.

Check the domain bundle with `node --test tools/review_workspace/studio.test.mjs`
and `python3 -m unittest tools.review_workspace.test_build`. Run
`node tools/review_workspace/check-browser.mjs REVIEW_URL` against `/studio`
after deployment. Test a fresh session and a direct
reload. Browser notes from the private preview stay on that preview's origin.

Plan uses large visual summaries and team-color rank cards. Timing and Needs
live in Plan-only side tabs. Comments stays available in every stage. The status
menu beside the title owns approval and changes. Phones place the panel below
the visual. Source photos stay separate from the plan; the viewer has no
repeated version-label overlay.

The builder checks timing/cue hashes and every copied media hash. It preserves
scene IDs and links to source artwork and timing proof. It creates planning thumbnails without changing episode content. No extra dependencies are installed.

Studio keeps drafts in this browser. In a project review, every posted note,
reply, frame rectangle and scene status saves online by itself about half a
second later and is read back. If another tab saved first, Studio merges both:
notes join by id and this browser's statuses win. There is no save button. **Send to
chat** requires a verified delivery receipt from the bound thread (23M-326).

On the source Mac, `node scripts/install-studio-relay.mjs` installs the
relay. It checks for queued reviews every 15 seconds while the Mac is signed in.
Studio shows **Sent to chat** after the relay finds the message in the bound
thread. A claimed send with no receipt needs a chat check.

Run `node scripts/studio-access-link.mjs` on the source Mac for the private
Studio link. Bookmark the link itself. The address bar drops the access code
after opening it. If the browser clears its cookies, use the same bookmark.
Only share it with someone who should be able to manage Studio projects.

To revoke the link and all Studio browser sessions, replace `STUDIO_OWNER_KEY`
in the local Studio configuration and in Vercel production. Deploy with the
new key, then run the link command again.

Producer access lives in `~/.config/singleton-systems/studio.env`. To retry a specific send, run
`node --env-file=~/.config/singleton-systems/studio.env scripts/studio-send-to-chat.mjs SEND_ID`.

Pass `--studio-project PROJECT_ID` to the task closeout `finish` command for a
linked project. If Studio fails after task closeout, run `check` with the same
project ID to retry the Studio close. **Delete project** removes the project and
saved review data from Studio. Confirm any claimed send before deleting.

Focus a storyboard card or click the viewer to use ←/→ for scenes, A to approve,
C to request changes and focus the comment field, and Space to play/pause video.
F attaches a frame note. Esc returns from the panel to the viewer, keeping the
draft. Typing fields and native controls keep their own keys. A stays on the scene.
Cards have centered, single-line status footers and one glowing selection border.
Cmd+B toggles the panel and keeps its draft. The stage bar holds the scene title,
status and version controls; the viewer has no extra header. The storyboard row
sizes from the cards so their footers remain visible in shorter windows. Changes
Requested is shown as Changes while stored feedback keeps its original status.
Poppins and white text carry the review UI. Production directions stay in the
packet. Comments opens by default. Plan holds lane, look, tool and Mark's quote. Timing
holds the speech-cue table; Needs holds missing and verified source assets. Timing receipts stay in the packet without a panel control.

Video comments pause playback and keep the timestamp from when typing starts.
Cmd+Enter posts; Enter adds a line. Older untimed notes remain untimed. Drawing
opens in a large dialog with Undo and Done; closing it preserves the frozen
frame, marks and comment. The panel preview opens the same drawing for editing.

Frame notes currently use custom rectangle marks. Annotorious is installed in
the repository but is not wired into this preview.

References: Frame.io runtime study, parent spec v0.5, OpenMontage production
flow and Raycast colors. Libraries found through ScrapeCreators are recorded
in the November 3 research packet on HomeSSD; no third-party editor source was
copied into this preview. Motion Panels is the leading panel-library candidate
for the React integration after visual review.

## Deploys

Edit `tools/review_workspace`, then copy `app.mjs`, `model.mjs`, `review.css` and
`studio-home.mjs` into `public/studio`; the Studio test fails when they differ.
Deploy and link rules are in [website apps](../../docs/website/apps.md).

## Stages

Each scene opens on its furthest built version, newest first: Revisions, then
Motion, then Artwork. A scene with nothing built opens on its Plan, the build
storyboard. Press P on desktop to switch every scene between Plan and its built
version. The stage buttons always open the newest version in that stage.
A built scene plays its ready video with no version dropdown. The plan's
dropdown lists only the build storyboard and source photos, and hides when
there is one choice.
Publish new versions first in each scene's list so newest stays first.
