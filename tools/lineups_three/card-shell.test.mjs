import test from 'node:test';
import assert from 'node:assert/strict';
import {clipPolygon,createCard,exportCard,unpackGLB,palettes} from './card-shell.mjs';

test('diagonal ribs stay inside the face and team colors preserve geometry',()=>{
  const polygon=clipPolygon([[-2,0],[0,-2],[2,0],[0,2]],-.5,.5,-.3,.4);
  assert.ok(polygon.length>=4);
  assert.ok(polygon.every(([x,y])=>x>=-.500001&&x<=.500001&&y>=-.300001&&y<=.400001));
  const a=createCard(palettes.rams),b=createCard(palettes.seahawks);
  assert.deepEqual(a.geometry.attributes.position.array,b.geometry.attributes.position.array);
  assert.notEqual(a.material[1].color.getHexString(),b.material[1].color.getHexString());
  assert.ok(a.geometry.boundingBox.max.z-a.geometry.boundingBox.min.z>.03);
  for(const value of a.geometry.attributes.position.array)assert.ok(Number.isFinite(value));
});

test('GLB carries one mesh, named replaceable materials and embedded valid textures',async()=>{
  const result=await exportCard();const {json,binary}=unpackGLB(result.bytes);
  assert.equal(json.meshes.length,1);assert.equal(json.images.length,2);
  assert.equal(json.materials.length,6);assert.equal(result.manifest.logosIncluded,false);
  for(const image of json.images) {
    const view=json.bufferViews[image.bufferView];assert.ok(view.byteOffset+view.byteLength<=binary.length);
    assert.equal(binary.subarray(view.byteOffset,view.byteOffset+8).toString('hex'),'89504e470d0a1a0a');
  }
  assert.equal(result.manifest.browserShaderDependencies,false);
  assert.throws(()=>createCard({primary:'red',secondary:'#000000'}),/#RRGGBB/);
});
