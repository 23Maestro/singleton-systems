/* Template 2 demo data. Edit this file per video; the camera move lives in rig.js and does not change.
 * Each stop: { type: headline|stat|icons|quote|card, ...fields }  or  { html: "<any markup>" }
 *   hold  seconds the camera stays on the stop (default 6)
 *   move  how the camera arrives: "step" (1.2 s) or "whip" (1.5 s with flare). Stop 0 has no move.
 * Total length = sum(hold) + 1.2 per step + 1.5 per whip. Set the same number on #root data-duration in index.html.
 */
const ICON = {
  text: '<svg viewBox="0 0 100 100"><path d="M22 26h56M50 26v52"/></svg>',
  icons: '<svg viewBox="0 0 100 100"><path d="M50 16l10 22 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3z"/></svg>',
  stats: '<svg viewBox="0 0 100 100"><path d="M22 80V56M42 80V36M62 80V48M82 80V22"/></svg>',
  photos: '<svg viewBox="0 0 100 100"><rect x="16" y="24" width="68" height="52" rx="6"/><path d="M24 70l18-20 14 14 10-10 12 16"/><circle cx="66" cy="38" r="5"/></svg>',
};
window.RIG_DATA = {
  stops: [
    { type: "headline", hold: 4.0, kicker: "TEMPLATE 2", title: "CAMERA RIG", sub: "Locked move. Any content." },
    { type: "icons", move: "step", hold: 4.0, title: "ANY COMPONENT", items: [
      { svg: ICON.text, label: "TEXT" }, { svg: ICON.icons, label: "ICONS" }, { svg: ICON.stats, label: "STATS" }, { svg: ICON.photos, label: "PHOTOS" } ] },
    { type: "stat", move: "step", hold: 4.0, value: "1.20s", label: "SLOW · RAMP · SETTLE" },
    { type: "card", move: "whip", hold: 5.5, layout: "side", images: ["assets/img/sample-photo-1.jpg", "assets/img/sample-photo-2.jpg"],
      title: "SWAP THE WORLD", lines: ["Environment, colors and type change.", "The move stays locked."], by: "Camera rig v1" },
  ],
};
