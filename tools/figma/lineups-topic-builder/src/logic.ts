export type ComponentPropertyDefinition = {
  type: "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT" | "SLOT";
  variantOptions?: readonly string[];
};

export type ComponentPropertyDefinitions = Record<string, ComponentPropertyDefinition>;

const HEADLINE_NAMES = ["headline", "title", "topic", "question"];
const COUNT_NAMES = ["player count", "players", "count"];

export function basePropertyName(name: string): string {
  return name.split("#", 1)[0].trim().toLowerCase();
}

export function findPropertyKey(
  definitions: ComponentPropertyDefinitions,
  type: ComponentPropertyDefinition["type"],
  preferredNames: readonly string[],
): string | null {
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

export function findHeadlinePropertyKey(definitions: ComponentPropertyDefinitions): string | null {
  return findPropertyKey(definitions, "TEXT", HEADLINE_NAMES);
}

export function findPlayerCountPropertyKey(definitions: ComponentPropertyDefinitions): string | null {
  return findPropertyKey(definitions, "VARIANT", COUNT_NAMES);
}

export function chooseCountVariant(options: readonly string[], count: number): string | null {
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

export function sanitizeSceneName(headline: string): string {
  const slug = headline
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return `LINEUPS_SCENE_Topic_${slug || "Untitled"}`;
}

export function slotRank(name: string): number {
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

export function isPlayerSlotName(name: string): boolean {
  const normalized = name.toLowerCase().replace(/[\s-]+/g, "_");
  if (/lineups_slot_player_[1-4]/.test(normalized)) return true;
  if (/^\[?player_?[1-4]\]?$/.test(normalized)) return true;
  return /lineups_(atom|slot)_playercutout_(left|center_left|center|center_right|right)/.test(normalized);
}
