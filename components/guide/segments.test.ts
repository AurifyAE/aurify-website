import { test } from "node:test";
import assert from "node:assert/strict";
import { lerpFrame, sampleFrame, type Frame, type Segment } from "./segments.ts";

const f = (x: number, fade = 1): Frame => ({ x, y: 0, rotX: 0, rotY: 0, scale: 1, lid: 0, screen: 0, fade });
const seg = (start: number, end: number, a: Frame, b: Frame): Segment => ({ start, end, at: (t) => lerpFrame(a, b, t) });

// 0 → 10 between scroll 100–200, hold, then 10 → 20 between 300–400
const journey = [seg(100, 200, f(0), f(10)), seg(300, 400, f(10), f(20, 0))];

test("lerpFrame blends every field", () => {
  assert.deepEqual(lerpFrame(f(0), f(10, 0), 0.25), { ...f(2.5), fade: 0.75 });
});

test("inside a segment the frame follows it", () => {
  assert.equal(sampleFrame(journey, 150).x, 5);
  assert.equal(sampleFrame(journey, 350).x, 15);
});

test("before the first segment it holds that segment's start", () => {
  assert.equal(sampleFrame(journey, 0).x, 0);
});

test("between segments it holds where the next one starts", () => {
  assert.equal(sampleFrame(journey, 250).x, 10);
});

test("past the last segment it holds the end, faded out", () => {
  const end = sampleFrame(journey, 9999);
  assert.equal(end.x, 20);
  assert.equal(end.fade, 0);
});
