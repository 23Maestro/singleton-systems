import { createState, context, selectScene, selectVersion, updateDraft, updateStatus, saveNote, feedbackBatch, statuses, stages, stageLabel, newestInStage, togglePlanView, versionChoices } from './model.mjs';
import { panelTabs, planMarkup, planningPanel, cardPreview } from './presentation.mjs';

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
const projectId = new URL(location.href).searchParams.get('project');
let autoplayNext = false;      // a storyboard card pick plays its motion from the start
let packet, state, storageKey, mediaAbort, mediaBlob, lastFrame, messageTimer, videoCallback;
let onlineVersion = 0, onlineBusy = false, onlineConflict = false;
let chatSendEnabled = false;
let chatTimer;

function savedReview() {
  return { statuses: state.statuses, notes: state.notes };
}
function canonicalReview(value) {
  return JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
}
async function readReview() {
  const query = new URLSearchParams({ projectId, reviewRevision: packet.revision });
  const response = await fetch('/api/studio/projects?' + query);
  if (!response.ok) throw new Error('Studio could not read this review. Reload to retry.');
  return response.json();
}
function refreshReviewButtons() {
  if (!$('#send-review')) return;
  const sentVersion = state.chatSend?.version === onlineVersion;
  $('#send-review').disabled = !chatSendEnabled || onlineBusy || onlineConflict || state.reviewDirty || onlineVersion < 1 || sentVersion;
  $('#send-review').textContent = sentVersion ? (state.chatSend.status === 'delivered' ? 'Sent to chat' : 'Queued for chat') : 'Send to chat';
}
// Notes and statuses save on their own. A save that meets a newer online review merges both
// (notes by id, this browser's statuses win) and saves again, so nobody's note is lost.
let saveTimer, saveAgain = false;
function scheduleSave() {
  if (!projectId) return;
  clearTimeout(saveTimer); saveTimer = setTimeout(saveReview, 600);
}
function mergeOnline(online) {
  const notes = new Map((online.feedback?.notes ?? []).map(note => [note.id, note]));
  for (const note of state.notes) notes.set(note.id, note);
  state.statuses = { ...(online.feedback?.statuses ?? {}), ...state.statuses };
  state.notes = [...notes.values()];
  onlineVersion = online.version; onlineConflict = false;
}
// A new publish replaces the packet revision. Pick it up, keep this browser's notes and statuses, re-render.
async function refreshPacket() {
  if (!projectId) return false;
  const response = await fetch(`/api/studio/projects?projectId=${encodeURIComponent(projectId)}`);
  if (!response.ok) return false;
  const data = await response.json(); const next = JSON.parse(data?.packet ?? 'null');
  if (!next?.scenes?.length || next.revision === packet.revision) return false;
  const keep = { statuses: state.statuses, notes: state.notes, drafts: state.drafts, planView: state.planView, panelOpen: state.panelOpen, panelWidth: state.panelWidth, panelTab: state.panelTab, selected: state.selected };
  packet = Object.assign(next, { title: data.title, client: data.client, intake: '' });
  storageKey = `review-preview:${projectId}:${packet.revision}`;
  state = Object.assign(createState(packet), keep, { reviewDirty: true });
  if (!packet.scenes.some(scene => scene.id === state.selected)) state.selected = packet.scenes[0].id;
  const online = await readReview(); mergeOnline(online);
  persist(); render();
  return true;
}
async function saveReview(retry = true) {
  if (onlineBusy) { saveAgain = true; return; }
  const feedback = structuredClone(savedReview());
  onlineBusy = true;
  refreshReviewButtons();
  try {
    const response = await fetch('/api/studio/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save-review', projectId, revision: packet.revision,
        expectedVersion: onlineVersion, feedback,
      }),
    });
    if (response.status === 409 && retry) {
      if (!await refreshPacket()) { mergeOnline(await readReview()); persist(); render(); }
      onlineBusy = false; return saveReview(false);
    }
    if (!response.ok) throw new Error('Studio could not save this review. Your edits are still in this browser.');
    const receipt = await response.json();
    const stored = await readReview();
    if (stored.version !== receipt.version || canonicalReview(stored.feedback) !== canonicalReview(feedback)) {
      saveAgain = true;
    }
    onlineVersion = stored.version;
    state.reviewBaseVersion = onlineVersion;
    state.reviewDirty = canonicalReview(savedReview()) !== canonicalReview(feedback);
    persist();
    if (state.reviewDirty) saveAgain = true;
  } catch (error) {
    say(error.message);
  } finally {
    onlineBusy = false;
    refreshReviewButtons();
    if (saveAgain) { saveAgain = false; scheduleSave(); }
  }
}

async function sendReview() {
  if ($('#send-review').disabled) return;
  onlineBusy = true;
  refreshReviewButtons();
  try {
    const response = await fetch('/api/studio/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'queue-chat-send', projectId, revision: packet.revision, version: onlineVersion }),
    });
    if (!response.ok) throw new Error('Studio could not queue the saved review. Reload to try again.');
    const receipt = await response.json();
    state.chatSend = { ...receipt, version: onlineVersion };
    persist();
    if (receipt.status === 'delivered' && receipt.turnId) say('Saved review sent to the source chat.');
    else {
      say('Saved review queued for the source chat.');
      void checkChatSend();
    }
  } catch (error) {
    say(error.message);
  } finally {
    onlineBusy = false;
    refreshReviewButtons();
  }
}

async function checkChatSend() {
  clearTimeout(chatTimer);
  const send = state.chatSend;
  if (!send || send.status === 'delivered') return;
  try {
    const query = new URLSearchParams({ projectId, chatSendId: send.requestId });
    const response = await fetch('/api/studio/projects?' + query, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Studio could not check the chat receipt.');
    const receipt = await response.json();
    if (receipt.requestId !== send.requestId || state.chatSend?.requestId !== send.requestId) return;
    if (receipt.status === 'delivered' && receipt.turnId) {
      state.chatSend = { ...send, ...receipt };
      persist();
      refreshReviewButtons();
      say('Saved review sent to the source chat.');
      return;
    }
  } catch {
    say('Saved review is queued. Waiting for the source chat receipt.');
  }
  chatTimer = setTimeout(checkChatSend, 3000);
}

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
  if (projectId && canonicalReview(savedReview()) !== canonicalReview({ statuses: before.statuses, notes: before.notes })) {
    state.reviewDirty = true;
    scheduleSave();
  }
  if (persist()) {
    refreshReviewButtons();
    return true;
  }
  state = before;
  return false;
}
const statusLabel = status => status === 'Changes Requested' ? 'Changes' : status;
function badge(status = 'Needs Review') { return `<span class="badge" data-status="${esc(status)}">${esc(statusLabel(status))}</span>`; }
function statusMenu(scene) {
  const status = state.statuses[scene.id] ?? 'Needs Review';
  return `<select id="scene-status" aria-label="Scene status" data-status="${esc(status)}">${statuses.map(s => `<option value="${esc(s)}" ${s === status ? 'selected' : ''}>${esc(statusLabel(s))}</option>`).join('')}</select>`;
}
function bindStatusMenu() {
  $('#scene-status').addEventListener('change', event => setStatus(event.target.value));
}
function timecode(seconds = 0) {
  const frames = Math.round(seconds * packet.fps), fps = packet.fps;
  return [Math.floor(frames / (fps * 3600)), Math.floor(frames / (fps * 60)) % 60, Math.floor(frames / fps) % 60, frames % fps].map(x => String(x).padStart(2, '0')).join(':');
}
function stageButtons(scene, version) {
  return stages.map((stage, i) => `<button class="stage" data-stage="${stage}" ${stage === version.stage ? 'aria-current="step"' : ''} ${scene.versions.some(v => v.stage === stage) ? '' : 'disabled'}><b>${String(i + 1).padStart(2, '0')}</b>${stageLabel(stage)}</button>`).join('');
}
function render() {
  stopMedia();
  const { scene, version } = context(state, packet);
  app.innerHTML = `<main class="workspace">
    <header class="topbar"><div class="brand"><span class="brand-mark">s</span>studio</div><div class="breadcrumb"><span>${esc(packet.client)}</span><span>/</span><strong>${esc(packet.title)}</strong></div><span class="pilot">${esc(packet.intake)}</span><span class="avatar" aria-label="Jerami">JS</span></header>
    <div class="stagebar"><nav class="stages" aria-label="Production stage" title="P switches every scene between the plan and the built version">${stageButtons(scene, version)}</nav><div class="stage-scene"><div class="scene-heading"><h1>${esc(scene.title)}</h1></div><span id="outer-status">${statusMenu(scene)}</span></div><div class="viewer-actions">${(() => { const list = versionChoices(scene, version); return list.length > 1 ? `<select id="version" aria-label="Review version">${list.map(v => `<option value="${esc(v.id)}" ${v.id === version.id ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}</select>` : ''; })()}<button id="panel-toggle" class="icon" aria-label="${state.panelOpen ? 'Hide' : 'Show'} review panel" aria-keyshortcuts="Meta+B" aria-controls="review-panel" aria-expanded="${state.panelOpen}">${icon('panel')}</button></div></div>
    <div class="review-body ${state.panelOpen ? '' : 'panel-closed'}" style="--panel:${state.panelWidth}px">
      <section class="viewer ${version.stage === 'Plan' ? 'plan-view' : ''}" aria-label="Scene viewer" tabindex="0" aria-keyshortcuts="ArrowLeft ArrowRight A C P Space F Escape">
        <div class="viewport-wrap"><div class="viewport" id="viewport"><p class="muted">Opening version…</p></div></div>
        <div class="transport ${version.stage === 'Plan' ? 'plan-transport' : ''}"><button class="icon play" id="play" aria-label="Play" disabled>${icon('play')}</button><button class="icon" id="previous-frame" aria-label="Previous frame" disabled>${icon('back')}</button><button class="icon" id="next-frame" aria-label="Next frame" disabled>${icon('next')}</button><span class="mono time" id="time">${timecode(state.times[`${scene.id}:${version.id}`] ?? 0)}</span><input type="range" id="seek" aria-label="Playback position" min="0" max="${scene.duration}" step="${1 / packet.fps}" value="0" disabled><span class="source-time mono">${scene.duration.toFixed(2)}s</span><button class="capture" id="capture" disabled>${icon('camera')} <span>Frame note</span></button><button class="icon" id="fullscreen" aria-label="Full screen">${icon('expand')}</button></div>
      </section>
      <button class="separator" role="separator" aria-label="Resize review panel" aria-orientation="vertical" aria-valuemin="285" aria-valuemax="480" aria-valuenow="${state.panelWidth}" tabindex="0"></button>
      <aside class="panel" id="review-panel" aria-label="Scene review" ${state.panelOpen ? '' : 'inert'}><header class="panel-head"><h2>Scene review <span class="mono">${esc(scene.id)}</span></h2><button class="icon" id="panel-close" aria-label="Close review panel">${icon('close')}</button></header><nav id="panel-tabs" class="panel-tabs" role="tablist" aria-label="Review panel"></nav><div class="panel-content" id="panel-content"></div><footer class="panel-footer"><button id="export">Export feedback ${icon('arrow')}</button><button id="send-review" class="send" disabled>Send to chat</button></footer></aside>
    </div>
    <section class="storyboard" aria-label="Storyboard"><header class="storyboard-head"><h2>Storyboard</h2><span class="mono">${packet.scenes.length} ${packet.scenes.length === 1 ? 'scene' : 'scenes'}</span></header><div class="cards">${packet.scenes.map(c => `<button class="scene-card" data-scene="${esc(c.id)}" aria-label="Scene ${esc(c.id)}: ${esc(c.title)}" aria-current="${scene.id === c.id}">${cardPreview(c)}<span class="mono card-id">${esc(c.id)}</span><span class="mono card-duration">${c.duration.toFixed(2)}s</span><div class="card-info"><p class="card-title">${esc(c.title)}</p></div><span class="card-status" data-status-scene="${esc(c.id)}">${badge(state.statuses[c.id])}</span></button>`).join('')}</div></section>
    <dialog class="drawing-dialog" id="drawing" aria-label="Frame note"></dialog>
  </main>`;
  renderPanel(); bind(); refreshReviewButtons(); void mountMedia();
}

function renderPanel() {
  const { scene, version, key } = context(state, packet), draft = state.drafts[key];
  const notes = state.notes.filter(note => note.sceneId === scene.id && note.versionId === version.id);
  const tabs = panelTabs(version), active = tabs.includes(state.panelTab) ? state.panelTab : 'comments';
  $('#panel-tabs').innerHTML = tabs.map(tab => `<button role="tab" id="tab-${tab}" aria-controls="panel-${tab}" aria-selected="${active === tab}" tabindex="${active === tab ? 0 : -1}" data-panel-tab="${tab}">${tab[0].toUpperCase()+tab.slice(1)}</button>`).join('');
  $('#panel-content').innerHTML = `<div role="tabpanel" id="panel-${active}" aria-labelledby="tab-${active}">${active !== 'comments' ? planningPanel(scene, active) : `
    <section class="panel-section"><div class="section-title"><h3 class="comments-title">Comments <span class="note-count">${notes.length}</span></h3></div><div id="notes">${notes.length ? notes.map(noteMarkup).join('') : '<p class="empty-notes">No notes on this version.</p>'}</div>
      ${draft?.snapshot ? `<button class="draft-image draft-preview" id="edit-drawing" aria-label="Edit drawing" style="aspect-ratio:${draft.width ?? 16}/${draft.height ?? 9}"><img src="${esc(draft.snapshot)}" alt="Frozen frame for this draft"><svg class="marks" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">${marks(draft.marks)}</svg></button><div class="draft-tools"><button id="clear-frame">Remove frame</button></div>` : ''}
      <form class="composer" id="note-form"><textarea id="note-body" aria-label="Comment on this version" placeholder="Leave a note…" maxlength="6000" required>${esc(draft?.body ?? '')}</textarea><div class="composer-footer"><span class="draft-target mono" id="comment-time">${draftTimeLabel(draft)}</span><button id="save-note" type="submit" aria-keyshortcuts="Meta+Enter" ${draft?.body.trim() ? '' : 'disabled'}>Post comment <kbd aria-hidden="true">⌘↵</kbd></button></div></form></section>`}</div>`;
  document.querySelectorAll('[data-panel-tab]').forEach(button => {
    const activate = tab => { state.panelTab = tab; persist(); renderPanel(); $(`#tab-${tab}`).focus(); };
    button.addEventListener('click', () => activate(button.dataset.panelTab));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const index = tabs.indexOf(active); activate(event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(index + (event.key === 'ArrowLeft' ? -1 : 1) + tabs.length) % tabs.length]);
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
  $('#outer-status').innerHTML = statusMenu(context(state, packet).scene); bindStatusMenu();
  document.querySelector(`[data-status-scene="${state.selected}"]`).innerHTML = badge(status);
  document.querySelectorAll('.status-buttons button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.status === status)));
  return true;
}
function goToScene(id) {
  if (id === state.selected) return;
  rememberPlayback(); selectScene(state, packet, id); persist(); autoplayNext = true;
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
  } else if (key === 'p') {
    event.preventDefault(); rememberPlayback(); togglePlanView(state); persist(); render();
    say(state.planView ? 'Showing the plan for every scene.' : 'Showing the built version for every scene.');
    $('.viewer').focus({ preventScroll: true });
  } else if (key === 'f' && !$('#capture').disabled) {
    event.preventDefault(); capture();
  }
}
function bind() {
  bindStatusMenu();
  $('#panel-toggle').addEventListener('click', () => togglePanel(!state.panelOpen));
  $('#panel-close').addEventListener('click', () => togglePanel(false));
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => goToScene(button.dataset.scene)));
  $('#viewport').addEventListener('pointerdown', () => $('.viewer').focus({ preventScroll: true }));
  $('#version')?.addEventListener('change', event => { rememberPlayback(); selectVersion(state, packet, event.target.value); persist(); render(); $('#version').focus(); });
  document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => { rememberPlayback(); const { scene } = context(state, packet); selectVersion(state, packet, newestInStage(scene, button.dataset.stage).id); persist(); render(); }));
  $('#fullscreen').addEventListener('click', () => { void $('#viewport').requestFullscreen?.().catch(() => say('Full screen is unavailable in this browser.')); });
  $('#capture').addEventListener('click', capture);
  $('#send-review').addEventListener('click', sendReview);
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
  if (version.kind !== 'video') autoplayNext = false;
  if (version.kind === 'plan') {
    target.innerHTML = planMarkup(scene); return;
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
      target.innerHTML = `<img src="${mediaBlob}" alt="${esc(scene.title)}">`;
      target.querySelector('img').addEventListener('load', () => { $('#capture').disabled = false; }); return;
    }
    target.innerHTML = `<video playsinline preload="auto" src="${mediaBlob}" aria-label="Review video"></video>`;
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
      if (autoplayNext) {
        autoplayNext = false; video.currentTime = 0;
        void video.play().catch(() => say('Tap play to start.'));
      } else if (state.times[key]) video.currentTime = Math.min(state.times[key], video.duration);
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
  const response = await fetch(projectId ? `/api/studio/projects?projectId=${encodeURIComponent(projectId)}` : 'packet.json');
  if (!response.ok) throw new Error('Review packet is unavailable. Reload to retry.');
  const data = await response.json();
  packet = projectId ? JSON.parse(data?.packet ?? 'null') : data;
  if (!packet || !Array.isArray(packet.scenes) || !packet.scenes.length) throw new Error('No scenes are ready for this project.');
  if (projectId) {
    packet.title = data.title;
    packet.client = data.client;
    packet.intake = '';
    chatSendEnabled = data.chatSendEnabled === true;
  }
  storageKey = `review-preview:${projectId ?? packet.episodeId}:${packet.revision}`;
  let stored;
  try { stored = JSON.parse(localStorage.getItem(storageKey)); } catch { /* Keep the prior storage untouched when it cannot be read. */ }
  state = createState(packet, stored);
  if (!stored) selectScene(state, packet, packet.initialScene);
  if (projectId) {
    const online = await readReview();
    onlineVersion = online.version;
    const hasLocalEdits = state.reviewDirty ??
      (state.notes.length > 0 || Object.keys(state.statuses).length > 0);
    if (hasLocalEdits) {
      mergeOnline(online);
      state.reviewBaseVersion = onlineVersion;
      state.reviewDirty = canonicalReview(savedReview()) !== canonicalReview(online.feedback);
      if (state.reviewDirty) scheduleSave();
    } else {
      Object.assign(state, online.feedback, { reviewBaseVersion: onlineVersion, reviewDirty: false });
    }
    persist();
  }
  render();
  document.addEventListener('keydown', shortcuts);
  if (projectId) void checkChatSend();
  window.addEventListener('pagehide', () => { rememberPlayback(); clearTimeout(chatTimer); });
  document.addEventListener('visibilitychange', () => {        // back on the tab: pick up a newer publish
    if (document.visibilityState === 'visible') void refreshPacket().then(changed => { if (changed) { say('Studio updated to the newest version.'); scheduleSave(); } });
  });
} catch (error) { app.textContent = error.message; }
