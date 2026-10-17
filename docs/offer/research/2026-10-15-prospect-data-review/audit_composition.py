"""Read-only file-role census. Counts describe contents, not legal ownership."""
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import io
import json
import os
import re
import sqlite3
import subprocess
import zipfile

BASE = Path(__file__).resolve().parent
REPO = Path(json.loads((BASE / 'review.source.json').read_text())['source_repo'])
PRE_DEMO = '2bb5a2328ca853358f5d2c55ed0c39470f0ba89c'
BUILD_PARTS = {'.build', '.raycast-swift-build', 'node_modules', '.venv', 'venv',
               '__pycache__', '.next', '.git', '.pytest_cache'}

def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO)

def excluded(path):
    return bool(set(Path(path).parts) & BUILD_PARTS)

def role(path):
    """Classify observable file roles; do not infer copyright from a suffix."""
    p = path.lower()
    if excluded(path):
        return 'build_dependency'
    if (Path(p).name.startswith('.env') and not p.endswith(('.example','.template'))) or '/.vercel/' in '/' + p:
        return 'access_configuration'
    if ('package-lock.json' in p or 'package.resolved' in p or
        '/generated/' in p or '/.likec4/' in p or
        p.endswith(('raycast-env.d.ts', 'next-env.d.ts', '.wasm')) or
        'compiled_raycast_swift/' in p or
        p.endswith('/visual-maps/likec4-views.js') or p.endswith('.tsbuildinfo') or '/build/' in p):
        return 'generated_vendor'
    if p.endswith(('.zip', '.gz', '.tar')):
        return 'archive_container'
    if p.endswith('jeramisingleton-contact-card.vcf'):
        return 'operator_record_artifact'
    if (p.endswith(('.csv', '.vcf', '.har', '.har.txt', '.har.md')) or
        'progress.db' in p or 'video-progress-cache.sqlite' in p or
        'inbox_debug.html' in p or 'videomailbox_debug.html' in p or
        '/prospect-call-tracker/data-contract.json' in p or
        ('/prospect-call-tracker/weekly-results/' in p and not p.endswith('/index.json')) or
        '.playwright-mcp/page-' in p or
        p.endswith('2026-03-06_inbox-review.md') or
        p.endswith(('client-message-inbox-export.json', '10x-communications-evidence-audit.json',
                    'call_log_backfill.sql', 'prospect-id-owners.json'))):
        return 'company_record_artifact'
    if (p.endswith('playwright_state.json') or '/supabase/.temp/' in '/' + p or
        p in {'.env', '.overmind.env'} or p.endswith('/credentials.md')):
        return 'access_configuration'
    if p.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg')):
        return 'visual_asset'
    if ('craft-api-bundle.md' in p or p.endswith('craft-api-bundle.md') or
        p.endswith(('raycast-tool-api.md', 'tool _ raycast api.md'))):
        return 'vendor_reference'
    if p.endswith(('.log', '.ds_store')) or p.endswith('icon\r'):
        return 'runtime_or_os'
    return 'implementation_support'

def tree(ref):
    rows=[]
    for part in git('ls-tree', '-r', '-l', '-z', ref).split(b'\0'):
        if not part: continue
        meta, path = part.split(b'\t', 1)
        mode, kind, sha, size = meta.decode().split()
        path=path.decode()
        rows.append({'path':path, 'blob':sha, 'bytes':int(size) if size!='-' else 0,
                     'kind':kind,'role':role(path)})
    return rows

head=tree('HEAD')
pre=tree(PRE_DEMO)
versions=defaultdict(set)
raw=git('log','--all','--raw','--format=','--no-renames','--no-abbrev','-z').split(b'\0')
i=0
while i<len(raw):
    header=raw[i].strip(); i+=1
    if not header: continue
    if not header.startswith(b':'): raise ValueError('Unexpected Git diff header')
    fields=header.decode().split()
    path=raw[i].decode();i+=1
    for sha in fields[2:4]:
        if sha!='0'*40: versions[path].add(sha)
for item in head+pre: versions[item['path']].add(item['blob'])

all_shas=sorted({s for p,vs in versions.items() if not excluded(p) for s in vs})
checked=subprocess.check_output(['git','cat-file','--batch-check'],cwd=REPO,
    input=('\n'.join(all_shas)+'\n').encode()).decode().splitlines()
sizes={line.split()[0]:int(line.split()[2]) for line in checked if line.split()[1]=='blob'}
sha_paths=defaultdict(list)
for path, shas in versions.items():
    if not excluded(path):
        for sha in shas: sha_paths[sha].append(path)

# Identifiers remain in memory. The saved audit contains flags and counts only.
known_ids=set(); known_names=set();known_emails=set()
db_receipts=[]
db_blobs={s for p,ss in versions.items() if role(p)=='company_record_artifact' and
          ('progress.db' in p or 'video-progress-cache.sqlite' in p) for s in ss}
proc=subprocess.Popen(['git','cat-file','--batch'],cwd=REPO,stdin=subprocess.PIPE,stdout=subprocess.PIPE)

def read_blob(sha):
    proc.stdin.write((sha+'\n').encode());proc.stdin.flush()
    header=proc.stdout.readline().decode().split()
    if header[1]!='blob':raise ValueError('Expected blob')
    size=int(header[2]);data=proc.stdout.read(size);assert proc.stdout.read(1)==b'\n'
    return data

def inspect_db(data, ref, seed=False):
    if not data.startswith(b'SQLite format 3\0'): return
    db=sqlite3.connect(':memory:');db.deserialize(data)
    receipt={'reference':ref,'tables':{}}
    for (table,) in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"):
        quoted='"'+table.replace('"','""')+'"'
        columns=[x[1] for x in db.execute('PRAGMA table_info('+quoted+')')]
        rows=db.execute('SELECT * FROM '+quoted).fetchall()
        receipt['tables'][table]=len(rows)
        for row in rows:
            for col,value in zip(columns,row):
                if value is None:continue
                text=str(value).strip();c=col.lower()
                if seed:
                    if re.search(r'(^id$|_id$|contactid|athleteid|athletemainid)',c) and re.fullmatch(r'\d{5,}',text):known_ids.add(text)
                    if 'name' in c and len(text)>8 and ' ' in text and 'singleton' not in text.lower():known_names.add(text.lower())
                    if 'email' in c and '@' in text:known_emails.add(text.lower())
    db.close();db_receipts.append(receipt)

original_blobs={x['blob'] for x in json.loads((BASE/'review.source.json').read_text())['git_database_history']['snapshots']}
for sha in sorted(db_blobs):inspect_db(read_blob(sha),'git:'+sha,sha in original_blobs)
for p in (REPO/'.sensitive-archive').rglob('*'):
    if p.is_file() and not excluded(p.relative_to(REPO).as_posix()) and (
        'progress.db' in p.name or 'video-progress-cache.sqlite' in p.name):
        inspect_db(p.read_bytes(),'local:'+p.relative_to(REPO).as_posix())

flags=defaultdict(set);scanned=Counter();zip_receipts=[]
name_pattern=re.compile('|'.join(re.escape(x) for x in sorted(known_names,key=len,reverse=True))) if known_names else None
email_pattern=re.compile('|'.join(re.escape(x) for x in sorted(known_emails))) if known_emails else None
text_extensions={'.ts','.tsx','.js','.mjs','.cjs','.py','.md','.txt','.json','.yaml','.yml',
                 '.sql','.html','.css','.sh','.toml','.c4','.mmd','.plist','.csv','.vcf','.example','.template'}
for sha,paths in sha_paths.items():
    candidate=[p for p in paths if role(p) not in {'generated_vendor','build_dependency','visual_asset','vendor_reference'}]
    if not candidate:continue
    if sha in db_blobs:continue
    if any(role(p)=='archive_container' for p in candidate):
        data=read_blob(sha)
        try:
            z=zipfile.ZipFile(io.BytesIO(data))
            zip_receipts.append({'blob':sha,'paths':candidate,'entries':len(z.infolist()),
                'uncompressed_bytes':sum(x.file_size for x in z.infolist()),
                'record_entries':sum(role(x.filename)=='company_record_artifact' for x in z.infolist()),
                'top_directories':dict(Counter(x.filename.split('/')[0] for x in z.infolist()))})
        except zipfile.BadZipFile:
            zip_receipts.append({'blob':sha,'paths':candidate,'error':'not a readable ZIP'})
        continue
    if not any(Path(p).suffix.lower() in text_extensions or Path(p).suffix=='' for p in candidate):continue
    data=read_blob(sha);scanned['blob_versions']+=1;scanned['bytes']+=len(data)
    if b'\0' in data[:4096]:continue
    txt=data.decode('utf-8',errors='replace');lower=txt.lower()
    hit=set()
    if set(re.findall(r'(?<![\w])\d{5,}(?![\w])',txt)) & known_ids:hit.add('known_operating_id')
    if name_pattern and name_pattern.search(lower):hit.add('known_record_name')
    if email_pattern and email_pattern.search(lower):hit.add('known_record_email')
    if re.search(r'(?:csrftoken|csrf_token|laravel_session|x-csrf-token|password|api_key)\s*["\']?\s*[:=]\s*["\'][^"\'\n]{10,}',txt,re.I):hit.add('credential_literal_candidate')
    if re.search(r'^(?:\s*(?:User|Human|Assistant):|.*"role"\s*:\s*"(?:user|assistant)".*)',txt,re.M):hit.add('conversation_format_candidate')
    for p in candidate: flags[p].update(hit)
proc.stdin.close();proc.wait()

def summarize(rows):
    n=len(rows);total=sum(r['bytes'] for r in rows);groups={}
    for kind in sorted(set(r['role'] for r in rows)):
        subset=[r for r in rows if r['role']==kind]
        groups[kind]={'files':len(subset),'bytes':sum(r['bytes'] for r in subset),
                      'file_percent':round(100*len(subset)/n,4),
                      'byte_percent':round(100*sum(r['bytes'] for r in subset)/total,4)}
    return {'files':n,'bytes':total,'groups':groups}

history=[]
for p,ss in sorted(versions.items()):
    history.append({'path':p,'role':role(p),'versions':len(ss),
                    'version_bytes':sum(sizes.get(s,0) for s in ss),
                    'flags':sorted(flags[p])})
local=[]
for root,ds,fs in os.walk(REPO):
    ds[:]=[d for d in ds if d not in BUILD_PARTS]
    for f in fs:
        p=Path(root)/f
        if p.is_symlink():continue
        rel=p.relative_to(REPO).as_posix()
        if rel in versions:continue
        local.append({'path':rel,'role':role(rel),'bytes':p.stat().st_size})

result={
 'generated_at':datetime.now(timezone.utc).isoformat(),'repository_head':git('rev-parse','HEAD').decode().strip(),
 'pre_demo_head':PRE_DEMO,'scope':'Every path in all reachable local Git refs; every non-build local file. No remote database or external AI-chat store.',
 'method':'File roles follow explicit path/type rules in audit_composition.py. All eligible text blob versions were scanned in memory for identifiers drawn from preserved SQLite rows. Flags are review signals, not ownership findings.',
 'ownership_basis':{'system_authorship':'Jerami reports sole system authorship','engagement':'Jerami reports independent contractor; no code ownership clause','rule':'File roles and sizes do not determine legal ownership, confidentiality, sale value, or mandatory revenue share.'},
 'head':summarize(head),'pre_demo':summarize(pre),
 'history':{'all_paths':len(history),'excluded_build_paths':sum(r['role']=='build_dependency' for r in history),
            'non_build_paths':sum(r['role']!='build_dependency' for r in history),
            'roles':dict(Counter(r['role'] for r in history)),
            'unique_non_build_blobs':len(all_shas),'scanned_text':dict(scanned),
            'author_commits':dict(Counter(git('log','HEAD','--format=%aN').decode().splitlines()))},
 'identifier_signal_counts':{'known_id_values':len(known_ids),'known_name_values':len(known_names),'known_email_values':len(known_emails)},
 'database_inspection':db_receipts,'zip_directory_inspection':zip_receipts,
 'head_manifest':head,'pre_demo_manifest':pre,'historical_path_manifest':history,
 'local_only':{'summary':summarize(local),'manifest':local},
 'limitations':['Role census is complete for the stated paths. It is not a line-by-line legal clearance.',
 'A source file can be Jerami-created and also contain company records. Identifier flags identify overlap, without transferring code ownership.',
 'Absence of a detector hit is not proof that a file is clear to share.',
 'Compiler output, vendored libraries, and repeated backups cannot be used as added commercial evidence.']}
(BASE/'composition-audit.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['head','pre_demo','history','local_only'] if k!='local_only'},indent=2))
print('Local-only summary:',json.dumps(result['local_only']['summary']))
print('Scanned database versions:',len(db_receipts),'ZIP directories:',len(zip_receipts))
