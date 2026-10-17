import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const lock=read(path.join(root,'config/lineups/review-template.json'));
const source=path.join(root,'tools/lineups_review');
assert.deepEqual(lock.stages,['pre-figma','post-figma']);
assert.equal(lock.approvedBy,'Jerami');
for(const [name,digest] of Object.entries(lock.files))assert.equal(hash(path.join(source,name)),digest,`Review template drift: ${name}`);
const maps=path.join(root,'public/decision-maps');
const gates=read(path.join(root,'config/lineups/review-gates.json'));
const activePackets=new Set(gates.filter(g=>g.preFigma?.path).map(g=>path.dirname(path.resolve(root,g.preFigma.path))));
const packets=new Set(fs.existsSync(maps)?fs.readdirSync(maps).filter(n=>fs.existsSync(path.join(maps,n,'review-template.json'))).map(n=>path.join(maps,n)):[]);
for(const packet of activePackets)packets.add(packet);
for(const packet of packets){
  const name=path.basename(packet),receipt=read(path.join(packet,'review-template.json'));
  assert.equal(receipt.templateId,lock.templateId,`${name}: wrong review template`);
  const expected=activePackets.has(packet)||receipt.version===lock.version?lock:(lock.previousVersions||[]).find(v=>v.version===receipt.version);
  assert.ok(expected,`${name}: unrecognized review template version`);
  assert.equal(receipt.version,expected.version,`${name}: stale review template`);
  assert.deepEqual(receipt.files,expected.files,`${name}: stale template sources`);
  for(const [file,digest] of Object.entries(expected.files)){
    if(/\.(css|js)$/.test(file))assert.equal(hash(path.join(packet,'assets',file)),digest,`${name}: altered ${file}`);
  }
  for(const file of ['index.html','post-figma.html']){
    assert.equal(hash(path.join(packet,file)),receipt.pages[file],`${name}: altered ${file}`);
    const html=fs.readFileSync(path.join(packet,file),'utf8');
    assert.doesNotMatch(html,/<style\b/i,`${name}: episode CSS override`);
    const styles=[...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1]);
    assert.deepEqual(styles,['assets/review-base.css','assets/asset-selection.css']);
  }
}
console.log(`Lineups review template locked: both stages; ${packets.size} packet(s) verified.`);
