"""Synthetic gate evidence for boundary tests; never import from production code."""
import json
import copy
import subprocess
import sys
from pathlib import Path
from tools.lineups_motion.contract_gate import digest
from tools.lineups_motion.templates import load_registry
import hashlib

ROOT = Path(__file__).resolve().parents[3]


def synthetic_roles(directory, template):
    from PIL import Image, ImageDraw
    pixels = Path(directory) / 'contract-logo.png'
    image = Image.new('RGBA', (240, 240))
    ImageDraw.Draw(image).rectangle((24, 24, 215, 215), fill='white')
    image.save(pixels)
    values = {
        'frame': {'width': 1920, 'height': 1080},
        'card': {'fills': ['#E31837'], 'strokes': ['#FFB81C'], 'strokeWeight': 3,
                 'corners': [18, 0, 18, 0], 'effects': ['soft-shadow']},
        'text': {'characters': 'Kansas City Chiefs', 'fontName': {'family': 'Inter', 'style': 'Bold'},
                 'fontSize': 40, 'lineHeight': 48, 'letterSpacing': 0, 'textAlignHorizontal': 'CENTER'},
        'logo': {'bounds': [0, 0, 240, 240]}, 'photo': {'bounds': [0, 0, 960, 1080]}}
    roles, measured = {}, {}
    for name, kind in template['requiredRoles'].items():
        role = {'kind': kind, 'expected': copy.deepcopy(values[kind])}
        if name in template['requiredTeamRoles']:
            role['teamId'] = 'KC'
        measured[name] = {'nodeId': 'contract-' + name, **copy.deepcopy(values[kind])}
        if kind == 'logo':
            role['artwork'] = {'minOccupancy': .7, 'maxOccupancy': .95, 'centerTolerance': 2, 'alphaThreshold': 16}
            measured[name].update(imageBounds=[0, 0, 240, 240], pixelMapping='axis-aligned',
                pixels={'path': str(pixels), 'sha256': hashlib.sha256(pixels.read_bytes()).hexdigest()})
        roles[name] = role
    return roles, measured


def enroll(directory, manifest):
    if manifest['figma']['fileKey'] != load_registry()['fileKey']:
        return manifest
    template = next((t for t in load_registry()['templates']
                     if t['source'].get('componentId') == manifest['figma']['sourceComponentId']), None)
    if template is None:
        return manifest

    def write(name, value):
        path = Path(directory) / name
        path.write_text(json.dumps(value))
        return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}

    roles, measurements = synthetic_roles(directory, template)
    transcript = Path(manifest['timing']['transcriptPath'])
    spec = {'schemaVersion': 1, 'scene': manifest['scene'], 'templateSha256': digest(template),
            'roles': roles, 'teams': {'KC': {'name': 'Kansas City Chiefs', 'paletteSource': 'fixture'}},
            'workflow': {'order': ['figma', 'unreal'], 'figmaScenes': [manifest['scene']['sceneId']]},
            'cueLock': {'motionSha256': digest(manifest['motion']),
                        'transcript': {'path': str(transcript), 'sha256': hashlib.sha256(transcript.read_bytes()).hexdigest()}}}
    spec['approval'] = {'reviewer': 'Jerami', 'source': 'Synthetic boundary fixture only', 'sha256': digest(spec)}
    gate = {'templateBinding': {'key': template['key'], 'templateSha256': digest(template)},
            'spec': write('contract-spec.json', spec)}
    measured = {'scene': manifest['scene'], 'sourceRevision': manifest['figma']['sourceRevision'],
                'specSha256': gate['spec']['sha256'],
                'roles': measurements}
    gate['measurement'] = write('contract-measured.json', measured)
    manifest['contractGate'] = gate
    return manifest


def delivery_contract(root, media):
    # Exercise the real media and review boundary; these approvals are test data.
    case = ContractEvidence(root)
    case.design()
    template = next(t for t in load_registry()['templates'] if t['key'] == 'stat-breakdown.unreal.player.3')
    case.manifest['scene'].update(episodeId='week8', sceneId='C01', lane=template['lane'], approvedOption=template['option'])
    case.manifest['motion']['engine'] = 'unreal'
    case.manifest['unreal'] = {'source': template['source'], 'sourceRevision': 'revision-1',
                              'templateBinding': {'key': template['key'], 'templateSha256': digest(template),
                                'nativeManifestSha256': hashlib.sha256((Path(__file__).resolve().parents[3] / template['source']['manifestPath']).read_bytes()).hexdigest()}}
    case.spec.update(scene=case.manifest['scene'], templateSha256=digest(template))
    case.use_template_roles(template)
    case.spec['workflow']['figmaScenes'] = []
    case.timing_proof(12)
    case.spec['cueLock']['motionSha256'] = digest(case.manifest['motion'])
    case.save_spec()
    case.measured['specSha256'] = case.manifest['contractGate']['spec']['sha256']
    case.save_measurement()
    case.export(duration=12)
    Path(case.manifest['export']['path']).rename(media)
    case.manifest['export']['path'] = str(media)
    case.review()
    return case.artifact('delivery-manifest.json', case.manifest)


class ContractEvidence:
    """Synthetic files owned by a caller-supplied directory, independent of unittest."""

    def __init__(self, root):
        self.initialize(root)

    def initialize(self, root):
        self.root = Path(root)
        self.template = next(t for t in json.loads((ROOT / 'config/lineups/template-registry.json').read_text())['templates']
                             if t['key'] == 'quick-stat.team-callout')
        self.manifest = {'scene': {'episodeId': 'test-episode', 'sceneId': 'A01', 'lane': 'quick stat',
                                   'approvedOption': 'Team callout'},
                         'motion': {'engine': 'figma'},
                         'figma': {'fileKey': 'o7E24iymIT80MTXGYIogVH', 'sourceComponentId': '1843:1021',
                                   'pageId': 'episode-page', 'rootNodeId': 'scene',
                                   'templateBinding': {'key': 'quick-stat.team-callout',
                                                       'roleNodeIds': {},
                                                       'templateSha256': digest(self.template),
                                                       **({'nativeManifestSha256': hashlib.sha256((ROOT / self.template['source']['manifestPath']).read_bytes()).hexdigest()} if self.template['source'].get('engine') == 'unreal' else {})}}}

    def artifact(self, name, value):
        path = self.root / name
        path.write_text(json.dumps(value))
        return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


    def timing_proof(self, duration=10):
        from tools.lineups_motion.discovery import LANES
        from tools.lineups_motion.timing_evidence import issue_receipt
        self.manifest['schemaVersion'] = 2
        motion = self.manifest['motion']
        motion.update(engineVersion={'figma': 'figma-motion', 'unreal': 'unreal-sequencer'}[motion['engine']],
                      timingValidator='manim')
        for cue in motion['cues']:
            cue.update(elementId='name', triggerType='WORD', triggerText='name',
                       transcriptTimestamp=cue['sceneTime'], action='reveal')
        transcript = {'transcription': [{'text': 'Introduction name', 'offsets': {'from': 0, 'to': 3000},
            'tokens': [{'text': 'Introduction', 'offsets': {'from': 0, 'to': 100}},
                       {'text': ' name', 'offsets': {'from': 1200, 'to': 1300}}]}]}
        self.transcript_ref = self.artifact('transcript.json', transcript)
        scene = self.manifest['scene']
        ledger = {'schemaVersion': 1, 'episodeId': scene['episodeId'],
                  'transcriptSha256': self.transcript_ref['sha256'], 'fullTranscriptReviewed': True,
                  'lanes': [{'lane': lane, 'reviewedSegmentIds': [0], 'findings': [
                      {'outcome': 'candidate', 'candidateId': scene['sceneId'], 'reason': 'Synthetic fixture',
                       'segmentIds': [0], 'start': 0, 'end': 3, 'excerpt': 'Introduction name',
                       'assetSearch': {'status': 'verified', 'evidence': 'Synthetic fixture'}}
                      if lane == scene['lane'] else {'outcome': 'no-fit', 'reason': 'Synthetic fixture'}]}
                      for lane in LANES]}
        self.manifest['discoveryPath'] = self.artifact('discovery.json', ledger)['path']
        self.manifest['timing'] = {'transcriptPath': self.transcript_ref['path'], 'transcriptSource': 'whisper',
            'timestampResolution': 'word', 'verifiedAnchorTimestamp': 0, 'contentEnd': 2,
            'paddedCompositionEnd': duration, 'proofPath': str(self.root / 'timing.json')}
        self.manifest.setdefault('export', {})['dimensions'] = {'width': 1920, 'height': 1080}
        self.artifact('timing.json', issue_receipt(self.root, self.manifest))

    def design(self):
        """Synthetic reviewed red/blue cards; no production palette claims."""
        self.manifest['motion'].update(frameRate={'numerator': 25, 'denominator': 1},
                                       cues=[{'cueId': 'name', 'sceneTime': 1.2, 'duration': .4}])
        self.timing_proof()
        self.spec = {'schemaVersion': 1, 'scene': self.manifest['scene'],
                     'templateSha256': digest(self.template),
                     'cueLock': {'motionSha256': digest(self.manifest['motion']),
                                 'transcript': self.transcript_ref},
                     'workflow': {'order': ['figma', 'unreal'], 'figmaScenes': ['A01']},
                     'roles': {
                         'chiefs-card': {'kind': 'card', 'teamId': 'KC', 'expected': {
                             'fills': ['#E31837'], 'strokes': ['#FFB81C'], 'strokeWeight': 3,
                             'corners': [18, 0, 18, 0], 'effects': ['soft-shadow']}},
                         'bears-card': {'kind': 'card', 'teamId': 'CHI', 'expected': {
                             'fills': ['#0B162A'], 'strokes': ['#C83803'], 'strokeWeight': 3,
                             'corners': [18, 0, 18, 0], 'effects': ['soft-shadow']}},
                         'bears-name': {'kind': 'text', 'teamId': 'CHI', 'expected': {
                             'characters': 'Chicago Bears', 'fontName': {'family': 'Inter', 'style': 'Bold'},
                             'fontSize': 40, 'lineHeight': 48, 'letterSpacing': 0, 'textAlignHorizontal': 'CENTER'}}},
                     'teams': {'KC': {'name': 'Kansas City Chiefs', 'paletteSource': 'fixture'},
                               'CHI': {'name': 'Chicago Bears', 'paletteSource': 'fixture'}}}
        roles, measurements = synthetic_roles(self.root, self.template)
        self.spec['roles'].update(roles)
        self.save_spec()
        self.measured = {'scene': self.manifest['scene'], 'specSha256': self.manifest['contractGate']['spec']['sha256'],
                         'sourceRevision': 'revision-1', 'roles': {
                             key: {'nodeId': key, **copy.deepcopy(row['expected'])} for key, row in self.spec['roles'].items()}}
        self.measured['roles'].update(measurements)
        self.manifest['figma']['sourceRevision'] = 'revision-1'
        self.save_measurement()


    def use_template_roles(self, template):
        roles, measured = synthetic_roles(self.root, template)
        self.spec['roles'].update(roles)
        self.measured['roles'].update(measured)

    def save_spec(self):
        if self.manifest['motion']['engine'] == 'unreal':
            self.spec['nativeManifestSha256'] = self.manifest['unreal']['templateBinding']['nativeManifestSha256']
        self.spec.pop('approval', None)
        self.spec['approval'] = {'reviewer': 'Jerami', 'source': 'synthetic test approval',
                                 'sha256': digest(self.spec)}
        self.manifest.setdefault('contractGate', {})['spec'] = self.artifact('spec.json', self.spec)


    def save_measurement(self):
        self.manifest['contractGate']['measurement'] = self.artifact('measured.json', self.measured)


    def export(self, duration=10):
        video = self.root / 'scene.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=black:s=1920x1080:r=25',
                        '-t', str(duration), '-c:v', 'libx264', '-preset', 'ultrafast', str(video)], check=True)
        frames = []
        for index, at in enumerate([0, 1.2, duration-0.04]):
            data = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(video), '-ss', str(at),
                                            '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', 'pipe:1'])
            path = self.root / f'frame-{index}.png'
            path.write_bytes(data)
            frames.append({'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'time': at})
        self.manifest.setdefault('timing', {})['paddedCompositionEnd'] = duration
        self.manifest['export'] = {'path': str(video), 'fileSha256': hashlib.sha256(video.read_bytes()).hexdigest(),
                                   'motionProof': {'frames': frames}}
        self.timing_proof(duration)


    def review(self):
        from tools.lineups_motion.contract_gate import review_binding
        record = {'bindingSha256': review_binding(self.manifest),
                  'checks': {name: {'status': 'passed', 'note': 'Synthetic fixture reviewed.'} for name in
                             ('headroom', 'callouts', 'accents', 'team-backgrounds', 'logos', 'copy',
                              'template', 'workflow', 'composition')}}
        record['approval'] = {'reviewer': 'Jerami', 'source': 'synthetic test review', 'sha256': digest(record)}
        self.manifest['contractGate']['visualReview'] = self.artifact('visual-review.json', record)




if __name__ == "__main__":
    request = json.load(sys.stdin)
    print(json.dumps(enroll(request["directory"], request["manifest"])))
