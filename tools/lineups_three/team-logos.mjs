/** Build beveled vector logo geometry from the supplied path-only SVG originals. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {unpackGLB,packGLB} from './card-shell.mjs';
const root=process.env.LINEUPS_THREE_ROOT||'/Users/singleton23/Documents/Development/motion-studio/node_modules/three';
const T=await import(pathToFileURL(path.join(root,'build/three.module.js')));
const {SVGLoader}=await import(pathToFileURL(path.join(root,'examples/jsm/loaders/SVGLoader.js')));
const {GLTFExporter}=await import(pathToFileURL(path.join(root,'examples/jsm/exporters/GLTFExporter.js')));
const {mergeGeometries}=await import(pathToFileURL(path.join(root,'examples/jsm/utils/BufferGeometryUtils.js')));
const hash=b=>createHash('sha256').update(b).digest('hex');
// ElementTree handles XML. This adapter exposes only the SVGLoader DOM operations
// needed by our supplied svg/g/path files, and rejects unsupported markup.
class PathSVGParser {
  parseFromString(text) {
    const data=JSON.parse(execFileSync('python3',['-c',`import json,sys,xml.etree.ElementTree as E
r=E.fromstring(sys.stdin.read())
def node(e):
 t=e.tag.rsplit('}',1)[-1]
 assert t in ('svg','g','path','defs','linearGradient','stop'), 'Only supplied path-only SVG artwork is supported'
 assert not any(k in e.attrib for k in ('class','transform','filter')), 'Unsupported SVG styling'
 return {'tag':t,'attrs':dict(e.attrib),'children':[node(c) for c in e]}
print(json.dumps(node(r)))`],{input:text,encoding:'utf8'}));
    const wrap=d=>{const n={nodeType:1,nodeName:d.tag,hasAttribute:k=>k in d.attrs,getAttribute:k=>d.attrs[k]??null,getAttributeNS:()=>null,childNodes:d.children.map(wrap)};
      n.querySelectorAll=selector=>{const tags=selector.split(',').map(t=>t.trim());return n.childNodes.flatMap(c=>[...(tags.includes(c.nodeName)?[c]:[]),...c.querySelectorAll(selector)]);};return n;};
    const documentElement=wrap(data);return {documentElement,querySelectorAll:s=>documentElement.querySelectorAll(s)};
  }
}
class Reader {readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();});}}
export async function buildLogo(svg) {
  globalThis.DOMParser=PathSVGParser;globalThis.FileReader||=Reader;
  const data=new SVGLoader().parse(svg);
  const width=Number(data.xml.getAttribute('width')),height=Number(data.xml.getAttribute('height'));
  if(!(width>0&&height>0))throw new Error('SVG requires explicit dimensions');
  const materials=[new T.MeshStandardMaterial({name:'LogoEdge',color:'#9BA8B8',metalness:.75,roughness:.3})];
  const faceMaterials=new Map();
  const pieces=[];
  // Detailed marks can have hundreds of paths. Keep their complete stack shallow,
  // with bevels separated, while preserving the approved sparse-logo geometry.
  const layerStep=Math.min(.003,.06/Math.max(1,data.paths.length-1));
  const bevel=Math.min(.0009,layerStep/3);
  data.paths.forEach((p,i)=>{
    if(p.userData.style.fill==='none')return;
    const fill=p.userData.style.fill;const gradient=/^url\(#(.+)\)$/.exec(fill);const sourceColor=gradient?data.gradients[gradient[1]].stops[0].color:p.color;
    const colorKey=sourceColor.getHexString();
    if(!faceMaterials.has(colorKey)) {
      const m=new T.MeshStandardMaterial({name:'LogoFace_'+i,color:sourceColor,metalness:.25,roughness:.32});
      faceMaterials.set(colorKey,materials.push(m)-1);
    }
    const material=faceMaterials.get(colorKey);
    for(const shape of p.toShapes()) {
      const g=new T.ExtrudeGeometry(shape,{depth:width*.018,bevelEnabled:true,bevelThickness:width*bevel,bevelSize:width*bevel,bevelSegments:3,curveSegments:20,steps:1});
      const indices=[];
      for(const group of g.groups)for(let j=0;j<group.count;j++)indices.push(group.materialIndex===0?material:0);
      g.translate(-width/2,-height/2,i*width*layerStep);g.scale(1/width,-1/width,1/width);
      // Y reflection requires winding reversal, including each triangle's UVs.
      for(const attribute of Object.values(g.attributes))for(let j=0;j<attribute.count;j+=3)for(let k=0;k<attribute.itemSize;k++){
        const a=(j+1)*attribute.itemSize+k,b=(j+2)*attribute.itemSize+k,tmp=attribute.array[a];attribute.array[a]=attribute.array[b];attribute.array[b]=tmp;
      }
      g.computeVertexNormals();g.clearGroups();
      let start=0;while(start<indices.length){let end=start+1;while(end<indices.length&&indices[end]===indices[start])end++;g.addGroup(start,end-start,indices[start]);start=end;}
      pieces.push(g);
    }
  });
  const geometry=mergeGeometries(pieces,false);let offset=0;geometry.clearGroups();
  for(const g of pieces){for(const group of g.groups)geometry.addGroup(group.start+offset,group.count,group.materialIndex);offset+=g.attributes.position.count;}
  // One contiguous primitive per actual color avoids hundreds of duplicated
  // full vertex buffers in Unreal's glTF mesh import path.
  const order=[...new Set(geometry.groups.map(g=>g.materialIndex))];
  const packed=new T.BufferGeometry();
  for(const [name,attribute] of Object.entries(geometry.attributes)) {
    const array=new attribute.array.constructor(attribute.array.length);let dest=0;
    for(const material of order)for(const group of geometry.groups)if(group.materialIndex===material) {
      array.set(attribute.array.subarray(group.start*attribute.itemSize,(group.start+group.count)*attribute.itemSize),dest*attribute.itemSize);dest+=group.count;
    }
    packed.setAttribute(name,new T.BufferAttribute(array,attribute.itemSize,attribute.normalized));
  }
  let start=0;
  for(const material of order) {
    const count=geometry.groups.filter(g=>g.materialIndex===material).reduce((n,g)=>n+g.count,0);
    packed.addGroup(start,count,material);start+=count;
  }
  packed.computeBoundingBox();
  const mesh=new T.Mesh(packed,materials);mesh.name='CanonicalTeamLogo';
  const raw=Buffer.from(await new GLTFExporter().parseAsync(mesh,{binary:true}));
  const {json,binary}=unpackGLB(raw);
  // Give each primitive its own accessor range. Otherwise Unreal expands the
  // entire shared buffer for every material when constructing MeshDescription.
  json.meshes[0].primitives.forEach((primitive,i)=>{
    const group=packed.groups[i];
    for(const [semantic,accessorId] of Object.entries(primitive.attributes)) {
      const old=json.accessors[accessorId],view=json.bufferViews[old.bufferView];
      const size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[old.type];
      if(old.componentType!==5126||!size||old.sparse)throw new Error('Expected packed float attributes');
      const accessor={...old,count:group.count,byteOffset:(old.byteOffset||0)+group.start*(view.byteStride||size*4)};
      delete accessor.min;delete accessor.max;
      if(semantic==='POSITION') {
        const attr=packed.attributes.position;
        accessor.min=[Infinity,Infinity,Infinity];accessor.max=[-Infinity,-Infinity,-Infinity];
        for(let n=group.start;n<group.start+group.count;n++)for(let k=0;k<3;k++) {
          const value=attr.array[n*3+k];accessor.min[k]=Math.min(accessor.min[k],value);accessor.max[k]=Math.max(accessor.max[k],value);
        }
      }
      primitive.attributes[semantic]=json.accessors.push(accessor)-1;
    }
    const indices=json.accessors[primitive.indices],view=json.bufferViews[indices.bufferView];
    const indexSize={5121:1,5123:2,5125:4}[indices.componentType];
    if(!indexSize||indices.count!==group.count)throw new Error('Expected contiguous unsigned indices');
    const offset=(view.byteOffset||0)+(indices.byteOffset||0);
    for(let n=0;n<group.count;n++)binary.writeUIntLE(binary.readUIntLE(offset+n*indexSize,indexSize)-group.start,offset+n*indexSize,indexSize);
    indices.min=[0];indices.max=[group.count-1];
  });
  const bytes=packGLB(json,binary);
  return {bytes,triangles:geometry.attributes.position.count/3,materialSlots:materials.map(m=>m.name),width:1,height:height/width};
}
if(process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname){
 const source=execFileSync(process.execPath,['scripts/developer-storage/storage-gate.mjs','route','--client','CATENA_MEDIA_LINEUPS','--kind','source'],{encoding:'utf8'}).trim();
 const out=path.join(source,'rams-seahawks-vector-logos-v2');await fs.mkdir(out,{recursive:true});const manifest={};
 for(const name of ['Rams','Seahawks']){
  const sourcePath=path.join(source,'team-logo-cards',name+'.svg'),svg=await fs.readFile(sourcePath);const {bytes,...info}=await buildLogo(svg.toString());
  const target=path.join(out,name+'.glb');await fs.writeFile(target,bytes,{flag:'wx'});manifest[name]={sourcePath,sourceSha256:hash(svg),path:target,sha256:hash(bytes),...info};
 }
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(manifest,null,2));
}
