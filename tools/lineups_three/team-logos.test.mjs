import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLogo} from './team-logos.mjs';
import {unpackGLB} from './card-shell.mjs';
test('vector logo keeps its proportions and exports separate face and bevel materials',async()=>{
 const {bytes,width,height}=await buildLogo('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M0 0H100V50H0Z" fill="#69BE28"/></svg>');
 const {json}=unpackGLB(bytes);
 assert.equal(width,1);assert.equal(height,.5);assert.equal(json.meshes.length,1);
 assert.deepEqual(json.materials.map(m=>m.name),['LogoFace_0','LogoEdge']);
 assert.ok(json.meshes[0].primitives.every(p=>p.attributes.NORMAL!==undefined));
});
test('unsupported SVG features fail instead of silently changing artwork',async()=>{
 await assert.rejects(buildLogo('<svg width="100" height="50"><image href="example.png"/></svg>'),/Only supplied path-only SVG/);
});
test('a detailed logo keeps its full path stack shallow',async()=>{
 const paths=Array.from({length:129},(_,i)=>`<path d="M${i%10} 0h10v10h-10Z" fill="#FF3C00"/>`).join('');
 const {bytes,triangles}=await buildLogo(`<svg width="100" height="100">${paths}</svg>`);
 const {json}=unpackGLB(bytes);
 assert.equal(json.meshes[0].primitives.length,2,'Repeated fills must share one face primitive');
 assert.equal(json.materials.length,2,'Repeated fills must reuse their material');
 const positions=json.meshes[0].primitives.map(p=>json.accessors[p.attributes.POSITION]);
 assert.equal(positions.reduce((n,p)=>n+p.count,0),triangles*3,'Each primitive must expose only its own vertices');
 const low=Math.min(...positions.map(p=>p.min[2]));
 const high=Math.max(...positions.map(p=>p.max[2]));
 assert.ok(high-low<.1,`Logo depth was ${high-low} of its width`);
});
