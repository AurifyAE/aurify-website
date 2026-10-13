import { test } from "node:test";
import assert from "node:assert/strict";
import { Group, Mesh } from "three";
import { getLaptopNodes } from "./nodes.ts";

test("a model without a Lid fails loudly", () => {
  const root = new Group();
  const screen = new Mesh();
  screen.name = "Screen";
  root.add(screen);
  assert.throws(() => getLaptopNodes(root), /Lid/);
});

test("a Screen that is not a mesh fails loudly", () => {
  const root = new Group();
  const lid = new Group();
  lid.name = "Lid";
  const screen = new Group();
  screen.name = "Screen";
  root.add(lid, screen);
  assert.throws(() => getLaptopNodes(root), /Screen/);
});
