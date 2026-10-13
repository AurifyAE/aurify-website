import {
  CircleGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
} from "three";
import { roundedSlab } from "./geometry.ts";

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
  root.add(buildBase(m), buildHinge(m), buildLid(m));
  return root;
}

/** Part 1 · Body: rounded, bevelled aluminium base on four rubber feet. */
function buildBase(m: Mats): Group {
  const base = new Group();
  base.name = "Base";
  base.add(new Mesh(roundedSlab(DIM.w, DIM.baseH, DIM.d, DIM.radius, 0.0015), m.aluminium));

  const foot = new CylinderGeometry(0.0055, 0.0055, 0.0008, 24);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const f = new Mesh(foot, m.dark);
    f.position.set(x * (DIM.w / 2 - 0.022), -0.0004, z * (DIM.d / 2 - 0.02));
    base.add(f);
  }
  base.add(buildDeck(m));
  return base;
}

const PITCH = 0.0185; // one key unit (u), centre to centre
const KEY_GAP = 0.0028;

// Key widths per row in u, back to front; row 0 is the half-depth function row
const ROWS: number[][] = [
  Array(14).fill(14.5 / 14),
  [...Array(13).fill(1), 1.5],
  [1.5, ...Array(13).fill(1)],
  [1.8, ...Array(11).fill(1), 1.7],
  [2.3, ...Array(10).fill(1), 2.2],
  [1, 1, 1, 1.25, 5, 1.25, 1, 1, 1, 1],
];

export const KEY_COUNT = ROWS.reduce((n, row) => n + row.length, 0);

/** Part 4 · Deck: key well, 77 keys, trackpad and speaker grilles on the base's top face. */
function buildDeck(m: Mats): Group {
  const deck = new Group();
  deck.name = "Deck";
  const top = DIM.baseH;
  const kbW = 14.5 * PITCH;
  const kbD = 5.5 * PITCH;
  const kbZ = -DIM.d / 2 + 0.022; // back edge of the keyboard

  const well = new Mesh(roundedSlab(kbW + 0.004, 0.0001, kbD + 0.004, 0.003, 0), m.dark);
  well.position.set(0, top, kbZ + kbD / 2);
  deck.add(well);

  // One InstancedMesh per key size: scaling one shared key would stretch its rounded corners
  const sizes = new Map<string, { w: number; d: number; at: [number, number][] }>();
  let z = kbZ;
  ROWS.forEach((row, r) => {
    const du = r === 0 ? 0.5 : 1;
    let x = -kbW / 2;
    for (const wu of row) {
      const key = `${wu}:${du}`;
      const size = sizes.get(key) ?? { w: wu * PITCH - KEY_GAP, d: du * PITCH - KEY_GAP, at: [] };
      size.at.push([x + (wu * PITCH) / 2, z + (du * PITCH) / 2]);
      sizes.set(key, size);
      x += wu * PITCH;
    }
    z += du * PITCH;
  });
  const matrix = new Matrix4();
  for (const size of sizes.values()) {
    const keys = new InstancedMesh(roundedSlab(size.w, 0.0007, size.d, 0.0018, 0.0003, 1), m.keys, size.at.length);
    keys.name = "Keys";
    size.at.forEach(([kx, kz], i) => keys.setMatrixAt(i, matrix.makeTranslation(kx, top + 0.0001, kz)));
    deck.add(keys);
  }

  const pad = new Mesh(roundedSlab(0.13, 0.0001, 0.074, 0.006, 0), m.trackpad);
  pad.name = "Trackpad";
  pad.position.set(0, top, 0.0616);
  deck.add(pad);

  for (const side of [-1, 1]) {
    const grille = new Mesh(roundedSlab(0.012, 0.0001, kbD, 0.002, 0), m.dark);
    grille.position.set(side * (kbW / 2 + 0.0115), top, kbZ + kbD / 2);
    deck.add(grille);
  }
  return deck;
}

/** Part 2 · Lid: rounded shell pivoting on the hinge axis; rotation 0 = closed. */
function buildLid(m: Mats): Group {
  const lid = new Group();
  lid.name = "Lid";
  lid.position.set(0, DIM.baseH + DIM.gap, -DIM.d / 2);
  const shell = new Mesh(roundedSlab(DIM.w, DIM.lidH, DIM.d, DIM.radius, 0.0012), m.aluminium);
  shell.position.z = DIM.d / 2;
  lid.add(shell, buildDisplay(m));
  return lid;
}

/** Part 3 · Display: black glass over the lid's inner face, camera dot, then the screen. */
function buildDisplay(m: Mats): Group {
  const display = new Group();

  // Rounded like the shell, inset 2 mm, a hair proud of its inner face
  const bezel = new Mesh(roundedSlab(DIM.w - 0.004, 0.0001, DIM.d - 0.004, DIM.radius - 0.002, 0), m.glass);
  bezel.name = "Bezel";
  bezel.position.set(0, -0.0002, DIM.d / 2);

  const camera = new Mesh(new CircleGeometry(0.0012, 24), m.dark);
  camera.name = "Camera";
  camera.rotation.x = Math.PI / 2; // face -Y like the screen
  camera.position.set(0, -0.0003, DIM.d - 0.0035);

  display.add(bezel, camera, buildScreen());
  return display;
}

/** Part 2 · Hinge: dark barrel across the back edge, hidden inside the closed lid. */
function buildHinge(m: Mats): Mesh {
  const hinge = new Mesh(new CylinderGeometry(0.0035, 0.0035, DIM.w * 0.78, 32), m.dark);
  hinge.name = "Hinge";
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, DIM.baseH + DIM.gap / 2, -DIM.d / 2 + 0.0035);
  return hinge;
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
