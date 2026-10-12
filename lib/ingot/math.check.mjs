// Self-check for lib/ingot/math.ts. Run: node lib/ingot/math.check.mjs
import assert from "node:assert/strict";
import {
  cameraDistance,
  fragmentAmount,
  lifecycleRect,
  pickDock,
  rectToWorld,
  shortestAngle,
} from "./math.ts";

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

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≉ ${b}`);

// 1 world unit = 1 CSS px on z=0: at 90° fov the distance is half the height.
near(cameraDistance(1000, 90), 500);

// Centred dock -> origin; width becomes scale (ingot length in px).
assert.deepEqual(rectToWorld({ left: 400, top: 300, width: 200, height: 100 }, 1000, 800), {
  x: 0,
  y: 50,
  scale: 200,
});
// Off-screen corner dock is clamped to the inner 80% of the viewport.
const corner = rectToWorld({ left: -500, top: 2000, width: 100, height: 100 }, 1000, 800);
assert.equal(corner.x, -400);
assert.equal(corner.y, -320);

// Lifecycle: a 2:1 ingot box centred on the progress head.
assert.deepEqual(lifecycleRect({ left: 100, top: 500, width: 800, height: 50 }, 0.5), {
  left: 450,
  top: 500,
  width: 100,
  height: 50,
});

// pickDock: section must straddle the centre line; zero-width docks skipped.
const docks = [
  { name: "hero", rect: { left: 0, top: 0, width: 300, height: 150 }, section: { top: -500, bottom: 300 } },
  { name: "problem", rect: { left: 0, top: 0, width: 0, height: 0 }, section: { top: 300, bottom: 1100 } },
  { name: "problem", rect: { left: 600, top: 300, width: 280, height: 140 }, section: { top: 300, bottom: 1100 } },
];
assert.equal(pickDock(docks, 800), docks[2]);
assert.equal(pickDock(docks.slice(0, 2), 800), null);
assert.equal(pickDock([{ ...docks[2], section: null }], 800), null);

// shortestAngle returns an equivalent of `current` within π of `target`.
near(shortestAngle(0.1 + 10 * Math.PI, 0.1), 0.1);
near(Math.abs(shortestAngle(3 * Math.PI, 0)), Math.PI);
near(shortestAngle(-0.2, 2 * Math.PI), 2 * Math.PI - 0.2);

console.log("math.check: ok");
