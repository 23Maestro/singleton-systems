import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('tools/lineups_review/visuals.js','utf8'),ctx);
const render=scene=>ctx.renderReviewVisual(scene);
test('logo-only comparisons use a color plan, not a photo or a built scene',()=>{
  const html=render({lane:'comparison',copy:'FIRST | SECOND',images:[],assetSearch:{status:'verified'}});
  assert.match(html,/stat-visual/);assert.match(html,/Comparison plan/);assert.doesNotMatch(html,/<img|<video/);
});
test('photos retain their original frame and escape source labels',()=>{
  const html=render({lane:'quick action photo',images:[{image:'assets/action.jpg',label:'Player <action>'}]});
  assert.match(html,/src="assets\/action.jpg"/);assert.match(html,/Player &lt;action&gt;/);assert.doesNotMatch(html,/motion /);
});
test('verified Post-Figma media takes precedence over source photography',()=>{
  const html=ctx.renderReviewVisual({title:'Scene',preview:{kind:'video',image:'assets/render.mp4'},images:[{image:'source.jpg'}]},{post:true});
  assert.match(html,/<video controls playsinline/);assert.doesNotMatch(html,/source.jpg/);
});

test('the review gate rejects a changed active packet outside public',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'lineups-review-gate-'));
  try {
    fs.cpSync('tools/lineups_review',path.join(root,'tools/lineups_review'),{recursive:true});
    fs.mkdirSync(path.join(root,'config/lineups'),{recursive:true});
    fs.copyFileSync('config/lineups/review-template.json',path.join(root,'config/lineups/review-template.json'));
    const packet=path.join(root,'private-review');fs.mkdirSync(packet);
    fs.writeFileSync(path.join(packet,'index.html'),'Changed review page');
    fs.writeFileSync(path.join(packet,'review-template.json'),JSON.stringify({templateId:'lineups-photo-first-review',version:1,files:{},pages:{'index.html':'stale'}}));
    fs.writeFileSync(path.join(root,'config/lineups/review-gates.json'),JSON.stringify([{episodeSlug:'example',preFigma:{path:path.join(packet,'index.html')}}]));
    const result=spawnSync(process.execPath,[path.resolve('scripts/check-lineups-review.mjs')],{cwd:root,encoding:'utf8'});
    assert.notEqual(result.status,0,'A tampered active packet must block publication');
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});

function photoPicker(assignedSceneId) {
  let onReady,onClick;
  const status={textContent:''},badge={textContent:''};
  const button={dataset:{photoSlot:'S01:0',photoOption:'PHOTO'},setAttribute(){},
    querySelector(){return badge},addEventListener(type,handler){if(type==='click')onClick=handler}};
  const document={querySelector(){return null},querySelectorAll(selector){
    if(selector==='[data-photo-option]')return [button];
    if(selector==='[data-photo-status]')return [{dataset:{photoStatus:'S01:0'},get textContent(){return status.textContent},set textContent(v){status.textContent=v}}];
    return [];
  },addEventListener(type,handler){if(type==='DOMContentLoaded')onReady=handler}};
  const context=vm.createContext({document,location:{hash:''},localStorage:{getItem(){return null},setItem(){}},assetProposals:{episodeId:'test',cueMapSha256:'revision',slots:[
    {sceneId:'S01',assetIndex:0,asset:'Player',options:[{id:'PHOTO',sha256:'original-photo',image:'photo.jpg',label:'Player'}]}]},
    beats:[{id:'S01',assetRequests:[{eagleItemId:'PHOTO'}],assets:assignedSceneId==='S01'?[{eagleItemId:'PHOTO',sha256:'original-photo'}]:[],images:[]},
      {id:'S02',assetRequests:[],assets:assignedSceneId==='S02'?[{eagleItemId:'PHOTO',sha256:'original-photo'}]:[],images:[]}],esc:String});
  vm.runInContext(fs.readFileSync('tools/lineups_review/asset-selection.js','utf8'),context);
  onReady();onClick();return {choices:context.getPhotoChoices(),status:status.textContent};
}
test('a photo already assigned to this slot is not a second episode use',()=>{
  assert.deepEqual(Object.keys(photoPicker('S01').choices),['S01:0']);
});
test('the picker still blocks a photo assigned to another scene',()=>{
  const result=photoPicker('S02');assert.deepEqual(Object.keys(result.choices),[]);
  assert.match(result.status,/already used elsewhere/);
});
