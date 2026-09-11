import assert from 'node:assert/strict';

const near = (a, b) => Math.abs(a - b) < 0.0001;
const finite = values => values.every(Number.isFinite);

// Image transforms map the painted rectangle into normalized source coordinates.
// usableBounds excludes padding baked into a source photograph.
export function assertPhotoCoverage(scene, image, usableBounds = [0, 0, 1, 1]) {
  const f = image.fills[0];
  assert.ok(f && finite(usableBounds), `${scene.id}: missing photo evidence`);
  const m = image.absoluteTransform;
  const root = scene.absoluteTransform;
  assert.ok(near(m[0][0], 1) && near(m[1][1], 1) && near(m[0][1], 0) && near(m[1][0], 0), `${scene.id}: unsupported rotated photo`);
  const x = m[0][2] - root[0][2], y = m[1][2] - root[1][2];
  assert.ok(x <= 0.01 && y <= 0.01 && x + image.width >= scene.width - 0.01 && y + image.height >= scene.height - 0.01, `${scene.id}: photo rectangle leaves an uncovered edge`);
  let t = f.transform;
  if (f.mode === 'FILL') {
    const scale = Math.max(image.width / f.size.width, image.height / f.size.height);
    const w = image.width / (f.size.width * scale), h = image.height / (f.size.height * scale);
    t = [[w, 0, (1 - w) / 2], [0, h, (1 - h) / 2]];
  } else assert.equal(f.mode, 'CROP', `${scene.id}: full-frame photography cannot use FIT or TILE`);
  assert.ok(t && finite(t.flat()), `${scene.id}: invalid photo transform`);
  const [left, top, right, bottom] = usableBounds;
  for (const px of [0, scene.width]) for (const py of [0, scene.height]) {
    const u = (px - x) / image.width, v = (py - y) / image.height;
    const sx = t[0][0] * u + t[0][1] * v + t[0][2];
    const sy = t[1][0] * u + t[1][1] * v + t[1][2];
    assert.ok(sx >= left - 0.0001 && sx <= right + 0.0001 && sy >= top - 0.0001 && sy <= bottom + 0.0001, `${scene.id}: usable photograph does not cover the frame`);
  }
}

export function assertPush(image) {
  const track = image.tracks.SCALE_XY;
  assert.ok(track?.length >= 2, `${image.id}: missing full-clip push`);
  assert.ok(near(track[0].value.value.x, 1) && near(track[0].value.value.y, 1), `${image.id}: push must start at 100%`);
  let previous = 1, time = -Infinity;
  for (const k of track) {
    const {x, y} = k.value.value;
    assert.ok(finite([x, y, k.time]) && near(x, y) && x >= previous - 0.0001 && k.time > time, `${image.id}: push shrinks, stretches or has invalid timing`);
    assert.ok(['CUSTOM_CUBIC_BEZIER', 'EASE_IN_AND_OUT', 'LINEAR', 'EASE_OUT', 'EASE_IN'].includes(k.easing), `${image.id}: unverified scale easing`);
    previous = x; time = k.time;
  }
  assert.ok(near(previous, 1.025), `${image.id}: push must finish at 102.5%`);
  for (const key of Object.keys(image.tracks)) assert.ok(['SCALE_XY', 'OPACITY'].includes(key), `${image.id}: additional motion needs coverage proof`);
}

export function assertVisibleSubject(subject) {
  const {current: a, baseline: b} = subject;
  for (const bounds of [a, b]) assert.ok(bounds && finite([bounds.x, bounds.y, bounds.width, bounds.height]) && bounds.width > 0 && bounds.height > 0, `${subject.id}: missing visible-art bounds`);
  for (const dimension of ['width', 'height']) assert.ok(Math.abs(a[dimension] / b[dimension] - 1) <= 0.1001, `${subject.id}: visible subject size changed over 10%`);
  assert.ok(Math.abs((a.x + a.width / 2) - (b.x + b.width / 2)) <= 192.01 && Math.abs(a.y - b.y) <= 108.01, `${subject.id}: subject moved over 10% of the frame`);
  assert.ok(subject.hasAlpha === true, `${subject.id}: swap requires true alpha`);
}

export function visibleSubjectBounds(scene, image, sourceBounds) {
  const f = image.fills[0];
  let t = f.transform;
  if (f.mode === 'FIT') {
    const scale = Math.min(image.width / f.size.width, image.height / f.size.height);
    const w = f.size.width * scale, h = f.size.height * scale;
    t = [[image.width / w, 0, -(image.width - w) / (2 * w)], [0, image.height / h, -(image.height - h) / (2 * h)]];
  }
  assert.ok(t && near(t[0][1], 0) && near(t[1][0], 0) && t[0][0] > 0 && t[1][1] > 0, `${image.id}: unsupported alpha transform`);
  const m = image.absoluteTransform, root = scene.absoluteTransform;
  const [l, top, r, bottom] = sourceBounds;
  const x = Math.max(0, (l - t[0][2]) / t[0][0] * image.width);
  const y = Math.max(0, (top - t[1][2]) / t[1][1] * image.height);
  const right = Math.min(image.width, (r - t[0][2]) / t[0][0] * image.width);
  const lower = Math.min(image.height, (bottom - t[1][2]) / t[1][1] * image.height);
  return {x: m[0][2] - root[0][2] + x, y: m[1][2] - root[1][2] + y, width: right - x, height: lower - y};
}

export function assertHeadPattern(pattern) {
  if (pattern.kind === 'three') {
    assert.ok(pattern.center.top < pattern.left.top && pattern.center.top < pattern.right.top, 'Three subjects: center helmet must be highest');
  } else {
    assert.ok(Math.abs(pattern.left.top - pattern.right.top) <= 30, 'Two subjects: helmet heights do not match');
    assert.ok(Math.abs(pattern.left.outerMargin - pattern.right.outerMargin) <= 48, 'Two subjects: outside padding is unbalanced');
    assert.ok(Math.min(pattern.left.outerMargin, pattern.right.outerMargin) >= 80, 'Two subjects: player is too close to the outside edge');
  }
}
