const photoStorageKey = 'lineups-photos-' + assetProposals.episodeId + '-' + assetProposals.cueMapSha256.slice(0,16);
let photoSelections = {};
let photoStorageAvailable = true;
try {
  const stored = JSON.parse(localStorage.getItem(photoStorageKey) || JSON.stringify(typeof reviewerPhotoChoices === 'undefined' ? {} : reviewerPhotoChoices));
  for (const slot of assetProposals.slots) {
    const slotKey = `${slot.sceneId}:${slot.assetIndex}`;
    const saved = stored[slotKey];
    if (saved && slot.options.some(o => o.id === saved.optionId && o.sha256 === saved.sha256)) photoSelections[slotKey] = saved;
  }
} catch(e) { photoStorageAvailable = false; }

function photoSlot(sceneId,index) {
  return assetProposals.slots.find(s => s.sceneId === sceneId && s.assetIndex === index);
}

function renderPhotoOptions(sceneId,index) {
  const slot = photoSlot(sceneId,index);
  if (!slot) return '';
  const slotKey = `${sceneId}:${index}`;
  if (!slot.options.length) return '<p class="photo-lock-status">No verified photo available. Retrieval required.</p>';
  return `<div class="photo-options" data-photo-group="${esc(slotKey)}">
    <div class="photo-grid ${slot.options.length === 1 ? 'single' : ''}">${slot.options.map((o,i)=>`
      <div class="photo-card">
        <button type="button" class="photo-choice" data-photo-slot="${esc(slotKey)}" data-photo-option="${esc(o.id)}" aria-pressed="false" aria-label="Lock ${esc(o.label)}">
          <img src="${esc(o.image)}" alt="${esc(o.label)}" loading="lazy" width="${o.width}" height="${o.height}">
          <span class="photo-label">${slot.options.length > 1 ? `Option ${i+1} · ` : ''}${esc(o.label)}</span>
          <span class="photo-badge" data-photo-badge></span>
        </button>
        <p class="photo-links"><a href="${esc(o.image)}" target="_blank" rel="noopener">Full photo</a> · <a href="${esc(o.sourceUrl)}" target="_blank" rel="noopener">Source</a></p>
      </div>`).join('')}</div>
    <p class="photo-lock-status" data-photo-status="${esc(slotKey)}" role="status" aria-live="polite"></p>
    <button type="button" class="tab" data-photo-unlock="${esc(slotKey)}" hidden>Change photo</button>
  </div>`;
}

function getPhotoChoices() {
  const result = {};
  for (const slot of assetProposals.slots) {
    const slotKey = `${slot.sceneId}:${slot.assetIndex}`, selected = photoSelections[slotKey];
    if (!selected) continue;
    const option = slot.options.find(o => o.id === selected.optionId && o.sha256 === selected.sha256);
    if (option) result[slotKey] = {...option,sceneId:slot.sceneId,assetIndex:slot.assetIndex,asset:slot.asset,
      query:slot.query,selectionStatus:'locked-by-reviewer',lockedAt:selected.lockedAt};
  }
  return result;
}

function savePhotoChoices() {
  try { localStorage.setItem(photoStorageKey,JSON.stringify(photoSelections)); photoStorageAvailable=true; }
  catch(e) { photoStorageAvailable=false; }
}

function updatePhotoChoices() {
  document.querySelectorAll('[data-photo-option]').forEach(button=>{
    const selected = photoSelections[button.dataset.photoSlot];
    const locked = selected?.optionId === button.dataset.photoOption;
    button.setAttribute('aria-pressed',String(locked));
    button.disabled = Boolean(selected && !locked);
    button.querySelector('[data-photo-badge]').textContent = locked ? '✓ Selected' : '';
  });
  document.querySelectorAll('[data-photo-status]').forEach(p=>{
    const selected = photoSelections[p.dataset.photoStatus];
    p.textContent = selected && !photoStorageAvailable ? 'Selected for this visit. Export to keep your choice.' : '';
  });
  document.querySelectorAll('[data-photo-unlock]').forEach(button=>button.hidden = !photoSelections[button.dataset.photoUnlock]);
  document.querySelectorAll('[data-asset-state]').forEach(p=>{
    const slots = assetProposals.slots.filter(s=>s.sceneId===p.dataset.assetState);
    const count = slots.filter(s=>photoSelections[`${s.sceneId}:${s.assetIndex}`]).length;
    p.textContent = count === slots.length ? 'Photos locked' : count ? `${count}/${slots.length} photos locked` : 'Choose photos';
  });
  const count = Object.keys(getPhotoChoices()).length;
  const remaining = assetProposals.slots.length-count;
  const summary = document.querySelector('#photo-selection-summary');
  if(summary) summary.textContent = assetProposals.slots.length ? `${remaining} ${remaining===1?'asset needs':'assets need'} retrieval${count ? ` · ${count} selected` : ''}.` : 'No assets need retrieval.';
  // Show chosen originals beside the supplied sources, without approving a scene.
  for (const beat of beats.filter(b=>b.assetRequests?.length)) {
    const selected = assetProposals.slots.filter(s=>s.sceneId===beat.id).map(s=>{
      const saved=photoSelections[`${s.sceneId}:${s.assetIndex}`];
      return saved ? s.options.find(o=>o.id===saved.optionId&&o.sha256===saved.sha256) : null;
    }).filter(Boolean);
    const article=document.querySelector(`#storyboard-list [data-scene="${beat.id}"]`);
    if (!article) continue;
    const visualNode=article.querySelector('.visual');
    if (selected.length) {
      const images=[...selected.map(o=>({image:o.image,label:o.label})),...beat.images];
      visualNode.outerHTML=`<div class="visual ${images.length>1?'two-preview':''}">${images.map(o=>`<img src="${esc(o.image)}" alt="${esc(o.label)} selected source" loading="lazy">`).join('')}<span class="visual-label">LOCKED PHOTO SOURCES</span></div>`;
    } else visualNode.outerHTML=visual(beat);
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-photo-option]').forEach(button=>button.addEventListener('click',()=>{
    const slotKey=button.dataset.photoSlot;
    if(photoSelections[slotKey]) return;
    const [sceneId,index]=slotKey.split(':'), slot=photoSlot(sceneId,Number(index));
    const option=slot.options.find(o=>o.id===button.dataset.photoOption);
    const assignedId=beats.find(b=>b.id===sceneId).assetRequests[Number(index)].eagleItemId;
    const usedHashes=[...Object.values(getPhotoChoices()).filter(o=>o.sceneId!==sceneId||o.assetIndex!==Number(index)).map(o=>o.sha256),
      ...beats.flatMap(b=>b.assets.filter(a=>b.id!==sceneId||a.eagleItemId!==assignedId).map(a=>a.sha256))];
    if(usedHashes.includes(option.sha256)) {
      document.querySelectorAll('[data-photo-status]').forEach(p=>{if(p.dataset.photoStatus===slotKey)p.textContent='This photo is already used elsewhere in the episode. Choose another.';});
      return;
    }
    photoSelections[slotKey]={optionId:option.id,sha256:option.sha256,lockedAt:new Date().toISOString()};
    savePhotoChoices();updatePhotoChoices();
  }));
  document.querySelectorAll('[data-photo-unlock]').forEach(button=>button.addEventListener('click',()=>{
    delete photoSelections[button.dataset.photoUnlock];savePhotoChoices();updatePhotoChoices();
  }));
  updatePhotoChoices();
  if(location.hash==='#assets-needed') document.querySelector('#candidates-tab').click();
});
