import copy
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from datetime import datetime, timezone

from tools.lineups_motion.templates import (
    TemplateError, eligible, load_callout_contract, load_registry, resolve,
    validate_callout, validate_manifest_binding, validate_manifest_readback,
    validate_source_identity,
    load_source_guards, validate_source_guards,
)


def measured_callout(width=598):
    contract = load_callout_contract()
    nodes = copy.deepcopy(contract["protected"])
    for role, node in nodes.items():
        node["id"] = "episode-" + role
    nodes["wrapper"].update(x=0, y=-7, parentId="scene")
    nodes["panel"].update(x=(1920-width-144)/2, y=816, width=width+144, parentId="episode-wrapper")
    nodes["text"].update(x=72, y=56.5, width=width, height=77, parentId="episode-panel")
    return {"rootNodeId": "scene", "rootDimensions": {"width": 1920, "height": 1080}, **nodes}


def bound_manifest():
    contract = load_callout_contract()
    return {"scene": {"lane": "quick stat", "approvedOption": "Single-frame statement"},
            "figma": {"fileKey": load_registry()["fileKey"], "rootNodeId": "scene", "sourceComponentId": "653:184",
                      "templateBinding": {"key": "quick-stat.single", "contractId": contract["id"],
                                          "sourceFingerprint": contract["sourceFingerprint"],
                                          "roleNodeIds": {role: "episode-"+role for role in ("wrapper", "panel", "text")}}}}


class TemplateTests(unittest.TestCase):
    def test_team_callout_reuses_its_own_contract_and_rejects_stale_or_changed_readback(self):
        from tools.lineups_motion.templates import load_team_callout_contract, team_callout_fingerprint
        contract = load_team_callout_contract()
        readback = copy.deepcopy(contract['measuredSource'])
        readback['rootNodeId'] = 'scene'
        roles = ('wrapper', 'card', 'logoBlock', 'copyStack', 'subjectPanel', 'subject', 'panel', 'text')
        renamed = {readback[role]['id']: 'episode-' + role for role in roles}
        renamed[contract['sourceComponentId']] = 'scene'
        for role in roles:
            node = readback[role]
            node.update(id=renamed[node['id']], parentId=renamed[node['parentId']])
        manifest = {'scene': {'lane': 'quick stat', 'approvedOption': 'Team callout'},
                    'figma': {'fileKey': load_registry()['fileKey'], 'rootNodeId': 'scene',
                              'sourceComponentId': contract['sourceComponentId'], 'templateBinding': {
                                  'key': 'quick-stat.team-callout', 'contractId': contract['id'],
                                  'sourceFingerprint': team_callout_fingerprint(),
                                  'roleNodeIds': {role: renamed[contract['measuredSource'][role]['id']]
                                                  for role in ('wrapper', 'panel', 'text')}}}}
        for variant in contract['teamVariants']:
            manifest['figma']['sourceComponentId'] = variant['componentId']
            validate_manifest_binding(manifest)
            validate_manifest_readback(manifest, readback)
        for change in [lambda m,r: m['figma'].update(sourceComponentId='unregistered-source'),
                       lambda m,r: m['figma']['templateBinding'].update(sourceFingerprint='a'*64),
                       lambda m,r: r['panel'].update(primaryAxisSizingMode='FIXED'),
                       lambda m,r: r['text'].update(id='wrong-scene'),
                       lambda m,r: r['copyStack'].update(parentId='unbound-copy-stack'),
                       lambda m,r: r['card'].update(width=2000),
                       lambda m,r: r['text'].update(width=True)]:
            m, r = copy.deepcopy(manifest), copy.deepcopy(readback)
            change(m,r)
            with self.assertRaises(TemplateError):
                validate_manifest_readback(m,r)

    def test_public_source_check_rejects_missing_stale_and_changed_guard_evidence(self):
        root = Path(__file__).resolve().parents[3]
        baseline = json.loads((root / 'config/lineups/canonical-template-verification.json').read_text())
        mutations = [
            ('lock', lambda data: data['sourceGuards'][0]['background'].update(locked=False)),
            ('boolean width', lambda data: data['sourceGuards'][0]['background'].update(width=True)),
            ('image', lambda data: data['sourceGuards'][0]['background']['fills'][0].update(imageHash='different-image')),
            ('motion', lambda data: data['sourceGuards'][0]['background']['manualKeyframeTracks']['SCALE_XY']['keyframes'][0]['value']['value'].update(x=1)),
            ('layer order', lambda data: data['sourceGuards'][0]['root']['childNodeIds'].reverse()),
            ('missing guard', lambda data: data['sourceGuards'].pop()),
            ('duplicate guard', lambda data: data['sourceGuards'].__setitem__(1, data['sourceGuards'][0])),
            ('missing measurement', lambda data: data['sourceGuards'][0]['background'].pop('x')),
            ('malformed guard', lambda data: data['sourceGuards'].__setitem__(0, None)),
            ('stale fingerprint', lambda data: data.update(sourceGuardFingerprint='old-revision')),
        ]
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / 'readback.json'
            file.write_text(json.dumps(baseline))
            passed = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'), 'check', str(file)], capture_output=True, text=True)
            self.assertEqual(passed.returncode, 0, passed.stderr)
            for name, mutate in mutations:
                with self.subTest(name=name):
                    changed = copy.deepcopy(baseline)
                    mutate(changed)
                    file.write_text(json.dumps(changed))
                    failed = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'), 'check', str(file)], capture_output=True, text=True)
                    self.assertEqual(failed.returncode, 1, failed.stdout)

    def test_lock_readback_cannot_report_success_when_evidence_is_failed_or_incomplete(self):
        root = Path(__file__).resolve().parents[3]
        request = json.loads(subprocess.check_output([sys.executable, str(root / 'scripts/lineups-templates.py'), 'lock-source-backgrounds']))
        baseline = json.loads((root / 'config/lineups/canonical-template-verification.json').read_text())
        baseline['mutatedNodeIds'] = ['441:51', '598:216', '594:1164', '1413:610']
        mutations = [
            ('valid', lambda data: None, False),
            ('missing ids', lambda data: data.pop('mutatedNodeIds'), True),
            ('unexpected mutation', lambda data: data['mutatedNodeIds'].append('868:776'), True),
            ('missing source', lambda data: data['sourceGuards'].pop(), True),
            ('failed response', lambda data: data.update(isError=True), True),
        ]
        with tempfile.TemporaryDirectory() as directory:
            for name, mutate, blocked in mutations:
                with self.subTest(name=name):
                    response = copy.deepcopy(baseline)
                    mutate(response)
                    payload = {'cwd': directory, 'hook_event_name': 'PostToolUse',
                               'tool_name': 'mcp__codex_apps__figma_use_figma', 'tool_input': request, 'tool_response': response}
                    result = subprocess.run([sys.executable, str(root / '.codex/hooks/lineups_enforcement.py')],
                                            input=json.dumps(payload), capture_output=True, text=True)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual('"decision": "block"' in result.stdout, blocked, result.stdout)

    def test_lock_runtime_checks_all_sources_before_writing_and_retries_only_remaining_locks(self):
        root = Path(__file__).resolve().parents[3]
        request = json.loads(subprocess.check_output([sys.executable, str(root / 'scripts/lineups-templates.py'), 'lock-source-backgrounds']))
        readback = json.loads((root / 'config/lineups/canonical-template-verification.json').read_text())
        script = r"""
import assert from 'node:assert/strict';
let input='';for await(const part of process.stdin)input+=part;
const {request,readback}=JSON.parse(input),nodes=new Map();
const page={id:readback.pageId,type:'PAGE',parent:null};nodes.set(page.id,page);
const ensure=id=>{if(!nodes.has(id))nodes.set(id,{id,parent:page,type:'COMPONENT_SET'});return nodes.get(id);};
for(const source of readback.sources)Object.assign(ensure(source.componentId),source,{id:source.componentId,parent:ensure(source.parentId)});
for(const role of ['wrapper','panel','text']){const measured=readback.callout[role];Object.assign(ensure(measured.id),measured,{parent:ensure(measured.parentId)});}
for(const row of readback.sourceGuards){
 const root=Object.assign(ensure(row.sourceComponentId),row.root,{type:'COMPONENT',children:row.root.childNodeIds.map(ensure)});
 const background=Object.assign(ensure(row.background.id),row.background,{parent:root,locked:false});
 for(const animation of Object.values(background.animations))for(const track of animation.tracks)track.nativeHandle=()=>{};
}
const figma={fileKey:readback.fileKey,mixed:Symbol(),getNodeByIdAsync:async id=>nodes.get(id),setCurrentPageAsync:async()=>{}};
const run=new (Object.getPrototypeOf(async function(){}).constructor)('figma',request.code);
assert.deepEqual((await run(figma)).mutatedNodeIds,['441:51','598:216','594:1164','1413:610']);
assert.deepEqual((await run(figma)).mutatedNodeIds,[]);
nodes.get('441:51').locked=false;nodes.get('598:216').locked=false;
assert.deepEqual((await run(figma)).mutatedNodeIds,['441:51','598:216']);
for(const row of readback.sourceGuards)nodes.get(row.background.id).locked=false;
nodes.get('1413:610').width=50;
await assert.rejects(run(figma),/Changed source guard/);
assert.ok(readback.sourceGuards.every(row=>nodes.get(row.background.id).locked===false));
process.stdout.write('source-lock recovery passed');
"""
        result = subprocess.run(['node', '--input-type=module', '-e', script],
                                input=json.dumps({'request': request, 'readback': readback}), capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, 'source-lock recovery passed')

    def test_changed_source_guard_tolerance_invalidates_the_evidence_revision(self):
        root = Path(__file__).resolve().parents[3]
        readback = json.loads((root / 'config/lineups/canonical-template-verification.json').read_text())
        contract = load_source_guards()
        contract['tolerance'] = 1000
        with self.assertRaisesRegex(TemplateError, 'fingerprint'):
            validate_source_guards(readback, contract)

    def test_live_check_accepts_fresh_source_evidence_and_rejects_old_observations(self):
        root = Path(__file__).resolve().parents[3]
        observed = json.loads((root / 'config/lineups/canonical-template-verification.json').read_text())
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / 'observed.json'
            for timestamp, expected in [(datetime.now(timezone.utc).isoformat(), 0), ('2000-01-01T00:00:00Z', 1)]:
                observed['checkedAt'] = timestamp
                file.write_text(json.dumps(observed))
                result = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'), 'check', str(file), '--live'],
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode, expected, result.stderr)
                if expected:
                    self.assertIn('fresh', result.stderr)

    def test_source_lock_plan_is_allowed_but_extra_mutation_is_denied(self):
        root = Path(__file__).resolve().parents[3]
        request = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'), 'lock-source-backgrounds'],
                                 capture_output=True, text=True)
        self.assertEqual(request.returncode, 0, request.stderr)
        tool_input = json.loads(request.stdout)
        with tempfile.TemporaryDirectory() as directory:
            for extra, allowed in [('', True), ('\nfigma.createRectangle();', False)]:
                payload = {'cwd': directory, 'hook_event_name': 'PreToolUse',
                           'tool_name': 'mcp__codex_apps__figma_use_figma',
                           'tool_input': {**tool_input, 'code': tool_input['code'] + extra}}
                result = subprocess.run([sys.executable, str(root / '.codex/hooks/lineups_enforcement.py')],
                                        input=json.dumps(payload), capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual('permissionDecision' in result.stdout, not allowed, result.stdout)

    def test_registered_source_measurement_is_allowed_without_episode_activation(self):
        root = Path(__file__).resolve().parents[3]
        request = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'), 'fetch-sources'],
                                 capture_output=True, text=True, check=True)
        with tempfile.TemporaryDirectory() as directory:
            payload = {'cwd': directory, 'hook_event_name': 'PreToolUse',
                       'tool_name': 'mcp__codex_apps__figma_use_figma', 'tool_input': json.loads(request.stdout)}
            result = subprocess.run([sys.executable, str(root / '.codex/hooks/lineups_enforcement.py')],
                                    input=json.dumps(payload), capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), '', result.stdout)

    def test_changed_source_background_cannot_pass_the_public_check(self):
        root = Path(__file__).resolve().parents[3]
        readback = json.loads((root / 'config/lineups/canonical-template-verification.json').read_text())
        readback['sourceGuards'][0]['background']['width'] = 2040
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / 'readback.json'
            file.write_text(json.dumps(readback))
            result = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'), 'check', str(file)],
                                    capture_output=True, text=True)
        self.assertEqual(result.returncode, 1)
        self.assertIn('background.width', result.stderr)

    def test_registry_has_unique_exact_sources_and_seven_lanes(self):
        rows = load_registry()["templates"]
        self.assertEqual(len(set(row["key"] for row in rows)), len(rows))
        self.assertEqual(len({row['source'].get('componentId', row['source'].get('mapPath')) for row in rows}), len(rows))
        self.assertEqual(len(set(row["lane"] for row in rows)), 7)
        for row in rows:
            self.assertEqual(row["source"]["type"], "UNREAL_SCENE" if row['source'].get('engine') == 'unreal' else "COMPONENT")
            self.assertEqual((row["source"]["width"], row["source"]["height"]), (1920, 1080))

    def test_unreal_options_reject_the_preserved_figma_identity(self):
        for key in ('comparison.team-matchup.2', 'comparison.logo-stat-cards.2'):
            template = resolve(key)
            validate_source_identity(template, template['source'])
            with self.assertRaisesRegex(TemplateError, 'source.engine'):
                validate_source_identity(template, template['legacyFigmaSource'])
            self.assertEqual(template['reviewStatus'], 'pending-unreal-review')

    def test_display_rename_does_not_break_retrieval(self):
        template = resolve("quick-stat.single")
        readback = {**template["source"], "name": "Operator renamed this"}
        validate_source_identity(template, readback)
        readback["componentId"] = "episode-example"
        with self.assertRaisesRegex(TemplateError, "componentId"):
            validate_source_identity(template, readback)
        with self.assertRaises(TemplateError):
            resolve("Justin Herbert")

    def test_source_on_episode_page_is_rejected(self):
        template = resolve("comparison.simple.2")
        with self.assertRaisesRegex(TemplateError, "pageId"):
            validate_source_identity(template, {**template["source"], "pageId": "episode"})

    def test_copy_can_hug_without_changing_design(self):
        for width in (220, 598, 1016, 1541):
            validate_callout(measured_callout(width))
        validate_manifest_readback(bound_manifest(), measured_callout())

    def test_historical_font_and_hug_height_regressions_fail(self):
        mutations = [
            ("panel", "height", 90), ("panel", "counterAxisSizingMode", "AUTO"),
            ("panel", "paddingLeft", 16), ("panel", "y", 700),
            ("text", "fontName", {"family": "Anton", "style": "Regular"}),
            ("text", "fontSize", 60), ("text", "y", 0),
            ("panel", "topRightRadius", 0), ("panel", "strokes", []),
        ]
        for role, key, value in mutations:
            with self.subTest(role=role, key=key):
                readback = measured_callout()
                readback[role][key] = value
                with self.assertRaises(TemplateError):
                    validate_callout(readback)

    def test_overflow_multiline_and_wrong_node_binding_fail(self):
        with self.assertRaisesRegex(TemplateError, "safe width"):
            validate_callout(measured_callout(1800))
        readback = measured_callout()
        readback["text"].update(height=154, y=18)
        with self.assertRaisesRegex(TemplateError, "1 line"):
            validate_callout(readback)
        readback = measured_callout()
        readback["text"]["id"] = "wrong"
        with self.assertRaisesRegex(TemplateError, "different episode node"):
            validate_manifest_readback(bound_manifest(), readback)

    def test_missing_or_stale_fingerprint_fails(self):
        manifest = bound_manifest()
        del manifest["figma"]["templateBinding"]
        with self.assertRaises(TemplateError):
            validate_manifest_binding(manifest)
        manifest = bound_manifest()
        manifest["figma"]["templateBinding"]["sourceFingerprint"] = "old"
        with self.assertRaisesRegex(TemplateError, "fingerprint"):
            validate_manifest_binding(manifest)

    def test_long_copy_fit_must_prove_overflow_without_changing_panel(self):
        readback = measured_callout(1600)
        readback["text"].update(fontSize=60, height=72, y=59)
        override = {"fontSize": 60, "reason": "long-copy-safe-width", "textWidthAt64": 1600*64/60, "evidence": "Measured copy exceeds safe width at 64 px"}
        validate_callout(readback, fit_override=override)
        override["textWidthAt64"] = 1000
        with self.assertRaisesRegex(TemplateError, "fit override"):
            validate_callout(readback, fit_override=override)

    def test_uncertain_purpose_requires_review(self):
        self.assertEqual(eligible({"evidence": "Mahomes played"})["status"], "needs-review")
        self.assertEqual(eligible({"purpose": "comparison", "evidence": "Both 3-0", "subjects": 2, "rows": 1})["status"], "needs-review")

    def test_team_matchup_uses_logos_without_player_alpha(self):
        result = eligible({"purpose": "comparison", "comparisonKind": "teams", "subjects": 2, "rows": 1, "evidence": "Both teams 3-0"})
        self.assertEqual(result["templates"], ["comparison.simple.2"])

    def test_registered_logo_sources_fit_without_allowing_player_substitution(self):
        for option, subjects, rows, key in [
            ('Logo stat cards', 2, 1, 'comparison.logo-stat-cards.2'),
            ('Logo row', 3, 1, 'comparison.logo-row.3'),
            ('Team matchup', 2, 0, 'comparison.team-matchup.2'),
        ]:
            with self.subTest(option=option):
                candidate = {'purpose': 'comparison', 'comparisonKind': 'teams',
                             'assetTreatment': 'logos', 'option': option,
                             'subjects': subjects, 'rows': rows,
                             'evidence': 'Reviewed shared team metric or game result'}
                fit = eligible(candidate)
                self.assertEqual(fit['templates'], [key])
                self.assertEqual(fit['status'], 'needs-review')
                self.assertIn('visual review', fit['reason'])
                candidate.update(comparisonKind='players', realAlpha=True)
                self.assertEqual(eligible(candidate)['templates'], [])

    def test_grouped_stats_and_logo_statements_require_their_actual_structure(self):
        grouped = {'purpose': 'stats', 'stats': 7, 'groupSizes': [3, 2, 2],
                   'layout': 'grouped-stats', 'evidence': 'Three Jaguars defense topics'}
        self.assertEqual(eligible(grouped)['templates'], ['stat-breakdown.grouped-stats.3-2-2'])
        grouped['layout'] = 'grouped-logo-facts'
        self.assertEqual(eligible(grouped)['templates'], ['stat-breakdown.grouped-logos.3-2-2'])
        grouped['groupSizes'] = [2, 2, 3]
        self.assertEqual(eligible(grouped)['templates'], ['stat-breakdown.grouped-logos.2-2-3'])
        grouped['groupSizes'] = [2, 3, 2]
        self.assertEqual(eligible(grouped)['status'], 'reference-gap')
        statement = {'purpose': 'statement', 'photos': 0, 'logos': 1,
                     'evidence': 'One team statement'}
        self.assertEqual(eligible(statement)['templates'], ['quick-stat.logo'])
        statement['logos'] = 2
        self.assertEqual(eligible(statement)['status'], 'reference-gap')

    def test_logo_statement_paint_uses_the_selected_team_colors_without_presets(self):
        root = Path(__file__).resolve().parents[3]
        with tempfile.TemporaryDirectory() as directory:
            candidate = Path(directory) / 'candidate.json'
            for team, primary, secondary, first, last in [
                ('team-a', '#112233', '#AABBCC',
                 {'r': 17/255, 'g': 34/255, 'b': 51/255, 'a': 1},
                 {'r': 170/255, 'g': 187/255, 'b': 204/255, 'a': 1}),
                ('team-b', '#FF6600', '#101010',
                 {'r': 1, 'g': 102/255, 'b': 0, 'a': 1},
                 {'r': 16/255, 'g': 16/255, 'b': 16/255, 'a': 1}),
            ]:
                candidate.write_text(json.dumps({'teamId': team, 'teamColors': {
                    'primary': primary, 'secondary': secondary, 'source': 'approved candidate metadata'}}))
                result = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'),
                                         'logo-statement-paint', str(candidate)], capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                paint = json.loads(result.stdout)
                self.assertEqual(paint['teamId'], team)
                stops = paint['backgroundFill']['gradientStops']
                self.assertEqual(stops[0]['color'], first)
                self.assertEqual(stops[-1]['color'], last)
            for colors in [{}, {'primary': '#112233', 'secondary': '#112233', 'source': 'proof'},
                           {'primary': 'purple', 'secondary': 'gold', 'source': 'proof'}]:
                candidate.write_text(json.dumps({'teamId': 'team-a', 'teamColors': colors}))
                result = subprocess.run([sys.executable, str(root / 'scripts/lineups-templates.py'),
                                         'logo-statement-paint', str(candidate)], capture_output=True, text=True)
                self.assertEqual(result.returncode, 1)

    def test_logo_pair_does_not_inherit_player_alpha_requirements(self):
        candidate = {'purpose': 'cast', 'subjects': 2, 'option': 'Logo pair',
                     'assetTreatment': 'logos', 'evidence': 'Two conference logos'}
        self.assertEqual(eligible(candidate)['templates'], ['asset-swap.logo-pair'])
        candidate['assetTreatment'] = 'players'
        self.assertEqual(eligible(candidate)['templates'], [])

    def test_player_compositing_and_full_photo_comparison_have_distinct_asset_policies(self):
        candidate = {"purpose": "comparison", "comparisonKind": "players", "subjects": 2, "rows": 1, "evidence": "Direct player comparison"}
        self.assertEqual(eligible(candidate)["status"], "asset-blocked")
        candidate["realAlpha"] = True
        self.assertEqual(eligible(candidate)["templates"], ["comparison.simple.2"])
        candidate["option"] = "Cinematic 2-up"
        self.assertEqual(eligible(candidate)["status"], "asset-blocked")
        candidate.update(assetTreatment="full-photo", originalBackgrounds=True, openingTogether=True, titlePosition="top-left")
        candidate.pop("realAlpha")
        self.assertEqual(eligible(candidate)["templates"], ["comparison.cinematic.2"])
        candidate["openingTogether"] = False
        self.assertEqual(eligible(candidate)["status"], "asset-blocked")

    def test_unregistered_capacity_fails_without_fallback(self):
        result = eligible({"purpose": "stats", "stats": 5, "evidence": "5 values"})
        self.assertEqual(result["status"], "reference-gap")
        self.assertEqual(eligible({"purpose": "cast", "subjects": 3, "realAlpha": True, "evidence": "3 players"})["status"], "reference-gap")
        self.assertEqual(eligible({"purpose": "cast", "subjects": 2, "realAlpha": True, "evidence": "2 players"})["templates"], ["asset-swap.standard"])

    def test_collector_preserves_page_type_and_reads_actual_properties(self):
        from pathlib import Path
        script = Path(__file__).resolve().parents[3] / "scripts/lineups-templates.py"
        spec = importlib.util.spec_from_file_location("template_cli", script)
        cli = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cli)
        code = cli.collector_code("428:27", [], sources=True)
        self.assertIn("page.type!=='PAGE'", code)
        self.assertIn("owner.type!=='PAGE'", code)
        self.assertIn("out[key]=n[key]", code)
        self.assertNotIn("__PAGE_ID__", code)
        result = eligible({"purpose": "timeline", "periods": 3, "option": "Simple board", "evidence": "3 seasons"})
        self.assertEqual(result["status"], "reference-gap")


if __name__ == "__main__":
    unittest.main()
