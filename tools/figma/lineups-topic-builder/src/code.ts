import {
  chooseCountVariant,
  findHeadlinePropertyKey,
  findPlayerCountPropertyKey,
  isPlayerSlotName,
  sanitizeSceneName,
  slotRank,
  type ComponentPropertyDefinitions,
} from "./logic";

type SelectionImage = {
  id: string;
  name: string;
  imageHash: string;
  x: number;
};

type SelectionSnapshot = {
  valid: boolean;
  target: { id: string; name: string } | null;
  images: Array<{ id: string; name: string }>;
  errors: string[];
};

type UiMessage =
  | { type: "refresh-selection" }
  | { type: "generate"; headline: string }
  | { type: "close" };

type PluginMessage =
  | { type: "selection"; payload: SelectionSnapshot }
  | { type: "working"; message: string }
  | { type: "success"; sceneId: string; sceneName: string; warnings: string[] }
  | { type: "error"; message: string };

const TARGET_PATTERN = /lineups/i;
const HEADLINE_NODE_PATTERN = /(^|_)(headline|title|topic|question)($|_)/i;
let generatedSceneId: string | null = null;

figma.showUI(__html__, {
  width: 380,
  height: 480,
  title: "Lineups Topic Builder",
  themeColors: true,
});

function post(message: PluginMessage): void {
  figma.ui.postMessage(message);
}

function readImagePaint(node: SceneNode): ImagePaint | null {
  if ("fills" in node && node.fills !== figma.mixed) {
    const imagePaint = node.fills.find(
      (paint): paint is ImagePaint => paint.type === "IMAGE" && Boolean(paint.imageHash),
    );
    if (imagePaint) return imagePaint;
  }

  if ("findOne" in node) {
    const imageNode = node.findOne((candidate) => {
      if (!("fills" in candidate) || candidate.fills === figma.mixed) return false;
      return candidate.fills.some((paint) => paint.type === "IMAGE" && Boolean(paint.imageHash));
    });
    if (imageNode && "fills" in imageNode && imageNode.fills !== figma.mixed) {
      return (
        imageNode.fills.find(
          (paint): paint is ImagePaint => paint.type === "IMAGE" && Boolean(paint.imageHash),
        ) ?? null
      );
    }
  }

  return null;
}

async function selectionData(): Promise<{
  snapshot: SelectionSnapshot;
  target: InstanceNode | null;
  images: SelectionImage[];
}> {
  const selection = [...figma.currentPage.selection];
  const allInstances = selection.filter((node): node is InstanceNode => node.type === "INSTANCE");
  const namedTargets: InstanceNode[] = [];

  for (const instance of allInstances) {
    const mainComponent = await instance.getMainComponentAsync();
    const componentName = mainComponent?.parent?.type === "COMPONENT_SET"
      ? mainComponent.parent.name
      : mainComponent?.name ?? "";
    if (TARGET_PATTERN.test(`${instance.name} ${componentName}`)) namedTargets.push(instance);
  }

  const candidates = namedTargets.length > 0 ? namedTargets : allInstances;
  const target = candidates.length === 1 ? candidates[0] : null;
  const errors: string[] = [];

  if (!target) {
    errors.push(
      candidates.length > 1
        ? "Select exactly one Lineups component instance."
        : "Select one Lineups component instance.",
    );
  }

  const images: SelectionImage[] = selection
    .filter((node) => node.id !== target?.id)
    .map((node) => {
      const imagePaint = readImagePaint(node);
      return imagePaint?.imageHash
        ? { id: node.id, name: node.name, imageHash: imagePaint.imageHash, x: node.x }
        : null;
    })
    .filter((image): image is SelectionImage => image !== null)
    .sort((left, right) => left.x - right.x);

  if (images.length < 1 || images.length > 4) {
    errors.push("Select 1–4 image layers with the Lineups instance.");
  }

  return {
    snapshot: {
      valid: errors.length === 0,
      target: target ? { id: target.id, name: target.name } : null,
      images: images.map(({ id, name }) => ({ id, name })),
      errors,
    },
    target,
    images,
  };
}

async function pushSelection(): Promise<void> {
  const { snapshot } = await selectionData();
  post({ type: "selection", payload: snapshot });
}

function propertyDefinitionsFor(mainComponent: ComponentNode): ComponentPropertyDefinitions {
  const owner = mainComponent.parent?.type === "COMPONENT_SET" ? mainComponent.parent : mainComponent;
  return owner.componentPropertyDefinitions as ComponentPropertyDefinitions;
}

async function applyHeadlineFallback(instance: InstanceNode, headline: string): Promise<boolean> {
  const candidate = instance.findOne(
    (node) => node.type === "TEXT" && HEADLINE_NODE_PATTERN.test(node.name),
  );
  if (!candidate || candidate.type !== "TEXT") return false;
  const headlineNode: TextNode = candidate;

  const fontSegments = headlineNode.getStyledTextSegments(["fontName"]);
  const fonts = new Map<string, FontName>();
  for (const segment of fontSegments) {
    const font = segment.fontName as FontName;
    fonts.set(`${font.family}::${font.style}`, font);
  }
  for (const font of fonts.values()) await figma.loadFontAsync(font);
  headlineNode.characters = headline;
  return true;
}

function fillTargetForSlot(slot: SceneNode): SceneNode | null {
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

function writeImageFill(slot: SceneNode, imageHash: string): void {
  const node = fillTargetForSlot(slot);
  if (!node || !("fills" in node) || node.fills === figma.mixed) {
    throw new Error(`Player slot “${slot.name}” cannot accept an image fill.`);
  }

  const fills = [...node.fills];
  const imageIndex = fills.findIndex((paint) => paint.type === "IMAGE");
  const nextPaint: ImagePaint = imageIndex >= 0
    ? { ...(fills[imageIndex] as ImagePaint), imageHash, visible: true }
    : { type: "IMAGE", imageHash, scaleMode: "FIT", visible: true };

  if (imageIndex >= 0) fills[imageIndex] = nextPaint;
  else fills.push(nextPaint);
  node.fills = fills;
}

function findPlayerSlots(instance: InstanceNode): SceneNode[] {
  return instance
    .findAll((node) => isPlayerSlotName(node.name))
    .sort((left, right) => slotRank(left.name) - slotRank(right.name));
}

async function generateScene(headline: string): Promise<void> {
  const cleanHeadline = headline.trim();
  if (!cleanHeadline) throw new Error("Enter a headline before generating the scene.");

  const { snapshot, target, images } = await selectionData();
  if (!snapshot.valid || !target) throw new Error(snapshot.errors.join(" "));

  post({ type: "working", message: "Building scene…" });

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
  const updates: Record<string, string | boolean | VariableAlias> = {};
  const warnings: string[] = [];

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
      `Found ${slots.length} named player slot${slots.length === 1 ? "" : "s"}; ${images.length} required.`,
    );
  }

  images.forEach((image, index) => writeImageFill(slots[index], image.imageHash));

  generatedSceneId = scene.id;
  figma.currentPage.selection = [scene];
  figma.viewport.scrollAndZoomIntoView([scene]);
  post({ type: "success", sceneId: scene.id, sceneName: scene.name, warnings });
}

figma.ui.onmessage = async (message: UiMessage) => {
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
  if (
    generatedSceneId &&
    figma.currentPage.selection.length === 1 &&
    figma.currentPage.selection[0]?.id === generatedSceneId
  ) {
    generatedSceneId = null;
    return;
  }
  void pushSelection();
});

void pushSelection();
