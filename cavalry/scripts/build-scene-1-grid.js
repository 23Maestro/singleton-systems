// Cavalry UI Script: build Scene 1, 36-person study grid.
// Updated: Builds top-down (01 top-left -> 36 bottom-right)

var beat = {
    paperIn: 0,
    paperSettled: 20,
    gridIn: 24,
    gridSettled: 78,
    stampIn: 96,
    stampSettled: 122,
    finalHold: 180,
    reviewFrame: 150
};

var compId = api.getActiveComp();
var width = api.get(compId, "resolution.x");
var height = api.get(compId, "resolution.y");
var ink = "#171717";
var paper = "#f2f0ec";
var deck = "#e8e4dc";
var muted = "#d9d4ca";
var margin = Math.round(width * 0.055);
var headerY = -height * 0.5 + Math.round(height * 0.09);
var footerY = height * 0.5 - Math.round(height * 0.085);

function setGotham(id, style) {
    api.set(id, { "font": { "font": "Gotham", "style": style } });
}

function makeText(name, text, size, position, style, opacity) {
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
        "opacity": opacity || 0
    });
    setGotham(id, style);
    return id;
}

function makeRect(name, dimensions, position, color, opacity, rotation) {
    var id = api.primitive("rectangle", name);
    api.set(id, {
        "generator.dimensions": dimensions,
        "position": position,
        "rotation": rotation || 0,
        "material.materialColor": color,
        "opacity": opacity || 0
    });
    return id;
}

function reveal(id, start, end, opacity, yOffset, scaleStart) {
    var y = api.get(id, "position.y");
    api.keyframe(id, start, {
        "opacity": 0,
        "position.y": y + yOffset,
        "scale.x": scaleStart,
        "scale.y": scaleStart
    });
    api.keyframe(id, end, {
        "opacity": opacity,
        "position.y": y,
        "scale.x": 1,
        "scale.y": 1
    });
    api.magicEasing(id, "opacity", start, "SlowOut");
    api.magicEasing(id, "position.y", start, "SlowOut");
    api.magicEasing(id, "scale.x", start, "SlowOut");
    api.magicEasing(id, "scale.y", start, "SlowOut");
}

var field = makeRect("Scene 1 tabletop field", [width, height], [0, 0], deck, 100, 0);
api.select([field]);
api.moveToBack();

var shadow = makeRect("Scene 1 paper contact shadow", [width * 0.9, height * 0.78], [20, 36], ink, 0, -0.35);
var underlay = makeRect("Scene 1 lower paper edge", [width * 0.91, height * 0.8], [-10, 24], "#ded9cf", 0, 0.55);
var card = makeRect("Scene 1 archive grid paper", [width * 0.93, height * 0.82], [0, 10], paper, 0, -0.12);
reveal(shadow, beat.paperIn, beat.paperSettled, 14, 22, 0.965);
reveal(underlay, beat.paperIn, beat.paperSettled, 100, 16, 0.97);
reveal(card, beat.paperIn, beat.paperSettled, 100, 14, 0.97);

var topRule = makeRect("Scene 1 top rule", [width - margin * 2, 2], [0, headerY + 24], ink, 0, 0);
var bottomRule = makeRect("Scene 1 bottom rule", [width - margin * 2, 2], [0, footerY - 20], ink, 0, 0);
var header = makeText("Scene 1 header label", "THE MINNESOTA STARVATION EXPERIMENT", 19, [-width * 0.5 + margin + 255, headerY], "Book", 0);
var footer = makeText("Scene 1 footer label", "36 VOLUNTEER SUBJECTS", 24, [-width * 0.5 + margin + 165, footerY], "Bold", 0);
[topRule, bottomRule, header, footer].forEach(function (id) {
    reveal(id, 12, 32, 100, 8, 1);
});

var cols = 6;
var rows = 6;
var tileW = 178;
var tileH = 92;
var gap = 18;
var startX = -((cols * tileW) + ((cols - 1) * gap)) * 0.5 + tileW * 0.5;
var startY = 250; // Flipped to positive
var gridIds = [];

for (var row = 0; row < rows; row += 1) {
    for (var col = 0; col < cols; col += 1) {
        var n = row * cols + col + 1;
        var x = startX + col * (tileW + gap);
        var y = startY - row * (tileH + gap); // Subtracted to build downwards
        var delay = beat.gridIn + row * 5 + col * 2;
        var name = ("0" + n).slice(-2);

        var tileShadow = makeRect("Scene 1 subject " + name + " shadow", [tileW, tileH], [x + 5, y - 6], ink, 0, 0.2); // Flipped Y
        var tile = makeRect("Scene 1 subject " + name + " card", [tileW, tileH], [x, y], "#eeeae2", 0, (col - 2.5) * 0.08);
        var head = makeRect("Scene 1 subject " + name + " head mark", [30, 30], [x - 52, y + 10], ink, 0, 0); // Flipped Y
        var line1 = makeRect("Scene 1 subject " + name + " record line 1", [72, 2], [x + 28, y + 20], ink, 0, 0); // Flipped Y
        var line2 = makeRect("Scene 1 subject " + name + " record line 2", [86, 2], [x + 35, y + 3], ink, 0, 0); // Flipped Y
        var number = makeText("Scene 1 subject " + name + " number", name, 18, [x - 52, y - 27], "Bold", 0); // Flipped Y

        [tileShadow, tile, head, line1, line2, number].forEach(function (id) {
            reveal(id, delay, delay + 16, id === tileShadow ? 10 : id === line1 || id === line2 ? 42 : 100, -12, 0.985); // Flipped reveal Y
            api.keyframe(id, beat.reviewFrame, { "opacity": id === tileShadow ? 10 : id === line1 || id === line2 ? 42 : 100 });
        });
        gridIds.push(tile);
    }
}

var stampX = width * 0.28;
var stampY = height * 0.19;
var stampBack = makeRect("Scene 1 approved stamp back", [355, 118], [stampX + 8, stampY + 8], ink, 0, -8);
var stampTop = makeRect("Scene 1 approved stamp top", [330, 4], [stampX, stampY - 50], ink, 0, -8);
var stampBottom = makeRect("Scene 1 approved stamp bottom", [330, 4], [stampX, stampY + 50], ink, 0, -8);
var stampLeft = makeRect("Scene 1 approved stamp left", [4, 100], [stampX - 165, stampY], ink, 0, -8);
var stampRight = makeRect("Scene 1 approved stamp right", [4, 100], [stampX + 165, stampY], ink, 0, -8);
var stamp = makeText("Scene 1 approved stamp text", "APPROVED", 58, [stampX, stampY - 6], "Bold", 0);
api.set(stamp, { "rotation": -8 });
var stampSub = makeText("Scene 1 approved stamp subtext", "RESEARCH RECORD", 18, [stampX, stampY + 40], "Bold", 0);
api.set(stampSub, { "rotation": -8 });

[stampBack, stampTop, stampBottom, stampLeft, stampRight, stamp, stampSub].forEach(function (id) {
    reveal(id, beat.stampIn, beat.stampSettled, id === stampBack ? 8 : 72, 18, 1.08);
    api.keyframe(id, beat.reviewFrame, { "opacity": id === stampBack ? 8 : 72 });
});

api.select([field]);
api.moveToBack();
api.select(gridIds);
api.setFrame(beat.reviewFrame);
console.info("Built Scene 1: Cavalry-only 36-person grid with approved stamp for Premiere handoff.");