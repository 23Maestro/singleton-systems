import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {folders,includeEntry} from './folders.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(here,'../..');
const out=path.join(root,'sites/docs-canvas/dist');
fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','style.css','app.js'])fs.copyFileSync(path.join(here,'src',name),path.join(out,name));
const assets=path.join(out,'assets');fs.mkdirSync(assets,{recursive:true});
for(const [source,name] of [['ssystems-logo-wordmark-black.svg','wordmark-black.svg'],['ssystems-logo-wordmark-white.svg','wordmark-white.svg'],['singleton-systems-favicon.svg','favicon.svg']])fs.copyFileSync(path.join(root,'public/brand',source),path.join(assets,name));
fs.copyFileSync(path.join(here,'src/assets/folder-doodles.png'),path.join(assets,'folder-doodles.png'));
fs.copyFileSync(path.join(root,'node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2'),path.join(assets,'Geist.woff2'));
fs.copyFileSync(path.join(root,'node_modules/geist/LICENSE.txt'),path.join(assets,'Geist-LICENSE.txt'));
const scope='docs/operations';
function scan(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(`${dir}/${e.name}`):e.isFile()&&e.name.endsWith('.md')?[`${dir}/${e.name}`]:[]).sort();}
const files=scan(scope).map(p=>{const text=fs.readFileSync(path.join(root,p),'utf8');return {id:p,name:path.basename(p),folder:path.dirname(p),title:text.match(/^# (.+)$/m)?.[1]??path.basename(p),text,sha256:crypto.createHash('sha256').update(text).digest('hex'),links:[...text.matchAll(/\[([^\]]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map(m=>({label:m[1],target:/^(https?:|\/)/.test(m[2])?m[2]:path.posix.normalize(path.posix.join(path.posix.dirname(p),m[2].split('#')[0])),raw:m[2]}))};});
const overview=folders.map(f=>{
 const directory=path.join(root,f.path);
 if(!fs.existsSync(directory)||!fs.lstatSync(directory).isDirectory())throw new Error(`Missing overview folder: ${f.path}`);
 const entries=fs.readdirSync(directory,{withFileTypes:true}).filter(includeEntry)
  .map(e=>({name:e.name,path:`${f.path}/${e.name}`,kind:e.isDirectory()?'folder':'file'}))
  .sort((a,b)=>a.kind===b.kind?a.name.localeCompare(b.name):a.kind==='folder'?-1:1);
 return {...f,entries};
});
const model={schemaVersion:2,capturedAt:new Date().toISOString(),scope,method:'Direct folder listing and Markdown links. No semantic indexing.',coverage:{overview:'Selected main folders and their first level of contents.',readable:'docs/operations Markdown files only.',excluded:'Hidden files, generated output, dependencies, credentials, and links outside the selected folders.'},overview,files};
fs.writeFileSync(path.join(out,'data.json'),JSON.stringify(model,null,2)+'\n');
console.log(`${files.length} source files; ${files.reduce((n,f)=>n+f.links.length,0)} direct links`);
