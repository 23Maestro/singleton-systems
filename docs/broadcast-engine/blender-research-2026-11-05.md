# Blender broadcast graphics engine: research

Checked 2026-11-05. Target is Blender 5.2.2 LTS on an Apple M4 with 24 GB. Star counts and push dates come from the GitHub API on that date. "Unverified" means I found no primary source.

## Skills

| Repo | Stars | Last push | Blender | Execution path | Fit |
|---|---|---|---|---|---|
| [RobLe3/cc-blender-skill](https://github.com/RobLe3/cc-blender-skill) | 144 | 2026-10-12 | 5.x, validated on 5.1.1 | MCP (`execute_blender_code`) through Blender Lab MCP or ahujasid | Best maintained |
| [arjun988/blender-skills](https://github.com/arjun988/blender-skills) | 1,930 | 2026-07-10 | Not stated | ahujasid MCP, GUI running | Game assets, stalled |
| [ra100/blender-claude-plugin](https://github.com/ra100/blender-claude-plugin) | 25 | 2026-04-29 | 5.0/5.1 | MCP optional, falls back to runnable bpy scripts | Closest to headless |
| [Impertio-Studio/...Claude-Skill-Package](https://github.com/impertio-studio/blender-bonsai-ifcopenshell-sverchok-claude-skill-package) | 44 | 2026-07-08 | Not checked | MCP | AEC/BIM, off-target |

- RobLe3/cc-blender-skill has 30 chain-loadable skills: modeling, materials, lighting, cameras, rendering, animation and export. It also covers a mascot/logo reconstruction workflow, HUD motion and a "Cycles vs EEVEE decision tree". The README says it was exercised on Blender 5.1.1 through both MCP backends. It does not document `blender -b` batch rendering.
- arjun988/blender-skills has 94 skills. A `blender-director` router sends work to lighting, compositing, geometry-nodes, rendering and others. Every skill runs through the ahujasid add-on, with "Blender (running)" in the diagram. The content targets game assets and engine export. It saw 15 commits between 5 and 10 July 2026 and nothing since.
- ra100/blender-claude-plugin has 8 skills: geometry nodes, shader nodes, compositing nodes, Python scripting, animation, modifiers, physics and scene rendering. When no MCP is present it writes plain bpy scripts. That is the closest match to a `fill.py` pipeline, but the project is small and was last pushed in April.
- Not verified: a Reddit post about "20 Blender 5.2 agent skills" ([r/claudeskills](https://www.reddit.com/r/claudeskills/comments/1x6w47i/i_made_20_blender_52_agent_skills_so_ai_can/)), which is game-asset focused and whose repo I did not open. Also not verified: the "Blender Toolkit" listing on [mcpmarket.com](https://mcpmarket.com/tools/skills/blender-toolkit), which claims 4.0+.

Best current skill: RobLe3/cc-blender-skill. It targets 5.x, was pushed in the last month, and has published validation runs. Its lighting, rendering and logo references are the nearest to this job. It still assumes a live MCP session and covers no broadcast or alpha-output practice, so it is a reference to borrow from. None of these skills covers headless template filling, alpha delivery to Premiere, or motion-graphics timing.

## MCP servers

| Server | Stars | Last push | Blender | GUI or headless |
|---|---|---|---|---|
| [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) (was `blender-mcp`) | 33,414 | 2026-11-04 | 3.0+ | GUI. The add-on opens a socket on 9876 |
| [Blender Lab MCP](https://www.blender.org/lab/mcp-server/) (official) | n/a | add-on v1.0.3, page dated 2026-03 | 5.1+ | GUI session plus add-on |
| [HoldMyBeer-gg/blenderwright](https://github.com/HoldMyBeer-gg/blenderwright) | 187 | 2026-11-05 | 5.2 LTS only | GUI. The add-on is started from the N-panel |
| [dcc-mcp/dcc-mcp-blender](https://github.com/dcc-mcp/dcc-mcp-blender) | 60 | 2026-11-05 | Python 3.10+ | HTTP server inside Blender. A pip route "for scripts / CI" exists, but `-b` use is unverified |
| [sandraschi/blender-mcp](https://github.com/sandraschi/blender-mcp) | 65 | 2026-10-29 | 3.0+ | Headless by default: spawns `blender --background`. A live bridge is optional |
| [djeada/blender-mcp-server](https://github.com/djeada/blender-mcp-server) | 33 | v0.2.0, 2026-09-23 | Not stated | Add-on over TCP. Its test harness runs under `blender -b --factory-startup` |

- ahujasid is the default most skills assume. It exposes `execute_blender_code`, `look`, `get_scene_info`, `generate_3d` and asset search. The README warns that the socket "has no authentication or encryption". It offers a safe mode (`BLENDER_MCP_SAFE_MODE=1`) and records minimal anonymous telemetry unless `DISABLE_TELEMETRY=true` is set. An open issue asks what it sends to an outside server ([#360](https://github.com/ahujasid/mcp-for-blender/issues)).
- Blender Lab MCP is the Foundation's own experiment. The page warns that it "will execute LLM generated code in Blender without any guards" and recommends running it in a VM. I could not read the source on projects.blender.org (HTTP 403), so its tool list is unverified.
- blenderwright has the richest render surface. It ships 276 tools, including compositor tools for glare/bloom, film grain, chromatic aberration and lens distortion, plus motion blur, render passes and color management settings. It only installs on 5.2 LTS, which matches this machine.

## Render and look practice

### Engine choice

- EEVEE is GPU-only rasterization: "There is no plan to support CPU (software) rendering" ([manual, limitations](https://docs.blender.org/manual/en/latest/render/eevee/limitations/limitations.html)). It is fast enough for many cue-driven variants on an M4.
- EEVEE reflection limits matter for chrome and glass. Ray-triangle intersection is not supported. Screen-space effects "disappear when reaching the screen border", use only the front-most depth, and ignore blended surfaces (same page). Chrome that should reflect off-screen objects needs sphere light probes or a world HDRI.
- Cycles with Metal is supported on Apple Silicon, with GPU ray tracing and denoising ([manual, GPU rendering](https://docs.blender.org/manual/en/latest/render/cycles/gpu_rendering.html)). Use it for hero glass, ice and true chrome interreflection.
- Default: EEVEE for lane masters, with per-shot Cycles as the escape hatch. Benchmark both on one slam before locking. This is a judgment call; I found no pro source comparing the two for broadcast packages.

### Lighting

- In EEVEE, lights "can only have one color and do not support light node trees", and spot-light Size does not soften the cone (limitations page). Build team rim lights as separate area lights, one color each, and set color from JSON.
- Chrome shows only what it reflects. Area lights textured with HDR images give "high-quality reflections" on glossy surfaces ([Lightmap HDR Light Studio](https://www.lightmap.co.uk/blog/blender-hdr-area-lights-blender/)). A common rig is one small, hard area key plus large soft cards or a studio HDRI for reflection detail.
- To keep the near-black look on an alpha output, hide the world from camera and use Film > Transparent. Not verified against a pro tutorial: my searches for Blender Guru, Ducky 3D and Polyfjord chrome-logo tutorials returned no matching sources.

### Materials

- Chrome: Principled BSDF, Metallic 1, low roughness. Satin and brushed metal: raise roughness and add anisotropy. Treat these as standard practice; whether EEVEE's anisotropy matches Cycles in 5.2 is unverified.
- Glass for compositing: Cycles Film has a "Transparent Glass" option that renders transmissive surfaces as transparent ([manual, Cycles film](https://docs.blender.org/manual/en/latest/render/cycles/render_settings/film.html)).
- EEVEE "Blended" materials break post-process depth of field. Set DOF Max Size to 0 to use the sample-based method (limitations page).

### Logo geometry

- SVG import creates curve objects. The legacy importer handled solid colors only, not gradients ([archive issue #79875](https://projects.blender.org/blender/blender-addons/issues/79875)). Extrude and bevel the curves, convert to mesh, then add a Bevel modifier and a Weighted Normal modifier.
- Weighted Normal options: Face Area mode, Keep Sharp, and Face Influence. Face Influence reads the face strength set by the Bevel modifier's "Set Strength" ([manual](https://docs.blender.org/manual/en/latest/modeling/modifiers/normals/weighted_normal.html)). This is what keeps large flat logo faces clean beside chamfers.
- Text objects are curve-based font geometry ([manual, texts](https://docs.blender.org/manual/en/latest/modeling/texts/introduction.html)). For data-driven strings, set `obj.data.body` from JSON, or use Geometry Nodes "String to Curves". The latter node is named from memory; I did not re-check its manual page.

### Data-driven slots

- Pattern: `blender -b master.blend -P fill.py -- row.json`. Arguments after `--` are ignored by Blender and read from `sys.argv` ([manual, CLI arguments](https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html)).
- What fill.py sets:
  - text bodies
  - image datablocks for player cutouts and logos
  - material and light colors
  - Geometry Nodes modifier inputs (`mod["Socket_N"]`)
  - custom properties that drivers read
- Order: arguments run in order, so "Always position `-f` or `-a` as the last arguments" ([manual, CLI render](https://docs.blender.org/manual/en/latest/advanced/command_line/render.html)). If fill.py renders by itself, call `bpy.ops.render.render(animation=True)` inside it.
- Failures: use `--python-exit-code 1` so a Python exception fails the job (arguments page).

### Camera and motion

- EEVEE motion blur combines accumulation steps with a post-process blur. "Each step corresponds to a full scene re-evaluation", so more steps cost render time ([manual, EEVEE motion blur](https://docs.blender.org/manual/en/latest/render/eevee/render_settings/motion_blur.html)). Logo slams that settle in 3-6 frames move far per frame and need more steps. Shutter curves have been supported since 4.2 ([4.2 EEVEE notes](https://developer.blender.org/docs/release_notes/4.2/eevee/)).
- Depth of field was rewritten in 4.2 and is always high quality (same notes).
- Radial zoom blur: the compositor's Directional Blur node has a zoom control. That is from memory and unverified for 5.2.

### Post and compositing

- Bloom moved: EEVEE Legacy's bloom toggle is gone since 4.2. Rebuild it with the compositor Glare node set to Bloom ([B3D Interplanety](https://b3d.interplanety.org/en/enabling-the-bloom-effect-in-blender-4-2/); [devtalk feedback](https://devtalk.blender.org/t/blender-4-2-eevee-next-feedback/31813?page=52)). I did not find the exact sentence in the 4.2 release notes.
- Glare types: Bloom, Fog Glow (more accurate, slower), Streaks, Ghosts, Simple Star, Sun Beams and a custom Kernel. Controls are Threshold, Smoothness, Clamp, Strength, Saturation, Tint and Size. The node outputs the glare layer by itself ([manual, Glare](https://docs.blender.org/manual/en/latest/compositing/types/filter/glare.html)). Use Streaks or Sun Beams for light-burst flashes.
- Glow on alpha is a trap. Glow added over a transparent background can carry color where alpha is near 0, and edits then clip or darken it. This is reasoning, not tested. Export the Glare output as its own additive layer for HyperFrames or Premiere, or add glow in the final comp.
- Grain: add film grain once in the final comp, not on each alpha layer. This is a design choice, not a sourced rule.

### Color management

- Views ([manual, displays and views](https://docs.blender.org/manual/en/latest/render/color_management/displays_views.html)):
  - Standard "does no extra conversion besides the conversion for the display". Use it for graphics.
  - Khronos PBR Neutral is built so output sRGB matches input base color "as faithfully as possible" under grayscale light.
  - AgX "desaturates highly exposed colors", and it has been the default in new files since 4.0 ([4.0 notes](https://developer.blender.org/docs/release_notes/4.0/color_management/)).
  - Filmic is deprecated.
- Brand colors: use Standard with Look None and Exposure 0 for flat brand plates and emission elements. Khronos PBR Neutral is the alternative for lit 3D logos where team colors must read true. Avoid AgX for team colors.
- Hex vs linear: Blender's hex field is display-referred (sRGB), while bpy color sockets take linear values. fill.py must convert team hex to linear before assignment. This is well known but I did not cite it from the manual here.

### Output

- Manual conflict on ProRes alpha. The [video formats table](https://docs.blender.org/manual/en/latest/files/media/video_formats.html) marks ProRes alpha ✗ and 8/10-bit. The [output properties page](https://docs.blender.org/manual/en/latest/render/output/properties/output.html) says "ProRes 4444: Supports full-resolution RGB and alpha channels." Tested 2026-11-05 on Blender 5.2.2: ProRes 4444 output carries alpha (`yuva444p12le`). See the technique spec.
- Codecs the manual marks alpha-capable: PNG, QuickTime Animation, FFmpeg video codec #1 and WebM/VP9.
- Safe master: a 16-bit RGBA PNG or EXR image sequence from Blender. Transcode with ffmpeg `prores_ks -profile:v 4444 -pix_fmt yuva444p10le` for Premiere. Hand HyperFrames the PNG sequence or a VP9 alpha WebM.

## macOS pitfalls

1. EEVEE in `-b` needs a GPU context. The manual lists headless rendering as unsupported only on "headless Windows systems" (limitations page), so a logged-in Mac should work. From SSH, launchd or a locked session with no WindowServer, it is unverified and likely to fail. Test from the same launch context the pipeline will use.
2. Cycles may fall back to CPU. Pass `-- --cycles-device METAL` (arguments page), or set `preferences.addons['cycles'].preferences.compute_device_type = 'METAL'` and `scene.cycles.device = 'GPU'` in fill.py. `--factory-startup` skips the user startup file, so do not rely on saved device prefs. That last point is unverified.
3. Python drivers are off by default in `-b`. The manual says `-Y`, which disables "Python-drivers & startup scripts", is the default. Expression drivers on slot properties then stay silent. Pass `-y`, or use simple non-scripted drivers and set values directly in fill.py.
4. Fonts. Text objects point to font files. Pack fonts into the master (`bpy.ops.file.pack_all()`) or use absolute paths. Unverified: a missing font may fall back to the built-in font without an error. Assert `obj.data.font.filepath` in fill.py.
5. Unified memory. On Metal, "if the GPU memory is full Blender will automatically try to use system memory" (GPU rendering page). That is slower but does not crash. 24 GB is shared with Premiere, so keep heavy renders off while Premiere is open.
6. First-frame shader compile. EEVEE and Metal compile shaders on first use, so the first frame of a fresh process is slow. Shader compilation became multithreaded in 4.2 (4.2 notes). Batch many rows per process when possible. The timing itself is unverified.
7. Alpha premultiplication into Premiere. Nothing in a ProRes 4444 file header says straight or premultiplied ([QLab thread](https://groups.google.com/g/qlab/c/ppjGbNZ-fqc)). Premiere sets it per clip in Modify > Interpret Footage. A mismatch causes dark or harsh edges and glows ([Adobe thread](https://community.adobe.com/questions-729/straight-vs-premultiplied-alpha-on-import-1383696)). Blender renders premultiplied internally; whether PNG saves straight and EXR premultiplied in 5.2 is unverified. Fix one convention per lane and test with a soft-edged glow frame.
8. ProRes 422 drops alpha entirely ([Adobe thread](https://community.adobe.com/questions-729/problem-with-apple-prores-4444-with-alpha-channel-1383630)). Never use 422 for overlay layers.

## Recommendation

1. Render path without MCP. `/Applications/Blender.app/Contents/MacOS/Blender -b master.blend -y --python-exit-code 1 -P fill.py -- row.json`. This is deterministic, scriptable and needs no socket.
2. MCP for authoring only. Use the official Blender Lab MCP (5.1+, Foundation-maintained) or ahujasid to build lane masters in the GUI. Consider blenderwright if compositor and render-setting tools matter during authoring, since it is 5.2-only and active. Keep any MCP socket on localhost.
3. Write your own skill. Write one small Claude Code skill for this pipeline: slot naming contract, fill.py, render flags, output checks. Borrow lighting and render references from RobLe3/cc-blender-skill. Do not install a 94-skill game pack.
4. Lane defaults to start from:
   - EEVEE with sphere probes
   - Standard view, sRGB display, team hex converted to linear
   - Film Transparent
   - Glare (Bloom/Streaks) exported as a separate layer
   - accumulation motion blur with enough steps for 3-6 frame slams
   - 16-bit RGBA PNG sequence, ffmpeg to ProRes 4444 for Premiere
5. Tests to run before locking:
   - Does Blender's own ProRes 4444 write alpha?
   - Does EEVEE `-b` work from the launch context the pipeline will use?
   - Does Premiere's alpha interpretation hold on a glow edge?
   - EEVEE vs Cycles time per frame on one chrome slam.
