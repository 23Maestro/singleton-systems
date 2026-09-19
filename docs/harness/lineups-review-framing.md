# Lineups review framing

Use S1, S2, S3 and onward in visible episode labels. Do not pad scene numbers
with zeros. The active episode record owns the candidate count. Existing file
keys may stay stable so saved review links continue to work.

Full-screen photos cover 1920 × 1080 from the first frame. Extra image outside
the frame is allowed. Uncovered edges and bars baked into a photograph fail.
Photo pushes start at 100% and finish at 102.5% without shrinking.

Measure visible players, not their selection boxes. For three-player swaps,
the middle player's helmet is highest. The outside players sit slightly lower.
For two-player swaps, helmet heights nearly match and visible outside padding
is balanced. Keep equipment and faces intact. A source with transparent padding
needs its opaque bounds measured before placement.

`npm run check:lineups:framing` runs before every website build. The registered
review map binds all candidate IDs, Figma readback, usable photo bounds, alpha
bounds and preview hashes. A changed preview requires fresh proof. The gate
also checks recorded helmet positions against the requested composition.

This checks the captured review snapshot. It cannot see later Figma edits by
itself. Read the current Figma scenes again after Jerami edits them, inspect
their rendered frames, and refresh the evidence before publishing. Never mark
a candidate approved from a geometry check. Jerami owns design approval.

For Manim-designated beats, the Whisper transcript must be complete and Manim
must validate the cue calculation before the associated Pre-Figma review page
is generated. The page exposes that validated timing context; it does not
initiate timing validation. Figma Motion owns the animation. The canvas poster
must show the complete design before Motion opens. The rendered review must
preserve the spoken reveal order at 25 fps.
