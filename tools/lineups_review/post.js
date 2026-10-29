const esc=reviewEscape;
const postScenes=reviewData.postScenes;
const postKey='lineups-post-'+reviewData.episodeId+'-'+reviewData.postEvidenceSha256.slice(0,16);
let postDecisions=readReviewChoices(postKey,postScenes);
const sceneContext=(b,detail=false)=>`<h2 ${detail?'id="scene-dialog-title"':''}>${esc(b.title)}</h2><p class="scene-meta">${esc(b.id)} · ${esc(b.time)} · ${esc(b.lane)}${b.option.toLowerCase()!==b.lane.toLowerCase()?` · ${esc(b.option)}`:''}</p>${renderReviewContext(b)}<blockquote class="review-transcript"><span class="context-label">Spoken words</span><p>${esc(b.reviewExcerpt)}</p></blockquote>`;
function renderPost(lane='all') {
  const filtered=postScenes.filter(b=>lane==='all'||b.lane===lane);
  document.querySelector('#post-scenes').innerHTML=filtered.map(b=>`<article class="beat" data-scene="${esc(b.id)}">${renderReviewVisual(b,{post:true})}<div class="beat-body">${sceneContext(b)}<div class="post-links"><a href="${esc(b.sourceUrl)}" target="_blank" rel="noopener">Figma source</a>${b.proofUrl?`<a href="${esc(b.proofUrl)}" target="_blank" rel="noopener">Timing proof</a>`:''}<button class="tab" data-detail="${esc(b.id)}">Scene details</button></div><div class="decision-footer"><div class="decisions" role="group" aria-label="Decision for ${esc(b.id)}"><button class="tab" data-post-action="approved" data-id="${esc(b.id)}" aria-pressed="${postDecisions[b.id]==='approved'}">Ready</button><button class="tab" data-post-action="denied" data-id="${esc(b.id)}" aria-pressed="${postDecisions[b.id]==='denied'}">Needs a fix</button><button class="tab" data-post-action="undecided" data-id="${esc(b.id)}">Reset</button></div><p class="decision-status">${reviewChoiceLabel(postDecisions[b.id],true)}</p></div></div></article>`).join('');
  const empty=document.querySelector('#post-empty');empty.hidden=filtered.length>0;
  empty.querySelector('h2').textContent=postScenes.length?'No scenes in this lane':'No scene previews yet';
  document.querySelector('#post-count').textContent=postScenes.length?`${filtered.length} of ${postScenes.length} built scenes · ${postScenes.filter(b=>postDecisions[b.id]==='approved').length} ready`:'';
  document.querySelector('#post-footer').hidden=postScenes.length===0;
  document.querySelectorAll('[data-lane]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lane===lane)));
}
document.querySelector('#lane-filters').innerHTML=['all',...reviewData.lanes].map(lane=>`<button class="tab" data-lane="${esc(lane)}" aria-pressed="false">${lane==='all'?'All scenes':esc(lane)}</button>`).join('');
document.querySelector('#lane-filters').addEventListener('click',e=>{const b=e.target.closest('[data-lane]');if(b)renderPost(b.dataset.lane)});
document.querySelector('#post-scenes').addEventListener('click',e=>{
  const detail=e.target.closest('[data-detail]');
  if(detail){const b=postScenes.find(s=>s.id===detail.dataset.detail);document.querySelector('#scene-detail').innerHTML=renderReviewVisual(b,{post:true})+sceneContext(b,true)+`<a href="${esc(b.proofUrl||b.sourceUrl)}" target="_blank" rel="noopener">Source and proof</a>`;document.querySelector('#scene-dialog').showModal();return;}
  const b=e.target.closest('[data-post-action]');if(!b)return;
  if(b.dataset.postAction==='undecided')delete postDecisions[b.dataset.id];else postDecisions[b.dataset.id]=b.dataset.postAction;
  saveReviewChoices(postKey,postDecisions);
  renderPost(document.querySelector('[data-lane][aria-pressed=true]').dataset.lane);
});
document.querySelector('#close-scene').addEventListener('click',()=>document.querySelector('#scene-dialog').close());
document.querySelector('#export-post').addEventListener('click',()=>{
  const result={episode:reviewData.episodeId,stage:'post-figma',cueMapSha256:reviewData.cueMapSha256,postEvidenceSha256:reviewData.postEvidenceSha256,decisions:postDecisions,exportedAt:new Date().toISOString()};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));a.download=reviewData.episodeId+'-post-figma-decisions.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});
renderPost();
