# Ingot Scroll Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One gold ingot in a fixed WebGL canvas travels from the home Hero to the Problem section, docking beside each section's copy, fracturing and reassembling in the Problem pin, then leaving.

**Architecture:** A fixed, pointer-events-none canvas (`IngotStage`) lazy-loads `three` after hydration. Each section marks where the ingot belongs with an invisible `data-ingot-dock` box; every frame the stage picks the dock whose section holds the viewport centre line and damps the ingot toward it. Existing GSAP scrubs write a tiny shared `ingotState` object (lifecycle progress, split, glint) so the 3D stays locked to the copy.

**Tech Stack:** Next 15 / React 19, `three` (new), GSAP + ScrollTrigger (`@/lib/gsap`), Lenis, Tailwind 3. Node 24 (runs `.ts` natively for the self-check script).

**Spec:** `docs/superpowers/specs/2026-10-12-ingot-scroll-guide-design.md`

## Global Constraints

- Home page only; sections §1-§4 (`Hero`, `LifecycleStrip`, `Opportunity`, `ProblemInterlude`). Nothing after Problem changes.
- One new runtime dependency: `three` (+ `@types/three` dev). No R3F, no drei, no `.glb`, no HDR file.
- `three` must not raise `/` First Load JS - it lives only in the dynamically imported `runIngotStage` chunk.
- Canvas: `position: fixed`, `pointer-events: none`, `z-[1]` - above section backgrounds, below navbar (`z-nav` = 50), floating menu (z-40), modals (z-70/80).
- Lifecycle and Opportunity layouts do not change; only invisible dock boxes are added.
- GSAP is imported only from `@/lib/gsap`; motion queries use `MOTION_OK` / `MOTION_REDUCED` from `@/lib/animation`.
- Every stage ends with a **STOP - user approval gate**. Do not start the next task until the user approves the proof.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

**Deliberate deviations from the spec (all minor, flagged for review):**
- Pure math lives in `lib/ingot/math.ts` (not `rectToWorld.ts`) because it also holds `pickDock`, `lifecycleRect`, `fragmentAmount`, `shortestAngle` - all covered by one check script.
- The three.js loop lives in `components/three/runIngotStage.ts` (separate from `IngotStage.tsx`) so `three` lands in its own lazy chunk.
- The stage reads every dock's and section's rect per frame (~10 read-only `getBoundingClientRect` calls, no interleaved layout writes), not one.
- Reduced motion: the ingot snaps to each dock and fades in there (the spec's "cross-fade").
- Opportunity dock shows from `xl` up only - below 1280px the heading leaves no room beside it, so the ingot hides there.
- WebGL unavailable: Problem's right column stays as blank space rather than collapsing (the dock box keeps its size; collapsing would need a JS-set class for a rare case).

## Review Focus

1. **Window resize / orientation change mid-scroll** - ingot should re-dock at the new size without drifting or clipping (camera distance recomputed). Test added to Task 4.
2. **Lifecycle numeral click (stage jump) and fast flick scrolling** - the roll must still land square on the stage when the strip settles. Test added to Task 4.
3. **Hero carousel reaching the E-Invoicing poster slide** - ingot fades out, then returns on the next text slide. Test added to Task 3.
4. **Client-side navigation away from and back to `/` repeatedly** - exactly one canvas, no WebGL context warnings, no console errors. Test added to Task 6.
5. **WebGL unavailable** - page renders and scrolls normally with no ingot and no errors. Test added to Task 7.

---

### Task 1: The ingot, alone (Stage 1)

**Files:**
- Modify: `package.json` (add `three`, `@types/three`)
- Create: `lib/ingot/createIngot.ts`
- Create: `app/dev/ingot/page.tsx`
- Create: `app/dev/ingot/IngotSandbox.tsx`

**Interfaces:**
- Produces: `createIngot(options?: { segments?: number }): Promise<Ingot>` where
  `type Ingot = { group: THREE.Group; fragments: THREE.Mesh[]; dispose(): void }`.
  The bar is 1 model unit long on X, 0.5 on Z, 0.22 tall on Y, centred at the origin; fragments are ordered far-left, far-right, near-left, near-right.

- [ ] **Step 1: Install three**

```bash
npm install three
npm install -D @types/three
```

Expected: both appear in `package.json`; `npm ls three` prints one version.

- [ ] **Step 2: Create `lib/ingot/createIngot.ts`**

```ts
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
  fragments: THREE.Mesh[];
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
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + HEIGHT / 2) / HEIGHT; // 0 base -> 1 top
    const x = pos.getX(i) * (1 - TAPER_X * t);
    const z = pos.getZ(i) * (1 - TAPER_Z * t);
    pos.setXYZ(i, x, pos.getY(i), z);
    // Top-down planar UVs in whole-bar space: the stamp spans all 4 pieces.
    uv.setXY(i, x / LENGTH + 0.5, z / WIDTH + 0.5);
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
    color: "#e8b64c",
    metalness: 1,
    roughness: 0.28,
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
    fragments,
    dispose() {
      fragments.forEach((f) => f.geometry.dispose());
      material.dispose();
      stamp.dispose();
    },
  };
}
```

- [ ] **Step 3: Create the dev-only page `app/dev/ingot/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import IngotSandbox from "./IngotSandbox";

export const metadata = { robots: { index: false, follow: false } };

// Dev-only workbench for the ingot; deleted in Task 7.
export default function IngotDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <IngotSandbox />;
}
```

- [ ] **Step 4: Create `app/dev/ingot/IngotSandbox.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createIngot, type Ingot } from "@/lib/ingot/createIngot";

export default function IngotSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.6, 2.4);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    let ingot: Ingot | undefined;
    let disposed = false;
    createIngot().then((i) => {
      if (disposed) return i.dispose();
      ingot = i;
      scene.add(i.group);
    });

    const resize = () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      controls.dispose();
      ingot?.dispose();
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="h-svh bg-paper pt-24">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Visual check**

Start the preview server `aurify-dev` (port 3200) and open `http://localhost:3200/dev/ingot`. Then:
- `read_console_messages` with `onlyErrors: true` → expected: none.
- Screenshot the default (front, slightly above) view.
- `left_click_drag` across the canvas ~200px horizontally → screenshot (three-quarter view).
- `left_click_drag` downward ~250px → screenshot (top-down: the Aurify mark must read **upright, not mirrored**). If it is mirrored left-right, change `uv.setXY(i, x / LENGTH + 0.5, …)` to `uv.setXY(i, 0.5 - x / LENGTH, …)`; if upside down, set `texture.flipY = true`. Re-check.

Things to look for: trapezoid silhouette, gold (not grey) reflections, hairline seams between the 4 pieces, legible engraved mark. Tune `color` / `roughness` / `bumpScale` here if needed.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json lib/ingot/createIngot.ts app/dev/ingot
git commit -m "feat(ingot): add code-built gold ingot and dev workbench

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 8: STOP - user approval gate.** Send the 3 screenshots. Wait for an explicit approval of shape, finish and stamp (or apply requested tweaks and re-send) before Task 2.

---

### Task 2: Fracture (Stage 2)

**Files:**
- Create: `lib/ingot/math.ts`
- Create: `lib/ingot/math.check.mjs`
- Modify: `lib/ingot/createIngot.ts`
- Modify: `app/dev/ingot/IngotSandbox.tsx`

**Interfaces:**
- Consumes: `createIngot`, `Ingot` from Task 1.
- Produces: `fragmentAmount(split: number, index: number, count: number): number` (0 = docked, 1 = fully scattered) in `lib/ingot/math.ts`; `Ingot` gains `setSplit(split: number): void` (split 0 = whole bar, 1 = all four pieces scattered; pieces scatter in reverse order and dock in order 0→3 as split falls 1→0).

- [ ] **Step 1: Write the failing self-check `lib/ingot/math.check.mjs`**

```js
// Self-check for lib/ingot/math.ts. Run: node lib/ingot/math.check.mjs
import assert from "node:assert/strict";
import { fragmentAmount } from "./math.ts";

// Whole bar and fully scattered.
for (let i = 0; i < 4; i++) {
  assert.equal(fragmentAmount(0, i, 4), 0);
  assert.equal(fragmentAmount(1, i, 4), 1);
}
// split 1 -> 0.75 docks piece 0 only; 0.75 -> 0.5 docks piece 1, etc.
assert.equal(fragmentAmount(0.75, 0, 4), 0);
assert.equal(fragmentAmount(0.75, 1, 4), 1);
assert.equal(fragmentAmount(0.875, 0, 4), 0.5);
assert.equal(fragmentAmount(0.25, 2, 4), 0);
assert.equal(fragmentAmount(0.125, 3, 4), 0.5);

console.log("math.check: ok");
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node lib/ingot/math.check.mjs`
Expected: FAIL - `Cannot find module …/lib/ingot/math.ts`.

- [ ] **Step 3: Create `lib/ingot/math.ts`**

```ts
// Pure, dependency-free maths for the travelling ingot. Checked by
// lib/ingot/math.check.mjs (no test runner in this repo).

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * How scattered fragment `index` is (0 docked → 1 scattered) for a global
 * split. As split falls 1 → 0 the pieces dock one per equal step, piece 0
 * first, so each Problem gap line docks exactly one piece.
 */
export function fragmentAmount(split: number, index: number, count: number): number {
  return clamp((split - (count - 1 - index) / count) * count, 0, 1);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `node lib/ingot/math.check.mjs`
Expected: `math.check: ok` (a Node type-stripping ExperimentalWarning line is fine).

- [ ] **Step 5: Add `setSplit` to `lib/ingot/createIngot.ts`**

Add the import at the top:

```ts
import { fragmentAmount } from "./math";
```

Add below the `RADIUS` constant:

```ts
// Where each piece flies when scattered (model units, same order as the
// fragments) and how far it tumbles - outward and up, like a cracked bar.
const SCATTER = [
  { dir: new THREE.Vector3(-0.45, 0.3, -0.25), rot: new THREE.Euler(-0.5, 0.3, 0.4) },
  { dir: new THREE.Vector3(0.45, 0.35, -0.2), rot: new THREE.Euler(-0.4, -0.35, -0.45) },
  { dir: new THREE.Vector3(-0.4, -0.3, 0.3), rot: new THREE.Euler(0.45, 0.25, -0.35) },
  { dir: new THREE.Vector3(0.42, -0.28, 0.25), rot: new THREE.Euler(0.4, -0.3, 0.5) },
];
```

Change the `Ingot` type to:

```ts
export type Ingot = {
  group: THREE.Group;
  fragments: THREE.Mesh[];
  /** 0 = whole bar, 1 = all four pieces scattered. */
  setSplit(split: number): void;
  dispose(): void;
};
```

In `createIngot`, keep each piece's home position and add `setSplit` to the returned object:

```ts
  const group = new THREE.Group();
  const homes: THREE.Vector3[] = [];
  const fragments = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ].map(([ix, iz]) => {
    const { geometry, home } = fragmentGeometry(ix, iz, segments);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(home);
    homes.push(home);
    group.add(mesh);
    return mesh;
  });

  return {
    group,
    fragments,
    setSplit(split) {
      fragments.forEach((mesh, i) => {
        const a = fragmentAmount(split, i, fragments.length);
        const { dir, rot } = SCATTER[i];
        mesh.position.copy(homes[i]).addScaledVector(dir, a);
        mesh.rotation.set(rot.x * a, rot.y * a, rot.z * a);
      });
    },
    dispose() {
      fragments.forEach((f) => f.geometry.dispose());
      material.dispose();
      stamp.dispose();
    },
  };
```

- [ ] **Step 6: Add a split slider to `app/dev/ingot/IngotSandbox.tsx`**

Add `const splitRef = useRef(0);` next to `canvasRef`. In the animation loop, before `renderer.render`, add `ingot?.setSplit(splitRef.current);`. Replace the returned JSX with:

```tsx
  return (
    <div className="relative h-svh bg-paper pt-24">
      <canvas ref={canvasRef} className="h-full w-full" />
      <label className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 text-sm text-ink/60">
        split
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          defaultValue={0}
          aria-label="Ingot split"
          onChange={(e) => (splitRef.current = Number(e.target.value))}
        />
      </label>
    </div>
  );
```

- [ ] **Step 7: Type-check, lint, visual check**

Run: `npx tsc --noEmit && npm run lint` → no errors.
On `/dev/ingot`, use `find` for "Ingot split", then `form_input` to set 0, 0.5 and 1, screenshotting each. Expected: 0 = flush bar; 0.5 = two pieces docked (pieces 0 and 1), two scattered; 1 = four pieces scattered outward and up, no piece intersecting another. Console clean.

- [ ] **Step 8: Commit**

```bash
git add lib/ingot app/dev/ingot
git commit -m "feat(ingot): fracture into four pieces with ordered docking

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 9: STOP - user approval gate.** Send the 3 split screenshots and wait for approval.

---

### Task 3: Fixed canvas on `/` + Hero dock (Stage 3)

**Files:**
- Modify: `lib/ingot/math.ts`, `lib/ingot/math.check.mjs`
- Create: `lib/ingot/ingotState.ts`
- Create: `components/three/runIngotStage.ts`
- Create: `components/three/IngotStage.tsx`
- Modify: `app/page.tsx`
- Modify: `components/sections/home/Hero.tsx` (orb removal ~L484-535, content track ~L604, poster effect, dock)
- Modify: `tailwind.config.ts` (remove `halo-x` / `halo-y`)

**Interfaces:**
- Consumes: `createIngot`, `Ingot.setSplit`, `fragmentAmount`.
- Produces (later tasks rely on these exact names):
  - `lib/ingot/math.ts`: `type Rect = { left: number; top: number; width: number; height: number }`, `type DockName = "hero" | "lifecycle" | "opportunity" | "problem"`, `type DockSample = { name: DockName; rect: Rect; section: { top: number; bottom: number } | null }`, `cameraDistance(vh, fovDeg)`, `rectToWorld(rect, vw, vh): { x; y; scale }`, `lifecycleRect(band: Rect, progress: number): Rect`, `pickDock(docks: DockSample[], vh): DockSample | null`, `shortestAngle(current, target)`.
  - `lib/ingot/ingotState.ts`: `ingotState = { heroHidden: boolean; lifecycle: number; lifecycleSteps: number; split: number; glint: number }`.
  - DOM contract: any element with `data-ingot-dock="<DockName>"` inside a `<section>`; a dock with zero width (e.g. `display:none` at a breakpoint) is ignored. Its **width is the ingot's length in px**.

- [ ] **Step 1: Record the bundle baseline**

Run: `npm run build`
Record the `/` row's **First Load JS** from the route table (e.g. `/ … 182 kB`). Needed in Step 13.

- [ ] **Step 2: Extend the failing self-check `lib/ingot/math.check.mjs`**

Replace the import line and append before the final `console.log`:

```js
import {
  cameraDistance,
  fragmentAmount,
  lifecycleRect,
  pickDock,
  rectToWorld,
  shortestAngle,
} from "./math.ts";

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≉ ${b}`);

// 1 world unit = 1 CSS px on z=0: at 90° fov the distance is half the height.
near(cameraDistance(1000, 90), 500);

// Centred dock -> origin; width becomes scale (ingot length in px).
assert.deepEqual(rectToWorld({ left: 400, top: 300, width: 200, height: 100 }, 1000, 800), {
  x: 0,
  y: 50,
  scale: 200,
});
// Off-screen corner dock is clamped to the inner 80% of the viewport.
const corner = rectToWorld({ left: -500, top: 2000, width: 100, height: 100 }, 1000, 800);
assert.equal(corner.x, -400);
assert.equal(corner.y, -320);

// Lifecycle: a 2:1 ingot box centred on the progress head.
assert.deepEqual(lifecycleRect({ left: 100, top: 500, width: 800, height: 50 }, 0.5), {
  left: 450,
  top: 500,
  width: 100,
  height: 50,
});

// pickDock: section must straddle the centre line; zero-width docks skipped.
const docks = [
  { name: "hero", rect: { left: 0, top: 0, width: 300, height: 150 }, section: { top: -500, bottom: 300 } },
  { name: "problem", rect: { left: 0, top: 0, width: 0, height: 0 }, section: { top: 300, bottom: 1100 } },
  { name: "problem", rect: { left: 600, top: 300, width: 280, height: 140 }, section: { top: 300, bottom: 1100 } },
];
assert.equal(pickDock(docks, 800), docks[2]);
assert.equal(pickDock(docks.slice(0, 2), 800), null);
assert.equal(pickDock([{ ...docks[2], section: null }], 800), null);

// shortestAngle returns an equivalent of `current` within π of `target`.
near(shortestAngle(0.1 + 10 * Math.PI, 0.1), 0.1);
near(Math.abs(shortestAngle(3 * Math.PI, 0)), Math.PI);
near(shortestAngle(-0.2, 2 * Math.PI), 2 * Math.PI - 0.2);
```

- [ ] **Step 3: Run it to verify it fails**

Run: `node lib/ingot/math.check.mjs`
Expected: FAIL - `does not provide an export named 'cameraDistance'`.

- [ ] **Step 4: Add the functions to `lib/ingot/math.ts`**

Append:

```ts
export type Rect = { left: number; top: number; width: number; height: number };
export type DockName = "hero" | "lifecycle" | "opportunity" | "problem";
export type DockSample = {
  name: DockName;
  rect: Rect;
  section: { top: number; bottom: number } | null;
};

/** Camera distance at which 1 world unit = 1 CSS px on the z = 0 plane. */
export function cameraDistance(vh: number, fovDeg: number): number {
  return vh / 2 / Math.tan((fovDeg * Math.PI) / 360);
}

/**
 * Dock rect (viewport px) → ingot centre in world px (origin at viewport
 * centre, y up) and scale (the bar is 1 unit long, so scale = width px).
 * The centre is clamped to the inner 80% of the viewport so the guide stays
 * on screen while its next dock is still scrolling in.
 */
export function rectToWorld(r: Rect, vw: number, vh: number) {
  return {
    x: clamp(r.left + r.width / 2 - vw / 2, -vw * 0.4, vw * 0.4),
    y: clamp(vh / 2 - (r.top + r.height / 2), -vh * 0.4, vh * 0.4),
    scale: r.width,
  };
}

/** Lifecycle: a 2:1 box (length = 2 × band height) centred on the line's head. */
export function lifecycleRect(band: Rect, progress: number): Rect {
  return {
    left: band.left + progress * band.width - band.height,
    top: band.top,
    width: band.height * 2,
    height: band.height,
  };
}

/** The visible dock whose section straddles the viewport's centre line. */
export function pickDock(docks: DockSample[], vh: number): DockSample | null {
  const mid = vh / 2;
  return (
    docks.find(
      (d) => d.section && d.section.top <= mid && d.section.bottom > mid && d.rect.width > 0
    ) ?? null
  );
}

/** `current` shifted by whole turns to lie within π of `target` (no unwinding spins). */
export function shortestAngle(current: number, target: number): number {
  const TAU = Math.PI * 2;
  return target + ((((current - target) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `node lib/ingot/math.check.mjs`
Expected: `math.check: ok`.

- [ ] **Step 6: Create `lib/ingot/ingotState.ts`**

```ts
/**
 * Shared values section timelines write and IngotStage reads each frame.
 * Sections never touch three.js objects - this keeps the 3D on exactly the
 * same scrub as the copy it accompanies.
 */
export const ingotState = {
  /** Hero is showing a full-bleed poster slide - hide the ingot. */
  heroHidden: false,
  /** LifecycleStrip scrub progress, 0..1. */
  lifecycle: 0,
  /** Stage-to-stage moves in the strip (stages - 1); one quarter roll each. */
  lifecycleSteps: 1,
  /** ProblemInterlude: 0 whole bar → 1 fully scattered. */
  split: 0,
  /** ProblemInterlude closer: specular sweep across the stamp, 0..1. */
  glint: 0,
};
```

- [ ] **Step 7: Create `components/three/runIngotStage.ts`**

```ts
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MOTION_REDUCED } from "@/lib/animation";
import { createIngot } from "@/lib/ingot/createIngot";
import { ingotState } from "@/lib/ingot/ingotState";
import {
  cameraDistance,
  lifecycleRect,
  pickDock,
  rectToWorld,
  shortestAngle,
  type DockName,
} from "@/lib/ingot/math";

const FOV = 30;
// Exponential follow rate (1/s): slow enough that the ingot visibly trails
// the scroll like a guide catching up, fast enough to land within ~1s.
const FOLLOW = 4;
const QUARTER_TURN = Math.PI / 2;

type Pose = { rx: number; ry: number; rz: number; spin?: boolean; float?: boolean };
const POSES: Record<DockName, Pose> = {
  hero: { rx: 0.35, ry: 0, rz: 0, spin: true, float: true },
  lifecycle: { rx: 0.25, ry: 0, rz: 0 },
  opportunity: { rx: 0.45, ry: -0.5, rz: 0.05, float: true },
  problem: { rx: 0.3, ry: 0, rz: 0 },
};

/** Starts the ingot loop on `canvas`; resolves to a dispose function. */
export async function runIngotStage(canvas: HTMLCanvasElement): Promise<() => void> {
  // shortcut: breakpoint + motion preference are read once; crossing md or
  // toggling reduced motion applies on the next load. Upgrade if QA flags it.
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const reduced = window.matchMedia(MOTION_REDUCED).matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: desktop });
  } catch {
    // No WebGL: every section reads fine without the ingot.
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, desktop ? 2 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 10000);

  const ingot = await createIngot({ segments: desktop ? 4 : 2 });
  const g = ingot.group;
  g.scale.setScalar(0);
  scene.add(g);
  // Child of the bar, so it moves and scales with it; swept by ingotState.glint.
  const glint = new THREE.PointLight("#fff1c8", 0, 0, 0);
  g.add(glint);

  const resize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.position.z = cameraDistance(vh, FOV);
    camera.far = camera.position.z * 3;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  // Section markup is server-rendered, so the docks exist by now.
  const docks = Array.from(
    document.querySelectorAll<HTMLElement>("[data-ingot-dock]"),
    (el) => ({ el, name: el.dataset.ingotDock as DockName, section: el.closest("section") })
  );

  const clock = new THREE.Clock();
  // Damped base transform; float is layered on top so it never accumulates.
  const base = { x: 0, y: 0, s: 0 };
  let soft = 1;
  let fade = 1;
  let lastDock: DockName | null = null;
  let drawn = false;

  renderer.setAnimationLoop(() => {
    // Floor keeps damp() finite (Infinity × 0 = NaN under reduced motion).
    const dt = THREE.MathUtils.clamp(clock.getDelta(), 1e-3, 0.1);
    const t = clock.elapsedTime;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const k = reduced ? Infinity : FOLLOW;
    const damp = (from: number, to: number) => THREE.MathUtils.damp(from, to, k, dt);

    const dock = pickDock(
      docks.map((d) => ({
        name: d.name,
        rect: d.el.getBoundingClientRect(),
        section: d.section?.getBoundingClientRect() ?? null,
      })),
      vh
    );
    const name = dock?.name ?? null;
    const target =
      dock && !(dock.name === "hero" && ingotState.heroHidden)
        ? rectToWorld(
            dock.name === "lifecycle" ? lifecycleRect(dock.rect, ingotState.lifecycle) : dock.rect,
            vw,
            vh
          )
        : { x: base.x, y: base.y, scale: 0 };

    const prevX = base.x;
    base.x = damp(base.x, target.x);
    base.y = damp(base.y, target.y);
    base.s = damp(base.s, target.scale);

    const pose = POSES[name ?? "problem"];
    const float = pose.float && !reduced ? Math.sin(t * 1.2) * base.s * 0.03 : 0;
    g.position.set(base.x, base.y + float, 0);
    g.scale.setScalar(base.s);

    // Bank into horizontal travel like a plane turning (px/s → radians).
    const bank = reduced ? 0 : THREE.MathUtils.clamp(-(base.x - prevX) / dt / 2000, -0.4, 0.4);
    const rx =
      pose.rx +
      (name === "lifecycle" ? ingotState.lifecycle * ingotState.lifecycleSteps * QUARTER_TURN : 0);
    const ry = pose.ry + (pose.spin && !reduced ? (t * Math.PI) / 4 : 0); // 1 turn / 8s
    const rz = pose.rz + bank;
    g.rotation.set(
      damp(shortestAngle(g.rotation.x, rx), rx),
      damp(shortestAngle(g.rotation.y, ry), ry),
      damp(shortestAngle(g.rotation.z, rz), rz)
    );

    ingot.setSplit(desktop ? ingotState.split : 0);
    glint.position.set(THREE.MathUtils.lerp(-0.7, 0.7, ingotState.glint), 0.6, 0.5);
    glint.intensity = Math.sin(ingotState.glint * Math.PI) * 3;

    // Hero softening: blurred + dimmed behind the headline, sharp once it leaves.
    soft = damp(soft, name === "hero" ? 1 : 0);
    // Reduced motion skips travel, so fade in at each new dock instead.
    if (reduced && name !== lastDock) fade = 0;
    lastDock = name;
    fade = THREE.MathUtils.damp(fade, 1, 6, dt);
    canvas.style.filter = soft > 0.01 ? `blur(${(soft * 4).toFixed(2)}px)` : "";
    canvas.style.opacity = ((1 - soft * 0.4) * fade).toFixed(3);

    // Skip GPU work while the ingot is invisible; clear once so no stale frame lingers.
    if (base.s > 0.5) {
      renderer.render(scene, camera);
      drawn = true;
    } else if (drawn) {
      renderer.clear();
      drawn = false;
    }
  });

  return () => {
    renderer.setAnimationLoop(null);
    window.removeEventListener("resize", resize);
    ingot.dispose();
    envMap.dispose();
    pmrem.dispose();
    renderer.dispose();
    // Free the context now - repeated client-side visits to / would
    // otherwise pile up toward the browser's live-context limit.
    renderer.forceContextLoss();
  };
}
```

- [ ] **Step 8: Create `components/three/IngotStage.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed full-viewport canvas for the travelling ingot (home, Hero → Problem).
 * Sits above section backgrounds (z-[1]) but below the navbar, menus and
 * modals, and never takes pointer events. three.js loads in its own chunk
 * once the browser is idle after hydration, so it never counts against
 * first load. Choreography lives in runIngotStage + the data-ingot-dock
 * boxes in each section.
 */
export default function IngotStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    const start = () => {
      import("./runIngotStage").then(async ({ runIngotStage }) => {
        if (cancelled) return;
        const stop = await runIngotStage(canvas);
        if (cancelled) stop();
        else dispose = stop;
      });
    };
    // Safari has no requestIdleCallback. (typeof, not `in`: `in` would
    // narrow `window` to never in the else branch.)
    let cancelStart: () => void;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      cancelStart = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(start, 200);
      cancelStart = () => window.clearTimeout(id);
    }

    return () => {
      cancelled = true;
      cancelStart();
      dispose?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    />
  );
}
```

- [ ] **Step 9: Mount it in `app/page.tsx`**

Add the import below the other component imports:

```tsx
import IngotStage from "@/components/three/IngotStage";
```

and make it the first child of the fragment:

```tsx
    <>
      <IngotStage />
      <Hero />
```

- [ ] **Step 10: Hero - remove the orb, layer the copy, add the dock and poster hiding**

In `components/sections/home/Hero.tsx`:

1. Add the import: `import { ingotState } from "@/lib/ingot/ingotState";`
2. Delete the whole dial block inside the `meshRef` div: from the comment line `{/* Centering translate stays on this wrapper; the wander keyframes` through the `</div>` that closes `<div className="absolute left-1/2 top-[46%] h-[min(92vmin,60rem)] …">` (currently lines ~484-535). Keep the `</div>` that closes the `meshRef` div itself.
3. Rewrite the "Ambient background" comment above `meshRef` to say: brand washes + masked technical grid + crosshair marks; the centrepiece is now the travelling ingot (`IngotStage`), docked at `[data-ingot-dock="hero"]`. Also update the "Cursor-parallax on the dial assembly" comment to "on the ambient background", and in the "Headline veil" comment replace "where the ring band crosses it" with "over the ambient washes".
4. Right after the closing `</div>` of the `meshRef` div, add the dock:

```tsx
      {/* Where the travelling ingot sits (IngotStage reads this box; its
          width is the bar's length). It renders behind the copy - the
          content track below is layered above the canvas. */}
      <div
        data-ingot-dock="hero"
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] h-[27.5vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 md:h-[min(20vmin,13rem)] md:w-[min(40vmin,26rem)]"
      />
```

5. Layer the copy above the canvas - replace
   `<div className="relative flex w-full flex-1 overflow-hidden">` with
   `<div className="relative z-[2] flex w-full flex-1 overflow-hidden">`.
6. Below the `navDark` `useEffect`, add:

```tsx
  // A full-bleed poster covers the hero - the ingot steps out for it.
  useEffect(() => {
    ingotState.heroHidden = posterActive;
  }, [posterActive]);
```

- [ ] **Step 11: Remove the unused halo animations from `tailwind.config.ts`**

Delete the `"halo-x"` and `"halo-y"` keyframes (with their 4-line "Hero halo wander" comment) and the two `"halo-x"` / `"halo-y"` animation entries (with their 3-line "9s vs 7s periods" comment). Leave `spin-slow` / `spin-slow-rev` - Ecosystem and ModuleExplorer use them.
Verify: `grep -rn "halo-" components app tailwind.config.ts` → no matches.

- [ ] **Step 12: Type-check, lint, self-check**

Run: `npx tsc --noEmit && npm run lint && node lib/ingot/math.check.mjs`
Expected: no errors; `math.check: ok`.

- [ ] **Step 13: Bundle check**

Run: `npm run build`
Expected: `/` First Load JS ≤ Step 1 baseline + 1 kB. If it grew by tens of kB, `three` leaked into the page chunk - check that nothing outside `runIngotStage.ts` / `createIngot.ts` / `app/dev` imports `three`.

- [ ] **Step 14: Visual + behaviour check**

On `aurify-dev`, open `http://localhost:3200/`:
- Console: no errors.
- At 1440×900 (`resize_window` 1440×900): screenshot on load - ingot grows in behind the headline, blurred/dimmed, spinning slowly; headline readable. `read_page` / zoom the headline area to confirm contrast.
- Scroll ~60% of the hero: ingot sharpens as it starts to leave (it has no other dock yet, so it shrinks away once Lifecycle holds the centre line - expected at this stage).
- **Review focus #3:** click the carousel dot for the E-Invoicing Seminar poster slide → screenshot: ingot gone. Click a text slide's dot → ingot returns.
- `resize_window` preset `mobile`, reload → screenshot: smaller ingot behind the headline.
- Reset with preset `desktop`.

- [ ] **Step 15: Commit**

```bash
git add lib/ingot components/three app/page.tsx components/sections/home/Hero.tsx tailwind.config.ts
git commit -m "feat(home): fixed ingot canvas docked behind the hero headline

Replaces the hero dial/orb with the travelling 3D ingot (lazy three chunk).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 16: STOP - user approval gate.** Send desktop + mobile hero screenshots, the poster-slide screenshot and the before/after First Load JS numbers. Wait for approval.

---

### Task 4: Lifecycle dock + roll (Stage 4)

**Files:**
- Modify: `components/sections/home/LifecycleStrip.tsx` (~L37 `steps`, ~L116-120 line tween, ~L175 pinned container)

**Interfaces:**
- Consumes: `ingotState.lifecycle`, `ingotState.lifecycleSteps`; dock name `"lifecycle"` (stage treats its rect as the band the head travels along).

- [ ] **Step 1: Import the state**

```tsx
import { ingotState } from "@/lib/ingot/ingotState";
```

- [ ] **Step 2: Publish the step count**

Directly after `const steps = lifecycle.stages.length - 1;` add:

```ts
        ingotState.lifecycleSteps = steps;
```

- [ ] **Step 3: Publish scrub progress from the line tween**

Replace

```ts
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: range }
        );
```

with

```ts
        const lineTween = gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: range,
            // The travelling ingot rides this line's head (IngotStage).
            onUpdate: () => {
              ingotState.lifecycle = lineTween.progress();
            },
          }
        );
```

- [ ] **Step 4: Add the band dock**

Inside `<div className="relative flex h-svh items-center overflow-hidden">`, directly after the `<h2 …>{lifecycle.eyebrow}</h2>`, add:

```tsx
          {/* Band the travelling ingot rides: it follows the progress
              line's head, which sweeps across the screen as the strip
              scrubs (IngotStage + lifecycleRect). Clear of numerals, copy
              and cards. Hidden with the strip on mobile / reduced motion,
              so the ingot steps out there. */}
          <div
            data-ingot-dock="lifecycle"
            aria-hidden
            className="pointer-events-none absolute inset-x-[12vw] top-[76%] h-[5vmin] -translate-y-1/2"
          />
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint` → no errors.

- [ ] **Step 6: Visual check at 1440×900**

Scroll into the Lifecycle pin; screenshot at stage 1, stage 3 and stage 6 (use `find` "Jump to stage 3" / "Jump to stage 6" and click, then wait ~1.2s for the snap). Expected: a small ingot sits on the gradient line's head, each stage showing a different face (a 90° roll per stage), square to the line when snapped; it never overlaps the numeral, copy or image card. Console clean.

- [ ] **Step 7: Review focus #1 and #2**

- With the strip snapped on stage 3, `resize_window` to 1280×800, wait 1s, screenshot: ingot back on the line head, correctly sized. Restore 1440×900.
- Click "Jump to stage 6" then immediately "Jump to stage 2"; after it settles, screenshot: roll is square on stage 2 (no off-angle resting pose).

- [ ] **Step 8: Commit**

```bash
git add components/sections/home/LifecycleStrip.tsx
git commit -m "feat(home): ingot rides the lifecycle progress line

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 9: STOP - user approval gate.** Send the stage 1/3/6 screenshots (+ resize/jump proofs). Wait for approval.

---

### Task 5: Opportunity dock (Stage 5)

**Files:**
- Modify: `components/sections/home/Opportunity.tsx` (~L62 `SectionHeading`)

**Interfaces:**
- Consumes: dock name `"opportunity"`.

- [ ] **Step 1: Wrap the heading and add the dock**

Replace

```tsx
        <SectionHeading title={opportunity.title} body={opportunity.body} />
```

with

```tsx
        <div className="relative">
          <SectionHeading title={opportunity.title} body={opportunity.body} />
          {/* Dock for the travelling ingot (IngotStage), in the space the
              max-w-3xl heading leaves beside it - only from xl, where that
              space exists; below it the ingot steps out. */}
          <div
            data-ingot-dock="opportunity"
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 hidden h-[min(11vmin,8rem)] w-[min(22vmin,16rem)] xl:block"
          />
        </div>
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint` → no errors.

- [ ] **Step 3: Visual check at 1440×900**

Screenshot (a) mid-travel as Lifecycle releases (ingot banking up-right, growing) and (b) Opportunity heading at viewport centre (ingot top-right beside the heading, three-quarter view, gently floating, not touching heading or stat cards). At 1100px wide (`resize_window` 1100×800): ingot hides in Opportunity. Restore 1440×900. Console clean.

- [ ] **Step 4: Commit**

```bash
git add components/sections/home/Opportunity.tsx
git commit -m "feat(home): dock ingot beside the opportunity heading

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: STOP - user approval gate.** Send the two screenshots. Wait for approval.

---

### Task 6: Problem fracture/dock + exit (Stage 6)

**Files:**
- Modify: `components/sections/home/ProblemInterlude.tsx` (FRAGMENTS ~L8-19, ringRef ~L34, fragment setup ~L46-75, timeline ~L77-109, visual markup ~L144-168, eyebrow ~L122)

**Interfaces:**
- Consumes: `ingotState.split`, `ingotState.glint`; dock name `"problem"` (two docks: desktop right column, mobile above the eyebrow - only the visible one has width).

- [ ] **Step 1: Swap imports and drop the DOM fragment data**

- Add `import { ingotState } from "@/lib/ingot/ingotState";`
- Delete the `FRAGMENTS` constant and its 6-line "Convergence visual" comment above it.
- Delete `const ringRef = useRef<HTMLDivElement>(null);`
- In the file's header doc comment, replace the "The convergence visual (desktop only) rides the same scrub timeline…" paragraph with: "The travelling ingot (IngotStage) rides the same scrub: it fractures as the pin starts, docks one piece per gap line via `ingotState.split`, and the closer line sweeps a glint across the whole bar."

- [ ] **Step 2: Drive the ingot from the timeline**

Delete the `fragments` lookup (`const fragments = gsap.utils.toArray<HTMLElement>("[data-problem-fragment]", …);`), the "Scatter the fragments and hide the ring" block (the `fragments.forEach(… gsap.set …)` and the `if (ringRef.current) gsap.set(…)`).

Replace the `lines.forEach((line, i) => { … });` loop that follows `const tl = gsap.timeline({…});` with:

```ts
        // The ingot arrives whole and fractures as the pin takes hold…
        tl.fromTo(ingotState, { split: 0 }, { split: 1, duration: 0.6, ease: "none" });

        lines.forEach((line, i) => {
          tl.to(line, { autoAlpha: 1, y: 0, duration: 1, ease: "none" });
          if (i < lines.length - 1) {
            // …then each gap line docks one piece (1 → 0.75 → … → 0).
            tl.to(
              ingotState,
              { split: 1 - (i + 1) / (lines.length - 1), duration: 1, ease: "none" },
              "<"
            );
          } else {
            // Closer line: the bar is whole - one glint across the stamp.
            tl.to(ingotState, { glint: 1, duration: 1, ease: "none" }, "<");
          }
          tl.to({}, { duration: 0.6 }); // hold
          if (i < lines.length - 1) {
            tl.to(line, { autoAlpha: 0, y: -32, duration: 1, ease: "none" });
          }
        });
```

- [ ] **Step 3: Replace the convergence markup with docks**

Replace the entire `{/* Convergence visual - … */}` block (the `aria-hidden` `h-64 w-64` div with the ring and the four `data-problem-fragment` divs) with:

```tsx
            {/* Dock for the travelling ingot (IngotStage): it fractures
                and reassembles here in step with the gap lines. */}
            <div
              data-ingot-dock="problem"
              aria-hidden
              className="pointer-events-none hidden h-[min(14vmin,10rem)] w-[min(28vmin,20rem)] shrink-0 md:block"
            />
```

Directly before `<p className="text-eyebrow uppercase text-blue">{problem.eyebrow}</p>` add the mobile dock:

```tsx
              {/* Mobile dock - the ingot returns small and whole above the copy. */}
              <div
                data-ingot-dock="problem"
                aria-hidden
                className="pointer-events-none mb-8 h-12 w-24 md:hidden"
              />
```

Verify: `grep -n "ringRef\|FRAGMENTS\|data-problem-fragment" components/sections/home/ProblemInterlude.tsx` → no matches.

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint` → no errors (no unused `useRef` import warnings - `sectionRef` still uses it).

- [ ] **Step 5: Visual check at 1440×900**

Screenshot: pin start (ingot scattered in the right column), each of the 4 gap lines (one more piece docked each time), the closer line (whole bar, glint mid-sweep), and after scrolling into Ecosystem (ingot gone, nothing left on the canvas). Scroll back up through Problem: pieces scatter again in reverse. Console clean.

- [ ] **Step 6: Review focus #4 - client-side navigation**

From `/`, click the navbar link to About, then the logo back to `/`; repeat 3 times. Then run in the page:

```js
document.querySelectorAll("canvas").length
```

Expected: `1`. `read_console_messages` → no "Too many active WebGL contexts" warning, no errors. Ingot docks in the hero again.

- [ ] **Step 7: Commit**

```bash
git add components/sections/home/ProblemInterlude.tsx
git commit -m "feat(home): ingot fractures and reassembles through the problem pin

Replaces the CSS convergence fragments; ingot exits into Ecosystem.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 8: STOP - user approval gate.** Send the pin-sequence screenshots and the canvas-count result. Wait for approval.

---

### Task 7: Mobile, reduced motion, perf, cleanup (Stage 7)

**Files:**
- Delete: `app/dev/ingot/` (page + sandbox)
- Modify (only if a check below fails): `components/three/runIngotStage.ts`

- [ ] **Step 1: Mobile lite**

`resize_window` preset `mobile`, reload `/`. Screenshots: hero (ingot behind headline), Lifecycle vertical rail (ingot gone), Opportunity (gone), Problem (small whole ingot above the eyebrow, no split), Ecosystem (gone). Console clean.

- [ ] **Step 2: Reduced motion**

Back to preset `desktop`. The preview tools can't emulate `prefers-reduced-motion`, so force only the stage's flag: in `runIngotStage.ts` change `const reduced = window.matchMedia(MOTION_REDUCED).matches;` to `const reduced = true;`, reload, and scroll the four sections. Expected for the stage: no spin/float/bank, the ingot snaps to each new dock and fades in there (no travel), the hero still softened. (The page's own CSS/GSAP still see "motion OK", so the pins and the Problem split still run in this test; with a real OS reduced-motion setting the Lifecycle strip becomes its rail - ingot hidden there - and Problem has no timeline, so the bar stays whole. Both follow from existing code paths: the strip's `motion-safe:md:block` hides the dock, and `ingotState.split` is only written inside `mm.add(MOTION_OK)`.) Screenshot hero + opportunity + problem. **Revert the line** and confirm with `git diff components/three/runIngotStage.ts` → empty.

- [ ] **Step 3: Frame-time sample at 1440×900**

Reload `/`, wait 3s for the stage to start, then run in the page:

```js
await new Promise(async (done) => {
  const times = [];
  let last = performance.now();
  let run = true;
  const frame = (now) => { times.push(now - last); last = now; if (run) requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
  const end = document.querySelector("[data-ingot-dock='problem']").closest("section").getBoundingClientRect().bottom + window.scrollY;
  for (let y = 0; y < end; y += 40) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)); }
  run = false;
  times.sort((a, b) => a - b);
  done({ frames: times.length, p50: times[times.length >> 1].toFixed(1), p95: times[Math.floor(times.length * 0.95)].toFixed(1) });
});
```

Expected: p95 ≤ 20 ms on desktop. Repeat at preset `mobile` and report the numbers. If p95 is badly over, the first lever is `segments: desktop ? 4 : 1` and DPR `1.25` on mobile; the spec's fallback lever is mobile Hero-only.

- [ ] **Step 4: Review focus #5 - WebGL unavailable**

Temporarily make the renderer throw: in `runIngotStage.ts` add `throw new Error("no webgl");` as the first line inside the `try` block, reload `/`, scroll to Ecosystem. Expected: no ingot, no console errors, every section readable; on desktop the Problem right column is blank space (the empty dock box keeps its size). **Revert the line** and confirm `git diff components/three/runIngotStage.ts` is empty.

- [ ] **Step 5: Delete the dev workbench**

```bash
git rm -r app/dev/ingot
```

Run: `npx tsc --noEmit && npm run lint && node lib/ingot/math.check.mjs && npm run build`
Expected: no errors; `math.check: ok`; build route table has no `/dev/ingot`; `/` First Load JS still within Task 3's budget.

- [ ] **Step 6: Commit**

```bash
git add -A app/dev
git commit -m "chore(ingot): remove dev workbench after mobile/reduced-motion/perf pass

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: STOP - user approval gate.** Send the mobile + reduced-motion screenshots and the frame-time numbers. The feature is done when the user approves.
