const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const color = value => /^#[a-f\d]{6}$/i.test(value) ? value : '#252529';

export const panelTabs = version => version.stage === 'Plan' ? ['plan', 'timing', 'needs', 'comments'] : ['comments'];

export function cardPreview(scene) {
  if (scene.presentation?.layout === 'rank') {
    return `<span class="card-image card-rank" style="background:${color(scene.presentation.background)};color:${color(scene.presentation.foreground)}">${esc(scene.presentation.headline)}</span>`;
  }
  return scene.thumbnail ? `<img class="card-image" src="${esc(scene.thumbnail)}" alt="" loading="lazy">` : `<span class="card-image card-plan">${esc(scene.id)}</span>`;
}

export function planMarkup(scene) {
  const p = scene.presentation;
  if (!p) return `<div class="plan-canvas"><h2>${esc(scene.planCopy || scene.title)}</h2></div>`;
  const layout = ['rank','comparison','facts','statement'].includes(p.layout) ? p.layout : 'statement';
  const items = Array.isArray(p.items) ? p.items : [p.headline];
  return `<div class="plan-canvas plan-${layout}" style="--plan-bg:${color(p.background)};--plan-ink:${color(p.foreground)}">${['comparison','facts'].includes(layout)
    ? `<div class="plan-fields" style="--fields:${Math.min(4, Math.max(1, items.length))}">${items.map(text => `<div class="plan-field"><strong>${esc(text)}</strong></div>`).join('')}</div>`
    : `<h2>${esc(p.headline)}</h2>`}</div>`;
}

export function planningPanel(scene, tab) {
  if (tab === 'timing') {
    const clock = seconds => `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${(seconds % 60).toFixed(3).padStart(6,'0')}`;
    return `<table class="cue-table"><caption>Speech cues</caption><thead><tr><th>Time</th><th>Words</th><th>Show</th></tr></thead><tbody>${(scene.cues || []).map(c => `<tr><td>${esc(clock(c.timestamp))}<small>+${esc(c.sceneTime.toFixed(3))}s</small></td><td>“${esc(c.word)}”</td><td>${esc(c.action?.split(';')[0].replace(/^Reveal /, '') || c.element || '')}</td></tr>`).join('')}</tbody></table>`;
  }
  if (tab === 'needs') {
    return `<section class="plan-needs"><h3>Needs</h3>${scene.missingAssets?.length
      ? `<ul>${scene.missingAssets.map(name => `<li>${esc(name)}</li>`).join('')}</ul>`
      : '<p>No missing assets listed.</p>'}${scene.sourcePhotos?.length ? `<h3>Source photos</h3><ul>${scene.sourcePhotos.map(name => `<li>${esc(name)}</li>`).join('')}</ul>` : ''}</section>`;
  }
  return `<dl class="plan-details"><div><dt>Lane</dt><dd>${esc(scene.lane)}</dd></div><div><dt>Look</dt><dd>${esc(scene.option)}</dd></div><div><dt>Tool</dt><dd>${esc(scene.engine)}</dd></div></dl>${scene.excerpt ? `<blockquote class="source-quote"><cite>Mark</cite><p>“${esc(scene.excerpt)}”</p></blockquote>` : ''}${scene.sourceUrl?.startsWith('https://www.figma.com/') ? `<a href="${esc(scene.sourceUrl)}" target="_blank" rel="noopener">Open source</a>` : ''}`;
}
