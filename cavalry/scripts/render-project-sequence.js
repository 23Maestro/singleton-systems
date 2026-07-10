var outputRoot = "/Users/singleton23/Documents/1940s-Cavalry-Project/Renders/scene-0-timed-10s/frame";
for (var frame = 0; frame < 250; frame += 1) {
    api.setFrame(frame);
    api.renderPNGFrame(outputRoot + ("000" + frame).slice(-4), 100);
}
api.setFrame(235);
console.info("Rendered 250 frames to the Scene 0 timed sequence folder.");
