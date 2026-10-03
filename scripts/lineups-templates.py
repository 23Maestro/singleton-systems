#!/usr/bin/env python3
"""Retrieve exact Figma templates, emit read-only fetches, and validate readback."""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from tools.lineups_motion.templates import (
    TemplateError, eligible, load_registry, load_callout_contract,
    resolve, validate_callout, validate_source_identity,
)


def collector_code(page_id, bindings, sources=False):
    contract = load_callout_contract()
    # Runtime values come from node properties; no literal style/readback claims.
    fields = sorted(set(key for role in contract["protected"].values() for key in role))
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
return {fileKey:figma.fileKey,pageId:page.id,sources,callout:callouts[0]};
""".replace("SOURCEIDS", json.dumps([row["source"]["componentId"] for row in load_registry()["templates"]]))
    else:
        code += "return {fileKey:figma.fileKey,pageId:page.id,callouts};"
    return code


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("list")
    get = sub.add_parser("resolve")
    get.add_argument("key")
    fit = sub.add_parser("fit")
    fit.add_argument("candidate", type=Path)
    sub.add_parser("fetch-sources")
    fetch = sub.add_parser("fetch-callouts")
    fetch.add_argument("bindings", type=Path, help="JSON with pageId and exact roleNodeIds for each scene")
    check = sub.add_parser("check")
    check.add_argument("readback", type=Path)
    args = parser.parse_args()
    registry = load_registry()
    if args.command == "list":
        result = registry
    elif args.command == "resolve":
        result = resolve(args.key)
    elif args.command == "fit":
        result = eligible(json.loads(args.candidate.read_text()))
    elif args.command.startswith("fetch-"):
        if args.command == "fetch-sources":
            contract = load_callout_contract()
            page = registry["componentsPageId"]
            bindings = [{"sceneId": "canonical-callout", "rootNodeId": contract["source"]["componentId"], "roleNodeIds": contract["source"]["roleNodeIds"]}]
        else:
            binding_file = json.loads(args.bindings.read_text())
            page, bindings = binding_file["pageId"], binding_file["scenes"]
        result = {"fileKey": registry["fileKey"], "skillNames": "figma-use",
                  "description": "Read exact registered Lineups source properties",
                  "code": collector_code(page, bindings, sources=args.command == "fetch-sources")}
    else:
        readback = json.loads(args.readback.read_text())
        if readback.get("fileKey") != registry["fileKey"]:
            raise TemplateError("readback identifies a different Figma file")
        result = {"status": "passed", "sources": 0, "callouts": 0, "sourceFingerprint": load_callout_contract()["sourceFingerprint"]}
        if "sources" in readback:
            for template in registry["templates"]:
                matches = [row for row in readback["sources"] if row.get("componentId") == template["source"]["componentId"]]
                if len(matches) != 1:
                    raise TemplateError("missing or duplicate canonical source: " + template["key"])
                validate_source_identity(template, matches[0])
                result["sources"] += 1
            validate_callout(readback.get("callout") or {}, source=True)
        for callout in readback.get("callouts", []):
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
