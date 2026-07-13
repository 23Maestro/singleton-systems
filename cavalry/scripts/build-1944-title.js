// Cavalry UI Script: build Scene 0, "1940s -> 1944".
//
// The composition is an institutional archive card, not a logo sting. This
// Cavalry-only version owns the full shot: flat paper depth, typography,
// researcher plates, and a clean editorial hold for Premiere.
//
// Install: Help > Show Scripts Folder, copy this file into that folder, then
// run it from Window > Scripts. Set Gotham Book/Bold in the Attribute Editor
// after it runs if the Adobe activation is not available to Cavalry yet.

var beat = {
    paperIn: 0,
    paperSettled: 28,
    headerIn: 16,
    headerSettled: 34,
    titleIn: 40,
    titleSettled: 72,
    decadeOut: 118,
    decadeGone: 130,
    yearIn: 132,
    yearSettled: 148,
    researcher01In: 142,
    researcher04In: 168,
    researcher02In: 188,
    researcher03In: 208,
    finalHold: 250,
    reviewFrame: 235
};

var compId = api.getActiveComp();
var width = api.get(compId, "resolution.x");
var height = api.get(compId, "resolution.y");
var ink = "#171717";
var paper = "#f2f0ec";
var deck = "#e8e4dc";
var shadow = "#171717";
var margin = Math.round(width * 0.045);
var headerY = -height * 0.5 + Math.round(height * 0.07);
var footerY = height * 0.5 - Math.round(height * 0.07);

function setGotham(id, style) {
    api.set(id, {"font": {"font": "Gotham", "style": style}});
}

function makeText(name, text, size, position, style) {
    var id = api.create("textShape", name);
    api.setFill(id, true);
    api.set(id, {
        "text.string": text,
        "horizontalAlignment": 1,
        "verticalAlignment": 1,
        "fontSize": size,
        "autoWidth": true,
        "autoHeight": true,
        "material.materialColor": ink,
        "position": position,
        "opacity": 0
    });
    setGotham(id, style);
    return id;
}

function makeRule(name, y) {
    var id = api.primitive("rectangle", name);
    api.set(id, {
        "generator.dimensions": [width - margin * 2, 2],
        "position": [0, y],
        "material.materialColor": ink,
        "opacity": 0
    });
    return id;
}

function makeAccent(name, dimensions, position) {
    var id = api.primitive("rectangle", name);
    api.set(id, {
        "generator.dimensions": dimensions,
        "position": position,
        "material.materialColor": ink,
        "opacity": 0
    });
    return id;
}

function animatePaperLayer(id, startOpacity, endOpacity, startY, endY, startScale, endScale) {
    api.keyframe(id, beat.paperIn, {
        "opacity": startOpacity,
        "position.y": startY,
        "scale.x": startScale,
        "scale.y": startScale
    });
    api.keyframe(id, beat.paperSettled, {
        "opacity": endOpacity,
        "position.y": endY,
        "scale.x": endScale,
        "scale.y": endScale
    });
    api.magicEasing(id, "opacity", beat.paperIn, "SlowOut");
    api.magicEasing(id, "position.y", beat.paperIn, "SlowOut");
    api.magicEasing(id, "scale.x", beat.paperIn, "SlowOut");
    api.magicEasing(id, "scale.y", beat.paperIn, "SlowOut");
}

function makeResearcher(name, filePath, position, scale, rotation, startFrame) {
    var assetId = api.loadAsset(filePath, false);
    var footageId = api.addAssetToComp(assetId);
    api.rename(footageId, name);
    // A clip in-point makes the entrance deterministic: this plate cannot
    // render before its spoken-story beat.
    api.setInFrame(footageId, startFrame);
    api.setOutFrame(footageId, beat.finalHold);
    api.set(footageId, {
        "position": [position[0], position[1] + 18],
        "scale": [scale, scale],
        "rotation": rotation,
        "opacity": 0
    });
    api.keyframe(footageId, startFrame, {
        "opacity": 0,
        "position.y": position[1] + 18,
        "scale.x": scale * 0.985,
        "scale.y": scale * 0.985
    });
    api.keyframe(footageId, startFrame + 14, {
        "opacity": 36,
        "position.y": position[1],
        "scale.x": scale,
        "scale.y": scale
    });
    api.magicEasing(footageId, "opacity", startFrame, "SlowOut");
    api.magicEasing(footageId, "position.y", startFrame, "SlowOut");
    api.magicEasing(footageId, "scale.x", startFrame, "SlowOut");
    api.magicEasing(footageId, "scale.y", startFrame, "SlowOut");
    return footageId;
}

// Cavalry-only paper deck. The offset layers and shadows replace the Blender
// room with a controlled, editorial tabletop read.
var backdrop = api.primitive("rectangle", "Scene 0 tabletop field");
api.set(backdrop, {
    "generator.dimensions": [width, height],
    "position": [0, 0],
    "material.materialColor": deck
});
api.select([backdrop]);
api.moveToBack();

var paperShadow = api.primitive("rectangle", "Scene 0 paper contact shadow");
api.set(paperShadow, {
    "generator.dimensions": [width * 0.87, height * 0.76],
    "position": [18, 42],
    "rotation": -0.45,
    "material.materialColor": shadow,
    "opacity": 0,
    "scale": [0.97, 0.97]
});

var paperUnderlay = api.primitive("rectangle", "Scene 0 lower paper edge");
api.set(paperUnderlay, {
    "generator.dimensions": [width * 0.89, height * 0.78],
    "position": [-12, 28],
    "rotation": 0.7,
    "material.materialColor": "#ded9cf",
    "opacity": 0,
    "scale": [0.985, 0.985]
});

var cardSurface = api.primitive("rectangle", "Archive card background");
api.set(cardSurface, {
    "generator.dimensions": [width * 0.91, height * 0.8],
    "position": [0, 18],
    "rotation": -0.18,
    "material.materialColor": paper,
    "opacity": 0,
    "scale": [0.98, 0.98]
});

animatePaperLayer(paperShadow, 0, 16, 58, 42, 0.95, 1);
animatePaperLayer(paperUnderlay, 0, 100, 42, 28, 0.965, 1);
animatePaperLayer(cardSurface, 0, 100, 34, 18, 0.965, 1);

var topRule = makeRule("Top rule", headerY + 28);
var bottomRule = makeRule("Bottom rule", footerY - 25);

// These are printed research figures, not character animation. The larger
// pair establishes the composition; the lighter pair creates depth behind the
// year without turning the frame into a poster collage.
var researcherRoot = "/Users/singleton23/Documents/Development/singleton-systems/cavalry/assets/researchers/";
var researcher01 = makeResearcher("Researcher 01", researcherRoot + "researcher-01.png", [-520, -180], 0.24, -2, beat.researcher01In);
var researcher04 = makeResearcher("Researcher 04", researcherRoot + "researcher-04.png", [520, -180], 0.22, 2, beat.researcher04In);
var researcher02 = makeResearcher("Researcher 02", researcherRoot + "researcher-02.png", [-250, 245], 0.16, -1, beat.researcher02In);
var researcher03 = makeResearcher("Researcher 03", researcherRoot + "researcher-03.png", [250, 245], 0.16, 1, beat.researcher03In);

// These text layers are centered by default, so their x positions include
// half their visual width to keep the left edge safely inside the frame.
var archiveLabel = makeText("Archive label", "WORLD WAR II", 26, [-width * 0.5 + margin + 115, headerY], "Bold");
var footerLabel = makeText("Footer label", "THE MINNESOTA STARVATION EXPERIMENT", 20, [-width * 0.5 + margin + 255, footerY], "Book");

// Small registration marks give the card a printed/archive quality without
// turning the opener into a decorative frame.
var accentColor = ink;
var markTop = makeAccent("Top-right registration mark", [42, 1], [width * 0.5 - margin - 21, headerY + 28]);
var markSide = makeAccent("Top-right registration tick", [1, 18], [width * 0.5 - margin - 42, headerY + 37]);
var markBottom = makeAccent("Bottom-left registration mark", [42, 1], [-width * 0.5 + margin + 21, footerY - 25]);
var markBottomSide = makeAccent("Bottom-left registration tick", [1, 18], [-width * 0.5 + margin + 42, footerY - 34]);
[markTop, markSide, markBottom, markBottomSide].forEach(function (id) {
    api.set(id, {"material.materialColor": accentColor});
});

// The title has weight, but no gratuitous bounce. It comes in from the planned
// lower dead zone and settles on the card's centre axis.
var titleSize = Math.round(height * 0.24);
var yearPrefix = makeText("Year prefix 194", "194", titleSize, [0, 0], "Bold");
var decadeZero = makeText("Year decade zero", "0", titleSize, [0, 0], "Bold");
var decadeSuffix = makeText("Year decade suffix", "s", titleSize, [0, 0], "Bold");
var replacementFour = makeText("Year replacement four", "4", titleSize, [0, 0], "Bold");

var prefixWidth = api.getBoundingBox(yearPrefix, true).width;
var zeroWidth = api.getBoundingBox(decadeZero, true).width;
var suffixWidth = api.getBoundingBox(decadeSuffix, true).width;
var titleStartX = -(prefixWidth + zeroWidth + suffixWidth) * 0.5;
var prefixX = titleStartX + prefixWidth * 0.5;
var zeroX = titleStartX + prefixWidth + zeroWidth * 0.5;
var suffixX = titleStartX + prefixWidth + zeroWidth + suffixWidth * 0.5;
api.set(yearPrefix, {"position.x": prefixX});
api.set(decadeZero, {"position.x": zeroX});
api.set(decadeSuffix, {"position.x": suffixX});
api.set(replacementFour, {"position.x": zeroX});

// The institutional frame lands together. It is one opening thought, not a
// staggered UI list; title and research figures provide the later hierarchy.
[topRule, bottomRule, archiveLabel, footerLabel, markTop, markSide, markBottom, markBottomSide].forEach(function (id) {
    api.keyframe(id, beat.headerIn, {"opacity": 0});
    api.keyframe(id, beat.headerSettled, {"opacity": id === markTop || id === markSide || id === markBottom || id === markBottomSide ? 30 : 100});
    api.magicEasing(id, "opacity", beat.headerIn, "SlowOut");
});

// "194" remains fixed. Only "0s" disappears, and the replacement "4"
// occupies the exact horizontal position of the zero.
[yearPrefix, decadeZero, decadeSuffix].forEach(function (id) {
    api.keyframe(id, beat.titleIn, {"opacity": 0, "position.y": 30});
    api.keyframe(id, beat.titleSettled, {"opacity": 100, "position.y": 0});
    api.magicEasing(id, "opacity", beat.titleIn, "SlowOut");
    api.magicEasing(id, "position.y", beat.titleIn, "SlowOut");
});

api.keyframe(yearPrefix, beat.decadeOut, {"opacity": 100});
api.keyframe(yearPrefix, beat.yearSettled, {"opacity": 100});
[decadeZero, decadeSuffix].forEach(function (id) {
    api.keyframe(id, beat.decadeOut, {"opacity": 100});
    api.keyframe(id, beat.decadeGone, {"opacity": 0});
    api.magicEasing(id, "opacity", beat.decadeOut, "SlowIn");
});

api.keyframe(replacementFour, beat.yearIn, {"opacity": 0, "position.y": 12});
api.keyframe(replacementFour, beat.yearSettled, {"opacity": 100, "position.y": 0});
api.magicEasing(replacementFour, "opacity", beat.yearIn, "SlowOut");
api.magicEasing(replacementFour, "position.y", beat.yearIn, "SlowOut");

// Hold the completed archive graphic. Scene 1 cuts onto the same Cavalry paper
// language, so Premiere can assemble without a Blender bridge.
[
    [backdrop, 100],
    [paperShadow, 16],
    [paperUnderlay, 100],
    [cardSurface, 100],
    [topRule, 100],
    [bottomRule, 100],
    [archiveLabel, 100],
    [footerLabel, 100],
    [markTop, 30],
    [markSide, 30],
    [markBottom, 30],
    [markBottomSide, 30]
].forEach(function (item) {
    api.keyframe(item[0], beat.reviewFrame, {"opacity": item[1]});
});
api.keyframe(yearPrefix, beat.reviewFrame, {"opacity": 100, "position.y": 0});
api.keyframe(replacementFour, beat.reviewFrame, {"opacity": 100, "position.y": 0});

// Reassert the stack after every generated layer exists. This prevents the
// full-frame paper from covering the artwork during scripted rebuilds.
api.select([backdrop]);
api.moveToBack();
api.select([yearPrefix, decadeZero, decadeSuffix, replacementFour]);
api.setFrame(beat.reviewFrame);
console.info("Built Scene 0: Cavalry-only 1940s -> 1944 opener with paper depth and a Premiere handoff hold.");
