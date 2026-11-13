"""Lineups 4A house parts approved on the Packers trio (2026-11-12): mini stat cards, centered callouts,
the helmet line, the dust entrance and the player swap. Geometry and timing come from lane4_layout;
this module only builds them in Blender."""
import math

import bpy
import numpy as np

from tools.broadcast_engine import lane4_layout as L

ANTONIO = "/Users/singleton23/Library/Fonts/Antonio-SemiBold.ttf"
CARD_DEPTH = -2.4          # cards sit in front of the players (y 1.5) and nameplates (y -1.2)
CALLOUT_DEPTH = -1.8
CARD_X = {"left": -4.87, "right": 5.41}   # over each nameplate, seen from the card depth


def frame(t):
    return int(math.floor(t * 25 + .5)) + 1


def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c) + (1,)


def fcurves(o):
    ad = o.animation_data
    if not ad or not ad.action: return []
    act = ad.action
    if hasattr(act, "fcurves") and len(act.fcurves): return list(act.fcurves)
    out = []  # Blender 5 layered actions
    for layer in getattr(act, "layers", []):
        for strip in layer.strips:
            for bag in strip.channelbags: out += list(bag.fcurves)
    return out


def flat(name, hexc, fading=False):
    """Unlit flat color. With fading, node 'Alpha' carries an animatable opacity."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = lin(hexc)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    if not fading:
        nt.links.new(e.outputs[0], out.inputs["Surface"]); return m
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    a = nt.nodes.new("ShaderNodeValue"); a.name = "Alpha"; a.outputs[0].default_value = 1
    nt.links.new(a.outputs[0], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs["Surface"]); m.surface_render_method = "BLENDED"; return m


def fade(mats, f0, f1, a0, a1):
    for m in mats:
        v = m.node_tree.nodes["Alpha"].outputs[0]
        v.default_value = a0; v.keyframe_insert("default_value", frame=f0)
        v.default_value = a1; v.keyframe_insert("default_value", frame=f1)


def pop(o, f):
    end = tuple(o.scale)
    o.scale = (0.0001,) * 3; o.keyframe_insert("scale", frame=max(1, f - 6))
    o.scale = tuple(v * 1.06 for v in end); o.keyframe_insert("scale", frame=f)
    o.scale = end; o.keyframe_insert("scale", frame=f + 3)


def show(o, f_on=None, f_off=None):
    """hide_render switches on an object and its whole tree (children do not inherit it)."""
    for x in [o] + list(o.children_recursive):
        x.hide_render = f_on is not None; x.keyframe_insert("hide_render", frame=1)
        if f_on is not None:
            x.hide_render = True; x.keyframe_insert("hide_render", frame=max(1, f_on - 1))
            x.hide_render = False; x.keyframe_insert("hide_render", frame=f_on)
        if f_off is not None:
            x.hide_render = False; x.keyframe_insert("hide_render", frame=f_off - 1)
            x.hide_render = True; x.keyframe_insert("hide_render", frame=f_off)


def rounded(o, r):
    b = o.modifiers.new("Round", "BEVEL"); b.affect = "VERTICES"; b.width = r; b.segments = 8; b.limit_method = "NONE"


def plane(name, x0, x1, y0, y1, z, mat):
    me = bpy.data.meshes.new(name); me.from_pydata([(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); o.data.materials.append(mat); return o


def text(body, size, mat):
    cu = bpy.data.curves.new("T", "FONT"); cu.body = body; cu.font = bpy.data.fonts.load(ANTONIO, check_existing=True)
    cu.size = size; cu.align_x = "LEFT"; cu.align_y = "CENTER"; cu.materials.append(mat)
    o = bpy.data.objects.new("Card " + body, cu); bpy.context.scene.collection.objects.link(o); return o


def stat_card(name, rows, x):
    """rows = [(value, unit, cue_seconds)]. A rounded black card whose bottom sits on the nameplate top.
    Returns the card root and its materials (for a later fade)."""
    geo = L.stat_card(len(rows)); C = L.CARD
    root = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(root)
    root.location = (x, CARD_DEPTH, geo["first_row_z"]); root.rotation_euler = (math.radians(90), 0, 0)
    pm, tm, um, dm = (flat(name + s, c, fading=True) for s, c in ((" panel", "#000000"), (" text", "#FFFFFF"), (" unit", "#C9CDD2"), (" divider", "#5A5F66")))
    lines = []
    for i, (val, unit, cue) in enumerate(rows):
        v = text(val, C["value_size"], tm); v.parent = root; v.location = (0, -i * C["row_gap"], .03)
        bpy.context.view_layer.update()
        u = text(unit, C["unit_size"], um); u.parent = root; u.location = (v.dimensions.x + .2, -i * C["row_gap"] - .07, .03)
        lines.append((v, u, cue))
    bpy.context.view_layer.update()
    w = max(v.dimensions.x + .2 + u.dimensions.x for v, u, _ in lines)
    for v, u, _ in lines: v.location.x -= w / 2; u.location.x -= w / 2
    p = plane(name + " panel", -w / 2 - .32, w / 2 + .32, geo["bottom_rel"], geo["top_rel"], 0, pm); p.parent = root; rounded(p, C["radius"])
    for i, y in enumerate(geo["dividers"], start=1):
        d = plane(name + " divider", -w / 2 - .1, w / 2 + .1, y - .012, y + .012, .015, dm); d.parent = root
        pop(d, frame(rows[i][2]))
    pop(root, frame(rows[0][2]))
    for v, u, cue in lines[1:]:
        pop(v, frame(cue)); pop(u, frame(cue))
    return root, [pm, tm, um, dm]


def callouts(objs):
    """Centered callout lines: bigger type on rounded black panels, stacked up from just above the
    nameplates. objs share a slot when they have the same height (one line replaces another on cue)."""
    C = L.CALLOUT; blk = flat("Callout black", "#000000")
    slots = sorted({round(o.location.z, 3) for o in objs}, reverse=True)
    zs = L.callout_z(len(slots))
    for o in objs:
        o.data.size = C["size"]; o.data.align_y = "CENTER"; o.location.z = zs[slots.index(round(o.location.z, 3))]
        bpy.context.view_layer.update(); b = o.bound_box
        p = plane("Callout panel " + o.data.body, min(q[0] for q in b) - .3, max(q[0] for q in b) + .3, -.42, .42, -.02, blk)
        p.parent = o; rounded(p, C["radius"])
        for fc in fcurves(o):  # the panel follows its line's on and off keys
            if fc.data_path == "hide_render":
                for kp in fc.keyframe_points:
                    p.hide_render = bool(round(kp.co.y)); p.keyframe_insert("hide_render", frame=int(kp.co.x))


def alpha_rows(o):
    img = next(n.image for n in o.data.materials[0].node_tree.nodes if n.type == "TEX_IMAGE")
    return np.array(img.pixels[:], dtype=np.float32).reshape(img.size[1], img.size[0], 4)[..., 3].tolist()


def align_helmets(players):
    """Move every player so its helmet top sits on the first player's line."""
    for o, dz in zip(players, L.helmet_shifts([(alpha_rows(o), o.location.z, o.scale.y) for o in players])):
        o.location.z += dz


def dust_entrance(players, starts=(18, 22)):
    """Players build in from team-card dust after the logos land: left from the left, right from the right.
    The crisp cutout fades in under the specks."""
    from tools.broadcast_engine.families import scene3d as k
    k.sc = bpy.context.scene
    for o, f0, wind, seed in zip(players, starts, ((-1.0, 0.0, 0.25), (1.0, 0.0, 0.25)), (7, 11)):
        m = o.data.materials[0]; nt = m.node_tree
        img = next(n.image for n in nt.nodes if n.type == "TEX_IMAGE")
        try:
            k.dust_in(o, img, f0, dur=18, n=6000, wind=wind, seed=seed)
        except KeyError:
            pass  # dust_in's last step expects a logo material; the player fades below
        gt = next(n for n in nt.nodes if n.type == "MATH" and n.operation == "GREATER_THAN")
        mx = next(n for n in nt.nodes if n.type == "MIX_SHADER")
        fv = nt.nodes.new("ShaderNodeValue"); mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
        nt.links.new(gt.outputs[0], mul.inputs[0]); nt.links.new(fv.outputs[0], mul.inputs[1]); nt.links.new(mul.outputs[0], mx.inputs[0])
        for f, v in ((f0 + 12, 0.0), (f0 + 19, 1.0)):
            fv.outputs[0].default_value = v; fv.outputs[0].keyframe_insert("default_value", frame=f)
        m.surface_render_method = "BLENDED"
        for c in o.children:  # the rim waits for the player
            c.hide_render = True; c.keyframe_insert("hide_render", frame=1); c.keyframe_insert("hide_render", frame=f0 + 17)
            c.hide_render = False; c.keyframe_insert("hide_render", frame=f0 + 18)


def player_swap(old, new, old_card, old_card_mats, old_name, new_name, cue_seconds):
    """The old player and card drop out on the cue; the new player whips in from the right with an
    overshoot; the nameplate flips; the caller lands the new card at frames['card']."""
    s = L.swap_frames(frame(cue_seconds)); f = s["out"][0]
    for o in (old, new, old_name, new_name): o.animation_data_clear()
    cz, hx = old.location.z, new.location.x
    show(old, f_off=s["out"][1] + 1)
    for o, drop in ((old, 11), (old_card, 9)):
        z0 = o.location.z; o.keyframe_insert("location", index=2, frame=f)
        o.location.z = z0 - drop; o.keyframe_insert("location", index=2, frame=s["out"][1]); o.location.z = z0
        o.keyframe_insert("location", index=2, frame=1)
    fade(old_card_mats, f, f + 5, 1, 0)
    show(new, f_on=s["in"][0])
    new.location.x = hx + 13; new.keyframe_insert("location", index=0, frame=s["in"][0])
    new.location.x = hx; new.keyframe_insert("location", index=0, frame=s["in"][1])
    for fc in fcurves(old) + fcurves(old_card):
        if fc.data_path == "location":
            for kp in fc.keyframe_points: kp.interpolation = "CUBIC"; kp.easing = "EASE_IN"
    for fc in fcurves(new):
        if fc.data_path == "location":
            for kp in fc.keyframe_points: kp.interpolation = "BACK"; kp.easing = "EASE_OUT"; kp.back = 1.2
    show(old_name, f_off=s["old_name_gone"] + 1); show(new_name, f_on=s["new_name_starts"])
    for o, keys in ((old_name, [(s["old_name_squeeze"], 1), (s["old_name_gone"], .0001)]),
                    (new_name, [(s["new_name_starts"], .0001), (s["new_name_full"], 1)])):
        for fr, v in keys: o.scale = (1, v, 1); o.keyframe_insert("scale", frame=fr)
    bpy.context.scene.render.use_motion_blur = True; bpy.context.scene.render.motion_blur_shutter = 0.6
    return s
