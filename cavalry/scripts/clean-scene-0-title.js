// Cavalry UI Script: remove generated Scene 0 builder layers.
// This keeps imported assets and unrelated scene layers untouched.

var generatedNames = {
    "Scene 0 tabletop field": true,
    "Scene 0 paper contact shadow": true,
    "Scene 0 lower paper edge": true,
    "Archive card background": true,
    "Top rule": true,
    "Bottom rule": true,
    "Archive label": true,
    "Sequence number": true,
    "Footer label": true,
    "1940s - intro": true,
    "1944 - reveal": true,
    "Year prefix 194": true,
    "Year decade zero": true,
    "Year decade suffix": true,
    "Year replacement four": true,
    "Researcher 01": true,
    "Researcher 02": true,
    "Researcher 03": true,
    "Researcher 04": true,
    "Choose Courage logo": true,
    "Persistent visible test": true
    ,"Etched caption": true
    ,"Top-right registration mark": true
    ,"Top-right registration tick": true
    ,"Bottom-left registration mark": true
    ,"Bottom-left registration tick": true
};

// Collect first. Deleting while iterating the returned stack can skip the
// next layer as the hierarchy compacts.
var layers = api.getCompLayers(true);
var owned = layers.filter(function (layerId) {
    return generatedNames[api.getNiceName(layerId)];
});
var removed = 0;

owned.reverse().forEach(function (layerId) {
    api.deleteLayer(layerId);
    removed += 1;
});

console.info("Removed " + removed + " generated Scene 0 layers. Assets and unrelated layers were preserved.");
