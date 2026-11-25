import assert from "node:assert/strict";
import test from "node:test";
import { checkOrder } from "../lib/reel-order.ts";

const reel = { reel_id: "r", athlete: "A", timeline: [{ id: "A01", title: "a" }, { id: "A02", title: "b" }], bench: [{ id: "A03", title: "c" }] };

test("accepts a reordered list with a trashed bench play", () => {
  assert.deepEqual(checkOrder(reel, ["A02", "A01"], ["A03"]), { order: ["A02", "A01"], trashed: ["A03"] });
});

test("rejects unknown, repeated or empty picks", () => {
  assert.equal(checkOrder(reel, ["A01", "Z99"], []), null);
  assert.equal(checkOrder(reel, ["A01", "A01"], []), null);
  assert.equal(checkOrder(reel, ["A01"], ["A01"]), null);
  assert.equal(checkOrder(reel, [], []), null);
  assert.equal(checkOrder(reel, "A01", []), null);
});
