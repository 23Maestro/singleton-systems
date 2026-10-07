/* Camera-rig engine. The camera move, depth and timing are locked here; content, environment and skin are not.
 *
 * Usage (inside a composition):  const { tl, total } = Rig.build(rootEl, window.RIG_DATA);
 *
 * Measured from the Prime TNF card wall (tnf-prime-cardwall-IMG_3656.MOV):
 *   step move  0.70 s in the reference, slowed to 1.20 s with a custom slow-ramp-settle bezier; the stop being left ends ~40% of frame width off centre at ~30% size
 *   whip move  1.20 s in the reference (now 1.50 s) with a 0.20 s anticipation push; the stop being left ends ~37% off centre at ~14% size;
 *              flare + overexposure flash over the arrival
 *   holds      slow push-in so the frame never freezes; content builds after the camera lands
 * Stops alternate sides (zig-zag) and step forward in depth, so every stop already visited stays in the scene behind.
 */
(function () {
  const W = 1920, H = 1080;
  const LOCK = {
    perspective: 1600,
    // peak = fraction of the move where the bezier is fastest (recompute if the bezier changes)
    // eases are cubic beziers (After Effects style influence): slow start, ramp, long settle. Longer second handle = longer settle.
    step: { dur: 1.20, prevScale: 0.30, prevX: 0.40, prevY: -0.05, ease: "rig-step", bezier: "0.60,0,0.15,1", peak: 0.39 },
    whip: { dur: 1.50, prevScale: 0.14, prevX: 0.37, prevY: -0.10, ease: "rig-whip", bezier: "0.70,0,0.10,1", peak: 0.42, anticipation: 0.20, yaw: 9 },
    holdPush: 0.04,            // fraction of perspective the camera creeps forward during a hold
    holdDriftX: 18,            // px of sideways drift during a hold
    dimPast: 0.75,             // opacity of stops the camera has left (dark scene, so this reads as dimming)
    driftX: 0,                 // optional sideways drift per move (fraction of frame width); 0 keeps exits symmetric
    fadeOlder: 0,              // opacity of stops two or more moves behind (the reference keeps only the last one)
    buildDelay: 0.10,          // first stop starts building this long after t=0; later stops start 0.15 s before landing
    parallax: 0.06,            // far background follows this fraction of the camera's travel
    floorY: 560,               // floor plane height below the first stop
  };

  gsap.registerPlugin(CustomEase);
  CustomEase.create("rig-step", LOCK.step.bezier);
  CustomEase.create("rig-whip", LOCK.whip.bezier);

  // seeded PRNG (mulberry32) so scattered letters land the same way every render
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ---------- components: any stop may use raw `html`, or one of these helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const lines = (arr) => (arr || []).map((l) => `<div class="c-quote-line" data-b="letters">${esc(l)}</div>`).join("");
  const by = (d) => (d.by ? `<div class="c-quote-by" data-b="rise">- ${esc(d.by)}</div>` : "");
  const C = {
    headline: (d) => `<div class="c-headline">
        ${d.kicker ? `<div class="c-kicker" data-b="rise">${esc(d.kicker)}</div>` : ""}
        <div class="c-title" data-b="letters">${esc(d.title)}</div>
        <div class="c-rule" data-b="line"></div>
        ${d.sub ? `<div class="c-sub" data-b="rise">${esc(d.sub)}</div>` : ""}</div>`,
    stat: (d) => `<div class="c-stat">
        <div class="c-stat-value" data-b="letters">${esc(d.value)}</div>
        <div class="c-rule" data-b="line"></div>
        <div class="c-stat-label" data-b="rise">${esc(d.label)}</div></div>`,
    icons: (d) => `<div class="c-icons">
        ${d.title ? `<div class="c-title c-title-sm" data-b="letters">${esc(d.title)}</div>` : ""}
        <div class="c-icon-row">${(d.items || []).map((it) => `<div class="c-icon" data-b="pop">
            <div class="c-icon-glyph">${it.svg || (it.img ? `<img src="${it.img}" alt="">` : esc(it.glyph || ""))}</div>
            <div class="c-icon-label">${esc(it.label)}</div></div>`).join("")}</div></div>`,
    quote: (d) => `<div class="c-quote">
        ${d.title ? `<div class="c-title c-title-sm" data-b="letters">${esc(d.title)}</div>` : ""}
        ${lines(d.lines)}${by(d)}</div>`,
    card: (d) => {
      const side = d.layout === "side";
      const imgs = d.images || [d.image];
      return `<div class="c-card ${side ? "c-card-side" : ""}">
        ${!side && d.title ? `<div class="c-card-head"><div class="c-title" data-b="letters">${esc(d.title)}</div>
           ${d.sub ? `<div class="c-sub" data-b="letters">${esc(d.sub)}</div>` : ""}</div>` : ""}
        <div class="c-card-media">
          ${(d.side || []).slice(0, 1).map((s) => `<div class="c-frame c-frame-side" data-b="slide-l" data-at="1.0"><img src="${s}" alt=""></div>`).join("")}
          <div class="c-frame c-frame-hero" data-b="frame" data-at="0.3">${imgs.map((s, k) => `<img class="c-swap" data-k="${k}" src="${s}" alt="">`).join("")}</div>
          ${(d.side || []).slice(1, 2).map((s) => `<div class="c-frame c-frame-side" data-b="slide-r" data-at="1.0"><img src="${s}" alt=""></div>`).join("")}
        </div>
        ${side ? `<div class="c-card-text">${d.title ? `<div class="c-title c-title-sm" data-b="letters">${esc(d.title)}</div>` : ""}${lines(d.lines)}${by(d)}</div>` : ""}
        ${(d.stats || []).length ? `<div class="c-card-stats" data-exit="fade">${d.stats.map((s) => `<div class="c-card-stat">
            <div class="c-card-stat-top" data-b="letters">${esc(s.top)}</div>
            ${s.bottom ? `<div class="c-card-stat-bottom" data-b="letters">${esc(s.bottom)}</div>` : ""}</div>`).join("")}</div>` : ""}
        ${!side && (d.lines || []).length ? `<div class="c-card-quote">${lines(d.lines)}${by(d)}</div>` : ""}</div>`;
    },
  };

  /* ---------- builds: what content does after the camera lands ---------- */
  function splitLetters(el) {               // letters grouped per word, so lines only wrap between words
    const words = el.textContent.split(/\s+/).filter(Boolean); el.textContent = "";
    words.forEach((w, wi) => {
      const ws = document.createElement("span"); ws.className = "wrd";
      for (const ch of w) { const s = document.createElement("span"); s.className = "ltr"; s.textContent = ch; ws.appendChild(s); }
      el.appendChild(ws); if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return el.querySelectorAll(".ltr");
  }
  function addBuilds(tl, stopEl, t0, seed) {
    const rand = rng(seed);
    let auto = 0;
    [...stopEl.querySelectorAll("[data-b]")].forEach((el) => {
      const at = t0 + (el.dataset.at !== undefined ? +el.dataset.at : auto);
      const kind = el.dataset.b;
      if (kind === "letters") {
        const ls = splitLetters(el);
        ls.forEach((l, i) => tl.fromTo(l, { opacity: 0, x: (rand() - 0.5) * 36, y: 18 + rand() * 26, rotation: (rand() - 0.5) * 14 },
          { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.42, ease: "power3.out" }, at + i * 0.018));
        auto += Math.min(0.5, 0.12 + ls.length * 0.012);
      } else if (kind === "line") {
        tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.32, ease: "power2.out" }, at); auto += 0.12;
      } else if (kind === "frame") {
        const box = document.createElement("div"); box.className = "c-draw";
        box.innerHTML = '<i class="d-top"></i><i class="d-left"></i><i class="d-right"></i><i class="d-bottom"></i>';
        el.appendChild(box);
        tl.fromTo(box.querySelector(".d-top"), { scaleX: 0 }, { scaleX: 1, duration: 0.18, ease: "power2.out" }, at);
        tl.fromTo(box.querySelectorAll(".d-left,.d-right"), { scaleY: 0 }, { scaleY: 1, duration: 0.22, ease: "power2.inOut" }, at + 0.14);
        tl.fromTo(box.querySelector(".d-bottom"), { scaleX: 0 }, { scaleX: 1, duration: 0.16, ease: "power2.out" }, at + 0.34);
        tl.fromTo(el.querySelector("img"), { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none" }, at + 0.32);   // only the first photo; later ones swap in
        tl.fromTo(el, { "--glow": 0 }, { "--glow": 1, duration: 0.4, ease: "power1.out" }, at + 0.4);
        auto += 0.55;
      } else if (kind === "slide-l" || kind === "slide-r") {
        const dir = kind === "slide-l" ? 1 : -1;
        tl.fromTo(el, { x: dir * 230, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, at); auto += 0.08;
      } else if (kind === "pop") {
        tl.fromTo(el, { opacity: 0, scale: 0.86, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" }, at); auto += 0.14;
      } else { // rise
        tl.fromTo(el, { opacity: 0, y: 22, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, at);
        tl.set(el, { filter: "none" }, at + 0.45); auto += 0.16;   // drop the filter once sharp, so the hold creep stays sub-pixel
      }
    });
    // photo swaps inside a hero frame during the hold, one every 1.5 s
    stopEl.querySelectorAll(".c-frame-hero").forEach((f) => {
      f.querySelectorAll(".c-swap").forEach((im, k) => { if (k) { tl.set(im, { opacity: 0 }, 0); tl.to(im, { opacity: 1, duration: 0.4, ease: "sine.inOut" }, t0 + 1.4 + k * 1.5); } });
    });
  }

  /* ---------- the rig ---------- */
  function build(root, data) {
    const P = data.perspective || LOCK.perspective;
    const stage = root.querySelector(".rig-stage"), world = root.querySelector(".rig-world");
    stage.style.perspective = P + "px";
    const stops = data.stops;
    const moveOf = (i) => LOCK[stops[i].move === "whip" ? "whip" : "step"];

    // place stops on the locked zig-zag: each move leaves the previous stop at a fixed screen position and size
    const pos = [{ x: 0, y: 0, z: 0 }];
    for (let i = 1; i < stops.length; i++) {
      const m = moveOf(i), side = i % 2 === 1 ? 1 : -1;     // stop 1 sits right (stop 0 exits left), stop 2 left ...
      const p = pos[i - 1];
      pos.push({ x: p.x + (side * m.prevX * W + LOCK.driftX * W) / m.prevScale, y: p.y - (m.prevY * H) / m.prevScale, z: p.z + P * (1 / m.prevScale - 1) });
    }
    const els = stops.map((s, i) => {
      const el = document.createElement("div");
      el.className = "rig-stop" + (s.className ? " " + s.className : "");
      el.innerHTML = `<div class="rig-stop-inner">${s.html || (C[s.type] ? C[s.type](s) : "")}</div>`;
      el.style.transform = `translate3d(${pos[i].x}px, ${pos[i].y}px, ${pos[i].z}px)`;
      world.appendChild(el);
      return el;
    });

    const tl = gsap.timeline({ paused: true });
    const cam = (i) => ({ x: -pos[i].x, y: -pos[i].y, z: -pos[i].z });
    tl.set(world, { ...cam(0), rotationY: 0 }, 0);
    tl.set(els, { opacity: 1 }, 0);   // no CSS filters on stops: a filter re-rasterises text in screen space every frame and the glyphs snap
    const env = root.querySelector(".rig-env-far"), dolly = root.querySelector(".rig-dolly");
    // floor: centred under the whole path so it is always in frame
    const floor = root.querySelector(".rig-floor");
    if (floor) { const zs = pos.map((p) => p.z), xs = pos.map((p) => p.x);
      const cz = (Math.min(...zs) + Math.max(...zs)) / 2, cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      floor.style.transform = `translate3d(${cx}px, ${LOCK.floorY}px, ${cz}px) rotateX(90deg)`; }
    const fl = root.querySelector(".rig-flare"), fx = root.querySelector(".rig-flash");

    let t = 0;
    stops.forEach((s, i) => {
      const hold = s.hold ?? 6, drift = i % 2 === 0 ? 1 : -1;
      // content builds after the camera lands; a whip arrival starts mid-flight so the stop swings in already drawn
      addBuilds(tl, els[i], t + (i === 0 ? LOCK.buildDelay : s.move === "whip" ? -0.85 : -0.15), 1000 + i * 77);
      const inner = els[i].firstElementChild;
      tl.set(inner, { willChange: "transform" }, t);   // freeze raster scale for the hold so the slow creep moves sub-pixel instead of snapping glyphs
      tl.to(world, { z: -pos[i].z + P * LOCK.holdPush, x: -pos[i].x + drift * LOCK.holdDriftX, duration: hold, ease: "sine.inOut" }, t);
      t += hold;
      if (i === stops.length - 1) return;
      const m = moveOf(i + 1), whip = stops[i + 1].move === "whip";
      tl.set(inner, { willChange: "auto" }, t);
      const exits = els[i].querySelectorAll('[data-exit="fade"]');
      if (exits.length) tl.to(exits, { opacity: 0, duration: 0.25, ease: "power1.in" }, t + 0.05);
      tl.to(els[i], { opacity: LOCK.dimPast, duration: m.dur * 0.6, ease: "power1.inOut" }, t + m.dur * 0.4);
      if (i >= 1) tl.to(els[i - 1], { opacity: LOCK.fadeOlder, duration: m.dur, ease: "power1.inOut" }, t);
      if (env) tl.to(env, { x: pos[i + 1].x * -LOCK.parallax, y: pos[i + 1].y * -LOCK.parallax, scale: 1 + i * 0.02 + 0.02, duration: m.dur, ease: m.ease }, t);   // far background parallax
      if (whip) {
        // anticipation rides on the dolly layer and overlaps the main move, so velocity never drops to zero
        if (dolly) tl.fromTo(dolly, { z: 0 }, { keyframes: [{ z: P * 0.05, duration: m.anticipation, ease: "sine.out" }, { z: 0, duration: 0.45, ease: "sine.inOut" }], immediateRender: false }, t);
        tl.to(world, { ...cam(i + 1), duration: m.dur, ease: m.ease }, t);
        // yaw, flare and flash all key off the ease's peak-speed point, so nothing snaps on during the slow settle
        const pk = t + m.dur * m.peak;
        tl.fromTo(world, { rotationY: 0 }, { keyframes: [{ rotationY: drift * m.yaw, duration: pk - t, ease: "sine.inOut" }, { rotationY: 0, duration: t + m.dur - pk, ease: "power2.out" }], immediateRender: false }, t);
        if (fl) tl.fromTo(fl, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.in", yoyo: true, repeat: 1, immediateRender: false }, pk - 0.22);
        if (fx) tl.fromTo(fx, { opacity: 0 }, { keyframes: [{ opacity: 0.2, duration: 0.12, ease: "power1.in" }, { opacity: 0, duration: 0.4, ease: "power2.out" }], immediateRender: false }, pk - 0.12);
      } else {
        tl.to(world, { ...cam(i + 1), duration: m.dur, ease: m.ease }, t);
      }
      t += m.dur;
    });
    return { tl, total: t, positions: pos, lock: LOCK };
  }

  window.Rig = { build, LOCK, components: C };
})();
