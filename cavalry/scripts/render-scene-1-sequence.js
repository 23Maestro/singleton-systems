var outputRoot = "/Users/singleton23/Documents/1940s-Cavalry-Project/Renders/scene-1-grid-cavalry/frame";
for (var frame = 0; frame < 180; frame += 1) {
    api.setFrame(frame);
    api.renderPNGFrame(outputRoot + ("000" + frame).slice(-4), 100);
}
api.setFrame(150);
console.info("Rendered 180 frames to the Scene 1 Cavalry grid sequence folder.");
