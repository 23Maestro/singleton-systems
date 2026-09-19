import test from "node:test";
import assert from "node:assert/strict";
import { sameOrigin } from "../../lib/fitness/http.ts";
test("write origin must match the app", () => {
  assert.equal(
    sameOrigin(
      new Request("https://example.com/api/fitness", {
        headers: { origin: "https://evil.example" },
      }),
    ),
    false,
  );
  assert.equal(
    sameOrigin(
      new Request("https://example.com/api/fitness", {
        headers: { origin: "https://example.com" },
      }),
    ),
    true,
  );
});
