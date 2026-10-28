"""Exact Lineups template retrieval and measured source/episode comparisons."""

import hashlib
import json
import math
from pathlib import Path
from fractions import Fraction

ROOT = Path(__file__).resolve().parents[2]
REGISTRY_PATH = ROOT / "config/lineups/template-registry.json"
CALLOUT_PATH = ROOT / "config/lineups/callout-contract.json"
SOURCE_GUARDS_PATH = ROOT / "config/lineups/source-guards.json"


class TemplateError(ValueError):
    pass


def quick_action_duration(frame_rate):
    fps = Fraction(frame_rate['numerator'], frame_rate['denominator'])
    if fps <= 0:
        raise TemplateError('Quick Action frame rate must be positive')
    count = Fraction(9, 2) * fps + Fraction(1, 2)
    frames = count.numerator // count.denominator
    return {'requestedDurationSeconds': 4.5, 'durationFrames': frames,
            'actualDurationSeconds': float(frames / fps), 'rounding': 'nearest-half-up'}


def load_registry():
    return json.loads(REGISTRY_PATH.read_text())


def load_callout_contract():
    return json.loads(CALLOUT_PATH.read_text())


def load_team_callout_contract():
    contract = json.loads((ROOT / 'config/lineups/team-callout-contract.json').read_text())
    if fingerprint(contract['protected']) != contract['sourceFingerprint']:
        raise TemplateError('Team callout contract fingerprint is stale')
    return contract


def load_source_guards():
    contract = json.loads(SOURCE_GUARDS_PATH.read_text())
    if source_guard_fingerprint(contract) != contract['sourceFingerprint']:
        raise TemplateError('source guard contract fingerprint is stale')
    return contract


def source_guard_fingerprint(contract):
    return fingerprint({key: contract[key] for key in ('schemaVersion', 'fileKey', 'componentsPageId', 'tolerance', 'sources')})


def validate_source_guards(readback, contract=None):
    contract = contract or load_source_guards()
    if source_guard_fingerprint(contract) != contract['sourceFingerprint']:
        raise TemplateError('source guard contract fingerprint is stale')
    if readback.get('fileKey') != contract['fileKey'] or readback.get('pageId') != contract['componentsPageId']:
        raise TemplateError('source guards identify a different file or page')
    measured = readback.get('sourceGuards')
    if not isinstance(measured, list) or len(measured) != len(contract['sources']):
        raise TemplateError('missing or duplicate source guard measurements')
    by_id = {row.get('sourceComponentId'): row for row in measured if isinstance(row, dict)}
    if len(by_id) != len(measured) or set(by_id) != {row['sourceComponentId'] for row in contract['sources']}:
        raise TemplateError('missing, duplicate or mismatched source guard identities')

    def same(label, actual, expected):
        if type(expected) in (int, float):
            okay = type(actual) in (int, float) and math.isfinite(actual) and abs(actual - expected) <= contract['tolerance']
        elif isinstance(expected, dict):
            okay = isinstance(actual, dict) and set(actual) == set(expected)
            if okay:
                for key, value in expected.items():
                    same(f'{label}.{key}', actual[key], value)
                return
        elif isinstance(expected, list):
            okay = isinstance(actual, list) and len(actual) == len(expected)
            if okay:
                for index, value in enumerate(expected):
                    same(f'{label}[{index}]', actual[index], value)
                return
        else:
            okay = type(actual) is type(expected) and actual == expected
        if not okay:
            raise TemplateError(f'{label}: expected {expected!r}, got {actual!r}')

    for source in contract['sources']:
        actual = by_id[source['sourceComponentId']]
        for role, expected in source['protected'].items():
            same(f"{source['id']}.{role}", actual.get(role), expected)
    if readback.get('sourceGuardFingerprint') != contract['sourceFingerprint']:
        raise TemplateError('source guard readback fingerprint is stale or missing')
    return {'sourceGuards': len(measured), 'sourceGuardFingerprint': contract['sourceFingerprint']}


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
    if expected.get('engine') == 'unreal':
        for key in ('engine', 'type', 'projectPath', 'mapPath', 'sequencePath', 'manifestPath', 'width', 'height'):
            if readback.get(key) != expected.get(key):
                raise TemplateError(f'{template["key"]}: native source.{key} differs from the registry')
        return
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
    matches = []
    asset_blocked = False
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
        if row['option'] == 'Cinematic 2-up':
            if (candidate.get('assetTreatment') != 'full-photo' or candidate.get('originalBackgrounds') is not True
                    or candidate.get('openingTogether') is not True or candidate.get('titlePosition') != 'top-left'):
                asset_blocked = True
                continue
        elif (purpose == 'cast' or (purpose == 'comparison' and candidate['comparisonKind'] == 'players')) and candidate.get('realAlpha') is not True:
            asset_blocked = True
            continue
        matches.append(row["key"])
    if not matches and asset_blocked:
        return {'status': 'asset-blocked', 'reason': 'Cinematic 2-up requires full photos with original backgrounds together at frame zero and the top-left title. Player compositing in other options requires real alpha.', 'templates': []}
    return {"status": "eligible" if len(matches) == 1 else "needs-review" if matches else "reference-gap",
            "reason": "Fits the registered capacity." if len(matches) == 1 else
                      "Choose between the eligible approved looks." if matches else "No registered approved source fits these requirements.",
            "templates": matches}


def validate_cinematic(manifest, readback=None):
    if manifest.get('scene', {}).get('approvedOption') != 'Cinematic 2-up':
        return
    layout = manifest.get('figma', {}).get('cinematic2Up') or {}
    photos = layout.get('photos') or []
    if layout.get('titlePosition') != 'top-left' or len(photos) != 2:
        raise TemplateError('Cinematic 2-up requires 2 full photos with original backgrounds and the top-left title')
    if (len({p.get('nodeId') for p in photos}) != 2 or len({p.get('sourceId') for p in photos}) != 2
            or len({p.get('imageHash') for p in photos}) != 2):
        raise TemplateError('Cinematic 2-up requires distinct source photos, node IDs and image hashes')
    for photo in photos:
        if (not photo.get('nodeId') or not photo.get('sourceId') or not photo.get('imageHash')
                or photo.get('assetTreatment') != 'full-photo' or photo.get('originalBackground') is not True
                or photo.get('visibleFrom') != 0):
            raise TemplateError('Cinematic 2-up requires full photos visible together from frame zero')
        bounds = photo.get('openingBounds') or {}
        if any(type(bounds.get(k)) not in (int, float) or not math.isfinite(bounds[k]) for k in ('x', 'y', 'width', 'height')):
            raise TemplateError('Cinematic opening visibility requires measured photo bounds')
        if bounds['width'] <= 0 or bounds['height'] <= 0 or bounds['x'] >= 1920 or bounds['y'] >= 1080 or bounds['x'] + bounds['width'] <= 0 or bounds['y'] + bounds['height'] <= 0:
            raise TemplateError('Cinematic photos must both intersect the opening frame')
        for track in manifest.get('figma', {}).get('motionTracks', []):
            if track.get('nodeId') != photo['nodeId'] or track.get('property') != 'opacity':
                continue
            frames = track.get('keyframes') or []
            if not frames or frames[0].get('time') != 0 or any(type(f.get('value')) not in (int, float) or f['value'] <= 0 for f in frames):
                raise TemplateError('Cinematic photos cannot have delayed or hidden opacity reveals')
    if readback is not None and readback.get('cinematic2Up') != layout:
        raise TemplateError('Cinematic readback must confirm full photos, opening visibility and top-left title')


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
    team_callout = template['key'] == 'quick-stat.team-callout'
    contract = load_team_callout_contract() if team_callout else load_callout_contract()
    source_ids = {row['componentId'] for row in contract['teamVariants']} if team_callout else {template['source']['componentId']}
    if template["lane"] != manifest["scene"]["lane"] or template["option"] != manifest["scene"]["approvedOption"] or manifest["figma"]["sourceComponentId"] not in source_ids:
        raise TemplateError("template binding differs from the selected lane, option, or canonical source")
    if binding.get("contractId") != contract["id"] or binding.get("sourceFingerprint") != contract["sourceFingerprint"]:
        raise TemplateError("Quick Stat requires the current Components callout fingerprint")
    roles = binding.get("roleNodeIds") or {}
    expected_roles = set(contract['protected'])
    if set(roles) != expected_roles or any(not isinstance(node, str) or not node.strip() for node in roles.values()) or len(set(roles.values())) != len(expected_roles):
        raise TemplateError('Quick Stat requires distinct exact episode nodes for every protected callout role')
    if team_callout and binding.get('fitOverride'):
        raise TemplateError('Team callout uses its own Hug contract; generic fit overrides do not apply')


def validate_manifest_readback(manifest, readback):
    validate_manifest_binding(manifest)
    if not manifest.get("figma", {}).get("templateBinding"):
        return
    binding = manifest["figma"]["templateBinding"]
    pending_root = str(manifest['figma']['rootNodeId']).startswith('pending:')
    actual_ids = []
    for role, node_id in binding["roleNodeIds"].items():
        actual_id = (readback.get(role) or {}).get('id')
        actual_ids.append(actual_id)
        if pending_root and node_id == f"pending:{manifest['scene']['sceneId']}/callout/{role}":
            if ((readback.get('plannedRoleNodeIds') or {}).get(role) != node_id or not actual_id
                    or str(actual_id).startswith('pending:')):
                raise TemplateError(f'{role} readback is missing its actual episode node binding')
        elif actual_id != node_id:
            raise TemplateError(f"{role} readback targets a different episode node")
    if len(set(actual_ids)) != len(binding['roleNodeIds']):
        raise TemplateError('callout readback requires distinct actual episode nodes')
    root_matches = (readback.get('plannedRootNodeId') == manifest['figma']['rootNodeId']
                    and readback.get('rootNodeId') and not str(readback['rootNodeId']).startswith('pending:')) if pending_root else readback.get('rootNodeId') == manifest['figma']['rootNodeId']
    if not root_matches:
        raise TemplateError("callout readback targets a different scene root")
    if binding['key'] == 'quick-stat.team-callout':
        validate_team_callout(readback)
    else:
        validate_callout(readback, fit_override=binding.get("fitOverride"))


def validate_team_callout(readback):
    """Check the reused Team card at the normal measured readback boundary."""
    contract = load_team_callout_contract()

    def same(label, actual, expected):
        if type(expected) in (int, float):
            valid = type(actual) in (int, float) and math.isfinite(actual) and abs(actual - expected) <= 0.01
        else:
            valid = normalize(actual) == normalize(expected)
        if not valid:
            raise TemplateError(f'Team callout {label} differs from the current source')

    for role, properties in contract['protected'].items():
        for key, expected in properties.items():
            same(f'{role}.{key}', (readback.get(role) or {}).get(key), expected)
    same('frame', readback.get('rootDimensions'), contract['frame'])
    wrapper, panel, body, text, header, subject = (readback[role] for role in
                                                 ('wrapper', 'panel', 'body', 'text', 'header', 'subject'))
    for child, parent in [('panel', 'wrapper'), ('logoBlock', 'panel'), ('accent', 'panel'),
                          ('text', 'body'), ('subject', 'header')]:
        same(f'{child}.parentId', readback[child].get('parentId'), readback[parent]['id'])
    same('wrapper.parentId', wrapper.get('parentId'), readback['rootNodeId'])
    if not header.get('parentId') or header['parentId'] != body.get('parentId'):
        raise TemplateError('Team callout header and body must share their copy stack')
    for role, keys in [('panel', ('x', 'y', 'width')), ('body', ('width',)),
                       ('header', ('width',)), ('subject', ('x', 'width', 'height')),
                       ('text', ('x', 'width', 'height'))]:
        for key in keys:
            value = readback[role].get(key)
            if type(value) not in (int, float) or not math.isfinite(value):
                raise TemplateError(f'Team callout {role}.{key} needs a finite measurement')
    same('panel center', panel['x'] + panel['width'] / 2, 960)
    same('panel bottom', wrapper['y'] + panel['y'] + panel['height'], 1044)
    same('body Hug width', body['width'], text['width'] + 96)
    same('header width', header['width'], body['width'])
    same('panel width', panel['width'], body['width'] + 240)
    same('text padding', text['x'], 48)
    if (not 0 < panel['width'] <= 1728 or not 0 < text['width'] or not 0 < text['height'] <= 160
            or not 0 < subject['height'] <= 80 or subject['x'] < 0
            or subject['width'] <= 0 or subject['x'] + subject['width'] > header['width']):
        raise TemplateError('Team callout text or card exceeds its readable bounds')
    return {'status': 'passed', 'contractId': contract['id'], 'sourceFingerprint': contract['sourceFingerprint']}
