import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const map = JSON.parse(readFileSync(new URL('./timing.json', import.meta.url)));
const html = readFileSync(new URL('./compositions/captions.html', import.meta.url), 'utf8')
  .replace(/ data-hf-id="[^"]+"/g, '');

test('caption markup and GSAP switches use the validated word map', () => {
  for (const cue of map.cues) {
    let content = cue.text.replaceAll('\n', '<br>');
    for (const phrase of cue.accentPhrases || []) content = content.replace(phrase, `<span class="accent">${phrase}</span>`);
    const expected = `<p id="${cue.id}" class="phrase" data-word-start="${cue.firstWord}" data-word-end="${cue.lastWord}" data-start-frame="${cue.startFrame}" data-end-frame="${cue.endFrame}">${content}</p>`;
    assert.ok(html.includes(expected), cue.id);
    assert.ok(html.includes(`tl.set("#${cue.id}", { opacity: 1 }, ${cue.startFrame}/60);`));
    assert.ok(html.includes(`tl.set("#${cue.id}", { opacity: 0 }, ${cue.endFrame}/60);`));
  }
  assert.equal(map.transcriptStatus, 'Completed');
  assert.equal(map.duration, 10);
  assert.ok(html.includes(`font-size:${map.style.fontSize}px`));
  assert.ok(html.includes(`top:${map.style.centerY}px`));
  assert.ok(html.includes('text-transform:uppercase'));
  assert.ok(html.includes(`width:${map.style.maxWidth}px`));
  const brand = JSON.parse(readFileSync(new URL('../../config/745-creative/visual-contract.json', import.meta.url)));
  assert.equal(map.style.accentColor, brand.clients.pastor_john.brand.palette.violetPop);
  assert.ok(html.includes(`.accent {color:${map.style.accentColor};}`));
});

test('test stays caption-only and retains native dialogue audio', () => {
  const root = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  assert.equal((root.match(/data-track-kind="captions"/g) || []).length, 1);
  assert.ok(root.includes('data-has-audio="true"'));
  assert.ok(!root.includes('opening.png'));
  assert.ok(!root.includes('muted'));
  assert.ok(!html.includes('.from('));
});
