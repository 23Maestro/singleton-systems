const $ = s => document.querySelector(s);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const message = text => { $('#message').textContent = text; };
async function request(url, options, denied = 'Open your private Studio link to continue.') {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(response.status === 401 ? denied : 'Studio couldn’t load this request. Try again.');
  return response.json();
}
const command = value => request('/api/studio/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
async function load() {
  const rows = await request('/api/studio/projects');
  const projectId = new URL(location.href).searchParams.get('project');
  const selected = rows.find(row => row.projectId === projectId);
  $('#clients').hidden = false;
  $('#projects').hidden = false;
  $('#intro').textContent = 'Open an edit or check what is ready for review.';
  if (projectId && !selected) message('This project is no longer in Studio.');
  for (const group of document.querySelectorAll('[data-client]')) {
    const matching = rows.filter(row => row.client === group.dataset.client &&
      (row.status === 'active' || row.projectId === projectId));
    group.querySelector('.edits').innerHTML = matching.length ? matching.map(row => {
      const id = escapeHtml(row.projectId);
      const urlId = encodeURIComponent(row.projectId);
      const title = escapeHtml(row.title);
      const detail = row.status === 'closed' ? 'Closed' : (row.hasPacket || row.storyboardUrl) ? 'Ready for review' : 'No scenes yet';
      const review = row.hasPacket
        ? `<a class="action" href="review.html?project=${urlId}">Review scenes</a>`
        : row.storyboardUrl ? `<a class="action" href="${escapeHtml(row.storyboardUrl)}">Review storyboard</a>` : '';
      const sourceChat = row.sourceChatId
        ? `<a class="action" href="codex://threads/${encodeURIComponent(row.sourceChatId)}">Open source chat</a>` : '';
      const remove = `<button type="button" data-delete="${id}" data-title="${title}">Delete project</button>`;
      return `<article class="project" id="project-${id}" tabindex="-1">
        <h3>${title}</h3><p class="muted">${detail}</p>
        ${review || sourceChat || remove ? `<div class="actions">${review}${sourceChat}${remove}</div>` : ''}
      </article>`;
    }).join('') : '<p class="muted">No active edits</p>';
  }
  if (selected) document.getElementById('project-' + selected.projectId)?.focus();
}
$('#create').addEventListener('submit', async event => {
  event.preventDefault(); message('');
  const owner = $('#owner').value, id = $('#task').value.trim();
  if (Boolean(owner) !== Boolean(id)) return message('Enter a task owner and task ID together.');
  try { await command({ action: 'create', projectId: crypto.randomUUID(), client: $('#client').value, title: $('#title').value.trim(), task: owner ? { owner, id } : null }); $('#title').value = ''; $('#task').value = ''; $('#owner').value = ''; await load(); }
  catch (error) { message(error.message); }
});
$('#clients').addEventListener('click', async event => {
  const button = event.target.closest('[data-delete]'); if (!button) return;
  if (!window.confirm(`Delete ${button.dataset.title} and its saved reviews from Studio?`)) return;
  button.disabled = true;
  try { await command({ action: 'delete', projectId: button.dataset.delete }); await load(); message('Project deleted.'); }
  catch (error) { button.disabled = false; message(error.message); }
});
async function openStudio() {
  message('');
  try {
    const url = new URL(location.href);
    const access = new URLSearchParams(url.hash.slice(1)).get('access');
    if (access !== null) {
      url.hash = '';
      history.replaceState(history.state, '', url);
      await request('/api/studio/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access }),
      }, 'This Studio link is invalid. Open your current private link.');
    }
    await load();
  } catch (error) {
    $('#intro').textContent = '';
    message(error.message);
  }
}
window.addEventListener('hashchange', () => {
  if (new URLSearchParams(location.hash.slice(1)).has('access')) void openStudio();
});
await openStudio();
