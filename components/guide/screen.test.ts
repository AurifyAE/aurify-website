import { test } from "node:test";
import assert from "node:assert/strict";
import { screenBlend } from "./screen.ts";

test("whole index shows that screen alone", () => {
  assert.deepEqual(screenBlend(0, 9), { a: 0, b: 1, mix: 0 });
});

test("fractional index blends towards the next screen", () => {
  assert.deepEqual(screenBlend(2.25, 9), { a: 2, b: 3, mix: 0.25 });
});

test("last screen has nothing after it", () => {
  assert.deepEqual(screenBlend(8, 9), { a: 8, b: 8, mix: 0 });
});

test("out-of-range indexes clamp", () => {
  assert.deepEqual(screenBlend(-1, 9), { a: 0, b: 1, mix: 0 });
  assert.deepEqual(screenBlend(12, 9), { a: 8, b: 8, mix: 0 });
});
