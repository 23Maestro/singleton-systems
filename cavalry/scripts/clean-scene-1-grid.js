// Cavalry UI Script: remove generated Scene 1 grid layers.
// Keeps Scene 0 and unrelated authored layers untouched.

var layers = api.getCompLayers(true);
var removed = 0;

layers.reverse().forEach(function (layerId) {
    var name = api.getNiceName(layerId);
    if (name.indexOf("Scene 1 ") === 0) {
        api.deleteLayer(layerId);
        removed += 1;
    }
});

console.info("Removed " + removed + " generated Scene 1 layers.");
