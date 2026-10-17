const photoSubjects=reviewData.assetSubjects;
let activePhotoSubject=reviewData.initialReviewSlot || assetProposals.slots[0] && `${assetProposals.slots[0].sceneId}:${assetProposals.slots[0].assetIndex}`;
function showPhotoSubject(slotKey) {
  activePhotoSubject = slotKey;
  document.querySelectorAll('[data-review-slot]').forEach(p=>p.hidden=p.dataset.reviewSlot!==slotKey);
  document.querySelectorAll('[data-subject-slot]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.subjectSlot===slotKey)));
}
function refreshSubjectStates() {
  const choices=getPhotoChoices();
  document.querySelectorAll('[data-subject-slot]').forEach(b=>{
    const selected=Boolean(choices[b.dataset.subjectSlot]);
    b.querySelector('.subject-state').textContent=selected?'✓':'○';
    b.querySelector('.subject-state').setAttribute('aria-label',selected?'Photo selected':'Choose photo');
  });
}
document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('#subject-list');
  nav.innerHTML=assetProposals.slots.map(s=>{
    const key=`${s.sceneId}:${s.assetIndex}`,subject=photoSubjects[key] || {name:s.asset,team:""};
    return `<button type="button" class="subject" role="tab" id="photo-subject-${s.sceneId}-${s.assetIndex}" aria-controls="photo-panel-${s.sceneId}-${s.assetIndex}" aria-selected="false" data-subject-slot="${key}"><span class="subject-copy"><strong>${esc(subject.name)}</strong><small>${esc(subject.team)}</small></span><span class="subject-state"></span></button>`;
  }).join('');
  nav.querySelectorAll('[data-subject-slot]').forEach((b,i,buttons)=>{
    b.addEventListener('click',()=>showPhotoSubject(b.dataset.subjectSlot));
    b.addEventListener('keydown',e=>{
      if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
      e.preventDefault();
      const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:-1)+buttons.length)%buttons.length;
      buttons[next].focus();showPhotoSubject(buttons[next].dataset.subjectSlot);
    });
  });
  document.querySelectorAll('[data-open-assets]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelector('#candidates-tab').click();
    const slot=assetProposals.slots.find(s=>s.sceneId===b.dataset.openAssets);
    showPhotoSubject(`${slot.sceneId}:${slot.assetIndex}`);
  }));
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-photo-option],[data-photo-unlock]'))refreshSubjectStates();
  });
  showPhotoSubject(activePhotoSubject);refreshSubjectStates();
});
