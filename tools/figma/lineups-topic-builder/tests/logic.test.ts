import assert from "node:assert/strict";
import test from "node:test";

import {
  chooseCountVariant,
  findHeadlinePropertyKey,
  findPlayerCountPropertyKey,
  isPlayerSlotName,
  sanitizeSceneName,
  slotRank,
} from "../src/logic";

test("finds suffixed component properties", () => {
  const definitions = {
    "Headline#12:4": { type: "TEXT" as const },
    "Player Count": { type: "VARIANT" as const, variantOptions: ["1", "2", "3", "4"] },
  };

  assert.equal(findHeadlinePropertyKey(definitions), "Headline#12:4");
  assert.equal(findPlayerCountPropertyKey(definitions), "Player Count");
});

test("matches numeric and written player-count variants", () => {
  assert.equal(chooseCountVariant(["1 Player", "2 Players", "3 Players"], 2), "2 Players");
  assert.equal(chooseCountVariant(["One", "Two", "Three"], 3), "Three");
  assert.equal(chooseCountVariant(["Solo", "Duo"], 4), null);
});

test("creates a deterministic scene name", () => {
  assert.equal(
    sanitizeSceneName(" Who has the better five-year window? "),
    "LINEUPS_SCENE_Topic_Who_has_the_better_five_year_window",
  );
});

test("recognizes and orders supported player slot names", () => {
  const names = [
    "LINEUPS_SLOT_Player_4",
    "LINEUPS_SLOT_Player_1",
    "LINEUPS_SLOT_Player_3",
    "LINEUPS_SLOT_Player_2",
  ];

  assert.ok(names.every(isPlayerSlotName));
  assert.deepEqual([...names].sort((a, b) => slotRank(a) - slotRank(b)), [
    "LINEUPS_SLOT_Player_1",
    "LINEUPS_SLOT_Player_2",
    "LINEUPS_SLOT_Player_3",
    "LINEUPS_SLOT_Player_4",
  ]);
});
