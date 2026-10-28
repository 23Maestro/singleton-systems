#!/usr/bin/env python3
"""Retrieve exact Figma templates, emit read-only fetches, and validate readback."""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from tools.lineups_motion.templates import (
    TemplateError, eligible, load_registry, load_callout_contract, load_team_callout_contract,
    resolve, validate_callout, validate_team_callout, validate_source_identity, load_source_guards, validate_source_guards,
)

from tools.lineups_motion.discovery import validate_scene_discovery
from tools.lineups_motion.engine_choice import engine_route, record_engine_choice


def collector_code(page_id, bindings, sources=False, lock_backgrounds=False):
    contract = load_callout_contract()
    # Runtime values come from node properties; no literal style/readback claims.
    fields = sorted({key for c in (contract, load_team_callout_contract()) for role in c["protected"].values() for key in role})
    fields += ["x", "y", "width", "height"]
    code = """const page=await figma.getNodeByIdAsync(__PAGE_ID__);
if(!page||page.type!=='PAGE')throw new Error('Missing registered page');
await figma.setCurrentPageAsync(page);
function measure(n){
 if(!n)throw new Error('Missing bound callout node');
 const out={id:n.id,parentId:n.parent.id};
 for(const key of __FIELDS__)if(n[key]!==undefined&&n[key]!==figma.mixed)out[key]=n[key];
 return out;
}
const callouts=[];
for(const binding of __BINDINGS__){
 const roles={};
 for(const [role,id]of Object.entries(binding.roleNodeIds))roles[role]=measure(await figma.getNodeByIdAsync(id));
 const root=binding.rootNodeId?await figma.getNodeByIdAsync(binding.rootNodeId):await figma.getNodeByIdAsync(roles.wrapper.parentId);
 if(!root)throw new Error('Missing bound scene root');
 let owner=root; while(owner&&owner.type!=='PAGE')owner=owner.parent;
 if(owner?.id!==page.id)throw new Error('Bound root is on another page');
 callouts.push({sceneId:binding.sceneId,rootNodeId:root.id,rootDimensions:{width:root.width,height:root.height},...roles});
}
"""
    code = code.replace("__PAGE_ID__", json.dumps(page_id)).replace("__FIELDS__", json.dumps(fields)).replace("__BINDINGS__", json.dumps(bindings))
    if sources:
        code += """const sources=[];
for(const id of SOURCEIDS){
 const n=await figma.getNodeByIdAsync(id);
 if(!n)throw new Error('Missing registered source '+id);
 let owner=n;while(owner&&owner.type!=='PAGE')owner=owner.parent;
 sources.push({fileKey:figma.fileKey,pageId:owner?.id,componentId:n.id,type:n.type,parentId:n.parent.id,width:n.width,height:n.height,name:n.name,variantProperties:n.variantProperties??null});
}
""".replace("SOURCEIDS", json.dumps([row["source"]["componentId"] for row in load_registry()["templates"] if row["source"].get("engine", "figma") == "figma"]))
        guards = load_source_guards()
        code += """const sourceGuards=[];
const guardBindings=GUARDBINDINGS;
for(const binding of guardBindings){
 const root=await figma.getNodeByIdAsync(binding.sourceComponentId);
 const background=await figma.getNodeByIdAsync(binding.protected.background.id);
 if(!root||root.type!=='COMPONENT'||!background||background.parent.id!==root.id)throw new Error('Missing guarded source background');
 let owner=root;while(owner&&owner.type!=='PAGE')owner=owner.parent;
 if(owner?.id!==page.id)throw new Error('Guarded source is on another page');
 const measuredRoot={id:root.id,width:root.width,height:root.height,clipsContent:root.clipsContent,childNodeIds:root.children.map(n=>n.id)};
 const measuredBackground={};
 for(const key of Object.keys(binding.protected.background)){
  if(key==='parentId')measuredBackground[key]=background.parent.id;
  else measuredBackground[key]=JSON.parse(JSON.stringify(background[key]));
 }
 sourceGuards.push({sourceComponentId:root.id,root:measuredRoot,background:measuredBackground});
}
""".replace('GUARDBINDINGS', json.dumps(guards['sources']))
        if lock_backgrounds:
            # Check every protected value before the first write. Retrying only locks still-unlocked nodes.
            code += """function same(actual,expected,path){
 if(typeof expected==='number'){if(typeof actual!=='number'||!Number.isFinite(actual)||Math.abs(actual-expected)>GUARDTOLERANCE)throw new Error('Changed source guard '+path);return;}
 if(expected!==null&&typeof expected==='object'){
  if(actual===null||typeof actual!=='object'||Array.isArray(actual)!==Array.isArray(expected)||JSON.stringify(Object.keys(actual).sort())!==JSON.stringify(Object.keys(expected).sort()))throw new Error('Malformed source guard '+path);
  for(const key of Object.keys(expected))same(actual[key],expected[key],path+'.'+key);return;
 }
 if(actual!==expected)throw new Error('Changed source guard '+path);
}
for(const binding of guardBindings){
 const measured=sourceGuards.find(n=>n.sourceComponentId===binding.sourceComponentId);
 same(measured.root,binding.protected.root,'root');
 if(typeof measured.background.locked!=='boolean')throw new Error('Missing live lock state');
 same({...measured.background,locked:true},binding.protected.background,'background');
}
const mutatedNodeIds=[];
for(const measured of sourceGuards){
 const background=await figma.getNodeByIdAsync(measured.background.id);
 if(!background.locked){background.locked=true;mutatedNodeIds.push(background.id);}
 measured.background.locked=background.locked;
}
""".replace('GUARDTOLERANCE', json.dumps(guards['tolerance']))
        code += "return {checkedAt:new Date().toISOString(),fileKey:figma.fileKey,pageId:page.id,sources,callout:callouts[0],sourceGuards,sourceGuardFingerprint:GUARDFINGERPRINT".replace('GUARDFINGERPRINT', json.dumps(guards['sourceFingerprint']))
        code += ',mutatedNodeIds};' if lock_backgrounds else '};'
    else:
        code += "return {fileKey:figma.fileKey,pageId:page.id,callouts};"
    return code


def source_lock_input():
    registry, callout = load_registry(), load_callout_contract()
    bindings = [{'sceneId': 'canonical-callout', 'rootNodeId': callout['source']['componentId'],
                 'roleNodeIds': callout['source']['roleNodeIds']}]
    return {'fileKey': registry['fileKey'], 'skillNames': 'figma-use,figma-use-motion,singleton-figma-system,file-hygiene,layer-cleanup',
            'description': '23M-232: lock only the four reviewed Components backgrounds; preserve geometry and native motion',
            'code': collector_code(registry['componentsPageId'], bindings, sources=True, lock_backgrounds=True)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("list")
    get = sub.add_parser("resolve")
    get.add_argument("key")
    fit = sub.add_parser("fit")
    fit.add_argument("candidate", type=Path)
    engine = sub.add_parser('engine-choice', help='Inspect the route or save Jerami’s player engine answer')
    engine.add_argument('manifest', type=Path)
    engine.add_argument('--root', type=Path, default=ROOT)
    engine.add_argument('--engine', choices=['figma', 'unreal'])
    engine.add_argument('--answer')
    sub.add_parser("fetch-sources")
    sub.add_parser('lock-source-backgrounds')
    fetch = sub.add_parser("fetch-callouts")
    fetch.add_argument("bindings", type=Path, help="JSON with pageId and exact roleNodeIds for each scene")
    check = sub.add_parser("check")
    check.add_argument("readback", type=Path)
    check.add_argument('--live', action='store_true', help='Require observations from the last hour; saved fixtures cannot certify live state')
    args = parser.parse_args()
    registry = load_registry()
    if args.command == "list":
        result = registry
    elif args.command == "resolve":
        result = resolve(args.key)
    elif args.command == "fit":
        result = eligible(json.loads(args.candidate.read_text()))
    elif args.command == 'engine-choice':
        manifest = json.loads(args.manifest.read_text())
        ledger = validate_scene_discovery(args.root, manifest, require_engine_choice=False)
        if args.engine or args.answer:
            result = record_engine_choice(manifest, ledger, args.engine, args.answer)
            args.manifest.write_text(json.dumps(manifest, indent=2) + '\n')
        else:
            result = engine_route(manifest, ledger)
    elif args.command == 'lock-source-backgrounds':
        result = source_lock_input()
    elif args.command.startswith("fetch-"):
        if args.command == "fetch-sources":
            contract = load_callout_contract()
            page = registry["componentsPageId"]
            bindings = [{"sceneId": "canonical-callout", "rootNodeId": contract["source"]["componentId"], "roleNodeIds": contract["source"]["roleNodeIds"]}]
        else:
            binding_file = json.loads(args.bindings.read_text())
            page, bindings = binding_file["pageId"], binding_file["scenes"]
        result = {"fileKey": registry["fileKey"], "skillNames": "figma-use,figma-use-motion" if args.command == 'fetch-sources' else 'figma-use',
                  "description": "Read exact registered Lineups source properties",
                  "code": collector_code(page, bindings, sources=args.command == "fetch-sources")}
    else:
        readback = json.loads(args.readback.read_text())
        if args.live:
            try:
                observed = datetime.fromisoformat(readback['checkedAt'].replace('Z', '+00:00'))
                age = (datetime.now(timezone.utc) - observed).total_seconds()
            except (KeyError, TypeError, ValueError, AttributeError):
                raise TemplateError('live source observations require a fresh checkedAt timestamp')
            if not -60 <= age <= 3600:
                raise TemplateError('live source observations must be fresh within one hour')
        if readback.get("fileKey") != registry["fileKey"]:
            raise TemplateError("readback identifies a different Figma file")
        result = {"status": "passed", "evidenceMode": "live" if args.live else "saved-readback", "sources": 0, "callouts": 0, "sourceFingerprint": load_callout_contract()["sourceFingerprint"]}
        if "sources" in readback:
            result["pendingUnrealSources"] = []
            for template in registry["templates"]:
                if template["source"].get("engine") == "unreal":
                    result["pendingUnrealSources"].append(template["key"])
                    continue
                matches = [row for row in readback["sources"] if row.get("componentId") == template["source"]["componentId"]]
                if len(matches) != 1:
                    raise TemplateError("missing or duplicate canonical source: " + template["key"])
                validate_source_identity(template, matches[0])
                result["sources"] += 1
            validate_callout(readback.get("callout") or {}, source=True)
            result.update(validate_source_guards(readback))
        for callout in readback.get("callouts", []):
            if callout.get('key') == 'quick-stat.team-callout':
                validate_team_callout(callout)
            else:
                validate_callout(callout, fit_override=callout.get("fitOverride"))
            result["callouts"] += 1
        if result["sources"] == 0 and result["callouts"] == 0:
            raise TemplateError("readback contains no measurable source or callout")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (TemplateError, KeyError, TypeError, ValueError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
