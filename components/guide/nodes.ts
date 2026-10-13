import type { Mesh, Object3D } from "three";

export type LaptopNodes = { lid: Object3D; screen: Mesh };

/**
 * Finds the nodes the rig drives, so a renamed part in model.ts fails loudly
 * here instead of silently not animating.
 */
export function getLaptopNodes(root: Object3D): LaptopNodes {
  const lid = root.getObjectByName("Lid");
  const screen = root.getObjectByName("Screen") as Mesh | undefined;
  if (!lid || !screen?.isMesh) {
    const missing = [!lid && "Lid", !screen?.isMesh && "Screen"].filter(Boolean);
    throw new Error(`laptop model is missing node(s): ${missing.join(", ")}`);
  }
  return { lid, screen };
}
