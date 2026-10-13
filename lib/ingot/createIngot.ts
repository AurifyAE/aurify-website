import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

// Bar size in model units. Length is 1 so a dock's pixel width can be used
// directly as the scale (see rectToWorld in lib/ingot/math.ts).
const LENGTH = 1;
const WIDTH = 0.5;
const HEIGHT = 0.22;
// How far each top edge pulls in - the classic bullion trapezoid.
const TAPER_X = 0.16;
const TAPER_Z = 0.3;
const RADIUS = 0.012;

export type Ingot = {
  group: THREE.Group;
  dispose(): void;
};

/** Aurify mark as an engraved bump map spanning the bar's top face. */
async function stampTexture(): Promise<THREE.CanvasTexture> {
  const img = new Image();
  img.src = "/logo/aurify-logo.svg";
  await img.decode();

  // 2:1 canvas matches the bar's top-down LENGTH:WIDTH, so u/v map evenly.
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const w = 480;
  const h = (w * img.height) / img.width;
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  // Silhouette the full-colour logo in black on white: dark reads as
  // engraved (low) in a bump map.
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  // Canvas top row = far edge of the bar (-z), so the mark reads upright
  // to a camera in front of the bar.
  texture.flipY = false;
  return texture;
}

/** One quarter of the bar, tapered in whole-bar space so pieces sit flush. */
function fragmentGeometry(ix: number, iz: number, segments: number) {
  const cx = ((ix - 0.5) * LENGTH) / 2;
  const cz = ((iz - 0.5) * WIDTH) / 2;
  const box = new RoundedBoxGeometry(LENGTH / 2, HEIGHT, WIDTH / 2, segments, RADIUS);
  box.translate(cx, 0, cz);

  const pos = box.attributes.position;
  const uv = box.attributes.uv;
  const normal = box.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + HEIGHT / 2) / HEIGHT; // 0 base -> 1 top
    const x = pos.getX(i) * (1 - TAPER_X * t);
    const z = pos.getZ(i) * (1 - TAPER_Z * t);
    pos.setXYZ(i, x, pos.getY(i), z);
    // Top-down planar UVs in whole-bar space so the stamp spans all 4
    // pieces; every other face samples the blank corner, or the cut faces
    // would show the logo smeared into streaks once the bar splits.
    const top = normal.getY(i) > 0.99;
    uv.setXY(i, top ? x / LENGTH + 0.5 : 0, top ? z / WIDTH + 0.5 : 0);
  }

  // Taper tilts the sides, so normals are rebuilt; merging the box's
  // per-face seams first keeps the rounded edges smooth.
  box.deleteAttribute("normal");
  const geometry = mergeVertices(box);
  box.dispose();
  geometry.computeVertexNormals();
  geometry.translate(-cx, 0, -cz);
  return { geometry, home: new THREE.Vector3(cx, 0, cz) };
}

export async function createIngot({ segments = 4 }: { segments?: number } = {}): Promise<Ingot> {
  const stamp = await stampTexture();
  const material = new THREE.MeshPhysicalMaterial({
    color: "#c98d1f",
    metalness: 1,
    roughness: 0.34,
    // The room environment's light panels blow a full-strength gold out to white.
    envMapIntensity: 0.5,
    bumpMap: stamp,
    bumpScale: 2,
  });

  const group = new THREE.Group();
  const fragments = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ].map(([ix, iz]) => {
    const { geometry, home } = fragmentGeometry(ix, iz, segments);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(home);
    group.add(mesh);
    return mesh;
  });

  return {
    group,
    dispose() {
      fragments.forEach((f) => f.geometry.dispose());
      material.dispose();
      stamp.dispose();
    },
  };
}
