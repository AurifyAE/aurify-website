import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
} from "three";

/** Real-world size in metres (≈ a 14" laptop). */
export const DIM = {
  w: 0.3123,
  d: 0.2212,
  baseH: 0.011,
  lidH: 0.0045,
  /** Closed lid floats this far above the base so the keys never poke through. */
  gap: 0.0016,
  /** Plan-view corner radius. */
  radius: 0.012,
};

/** 16:10 display panel; the rest of the lid's inner face is bezel. */
export const SCREEN_SIZE = { w: 0.295, h: 0.184375, topBezel: 0.006 };

function materials() {
  return {
    aluminium: new MeshPhysicalMaterial({ color: 0x5b5e63, metalness: 1, roughness: 0.42, clearcoat: 0.15, clearcoatRoughness: 0.5 }),
    dark: new MeshStandardMaterial({ color: 0x141517, metalness: 0.2, roughness: 0.7 }),
    glass: new MeshPhysicalMaterial({ color: 0x050608, metalness: 0, roughness: 0.08, clearcoat: 1 }),
    keys: new MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.55 }),
    trackpad: new MeshPhysicalMaterial({ color: 0x55585d, metalness: 1, roughness: 0.22 }),
  };
}
type Mats = ReturnType<typeof materials>;

/** The guide laptop, modelled closed. See the model contract in the plan. */
export function buildLaptop(): Group {
  const m = materials();
  const root = new Group();
  root.add(buildBase(m), buildLid(m));
  return root;
}

// Skeleton parts: plain boxes that already honour the contract. Tasks 5–9
// replace them one part at a time.
function buildBase(m: Mats): Group {
  const base = new Group();
  base.name = "Base";
  const slab = new Mesh(new BoxGeometry(DIM.w, DIM.baseH, DIM.d), m.aluminium);
  slab.position.y = DIM.baseH / 2;
  base.add(slab);
  return base;
}

function buildLid(m: Mats): Group {
  const lid = new Group();
  lid.name = "Lid";
  // Pivot on the hinge axis at the back edge; rotation 0 = closed
  lid.position.set(0, DIM.baseH + DIM.gap, -DIM.d / 2);
  const shell = new Mesh(new BoxGeometry(DIM.w, DIM.lidH, DIM.d), m.aluminium);
  shell.position.set(0, DIM.lidH / 2, DIM.d / 2);
  lid.add(shell, buildScreen());
  return lid;
}

/** The panel the rig textures: faces -Y (toward the keys) while closed. */
function buildScreen(): Mesh {
  const geo = new PlaneGeometry(SCREEN_SIZE.w, SCREEN_SIZE.h);
  // glTF UV convention (v = 0 at the image top) so textures load with flipY = false
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  const mat = new MeshBasicMaterial({ color: 0x000000 });
  mat.name = "ScreenMat";
  const screen = new Mesh(geo, mat);
  screen.name = "Screen";
  // Plane +Y (image top) ends up pointing away from the hinge = up when open
  screen.rotation.x = Math.PI / 2;
  screen.position.set(0, -0.0004, DIM.d - SCREEN_SIZE.topBezel - SCREEN_SIZE.h / 2);
  return screen;
}
