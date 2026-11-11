import assert from 'node:assert/strict';
import test from 'node:test';
import { panelTabs, planMarkup, planningPanel } from './presentation.mjs';

test('planning information stays in Plan; every other stage keeps comments', () => {
  assert.deepEqual(panelTabs({stage:'Plan'}),['plan','timing','needs','comments']);
  for (const stage of ['Artwork','Motion','Revisions']) assert.deepEqual(panelTabs({stage}),['comments']);
});

test('rank plans contain only a large team name and validated colors', () => {
  const markup=planMarkup({presentation:{layout:'rank',headline:'Cincinnati Bengals',background:'#fb4f14',foreground:'#111111'}});
  assert.match(markup, /plan-rank/);
  assert.match(markup, /<h2>Cincinnati Bengals<\/h2>/);
  assert.doesNotMatch(markup, /Timing|Needs|Source photo|Build Storyboard|viewport-label/);
  const unsafe=planMarkup({presentation:{layout:'rank',headline:'<img onerror="alert(1)">',background:'red;url(x)',foreground:'#ffffff'}});
  assert.doesNotMatch(unsafe, /<img|url\(x\)/);
});

test('timing and missing assets are readable data outside the visual', () => {
  const scene={cues:[{timestamp:73.961,sceneTime:.32,word:'offense',action:'Reveal offense'}],missingAssets:['Vikings offense photo']};
  assert.match(planningPanel(scene,'timing'), /<table/);
  assert.match(planningPanel(scene,'timing'), /01:13\.961/);
  assert.match(planningPanel(scene,'needs'), /Vikings offense photo/);
  assert.doesNotMatch(planningPanel(scene,'needs'), /01:13/);
});
