// Self-check for lib/ingot/math.ts. Run: node lib/ingot/math.check.mjs
import assert from "node:assert/strict";
import { cameraDistance, pickDock, rectToWorld } from "./math.ts";

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

// pickDock: section must straddle the centre line; zero-width docks skipped.
const docks = [
  { name: "hero", rect: { left: 0, top: 0, width: 300, height: 150 }, section: { top: -500, bottom: 300 } },
  { name: "problem", rect: { left: 0, top: 0, width: 0, height: 0 }, section: { top: 300, bottom: 1100 } },
  { name: "problem", rect: { left: 600, top: 300, width: 280, height: 140 }, section: { top: 300, bottom: 1100 } },
];
assert.equal(pickDock(docks, 1000, 800), docks[2]);
assert.equal(pickDock(docks.slice(0, 2), 1000, 800), null);
assert.equal(pickDock([{ ...docks[2], section: null }], 1000, 800), null);

// Several visible docks in one section: the one nearest the viewport centre
// wins, wherever it sits in DOM order.
const pinned = { top: 0, bottom: 800 };
const cards = [
  { name: "problem", rect: { left: -300, top: 200, width: 120, height: 30 }, section: pinned },
  { name: "problem", rect: { left: 560, top: 200, width: 120, height: 30 }, section: pinned },
  { name: "problem", rect: { left: 1560, top: 200, width: 120, height: 30 }, section: pinned },
];
assert.equal(pickDock(cards, 1000, 800), cards[1]);
assert.equal(pickDock([cards[0], cards[2]], 1000, 800), cards[0]);

console.log("math.check: ok");
