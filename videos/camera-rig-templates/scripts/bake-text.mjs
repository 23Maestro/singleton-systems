import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile,writeFile,mkdir,readdir,lstat,symlink,unlink,realpath } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath,pathToFileURL } from 'node:url';
import path from 'node:path';

const args=process.argv.slice(2);
const option=name=>{const at=args.indexOf(name);return at<0?undefined:args[at+1];};
const project=path.resolve(option('--project')??path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const client=option('--client');
const scale=Number(option('--scale')??2),padding=16;
if(!client)throw new Error('Name the storage client with --client.');
if(!Number.isFinite(scale)||scale<2||scale>8)throw new Error('Text scale must be between 2 and 8.');
const gate=option('--storage-gate')??fileURLToPath(new URL('../../../scripts/developer-storage/storage-gate.mjs',import.meta.url));
const storage=execFileSync(process.execPath,[gate,'route','--client',client,'--kind','source'],{encoding:'utf8'}).trim();
const sourceFiles=['index.html','rig.data.js','rig.js','rig.css','stable-text.js',
  ...(await readdir(path.join(project,'assets/fonts'))).sort().map(n=>`assets/fonts/${n}`)];
const sources=[];
for(const file of sourceFiles)sources.push({file,sha256:createHash('sha256').update(await readFile(path.join(project,file))).digest('hex')});
const fingerprint=createHash('sha256').update(JSON.stringify({sources,scale,padding})).digest('hex');
const directory=path.join(storage,'template-2-text',fingerprint);
await mkdir(directory,{recursive:true});
const browser=await chromium.launch({headless:true});
const entries=[];
try {
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:scale});
  await page.goto(pathToFileURL(path.join(project,'index.html')).href+'?text-authoring=1');
  await page.waitForFunction(()=>Boolean(window.__timelines?.main));
  await page.evaluate(async()=>{await document.fonts.ready;window.__timelines.main.seek(window.__timelines.main.duration(),false);});
  const labels=await page.evaluate(()=>{
    const descriptions=RigText.describe(document.getElementById('root'),window.__timelines.main);
    return RigText.nodes(document.getElementById('root')).map((el,i)=>{
      const copy=el.cloneNode(true),originals=[el,...el.querySelectorAll('*')],copies=[copy,...copy.querySelectorAll('*')];
      originals.forEach((original,k)=>{
        const css=getComputedStyle(original),target=copies[k];
        target.removeAttribute('id');target.removeAttribute('style');
        for(const p of RigText.properties)target.style.setProperty(p,css.getPropertyValue(p));
        target.style.display=k?css.display:'block';
        target.style.transform='none';target.style.opacity='1';target.style.filter='none';
      });
      Object.assign(copy.style,{position:'absolute',margin:'0',padding:'0',border:'0',background:'transparent',
        width:`${descriptions[i].width}px`,height:`${descriptions[i].height}px`});
      return {...descriptions[i],html:copy.outerHTML};
    });
  });
  await page.evaluate(()=>{
    document.getElementById('root').style.display='none';
    document.body.style.background='transparent';document.documentElement.style.background='transparent';
  });
  for(const label of labels) {
    if(!(label.width>0&&label.height>0))throw new Error(`Text ${label.id} has no authored box.`);
    const canvasWidth=Math.ceil(label.width)+2*padding,canvasHeight=Math.ceil(label.height)+2*padding;
    await page.evaluate(({html,canvasWidth,canvasHeight,padding})=>{
      document.getElementById('text-export')?.remove();
      const surface=document.createElement('div');surface.id='text-export';
      Object.assign(surface.style,{position:'absolute',left:'0',top:'0',width:`${canvasWidth}px`,height:`${canvasHeight}px`,background:'transparent'});
      surface.innerHTML=html;surface.firstElementChild.style.left=`${padding}px`;surface.firstElementChild.style.top=`${padding}px`;
      document.body.appendChild(surface);
    },{...label,canvasWidth,canvasHeight,padding});
    const png=await page.locator('#text-export').screenshot({omitBackground:true});
    const meta=await sharp(png).metadata(),alpha=(await sharp(png).stats()).channels[3];
    if(!meta.hasAlpha||alpha.min!==0||alpha.max!==255)throw new Error(`${label.id} must retain transparent background and opaque glyphs.`);
    await writeFile(path.join(directory,`${label.id}.png`),png);
    const {html,...entry}=label;
    entries.push({...entry,src:`assets/stable-text/${label.id}.png`,padding,canvasWidth,canvasHeight,
      pixelWidth:meta.width,pixelHeight:meta.height,alpha:[alpha.min,alpha.max],sha256:createHash('sha256').update(png).digest('hex')});
  }
}finally{await browser.close();}
const manifest={version:1,scale,padding,fingerprint,sources,entries,
  method:'Static native-font alpha textures after letter builds; dynamic text opts out; regenerate before check/preview/render.'};
await writeFile(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(directory,'manifest.js'),`window.RIG_TEXT_ASSETS=${JSON.stringify(manifest)};\n`);
const link=path.join(project,'assets/stable-text');
try {
  const info=await lstat(link);
  if(!info.isSymbolicLink())throw new Error('Existing text asset directory preserved; choose a symlink to the gated HomeSSD source.');
  if(await realpath(link)!==await realpath(directory))await unlink(link);
}catch(error){if(error.code!=='ENOENT')throw error;}
try{await symlink(directory,link,'dir');}catch(error){if(error.code!=='EEXIST')throw error;}
console.log(JSON.stringify({directory,labels:entries.length,scale,fingerprint}));
