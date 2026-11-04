# prepare the art

## image rules

- Use every suitable client-provided Eagle asset. A supplied contextual photo
  is not rejected because it is not an action shot.
- For new searches, prefer action photography for active players. Avoid roster
  portraits and players posed at the camera. Sideline, event, archival, and
  contextual photos are approved when they fit the transcript, especially for
  coaches and retired players. Action-first is a search preference, not a veto.
- Search Eagle first. For missing artwork, use Google or Google Images with
  `{missing asset} {episode year} week {episode week}`. Add the team, opponent,
  or `action photo` when it narrows the result. For this episode, for example:
  `Tyler Huntley Baltimore Ravens 2026 week 6 action photo`.
- Read `lineups-asset-search.md` and use the Keychain-backed
  `scripts/firecrawl-source-inspect.py` helper to inspect recorded candidate
  source pages for original image links, captions, dates, and credits. Its
  PreToolUse hook binds each request to the scene and current search evidence.
  If Firecrawl fails, record the failure and inspect the pages through the
  browser. Search thumbnails
  are leads; verify the original photo before selecting it. Record its source
  URL, date, team context, credit or license, and checksum in the asset ledger.
- Use the episode's year and week, even when preparing an older episode.
  Broaden to the prior game week or a verified archival action photo when the
  exact search has no suitable result. Record that fallback. Keep supported
  scenes in the review with `assetSearch.status: "needed"` until selection;
  missing artwork cannot reject a transcript-supported candidate.
- Every photo scene exports at 1920 x 1080. Scale the photo until it fills or
  extends beyond the frame. Side bars and uncovered edges fail review.
- Keep faces clear. Match the action to the claim. Avoid nearby photo repeats.
- Keep source links and research notes off the graphic.
- Verify current college or NFL team, roster status, and jersey number before
  labeling a player.

## alpha player assets and scene exports

Asset Swap, Simple comparison and Full comparison require real-alpha player
assets for player compositing. Figma Cinematic 2-up uses full photos with original
backgrounds and never uses player cutouts. Alpha belongs to the replaceable player
asset; it does not make the complete scene a transparent export.

Search Eagle for a suitable existing player cutout first. If one is unavailable,
choose a suitable simple action photo from Eagle or the approved photo sources
and use Figma's native Remove background tool. Preserve the source photo. Verify
real alpha, face and uniform detail, equipment, and clean edges against a
contrasting background before using the cutout. Reject rectangular photo
backgrounds and failed edges. Keep the approved composition and crop roles.

Quick Action Photo, Quick Stat, Stat Breakdown, Year-by-year, and Recurring Board
have no automatic player-cutout requirement. Keep the approved full photos or
board artwork for those lanes.

Export complete motion scenes with their approved backgrounds included.
Keeping background and artwork as separate editable Figma layers does not
require separate transparent artwork exports. Export a transparent overlay only
when Jerami explicitly requests that deliverable.
