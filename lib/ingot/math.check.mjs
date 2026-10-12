// Self-check for lib/ingot/math.ts. Run: node lib/ingot/math.check.mjs
import assert from "node:assert/strict";
import { fragmentAmount } from "./math.ts";

// Whole bar and fully scattered.
for (let i = 0; i < 4; i++) {
  assert.equal(fragmentAmount(0, i, 4), 0);
  assert.equal(fragmentAmount(1, i, 4), 1);
}
// split 1 -> 0.75 docks piece 0 only; 0.75 -> 0.5 docks piece 1, etc.
assert.equal(fragmentAmount(0.75, 0, 4), 0);
assert.equal(fragmentAmount(0.75, 1, 4), 1);
assert.equal(fragmentAmount(0.875, 0, 4), 0.5);
assert.equal(fragmentAmount(0.25, 2, 4), 0);
assert.equal(fragmentAmount(0.125, 3, 4), 0.5);

console.log("math.check: ok");
