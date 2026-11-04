import { createState, context, selectScene, selectVersion, updateDraft, updateStatus, saveNote, feedbackBatch, statuses, stages } from './model.mjs';

const icons = {
  panel: '<path d="M14 3v18M3 3h18v18H3zM17 8h1M17 12h1M17 16h1"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>', play: '<path d="m8 5 11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>', back: '<path d="M6 5v14M18 5l-10 7 10 7z"/>',
  next: '<path d="M18 5v14M6 5l10 7-10 7z"/>', camera: '<path d="M4 6h4l2-3h4l2 3h4v14H4z"/><circle cx="12" cy="12" r="4"/>',
  expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
  check: '<path d="m5 12 4 4 10-10"/>', arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = selector => document.querySelector(selector);
const app = $('#app');
let packet, state, storageKey, mediaAbort, mediaBlob, lastFrame, messageTimer, videoCallback;

function say(message) {
  clearTimeout(messageTimer);
  $('#message').textContent = message;
  messageTimer = setTimeout(() => { $('#message').textContent = ''; }, 7000);
}
function persist() {
  try {
    const value = JSON.stringify(state);
    localStorage.setItem(storageKey, value);
    if (localStorage.getItem(storageKey) !== value) throw new Error('Readback failed');
    return true;
  } catch {
    say('Your changes could not be saved. Keep this page open and export your feedback.');
    return false;
  }
}
function commit(change) {
  const before = structuredClone(state);
  change();
  if (persist()) return true;
  state = before;
  return false;
}
const statusLabel = status => status === 'Changes Requested' ? 'Changes' : status;
function badge(status = 'Needs Review') { return `<span class="badge" data-status="${esc(status)}">${esc(statusLabel(status))}</span>`; }
function timecode(seconds = 0) {
  const frames = Math.round(seconds * packet.fps), fps = packet.fps;
  return [Math.floor(frames / (fps * 3600)), Math.floor(frames / (fps * 60)) % 60, Math.floor(frames / fps) % 60, frames % fps].map(x => String(x).padStart(2, '0')).join(':');
}
function stageButtons(scene, version) {
  return stages.map((stage, i) => `<button class="stage" data-stage="${stage}" ${stage === version.stage ? 'aria-current="step"' : ''} ${scene.versions.some(v => v.stage === stage) ? '' : 'disabled'}><b>${String(i + 1).padStart(2, '0')}</b>${stage}</button>`).join('');
}
function render() {
  stopMedia();
  const { scene, version } = context(state, packet);
  app.innerHTML = `<main class="workspace">
    <header class="topbar"><div class="brand"><span class="brand-mark">s</span>studio</div><div class="breadcrumb"><span>${esc(packet.client)}</span><span>/</span><strong>${esc(packet.title)}</strong></div><span class="pilot">${esc(packet.intake)}</span><span class="avatar" aria-label="Jerami">JS</span></header>
    <div class="stagebar"><nav class="stages" aria-label="Production stage">${stageButtons(scene, version)}</nav><div class="stage-scene"><div class="scene-heading"><h1>${esc(scene.title)}</h1></div><span id="outer-status">${badge(state.statuses[scene.id])}</span></div><div class="viewer-actions"><select id="version" aria-label="Review version">${scene.versions.map(v => `<option value="${esc(v.id)}" ${v.id === version.id ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}</select><button id="panel-toggle" class="icon" aria-label="${state.panelOpen ? 'Hide' : 'Show'} review panel" aria-keyshortcuts="Meta+B" aria-controls="review-panel" aria-expanded="${state.panelOpen}">${icon('panel')}</button></div></div>
    <div class="review-body ${state.panelOpen ? '' : 'panel-closed'}" style="--panel:${state.panelWidth}px">
      <section class="viewer" aria-label="Scene viewer" tabindex="0" aria-keyshortcuts="ArrowLeft ArrowRight A C Space F Escape">
        <div class="viewport-wrap"><div class="viewport" id="viewport"><p class="muted">Opening version…</p></div></div>
        <div class="transport"><button class="icon play" id="play" aria-label="Play" disabled>${icon('play')}</button><button class="icon" id="previous-frame" aria-label="Previous frame" disabled>${icon('back')}</button><button class="icon" id="next-frame" aria-label="Next frame" disabled>${icon('next')}</button><span class="mono time" id="time">${timecode(state.times[`${scene.id}:${version.id}`] ?? 0)}</span><input type="range" id="seek" aria-label="Playback position" min="0" max="${scene.duration}" step="${1 / packet.fps}" value="0" disabled><span class="source-time mono">${scene.duration.toFixed(2)}s</span><button class="capture" id="capture" disabled>${icon('camera')} <span>Frame note</span></button><button class="icon" id="fullscreen" aria-label="Full screen">${icon('expand')}</button></div>
      </section>
      <button class="separator" role="separator" aria-label="Resize review panel" aria-orientation="vertical" aria-valuemin="285" aria-valuemax="480" aria-valuenow="${state.panelWidth}" tabindex="0"></button>
      <aside class="panel" id="review-panel" aria-label="Scene review" ${state.panelOpen ? '' : 'inert'}><header class="panel-head"><h2>Scene review <span class="mono">${esc(scene.id)}</span></h2><button class="icon" id="panel-close" aria-label="Close review panel">${icon('close')}</button></header><nav id="panel-tabs" class="panel-tabs" role="tablist" aria-label="Review panel"></nav><div class="panel-content" id="panel-content"></div><footer class="panel-footer"><button id="export">Export feedback ${icon('arrow')}</button><button class="send" disabled>Send to chat</button></footer></aside>
    </div>
    <section class="storyboard" aria-label="Storyboard"><header class="storyboard-head"><h2>Storyboard</h2><span class="mono">${packet.scenes.length} scenes</span></header><div class="cards">${packet.scenes.map(c => `<button class="scene-card" data-scene="${esc(c.id)}" aria-label="Scene ${esc(c.id)}: ${esc(c.title)}" aria-current="${scene.id === c.id}">${c.thumbnail ? `<img class="card-image" src="${esc(c.thumbnail)}" alt="" loading="lazy">` : `<span class="card-image card-plan">${esc(c.id)}</span>`}<span class="mono card-id">${esc(c.id)}</span><span class="mono card-duration">${c.duration.toFixed(2)}s</span><div class="card-info"><p class="card-title">${esc(c.title)}</p></div><span class="card-status" data-status-scene="${esc(c.id)}">${badge(state.statuses[c.id])}</span></button>`).join('')}</div></section>
    <dialog class="drawing-dialog" id="drawing" aria-label="Frame note"></dialog>
  </main>`;
  renderPanel(); bind(); void mountMedia();
}

function renderPanel() {
  const { scene, version, key } = context(state, packet), draft = state.drafts[key];
  const notes = state.notes.filter(note => note.sceneId === scene.id && note.versionId === version.id);
  $('#panel-tabs').innerHTML = ['comments', 'scene'].map(tab => `<button role="tab" id="tab-${tab}" aria-controls="panel-${tab}" aria-selected="${state.panelTab === tab}" tabindex="${state.panelTab === tab ? 0 : -1}" data-panel-tab="${tab}">${tab === 'comments' ? 'Comments' : 'Scene'}</button>`).join('');
  $('#panel-content').innerHTML = `<div role="tabpanel" id="panel-${state.panelTab}" aria-labelledby="tab-${state.panelTab}">${state.panelTab === 'scene' ? `
    <section class="panel-section"><div class="section-title"><h3>Scene status</h3></div><div class="status-buttons">${statuses.map(status => `<button data-status="${status}" aria-pressed="${(state.statuses[scene.id] ?? 'Needs Review') === status}">${statusLabel(status)}${status === 'Approved' ? '<kbd aria-hidden="true">A</kbd>' : status === 'Changes Requested' ? '<kbd aria-hidden="true">C</kbd>' : ''}</button>`).join('')}</div></section>
    ${scene.excerpt ? `<blockquote class="source-quote"><cite>Mark</cite><p>“${esc(scene.excerpt)}”</p></blockquote>` : ''}
    ${scene.sourceUrl?.startsWith('https://www.figma.com/') ? `<div class="proof-links"><a href="${esc(scene.sourceUrl)}" target="_blank" rel="noopener">Figma source ${icon('arrow')}</a></div>` : ''}` : `
    <section class="panel-section"><div class="section-title"><h3 class="comments-title">Comments <span class="note-count">${notes.length}</span></h3></div><div id="notes">${notes.length ? notes.map(noteMarkup).join('') : '<p class="empty-notes">No notes on this version.</p>'}</div>
      ${draft?.snapshot ? `<button class="draft-image draft-preview" id="edit-drawing" aria-label="Edit drawing" style="aspect-ratio:${draft.width ?? 16}/${draft.height ?? 9}"><img src="${esc(draft.snapshot)}" alt="Frozen frame for this draft"><svg class="marks" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">${marks(draft.marks)}</svg></button><div class="draft-tools"><button id="clear-frame">Remove frame</button></div>` : ''}
      <form class="composer" id="note-form"><textarea id="note-body" aria-label="Comment on this version" placeholder="Leave a note…" maxlength="6000" required>${esc(draft?.body ?? '')}</textarea><div class="composer-footer"><span class="draft-target mono" id="comment-time">${draftTimeLabel(draft)}</span><button id="save-note" type="submit" aria-keyshortcuts="Meta+Enter" ${draft?.body.trim() ? '' : 'disabled'}>Post comment <kbd aria-hidden="true">⌘↵</kbd></button></div></form></section>`}</div>`;
  document.querySelectorAll('[data-panel-tab]').forEach(button => {
    const activate = tab => { state.panelTab = tab; persist(); renderPanel(); $(`#tab-${tab}`).focus(); };
    button.addEventListener('click', () => activate(button.dataset.panelTab));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); activate(event.key === 'Home' ? 'comments' : event.key === 'End' ? 'scene' : state.panelTab === 'comments' ? 'scene' : 'comments');
    });
  });
  $('#note-body')?.addEventListener('focus', anchorComment);
  $('#note-body')?.addEventListener('input', event => { anchorComment(); updateDraft(state, packet, { body: event.target.value }); $('#save-note').disabled = !event.target.value.trim(); persist(); });
  $('#note-body')?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || !event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.isComposing) return;
    event.preventDefault(); if (!event.repeat && !$('#save-note').disabled) $('#note-form').requestSubmit();
  });
  $('#note-form')?.addEventListener('submit', event => {
    event.preventDefault(); anchorComment();
    if (commit(() => saveNote(state, packet, crypto.randomUUID()))) { renderPanel(); $('#note-body').focus(); say('Comment saved.'); }
  });
  document.querySelectorAll('.status-buttons button').forEach(button => button.addEventListener('click', () => setStatus(button.dataset.status)));
  $('#edit-drawing')?.addEventListener('click', () => openDrawing());
  $('#clear-frame')?.addEventListener('click', () => { if (commit(() => updateDraft(state, packet, { snapshot: null, marks: [] }))) renderPanel(); });
  bindNotes();
}
function draftTimeLabel(draft) {
  const { version, key } = context(state, packet);
  return Number.isFinite(draft?.time) ? timecode(draft.time) : version.kind === 'video' ? timecode(state.times[key] ?? 0) : 'Scene note';
}
function anchorComment() {
  const { version, key } = context(state, packet), draft = state.drafts[key], video = $('video');
  if (version.kind !== 'video' || !video || draft?.snapshot || (Number.isFinite(draft?.time) && draft?.body.trim())) return;
  video.pause();
  const time = lastFrame?.key === key && !video.seeking ? lastFrame.time : video.currentTime;
  updateDraft(state, packet, { time }); persist();
  if ($('#comment-time')) $('#comment-time').textContent = timecode(time);
}
function showComments(focus = false) {
  state.panelTab = 'comments'; togglePanel(true); renderPanel();
  if (focus) $('#note-body').focus();
}
function marks(list) { return list.map(m => `<rect x="${m.x * 1000}" y="${m.y * 1000}" width="${m.width * 1000}" height="${m.height * 1000}"/>`).join(''); }
function noteMarkup(note) {
  return `<article class="note" data-note="${esc(note.id)}"><div class="note-top"><span class="avatar">JS</span><strong>Jerami</strong><button data-resolve="${esc(note.id)}" aria-pressed="${note.resolved}">${note.resolved ? 'Completed' : 'Complete'}</button></div><button class="note-target mono" data-seek-note="${esc(note.id)}">${note.time === null ? 'Scene note' : timecode(note.time)}</button><p>${esc(note.body)}</p>${note.snapshot ? `<button class="draft-image draft-preview" data-view-frame="${esc(note.id)}" aria-label="View annotated frame" style="aspect-ratio:${note.width ?? 16}/${note.height ?? 9}"><img src="${esc(note.snapshot)}" alt="Saved frame for note"><svg class="marks" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">${marks(note.marks)}</svg></button>` : ''}${note.replies.map(reply => `<p class="reply">${esc(reply)}</p>`).join('')}<button class="reply-button" data-reply="${esc(note.id)}">Reply</button></article>`;
}
function bindNotes() {
  document.querySelectorAll('[data-view-frame]').forEach(button => button.addEventListener('click', () => openDrawing(state.notes.find(note => note.id === button.dataset.viewFrame))));
  document.querySelectorAll('[data-resolve]').forEach(button => button.addEventListener('click', () => { if (commit(() => { const note = state.notes.find(n => n.id === button.dataset.resolve); note.resolved = !note.resolved; })) renderPanel(); }));
  document.querySelectorAll('[data-seek-note]').forEach(button => button.addEventListener('click', () => { const note = state.notes.find(n => n.id === button.dataset.seekNote), video = $('video'); if (video && note.time !== null) { video.pause(); video.currentTime = note.time; } }));
  document.querySelectorAll('[data-reply]').forEach(button => button.addEventListener('click', () => {
    const article = button.closest('article'); if (article.querySelector('form')) return;
    const form = document.createElement('form'); form.className = 'reply-form';
    form.innerHTML = '<input aria-label="Reply to note" placeholder="Reply…" required maxlength="6000"><button>Save</button><button type="button">Cancel</button>';
    article.append(form); form.querySelector('input').focus();
    form.querySelector('[type=button]').addEventListener('click', () => form.remove());
    form.addEventListener('submit', event => { event.preventDefault(); const value = form.querySelector('input').value.trim(); if (value && commit(() => state.notes.find(n => n.id === button.dataset.reply).replies.push(value))) renderPanel(); });
  }));
}
function togglePanel(open) {
  state.panelOpen = open; persist();
  $('.review-body').classList.toggle('panel-closed', !open); $('#review-panel').inert = !open;
  $('#panel-toggle').setAttribute('aria-expanded', String(open)); $('#panel-toggle').setAttribute('aria-label', `${open ? 'Hide' : 'Show'} review panel`);
  if (!open) $('#panel-toggle').focus();
}
function rememberPlayback() {
  const video = $('video'); if (video) state.times[context(state, packet).key] = video.currentTime;
  persist();
}
function setStatus(status) {
  if (!commit(() => updateStatus(state, packet, status))) return false;
  $('#outer-status').innerHTML = badge(status);
  document.querySelector(`[data-status-scene="${state.selected}"]`).innerHTML = badge(status);
  document.querySelectorAll('.status-buttons button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.status === status)));
  return true;
}
function goToScene(id) {
  if (id === state.selected) return;
  rememberPlayback(); selectScene(state, packet, id); persist();
  const scroll = $('.cards').scrollLeft; render(); $('.cards').scrollLeft = scroll;
  const card = document.querySelector(`[data-scene="${state.selected}"]`);
  card.focus({ preventScroll: true }); card.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function shortcuts(event) {
  if (!state || event.defaultPrevented || event.isComposing || $('dialog[open]')) return;
  if (event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'b') {
    event.preventDefault(); if (!event.repeat) togglePanel(!state.panelOpen); return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (event.key === 'Escape' && target.closest('.viewer,.panel,.scene-card')) {
    event.preventDefault(); $('.viewer').focus({ preventScroll: true }); return;
  }
  if (target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="separator"],.marks')) return;
  const sceneFocused = target.matches('.scene-card,.viewer,.viewport');
  if (!sceneFocused) return;
  const key = event.key.toLowerCase();
  if (event.repeat) { if (key === ' ') event.preventDefault(); return; }
  if (key === 'arrowleft' || key === 'arrowright') {
    event.preventDefault();
    const index = packet.scenes.findIndex(scene => scene.id === state.selected);
    const next = packet.scenes[index + (key === 'arrowright' ? 1 : -1)];
    if (next) goToScene(next.id);
  } else if (key === 'a') {
    event.preventDefault(); setStatus('Approved');
  } else if (key === 'c') {
    event.preventDefault();
    if (setStatus('Changes Requested')) showComments(true);
  } else if (key === ' ' && !$('#play').disabled) {
    event.preventDefault(); $('#play').click();
  } else if (key === 'f' && !$('#capture').disabled) {
    event.preventDefault(); capture();
  }
}
function bind() {
  $('#panel-toggle').addEventListener('click', () => togglePanel(!state.panelOpen));
  $('#panel-close').addEventListener('click', () => togglePanel(false));
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => goToScene(button.dataset.scene)));
  $('#viewport').addEventListener('pointerdown', () => $('.viewer').focus({ preventScroll: true }));
  $('#version').addEventListener('change', event => { rememberPlayback(); selectVersion(state, packet, event.target.value); persist(); render(); $('#version').focus(); });
  document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => { rememberPlayback(); const { scene } = context(state, packet); selectVersion(state, packet, scene.versions.filter(v => v.stage === button.dataset.stage).at(-1).id); persist(); render(); }));
  $('#fullscreen').addEventListener('click', () => { void $('#viewport').requestFullscreen?.().catch(() => say('Full screen is unavailable in this browser.')); });
  $('#capture').addEventListener('click', capture);
  $('#export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ ...feedbackBatch(state, packet), unsavedDrafts: state.drafts }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = `${packet.episodeId}-feedback.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    say('Feedback exported. It has not been sent to chat.');
  });
  const separator = $('.separator'); let origin;
  separator.addEventListener('pointerdown', event => { separator.setPointerCapture(event.pointerId); origin = { x: event.clientX, width: state.panelWidth }; });
  separator.addEventListener('pointermove', event => { if (!origin) return; resize(origin.width + origin.x - event.clientX); });
  separator.addEventListener('pointerup', () => { origin = null; persist(); });
  separator.addEventListener('pointercancel', () => { origin = null; persist(); });
  separator.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); resize(event.key === 'Home' ? 285 : event.key === 'End' ? 480 : state.panelWidth + (event.key === 'ArrowLeft' ? 16 : -16)); persist(); });
}
function resize(value) { state.panelWidth = Math.max(285, Math.min(480, value)); $('.review-body').style.setProperty('--panel', `${state.panelWidth}px`); $('.separator').setAttribute('aria-valuenow', String(state.panelWidth)); }

function stopMedia() {
  mediaAbort?.abort(); lastFrame = null;
  const video = $('video'); video?.pause();
  if (videoCallback && video) video.cancelVideoFrameCallback?.(videoCallback);
  if (mediaBlob) { URL.revokeObjectURL(mediaBlob); mediaBlob = null; }
}
async function mountMedia() {
  const { scene, version, key } = context(state, packet), target = $('#viewport');
  if (version.kind === 'plan') {
    target.innerHTML = `<div class="plan"><span class="eyebrow">${esc(scene.lane)} / ${esc(scene.id)}</span><h2>${esc(scene.title)}</h2><span class="plan-label">Storyboard · Awaiting artwork</span></div>`; return;
  }
  const controller = new AbortController(); mediaAbort = controller;
  try {
    const response = await fetch(version.url, { signal: controller.signal });
    if (!response.ok) throw new Error('This media could not be opened. Reload to retry.');
    const bytes = await response.arrayBuffer();
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map(n => n.toString(16).padStart(2, '0')).join('');
    if (hash !== version.sha256) throw new Error('Media bytes do not match this version.');
    if (controller.signal.aborted) return;
    mediaBlob = URL.createObjectURL(new Blob([bytes], { type: response.headers.get('content-type') ?? (version.kind === 'video' ? 'video/mp4' : 'image/jpeg') }));
    if (version.kind === 'image') {
      target.innerHTML = `<img src="${mediaBlob}" alt="${esc(scene.title)}"><span class="viewport-label">${esc(version.label)}</span>`;
      target.querySelector('img').addEventListener('load', () => { $('#capture').disabled = false; }); return;
    }
    target.innerHTML = `<video playsinline preload="auto" src="${mediaBlob}" aria-label="Review video"></video><span class="viewport-label">${esc(packet.referenceLabel)} · ${esc(version.label)}</span>`;
    const video = target.querySelector('video'), canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    if (!ctx || !video.requestVideoFrameCallback) throw new Error('This browser cannot capture shown frames. Scene notes still work.');
    let pendingFrame;
    const capturePresented = () => {
      if (controller.signal.aborted || !pendingFrame) return;
      if (!video.seeking && video.readyState >= 2) {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0); lastFrame = { canvas, time: pendingFrame.mediaTime, key };
        $('#capture').disabled = false;
      }
    };
    const presented = (_now, meta) => {
      if (controller.signal.aborted) return;
      pendingFrame = meta; capturePresented();
      videoCallback = video.requestVideoFrameCallback(presented);
    };
    videoCallback = video.requestVideoFrameCallback(presented);
    // Chromium can present the first frame before loadeddata makes it drawable.
    video.addEventListener('loadeddata', capturePresented);
    video.addEventListener('seeked', capturePresented);
    video.addEventListener('loadedmetadata', () => {
      $('#seek').max = video.duration; $('#seek').disabled = false;
      ['play', 'previous-frame', 'next-frame'].forEach(id => { $('#' + id).disabled = false; });
      if (state.times[key]) video.currentTime = Math.min(state.times[key], video.duration);
    });
    video.addEventListener('seeking', () => { pendingFrame = null; lastFrame = null; $('#capture').disabled = true; });
    video.addEventListener('timeupdate', () => { $('#time').textContent = timecode(video.currentTime); $('#seek').value = video.currentTime; state.times[key] = video.currentTime; if ($('#comment-time')) $('#comment-time').textContent = draftTimeLabel(state.drafts[key]); });
    const updatePlay = () => { $('#play').innerHTML = icon(video.paused ? 'play' : 'pause'); $('#play').setAttribute('aria-label', video.paused ? 'Play' : 'Pause'); };
    video.addEventListener('play', updatePlay); video.addEventListener('pause', updatePlay);
    $('#play').onclick = () => { if (video.paused) void video.play().catch(() => say('Press play to retry.')); else video.pause(); };
    $('#seek').oninput = event => { const time = Number(event.target.value); if (video.currentTime !== time) video.currentTime = time; };
    $('#previous-frame').onclick = () => { video.pause(); video.currentTime = Math.max(0, video.currentTime - 1 / packet.fps); };
    $('#next-frame').onclick = () => { video.pause(); video.currentTime = Math.min(video.duration, video.currentTime + 1 / packet.fps); };
    video.addEventListener('error', () => say('This video could not play. Scene notes still work.'));
  } catch (error) { if (!controller.signal.aborted) { target.textContent = error.message; say(error.message); } }
}
function capture() {
  const { version, key } = context(state, packet), old = state.drafts[key];
  if (old?.snapshot) { showComments(); openDrawing(); return; }
  try {
    let snapshot, width, height, time = null;
    if (version.kind === 'video') {
      if (!lastFrame || lastFrame.key !== key || $('video').seeking) return;
      $('video').pause(); time = lastFrame.time; snapshot = lastFrame.canvas.toDataURL('image/jpeg', .8); width = lastFrame.canvas.width; height = lastFrame.canvas.height;
    } else {
      const image = $('#viewport>img'), canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; canvas.getContext('2d').drawImage(image, 0, 0); snapshot = canvas.toDataURL('image/jpeg', .8); width = canvas.width; height = canvas.height;
    }
    updateDraft(state, packet, { snapshot, width, height, time, marks: [] }); persist(); showComments(); openDrawing();
  } catch { say('The frame could not be captured. Your text draft is still here.'); }
}
function openDrawing(savedNote) {
  const draft = savedNote ?? state.drafts[context(state, packet).key];
  if (!draft?.snapshot) return;
  const dialog = $('#drawing'), ratio = (draft.width ?? 16) / (draft.height ?? 9);
  dialog.innerHTML = `<header><h2>Frame note <span class="mono">${draft.time === null ? 'Still image' : timecode(draft.time)}</span></h2><button id="drawing-done" aria-label="Done drawing">Done</button></header><div class="drawing-stage"><div class="draft-image" style="aspect-ratio:${ratio};width:min(100%,calc(68dvh * ${ratio}))"><img src="${esc(draft.snapshot)}" alt="Frozen review frame"><svg class="marks" ${savedNote ? 'aria-hidden="true"' : 'id="draft-marks" tabindex="0" aria-label="Draw a rectangle on this frame"'} viewBox="0 0 1000 1000" preserveAspectRatio="none">${marks(draft.marks)}</svg></div></div>${savedNote ? '' : `<footer><button id="undo-mark" ${draft.marks.length ? '' : 'disabled'}>Undo mark</button></footer>`}`;
  $('#drawing-done').onclick = () => dialog.close();
  dialog.onclose = () => { dialog.innerHTML = ''; renderPanel(); $('#note-body')?.focus(); };
  if (!savedNote) {
    $('#undo-mark').onclick = () => { if (commit(() => state.drafts[context(state, packet).key].marks.pop())) { const list = state.drafts[context(state, packet).key].marks; $('#draft-marks').innerHTML = marks(list); $('#undo-mark').disabled = !list.length; renderPanel(); } };
    bindDrawing();
  }
  dialog.showModal(); $('#draft-marks')?.focus();
}
function bindDrawing() {
  const svg = $('#draft-marks'); if (!svg) return;
  const { key } = context(state, packet); let start, mark;
  const point = event => { const r = svg.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)) }; };
  svg.addEventListener('pointerdown', event => { event.preventDefault(); svg.setPointerCapture(event.pointerId); start = point(event); mark = null; });
  svg.addEventListener('pointermove', event => { if (!start) return; const end = point(event); mark = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.abs(end.x - start.x), height: Math.abs(end.y - start.y) }; svg.innerHTML = marks([...state.drafts[key].marks, mark]); });
  const refresh = () => { svg.innerHTML = marks(state.drafts[key].marks); $('#undo-mark').disabled = !state.drafts[key].marks.length; renderPanel(); };
  svg.addEventListener('pointerup', () => { if (mark && mark.width > .005 && mark.height > .005) { state.drafts[key].marks.push(mark); persist(); } start = null; mark = null; refresh(); });
  svg.addEventListener('pointercancel', () => { start = null; mark = null; refresh(); });
  svg.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.repeat) { event.preventDefault(); state.drafts[key].marks.push({ x: .25, y: .25, width: .5, height: .5 }); persist(); refresh(); } });
}

try {
  const response = await fetch('packet.json'); if (!response.ok) throw new Error('Review packet is unavailable. Reload to retry.');
  packet = await response.json(); storageKey = `review-preview:${packet.episodeId}:${packet.revision}`;
  let stored;
  try { stored = JSON.parse(localStorage.getItem(storageKey)); } catch { /* Keep the prior storage untouched when it cannot be read. */ }
  state = createState(packet, stored);
  if (!stored) selectScene(state, packet, packet.initialScene);
  render();
  document.addEventListener('keydown', shortcuts);
  window.addEventListener('pagehide', rememberPlayback);
} catch (error) { app.textContent = error.message; }
