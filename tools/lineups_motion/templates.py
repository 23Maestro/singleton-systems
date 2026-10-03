"""Exact Lineups template retrieval and measured source/episode comparisons."""

import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTRY_PATH = ROOT / "config/lineups/template-registry.json"
CALLOUT_PATH = ROOT / "config/lineups/callout-contract.json"


class TemplateError(ValueError):
    pass


def load_registry():
    return json.loads(REGISTRY_PATH.read_text())


def load_callout_contract():
    return json.loads(CALLOUT_PATH.read_text())


def normalize(value):
    if isinstance(value, float):
        if not math.isfinite(value):
            raise TemplateError("non-finite measurement")
        return round(value, 6)
    if isinstance(value, list):
        return [normalize(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize(item) for key, item in value.items()}
    return value


def fingerprint(value):
    return hashlib.sha256(json.dumps(normalize(value), sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def resolve(key, registry=None):
    matches = [row for row in (registry or load_registry())["templates"] if row["key"] == key]
    if len(matches) != 1:
        raise TemplateError(f"unregistered or duplicate template key: {key}")
    return matches[0]


def validate_source_identity(template, readback):
    """Names/ordering may change; source ID, page, type, and capacity may not."""
    expected = template["source"]
    for key in ("fileKey", "pageId", "componentId", "type", "parentId", "width", "height", "variantProperties"):
        if readback.get(key) != expected[key]:
            raise TemplateError(f'{template["key"]}: source.{key} expected {expected[key]!r}, got {readback.get(key)!r}')


def eligible(candidate, registry=None):
    """Use explicit content requirements, never keyword matches on transcript prose.

    Candidate describes reviewed meaning. This function tests capacity/asset fit;
    it does not claim to understand or independently approve the narration.
    """
    registry = registry or load_registry()
    purpose = candidate.get("purpose")
    lanes = {"photo": "quick action photo", "statement": "quick stat",
             "stats": "stat breakdown", "comparison": "comparison",
             "timeline": "year-by-year", "cast": "asset swap", "ranking": "recurring board"}
    if purpose not in lanes:
        return {"status": "needs-review", "reason": "Declare the visual purpose from the transcript.", "templates": []}
    if not candidate.get("evidence"):
        return {"status": "needs-review", "reason": "Missing transcript evidence.", "templates": []}
    if purpose == "comparison" and candidate.get("comparisonKind") not in ("teams", "players", "periods"):
        return {"status": "needs-review", "reason": "Confirm whether the narration compares teams, players, or periods.", "templates": []}
    requirements = {"statement": ("photos",), "stats": ("stats",),
                    "comparison": ("subjects", "rows"), "timeline": ("periods",),
                    "cast": ("subjects",), "ranking": ("option",)}.get(purpose, ())
    if any(candidate.get(key) is None for key in requirements):
        return {"status": "needs-review", "reason": "Missing capacity setting: " + ", ".join(requirements), "templates": []}
    if purpose == "cast" and (type(candidate["subjects"]) is not int or not 1 <= candidate["subjects"] <= 4):
        return {"status": "reference-gap", "reason": "Asset Swap supports 1 to 4 subjects.", "templates": []}
    player_slots = purpose == "cast" or (purpose == "comparison" and candidate["comparisonKind"] == "players")
    if player_slots and candidate.get("realAlpha") is not True:
        return {"status": "asset-blocked", "reason": "Player compositing requires verified real alpha.", "templates": []}
    matches = []
    for row in registry["templates"]:
        if row["lane"] != lanes[purpose]:
            continue
        if candidate.get("option") and candidate["option"] != row["option"]:
            continue
        if row["option"] == "Cinematic 2-up":
            if purpose != "comparison" or candidate["comparisonKind"] != "players" or candidate["rows"] != 1:
                continue
        elif purpose == "comparison" and candidate["rows"] == 1 and row["option"] != "Simple comparison":
            continue
        if any(candidate.get(key) != value for key, value in row["settings"].items()):
            continue
        matches.append(row["key"])
    return {"status": "eligible" if len(matches) == 1 else "needs-review" if matches else "reference-gap",
            "reason": "Fits the registered capacity." if len(matches) == 1 else
                      "Choose between the eligible approved looks." if matches else "No registered approved source fits these requirements.",
            "templates": matches}


def validate_callout(readback, contract=None, source=False, fit_override=None):
    """Compare actual node properties, plus relationships affected by text Hug."""
    contract = contract or load_callout_contract()
    if fingerprint(contract["protected"]) != contract["sourceFingerprint"]:
        raise TemplateError("callout contract fingerprint is stale")
    errors = []
    tolerance = contract["geometry"]["tolerance"]

    def same(label, actual, expected):
        if type(actual) in (int, float) and type(expected) in (int, float):
            okay = math.isfinite(actual) and abs(actual - expected) <= tolerance
        else:
            okay = normalize(actual) == normalize(expected)
        if not okay:
            errors.append(f"{label}: expected {expected!r}, got {actual!r}")

    font_size = contract["protected"]["text"]["fontSize"]
    if fit_override is not None:
        # A deliberate long-copy exception never becomes the next episode's source.
        size = fit_override.get("fontSize")
        original_width = fit_override.get("textWidthAt64")
        if source or fit_override.get("reason") != "long-copy-safe-width" or not fit_override.get("evidence") or type(size) not in (int, float) or not 44 <= size < font_size or type(original_width) not in (int, float) or not math.isfinite(original_width) or original_width + 144 <= contract["geometry"]["safeWidth"]:
            raise TemplateError("invalid explicit long-copy fit override")
        font_size = size
    for role, expected in contract["protected"].items():
        actual = readback.get(role) or {}
        for key, value in expected.items():
            got = actual.get(key)
            if key == "fontName" and isinstance(got, dict):
                variations = got.get("variationSettings")
                if variations and variations != {"wght": 700, "slnt": 0}:
                    errors.append("text.fontName.variationSettings: changed Inter Bold weight or slant")
                got = {field: got.get(field) for field in ("family", "style")}
            if role == "text" and key == "fontSize":
                value = font_size
            same(f"{role}.{key}", got, value)
        if not actual.get("id"):
            errors.append(f"{role}.id: missing node binding")
        if source:
            same(f"{role}.id", actual.get("id"), contract["source"]["roleNodeIds"][role])
    wrapper, panel, text = (readback.get(role) or {} for role in ("wrapper", "panel", "text"))
    same("panel.parentId", panel.get("parentId"), wrapper.get("id"))
    same("text.parentId", text.get("parentId"), panel.get("id"))
    if not source:
        same("wrapper.x", wrapper.get("x"), contract["geometry"]["wrapperX"])
        same("wrapper.y", wrapper.get("y"), contract["geometry"]["wrapperY"])
        same("wrapper.parentId", wrapper.get("parentId"), readback.get("rootNodeId"))
        same("rootDimensions", readback.get("rootDimensions"), {"width": 1920, "height": 1080})
    # Text width/height must be measured, not copied from the source's sample copy.
    for role, node, keys in (("panel", panel, ("x", "y", "width", "height")),
                             ("text", text, ("x", "y", "width", "height"))):
        for key in keys:
            if type(node.get(key)) not in (int, float) or not math.isfinite(node[key]):
                errors.append(f"{role}.{key}: missing finite live measurement")
    if not errors:
        same("panel.centerX", panel["x"] + panel["width"] / 2, contract["geometry"]["panelCenterX"])
        same("panel.bottom", (-7 if source else wrapper["y"]) + panel["y"] + panel["height"], contract["geometry"]["panelBottom"])
        same("panel.hugWidth", panel["width"], text["width"] + panel["paddingLeft"] + panel["paddingRight"])
        same("text.x", text["x"], panel["paddingLeft"])
        same("text.verticalCenter", text["y"] + text["height"] / 2, panel["height"] / 2)
        if panel["width"] > contract["geometry"]["safeWidth"]:
            errors.append("panel.width: exceeds approved safe width; review copy fit")
        if text["height"] > 1.3 * font_size:
            errors.append("text.height: statement must fit on 1 line")
        if fit_override and abs(fit_override["textWidthAt64"] * font_size / 64 - text["width"]) > 2:
            errors.append("text.width: fit override does not match the measured 64 px copy")
    if errors:
        raise TemplateError("; ".join(errors))
    return {"status": "passed", "contractId": contract["id"], "sourceFingerprint": contract["sourceFingerprint"]}


def validate_manifest_binding(manifest):
    """Real Lineups Quick Stats must name their guarded component, never an episode."""
    registry = load_registry()
    if manifest.get("figma", {}).get("fileKey") != registry["fileKey"] or manifest.get("scene", {}).get("lane") != "quick stat":
        return
    binding = manifest["figma"].get("templateBinding") or {}
    template = resolve(binding.get("key"))
    if template["lane"] != manifest["scene"]["lane"] or template["option"] != manifest["scene"]["approvedOption"] or template["source"]["componentId"] != manifest["figma"]["sourceComponentId"]:
        raise TemplateError("template binding differs from the selected lane, option, or canonical source")
    contract = load_callout_contract()
    if binding.get("contractId") != contract["id"] or binding.get("sourceFingerprint") != contract["sourceFingerprint"]:
        raise TemplateError("Quick Stat requires the current Components callout fingerprint")
    roles = binding.get("roleNodeIds") or {}
    if set(roles) != {"wrapper", "panel", "text"} or any(not isinstance(node, str) or not node for node in roles.values()) or len(set(roles.values())) != 3:
        raise TemplateError("Quick Stat requires 3 distinct exact episode callout node IDs")


def validate_manifest_readback(manifest, readback):
    validate_manifest_binding(manifest)
    if not manifest.get("figma", {}).get("templateBinding"):
        return
    binding = manifest["figma"]["templateBinding"]
    for role, node_id in binding["roleNodeIds"].items():
        if (readback.get(role) or {}).get("id") != node_id:
            raise TemplateError(f"{role} readback targets a different episode node")
    if readback.get("rootNodeId") != manifest["figma"]["rootNodeId"]:
        raise TemplateError("callout readback targets a different scene root")
    validate_callout(readback, fit_override=binding.get("fitOverride"))
