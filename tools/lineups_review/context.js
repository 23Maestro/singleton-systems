function reviewTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${(seconds % 60).toFixed(2).padStart(5, '0')}`;
}
function readReviewChoices(key, scenes, initial = {}) {
  try {
    const raw = localStorage.getItem(key);
    const saved = raw === null ? initial : JSON.parse(raw);
    if (!saved || Array.isArray(saved) || typeof saved !== 'object') return {};
    return Object.fromEntries(scenes.filter(scene => ['approved', 'denied'].includes(saved[scene.id])).map(scene => [scene.id, saved[scene.id]]));
  } catch { return {}; }
}
function saveReviewChoices(key, choices) {
  try { localStorage.setItem(key, JSON.stringify(choices)); }
  catch {
    document.querySelectorAll('.review-help').forEach(note => {
      if (note.textContent.startsWith('Choices stay')) note.textContent = 'This browser cannot keep your choices. Save the file before you leave.';
    });
  }
}
function reviewChoiceLabel(choice, post = false) {
  return choice === 'approved' ? (post ? 'Ready' : 'Build this') : choice === 'denied' ? (post ? 'Needs a fix' : 'Skipped') : 'Not picked';
}
function renderReviewContext(scene) {
  const esc = reviewEscape;
  const cues = (scene.cues || []).map(cue => `<li><strong>“${esc(cue.word)}”</strong> at ${reviewTime(cue.timestamp)}<span>Show at ${Number(cue.sceneTime).toFixed(2)} seconds in this scene.</span></li>`).join('');
  return `<div class="cue-context"><p><strong>Scene starts at ${reviewTime(scene.anchor)}</strong></p>${cues ? `<ul>${cues}</ul>` : ''}<details><summary>Timing check</summary><p>The word times passed the Manim check. Figma uses these times for the motion. Premiere uses the scene start.</p><a href="evidence/cue-proof-receipt.json" target="_blank" rel="noopener">View timing proof</a></details></div>`;
}
