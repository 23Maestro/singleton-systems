# Broadcast technique spec

This spec turns the Chase Oliver reel study into rules the engine must meet.
It describes principles and measured behavior. It copies no designs, marks or
assets. Each rule ends in a check that a render can pass or fail.

Source: Chase Oliver, design director reel, LinkedIn, posted 2026-10-28.
1138 × 640, 30 fps, 79.4 s. Study page:
<https://claude.ai/artifact/Rqa1T5xtgkESdyp47JdCwz>. Timecodes below are
`mm:ss:ff` at 30 fps. Frame numbers are 0-based.

## How to use this file

Each category has the same parts:

- Job: what the element does in a broadcast package.
- Observed: what the reel shows, with timecodes.
- Rules: what makes it read as television.
- Layers: which engine owns which layer.
- Slots: the data a scene row fills.
- Checks: testable acceptance rules for a proof frame or render.

Engine owners use these names. Blender owns lit 3D layers. HyperFrames owns
type, numbers, data timing and 2D motion. Premiere owns footage, assembly and
sound. Figma stays the design source for flat UI parts. Layers meet as alpha.

## Shared look rules

These rules apply to every category. They are why 20 brands read as one
designer.

### Lighting

- One hard key light from upper left or upper right. It draws a bright
  specular line along every bevel. Seen on NBA on TNT 00:03:20, Big 12
  00:06:25, NASCAR chrome 00:45:00.
- A colored rim light from behind or below, in a team or brand color. NBA on
  TNT uses teal under the plate. TNT Sports uses cool blue.
- Near-black or deep brand-color grounds. Large dark areas let the speculars
  carry the frame.
- A visible environment in reflections. Chrome letters reflect a red set on
  Summer Series 00:39:15. Chrome without a readable reflection looks grey.

### Materials

The reel uses a short palette of finishes. Each one returns across brands.

| Finish | Where | What sells it |
| --- | --- | --- |
| Polished chrome | Big 12, TNT Sports, Summer Series, MLB ball | Sharp reflections of a lit set, dark core, bright edge line |
| Glossy painted plate | NBA on TNT, Big East | Saturated fill, clear-coat highlight, silver bevel rim |
| Brushed or dark metal | NASCAR garage 00:44:20 | Anisotropic streaks, low key, embossed mark |
| Satin white | Braves 00:58:20 | Soft wide highlight, no mirror reflection |
| Glass and acrylic | Kansas 00:49:21, Alcaraz panels | Edge refraction, frosted fill, light catching the edges |
| Event material | Clay, ice, cloth, crowd texture | A physical sim or texture tied to the sport |

### Logo geometry

- Logos are extruded solids with a visible bevel. The bevel is what catches
  the key light. Flat logos never appear in hero moments.
- Plates sit behind marks. NBA on TNT is a tilted plate with a silver rim.
- Depth stays modest. The front face reads as the true brand mark.

### Camera and depth

- The camera is never locked. Every hold has a slow push, drift or orbit.
- Shallow depth of field. NBA on TNT sits over a bed of basketballs blurred
  out of focus. The 23 sits over grey, blurred arena seats.
- Motion blur on every fast move. Slams arrive blurred and sharpen on landing.

### Post and color

- Bloom on speculars and light hits. Light bursts clip to white.
- Chromatic aberration only on fast transitions. The TNT logo wipe at
  00:41:06 shows RGB fringes on its edges.
- Color isolation. The 23 sits on a desaturated background, so team gold is
  the only color.
- Grain is light. It is visible on dark chrome holds and never on flat UI.

### Checks for the shared look

- A proof frame of any hero mark shows a specular line on at least one bevel.
- A rim light in the slot's team color is present and measurable at the mark's
  silhouette.
- Camera position differs between the first and last frame of every hold.
- Fast moves above a set screen speed render with motion blur.
- Team brand colors on flat faces stay within a set color difference of the
  registered hex values after color management.

## Motion grammar

Measured on native frames.

### The slam

- Big East, frames 215 to 222: the wordmark enters at about 2.2× scale with
  motion blur. It reaches about 1.15× two frames later and lands near 1.0× by
  frame 4.
- After landing it keeps moving. Scale eases down about 15% over the next 7
  frames, while the ring behind it turns.
- The 23, frames 641 to 650: same shape. About 3× to 1× in 5 frames. The
  outline stroke trails the fill by a few pixels, like an echo.
- Crypto.com Showdown, frames 2013 to 2021: the card starts full frame and
  pulls back to about 55% in 8 frames. The world appears around it. The
  background is regraded cool blue to fit the brand.

Rules:

- Entry runs 3 to 6 frames on a strong ease-out. No bounce or elastic overshoot.
- Motion blur during entry. Sharp at landing.
- A slow secondary move continues through the hold.
- The landing frame sits within 2 frames of a strong music hit.

### Type builds

- Side labels resolve letter by letter. LOS ANGELES and LAKERS assemble from
  scattered letters over about 4 frames, with wide tracking.
- Names wipe on letter by letter. Jalon Daniels at 00:50:03.
- Type tracks outward from the mark. ATLANTA and BRAVES slide out from the A
  at 00:58:20.
- Title words can enter from the frame edges. MAMBA and FOREVER at 00:20:12.

### Checks for motion

- Slam entry frames: 3 to 6. Scale at the first frame ≥ 1.8×.
- No frame in a hold has zero camera or element movement.
- The landing frame is within 2 frames of a marked cue.

## Categories

### 1. Network and league IDs

Job: brand the show or the property in under a second.

Observed: NBA on TNT 00:03:14, NHL 00:04:03, MLB Tuesday 00:05:19, Big 12
00:06:22, Big East 00:07:05, NASCAR four versions 00:36:15 to 00:45:14,
Braves 00:58:09, a college logo run of about 4 frames each at 00:53:12.

Rules:

- Use the shared look and the slam.
- One mark, several finishes. A package ships the same mark in chrome, neon,
  element and dark metal so editors can vary the open.
- Short ID runs speed up before a section change.

Layers: Blender owns the mark, plate, set and light. HyperFrames owns
supporting type. Premiere times the run to the music.

Slots: mark geometry or SVG, brand colors, finish choice, supporting text,
background world choice.

Checks: shared look checks, slam checks, and the finish renders from one
master with only a material swap.

### 2. Event and tournament worlds

Job: give one event a world of its own.

Observed: Roland-Garros 00:08:15 to 00:15:01 uses clay everywhere: 3D clay
balls, a clay explosion holding the title, a clay mound set and a clay burst
behind the player. The Stanley Cup uses ice and shatter at 00:28:15 to
00:31:02. U.S. Soccer uses shards, stars and crowd texture at 00:59:14 to
01:04:12. Real places appear under the CG: Paris, the Arc, San Francisco.

Rules:

- Each event has one signature material. It shows up in sets, particles and
  transitions.
- A physical effect carries the story. Clay dust rises over live footage and
  brings in the title at 00:12:10.
- Real location plates ground the CG.

Layers: Blender owns sets, sims and particles. Premiere owns plates and live
footage. HyperFrames owns titles.

Slots: event material, location plate, event title, colors, signature effect.

Checks: the signature material appears in at least the set and one
transition. A sim or particle layer renders as alpha over footage.

### 3. Player and talent elements

Job: introduce a person with team identity and one fact.

Observed: Alcaraz 00:13:24 has yellow panels sweeping, a cutout, the name, a
clay burst and the flag. Kobe at 00:19:12 uses stacked cutouts on purple with
type entering from the edges. The 23 at 00:21:11 links two players by jersey
number. Jalon Daniels 00:50:03 and Jeff Sims 00:50:18 use team-color circles.
Acuña 00:56:12 has 41 HR and 73 SB as huge numerals.

Rules:

- Three layers: a team-color world, a lit player cutout, and the name build.
- One big number per card. Stats appear as large numerals in the frame,
  never as a small table.
- The cutout sits in the light. Edge light in team color on the cutout.

Layers: Blender owns the world, panels and light on the cutout card.
HyperFrames owns names and numbers. The cutout is an alpha asset.

Slots: player cutout, name, team, team colors, jersey number, one or two stats.

Checks: the cutout has a team-color rim. The name is readable at its smallest
size for at least 1 s. Numerals fill a set share of the frame height.

### 4. Live on-air graphics

Job: show the package working on real air.

Observed: Match summary 00:11:08. NHL goal with the score bug and GOAL
animation 00:31:02 to 00:36:15. NASCAR lower thirds and driver ID 00:37:16 to
00:39:08. Leaderboard 00:42:03. Driver comparison 00:40:12. QB comparison
00:51:12. Matchup bug 00:52:10.

Rules:

- Every package is paired with a live shot using its graphics.
- Comparison graphics split the frame into two team colors. Silhouettes fill
  into photos.
- Data cards sit inside a 3D world. The driver comparison card has glass
  edges in front of a track plate.

Layers: HyperFrames owns cards, numbers and bugs. Blender owns the world
behind and any glass frame. Figma stays the flat UI source.

Slots: two sides with team, colors, cutout and stat rows. Source citation per
stat.

Checks: stat rows match their cited source. Each side carries its team color.
The card is readable for its full cue window.

### 5. Studio and show opens

Job: sell the show's character.

Observed: TNT Sports San Francisco 00:22:06 with giant blurred letters
pushing through camera and a dutch-roll hyperlapse. Inside the NBA 00:24:03
with a radial zoom into the set and the logo flying out. Barkley 00:25:13, a
1 s personality beat. The logo tracked into city plates 00:26:15.

Rules:

- A human beat follows the open. It breaks the graphics run.
- The logo lives in the show's real place. Track it into plates.

Layers: Blender owns the set and logo. Premiere owns plates and the cut.

Slots: show mark, set world, location plate, host moment.

Checks: the logo's motion matches the plate's camera with no visible slide.

### 6. Brand-made transitions

Job: move between shots using the brand's own shapes.

Observed:

- Logo letter as matte. White TNT letterforms fill 2 frames at 00:30:03. The
  negative space shows the next shot. The bug then lands in its real on-air
  corner.
- Logo as portal. The TNT circle grows from inside the driver comparison at
  00:41:06. Its inside shows the next shot, a light-rush tunnel.
- Type as wipe. SUMMER letters grow into a wipe at 00:40:00.
- Light hits. Bloom flashes at 00:10:00, a light burst at 00:27:12, a
  starburst at 01:11:09.
- Speed moves. Radial zoom blur 00:24:00 and 00:59:15. Whip blur 00:07:21.
  RGB streaks 00:08:07.
- Shape wipes. White shards 00:59:21, a star row 01:04:27, horizontal bars
  01:00:15.

Rules:

- Build wipes from the brand's marks and shapes first. Generic wipes come last.
- Transitions run 2 to 8 frames.
- The covered frame lands on a music hit.

Layers: Blender renders mattes and light passes as alpha. Premiere or
HyperFrames composites them.

Slots: mark or letterform, shape set, color, direction, duration.

Checks: matte renders as a clean alpha. The covered frame is within 2 frames
of a cue. Duration stays within 2 to 8 frames.

### 7. Live action beats

Job: give the eye a rest so the next hit lands.

Observed: NHL goal wide 3.2 s. Golf swing 1.6 s. Alcaraz on the clay 1.4 s.
Graphics shots median about 0.6 s, one beat at 108 BPM.

Rules: graphics run about one beat each. Live emotion holds 1.3 to 3 s.

Layers: Premiere.

Checks: none for the engine. This belongs to the edit.

### 8. Structure

Job: give a package or reel a shape.

Observed: name built in six shots, then held 2.1 s. The close plays the
opening order in reverse. Big 12 and Big East repeat to start the college
section. JUMP JUMP type matches the song's lyric. The end card holds 8.1 s.

Rules: open and close mirror each other. A repeat marks a new chapter.

Layers: Premiere.

Checks: none for the engine. This belongs to the reel.

## LineUps lane fit

| Lane | Categories that apply |
| --- | --- |
| 1 Quick Action Photo | 3 player, 6 transitions |
| 2 Quick Stat | 3 player, 4 live graphics |
| 3 Stat Breakdown | 4 live graphics |
| 4 Comparison | 3 player, 4 live graphics, 6 transitions |
| 5 Year-by-Year | 4 live graphics |
| 6 Asset Swap | 1 IDs, 6 transitions |
| 7 Recurring Board | 1 IDs, 4 live graphics |

Lane 4 touches the most categories. It is the first build.

## Blender methods

Target: Blender 5.2.2 LTS on an Apple M4 with 24 GB. Status words: tested
means run on this Mac. Sourced means the Blender manual or release notes say
so. Unverified means no primary source and no local test yet.

### Render path

| Rule | Method | Status |
| --- | --- | --- |
| Fill a master from data | `Blender -b master.blend -y --python-exit-code 1 -P fill.py -- row.json`. Arguments after `--` reach `sys.argv`. | Sourced |
| Fail loudly | `--python-exit-code 1` turns a Python error into a failed job. | Tested |
| Drivers run headless | `-y` enables Python drivers, which `-b` disables by default. | Sourced |
| EEVEE renders headless | EEVEE rendered 5 frames at 320 × 180 in 5.6 s, startup included, from a logged-in session. SSH and launchd are untested. | Tested |
| Engine name | `BLENDER_EEVEE` is the only EEVEE id in 5.2. | Tested |
| Cycles on GPU | Set Metal and GPU in `fill.py`. Do not rely on saved preferences. | Sourced |

### Shared look

| Look rule | Method | Status |
| --- | --- | --- |
| Hard key plus colored rim | One small, hard area light as key. One area light per team color as rim. EEVEE lights take one color each, set from the row. | Sourced |
| Readable chrome reflections | Principled BSDF, Metallic 1, low roughness. EEVEE reflects only what is on screen, so add a studio HDRI or sphere light probes. Use Cycles for hero glass, ice and chrome reflecting chrome. | Sourced |
| Near-black ground with alpha | Film Transparent. Hide the world from camera and keep it in reflections. | Sourced |
| Brushed metal and satin | Raise roughness. Add anisotropy for brushed metal. EEVEE and Cycles anisotropy parity is unverified. | Unverified |
| Glass over footage | Cycles Film Transparent Glass. | Sourced |
| Beveled logos | SVG import to curves, extrude, bevel, convert to mesh. Then a Bevel modifier with Set Strength and a Weighted Normal modifier with Face Influence and Keep Sharp. | Sourced |
| Live text | Set `obj.data.body` from the row. Pack fonts into the master and assert the font path in `fill.py`. | Sourced |
| Camera never locked | Keyframed push or drift on every hold. A custom property scales its distance per lane. | Standard practice |
| Shallow depth of field | EEVEE depth of field, rewritten in 4.2. Blended materials break it unless DOF Max Size is 0. | Sourced |
| Motion blur on slams | EEVEE accumulation motion blur. Raise steps for 3 to 6 frame slams. Each step costs a full scene evaluation. | Sourced |
| Bloom and light hits | Compositor Glare node, Bloom or Fog Glow. Streaks or Sun Beams for flashes. Render glare as its own layer. | Sourced |
| Chromatic aberration | Compositor lens distortion with dispersion, on transitions only. | Unverified |
| Radial zoom blur | Compositor Directional Blur with zoom. | Unverified |
| Grain | Added once in the final comp, never per layer. | Design choice |

### Color

| Rule | Method | Status |
| --- | --- | --- |
| Team colors stay true | View transform Standard, Look None, Exposure 0. Khronos PBR Neutral for lit logos if Standard clips. | Sourced |
| Do not trust the default | New files open in AgX, which desaturates bright colors. `fill.py` must set the view transform. | Tested |
| Hex to Blender | Convert sRGB hex to linear before writing a color socket. | Standard practice |
| Check | Sample a flat brand face in the proof frame and compare it to the registered hex. | Planned check |

### Output

| Rule | Method | Status |
| --- | --- | --- |
| Alpha to Premiere | Blender writes ProRes 4444 with alpha directly. The test file read `prores`, profile `4444`, `yuva444p12le`. 81% of pixels were transparent and the cube was opaque. | Tested |
| Settings | `file_format` FFMPEG, `format` QUICKTIME, `codec` PRORES, `ffmpeg_prores_profile` 4444, `color_mode` RGBA, Film Transparent. | Tested |
| Never 422 | ProRes 422 has no alpha. | Sourced |
| Premultiplied or straight | ProRes does not record it. Premiere sets it per clip in Interpret Footage. Pick one convention per lane and test a soft glow edge. | Untested |
| HyperFrames layers | PNG sequence or VP9 alpha WebM. | Sourced |

### Skill and authoring tools

- No public Blender skill covers headless template filling, alpha delivery
  or motion timing. The engine gets its own small skill.
- RobLe3/cc-blender-skill (5.x, pushed 2026-10-12) is the best reference for
  lighting, render and logo practice. Borrow from it. Do not install it as the
  engine.
- Masters get authored in the Blender GUI. An MCP server helps there. The
  official Blender Lab MCP and blenderwright both run on 5.2. Both execute
  model code without guards, so keep them on localhost and off during
  production renders.
- Production renders never need an MCP. They run the command line path.

Full research notes, with links: [blender-research-2026-11-05.md](blender-research-2026-11-05.md).

## Look library

Taste lives in [config/broadcast-engine/look-library.json](../../config/broadcast-engine/look-library.json).
For each category and LineUps lane it names the geometry tools, material
recipes, HDRIs, CC0 textures, post treatment and render engine that make the
frame read as television. Scripts build materials from these recipes. The
preflight hook checks that a lane's look set is on disk before Blender work.

Lane 4 has its set on disk: two studio HDRIs, brushed metal, a scratch layer
and rubber. Other lanes list what they will need, to download when they go
into build.

Lessons from the Lane 4 tests are recorded in the recipes:

- Curve bevel spikes on sharp logo tips. Bevel after converting to mesh.
- Soft dithered alpha speckles cutout edges. Threshold the alpha.
- A heavy logo tint washes out the logo's whites. Keep real logo colors.
- Glossy panels mirror square lights as white boxes. Use round or soft lights.
- Fill lights inside haze paint a grey cone. Set their volume factor to 0.
- Flat slabs read as panels, not gems. Fracture into many small facets and
  give them an HDRI to reflect.

## Open tests before the lane master locks

1. Premiere alpha on a soft glow edge, premultiplied against straight.
2. EEVEE against Cycles time per frame on one chrome slam at 1920 × 1080.
3. Headless EEVEE from the launch context the pipeline will use.
4. Team hex read back from a proof frame under Standard.

## Gap against the approved Unreal comparison

The approved contract (`config/unreal/comparison-motion-contract.json`) has
team edge lights, beveled logos and one camera push. It reads flat because:

- The camera makes one push and then rests. The look rules need motion in
  every hold.
- Entrances settle. No element slams, so nothing lands on a hit.
- There is no signature material or event world.
- No transition is built from the team marks.
- Stats sit in a table. The player rule asks for one big number per side.

The Blender build keeps the approved contract's layout, framing, timing
authority and readability rules. It adds the slam, the secondary drift, a
material world and team-mark transitions.
