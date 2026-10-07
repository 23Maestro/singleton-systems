/* Static glyph textures for Template 2. rig.data.js remains the editable source.
 * Letter builds finish live, then the same paused timeline switches to one PNG.
 * Dynamic labels opt out with data-rig-text="live".
 */
(function () {
  const selector = '.c-title,.c-kicker,.c-sub,.c-stat-value,.c-stat-label,.c-icon-label,.c-quote-line,.c-quote-by,.c-card-stat-top,.c-card-stat-bottom,[data-rig-text]';
  const properties = ['font-family','font-size','font-weight','font-style','font-stretch','font-variant','font-variant-numeric',
    'line-height','letter-spacing','word-spacing','text-align','text-transform','text-indent','white-space','word-break',
    'overflow-wrap','color','text-shadow','text-decoration','-webkit-text-fill-color','-webkit-text-stroke-width','-webkit-text-stroke-color'];
  function nodes(root) {
    return [...root.querySelectorAll(selector)].filter(el => !el.closest('[data-rig-text="live"]')).map((el,index) => {
      el.dataset.rigTextId = `text-${String(index).padStart(3,'0')}`;
      return el;
    });
  }
  function describe(root,tl) {
    return nodes(root).map(el => {
      const css = getComputedStyle(el);
      const builds = tl.getTweensOf([...el.querySelectorAll('.ltr')]);
      return {id:el.dataset.rigTextId,text:el.textContent,width:parseFloat(css.width),height:parseFloat(css.height),
        style:Object.fromEntries(properties.map(p=>[p,css.getPropertyValue(p)])),
        readyAt:Math.max(0,...builds.map(tween=>tween.endTime()))};
    });
  }
  async function apply(root,tl,manifest) {
    if (new URLSearchParams(location.search).has('text-authoring')) return;
    if (!manifest) throw new Error('Static text assets are missing. Run npm run text:bake.');
    const elements = nodes(root), current = describe(root,tl);
    if (manifest.entries.length !== current.length) throw new Error('Static text inventory changed. Run npm run text:bake.');
    for (let i=0;i<current.length;i++) {
      const now=current[i],asset=manifest.entries[i],el=elements[i];
      if (now.text!==asset.text || JSON.stringify(now.style)!==JSON.stringify(asset.style) ||
          Math.abs(now.width-asset.width)>.02 || Math.abs(now.height-asset.height)>.02) {
        throw new Error(`Static text ${now.id} changed. Run npm run text:bake.`);
      }
      const live=document.createElement('span');live.className='rig-text-live';
      while(el.firstChild)live.appendChild(el.firstChild);
      Object.assign(live.style,{display:'block',width:'100%',height:'100%'});
      const image=document.createElement('img');image.className='rig-text-image';image.alt=asset.text;
      image.src=new URL(asset.src,document.baseURI).href;
      Object.assign(image.style,{position:'absolute',left:`-${asset.padding}px`,top:`-${asset.padding}px`,
        width:`${asset.canvasWidth}px`,height:`${asset.canvasHeight}px`,maxWidth:'none',pointerEvents:'none',visibility:'hidden'});
      Object.assign(el.style,{position:'relative',width:`${asset.width}px`,height:`${asset.height}px`});
      el.append(live,image);
      await image.decode();
      tl.set(image,{visibility:'hidden'},0).set(live,{visibility:'visible'},0);
      tl.set(live,{visibility:'hidden'},now.readyAt).set(image,{visibility:'visible'},now.readyAt);
    }
    root.dataset.rigTextState='baked';
  }
  window.RigText={nodes,describe,apply,properties};
})();
