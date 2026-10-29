/** One exportable card shell; team identity and typography stay separate. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';

const threeRoot = process.env.LINEUPS_THREE_ROOT || '/Users/singleton23/Documents/Development/motion-studio/node_modules/three';
const THREE = await import(pathToFileURL(path.join(threeRoot, 'build/three.module.js')));
const {mergeGeometries} = await import(pathToFileURL(path.join(threeRoot, 'examples/jsm/utils/BufferGeometryUtils.js')));
const {GLTFExporter} = await import(pathToFileURL(path.join(threeRoot, 'examples/jsm/exporters/GLTFExporter.js')));

export const dimensions = {width:1, height:.89, depth:.035, footerHeight:.145};
export const palettes = {rams:{primary:'#003594', secondary:'#FFD100'}, seahawks:{primary:'#002244', secondary:'#69BE28'}};
const hash = data => createHash('sha256').update(data).digest('hex');

// Clip diagonal surface strips to the fixed rectangular face.
export function clipPolygon(polygon, xMin, xMax, yMin, yMax) {
  for (const [axis, edge, sign] of [[0,xMin,1],[0,xMax,-1],[1,yMin,1],[1,yMax,-1]]) {
    const output = [];
    for(let i=0;i<polygon.length;i++) {
      const a=polygon[i], b=polygon[(i+1)%polygon.length];
      const insideA=sign*(a[axis]-edge)>=-1e-10, insideB=sign*(b[axis]-edge)>=-1e-10;
      if(insideA) output.push(a);
      if(insideA!==insideB) {
        const t=(edge-a[axis])/(b[axis]-a[axis]);
        output.push([a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1])]);
      }
    }
    polygon=output;
    if(!polygon.length)break;
  }
  return polygon;
}

function rectangle(w,h,r=0,offsetY=0) {
  const s=new THREE.Shape(), x=-w/2,y=-h/2+offsetY;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  return s;
}

export function createCard(palette=palettes.rams) {
  for(const color of [palette.primary,palette.secondary]) if(!/^#[0-9a-f]{6}$/i.test(color))throw new Error('Team colors must be #RRGGBB');
  const materials=[
    new THREE.MeshStandardMaterial({name:'MetalRim',color:'#8996A4',metalness:.88,roughness:.26}),
    new THREE.MeshStandardMaterial({name:'TeamPanel',color:palette.primary,metalness:.3,roughness:.52}),
    new THREE.MeshStandardMaterial({name:'RaisedStripe',color:new THREE.Color(palette.primary).multiplyScalar(.62),metalness:.4,roughness:.46}),
    new THREE.MeshStandardMaterial({name:'TeamAccent',color:palette.secondary,metalness:.58,roughness:.34}),
    new THREE.MeshStandardMaterial({name:'DarkFooter',color:'#080F1A',metalness:.35,roughness:.5}),
    new THREE.MeshStandardMaterial({name:'DarkBack',color:'#080C12',metalness:.4,roughness:.6})
  ];
  const pieces=[];
  const add=(shape,depth,z,material,bevel=.0007)=>{
    const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,steps:1,curveSegments:6});
    geometry.translate(0,0,z);
    geometry.clearGroups();geometry.addGroup(0,geometry.attributes.position.count,material);
    pieces.push({geometry,material});
  };
  add(rectangle(1,.89,.003),.025,-.015,5,.002);
  const rim=rectangle(.998,.888,.002);
  const hole=new THREE.Path();hole.moveTo(-.493,-.438);hole.lineTo(-.493,.438);hole.lineTo(.493,.438);hole.lineTo(.493,-.438);hole.closePath();rim.holes.push(hole);
  add(rim,.014,.010,0,.0013);
  const face=rectangle(.984,.726,.001,.073);
  add(face,.009,.009,1,.0007);
  const footer=rectangle(.984,.142,.001,-.366);
  add(footer,.010,.011,4,.0007);
  // Fine diagonal ribs create real surface relief without browser-only shaders.
  for(let i=-10;i<=10;i++) {
    const c=i*.103;
    const polygon=clipPolygon([[-1,c+1], [1,c-1], [1,c-1+.029], [-1,c+1+.029]],-.491,.491,-.289,.435);
    if(polygon.length<3)continue;
    const shape=new THREE.Shape();shape.moveTo(...polygon[0]);for(const p of polygon.slice(1))shape.lineTo(...p);shape.closePath();
    add(shape,.0014,.019,2,.00025);
  }
  // A restrained pair of accent rails uses exactly the same geometry for every team.
  for(const c of [-.71,-.685,.68,.705]) {
    const polygon=clipPolygon([[-1,c+1],[1,c-1],[1,c-1+.005],[-1,c+1+.005]],-.49,.49,-.288,.434);
    if(polygon.length<3)continue;
    const shape=new THREE.Shape();shape.moveTo(...polygon[0]);for(const p of polygon.slice(1))shape.lineTo(...p);shape.closePath();add(shape,.001,.021,3,.00025);
  }
  const separator=rectangle(.983,.0025,0,-.293);add(separator,.001,.023,0,.0002);
  const geometry=mergeGeometries(pieces.map(p=>p.geometry),true);
  geometry.groups.forEach((group,i)=>group.materialIndex=pieces[i].material);
  geometry.computeBoundingBox();
  const mesh=new THREE.Mesh(geometry,materials);mesh.name='LineupsTeamCardShell';
  return mesh;
}

class BlobReader {
  readAsArrayBuffer(blob) {blob.arrayBuffer().then(buffer=>{this.result=buffer;this.onloadend?.();});}
  readAsDataURL(blob) {blob.arrayBuffer().then(buffer=>{this.result=`data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;this.onloadend?.();});}
}

export function unpackGLB(buffer) {
  if(buffer.readUInt32LE(0)!==0x46546c67 || buffer.readUInt32LE(4)!==2 || buffer.readUInt32LE(8)!==buffer.length)throw new Error('Invalid GLB');
  const length=buffer.readUInt32LE(12);
  return {json:JSON.parse(buffer.subarray(20,20+length).toString().trim()), binary:buffer.subarray(28+length)};
}
export function packGLB(json,binary) {
  const j=Buffer.from(JSON.stringify(json));const jsonPart=Buffer.alloc(Math.ceil(j.length/4)*4,0x20);j.copy(jsonPart);
  const binPart=Buffer.alloc(Math.ceil(binary.length/4)*4);binary.copy(binPart);
  const result=Buffer.alloc(28+jsonPart.length+binPart.length);
  result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8);
  result.writeUInt32LE(jsonPart.length,12);result.writeUInt32LE(0x4e4f534a,16);jsonPart.copy(result,20);
  result.writeUInt32LE(binPart.length,20+jsonPart.length);result.writeUInt32LE(0x004e4942,24+jsonPart.length);binPart.copy(result,28+jsonPart.length);
  return result;
}

async function surfaceMaps() {
  const size=512, color=Buffer.alloc(size*size*3), normal=Buffer.alloc(size*size*3);
  let seed=2751;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const weave=((x%8<4)===(y%8<4))?5:-5;
    const value=215+weave+(seed%17)-8, i=(y*size+x)*3;
    color[i]=color[i+1]=color[i+2]=value;
    normal[i]=128+(x%8<4?3:-3);normal[i+1]=128+(y%8<4?3:-3);normal[i+2]=255;
  }
  return Promise.all([color,normal].map(bytes=>sharp(bytes,{raw:{width:size,height:size,channels:3}}).png().toBuffer()));
}

export async function exportCard(palette=palettes.rams) {
  globalThis.FileReader ||= BlobReader;
  const mesh=createCard(palette);
  const original=Buffer.from(await new GLTFExporter().parseAsync(mesh,{binary:true,onlyVisible:true}));
  const {json,binary}=unpackGLB(original), maps=await surfaceMaps();
  const chunks=[binary];let offset=binary.length;
  json.images=[];json.textures=[];json.samplers=[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}];
  for(const bytes of maps) {
    const pad=Buffer.alloc((4-offset%4)%4);chunks.push(pad);offset+=pad.length;
    const view=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length});
    json.images.push({bufferView:view,mimeType:'image/png'});json.textures.push({sampler:0,source:json.images.length-1});
    chunks.push(bytes);offset+=bytes.length;
  }
  json.buffers[0].byteLength=offset;
  for(const m of json.materials)if(['TeamPanel','RaisedStripe','DarkFooter'].includes(m.name)) {
    m.pbrMetallicRoughness.baseColorTexture={index:0};m.normalTexture={index:1,scale:.25};
  }
  const bytes=packGLB(json,Buffer.concat(chunks));
  return {bytes,mesh,manifest:{generator:'three.js',threeRevision:THREE.REVISION,units:'meters',dimensions,materialSlots:mesh.material.map(m=>m.name),triangles:mesh.geometry.attributes.position.count/3,geometrySha256:hash(Buffer.from(mesh.geometry.attributes.position.array.buffer)),glbSha256:hash(bytes),palette,logosIncluded:false,textIncluded:false,browserShaderDependencies:false}};
}

if(process.argv[1] && path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)) {
  const source=execFileSync(process.execPath,['scripts/developer-storage/storage-gate.mjs','route','--client','CATENA_MEDIA_LINEUPS','--kind','source'],{encoding:'utf8'}).trim();
  const output=path.join(source,'team-card-shell-three-v1');await fs.mkdir(output,{recursive:true});
  const result=await exportCard();
  await fs.writeFile(path.join(output,'TeamCardShell.glb'),result.bytes,{flag:'wx'});
  await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(result.manifest,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({output,...result.manifest},null,2));
}
