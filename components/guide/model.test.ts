import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3, type Mesh } from "three";
import { getLaptopNodes } from "./nodes.ts";
import { buildLaptop, DIM } from "./model.ts";

const close = (a: number, b: number, tol = 1e-4) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

test("laptop honours the node contract", () => {
  const root = buildLaptop();
  const { lid, screen } = getLaptopNodes(root);
  assert.ok(root.getObjectByName("Base"));
  assert.equal(lid.rotation.x, 0);
  assert.equal((screen.material as { name: string }).name, "ScreenMat");
});

test("closed laptop has real-world size", () => {
  const size = new Box3().setFromObject(buildLaptop()).getSize(new Vector3());
  close(size.x, DIM.w);
  close(size.z, DIM.d);
});

test("screen is 16:10 with v = 0 at the image top", () => {
  const { screen } = getLaptopNodes(buildLaptop());
  const { width, height } = (screen.geometry as unknown as { parameters: { width: number; height: number } }).parameters;
  close(width / height, 1.6);
  // PlaneGeometry vertex 0 is the top-left corner
  assert.equal(screen.geometry.attributes.uv.getY(0), 0);
});

test("model stays within the 50k triangle budget", () => {
  let tris = 0;
  buildLaptop().traverse((o) => {
    const m = o as Mesh & { isInstancedMesh?: boolean; count?: number };
    if (!m.isMesh) return;
    const g = m.geometry;
    tris += ((g.index?.count ?? g.attributes.position.count) / 3) * (m.isInstancedMesh ? m.count! : 1);
  });
  assert.ok(tris < 50_000, `${tris} triangles`);
});

test("body: rubber feet sit under the base", () => {
  const base = buildLaptop().getObjectByName("Base")!;
  close(new Box3().setFromObject(base).min.y, -0.0008);
});
