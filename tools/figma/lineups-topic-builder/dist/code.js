"use strict";
(() => {
  // src/logic.ts
  var HEADLINE_NAMES = ["headline", "title", "topic", "question"];
  var COUNT_NAMES = ["player count", "players", "count"];
  function basePropertyName(name) {
    return name.split("#", 1)[0].trim().toLowerCase();
  }
  function findPropertyKey(definitions, type, preferredNames) {
    const entries = Object.entries(definitions).filter(([, definition]) => definition.type === type);
    for (const preferred of preferredNames) {
      const exact = entries.find(([name]) => basePropertyName(name) === preferred.toLowerCase());
      if (exact) return exact[0];
    }
    for (const preferred of preferredNames) {
      const partial = entries.find(([name]) => basePropertyName(name).includes(preferred.toLowerCase()));
      if (partial) return partial[0];
    }
    return null;
  }
  function findHeadlinePropertyKey(definitions) {
    return findPropertyKey(definitions, "TEXT", HEADLINE_NAMES);
  }
  function findPlayerCountPropertyKey(definitions) {
    return findPropertyKey(definitions, "VARIANT", COUNT_NAMES);
  }
  function chooseCountVariant(options, count) {
    const exact = options.find((option) => option.trim() === String(count));
    if (exact) return exact;
    const numericPrefix = options.find((option) => {
      const match = option.trim().match(/^(\d+)/);
      return match ? Number(match[1]) === count : false;
    });
    if (numericPrefix) return numericPrefix;
    const numberWord = ["zero", "one", "two", "three", "four"][count];
    if (!numberWord) return null;
    return options.find((option) => option.trim().toLowerCase().startsWith(numberWord)) ?? null;
  }
  function sanitizeSceneName(headline) {
    const slug = headline.trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
    return `LINEUPS_SCENE_Topic_${slug || "Untitled"}`;
  }
  function slotRank(name) {
    const normalized = name.toLowerCase().replace(/[\s-]+/g, "_");
    const numbered = normalized.match(/(?:player|slot|cutout)_?(\d)/);
    if (numbered) return Number(numbered[1]);
    if (normalized.includes("center_left") || normalized.includes("centre_left")) return 2;
    if (normalized.includes("center_right") || normalized.includes("centre_right")) return 3;
    if (normalized.includes("left")) return 1;
    if (normalized.includes("center") || normalized.includes("centre") || normalized.includes("middle")) return 2.5;
    if (normalized.includes("right")) return 4;
    return 99;
  }
  function isPlayerSlotName(name) {
    const normalized = name.toLowerCase().replace(/[\s-]+/g, "_");
    if (/lineups_slot_player_[1-4]/.test(normalized)) return true;
    if (/^\[?player_?[1-4]\]?$/.test(normalized)) return true;
    return /lineups_(atom|slot)_playercutout_(left|center_left|center|center_right|right)/.test(normalized);
  }

  // src/code.ts
  var TARGET_PATTERN = /lineups/i;
  var HEADLINE_NODE_PATTERN = /(^|_)(headline|title|topic|question)($|_)/i;
  var generatedSceneId = null;
  figma.showUI(__html__, {
    width: 380,
    height: 480,
    title: "Lineups Topic Builder",
    themeColors: true
  });
  function post(message) {
    figma.ui.postMessage(message);
  }
  function readImagePaint(node) {
    if ("fills" in node && node.fills !== figma.mixed) {
      const imagePaint = node.fills.find(
        (paint) => paint.type === "IMAGE" && Boolean(paint.imageHash)
      );
      if (imagePaint) return imagePaint;
    }
    if ("findOne" in node) {
      const imageNode = node.findOne((candidate) => {
        if (!("fills" in candidate) || candidate.fills === figma.mixed) return false;
        return candidate.fills.some((paint) => paint.type === "IMAGE" && Boolean(paint.imageHash));
      });
      if (imageNode && "fills" in imageNode && imageNode.fills !== figma.mixed) {
        return imageNode.fills.find(
          (paint) => paint.type === "IMAGE" && Boolean(paint.imageHash)
        ) ?? null;
      }
    }
    return null;
  }
  async function selectionData() {
    const selection = [...figma.currentPage.selection];
    const allInstances = selection.filter((node) => node.type === "INSTANCE");
    const namedTargets = [];
    for (const instance of allInstances) {
      const mainComponent = await instance.getMainComponentAsync();
      const componentName = mainComponent?.parent?.type === "COMPONENT_SET" ? mainComponent.parent.name : mainComponent?.name ?? "";
      if (TARGET_PATTERN.test(`${instance.name} ${componentName}`)) namedTargets.push(instance);
    }
    const candidates = namedTargets.length > 0 ? namedTargets : allInstances;
    const target = candidates.length === 1 ? candidates[0] : null;
    const errors = [];
    if (!target) {
      errors.push(
        candidates.length > 1 ? "Select exactly one Lineups component instance." : "Select one Lineups component instance."
      );
    }
    const images = selection.filter((node) => node.id !== target?.id).map((node) => {
      const imagePaint = readImagePaint(node);
      return imagePaint?.imageHash ? { id: node.id, name: node.name, imageHash: imagePaint.imageHash, x: node.x } : null;
    }).filter((image) => image !== null).sort((left, right) => left.x - right.x);
    if (images.length < 1 || images.length > 4) {
      errors.push("Select 1\u20134 image layers with the Lineups instance.");
    }
    return {
      snapshot: {
        valid: errors.length === 0,
        target: target ? { id: target.id, name: target.name } : null,
        images: images.map(({ id, name }) => ({ id, name })),
        errors
      },
      target,
      images
    };
  }
  async function pushSelection() {
    const { snapshot } = await selectionData();
    post({ type: "selection", payload: snapshot });
  }
  function propertyDefinitionsFor(mainComponent) {
    const owner = mainComponent.parent?.type === "COMPONENT_SET" ? mainComponent.parent : mainComponent;
    return owner.componentPropertyDefinitions;
  }
  async function applyHeadlineFallback(instance, headline) {
    const candidate = instance.findOne(
      (node) => node.type === "TEXT" && HEADLINE_NODE_PATTERN.test(node.name)
    );
    if (!candidate || candidate.type !== "TEXT") return false;
    const headlineNode = candidate;
    const fontSegments = headlineNode.getStyledTextSegments(["fontName"]);
    const fonts = /* @__PURE__ */ new Map();
    for (const segment of fontSegments) {
      const font = segment.fontName;
      fonts.set(`${font.family}::${font.style}`, font);
    }
    for (const font of fonts.values()) await figma.loadFontAsync(font);
    headlineNode.characters = headline;
    return true;
  }
  function fillTargetForSlot(slot) {
    if ("fills" in slot && slot.fills !== figma.mixed) {
      const hasImage = slot.fills.some((paint) => paint.type === "IMAGE");
      if (hasImage) return slot;
    }
    if ("findOne" in slot) {
      const imageNode = slot.findOne((candidate) => {
        if (!("fills" in candidate) || candidate.fills === figma.mixed) return false;
        return candidate.fills.some((paint) => paint.type === "IMAGE");
      });
      if (imageNode) return imageNode;
    }
    return "fills" in slot && slot.fills !== figma.mixed ? slot : null;
  }
  function writeImageFill(slot, imageHash) {
    const node = fillTargetForSlot(slot);
    if (!node || !("fills" in node) || node.fills === figma.mixed) {
      throw new Error(`Player slot \u201C${slot.name}\u201D cannot accept an image fill.`);
    }
    const fills = [...node.fills];
    const imageIndex = fills.findIndex((paint) => paint.type === "IMAGE");
    const nextPaint = imageIndex >= 0 ? { ...fills[imageIndex], imageHash, visible: true } : { type: "IMAGE", imageHash, scaleMode: "FIT", visible: true };
    if (imageIndex >= 0) fills[imageIndex] = nextPaint;
    else fills.push(nextPaint);
    node.fills = fills;
  }
  function findPlayerSlots(instance) {
    return instance.findAll((node) => isPlayerSlotName(node.name)).sort((left, right) => slotRank(left.name) - slotRank(right.name));
  }
  async function generateScene(headline) {
    const cleanHeadline = headline.trim();
    if (!cleanHeadline) throw new Error("Enter a headline before generating the scene.");
    const { snapshot, target, images } = await selectionData();
    if (!snapshot.valid || !target) throw new Error(snapshot.errors.join(" "));
    post({ type: "working", message: "Building scene\u2026" });
    const absolute = target.absoluteBoundingBox;
    const scene = target.clone();
    figma.currentPage.appendChild(scene);
    scene.name = sanitizeSceneName(cleanHeadline);
    scene.x = (absolute?.x ?? target.x) + target.width + 120;
    scene.y = absolute?.y ?? target.y;
    const mainComponent = await scene.getMainComponentAsync();
    if (!mainComponent) {
      scene.remove();
      throw new Error("The selected instance has no available main component.");
    }
    const definitions = propertyDefinitionsFor(mainComponent);
    const updates = {};
    const warnings = [];
    const headlineKey = findHeadlinePropertyKey(definitions);
    if (headlineKey) updates[headlineKey] = cleanHeadline;
    const countKey = findPlayerCountPropertyKey(definitions);
    if (countKey) {
      const options = definitions[countKey]?.variantOptions ?? [];
      const countValue = chooseCountVariant(options, images.length);
      if (countValue) updates[countKey] = countValue;
      else warnings.push(`No player-count variant matches ${images.length}.`);
    } else {
      warnings.push("No Players variant property found.");
    }
    if (Object.keys(updates).length > 0) scene.setProperties(updates);
    if (!headlineKey) {
      const didSetHeadline = await applyHeadlineFallback(scene, cleanHeadline);
      if (!didSetHeadline) warnings.push("No Headline text property or named headline layer found.");
    }
    const slots = findPlayerSlots(scene);
    if (slots.length < images.length) {
      scene.remove();
      throw new Error(
        `Found ${slots.length} named player slot${slots.length === 1 ? "" : "s"}; ${images.length} required.`
      );
    }
    images.forEach((image, index) => writeImageFill(slots[index], image.imageHash));
    generatedSceneId = scene.id;
    figma.currentPage.selection = [scene];
    figma.viewport.scrollAndZoomIntoView([scene]);
    post({ type: "success", sceneId: scene.id, sceneName: scene.name, warnings });
  }
  figma.ui.onmessage = async (message) => {
    try {
      if (message.type === "close") {
        figma.closePlugin();
        return;
      }
      if (message.type === "refresh-selection") {
        await pushSelection();
        return;
      }
      if (message.type === "generate") {
        await generateScene(message.headline);
      }
    } catch (error) {
      post({ type: "error", message: error instanceof Error ? error.message : String(error) });
    }
  };
  figma.on("selectionchange", () => {
    if (generatedSceneId && figma.currentPage.selection.length === 1 && figma.currentPage.selection[0]?.id === generatedSceneId) {
      generatedSceneId = null;
      return;
    }
    void pushSelection();
  });
  void pushSelection();
})();
