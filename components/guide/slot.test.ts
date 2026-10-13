import { test } from "node:test";
import assert from "node:assert/strict";
import { slotFromBox } from "./slot.ts";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);

test("box centre maps to viewport fractions from the middle, y up", () => {
  const s = slotFromBox({ left: 1000, top: 300, width: 400, height: 250 }, 1600, 900);
  close(s.x, 0.25);
  close(s.y, 0.5 - 425 / 900);
  close(s.scale, 0.25);
});

test("a centred box is the origin", () => {
  const s = slotFromBox({ left: 700, top: 400, width: 200, height: 100 }, 1600, 900);
  close(s.x, 0);
  close(s.y, 0);
});

test("widthFactor scales the laptop relative to the box", () => {
  const s = slotFromBox({ left: 0, top: 0, width: 256, height: 256 }, 1280, 800, 1.5);
  close(s.scale, (256 * 1.5) / 1280);
});
