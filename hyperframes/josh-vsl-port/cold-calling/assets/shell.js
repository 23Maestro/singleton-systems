/* ============================================================
   Shared timing + spring math for the Josh VSL HyperFrames port.

   The Remotion sources declare fps={29.97} and the approved masters
   are 30000/1001 containers, so every offset is frame * 1001/30000
   and each scene's frame count lands on an exact duration.
   ============================================================ */
window.JOSH = (function () {
  const T = (f) => (f * 1001) / 30000;

  /* enter() in ProductStorySystem:
       spring({damping:19, stiffness:135, mass:0.7}, durationInFrames:34)
     Damping ratio 0.977 — OVERDAMPED, so it never overshoots and
     back.out() would be wrong in both shape and direction. These are the
     values Remotion's own spring() returns at each frame of the window,
     replayed as a lookup ease so every rendered frame samples a table node. */
  const ENTER = [
    0, 0.020649, 0.071898, 0.141153, 0.219495, 0.300749, 0.380772, 0.456905, 0.527561, 0.591918,
    0.649678, 0.700904, 0.745888, 0.785061, 0.818929, 0.848027, 0.872888, 0.894024, 0.911912,
    0.926309, 0.93965, 0.950245, 0.959082, 0.96643, 0.972523, 0.977561, 0.981716, 0.985135,
    0.98794, 0.990237, 0.992113, 0.993643, 0.994886, 0.995896, 0.996713, 1,
  ];

  /* outcomeIn in ColdCallingProductStory:
       spring({damping:16, stiffness:130, mass:0.72}, durationInFrames:38)
     This one DOES overshoot, peaking at 1.0098 near frame 30. */
  const OUTCOME = [
    0, 0.016054, 0.057833, 0.117164, 0.187529, 0.263821, 0.342122, 0.4142, 0.493853, 0.563711,
    0.628151, 0.686659, 0.739041, 0.78534, 0.825775, 0.860684, 0.890484, 0.915634, 0.936615,
    0.953904, 0.967964, 0.979231, 0.98811, 0.994972, 1.000146, 1.003929, 1.006425, 1.008315,
    1.009332, 1.009792, 1.00983, 1.009558, 1.009066, 1.00843, 1.007708, 1.006943, 1.006172,
    1.005419, 1.004703, 1,
  ];

  const tableEase = (tbl) => {
    const n = tbl.length - 1;
    return (p) => {
      const x = p * n;
      const i = Math.min(Math.floor(x), n - 1);
      return tbl[i] + (tbl[i + 1] - tbl[i]) * (x - i);
    };
  };

  const enterEase = tableEase(ENTER);
  const outcomeEase = tableEase(OUTCOME);
  const ED = T(ENTER.length - 1);

  /* Scene frame — ENTRANCE ONLY.

     The source's `exit = clamp(frame,[dur-12,dur-1],[1,0])` fade is
     deliberately NOT carried over, and neither is its ambient blob.
     Every scene animates in and then HOLDS on its final frame, so the
     editor owns every transition instead of inheriting one baked at a
     fixed 12-frame length. Nothing in this port fades out.

     `totalFrames` is kept in the signature so each scene still declares
     its length at the call site; it is intentionally unused here. */
  function shell(tl, totalFrames) {
    tl.fromTo(
      ".appbar",
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: ED, ease: enterEase },
      0,
    );
  }

  /* Discrete `frame < N ? A : B` swaps. Both variants live in the DOM;
     the set lands mid-frame so frame N-1 shows A and frame N shows B. */
  function swap(tl, frame, hideSel, showSel) {
    tl.set(hideSel, { visibility: "hidden" }, T(frame - 0.5));
    tl.set(showSel, { visibility: "visible" }, T(frame - 0.5));
  }

  /* Waterfall arrival — gaps shrink across the cascade, travel shortens,
     the last element snaps. Opacity is binary via tl.set, never a fade. */
  function waterfall(tl, items) {
    items.forEach(([sel, at, dy, dur]) => {
      tl.set(sel, { opacity: 1, y: dy }, T(at));
      tl.to(sel, { y: 0, duration: T(dur), ease: "power4.out" }, T(at));
    });
  }

  return { T, ED, ENTER, OUTCOME, tableEase, enterEase, outcomeEase, shell, swap, waterfall };
})();
