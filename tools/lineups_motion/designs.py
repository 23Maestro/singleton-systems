"""Versioned visual contracts. These checks do not certify native renders."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTRY_PATH = ROOT / 'config/lineups/design-registry.json'


class DesignError(ValueError):
    pass


def design_hash(design):
    return hashlib.sha256(json.dumps(design, sort_keys=True, separators=(',', ':'),
                                     allow_nan=False).encode()).hexdigest()


def resolve_design(template, registry=None):
    binding = template['surfaceDesign']
    if binding.get('registryPath') != 'config/lineups/design-registry.json':
        raise DesignError('Use the canonical design registry.')
    registry = registry if registry is not None else json.loads(REGISTRY_PATH.read_text())
    matches = [d for d in registry['designs']
               if d['id'] == binding.get('id') and d['version'] == binding.get('version')]
    if len(matches) != 1:
        raise DesignError('Missing or duplicate surface design version.')
    design = matches[0]
    if design_hash(design) != binding.get('sha256'):
        raise DesignError('Surface design changed. Review a new version before use.')
    if template['key'] not in design['scope']['templateKeys']:
        raise DesignError('Surface design is not approved for this template.')
    return design


def surface_request(template, data, registry=None):
    """Emit the same locked style for any sourced team color and episode."""
    design = resolve_design(template, registry)
    allowed = set(design['protected']['teamInputKeys'] + design['protected']['episodeInputKeys'])
    if not isinstance(data, dict) or set(data) != allowed:
        raise DesignError('Supply only episodeId, teamId, primaryColor and colorSource. Style overrides are locked.')
    if any(not isinstance(value, str) or not value.strip() for value in data.values()):
        raise DesignError('Every episode and team input must be a nonempty string.')
    if not re.fullmatch(r'#[0-9a-fA-F]{6}', data['primaryColor']):
        raise DesignError('primaryColor must be #RRGGBB from the recorded color source.')
    return {'templateKey': template['key'], 'surfaceDesign': dict(template['surfaceDesign']),
            'episodeId': data['episodeId'], 'teamId': data['teamId'],
            'teamInputs': {'primaryColor': data['primaryColor'].upper(), 'colorSource': data['colorSource']},
            'protected': design['protected'], 'implementation': design['implementation'],
            'status': 'design-bound-not-render-proof'}
