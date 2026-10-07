import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// Approved seams: native composition seek/rendered state and exported pixels.
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const seek=async(page,time)=>{
  await page.evaluate(t=>{window.__timelines.main.seek(t,false);},time);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
};

test('Template 2 uses a high-resolution alpha heading after its letter build and restores it on reverse seeks',async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1920,height:1080}});
    await page.addInitScript(()=>{window.__timelines={};});
    await page.goto(pathToFileURL(path.join(project,'index.html')).href);
    await page.waitForFunction(()=>Boolean(window.__timelines.main));
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
    await seek(page,1.5);
    const heading=page.getByRole('img',{name:'CAMERA RIG',exact:true});
    assert.equal(await heading.count(),1,'settled heading is the baked text image');
    const asset=await heading.evaluate(img=>({src:img.src,width:parseFloat(getComputedStyle(img).width),nativeWidth:img.naturalWidth}));
    assert.ok(asset.nativeWidth>=asset.width*2,'glyph texture has at least two source pixels per authored pixel');
    const alpha=(await sharp(await readFile(fileURLToPath(asset.src))).stats()).channels[3];
    assert.equal(alpha.min,0,'background is transparent');
    assert.equal(alpha.max,255,'glyphs retain solid ink');
    const first=await sharp(await heading.screenshot()).raw().toBuffer();
    await seek(page,4.6);
    await seek(page,1.5);
    assert.deepEqual(await sharp(await heading.screenshot()).raw().toBuffer(),first,'heading paint survives a move and backward seek');
    await seek(page,.15);
    const before=page.getByRole('img',{name:'CAMERA RIG',exact:true,includeHidden:true});
    assert.equal(await before.evaluate(img=>getComputedStyle(img).visibility),'hidden','letter build remains live before the full-text image');
    await seek(page,1.5);
    assert.equal(await heading.isVisible(),true);
    assert.equal(await page.locator('#root').getAttribute('data-rig-total'),'21.40','demo timing stays locked');
  }finally{await browser.close();}
});
