import json, sys

V = "2026-11-05"
MCP = "mcp:blender"
rows = []

def add(**r):
    rows.append(r)

# Runtime pieces
add(id="runtime.blender", kind="runtime", name="Blender 5.2.2 LTS", path="/Applications/Blender.app/Contents/MacOS/Blender",
    status="tested", verified_on=V, evidence="headless EEVEE render and ProRes 4444 alpha test",
    notes="New files default to AgX. EEVEE id is BLENDER_EEVEE.")
add(id="runtime.mcp-server", kind="runtime", name="Blender Lab MCP server 1.0.3",
    path="~/.claude/vendor/blender-mcp-1.0.3/.venv/bin/blender-mcp", status="tested", verified_on=V,
    evidence="stdio client listed 26 tools and ran execute_blender_code against a headless bridge",
    registered_as="claude mcp: blender (user scope)",
    env={"BLENDER_PATH": "/Applications/Blender.app/Contents/MacOS/Blender", "BLENDER_MCP_HOST": "127.0.0.1", "BLENDER_MCP_PORT": "9876"},
    notes="Pinned in PINNED.txt with sha256. Executes model-written Python with no sandbox. Localhost only.")
add(id="runtime.mcp-addon", kind="runtime", name="Blender Lab MCP add-on 1.0.3", path="bl_ext.user_default.mcp",
    status="tested", verified_on=V, evidence="enabled in user prefs; bridge served a call in background mode",
    settings={"host": "localhost", "port": 9876, "use_autostart": True, "system.use_online_access": True},
    notes="GUI: auto-starts on 9876. Headless: Blender -b [file.blend] --command blender_mcp --host 127.0.0.1 --port <n>. --factory-startup disables the add-on, so the bridge needs the user prefs.")

# MCP tools
def tool(name, args, mode, writes, use, status="listed", evidence=None):
    add(id=f"mcp.{name}", kind="mcp_tool", server=MCP, name=name, args=args, mode=mode, writes=writes,
        engine_use=use, status=status, verified_on=V if status == "tested" else None, evidence=evidence)

tool("execute_blender_code", ["code"], "bridge", "scene", "authoring and inspection of lane masters", "tested",
     "returned version, background flag, engine and view transform")
tool("execute_blender_code_for_cli", ["blend_file", "code"], "cli", "none unless code saves",
     "headless reads of a master without a bridge")
for n in ["datablocks", "missing_files", "of_linked_libraries", "path_info", "usage_guess"]:
    tool(f"get_blendfile_summary_{n}", [], "bridge", "none", "master audit")
    tool(f"get_blendfile_summary_{n}_for_cli", ["blend_file"], "cli", "none", "master audit in CI and hooks")
tool("get_objects_summary", [], "bridge", "none", "slot inventory")
tool("get_object_detail_summary", ["name"], "bridge", "none", "slot inspection")
tool("get_python_api_docs", ["identifier"], "offline", "none", "bpy lookup")
tool("search_api_docs", ["query", "max_results", "context", "index"], "offline", "none", "bpy lookup")
tool("search_manual_docs", ["query", "max_results", "context", "index"], "offline", "none", "manual lookup")
tool("get_screenshot_of_area_as_image", ["area_ui_type", "size_limit_in_bytes"], "gui", "none", "authoring look checks")
tool("get_screenshot_of_window_as_image", ["size_limit_in_bytes"], "gui", "none", "authoring look checks")
tool("get_screenshot_of_window_as_json", [], "gui", "none", "UI state read")
tool("jump_to_tab_by_name", ["name"], "gui", "ui", "authoring navigation")
tool("jump_to_tab_by_space_type", ["space_type", "allow_edits"], "gui", "ui", "authoring navigation")
tool("jump_to_view3d_object_by_name", ["name", "allow_edits"], "gui", "ui", "authoring navigation")
tool("jump_to_view3d_object_data_by_name", ["name", "allow_edits"], "gui", "ui", "authoring navigation")
tool("render_viewport_to_path", ["output_path"], "bridge", "file in MCP scratch dir", "quick look renders; read result.filepath")
tool("render_thumbnail_to_path", ["output_path"], "bridge", "file in MCP scratch dir", "quick look renders")

# Command line path
add(id="cli.render-row", kind="command", status="planned",
    command="Blender -b <master.blend> -y --python-exit-code 1 -P tools/broadcast_engine/fill.py -- <row.json>",
    calls=["script.fill"], called_by=["script.batch"],
    notes="Production render path. Never routed through MCP. -y enables drivers. Exit code fails the job on any Python error.")

# Engine scripts to build
def script(sid, path, purpose, calls=(), called_by=(), test=None, runs_in="python"):
    add(id=f"script.{sid}", kind="script", path=path, status="planned", runs_in=runs_in, purpose=purpose,
        calls=list(calls), called_by=list(called_by), test=test)

script("fill", "tools/broadcast_engine/fill.py", "Read a scene row, fill named slots, set Standard view, set output, render",
       calls=["script.color", "script.slots", "script.lookdev-apply"], called_by=["cli.render-row"], test="row fixture renders a proof frame with every slot filled", runs_in="blender")
script("slots", "tools/broadcast_engine/slots.py", "Slot contract: names, types and validation for each lane master",
       called_by=["script.fill", "hook.engine-preflight"], test="unknown or missing slot fails before render", runs_in="blender+python")
script("color", "tools/broadcast_engine/color.py", "sRGB hex to linear, and back for readback",
       called_by=["script.fill", "script.color-readback"], test="round trip within tolerance for registered team colors")
script("svg-logo", "tools/broadcast_engine/svg_logo.py", "SVG to extruded, beveled mesh with Weighted Normal",
       called_by=["script.fill"], test="mesh has bevel faces and front face matches SVG silhouette", runs_in="blender")
script("color-readback", "tools/broadcast_engine/checks/color_readback.py", "Sample flat brand faces in a proof frame against registered hex",
       calls=["script.color"], test="fails when the view transform is AgX")
script("alpha-probe", "tools/broadcast_engine/checks/alpha_probe.py", "ffprobe codec, profile and pix_fmt, then measure the alpha plane",
       test="ProRes 4444 passes; ProRes 422 fails")
script("slam-timing", "tools/broadcast_engine/checks/slam_timing.py", "Read scale per frame and check entry 3 to 6 frames, start scale at least 1.8x, landing on a cue",
       calls=["reuse.cue-contract"], test="a 10-frame entry fails")
script("drift-check", "tools/broadcast_engine/checks/drift_check.py", "Check that camera or element moves on every hold frame",
       test="a locked hold fails")
script("lookdev-fetch", "tools/broadcast_engine/lookdev_fetch.py", "Download a lane's planned CC0 assets from Poly Haven or ambientCG, keep image maps only, update SHA256SUMS and the registry status",
       called_by=["hook.engine-preflight"], test="a planned asset becomes downloaded with a checksum; a .blend in the zip is never extracted")
script("lookdev-apply", "tools/broadcast_engine/lookdev_apply.py", "Build materials, world HDRI and compositor post from the look library recipes",
       called_by=["script.fill"], test="a lane master's materials reference only registered maps; Standard view; HDRI present")
script("batch", "tools/broadcast_engine/batch.py", "Plainly-style runner: many rows, one Blender process per lane, receipts out",
       calls=["cli.render-row", "script.alpha-probe"], test="two rows produce two verified renders and receipts")

# Hooks and registries
add(id="hook.engine-preflight", kind="hook", path=".codex/hooks/ (to add)", status="planned", event="PreToolUse",
    purpose="Before Blender work, require the ledger, registry entry, slot contract and the lane's look set to be on disk",
    calls=["script.slots", "script.lookdev-fetch"],
    reads=["config/broadcast-engine/tool-ledger.jsonl", "config/lineups/template-registry.json", "config/broadcast-engine/look-library.json"])
add(id="registry.look-library", kind="registry", path="config/broadcast-engine/look-library.json", status="existing",
    notes="Per category and lane: geometry tools, material recipes, HDRIs, CC0 textures, post and engine choice. 5 assets downloaded for Lane 4, 8 planned.")
add(id="registry.engine-routing", kind="registry", path="config/lineups/engine-routing.json", status="existing",
    notes="Engines today: figma, unreal. Blender joins as a third engine per lane once a master is approved.")
add(id="registry.templates", kind="registry", path="config/lineups/template-registry.json", status="existing",
    notes="Blender masters get stable keys here next to Figma sources.")

# Reuse from LineUps
for rid, path, why in [
    ("cue-contract", "tools/lineups_motion/cue_contract.py", "Cue times that slams and exits must land on"),
    ("timing-evidence", "tools/lineups_motion/timing_evidence.py", "Word timestamp evidence"),
    ("media-evidence", "tools/lineups_motion/media_evidence.py", "Render readback and hashing"),
    ("premiere-delivery", "tools/lineups_motion/premiere_delivery.py", "Delivery into Premiere"),
    ("lineups-hook", ".codex/hooks/lineups_enforcement.py", "Pattern for the engine preflight hook"),
    ("unreal-contract", "config/unreal/comparison-motion-contract.json", "Approved Lane 4 layout, framing and timing rules to keep"),
]:
    add(id=f"reuse.{rid}", kind="reuse", path=path, status="existing", purpose=why)

# Skills
add(id="skill.engine", kind="skill", name="broadcast-engine (to write)", status="planned",
    purpose="Slot contract, fill.py, render flags, checks, and precedence over pack rules")
for s, use in [("blender-lighting", "rig reference"), ("blender-materials", "finish recipes"), ("blender-cameras", "push and depth of field"),
               ("blender-rendering", "engine choice; its AgX rule is overridden"), ("reference-look-calibration", "proof-frame look checks"),
               ("animation-quality-gate", "contact-sheet motion checks"), ("orbital-hud-motion", "rings behind marks")]:
    add(id=f"skill.pack.{s}", kind="skill", name=s, status="installed", source="RobLe3/cc-blender-skill@a2634b5",
        uses_tools=["mcp.execute_blender_code", "mcp.get_objects_summary", "mcp.render_viewport_to_path", "mcp.search_api_docs"],
        engine_use=use)

with open(sys.argv[1], "w") as f:
    for r in rows:
        f.write(json.dumps({k: v for k, v in r.items() if v not in (None, [], ())}, ensure_ascii=False) + "\n")
print(len(rows))
