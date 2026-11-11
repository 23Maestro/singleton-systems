"""Shared Lineups contract checks. Mechanical results never grant visual approval."""
import hashlib
import json
import math
from pathlib import Path

from tools.video_workflow.evidence import approval_matches, file_sha256, record_sha256 as digest

from .templates import load_registry, load_team_callout_contract, resolve

ROOT = Path(__file__).resolve().parents[2]
STYLE_FIELDS = {
    'card': {'fills', 'strokes', 'strokeWeight', 'corners', 'effects'},
    'text': {'characters', 'fontName', 'fontSize', 'lineHeight', 'letterSpacing', 'textAlignHorizontal'},
    'logo': {'bounds'},
    'photo': {'bounds'},
    'frame': {'width', 'height'},
}
VISUAL_CHECKS = {'headroom', 'callouts', 'accents', 'team-backgrounds', 'logos',
                 'copy', 'template', 'workflow', 'composition'}


def require(condition, message):
    if not condition:
        raise ValueError('Lineups contract: ' + message)


def source_binding(root, manifest):
    engine = manifest.get('motion', {}).get('engine')
    require(engine in {'figma', 'blender', 'unreal'}, 'record the scene engine')
    native = manifest.get(engine) or {}
    binding = manifest.get('contractGate', {}).get('templateBinding') or native.get('templateBinding') or {}
    template = resolve(binding.get('key'))
    require(binding.get('templateSha256') == digest(template), 'template version is missing or stale')
    source = template['source']
    if source.get('engine', 'figma') != engine:
        from .engine_choice import episode_engine_override
        ledger = json.loads((Path(root) / manifest['discoveryPath']).read_text())
        require(episode_engine_override(manifest, ledger), 'template engine differs')
        source = template['legacyFigmaSource']
    require(template['lane'] == manifest['scene']['lane']
            and manifest['scene']['approvedOption'] in template.get('approvedOptions', [template['option']]), 'template lane or option differs')
    if engine == 'figma':
        ids = {source['componentId']}
        if template['key'] == 'quick-stat.team-callout':
            ids.update(v['componentId'] for v in load_team_callout_contract()['teamVariants'])
        require(native.get('fileKey') == load_registry()['fileKey']
                and native.get('sourceComponentId') in ids, 'retired or unregistered source component')
    else:
        require(binding.get('nativeManifestSha256') == hashlib.sha256(
            (ROOT / template['source']['manifestPath']).read_bytes()).hexdigest(), 'native manifest version is missing or stale')
        require(native.get('source') == template['source'], 'native template source differs')
    if engine == 'blender':
        from .blender_source import verify_source
        verify_source(template)
    return template


def artifact(root, ref):
    require(isinstance(ref, dict) and ref.get('path') and ref.get('sha256'), 'missing evidence file')
    path = Path(root) / ref['path']
    require(file_sha256(path) == ref['sha256'], 'evidence file changed: ' + str(path))
    return path


def approved(value):
    require(approval_matches(value, 'Jerami'), 'approval is missing or stale')

def same_values(actual, expected):
    if number(actual) and number(expected):
        return actual == expected
    if type(actual) is not type(expected):
        return False
    if isinstance(expected, dict):
        return actual.keys() == expected.keys() and all(same_values(actual[k], v) for k, v in expected.items())
    if isinstance(expected, list):
        return len(actual) == len(expected) and all(same_values(a, b) for a, b in zip(actual, expected))
    return actual == expected


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def bounds(value):
    require(isinstance(value, list) and len(value) == 4 and all(number(v) for v in value)
            and value[2] > 0 and value[3] > 0, 'invalid artwork bounds')
    return value


def visible_artwork(root, role, measured):
    from PIL import Image
    policy = role.get('artwork') or {}
    low, high, tolerance, threshold = (policy.get(k) for k in
                                      ('minOccupancy', 'maxOccupancy', 'centerTolerance', 'alphaThreshold'))
    require(all(number(v) for v in (low, high, tolerance, threshold))
            and 0 < low <= high <= 1 and tolerance >= 0 and 0 <= threshold < 255, 'invalid artwork policy')
    require(measured.get('pixelMapping') == 'axis-aligned', 'flatten transformed logo proof before measuring')
    x, y, w, h = bounds(measured.get('imageBounds'))
    sx, sy, sw, sh = bounds(role['expected']['bounds'])
    with Image.open(artifact(root, measured.get('pixels'))) as image:
        require('A' in image.getbands(), 'logo proof needs transparent pixels, not its container')
        box = image.getchannel('A').point(lambda a: 255 if a > threshold else 0).getbbox()
        require(box is not None, 'empty logo artwork')
        left, top, right, bottom = box
        ax, ay = x + left / image.width * w, y + top / image.height * h
        aw, ah = (right-left) / image.width * w, (bottom-top) / image.height * h
    require(ax >= sx and ay >= sy and ax+aw <= sx+sw and ay+ah <= sy+sh, 'logo artwork clips its slot')
    require(low <= max(aw/sw, ah/sh) <= high, 'logo visible artwork occupancy differs')
    require(abs(ax+aw/2-sx-sw/2) <= tolerance and abs(ay+ah/2-sy-sh/2) <= tolerance,
            'logo visible artwork is off-center')


def specification(root, manifest, template):
    gate = manifest.get('contractGate') or {}
    spec = json.loads(artifact(root, gate.get('spec')).read_text())
    approved(spec)
    require(spec.get('schemaVersion') == 1 and spec.get('scene') == manifest['scene']
            and spec.get('templateSha256') == digest(template), 'specification belongs to another scene or template')
    if manifest['motion']['engine'] in {'unreal', 'blender'}:
        binding = gate.get('templateBinding') or manifest[manifest['motion']['engine']].get('templateBinding', {})
        require(spec.get('nativeManifestSha256') == binding.get('nativeManifestSha256'),
                'specification has a stale native manifest version')
    roles = spec.get('roles')
    require(isinstance(roles, dict) and roles, 'specification needs its complete role roster')
    required = template.get('requiredRoles')
    require(isinstance(required, dict) and required, 'template has no required role contract')
    for name, kind in required.items():
        require(name in roles and roles[name].get('kind') == kind,
                name + ': missing or misclassified required role')
    for name in template.get('requiredTeamRoles', []):
        require(roles.get(name, {}).get('teamId'), name + ': required role needs team identity')
    for name, role in roles.items():
        fields = STYLE_FIELDS.get(role.get('kind'))
        require(fields is not None and fields <= set(role.get('expected', {})), name + ': incomplete protected properties')
        if role.get('teamId'):
            team = spec.get('teams', {}).get(role['teamId'], {})
            require(team.get('name') and team.get('paletteSource'), name + ': missing team identity or palette source')
    return spec


def measure(root, manifest, spec):
    gate = manifest['contractGate']
    measured = json.loads(artifact(root, gate.get('measurement')).read_text())
    require(measured.get('scene') == manifest['scene']
            and measured.get('specSha256') == gate['spec']['sha256']
            and measured.get('sourceRevision') == manifest[manifest['motion']['engine']].get('sourceRevision')
            and measured.get('sourceRevision'), 'measurement belongs to another scene or revision')
    roles = measured.get('roles', {})
    require(set(roles) == set(spec['roles']), 'measurement has missing or extra roles')
    ids = [r.get('nodeId') for r in roles.values()]
    require(all(isinstance(x, str) and x.strip() for x in ids) and len(set(ids)) == len(ids), 'measurement needs distinct node IDs')
    for name, role in spec['roles'].items():
        for field, expected in role['expected'].items():
            require(same_values(roles[name].get(field), expected), f'{name}.{field} differs from approved design')
        if role['kind'] == 'logo':
            visible_artwork(root, role, roles[name])
    return measured


def workflow(root, manifest, spec):
    motion = manifest.get('motion', {})
    cues = motion.get('cues')
    require(isinstance(cues, list) and cues and len({c.get('cueId') for c in cues}) == len(cues)
            and all(c.get('cueId') and number(c.get('sceneTime')) and c['sceneTime'] >= 0
                    and number(c.get('duration')) and c['duration'] >= 0 for c in cues), 'missing or invalid speech cues')
    lock = spec.get('cueLock', {})
    require(lock.get('motionSha256') == digest(motion), 'speech cue lock is missing or stale')
    transcript = artifact(root, lock.get('transcript'))
    if manifest.get('timing', {}).get('transcriptPath'):
        require(transcript.resolve() == (Path(root) / manifest['timing']['transcriptPath']).resolve(),
                'cue lock and timing use different transcripts')
    order = spec.get('workflow', {})
    if motion['engine'] == 'blender':
        require(order.get('order') in (['blender'], ['figma', 'blender'], ['blender', 'figma']),
                'missing approved Figma/Blender build order')
    else:
        require(order.get('order') in (['figma', 'unreal'], ['unreal', 'figma']), 'missing approved build order')
    if motion['engine'] != 'blender' and order['order'] != ['figma', 'unreal']:
        require(order.get('exceptionSource'), 'build order exception needs its scoped user instruction')
    required_scenes = order.get('figmaScenes')
    require(isinstance(required_scenes, list) and len(set(required_scenes)) == len(required_scenes)
            and all(isinstance(s, str) and s for s in required_scenes), 'missing Figma scene roster')
    if motion['engine'] in {'unreal', 'blender'} and order['order'][0] == 'figma':
        exports = [json.loads(artifact(root, ref).read_text())
                   for ref in manifest['contractGate'].get('figmaExports', [])]
        require(len(exports) == len(required_scenes)
                and {row.get('sceneId') for row in exports} == set(required_scenes), 'required Figma exports are incomplete')
        for row in exports:
            require(row.get('episodeId') == manifest['scene']['episodeId'] and row.get('engine') == 'figma'
                    and row.get('status') == 'exported', 'Figma export belongs to another episode or is unfinished')
            artifact(root, row.get('export'))


def review_binding(manifest):
    gate = manifest['contractGate']
    return digest({'scene': manifest['scene'], 'native': manifest[manifest['motion']['engine']],
                   'motion': manifest['motion'], 'timing': manifest.get('timing'),
                   'templateBinding': gate.get('templateBinding'), 'engineChoice': manifest.get('engineChoice'),
                   'figmaExports': gate.get('figmaExports'), 'spec': gate['spec'], 'measurement': gate['measurement'], 'export': manifest['export']})


def visual_review(root, manifest):
    from .media_evidence import validate_media
    export = manifest['export']
    artifact(root, {'path': export['path'], 'sha256': export['fileSha256']})
    validate_media(root, manifest)
    frames = export['motionProof']['frames']
    fps = manifest['motion']['frameRate']['numerator'] / manifest['motion']['frameRate']['denominator']
    require(any(f['time'] == 0 for f in frames) and any(
        abs(f['time'] - (manifest['timing']['paddedCompositionEnd'] - 1/fps)) < .001 for f in frames),
        'visual proof needs opening and final hold frames')
    review = json.loads(artifact(root, manifest['contractGate'].get('visualReview')).read_text())
    approved(review)
    require(review.get('bindingSha256') == review_binding(manifest), 'visual review is stale for the scene or export')
    checks = review.get('checks', {})
    require(set(checks) == VISUAL_CHECKS and all(
        row.get('status') == 'passed' and isinstance(row.get('note'), str) and row['note'].strip()
        for row in checks.values()), 'visual review has missing or failed checks')


def check(root, manifest, stage):
    require(stage in {'source', 'before-build', 'after-build', 'before-handoff'}, 'unknown gate stage')
    if stage != 'source' and manifest['scene']['lane'] != 'comparison' and (
            manifest.get('motion', {}).get('engine') == 'blender' or manifest['scene'].get('blenderVariant')):
        # Unapproved or unnamed Blender variants stop here, before any template lookup.
        from .engine_choice import engine_route
        engine_route(manifest, json.loads((Path(root) / manifest['discoveryPath']).read_text()), enforce_engine=True)
    template = source_binding(root, manifest)
    if stage != 'source':
        if manifest['motion']['engine'] == 'unreal':
            require(not template['source'].get('status', '').startswith('unapproved'), 'native source is an unapproved prototype')
            if template.get('surfaceDesign'):
                from .designs import resolve_design
                require(resolve_design(template)['implementation'].get('productionReady') is True,
                        'native surface implementation and review are pending')
        if manifest['scene']['lane'] == 'comparison':
            from .engine_choice import engine_route
            ledger = json.loads((Path(root) / manifest['discoveryPath']).read_text())
            route = engine_route(manifest, ledger, require_choice=True, enforce_engine=True)
            require(route.get('status') != 'reference-gap', 'selected source needs review')
        spec = specification(root, manifest, template)
        workflow(root, manifest, spec)
        if manifest['scene']['lane'] == 'comparison':
            require(ledger.get('transcriptSha256') == spec['cueLock']['transcript']['sha256'],
                    'discovery transcript differs from the approved cue lock')
        from .timing_evidence import validate_timing_receipt
        validate_timing_receipt(root, manifest, require_approval=False)
        if manifest['motion']['engine'] == 'blender':
            require(manifest['scene'].get('blenderVariant') == template['source'].get('variant'),
                    'Blender template differs from the named variant')
        if stage == 'before-build':
            from .engine_choice import routing_contract
            require(manifest['motion']['engine'] not in routing_contract().get('retiredEngines', []),
                    'Unreal is retired for new builds; route the scene to Figma or Blender')
        if stage in {'after-build', 'before-handoff'}:
            measure(root, manifest, spec)
        if stage == 'before-handoff':
            visual_review(root, manifest)
    return {'status': 'passed', 'stage': stage,
            'visualApproval': 'recorded' if stage == 'before-handoff' else 'not-evaluated'}


def check_production(root, manifest, stage, *, readback=None, require_readback=False):
    """Scope to the actual Lineups file or an explicitly enrolled native scene."""
    if (manifest.get('figma', {}).get('fileKey') == load_registry()['fileKey']
            or 'contractGate' in manifest or manifest.get('motion', {}).get('engine') == 'unreal'):
        result = check(root, manifest, stage)
        if require_readback:
            measured = json.loads(artifact(root, manifest['contractGate'].get('measurement')).read_text())
            require(isinstance(readback, dict) and same_values(readback, measured),
                    'tool readback differs from the bound contract measurement')
        return result
