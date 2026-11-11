"""Explicit engine choice after transcript candidate selection, before authoring."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTRACT_PATH = ROOT / 'config/lineups/engine-routing.json'


def routing_contract():
    return json.loads(CONTRACT_PATH.read_text())


def selection_binding(manifest, ledger):
    scene = manifest['scene']
    matches = [finding for row in ledger['lanes'] if row['lane'] == scene['lane']
               for finding in row['findings'] if finding.get('outcome') == 'candidate'
               and finding.get('candidateId') == scene['sceneId']]
    if len(matches) != 1 or ledger.get('episodeId') != scene['episodeId']:
        raise ValueError('engine choice requires one selected transcript candidate in this episode')
    digest = ledger.get('transcriptSha256')
    if not isinstance(digest, str) or len(digest) != 64:
        raise ValueError('engine choice requires the transcript revision')
    bound = {'scene': scene, 'candidate': matches[0], 'transcriptSha256': digest,
             'routingContract': routing_contract()}
    return hashlib.sha256(json.dumps(bound, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def comparison_subjects(scene):
    if scene.get('lane') != 'comparison':
        return None
    fixed = {'Cinematic 2-up': 2, 'Rank Movement': 2, 'Full comparison: 2': 2,
             'Full comparison: 3': 3, 'Full comparison: 4': 4}
    count = scene.get('subjectCount', fixed.get(scene.get('approvedOption')))
    if type(count) is not int or not 2 <= count <= 4:
        raise ValueError('Lane 4 Comparison requires an explicit subjectCount from 2 to 4')
    if scene.get('approvedOption') in fixed and count != fixed[scene['approvedOption']]:
        raise ValueError('Comparison subjectCount differs from its approved option')
    return count


def comparison_option(option, kind, metric, contract):
    if (contract.get('productionUnrealEnabled') and kind == 'periods' and metric == 'rank'
            and option in (None, 'Simple comparison')):
        return 'Rank Movement'
    return option


def fixed_option_route(scene, contract, key='fixedRoutes'):
    option = comparison_option(scene.get('approvedOption'), scene.get('comparisonKind'),
                               scene.get('comparisonMetric'), contract)
    return next((route for route in contract.get(key, [])
                  if route['lane'] == scene.get('lane') and route['option'] == option
                  and ('subjects' not in route or route['subjects'] == comparison_subjects(scene))
                  and ('comparisonKind' not in route or route['comparisonKind'] == scene.get('comparisonKind'))), None)


def engine_route(manifest, ledger, require_choice=False, enforce_engine=False):
    scene = manifest['scene']
    contract = routing_contract()
    if scene.get('lane') != 'comparison':
        variant = variant_route(manifest, contract, enforce_engine)
        if variant:
            selection_binding(manifest, ledger)
            return variant
    count = comparison_subjects(scene)
    if count is not None:
        if scene.get('comparisonKind') not in ('players', 'teams', 'periods'):
            raise ValueError('Comparison requires an explicit players, teams or periods kind')
        if scene.get('approvedOption') == 'Cinematic 2-up' and scene['comparisonKind'] != 'players':
            raise ValueError('Cinematic 2-up is registered for players only')
        if scene.get('approvedOption') == 'Rank Movement' and scene['comparisonKind'] != 'periods':
            raise ValueError('Rank Movement requires the same team across two periods')
    fixed = fixed_option_route(scene, contract)
    retired = None if fixed else fixed_option_route(scene, contract, 'retiredRoutes')
    if retired:
        override = episode_engine_override(manifest, ledger)
        if override:
            if enforce_engine and manifest.get("motion", {}).get("engine") != override["engine"]:
                raise ValueError("motion.engine differs from the episode engine override")
            return override
    if fixed:
        override = episode_engine_override(manifest, ledger)
        if override:
            if enforce_engine and manifest.get("motion", {}).get("engine") != override["engine"]:
                raise ValueError("motion.engine differs from the episode engine override")
            return override
        binding = selection_binding(manifest, ledger)
        if manifest.get('engineChoice', {}).get('engine', fixed['engine']) != fixed['engine']:
            raise ValueError('Selected option has a fixed engine route; do not fall back to the legacy Figma source')
        if enforce_engine and manifest.get('motion', {}).get('engine') != fixed['engine']:
            raise ValueError('motion.engine differs from the fixed option route; do not substitute engines')
        return {'status': fixed['reviewStatus'], 'engine': fixed['engine'],
                'templateKeys': [fixed['templateKey']], 'templateManifest': fixed.get('templateManifest'),
                'selectionSha256': binding, 'productionReady': False,
                'reason': 'Engine route selected by Jerami. Episode cue proof and visual review remain required.'}
    if count == 2 and scene['comparisonKind'] != 'players' and not retired:
        sources = figma_sources(scene, count)
        binding = selection_binding(manifest, ledger)
        choice = manifest.get('engineChoice')
        if choice is not None and (not isinstance(choice, dict) or choice.get('selectionSha256') != binding
                                   or choice.get('reviewer') != 'Jerami' or not str(choice.get('answer') or '').strip()):
            raise ValueError('Saved comparison engine choice is stale; reconcile it against the registered Figma source')
        if (choice or {}).get('engine', 'figma') != 'figma':
            raise ValueError('This comparison reuses its registered Figma source; reconcile the saved engine choice')
        if enforce_engine:
            if manifest.get('motion', {}).get('engine') != 'figma':
                raise ValueError('This comparison must use its registered Figma source')
            figma = manifest.get('figma')
            if figma is not None and not any(
                    figma.get('fileKey') == row['source']['fileKey']
                    and figma.get('sourceComponentId') == row['source']['componentId'] for row in sources):
                raise ValueError('Comparison binding differs from its registered Figma source')
        return {'status': 'reuse-source', 'engine': 'figma',
                'templateKeys': [row['key'] for row in sources], 'selectionSha256': binding,
                'productionReady': False,
                'reason': 'Reuse the registered source. Current episode timing and visual review remain required.'}
    if count != 2:
        return {'status': 'not-required'}
    result = {'laneNumber': 4, 'lane': 'comparison', 'shape': '2-up',
              'label': contract['label'], 'question': contract['question'],
              'choices': contract['engines']}
    binding = selection_binding(manifest, ledger)
    choice = manifest.get('engineChoice')
    if choice is None:
        if require_choice:
            raise ValueError(f"{contract['label']}: {contract['question']} Record Jerami’s answer before building.")
        return {**result, 'status': 'needs-engine-choice', 'selectionSha256': binding}
    if isinstance(choice, dict) and choice.get('engine') in contract.get('retiredEngines', []):
        raise ValueError(f"Unreal is retired for new builds; ask {contract['question']} again for this candidate")
    if (not isinstance(choice, dict) or choice.get('engine') not in contract['engines']
            or choice.get('reviewer') != 'Jerami' or not isinstance(choice.get('answer'), str)
            or not choice['answer'].strip() or choice.get('selectionSha256') != binding):
        raise ValueError(f"engine choice is missing, invalid or stale; ask {contract['question']} again for this candidate")
    engine = choice['engine']
    if enforce_engine and manifest.get('motion', {}).get('engine') != engine:
        raise ValueError('motion.engine differs from Jerami’s saved engine choice; do not substitute engines')
    if engine == 'blender':
        master = blender_master(scene, count, contract)
        if enforce_engine and not master:
            raise ValueError('No approved Blender lane master for this option; review a master before building')
        return {**result, 'status': 'selected' if master else 'reference-gap', 'engine': engine,
                'templateKeys': [master['templateKey']] if master else [], 'productionReady': False,
                'reason': 'Use the approved Blender lane master. Episode timing and visual review remain required.'
                if master else 'No approved Blender lane master for this option; keep the answer and review a master before building.'}
    sources = [row['key'] for row in figma_sources(scene, count, required=False)]
    if not sources:
        if enforce_engine:
            raise ValueError('No registered Figma source for this option; review a source before building')
        return {**result, 'status': 'reference-gap', 'engine': engine, 'templateKeys': [], 'productionReady': False,
                'reason': 'No registered Figma source for this option; review a source before building.'}
    return {**result, 'status': 'selected', 'engine': engine, 'templateKeys': sources}


def approved_variant(row):
    return (row.get('status') == 'approved' and row.get('approvedBy') == 'Jerami'
            and bool(row.get('approvalSource')) and bool(row.get('templateKey')))


def blender_master(scene, count, contract):
    """Return an approved Blender variant for this lane option, or None."""
    return next((row for row in contract.get('blenderVariants', [])
                 if row.get('lane') == scene.get('lane') and scene.get('approvedOption') in row.get('options', [])
                 and row.get('subjects', count) == count
                 and row.get('comparisonKind', scene.get('comparisonKind')) == scene.get('comparisonKind')
                 and approved_variant(row)), None)


def variant_route(manifest, contract, enforce_engine=False):
    """Resolve a scene's named Blender variant. Jev may suggest one; only a saved choice binds it."""
    scene = manifest['scene']
    name = scene.get('blenderVariant')
    if name is None:
        if enforce_engine and manifest.get('motion', {}).get('engine') == 'blender':
            raise ValueError('a Blender build needs a named variant (for example 3B) and its approval')
        return None
    row = next((r for r in contract.get('blenderVariants', []) if r['id'] == name), None)
    if not row or row['lane'] != scene.get('lane'):
        raise ValueError(f'Blender variant {name} is not registered for this lane')
    if enforce_engine and manifest.get('motion', {}).get('engine') != 'blender':
        raise ValueError(f'Blender variant {name} needs motion.engine blender; do not substitute engines')
    ready = approved_variant(row)
    if enforce_engine and not ready:
        raise ValueError(f"Blender variant {name} ({row['name']}) is {row['status']}, not approved for production")
    return {'status': 'selected' if ready else 'reference-gap', 'engine': 'blender', 'variant': name,
            'templateKeys': [row['templateKey']] if ready else [], 'productionReady': False,
            'reason': row.get('statusNote', '')}


def figma_sources(scene, count, required=True):
    from .templates import load_registry
    sources = [row for row in load_registry()['templates']
               if row['lane'] == 'comparison' and row['option'] == scene['approvedOption']
               and row['settings'].get('subjects') == count and row['source'].get('engine', 'figma') == 'figma']
    if not sources and required:
        raise ValueError('No registered Figma source for the selected Comparison option')
    return sources


def record_engine_choice(manifest, ledger, engine, answer):
    contract = routing_contract()
    if engine in contract.get('retiredEngines', []):
        raise ValueError(f"Unreal is retired for new builds; record Jerami’s answer to {contract['question']}")
    if engine not in contract['engines'] or not isinstance(answer, str) or not answer.strip():
        raise ValueError(f"Record the explicit answer to {contract['question']} from Jerami")
    if comparison_subjects(manifest['scene']) != 2:
        raise ValueError('Engine question currently applies only to Lane 4 / Comparison / 2-up')
    route = fixed_option_route(manifest['scene'], contract)
    if route:
        if route['engine'] != engine:
            raise ValueError('Selected option has a fixed engine route; choose a different approved option to change engines')
        return engine_route(manifest, ledger)
    if (manifest['scene'].get('comparisonKind') != 'players'
            and not fixed_option_route(manifest['scene'], contract, 'retiredRoutes')):
        raise ValueError('The engine question applies only to player 2-ups and retired Unreal options; reuse the registered Figma source')
    manifest['engineChoice'] = {'engine': engine, 'reviewer': 'Jerami', 'answer': answer,
                                'selectionSha256': selection_binding(manifest, ledger)}
    return engine_route(manifest, ledger, require_choice=True)


def episode_engine_override(manifest, ledger):
    """A fresh human answer may change one selected episode's fixed engine route."""
    choice = manifest.get('engineChoice') or {}
    if choice.get('scope') != 'episode':
        return None
    scene = manifest['scene']
    contract = routing_contract()
    route = fixed_option_route(scene, contract) or fixed_option_route(scene, contract, 'retiredRoutes')
    if (not route or route['engine'] != 'unreal' or choice.get('engine') != 'figma'
            or choice.get('reviewer') != 'Jerami' or choice.get('episodeId') != scene.get('episodeId')
            or choice.get('previousEngine') != route['engine']
            or not isinstance(choice.get('answer'), str) or not choice['answer'].strip()
            or choice.get('selectionSha256') != selection_binding(manifest, ledger)):
        raise ValueError('episode engine override is missing, invalid or stale')
    from .templates import resolve
    template = resolve(route['templateKey'])
    source = template.get('legacyFigmaSource') or {}
    figma = manifest.get('figma') or {}
    if (not source.get('componentId') or source.get('type') != 'COMPONENT'
            or figma.get('sourceComponentId') != source['componentId']
            or figma.get('fileKey') != source['fileKey']
            or figma.get('templateKey') != template['key']):
        raise ValueError('episode engine override requires the registered preserved Figma source')
    return {'status': 'episode-override', 'engine': 'figma', 'productionReady': False,
            'templateKeys': [template['key']], 'selectionSha256': choice['selectionSha256'],
            'reason': 'Jerami changed this episode engine. Finished visual review and delivery remain pending.'}


def record_episode_engine_choice(manifest, ledger, answer):
    """Record a direct user instruction; never infer it from prior route defaults."""
    contract = routing_contract()
    route = fixed_option_route(manifest['scene'], contract) or fixed_option_route(manifest['scene'], contract, 'retiredRoutes')
    manifest['engineChoice'] = {'engine': 'figma', 'scope': 'episode',
        'episodeId': manifest['scene']['episodeId'], 'previousEngine': route['engine'] if route else None,
        'reviewer': 'Jerami', 'answer': answer, 'selectionSha256': selection_binding(manifest, ledger)}
    return episode_engine_override(manifest, ledger)
