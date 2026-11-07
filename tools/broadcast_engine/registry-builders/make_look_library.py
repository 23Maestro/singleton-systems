import json, sys

ROOT = "/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/lookdev"
D = "2026-11-05"

def ph_hdri(i, use, status="planned"):
    return {"id": f"hdri.{i}", "kind": "hdri", "source": "polyhaven", "sourceId": i, "license": "CC0",
            "url": f"https://polyhaven.com/a/{i}", "resolution": "2k", "status": status,
            "path": f"{ROOT}/polyhaven/{i}/{i}_2k.hdr" if status == "downloaded" else None, "use": use}

def acg(i, use, maps, status="planned"):
    return {"id": f"tex.{i}", "kind": "pbr-texture", "source": "ambientcg", "sourceId": i, "license": "CC0",
            "url": f"https://ambientcg.com/view?id={i}", "resolution": "2K-JPG", "status": status,
            "path": f"{ROOT}/ambientcg/{i}" if status == "downloaded" else None,
            "maps": maps, "use": use}

def phtex(i, use):
    return {"id": f"tex.{i}", "kind": "pbr-texture", "source": "polyhaven", "sourceId": i, "license": "CC0",
            "url": f"https://polyhaven.com/a/{i}", "resolution": "2k", "status": "planned", "path": None, "use": use}

MAPS = ["Color", "Roughness", "NormalGL", "Displacement"]
assets = [
    ph_hdri("studio_small_03", "High-contrast studio. Crisp reflection lines on chrome, bevels and gem facets.", "downloaded"),
    ph_hdri("studio_small_09", "Softer studio. Alternate when studio_small_03 is too harsh.", "downloaded"),
    ph_hdri("stadium_01", "Night stadium reflections for event worlds and live-graphic sets."),
    ph_hdri("orlando_stadium", "Second stadium option for event worlds."),
    acg("Metal009", "Brushed metal grain for etched team shards (roughness and normal only; color comes from the team).", MAPS + ["Metalness"], "downloaded"),
    acg("Metal038", "Scratch layer mixed over shard roughness so facets catch light unevenly.", MAPS + ["Metalness"], "downloaded"),
    acg("Rubber004", "Rubber micro-grain for the chevron tread column.", MAPS, "downloaded"),
    acg("Fingerprints009", "Smudges on glass stat panels so glass reads as real glass.", ["Roughness"]),
    acg("Ice003", "Ice world for hockey or winter event packages.", MAPS),
    acg("DiamondPlate008A", "Industrial plate for garage or motorsport looks.", MAPS + ["Metalness"]),
    phtex("brown_leather", "Football leather for a 3D ball prop."),
    phtex("concrete_floor_02", "Studio and tunnel floors for show opens."),
    phtex("sparse_grass", "Field surface for turf floors and field plates."),
]

components = {
    "geometry": {
        "svgBevelLogo": {"what": "Team mark as a real 3D object", "blender": "SVG import, extrude, convert to mesh, Bevel modifier with clamp overlap and harden normals, Weighted Normal", "builtIn": True,
                         "lesson": "Never use curve bevel on logos; it spikes on sharp tips (Chiefs arrowhead)."},
        "facetedShards": {"what": "Gem or crystal shard wall", "blender": "Geometry Nodes Voronoi fracture of a plane into many small facets, per-facet random tilt and depth, Bevel on edges", "builtIn": True,
                          "alternative": "Cell Fracture extension (needs install from extensions.blender.org)"},
        "chevronTread": {"what": "Center spine of stacked shallow V bands", "blender": "Generated V-band mesh, Solidify, rounded Bevel", "builtIn": True,
                         "measuredFromReference": {"widthShareOfFrame": 0.15, "vAngleDeg": 14, "bandToPitch": 0.74}},
        "cutoutCard": {"what": "Player cutout in the set", "blender": "Image plane with hard alpha threshold at 0.5", "builtIn": True,
                       "lesson": "Soft dithered alpha speckles edges at 1080p; threshold the alpha."},
        "slab": {"what": "Nameplates, tables, plates", "blender": "Polygon from points, Solidify, Bevel", "builtIn": True},
    },
    "materials": {
        "teamBrushedMetal": {"base": "team color at 0.35 to 0.95 value", "maps": ["tex.Metal009:Roughness", "tex.Metal009:NormalGL", "tex.Metal038:Roughness (mix)"], "metallic": 0.75, "anisotropic": 0.7},
        "chevronRubber": {"base": "#08090b", "maps": ["tex.Rubber004:NormalGL", "tex.Rubber004:Roughness"], "roughness": 0.5},
        "chromeType": {"base": "#ffffff", "metallic": 1.0, "roughness": 0.15, "needs": "hdri.studio_small_03"},
        "glossyPlate": {"base": "team color", "coat": 1.0, "roughness": 0.2},
        "satin": {"roughness": 0.45, "coat": 0.0},
        "darkGlassPanel": {"base": "#0b0c0f", "coat": 0.6, "maps": ["tex.Fingerprints009:Roughness"],
                           "lesson": "Glossy panels mirror square area lights as white boxes; use round or soft lights near them."},
        "logoTeamColors": {"rule": "Keep the real logo colors; tint at most 0.35 toward a dark team tone. Let the rim light add the sheen.",
                           "lesson": "A 0.9 tint washed the Chiefs white into pink and maroon."},
    },
    "environment": {
        "worldHdri": {"default": "hdri.studio_small_03", "useFor": "reflections and soft fill; hide from camera with Film Transparent or a dark world strength for the backdrop"},
        "haze": {"density": 0.0022, "lesson": "Fill and top lights must have volume_factor 0, or they paint a grey cone over the set."},
    },
    "post": {
        "bloom": {"blender": "Compositor Glare node, Bloom or Fog Glow", "builtIn": True, "renderAsSeparateLayer": True},
        "flash": {"blender": "Compositor Glare Streaks or Sun Beams", "builtIn": True},
        "chromaticAberration": {"blender": "Compositor Lens Distortion with dispersion, transitions only", "builtIn": True},
        "zoomBlur": {"blender": "Compositor Directional Blur with zoom", "builtIn": True},
        "grain": {"where": "final comp only"},
        "colorView": {"view": "Standard", "adr": "docs/broadcast-engine/adr/0003-standard-view-for-team-colors.md"},
    },
    "engines": {
        "eevee": {"for": "players, type, logos, motion, most sets", "limits": "screen-space reflections only"},
        "cycles": {"for": "gem facets, glass, ice, chrome that reflects chrome", "costVsEevee": "about 3 to 10 times per frame",
                   "pattern": "render the background plate once per team pair in Cycles; everything else in EEVEE"},
        "measured": {"date": "2026-11-05", "frame": "Lane 4 upgrade v5, 1920x1080, M4 24 GB",
                     "eevee64": "8 s per frame", "cycles128Denoised": "216 s per frame",
                     "decision": "EEVEE for production. Tuned EEVEE (haze 0.001, bloom threshold 2.0, darker facets, roughness 0.08 to 0.3) matched the Cycles contrast."},
    },
}

categories = {
    "1-network-league-ids": {"components": ["geometry.svgBevelLogo", "materials.chromeType", "materials.glossyPlate", "materials.satin", "environment.worldHdri", "post.bloom", "post.flash"],
                             "assets": ["hdri.studio_small_03", "hdri.studio_small_09", "tex.Metal009", "tex.DiamondPlate008A"]},
    "2-event-worlds": {"components": ["geometry.facetedShards", "environment.worldHdri", "environment.haze", "engines.cycles"],
                       "assets": ["hdri.stadium_01", "hdri.orlando_stadium", "tex.Ice003", "tex.sparse_grass"]},
    "3-player-elements": {"components": ["geometry.cutoutCard", "geometry.slab", "materials.teamBrushedMetal", "post.bloom"],
                          "assets": ["hdri.studio_small_03", "tex.Metal009", "tex.Metal038", "tex.brown_leather"]},
    "4-live-graphics": {"components": ["geometry.slab", "materials.darkGlassPanel", "environment.worldHdri"],
                        "assets": ["hdri.studio_small_09", "tex.Fingerprints009"]},
    "5-studio-show-opens": {"components": ["geometry.svgBevelLogo", "environment.haze", "post.zoomBlur"],
                            "assets": ["hdri.stadium_01", "tex.concrete_floor_02"]},
    "6-brand-transitions": {"components": ["geometry.svgBevelLogo", "post.flash", "post.chromaticAberration", "post.zoomBlur"],
                            "assets": ["hdri.studio_small_03"]},
    "7-live-action-beats": {"components": [], "assets": [], "note": "Edit decision in Premiere; no 3D look needed."},
    "8-structure": {"components": [], "assets": [], "note": "Reel and package shape; no 3D look needed."},
}

lanes = {
    "1-quick-action-photo": {"categories": ["3-player-elements", "6-brand-transitions"], "assetsToAdd": []},
    "2-quick-stat": {"categories": ["3-player-elements", "4-live-graphics"], "assetsToAdd": ["tex.brown_leather"]},
    "3-stat-breakdown": {"categories": ["4-live-graphics"], "assetsToAdd": ["tex.Fingerprints009"]},
    "4-comparison": {"categories": ["3-player-elements", "4-live-graphics", "6-brand-transitions"],
                     "assetsToAdd": [], "status": "in-build",
                     "lookdevSet": ["hdri.studio_small_03", "hdri.studio_small_09", "tex.Metal009", "tex.Metal038", "tex.Rubber004"],
                     "reference": "/Volumes/HomeSSD/Generated/CATENA_MEDIA_LINEUPS/previews/2026-10-18-mahomes-allen-stats-concept-v2.png"},
    "5-year-by-year": {"categories": ["4-live-graphics"], "assetsToAdd": ["hdri.stadium_01", "tex.sparse_grass"]},
    "6-asset-swap": {"categories": ["1-network-league-ids", "6-brand-transitions"], "assetsToAdd": ["tex.DiamondPlate008A"]},
    "7-recurring-board": {"categories": ["1-network-league-ids", "4-live-graphics"], "assetsToAdd": ["hdri.stadium_01", "tex.concrete_floor_02", "tex.Fingerprints009"]},
}

lib = {
    "schemaVersion": 1, "updated": D,
    "purpose": "The parts that make a broadcast frame look right, per technique category and LineUps lane. Scripts and hooks read this before any Blender build.",
    "sourcePolicy": {"licenses": ["CC0"], "sources": ["polyhaven", "ambientcg"],
                     "extract": "image maps and HDRIs only; never open a downloaded .blend",
                     "defaultResolution": "2K", "root": ROOT, "checksums": f"{ROOT}/SHA256SUMS",
                     "downloadRule": "download when a lane goes into build; plan the rest here"},
    "assets": assets, "components": components, "categories": categories, "lanes": lanes,
    "spec": "docs/broadcast-engine/reference-technique-spec.md",
}
json.dump(lib, open(sys.argv[1], "w"), indent=2); open(sys.argv[1], "a").write("\n")

ids = {a["id"] for a in assets}
for name, c in categories.items():
    for a in c["assets"]: assert a in ids, (name, a)
for name, l in lanes.items():
    for a in l["assetsToAdd"] + l.get("lookdevSet", []): assert a in ids, (name, a)
    for c in l["categories"]: assert c in categories, (name, c)
for c in categories.values():
    for comp in c["components"]:
        g, k = comp.split("."); assert k in components[g], comp
import os
for a in assets:
    if a["status"] == "downloaded": assert a["path"] and os.path.exists(a["path"]), a["id"]
print("ok", len(assets), "assets,", sum(a["status"] == "downloaded" for a in assets), "downloaded")
