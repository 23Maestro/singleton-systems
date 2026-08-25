"use strict";
(() => {
  // src/code.ts
  var BRIDGE_BASE = "http://localhost:41723";
  var EAGLE_ID_KEY = "lineupsEagleItemId";
  var currentSnapshot = emptySnapshot();
  figma.showUI(__html__, {
    width: 420,
    height: 640,
    title: "Lineups NFL Rolodex",
    themeColors: true
  });
  function emptySnapshot() {
    return {
      selectedId: null,
      selectedName: null,
      canInsert: false,
      fillTargets: [],
      suggestedTargetId: null
    };
  }
  function post(message) {
    figma.ui.postMessage(message);
  }
  function imagePaints(node) {
    if (!("fills" in node) || node.fills === figma.mixed) return [];
    return node.fills.filter(
      (paint) => paint.type === "IMAGE" && Boolean(paint.imageHash)
    );
  }
  function fillTargetsFor(selection) {
    if (selection.length !== 1) return [];
    const selected = selection[0];
    if (imagePaints(selected).length > 0) return [selected];
    if (!("findAll" in selected)) return [];
    return selected.findAll((node) => imagePaints(node).length > 0);
  }
  function canInsertInto(node) {
    return Boolean(node && (node.type === "FRAME" || node.type === "COMPONENT"));
  }
  function suggestedFillTarget(targets) {
    const personPattern = /person|player|athlete|portrait|brady|moss|vrabel|wilfork|seymour/i;
    const backgroundPattern = /(^|\b)(bg|background)(\b|$)/i;
    return targets.find((node) => personPattern.test(node.name) && !backgroundPattern.test(node.name)) ?? targets.find((node) => !backgroundPattern.test(node.name)) ?? targets[0] ?? null;
  }
  function selectionData() {
    const selection = [...figma.currentPage.selection];
    if (selection.length !== 1) return emptySnapshot();
    const selected = selection[0];
    const targets = fillTargetsFor(selection);
    const suggested = suggestedFillTarget(targets);
    return {
      selectedId: selected.id,
      selectedName: selected.name,
      canInsert: canInsertInto(selected),
      fillTargets: targets.map((node) => ({ id: node.id, name: node.name, type: node.type })),
      suggestedTargetId: suggested?.id ?? null
    };
  }
  function pushSelection() {
    currentSnapshot = selectionData();
    post({ type: "selection", payload: currentSnapshot });
  }
  async function fetchEagleImage(itemId) {
    const response = await fetch(`${BRIDGE_BASE}/api/items/${encodeURIComponent(itemId)}/image`);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Image request failed (${response.status}): ${message}`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0) throw new Error("The bridge returned an empty image.");
    return figma.createImage(bytes);
  }
  function replaceImageFill(node, imageHash) {
    if (!("fills" in node) || node.fills === figma.mixed) {
      throw new Error("The selected target has no editable fill.");
    }
    const fills = [...node.fills];
    const index = fills.findIndex((paint) => paint.type === "IMAGE");
    if (index < 0) throw new Error("The selected target has no image fill to replace.");
    fills[index] = { ...fills[index], imageHash, visible: true };
    node.fills = fills;
  }
  async function insertNewLayer(item, image) {
    const selected = figma.currentPage.selection[0];
    if (!canInsertInto(selected)) throw new Error("Select one editable Figma frame before inserting.");
    const size = await image.getSizeAsync();
    const maxWidth = Math.min(selected.width * 0.7, 900);
    const maxHeight = Math.min(selected.height * 0.7, 900);
    const scale = Math.min(maxWidth / size.width, maxHeight / size.height, 1);
    const node = figma.createRectangle();
    node.name = `EAGLE / ${item.person} / ${item.id}`;
    node.resize(Math.max(1, size.width * scale), Math.max(1, size.height * scale));
    selected.appendChild(node);
    node.x = (selected.width - node.width) / 2;
    node.y = (selected.height - node.height) / 2;
    node.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: "FIT" }];
    node.setPluginData(EAGLE_ID_KEY, item.id);
    return node;
  }
  async function replaceLayer(item, image, targetId) {
    if (!currentSnapshot.fillTargets.some((target) => target.id === targetId)) {
      throw new Error("Refresh the selection and choose an image-fill target from the current frame.");
    }
    const node = await figma.getNodeByIdAsync(targetId);
    if (!node || node.type === "DOCUMENT" || node.type === "PAGE") {
      throw new Error("The chosen image-fill target no longer exists.");
    }
    replaceImageFill(node, image.hash);
    node.setPluginData(EAGLE_ID_KEY, item.id);
    return node;
  }
  async function handleInsert(message) {
    post({ type: "working", message: `Loading ${message.item.person} from Eagle\u2026` });
    const image = await fetchEagleImage(message.item.id);
    const node = message.mode === "replace" ? await replaceLayer(message.item, image, message.targetId) : await insertNewLayer(message.item, image);
    figma.viewport.scrollAndZoomIntoView([node]);
    post({
      type: "success",
      message: `${message.item.person} inserted from Eagle.`,
      nodeId: node.id,
      eagleItemId: message.item.id
    });
    pushSelection();
  }
  figma.ui.onmessage = async (message) => {
    try {
      if (message.type === "refresh-selection") {
        pushSelection();
        return;
      }
      if (message.type === "open-external") {
        const url = new URL(message.url);
        if (url.protocol !== "https:") throw new Error("Only HTTPS source links can be opened.");
        figma.openExternal(url.toString());
        return;
      }
      if (message.type === "insert") await handleInsert(message);
    } catch (error) {
      post({ type: "error", message: error instanceof Error ? error.message : String(error) });
    }
  };
  figma.on("selectionchange", pushSelection);
  pushSelection();
})();
