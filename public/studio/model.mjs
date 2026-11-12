export const statuses = ['In Progress', 'Needs Review', 'Changes Requested', 'Approved'];
export const stages = ['Plan', 'Artwork', 'Motion', 'Revisions'];

export function createState(packet, stored) {
  const initial = { episodeId: packet.episodeId, revision: packet.revision, selected: packet.scenes[0]?.id,
    versions: {}, statuses: {}, drafts: {}, notes: [], times: {}, panelOpen: true, panelWidth: 350, panelTab: 'comments', planView: false };
  if (stored?.episodeId !== packet.episodeId || stored?.revision !== packet.revision) return initial;
  const state = { ...initial, ...stored };
  if (state.panelTab === 'scene') state.panelTab = 'plan';
  if (!['comments', 'plan', 'timing', 'needs'].includes(state.panelTab)) state.panelTab = 'comments';
  if (!packet.scenes.some(scene => scene.id === state.selected)) state.selected = initial.selected;
  return state;
}

// Versions are listed newest first. A scene opens on its furthest built output (Revisions, then Motion, then
// Artwork); a scene with nothing built yet opens on its Plan. planView flips every scene to its Plan instead.
const outputStages = ['Revisions', 'Motion', 'Artwork'];
export const newestInStage = (scene, stage) => scene.versions.find(item => item.stage === stage);
export function defaultVersion(scene, planView = false) {
  const plan = newestInStage(scene, 'Plan');
  if (planView && plan) return plan;
  for (const stage of outputStages) { const found = newestInStage(scene, stage); if (found) return found; }
  return plan ?? scene.versions[0];
}

export function togglePlanView(state) {
  state.planView = !state.planView;
  state.versions = {};            // a manual version pick lasts until the next view switch
}

export function context(state, packet) {
  const scene = packet.scenes.find(item => item.id === state.selected);
  if (!scene) throw new Error('Select an existing scene.');
  const version = scene.versions.find(item => item.id === state.versions[scene.id]) ?? defaultVersion(scene, state.planView);
  if (!version) throw new Error('This scene has no review version.');
  return { scene, version, key: `${scene.id}:${version.id}` };
}

export function selectScene(state, packet, id) {
  const scene = packet.scenes.find(item => item.id === id);
  if (!scene) throw new Error('Scene not found.');
  state.selected = id;
}

export function selectVersion(state, packet, id) {
  const { scene } = context(state, packet);
  if (!scene.versions.some(item => item.id === id)) throw new Error('Version not found.');
  state.versions[scene.id] = id;
}

export function updateStatus(state, packet, status) {
  if (!statuses.includes(status)) throw new Error('Choose an existing status.');
  state.statuses[context(state, packet).scene.id] = status;
}

export function updateDraft(state, packet, changes) {
  const { key } = context(state, packet);
  state.drafts[key] = { body: '', time: null, snapshot: null, marks: [], ...state.drafts[key], ...changes };
}

export function saveNote(state, packet, id) {
  const { scene, version, key } = context(state, packet), draft = state.drafts[key];
  if (!draft?.body.trim()) throw new Error('Add a note first.');
  if (state.notes.some(note => note.id === id)) throw new Error('This note is already saved.');
  state.notes.push({ id, episodeId: packet.episodeId, sceneId: scene.id, versionId: version.id,
    mediaSha256: version.sha256, ...draft, body: draft.body.trim(), replies: [], resolved: false });
  delete state.drafts[key];
}

export function feedbackBatch(state, packet) {
  return { schemaVersion: 1, episodeId: packet.episodeId, packetRevision: packet.revision,
    statuses: { ...state.statuses }, notes: structuredClone(state.notes), delivery: 'not-sent', productionApproval: false };
}
