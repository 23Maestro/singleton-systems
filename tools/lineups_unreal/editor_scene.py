"""Native editable UMG scene construction, executed inside the trial editor."""

import hashlib
import json
import re
from pathlib import Path

import unreal
from editor_toolset.toolsets.object import ObjectTools

OWNER = "lineups-two-up-trial-v1"


def read(instance, keys):
    schema = json.loads(ObjectTools.list_properties(instance))
    if not set(keys).issubset(schema):
        raise ValueError("Unreal property schema changed: " + ", ".join(set(keys) - set(schema)))
    return json.loads(ObjectTools.get_properties(instance, keys))


def set_values(instance, values):
    current = read(instance, list(values))

    def merge(before, after):
        if isinstance(before, dict) and isinstance(after, dict):
            return {**before, **{key: merge(before.get(key), value) for key, value in after.items()}}
        return after

    if not ObjectTools.set_properties(instance, json.dumps(merge(current, values))):
        raise ValueError("Unreal rejected an editable widget property.")


def import_texture(key, record, folder):
    source = Path(record["path"])
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if digest != record["sha256"]:
        raise ValueError("Source artwork changed: " + key)
    name = "T_" + key + "_" + digest[:12]
    path = folder + "/Assets/" + name
    if not unreal.EditorAssetLibrary.does_asset_exist(path):
        task = unreal.AssetImportTask()
        task.filename = str(source)
        task.destination_path = folder + "/Assets"
        task.destination_name = name
        task.automated = True
        task.save = True
        task.replace_existing = False
        unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    texture = unreal.load_asset(path)
    if not isinstance(texture, unreal.Texture2D):
        raise ValueError("Texture import failed: " + key)
    return texture


def import_font(source, folder):
    digest = hashlib.sha256(Path(source).read_bytes()).hexdigest()[:12]
    destination = folder + "/Fonts/" + digest
    existing = unreal.EditorAssetLibrary.list_assets(destination, recursive=False, include_folder=False)
    fonts = [unreal.load_asset(path) for path in existing]
    fonts = [font for font in fonts if isinstance(font, unreal.Font)]
    if not fonts:
        factory = unreal.FontFileImportFactory()
        set_values(factory, {"batchCreateFontAsset": "CreateIfNoFontExists"})
        task = unreal.AssetImportTask()
        task.filename = source
        task.destination_path = destination
        task.destination_name = "BebasBoldSaved"
        task.automated = True
        task.save = True
        task.factory = factory
        unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
        # The importer creates a companion UFont outside its imported-path list.
        # Save it explicitly; task.save covers only the imported FontFace.
        companion = unreal.load_asset(destination + "/BebasBoldSaved_Font")
        if isinstance(companion, unreal.Font):
            if not unreal.EditorAssetLibrary.save_loaded_asset(companion):
                raise ValueError("Could not save the editable broadcast font.")
        fonts = [unreal.load_asset(path) for path in unreal.EditorAssetLibrary.list_assets(
            destination, recursive=False, include_folder=False)]
        fonts = [font for font in fonts if isinstance(font, unreal.Font)]
    if len(fonts) != 1:
        raise ValueError("Expected one imported editable broadcast font.")
    return fonts[0]


def apply_request(request, config):
    api = unreal.get_default_object(unreal.UMGToolSet)

    def call(name, *args):
        return api.call_method(name, args=args)

    folder = config["contentRoot"]
    name = request.get("assetName", "WBP_TwoPlayerComparison")
    path = folder + "/" + name
    blueprint = unreal.load_asset(path) if unreal.EditorAssetLibrary.does_asset_exist(path) else None
    if blueprint:
        if unreal.EditorAssetLibrary.get_metadata_tag(blueprint, "LineupsOwner") != OWNER:
            raise ValueError("Refusing to change an unowned widget blueprint.")
    else:
        blueprint = call("CreateWidgetBlueprint", folder, name, unreal.UserWidget.static_class())
        if not blueprint:
            raise ValueError("Could not create the trial widget blueprint.")
        unreal.EditorAssetLibrary.set_metadata_tag(blueprint, "LineupsOwner", OWNER)
    blueprint.modify()
    tree = call("GetWidgets", blueprint)
    nodes = {str(info.widget_name): info for info in tree.widgets}

    def widget(name, kind, parent=None):
        if name not in nodes:
            nodes[name] = call("AddWidget", blueprint, kind.static_class(), name, parent, -1)
        info = nodes[name]
        ObjectTools.list_properties(info.widget)
        if info.slot:
            ObjectTools.list_properties(info.slot)
        return info.widget

    def place(name, x, y, width, height, z=0):
        set_values(nodes[name].slot, {"layoutData": {
            "offsets": {"left": x, "top": y, "right": width, "bottom": height},
            "anchors": {"minimum": {"x": 0, "y": 0}, "maximum": {"x": 0, "y": 0}},
            "alignment": {"x": 0, "y": 0}}, "bAutoSize": False, "zOrder": z})

    root = widget("Stage", unreal.SizeBox)
    set_values(root, {"widthOverride": 1920, "heightOverride": 1080,
                      "bOverride_WidthOverride": True, "bOverride_HeightOverride": True,
                      "clipping": "ClipToBoundsAlways"})
    canvas = widget("Canvas", unreal.CanvasPanel, root)
    textures = {key: import_texture(key, value, folder) for key, value in config["assets"].items()}
    font = import_font(config["fontSource"], folder)

    def image(name, texture, x, y, width, height, z=0, opacity=1):
        item = widget(name, unreal.Image, canvas)
        set_values(item, {"brush": {"resourceObject": {"refPath": texture.get_path_name()},
                                    "drawAs": "Image"}, "renderOpacity": opacity})
        place(name, x, y, width, height, z)

    image("Background", textures["background"], 0, 0, 1920, 1080)
    for side, center in [("left", 400), ("right", 1520)]:
        record = config["assets"][side + "Logo"]
        scale = 600 / record["size"][0]
        bounds = record["alphaBounds"]
        y = config["logoCenterY"] - (bounds[1] + bounds[3]) / 2 * scale
        image(side + "Logo", textures[side + "Logo"], center - 300, y,
              600, record["size"][1] * scale, 1, 0.23)
    image("leftPlayer", textures["leftPlayer"], -180, 225, 1150, 1150 * 2 / 3, 2)
    image("rightPlayer", textures["rightPlayer"], 980, 225, 1150, 1150 * 2 / 3, 2)

    def text(name, content, x, y, width, height, size, align="Left", parent=canvas, z=5):
        item = widget(name, unreal.TextBlock, parent)
        set_values(item, {"text": content, "font": {"size": size, "fontObject": {"refPath": font.get_path_name()},
                                                   "typefaceFontName": ""}, "justification": align,
                          "visibility": "Visible",
                          "colorAndOpacity": {"specifiedColor": {"r": 1, "g": 1, "b": 1, "a": 1},
                                               "colorUseRule": "UseColor_Specified"}})
        place(name, x, y, width, height, z)
        return item

    text("Headline", request["headline"], 60, 35, 980, 180, 100)
    # Opaque lower thirds overlap the cutouts' waist edges in both modes.
    for side, x, color, accent in [
            ("left", 25, (0.24, 0.004, 0.008), (1, 0.64, 0.04)),
            ("right", 1135, (0.003, 0.025, 0.18), (0.03, 0.4, 1))]:
        for suffix, inset, width, height, rgb in [
                ("NameEdge", 0, 760, 110, accent),
                ("NamePlate", 3, 754, 104, color)]:
            plate = widget(side + suffix, unreal.Image, canvas)
            set_values(plate, {"brush": {"drawAs": "Box"},
                               "colorAndOpacity": dict(zip(("r", "g", "b", "a"), (*rgb, 1)))})
            place(side + suffix, x + inset, 945 + inset, width, height, 3)
        text(side + "Name", request["players"][0 if side == "left" else 1],
             x + 25, 963, 710, 85, 64, "Center")
    card = widget("StatCard", unreal.CanvasPanel, canvas)
    place("StatCard", 530, 580, 860, 345, 4)
    set_values(card, {"visibility": "Collapsed"})
    for name, info in nodes.items():
        if re.fullmatch(r"Row\d+(left|label|right)|Divider\d+", name):
            set_values(info.widget, {"visibility": "Collapsed"})
    rows = []
    if request["mode"] == "statistics":
        rows = request["card"]["rows"]
        plate = widget("CardPlate", unreal.Image, card)
        set_values(plate, {"brush": {"drawAs": "Box"},
                           "colorAndOpacity": {"r": 0.012, "g": 0.012, "b": 0.016, "a": 0.96}})
        place("CardPlate", 0, 0, 860, 345)
        for edge, x, y, width, height in [
                ("Top", 0, 0, 860, 3), ("Bottom", 0, 342, 860, 3),
                ("Left", 0, 3, 3, 339), ("Right", 857, 3, 3, 339)]:
            border = widget("CardBorder" + edge, unreal.Image, card)
            set_values(border, {"brush": {"drawAs": "Box"},
                                "colorAndOpacity": {"r": 0.45, "g": 0.45, "b": 0.45, "a": 1}})
            place("CardBorder" + edge, x, y, width, height, 3)
        height = 345 / len(rows)
        for index, row in enumerate(rows):
            y = index * height
            for role, x, width, size in [("left", 0, 255, min(56, height * 0.6)),
                                          ("label", 255, 350, request["card"]["fontSize"]),
                                          ("right", 605, 255, min(56, height * 0.6))]:
                text("Row" + str(index) + role, row[role], x, y + 6, width, height - 8,
                     size, "Center", card, 1)
            if index:
                divider = widget("Divider" + str(index), unreal.Image, card)
                set_values(divider, {"brush": {"drawAs": "Box"},
                                     "visibility": "Visible",
                                     "colorAndOpacity": {"r": 0.25, "g": 0.25, "b": 0.25, "a": 1}})
                place("Divider" + str(index), 15, y, 830, 2, 2)
        set_values(card, {"visibility": "Visible"})
        unreal.EditorAssetLibrary.set_metadata_tag(blueprint, "LineupsStatSources", json.dumps(rows))
    if not call("CompileWidgetBlueprint", blueprint):
        raise ValueError("Widget blueprint compilation failed.")
    if not unreal.EditorAssetLibrary.save_loaded_asset(blueprint):
        raise ValueError("Unreal did not save the widget blueprint.")
    visibility = read(card, ["visibility"])["visibility"]
    centers = []
    for side in ["left", "right"]:
        offsets = read(nodes[side + "Logo"].slot, ["layoutData"])["layoutData"]["offsets"]
        record = config["assets"][side + "Logo"]
        bounds = record["alphaBounds"]
        centers.append(offsets["top"] + (bounds[1] + bounds[3]) / 2 * offsets["bottom"] / record["size"][1])
    measured_rows = []
    for index in range(len(rows)):
        values = {role: read(nodes["Row" + str(index) + role].widget, ["text", "font"])
                  for role in ("left", "label", "right")}
        measured_rows.append({**{role: value["text"] for role, value in values.items()},
                              "minimumFontSize": min(value["font"]["size"] for value in values.values())})
    artwork = {name: {"image": read(nodes[name].widget, ["brush", "renderOpacity"]),
                      "layout": read(nodes[name].slot, ["layoutData"])}
               for name in ("Background", "leftLogo", "rightLogo", "leftPlayer", "rightPlayer")}
    visible_labels = []
    if visibility == "Visible":
        for name, info in sorted(nodes.items()):
            if re.fullmatch(r"Row\d+label", name):
                value = read(info.widget, ["visibility", "text"])
                if value["visibility"] not in ("Hidden", "Collapsed"):
                    visible_labels.append(value["text"])
    return {"assetPath": path, "cardVisibility": visibility, "rowCount": len(visible_labels),
            "rows": measured_rows,
            "nameplates": {side: {
                "text": read(nodes[side + "Name"].widget, ["text", "font"]),
                "plate": read(nodes[side + "NamePlate"].slot, ["layoutData"])}
                for side in ("left", "right")},
            "visibleLabels": visible_labels,
            "artworkSignature": hashlib.sha256(json.dumps(artwork, sort_keys=True).encode()).hexdigest(),
            "logoCenters": centers, "saved": True, "mode": request["mode"], "trialOnly": True}
