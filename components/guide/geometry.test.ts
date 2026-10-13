import { test } from "node:test";
import assert from "node:assert/strict";
import { roundedSlab } from "./geometry.ts";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);

test("slab has the requested outer size and sits on y = 0", () => {
  const g = roundedSlab(0.3, 0.01, 0.2, 0.012, 0.0015);
  g.computeBoundingBox();
  const b = g.boundingBox!;
  close(b.max.x - b.min.x, 0.3);
  close(b.max.y - b.min.y, 0.01);
  close(b.max.z - b.min.z, 0.2);
  close(b.min.y, 0);
  close(b.min.x, -0.15);
});

test("zero bevel still gives the full size", () => {
  const g = roundedSlab(0.1, 0.001, 0.05, 0.005, 0);
  g.computeBoundingBox();
  const b = g.boundingBox!;
  close(b.max.x - b.min.x, 0.1);
  close(b.max.y - b.min.y, 0.001);
  close(b.max.z - b.min.z, 0.05);
});
