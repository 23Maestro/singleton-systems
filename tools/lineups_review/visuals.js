function reviewEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function reviewVisualKind(scene) {
  if(scene.rank || scene.lane==='recurring board')return 'rank';
  if(['comparison','stat breakdown','year-by-year'].includes(scene.lane))return 'stat';
  return scene.assetSearch?.status==='needed'?'gap':'plan';
}
function renderReviewVisual(scene,{post=false}={}) {
  const esc=reviewEscape;
  if(post && scene.preview) {
    const p=scene.preview;
    if(p.kind==='video')return `<div class="visual motion-preview"><video controls playsinline preload="metadata" ${p.poster?`poster="${esc(p.poster)}"`:''} src="${esc(p.image)}" aria-label="${esc(scene.title)} motion preview"></video></div>`;
    return `<div class="visual"><img src="${esc(p.image)}" alt="${esc(scene.title)} scene preview" loading="lazy"></div>`;
  }
  if(scene.images?.length)return `<div class="visual ${scene.images.length>1?'two-preview':''}">${scene.images.map(i=>`<img src="${esc(i.image)}" alt="${esc(i.label)} source preview" loading="lazy">`).join('')}<span class="visual-label">Source preview</span></div>`;
  const kind=reviewVisualKind(scene);
  const label=kind==='rank'?'Rank reveal plan':kind==='stat'?(scene.lane==='comparison'?'Comparison plan':'Stat plan'):kind==='gap'?'Photo needed':'Scene plan';
  return `<div class="visual motion ${kind}-visual"><span class="rank">${esc(scene.lane)}</span><strong>${esc(scene.copy || scene.title)}</strong><span class="visual-label">${label}</span></div>`;
}
