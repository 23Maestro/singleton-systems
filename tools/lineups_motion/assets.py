"""Verify compositing assets without imposing cutouts on photo treatments."""

import hashlib
from pathlib import Path

from .templates import TemplateError


def validate_alpha_assets(root, manifest):
    scene, figma = manifest['scene'], manifest['figma']
    alpha_required = scene['lane'] == 'asset swap' or (
        scene['lane'] == 'comparison' and scene['approvedOption'] != 'Cinematic 2-up'
        and scene.get('comparisonKind') == 'players')
    if not alpha_required:
        return
    from PIL import Image
    photos = [asset for asset in figma['focalAssets'] if asset.get('kind') in ('photo', 'cutout')]
    if not photos:
        raise TemplateError('player compositing requires verified real alpha and a preserved original')
    hashes = set()
    for asset in photos:
        proof = asset.get('alphaProof') or {}
        if proof.get('edgesReviewedBy') != 'Jerami' or not proof.get('sourceId') or not proof.get('imageHash'):
            raise TemplateError('player compositing requires verified real alpha and a preserved original with human edge review')
        for prefix in ('alpha', 'original'):
            path = proof.get(f'{prefix}Path')
            if not path or hashlib.sha256((Path(root) / path).read_bytes()).hexdigest() != proof.get(f'{prefix}Sha256'):
                raise TemplateError('real alpha proof or preserved original is missing or stale')
        if proof['alphaSha256'] in hashes:
            raise TemplateError('one source image may appear only once per episode')
        hashes.add(proof['alphaSha256'])
        with Image.open(Path(root) / proof['alphaPath']) as image:
            if 'A' not in image.getbands() or not (image.getchannel('A').getextrema()[0] < 255
                                                 and image.getchannel('A').getextrema()[1] > 0):
                raise TemplateError('player compositing needs real alpha pixels; opaque or empty images are invalid')
        matches = [entry for entry in figma.get('assetLedger', [])
                   if entry.get('sceneId') == scene['sceneId'] and entry.get('slotId') == asset.get('layoutRole')
                   and entry.get('sourceId') == proof['sourceId'] and entry.get('imageHash') == proof['imageHash']]
        if len(matches) != 1:
            raise TemplateError('real alpha proof must bind the exact episode asset ledger slot')
