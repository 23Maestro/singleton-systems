"""Measured Team callout source, responsive geometry, and binding regressions."""
import copy
import unittest
from tools.lineups_motion.templates import (
    TemplateError, load_team_callout_contract, team_callout_fingerprint,
    validate_callout, validate_manifest_binding, load_registry,
)

class TeamCalloutTests(unittest.TestCase):
    def setUp(self):
        self.contract = load_team_callout_contract()
        self.source = copy.deepcopy(self.contract['measuredSource'])
        self.manifest = {'scene': {'lane':'quick stat','approvedOption':'Team callout'},
            'figma':{'fileKey':load_registry()['fileKey'],'sourceComponentId':'1843:1021',
                'templateBinding':{'key':'quick-stat.team-callout','contractId':self.contract['id'],
                    'sourceFingerprint':team_callout_fingerprint(),
                    'roleNodeIds':{r:'episode-'+r for r in ('wrapper','panel','text')}}}}

    def test_measured_canonical_source_and_bound_manifest_pass(self):
        self.assertEqual(validate_callout(self.source,source=True)['status'],'passed')
        validate_manifest_binding(self.manifest)

    def test_source_hierarchy_font_hug_padding_and_shadow_drift_fail(self):
        mutations = [
            lambda r:r.update(rootNodeId='other-source'),
            lambda r:r['text'].update(parentId=r['subjectPanel']['id']),
            lambda r:r['panel'].update(primaryAxisSizingMode='FIXED'),
            lambda r:r['panel'].update(paddingLeft=47),
            lambda r:r['text'].update(fontSize=64),
            lambda r:r['card']['effects'][0].update(radius=20),
            lambda r:r['card'].update(x=275),
            lambda r:r['text'].update(width=float('nan')),
            lambda r:r['text'].update(id=r['subject']['id']),
        ]
        for mutate in mutations:
            with self.subTest(mutate=mutate):
                r=copy.deepcopy(self.source);mutate(r)
                with self.assertRaises(TemplateError):validate_callout(r,source=True)

    def test_responsive_copy_width_passes_without_changing_fonts(self):
        r=copy.deepcopy(self.source)
        r['text']['width']=700;r['panel']['width']=796
        r['copyStack']['width']=796;r['card']['width']=1036;r['card']['x']=442
        self.assertEqual(validate_callout(r)['status'],'passed')
        r['card']['x']+=1
        with self.assertRaises(TemplateError):validate_callout(r)

    def test_template_option_source_fingerprint_and_node_aliases_fail(self):
        mutations=[
            lambda m:m['figma'].update(sourceComponentId='episode-copy'),
            lambda m:m['scene'].update(approvedOption='Single-frame statement'),
            lambda m:m['figma']['templateBinding'].update(sourceFingerprint='stale'),
            lambda m:m['figma']['templateBinding']['roleNodeIds'].update(text='episode-panel'),
        ]
        for mutate in mutations:
            m=copy.deepcopy(self.manifest);mutate(m)
            with self.assertRaises(TemplateError):validate_manifest_binding(m)

    def test_team_binding_cannot_substitute_legacy_callout_readback(self):
        from tools.lineups_motion.tests.test_templates import measured_callout
        with self.assertRaises(TemplateError):
            validate_callout(measured_callout(),source=True,expected_contract_id=self.contract['id'])

    def test_public_collector_output_passes_check_and_rejects_changed_font(self):
        import importlib.util
        import json
        import subprocess
        import sys
        import tempfile
        from pathlib import Path
        root = Path(__file__).resolve().parents[3]
        spec = importlib.util.spec_from_file_location('template_cli', root / 'scripts/lineups-templates.py')
        cli = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cli)
        roles = ('wrapper', 'card', 'logoBlock', 'copyStack', 'subjectPanel', 'subject', 'panel', 'text')
        binding = {'key': 'quick-stat.team-callout', 'contractId': self.contract['id'],
                   'sceneId': 'fixture', 'rootNodeId': self.source['rootNodeId'],
                   'roleNodeIds': {role: self.source[role]['id'] for role in roles}}
        script = """
let raw='';for await(const chunk of process.stdin)raw+=chunk;
const {source,roles,code,fileKey}=JSON.parse(raw),nodes=new Map();
const page={id:'fixture-page',type:'PAGE'};
const root={id:source.rootNodeId,width:1920,height:1080,parent:page};
nodes.set(page.id,page);nodes.set(root.id,root);
for(const role of roles)nodes.set(source[role].id,{...source[role]});
for(const role of roles){const n=nodes.get(source[role].id);n.parent=nodes.get(n.parentId);}
const figma={fileKey,mixed:Symbol(),getNodeByIdAsync:async id=>nodes.get(id),setCurrentPageAsync:async()=>{}};
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
process.stdout.write(JSON.stringify(await new AsyncFunction('figma',code)(figma)));
"""
        collected = subprocess.run(['node', '--input-type=module', '-e', script],
            input=json.dumps({'source': self.source, 'roles': roles,
                              'code': cli.collector_code('fixture-page', [binding]),
                              'fileKey': load_registry()['fileKey']}), capture_output=True, text=True)
        self.assertEqual(collected.returncode, 0, collected.stderr)
        readback = json.loads(collected.stdout)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'readback.json'
            for changed in (False, True):
                if changed:
                    readback['callouts'][0]['text']['fontSize'] = 64
                path.write_text(json.dumps(readback))
                result = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'),
                                         'check', str(path)], capture_output=True, text=True)
                self.assertEqual(result.returncode == 0, not changed, result.stderr)
