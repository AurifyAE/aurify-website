# Scroll Guide Laptop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One 3D laptop on a fixed canvas travels with the home page scroll from the Hero to the Problem section, posing beside each section's copy and changing its screen per section.

**Architecture:** A client-only R3F `<Canvas>` (`frameloop="demand"`) sits fixed in front of the page with `pointer-events: none`. GSAP ScrollTriggers scrub one plain mutable `pose` object between stations; the R3F render loop reads `pose` each frame, so scroll never touches React state. Lifecycle and Problem stations measure their DOM slot so the laptop lands exactly where the card / cluster sits at any viewport width.

**Tech Stack:** Next 15 (App Router), React 19, three, @react-three/fiber 9, @react-three/drei 10, GSAP + ScrollTrigger (existing, via `@/lib/gsap`), Lenis (existing), Node's built-in test runner with native TS.

**Spec:** `docs/superpowers/specs/2026-10-13-scroll-guide-laptop-design.md`

## Global Constraints

- Import gsap/ScrollTrigger/useGSAP only from `@/lib/gsap`, never from the packages.
- Scroll position never enters React state; GSAP writes `pose`, `useFrame` reads it.
- `html.guide-on` is set **only after the model, screen textures and logo have loaded**, and only under `(prefers-reduced-motion: no-preference)`. It is removed on unmount.
- Without `guide-on` (no WebGL, load error, reduced motion) the page must look exactly as it does today.
- Canvas layer: `fixed inset-0 z-30 pointer-events-none`, `aria-hidden`. z-30 sits below the floating contact menu (40), navbar (50), mobile menu (60) and modals (70/80).
- The laptop is **modelled in code** (`components/guide/model.ts`), no GLB. Model contract: metres (~0.312 × 0.221 m), Y-up, front faces +Z, origin at base centre, nodes `Base` / `Lid` (pivot on hinge, closed at rotation 0) / `Screen` (mesh, material `ScreenMat`, UVs 0–1, 16:10, v = 0 at the image top), ≤ 50k triangles. Finish: space-grey aluminium.
- Model parts are built and approved one at a time (Tasks 5–9), each at its own `/lab/guide` gate.
- Modules imported by `node --test` (`screen.ts`, `slot.ts`, `nodes.ts`, `geometry.ts`, `model.ts`) import each other **with the `.ts` extension** and never use the `@/` alias — Node resolves neither otherwise.
- No network requests to third-party hosts from the guide (no drei HDR presets).
- Mobile (< 768px): Hero station only, fading out as the hero leaves.
- Reduced motion: static open laptop at the Hero station, no scroll triggers.
- Every gate (Tasks 5–14) ends with the user's confirmation before the next task starts.

## Review Focus

1. **Clicks through the canvas** – R3F sets `pointer-events: auto` on its own wrapper; hero CTAs, lifecycle numerals and the navbar must stay clickable. Pinned in Task 10 (`elementFromPoint` check).
2. **Leaving the home page** – client navigation to another page must remove `html.guide-on` and kill the guide's triggers, or other pages inherit hidden elements; repeated home ↔ about visits must not leak GPU memory. Pinned in Task 10 (navigate to `/about`, assert class and canvas gone).
3. **Reload or resize mid-journey** – poses must stay correct when the page loads scrolled into Problem or the window is resized there (fromTo + `invalidateOnRefresh`, never `to`). Pinned in Task 13.
4. **Asset load failure** – a screen image or the logo failing to load must leave today's page intact (cards and cluster visible, no class). Pinned in Task 14 (point one screen URL at a missing file).
5. **Stage snap and quick-nav** – Lenis' stage snap and the numeral buttons must land the laptop on that stage's exact pose and screen. Pinned in Task 11 (click numeral 4, read pose).

---

## File Structure

| File | Responsibility |
|---|---|
| `components/guide/screen.ts` | Pure: fractional screen index → two texture indices + mix |
| `components/guide/slot.ts` | Pure: DOM box → pose `{x, y, scale}` units |
| `components/guide/nodes.ts` | Find and validate `Lid` / `Screen` in a model |
| `components/guide/geometry.ts` | Pure: `roundedSlab` – the rounded, bevelled box every part is made of |
| `components/guide/model.ts` | The code-built laptop: `buildLaptop()`, one function per part |
| `components/guide/logo.ts` | Browser-only: Aurify SVG wordmark → mesh on the lid |
| `components/guide/stations.ts` | `Pose` type, station data, tuning constants |
| `components/guide/screens.ts` | Screen image URLs (index = `Pose.screen`) |
| `components/guide/Laptop.tsx` | R3F: loads model + textures, applies `pose` each frame; `Studio` lighting |
| `components/guide/LabViewer.tsx` + `app/lab/guide/page.tsx` | Gate 1 test page (removed in Task 14) |
| `components/guide/GuideCanvas.tsx` | Fixed canvas layer, error boundary, load-in, media-query branches |
| `components/guide/GuideMount.tsx` | Client wrapper so the server page can lazy-load the canvas with `ssr: false` |
| `components/guide/journey.ts` | Scroll segments that scrub `pose` between stations |
| `*.test.ts` beside the pure modules | `node --test` unit tests |

---

### Task 1: Dependencies, test runner, pure helpers

**Files:**
- Modify: `package.json` (deps + `test` script), `tsconfig.json`
- Create: `components/guide/screen.ts`, `components/guide/slot.ts`
- Test: `components/guide/screen.test.ts`, `components/guide/slot.test.ts`

**Interfaces:**
- Produces: `screenBlend(screen: number, count: number): { a: number; b: number; mix: number }`
- Produces: `type Box = { left: number; top: number; width: number; height: number }`, `slotFromBox(box: Box, vw: number, vh: number, widthFactor?: number): { x: number; y: number; scale: number }`

- [ ] **Step 1: Install dependencies**

```bash
npm install three @react-three/fiber@^9 @react-three/drei@^10
```
```bash
npm install -D @types/three
```
Expected: both succeed, `package.json` lists the four packages.

- [ ] **Step 2: Add the test script and TS-extension imports**

In `package.json` `scripts`, add after `"lint": "eslint"`:
```json
    "lint": "eslint",
    "test": "node --test \"components/**/*.test.ts\""
```
In `tsconfig.json` `compilerOptions`, add after `"noEmit": true,`:
```json
    "allowImportingTsExtensions": true,
```
(Node runs the tests' TypeScript natively and needs the `.ts` extension in imports; `noEmit` makes this legal for `tsc`.)

- [ ] **Step 3: Write the failing tests**

`components/guide/screen.test.ts`:
```ts
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
```

`components/guide/slot.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { slotFromBox } from "./slot.ts";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);

test("box centre maps to viewport fractions from the middle, y up", () => {
  const s = slotFromBox({ left: 1000, top: 300, width: 400, height: 250 }, 1600, 900);
  close(s.x, 0.25);
  close(s.y, 0.5 - 425 / 900);
  close(s.scale, 0.25);
});

test("a centred box is the origin", () => {
  const s = slotFromBox({ left: 700, top: 400, width: 200, height: 100 }, 1600, 900);
  close(s.x, 0);
  close(s.y, 0);
});

test("widthFactor scales the laptop relative to the box", () => {
  const s = slotFromBox({ left: 0, top: 0, width: 256, height: 256 }, 1280, 800, 1.5);
  close(s.scale, (256 * 1.5) / 1280);
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../screen.ts'` and `.../slot.ts`.

- [ ] **Step 5: Implement**

`components/guide/screen.ts`:
```ts
/**
 * Splits a fractional screen index into the two textures to show and how far
 * to blend between them, so scrubbing `screen` from 2 to 3 crossfades screen
 * 2 into screen 3. Clamped to the available screens.
 */
export function screenBlend(screen: number, count: number) {
  const s = Math.min(Math.max(screen, 0), count - 1);
  const a = Math.floor(s);
  const b = Math.min(a + 1, count - 1);
  return { a, b, mix: s - a };
}
```

`components/guide/slot.ts`:
```ts
/** A box in viewport pixels (DOMRect-like). */
export type Box = { left: number; top: number; width: number; height: number };

/**
 * Converts a DOM box into the laptop's pose units: x/y are the box centre as
 * a fraction of the viewport from its middle (y up), scale is the laptop
 * width as a fraction of viewport width (`widthFactor` × box width).
 */
export function slotFromBox(box: Box, vw: number, vh: number, widthFactor = 1) {
  return {
    x: (box.left + box.width / 2) / vw - 0.5,
    y: 0.5 - (box.top + box.height / 2) / vh,
    scale: (box.width * widthFactor) / vw,
  };
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 7 tests.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json components/guide/screen.ts components/guide/slot.ts components/guide/screen.test.ts components/guide/slot.test.ts
git commit -m "feat(guide): add three/R3F deps, node test runner and pose helpers"
```

---

### Task 2: Geometry helper, node contract and model skeleton

**Files:**
- Create: `components/guide/geometry.ts`, `components/guide/nodes.ts`, `components/guide/model.ts`
- Test: `components/guide/geometry.test.ts`, `components/guide/nodes.test.ts`, `components/guide/model.test.ts`

**Interfaces:**
- Produces: `roundedSlab(w: number, h: number, d: number, r: number, bevel: number, segments?: number): ExtrudeGeometry` — outer size exactly w × h × d (x × y × z), sitting on y = 0, centred in x / z
- Produces: `type LaptopNodes = { lid: Object3D; screen: Mesh }`, `getLaptopNodes(root: Object3D): LaptopNodes` (throws `Error` naming each missing node)
- Produces: `DIM: { w; d; baseH; lidH; gap; radius }` (metres), `SCREEN_SIZE: { w; h; topBezel }`, `buildLaptop(): Group` honouring the model contract. Tasks 5–9 replace one part function each; the skeleton parts are plain boxes.

- [ ] **Step 1: Write the failing tests**

`components/guide/geometry.test.ts`:
```ts
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
```

`components/guide/nodes.test.ts`:
```ts
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
```

`components/guide/model.test.ts`:
```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot find `./geometry.ts`, `./nodes.ts`, `./model.ts`.

- [ ] **Step 3: Implement `components/guide/geometry.ts`**

```ts
import { ExtrudeGeometry, Shape } from "three";

/**
 * A w × h × d (x × y × z) slab with rounded plan-view corners (radius r) and
 * bevelled edges, sitting on y = 0 and centred in x / z. Every laptop part
 * is one of these.
 */
export function roundedSlab(w: number, h: number, d: number, r: number, bevel: number, segments = 3) {
  // The bevel grows the shape outward, so draw it inset by the bevel
  const iw = w / 2 - bevel;
  const id = d / 2 - bevel;
  const ir = Math.max(r - bevel, 0.0001);
  const s = new Shape();
  s.moveTo(-iw + ir, -id);
  s.lineTo(iw - ir, -id);
  s.quadraticCurveTo(iw, -id, iw, -id + ir);
  s.lineTo(iw, id - ir);
  s.quadraticCurveTo(iw, id, iw - ir, id);
  s.lineTo(-iw + ir, id);
  s.quadraticCurveTo(-iw, id, -iw, id - ir);
  s.lineTo(-iw, -id + ir);
  s.quadraticCurveTo(-iw, -id, -iw + ir, -id);
  const g = new ExtrudeGeometry(s, {
    depth: Math.max(h - 2 * bevel, 0.00001),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments,
    curveSegments: 8,
  });
  g.rotateX(-Math.PI / 2); // extrude along +Y instead of +Z
  g.translate(0, bevel, 0);
  return g;
}
```

- [ ] **Step 4: Implement `components/guide/nodes.ts`**

```ts
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
```

- [ ] **Step 5: Implement the skeleton `components/guide/model.ts`**

```ts
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 15 tests.

- [ ] **Step 7: Commit**

```bash
git add components/guide/geometry.ts components/guide/nodes.ts components/guide/model.ts components/guide/geometry.test.ts components/guide/nodes.test.ts components/guide/model.test.ts
git commit -m "feat(guide): add rounded-slab geometry, node contract and laptop skeleton"
```

---

### Task 3: Stations, screens and the Laptop rig

**Files:**
- Create: `components/guide/stations.ts`, `components/guide/screens.ts`, `components/guide/Laptop.tsx`

**Interfaces:**
- Consumes: `screenBlend` (Task 1), `getLaptopNodes`, `buildLaptop` (Task 2)
- Produces (`stations.ts`): `type Pose = { x; y; rotX; rotY; scale; lid; screen }` (all `number`), `type LivePose = Pose & { rise: number }`, `STATIONS: { hero; lifecycle; opportunity; problem; exit }` (each `Pose`), `STAGE_YAW: number`, `LID_OPEN: number`, `PROBLEM_SLOT_WIDTH: number`
- Produces (`screens.ts`): `SCREENS: string[]`, `SCREEN: { overview: 0; firstStage: 1; fragmented: number; unified: number }`
- Produces (`Laptop.tsx`): `default Laptop(props: { pose: LivePose; onReady?: () => void })` (suspends while loading; must sit inside `<Suspense>` inside a `<Canvas>`), `Studio()` (lights + procedural environment)

No unit test: rendering code whose logic lives in the tested helpers. Verified visually from Task 4 on.

- [ ] **Step 1: Create `components/guide/screens.ts`**

```ts
import { lifecycle } from "@/lib/content/home";

// Next's image optimiser serves a ~1080px webp instead of the 2 MB originals.
const optimised = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;

const stages = lifecycle.stages.map((s) => s.image);

/** Named indexes into SCREENS (= Pose.screen values). */
export const SCREEN = {
  overview: 0,
  firstStage: 1,
  fragmented: stages.length + 1,
  unified: stages.length + 2,
} as const;

// shortcut: overview / fragmented / unified reuse home photos until real
// 1600×1000 product screenshots land in public/images/guide/.
export const SCREENS = [
  "/images/home/Bullion_trading_desk_with_monitors.jpeg",
  ...stages,
  "/images/home/Abstract_finance_scene_with_tablet.jpeg",
  "/images/home/Abstract_corporate_finance_scene.jpeg",
].map(optimised);
```

- [ ] **Step 2: Create `components/guide/stations.ts`**

```ts
import { SCREEN } from "./screens";

/** One stop on the laptop's journey (spec: Choreography). */
export type Pose = {
  /** Centre, fraction of viewport width from the middle (+ right). */
  x: number;
  /** Centre, fraction of viewport height from the middle (+ up). */
  y: number;
  /** Radians; positive tips the top toward the viewer. */
  rotX: number;
  /** Radians; negative turns the front left, toward left-aligned copy. */
  rotY: number;
  /** Laptop width as a fraction of viewport width. */
  scale: number;
  /** 0 closed … 1 fully open. */
  lid: number;
  /** Index into SCREENS; fractions crossfade. */
  screen: number;
};

/** The object GSAP writes and the render loop reads; `rise` is the load-in offset. */
export type LivePose = Pose & { rise: number };

// Starting values - tuned with the user at each gate. Lifecycle and Problem
// x / y / scale are replaced at runtime by their measured DOM slots; the
// values here are only the fallback if the slot element is missing.
export const STATIONS = {
  hero: { x: 0, y: -0.26, rotX: 0.26, rotY: 0, scale: 0.3, lid: 0, screen: SCREEN.overview },
  lifecycle: { x: 0.24, y: 0, rotX: 0.15, rotY: -0.45, scale: 0.28, lid: 1, screen: SCREEN.firstStage },
  opportunity: { x: 0.3, y: 0.18, rotX: 0.1, rotY: -1.2, scale: 0.17, lid: 1, screen: SCREEN.overview },
  problem: { x: 0.3, y: 0, rotX: 0.12, rotY: -0.5, scale: 0.24, lid: 1, screen: SCREEN.fragmented },
  exit: { x: 0.3, y: 0.1, rotX: 0.12, rotY: -0.8, scale: 0.12, lid: 0.5, screen: SCREEN.unified },
} satisfies Record<string, Pose>;

/** Extra yaw per lifecycle stage (~4°): a slow walk around the laptop. */
export const STAGE_YAW = 0.07;

/** Fully open lid in radians (~105°); negative lifts the lid's front edge. */
export const LID_OPEN = -1.83;

/** Laptop width relative to the Problem section's 256px convergence cluster. */
export const PROBLEM_SLOT_WIDTH = 1.4;
```

- [ ] **Step 3: Create `components/guide/Laptop.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import { Box3, ShaderMaterial, SRGBColorSpace, Vector3, type Group, type Material, type Mesh, type Object3D } from "three";
import { buildLaptop } from "./model";
import { getLaptopNodes } from "./nodes";
import { screenBlend } from "./screen";
import { SCREENS } from "./screens";
import { LID_OPEN, type LivePose } from "./stations";

type RigProps = { pose: LivePose; onReady?: () => void };

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Crossfades two screen textures; unlit so the display reads as emissive.
const fragmentShader = /* glsl */ `
  uniform sampler2D mapA;
  uniform sampler2D mapB;
  uniform float mixAmt;
  varying vec2 vUv;
  void main() {
    gl_FragColor = mix(texture2D(mapA, vUv), texture2D(mapB, vUv), mixAmt);
    #include <colorspace_fragment>
  }
`;

function Rig({ root, pose, onReady }: RigProps & { root: Object3D }) {
  const groupRef = useRef<Group>(null);
  const viewport = useThree((s) => s.viewport);
  const textures = useTexture(SCREENS);
  const { lid, screen } = useMemo(() => getLaptopNodes(root), [root]);

  // Normalise to 1 world unit wide so Pose.scale maps straight to viewport
  // width. Measured detached and closed: a remount may find the model still
  // parented or with the lid open.
  const unit = useMemo(() => {
    root.removeFromParent();
    lid.rotation.x = 0;
    root.updateMatrixWorld(true);
    return 1 / new Box3().setFromObject(root).getSize(new Vector3()).x;
  }, [root, lid]);

  const material = useMemo(() => {
    for (const t of textures) {
      t.colorSpace = SRGBColorSpace;
      t.flipY = false; // the Screen UVs put v = 0 at the image top (model.ts)
      t.needsUpdate = true;
    }
    return new ShaderMaterial({
      uniforms: {
        mapA: { value: textures[0] },
        mapB: { value: textures[0] },
        mixAmt: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      toneMapped: false,
    });
  }, [textures]);

  useEffect(() => {
    screen.material = material;
    return () => material.dispose();
  }, [screen, material]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.position.set(pose.x * viewport.width, (pose.y - pose.rise) * viewport.height, 0);
    g.rotation.set(pose.rotX, pose.rotY, 0);
    g.scale.setScalar(pose.scale * viewport.width);
    lid.rotation.x = pose.lid * LID_OPEN;
    const { a, b, mix } = screenBlend(pose.screen, textures.length);
    material.uniforms.mapA.value = textures[a];
    material.uniforms.mapB.value = textures[b];
    material.uniforms.mixAmt.value = mix;
  });

  return (
    <group ref={groupRef}>
      <group scale={unit}>
        <primitive object={root} />
      </group>
    </group>
  );
}

/** Frees the model's GPU buffers; three re-uploads them if the model is shown again. */
function disposeTree(root: Object3D) {
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m: Material) => m.dispose());
  });
}

/** The guide laptop. Suspends while the screens load. */
export default function Laptop(props: RigProps) {
  const root = useMemo(buildLaptop, []);
  useEffect(() => () => disposeTree(root), [root]);
  return <Rig root={root} {...props} />;
}

/** Key light plus a procedural studio environment - no HDR download. */
export function Studio() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 3, 4]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#7fd4ff" position={[4, 2, -2]} scale={2} />
      </Environment>
    </>
  );
}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run lint`
Expected: no new errors in `components/guide/`.

- [ ] **Step 5: Commit**

```bash
git add components/guide/stations.ts components/guide/screens.ts components/guide/Laptop.tsx
git commit -m "feat(guide): add stations, screen list and R3F laptop rig"
```

---

### Task 4: The `/lab/guide` viewer

**Files:**
- Create: `components/guide/LabViewer.tsx`, `app/lab/guide/page.tsx`

**Interfaces:**
- Consumes: `Laptop`, `Studio`, `SCREENS`, `LivePose` (Task 3)

- [ ] **Step 1: Create `components/guide/LabViewer.tsx`**

```tsx
"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Laptop, { Studio } from "./Laptop";
import { SCREENS } from "./screens";
import type { LivePose } from "./stations";

/** Gate 1 viewer: the laptop alone, orbitable, with lid and screen sliders. */
export default function LabViewer() {
  const pose = useRef<LivePose>({
    x: 0, y: -0.1, rotX: 0.3, rotY: -0.5, scale: 0.45, lid: 1, screen: 0, rise: 0,
  }).current;
  const [lid, setLid] = useState(pose.lid);
  const [screen, setScreen] = useState(pose.screen);

  return (
    <main className="min-h-svh bg-paper pt-28">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <h1 className="text-title text-navy">Guide laptop – lab</h1>
        <div className="mt-6 flex flex-wrap gap-8 text-sm text-ink/70">
          <label className="flex items-center gap-3">
            Lid
            <input
              type="range" min={0} max={1} step={0.01} value={lid}
              onChange={(e) => { pose.lid = +e.target.value; setLid(pose.lid); }}
            />
          </label>
          <label className="flex items-center gap-3">
            Screen
            <input
              type="range" min={0} max={SCREENS.length - 1} step={0.01} value={screen}
              onChange={(e) => { pose.screen = +e.target.value; setScreen(pose.screen); }}
            />
            {screen.toFixed(2)}
          </label>
        </div>
      </div>
      {/* data-lenis-prevent: wheel zooms the model instead of scrolling the page */}
      <div data-lenis-prevent className="mt-6 h-[70svh]">
        <Canvas camera={{ fov: 30, position: [0, 0, 10] }} dpr={[1, 1.5]}>
          <Studio />
          <Suspense fallback={null}>
            <Laptop pose={pose} />
          </Suspense>
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create `app/lab/guide/page.tsx`**

```tsx
import type { Metadata } from "next";
import LabViewer from "@/components/guide/LabViewer";

// Internal review page for the guide laptop; removed in Task 14.
export const metadata: Metadata = {
  title: "Guide lab",
  robots: { index: false, follow: false },
};

export default function GuideLabPage() {
  return <LabViewer />;
}
```

- [ ] **Step 3: Verify in the browser**

Start the `aurify-dev` preview and open `/lab/guide`.
- `read_console_messages` (onlyErrors): none.
- The skeleton shows: a box base and a box lid. Lid slider 0 → 1 swings the lid from flat to ~105° about the back edge, display facing the viewer when open (if it opens downward, flip the sign of `LID_OPEN` in `stations.ts`).
- Screen slider crossfades the images; they appear upright and un-mirrored.

- [ ] **Step 4: Commit**

```bash
git add components/guide/LabViewer.tsx app/lab/guide/page.tsx
git commit -m "feat(guide): add /lab/guide model viewer"
```

---

### Task 5: Gate 1.1 — Part 1, Body

**Files:**
- Modify: `components/guide/model.ts` (imports, `buildBase`)
- Test: `components/guide/model.test.ts`

**Interfaces:**
- Consumes: `roundedSlab` (Task 2)

- [ ] **Step 1: Write the failing test**

Append to `components/guide/model.test.ts`:
```ts
test("body: rubber feet sit under the base", () => {
  const base = buildLaptop().getObjectByName("Base")!;
  close(new Box3().setFromObject(base).min.y, -0.0008);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `body: rubber feet sit under the base` (`0 ≠ -0.0008`).

- [ ] **Step 3: Implement**

In `model.ts`, add to the `three` import: `CylinderGeometry`; add below it:
```ts
import { roundedSlab } from "./geometry.ts";
```
Replace `buildBase`:
```ts
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
  return base;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 16 tests.

- [ ] **Step 5: Verify in the browser**

`/lab/guide`: console clean. Screenshot the base at three angles: front ¾, side (shows the bevel and thickness), underneath (orbit below: four feet).

- [ ] **Step 6: Commit**

```bash
git add components/guide/model.ts components/guide/model.test.ts
git commit -m "feat(guide): model part 1 - rounded aluminium body and feet"
```

- [ ] **Step 7: STOP — Gate 1.1**

Show the user the three screenshots. Ask them to confirm proportions, edge rounding and the space-grey metal. Tune only `DIM` / `materials().aluminium` on request. Wait for confirmation before Task 6.

---

### Task 6: Gate 1.2 — Part 2, Lid and hinge

**Files:**
- Modify: `components/guide/model.ts` (`buildLaptop`, `buildLid`, new `buildHinge`)
- Test: `components/guide/model.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `components/guide/model.test.ts`:
```ts
test("hinge barrel runs along the back edge", () => {
  const hinge = buildLaptop().getObjectByName("Hinge");
  assert.ok(hinge, "Hinge missing");
  close(hinge.position.z, -DIM.d / 2 + 0.0035);
});

test("lid opens about the hinge: upright lid stands one depth tall", () => {
  const root = buildLaptop();
  const lid = root.getObjectByName("Lid")!;
  lid.rotation.x = -Math.PI / 2;
  root.updateMatrixWorld(true);
  close(new Box3().setFromObject(lid).max.y, DIM.baseH + DIM.gap + DIM.d, 1e-3);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`
Expected: FAIL — `Hinge missing`.

- [ ] **Step 3: Implement**

In `buildLaptop`, change the add line to:
```ts
  root.add(buildBase(m), buildHinge(m), buildLid(m));
```
Replace `buildLid`:
```ts
/** Part 2 · Lid: rounded shell pivoting on the hinge axis; rotation 0 = closed. */
function buildLid(m: Mats): Group {
  const lid = new Group();
  lid.name = "Lid";
  lid.position.set(0, DIM.baseH + DIM.gap, -DIM.d / 2);
  const shell = new Mesh(roundedSlab(DIM.w, DIM.lidH, DIM.d, DIM.radius, 0.0012), m.aluminium);
  shell.position.z = DIM.d / 2;
  lid.add(shell, buildScreen());
  return lid;
}

/** Part 2 · Hinge: dark barrel across the back edge, hidden inside the closed lid. */
function buildHinge(m: Mats): Mesh {
  const hinge = new Mesh(new CylinderGeometry(0.0035, 0.0035, DIM.w * 0.78, 32), m.dark);
  hinge.name = "Hinge";
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, DIM.baseH + DIM.gap / 2, -DIM.d / 2 + 0.0035);
  return hinge;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 18 tests.

- [ ] **Step 5: Verify in the browser**

`/lab/guide`: console clean. Drag the Lid slider through 0 → 1: no part of the lid passes through the base; the hinge barrel is visible behind the open lid and hidden when closed. Screenshots: closed, half open, fully open (side view), back view.

- [ ] **Step 6: Commit**

```bash
git add components/guide/model.ts components/guide/model.test.ts
git commit -m "feat(guide): model part 2 - rounded lid and hinge"
```

- [ ] **Step 7: STOP — Gate 1.2**

Show the four screenshots. Ask the user to confirm lid thickness and the open/close motion. Wait for confirmation before Task 7.

---

### Task 7: Gate 1.3 — Part 3, Display

**Files:**
- Modify: `components/guide/model.ts` (`buildLid`, new `buildDisplay`)
- Test: `components/guide/model.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `components/guide/model.test.ts`:
```ts
test("display: bezel glass and camera, screen in front of the glass", () => {
  const root = buildLaptop();
  const bezel = root.getObjectByName("Bezel");
  assert.ok(bezel, "Bezel missing");
  assert.ok(root.getObjectByName("Camera"), "Camera missing");
  const { screen } = getLaptopNodes(root);
  // The display side faces -Y while closed: lower y = nearer the viewer when open
  assert.ok(screen.position.y < bezel.position.y);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `Bezel missing`.

- [ ] **Step 3: Implement**

Add `CircleGeometry` to the `three` import. In `buildLid`, change `lid.add(shell, buildScreen());` to:
```ts
  lid.add(shell, buildDisplay(m));
```
Add below `buildLid`:
```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 19 tests.

- [ ] **Step 5: Verify in the browser**

`/lab/guide`, lid open: black glass bezel framing the screen, thin top bezel with the camera dot, deeper chin at the hinge; screen images still crossfade with the slider. Screenshots: straight-on, ¾, close-up of the top bezel.

- [ ] **Step 6: Commit**

```bash
git add components/guide/model.ts components/guide/model.test.ts
git commit -m "feat(guide): model part 3 - glass bezel, camera and screen"
```

- [ ] **Step 7: STOP — Gate 1.3**

Show the three screenshots. Ask the user to confirm bezel width and how the screen reads. Tune `SCREEN_SIZE.topBezel` / `materials().glass` on request. Wait for confirmation before Task 8.

---

### Task 8: Gate 1.4 — Part 4, Keyboard deck

**Files:**
- Modify: `components/guide/model.ts` (imports, `buildBase`, new `KEY_COUNT`, `buildDeck`)
- Test: `components/guide/model.test.ts`

**Interfaces:**
- Produces: `KEY_COUNT: number` (77)

- [ ] **Step 1: Write the failing tests**

Change the model import in `model.test.ts` to:
```ts
import { buildLaptop, DIM, KEY_COUNT } from "./model.ts";
```
Add `type InstancedMesh` to the `three` import there, and append:
```ts
test("keyboard: 77 keys, all instanced, plus a trackpad", () => {
  const root = buildLaptop();
  let keys = 0;
  root.traverse((o) => {
    if ((o as InstancedMesh).isInstancedMesh) keys += (o as InstancedMesh).count;
  });
  assert.equal(KEY_COUNT, 77);
  assert.equal(keys, KEY_COUNT);
  assert.ok(root.getObjectByName("Trackpad"), "Trackpad missing");
});

test("keys stay below the closed lid's screen", () => {
  const root = buildLaptop();
  root.updateMatrixWorld(true);
  const deck = root.getObjectByName("Deck")!;
  const screenY = DIM.baseH + DIM.gap - 0.0004;
  assert.ok(new Box3().setFromObject(deck).max.y < screenY);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`
Expected: FAIL — `KEY_COUNT` is not exported (SyntaxError on import).

- [ ] **Step 3: Implement**

Add `InstancedMesh` and `Matrix4` to the `three` import in `model.ts`. Add above `buildBase`:
```ts
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
```
In `buildBase`, add the deck before `return base;`:
```ts
  base.add(buildDeck(m));
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 21 tests — including the 50k triangle budget.

- [ ] **Step 5: Verify in the browser**

`/lab/guide`, lid open, orbit to look down at the deck: six key rows (half-height function row at the back, wide space bar at the front), trackpad centred in front, grilles either side. Close the lid fully: no key pokes through. Screenshots: top-down deck, ¾ open view.

- [ ] **Step 6: Commit**

```bash
git add components/guide/model.ts components/guide/model.test.ts
git commit -m "feat(guide): model part 4 - keyboard deck, trackpad and grilles"
```

- [ ] **Step 7: STOP — Gate 1.4**

Show the two screenshots. Ask the user to confirm the deck's level of detail. Wait for confirmation before Task 9.

---

### Task 9: Gate 1.5 — Part 5, Branding and finish

**Files:**
- Create: `components/guide/logo.ts`
- Modify: `components/guide/Laptop.tsx` (`Rig`), optionally `components/guide/model.ts` (`materials`)

**Interfaces:**
- Consumes: `DIM` (Task 2)
- Produces: `LOGO_URL: string`, `buildLogo(svg: SVGResult): Mesh` (named `Logo`)

No unit test: `SVGLoader` needs the browser's `DOMParser`, which Node lacks. Verified visually.

- [ ] **Step 1: Create `components/guide/logo.ts`**

```ts
import { Matrix4, Mesh, MeshPhysicalMaterial, ShapeGeometry } from "three";
import { SVGLoader, type SVGResult } from "three/addons/loaders/SVGLoader.js";
import { DIM } from "./model";

export const LOGO_URL = "/logo/aurify-logo.svg";
const LOGO_WIDTH = 0.11; // metres across the lid

/** The Aurify wordmark as a polished inlay on the lid's outer face. */
export function buildLogo(svg: SVGResult): Mesh {
  const shapes = svg.paths
    // the file's mask / clip rectangles are paths too - keep only the artwork
    .filter((p) => !(p.userData?.node as Element | undefined)?.closest("mask, clipPath, defs"))
    .flatMap((p) => SVGLoader.createShapes(p));
  const geo = new ShapeGeometry(shapes);
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox!;
  const s = LOGO_WIDTH / (max.x - min.x);
  const cx = (min.x + max.x) / 2;
  const cy = (min.y + max.y) / 2;

  // SVG (x right, y down) → lid outer face (lid-local +Y), centred. Seen from
  // behind the open laptop, lid +X is the viewer's left and lid +Z is up.
  geo.applyMatrix4(
    new Matrix4().set(
      -s, 0, 0, s * cx,
      0, 0, 0, DIM.lidH + 0.00005,
      0, -s, 0, s * cy + DIM.d / 2,
      0, 0, 0, 1
    )
  );
  // That mapping mirrors the triangles; restore their winding, then rebuild normals
  const idx = geo.index!;
  for (let i = 0; i < idx.count; i += 3) {
    const b = idx.getX(i + 1);
    idx.setX(i + 1, idx.getX(i + 2));
    idx.setX(i + 2, b);
  }
  geo.computeVertexNormals();

  const logo = new Mesh(geo, new MeshPhysicalMaterial({ color: 0x9a9da3, metalness: 1, roughness: 0.12 }));
  logo.name = "Logo";
  return logo;
}
```

- [ ] **Step 2: Mount it in `Rig` (`Laptop.tsx`)**

Change the fiber import to `import { useFrame, useLoader, useThree } from "@react-three/fiber";` and add:
```tsx
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { buildLogo, LOGO_URL } from "./logo";
```
Inside `Rig`, after `const { lid, screen } = ...`:
```tsx
  const svg = useLoader(SVGLoader, LOGO_URL);
  useEffect(() => {
    const logo = buildLogo(svg);
    lid.add(logo);
    return () => {
      lid.remove(logo);
      logo.geometry.dispose();
      (logo.material as Material).dispose();
    };
  }, [lid, svg]);
```
(`unit` is measured during render, before this effect adds the logo, and the logo lies inside the lid's footprint anyway.)

- [ ] **Step 3: Type-check, lint, test**

Run: `npx tsc --noEmit` → no errors. `npm run lint` → no new errors. `npm test` → PASS, 21 tests.

- [ ] **Step 4: Verify in the browser**

`/lab/guide`: console clean. Orbit behind the open laptop: the wordmark reads left-to-right, upright, centred on the lid, catching light as a polished inlay. If it is invisible or black from behind, delete the winding-swap loop in `logo.ts` (the mapping did not mirror on this three version) and re-check. If an extra solid rectangle appears, a mask path slipped through the filter — log `svg.paths.map((p) => p.userData.node.outerHTML.slice(0, 80))` and exclude it.

Then review the overall finish with the user in mind: screenshots front ¾ open, back ¾ open (logo), closed from above.

- [ ] **Step 5: Commit**

```bash
git add components/guide/logo.ts components/guide/Laptop.tsx
git commit -m "feat(guide): model part 5 - polished Aurify wordmark on the lid"
```

- [ ] **Step 6: STOP — Gate 1.5 (model sign-off)**

Show the three screenshots. Ask the user to sign off the complete model, including colour and lighting (tune `materials()` in `model.ts` and `Studio` in `Laptop.tsx` on request, re-screenshot). The scroll work starts only after this sign-off.

---

### Task 10: Gate 2 — fixed canvas on the home page, Hero station

**Files:**
- Create: `components/guide/GuideCanvas.tsx`, `components/guide/GuideMount.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Laptop`, `Studio`, `STATIONS`, `LivePose`
- Produces: `GuideCanvas` with three `gsap.matchMedia` branches; Task 11 adds the desktop journey call, Task 14 the mobile fade. In development it exposes `window.__guidePose` for verification.

- [ ] **Step 1: Record the LCP baseline (before any home-page change)**

```bash
npm run build
```
Start the `aurify-prod` preview, open `/`, then run in `javascript_tool`:
```js
await new Promise((r) => new PerformanceObserver((l) => { const e = l.getEntries().at(-1); r({ lcp: Math.round(e.startTime), el: e.element?.tagName }); }).observe({ type: "largest-contentful-paint", buffered: true }))
```
Reload and run it 3 times; note the median in the Gate 2 report. Stop the prod preview.

- [ ] **Step 2: Create `components/guide/GuideCanvas.tsx`**

```tsx
"use client";

import { Component, Suspense, useCallback, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE, MOTION_OK, MOTION_REDUCED } from "@/lib/animation";
import Laptop, { Studio } from "./Laptop";
import { STATIONS, type LivePose } from "./stations";

/** No WebGL or a failed model load renders nothing: the page stays as it is. */
class Fallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The scroll guide: one laptop on a fixed layer in front of the home page.
 * GSAP writes `pose`, the R3F loop reads it; frameloop="demand" means the GPU
 * only renders when a tween calls `invalidate`.
 */
export default function GuideCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null); // load-in fade
  const fadeRef = useRef<HTMLDivElement>(null); // scroll-driven fades
  const invalidateRef = useRef<() => void>(() => {});
  const pose = useRef<LivePose>({ ...STATIONS.hero, rise: 0 }).current;
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    (window as unknown as { __guidePose?: LivePose }).__guidePose = pose;
  }

  useGSAP(
    () => {
      if (!ready) return;
      const render = () => invalidateRef.current();
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const html = document.documentElement;
        html.classList.add("guide-on");
        gsap.fromTo(wrapRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: EASE.out });
        gsap.fromTo(pose, { rise: 0.08 }, { rise: 0, duration: 1.2, ease: EASE.out, onUpdate: render });
        // guide-on changes section styling that other triggers measure
        ScrollTrigger.refresh();
        return () => html.classList.remove("guide-on");
      });

      mm.add(MOTION_REDUCED, () => {
        Object.assign(pose, STATIONS.hero, { lid: 1, rise: 0 });
        gsap.set(wrapRef.current, { autoAlpha: 1 });
        render();
      });

      return () => mm.revert();
    },
    { dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none invisible fixed inset-0 z-30">
      <div ref={fadeRef} className="h-full w-full">
        <Fallback>
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            camera={{ fov: 30, position: [0, 0, 10] }}
            gl={{ alpha: true, antialias: true }}
            // R3F sets pointer-events: auto on its wrapper; the page underneath must stay clickable
            style={{ pointerEvents: "none" }}
            onCreated={(state) => {
              invalidateRef.current = () => state.invalidate();
            }}
          >
            <Studio />
            <Suspense fallback={null}>
              <Laptop pose={pose} onReady={onReady} />
            </Suspense>
          </Canvas>
        </Fallback>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/guide/GuideMount.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";

// ssr: false is only allowed in a client module; it keeps three.js out of the
// server render and the first-paint bundle.
const GuideCanvas = dynamic(() => import("./GuideCanvas"), { ssr: false });

export default function GuideMount() {
  return <GuideCanvas />;
}
```

- [ ] **Step 4: Mount it in `app/page.tsx`**

Add the import after the `Opportunity` import:
```tsx
import GuideMount from "@/components/guide/GuideMount";
```
And render it first inside the fragment:
```tsx
    <>
      <GuideMount />
      <Hero />
```

- [ ] **Step 5: Verify in the browser**

Start `aurify-dev`, open `/`, wait for the laptop to fade in.
- Console: no errors.
- `document.documentElement.classList.contains("guide-on")` → `true`.
- Clicks pass through (Review Focus 1):
  ```js
  [[innerWidth / 2, innerHeight - 120], [innerWidth / 2, innerHeight / 2], [innerWidth - 60, 40]].map(([x, y]) => document.elementFromPoint(x, y)?.closest("canvas") === null)
  ```
  → all `true`.
- Leaving home cleans up (Review Focus 2): click the navbar's About link, then `document.documentElement.classList.contains("guide-on")` → `false` and `document.querySelector("canvas")` → `null`.
- Screenshot the Hero with the closed laptop in the dial (desktop 1440×900).

Expected at this gate: the laptop stays in its Hero pose as you scroll — scroll segments arrive in Task 11.

- [ ] **Step 6: Commit**

```bash
git add components/guide/GuideCanvas.tsx components/guide/GuideMount.tsx app/page.tsx
git commit -m "feat(guide): mount fixed guide canvas on home with hero station"
```

- [ ] **Step 7: STOP — Gate 2 checkpoint**

Show the Hero screenshot and the LCP baseline. Ask the user to confirm the Hero pose (position in the dial, size, tilt). Apply any requested tweaks to `STATIONS.hero` only, re-screenshot, and wait for confirmation before Task 11.

---

### Task 11: Gate 3 — lid reveal and Lifecycle stations

**Files:**
- Create: `components/guide/journey.ts`
- Modify: `lib/animation.ts`, `components/sections/home/LifecycleStrip.tsx:46` and `:219-221`, `components/sections/home/Hero.tsx:436-439`, `components/guide/GuideCanvas.tsx`

**Interfaces:**
- Consumes: `slotFromBox` (Task 1), `STATIONS`, `STAGE_YAW`, `LivePose`, `Pose` (Task 3)
- Produces: `LIFECYCLE_STAGE_SCROLL = 0.6` in `lib/animation.ts`; `buildJourney(pose: LivePose, render: () => void): void` in `journey.ts` (Task 13 adds a `fade: HTMLElement` parameter), plus internal `scrub`, `section`, `stage` helpers that Tasks 12–13 reuse in the same file.

- [ ] **Step 1: Share the lifecycle scroll budget**

In `lib/animation.ts`, append:
```ts
/** Scroll per lifecycle stage, in viewport heights (LifecycleStrip pin + guide). */
export const LIFECYCLE_STAGE_SCROLL = 0.6;
```
In `components/sections/home/LifecycleStrip.tsx`, change the import line to:
```ts
import { DURATION, EASE, LIFECYCLE_STAGE_SCROLL, MOTION_OK, RISE } from "@/lib/animation";
```
and line 46 to:
```ts
        const scrollLength = () => steps * window.innerHeight * LIFECYCLE_STAGE_SCROLL;
```

- [ ] **Step 2: Mark the trigger and slot elements**

`components/sections/home/Hero.tsx` line 436 — add the attribute:
```tsx
    <section
      ref={sectionRef}
      data-guide="hero"
```
`components/sections/home/LifecycleStrip.tsx` line 171:
```tsx
    <section ref={sectionRef} data-guide="lifecycle" className="bg-paper">
```
And the right-side visual (lines 219-221) becomes:
```tsx
                <div
                  aria-hidden
                  data-guide-slot="lifecycle"
                  className="group relative ml-auto aspect-[16/10] w-[28vw] max-w-md shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-white [.guide-on_&]:invisible"
                >
```
(`invisible` keeps the card's layout, so the copy doesn't shift and the slot stays measurable.)

- [ ] **Step 3: Create `components/guide/journey.ts`**

```ts
import { gsap } from "@/lib/gsap";
import { LIFECYCLE_STAGE_SCROLL } from "@/lib/animation";
import { lifecycle } from "@/lib/content/home";
import { slotFromBox } from "./slot";
import { STAGE_YAW, STATIONS, type LivePose, type Pose } from "./stations";

type PoseVars = { [K in keyof Pose]?: number | (() => number) };

const section = (name: string) => document.querySelector<HTMLElement>(`[data-guide="${name}"]`);

const TRIGGER_DEFAULTS = { scrub: 0.6, invalidateOnRefresh: true, refreshPriority: -1 } as const;

/**
 * Scrubs `pose` from one station to the next over a scroll range. Always
 * fromTo: a plain `to` would re-record its start from wherever the pose is
 * on refresh (resize, reload mid-page) and replay the wrong path.
 */
function scrub(pose: LivePose, from: PoseVars, to: PoseVars, trigger: ScrollTrigger.Vars, render: () => void) {
  return gsap.fromTo(pose, from, {
    ...to,
    ease: "none",
    immediateRender: false,
    onUpdate: render,
    scrollTrigger: { ...TRIGGER_DEFAULTS, ...trigger },
  });
}

/** The stage card's slot while its panel is in view; offsets ignore the track's transform. */
function cardSlot() {
  const card = document.querySelector<HTMLElement>('[data-guide-slot="lifecycle"]');
  if (!card) return STATIONS.lifecycle;
  return slotFromBox(
    { left: card.offsetLeft, top: card.offsetTop, width: card.offsetWidth, height: card.offsetHeight },
    window.innerWidth,
    window.innerHeight
  );
}

/** Pose at lifecycle stage `i` (0-based). */
const stage = (i: number): PoseVars => ({
  ...STATIONS.lifecycle,
  x: () => cardSlot().x,
  y: () => cardSlot().y,
  scale: () => cardSlot().scale,
  rotY: STATIONS.lifecycle.rotY + i * STAGE_YAW,
  screen: STATIONS.lifecycle.screen + i,
});

const LAST_STAGE = lifecycle.stages.length - 1;

function heroToLifecycle(pose: LivePose, render: () => void) {
  // Lid opens and the laptop travels into the card slot as the hero leaves
  scrub(pose, STATIONS.hero, stage(0), { trigger: section("hero"), start: "top top", end: "bottom top" }, render);
}

function lifecycleStages(pose: LivePose, render: () => void) {
  // Same range as LifecycleStrip's pin, split into one segment per stage so
  // its stage snap lands the laptop exactly on a station.
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    onUpdate: render,
    scrollTrigger: {
      ...TRIGGER_DEFAULTS,
      trigger: section("lifecycle"),
      start: "top top",
      end: () => "+=" + LAST_STAGE * window.innerHeight * LIFECYCLE_STAGE_SCROLL,
    },
  });
  for (let i = 0; i < LAST_STAGE; i++) {
    tl.fromTo(pose, stage(i), { ...stage(i + 1), immediateRender: false });
  }
}

/** Desktop journey: every scroll segment from Hero to the end of Problem. */
export function buildJourney(pose: LivePose, render: () => void) {
  heroToLifecycle(pose, render);
  lifecycleStages(pose, render);
}
```

- [ ] **Step 4: Wire the desktop branch into `GuideCanvas.tsx`**

Add the import:
```tsx
import { buildJourney } from "./journey";
```
And a new branch right after the `mm.add(MOTION_OK, ...)` block (it must come after, so `guide-on` is already set when the journey measures its slots):
```tsx
      mm.add(`(min-width: 768px) and ${MOTION_OK}`, () => {
        buildJourney(pose, render);
        ScrollTrigger.refresh();
      });
```

- [ ] **Step 5: Verify in the browser**

Dev preview, `/`, desktop 1440×900.
- Console: no errors.
- Scroll through the hero: the lid opens and the laptop arrives where the stage card was; the card itself is not visible.
- Stage snap and quick-nav (Review Focus 5):
  ```js
  document.querySelectorAll("[data-stage-jump]")[3].click(); await new Promise((r) => setTimeout(r, 1500)); const p = window.__guidePose; ({ screen: p.screen, rotY: p.rotY })
  ```
  → `screen ≈ 4`, `rotY ≈ -0.24` (within ±0.02).
- The numeral buttons and stage copy are never covered (screenshot each of the 6 stages).
- Scroll back up to the top: laptop returns to the closed Hero pose.

- [ ] **Step 6: Commit**

```bash
git add lib/animation.ts components/sections/home/LifecycleStrip.tsx components/sections/home/Hero.tsx components/guide/journey.ts components/guide/GuideCanvas.tsx
git commit -m "feat(guide): lid reveal and pin-synced lifecycle stations"
```

- [ ] **Step 7: STOP — Gate 3 checkpoint**

Show the 6 stage screenshots plus one mid-reveal frame. Tune only `STATIONS.lifecycle`, `STAGE_YAW` or `LID_OPEN` on request; wait for confirmation before Task 12.

---

### Task 12: Gate 4 — Opportunity transit

**Files:**
- Modify: `components/sections/home/Opportunity.tsx:60`, `components/guide/journey.ts`

**Interfaces:**
- Consumes: `scrub`, `section`, `stage`, `LAST_STAGE` (Task 11, same file)

- [ ] **Step 1: Mark the section**

`components/sections/home/Opportunity.tsx` line 60:
```tsx
    <section ref={sectionRef} data-guide="opportunity" className="py-section">
```

- [ ] **Step 2: Add the segment to `journey.ts`**

Above `buildJourney`:
```ts
function lifecycleToOpportunity(pose: LivePose, render: () => void) {
  // Turns edge-on and shrinks into the space right of the heading
  scrub(
    pose,
    stage(LAST_STAGE),
    STATIONS.opportunity,
    { trigger: section("opportunity"), start: "top bottom", end: "top 20%" },
    render
  );
}
```
And add the call as the last line of `buildJourney`:
```ts
  lifecycleToOpportunity(pose, render);
```

- [ ] **Step 3: Verify in the browser**

Dev preview, `/`, 1440×900 and 1280×720.
- Console: no errors.
- Scroll from the last lifecycle stage into Opportunity: the laptop turns edge-on and settles right of the heading.
- Screenshot with the heading in view and with the stats grid in view. **Check the laptop does not cover the third stat column**; if it does, lower `STATIONS.opportunity.scale` or raise `.y` and re-check.

- [ ] **Step 4: Commit**

```bash
git add components/sections/home/Opportunity.tsx components/guide/journey.ts
git commit -m "feat(guide): opportunity transit segment"
```

- [ ] **Step 5: STOP — Gate 4 checkpoint**

Show both screenshots; tune `STATIONS.opportunity` on request; wait for confirmation before Task 13.

---

### Task 13: Gate 5 — Problem finale and exit

**Files:**
- Modify: `lib/animation.ts`, `components/sections/home/ProblemInterlude.tsx`, `components/guide/journey.ts`, `components/guide/GuideCanvas.tsx`

**Interfaces:**
- Consumes: `scrub`, `section`, `TRIGGER_DEFAULTS` (Task 11), `STATIONS.problem`, `STATIONS.exit`, `PROBLEM_SLOT_WIDTH`, `SCREEN` (Task 3)
- Produces: `PROBLEM_LINE_SCROLL = 0.7` in `lib/animation.ts`

- [ ] **Step 1: Share the problem scroll budget**

Append to `lib/animation.ts`:
```ts
/** Scroll per Problem line, in viewport heights (ProblemInterlude pin + guide). */
export const PROBLEM_LINE_SCROLL = 0.7;
```
In `ProblemInterlude.tsx`, change the import to:
```ts
import { MOTION_OK, PROBLEM_LINE_SCROLL } from "@/lib/animation";
```
and the pin end to:
```ts
            end: () => "+=" + lines.length * window.innerHeight * PROBLEM_LINE_SCROLL,
```

- [ ] **Step 2: Fragments fly in from further out when the laptop covers the cluster**

In `ProblemInterlude.tsx`, inside the `mm.add(MOTION_OK, ...)` callback, add right after the `fragments` declaration:
```ts
        // With the guide laptop parked over the cluster, fragments start
        // further out so they're seen flying in behind its screen. Function
        // values, so the refresh the guide fires after adding guide-on
        // re-reads it.
        const spread = () =>
          document.documentElement.classList.contains("guide-on") ? 3.5 : 1;
```
Delete the scatter block:
```ts
        fragments.forEach((frag, i) => {
          const f = FRAGMENTS[i];
          if (!f) return;
          gsap.set(frag, {
            x: f.scatterX,
            y: f.scatterY,
            rotate: f.rotate,
            scale: 0.8,
            opacity: 0.4,
          });
        });
```
And replace the fragment branch inside `lines.forEach`:
```ts
          const frag = fragments[i];
          if (frag) {
            tl.to(
              frag,
              { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 1, ease: "none" },
              "<"
            );
          } else if (ringRef.current) {
```
with:
```ts
          const frag = fragments[i];
          const f = FRAGMENTS[i];
          if (frag && f) {
            // fromTo renders its scattered start immediately - the same state
            // the removed gsap.set used to apply
            tl.fromTo(
              frag,
              {
                x: () => f.scatterX * spread(),
                y: () => f.scatterY * spread(),
                rotate: f.rotate,
                scale: 0.8,
                opacity: 0.4,
              },
              { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 1, ease: "none" },
              "<"
            );
          } else if (ringRef.current) {
```

- [ ] **Step 3: Mark the section, the slot, and hide the ring under the guide**

```tsx
    <section ref={sectionRef} data-guide="problem" className="bg-mist text-navy">
```
Cluster wrapper:
```tsx
            <div
              aria-hidden
              data-guide-slot="problem"
              className="relative hidden h-64 w-64 shrink-0 md:block"
            >
```
Ring:
```tsx
              <div
                ref={ringRef}
                className="absolute rounded-full border border-blue/25 [.guide-on_&]:hidden"
```

- [ ] **Step 4: Add the segments to `journey.ts`**

Extend the imports:
```ts
import { LIFECYCLE_STAGE_SCROLL, PROBLEM_LINE_SCROLL } from "@/lib/animation";
import { lifecycle, problem } from "@/lib/content/home";
import { SCREEN } from "./screens";
import { PROBLEM_SLOT_WIDTH, STAGE_YAW, STATIONS, type LivePose, type Pose } from "./stations";
```
Above `buildJourney`:
```ts
/** The convergence cluster's slot while the Problem section is pinned at the top. */
function clusterSlot() {
  const el = document.querySelector<HTMLElement>('[data-guide-slot="problem"]');
  const sec = section("problem");
  if (!el || !sec) return STATIONS.problem;
  const r = el.getBoundingClientRect();
  const s = sec.getBoundingClientRect();
  return slotFromBox(
    { left: r.left, top: r.top - s.top, width: r.width, height: r.height },
    window.innerWidth,
    window.innerHeight,
    PROBLEM_SLOT_WIDTH
  );
}

const problemPose: PoseVars = {
  ...STATIONS.problem,
  x: () => clusterSlot().x,
  y: () => clusterSlot().y,
  scale: () => clusterSlot().scale,
};

// Mirrors ProblemInterlude's timeline: every line fades in (1) and holds
// (0.6); every line but the closer then fades out (1).
const LINES = problem.gaps.length + 1;
const PIN_LENGTH = () => LINES * window.innerHeight * PROBLEM_LINE_SCROLL;

function opportunityToProblem(pose: LivePose, render: () => void) {
  scrub(pose, STATIONS.opportunity, problemPose, { trigger: section("problem"), start: "top bottom", end: "top top" }, render);
}

function problemFinale(pose: LivePose, render: () => void) {
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    onUpdate: render,
    scrollTrigger: {
      ...TRIGGER_DEFAULTS,
      trigger: section("problem"),
      start: "top top",
      end: () => "+=" + PIN_LENGTH(),
    },
  });
  const total = LINES * 1.6 + (LINES - 1);
  const closerAt = (LINES - 1) * 2.6;
  // Slow drift across the whole pin, then the screen resolves with the closer
  tl.fromTo(
    pose,
    { rotY: STATIONS.problem.rotY },
    { rotY: STATIONS.problem.rotY + 0.15, duration: total, immediateRender: false },
    0
  );
  tl.fromTo(
    pose,
    { screen: SCREEN.fragmented },
    { screen: SCREEN.unified, duration: 1, immediateRender: false },
    closerAt
  );
}

function problemExit(pose: LivePose, fade: HTMLElement, render: () => void) {
  const range = {
    trigger: section("problem"),
    start: () => `top top-=${PIN_LENGTH()}`,
    end: () => `top top-=${PIN_LENGTH() + window.innerHeight * 0.5}`,
  };
  scrub(
    pose,
    { ...problemPose, rotY: STATIONS.problem.rotY + 0.15, screen: SCREEN.unified },
    STATIONS.exit,
    range,
    render
  );
  gsap.fromTo(
    fade,
    { autoAlpha: 1 },
    { autoAlpha: 0, ease: "none", immediateRender: false, scrollTrigger: { ...TRIGGER_DEFAULTS, ...range } }
  );
}
```
And extend `buildJourney`:
```ts
export function buildJourney(pose: LivePose, fade: HTMLElement, render: () => void) {
  heroToLifecycle(pose, render);
  lifecycleStages(pose, render);
  lifecycleToOpportunity(pose, render);
  opportunityToProblem(pose, render);
  problemFinale(pose, render);
  problemExit(pose, fade, render);
}
```
And in `GuideCanvas.tsx` pass the fade layer through - the desktop branch becomes:
```tsx
      mm.add(`(min-width: 768px) and ${MOTION_OK}`, () => {
        if (fadeRef.current) buildJourney(pose, fadeRef.current, render);
        ScrollTrigger.refresh();
      });
```

- [ ] **Step 5: Verify in the browser**

Dev preview, `/`, 1440×900.
- Console: no errors.
- Scroll through Problem: the laptop sits over the cluster slot; each gap line brings a fragment flying in behind the screen; on the closer line the screen resolves to the unified view; after the pin the laptop shrinks and fades out, and Ecosystem below is unobstructed.
- `npm test` still passes (no regressions in helpers).
- Reload mid-journey (Review Focus 3): scroll into the Problem pin, reload, wait for load-in; `window.__guidePose.screen` matches the current line (fragmented before the closer, unified after) and the laptop sits on the cluster slot. Then resize to 1280×720 and back: still on the slot. Then scroll back up to the top: Hero pose, lid closed.
- Screenshot: first gap line, closer line, after exit.

- [ ] **Step 6: Commit**

```bash
git add lib/animation.ts components/sections/home/ProblemInterlude.tsx components/guide/journey.ts components/guide/GuideCanvas.tsx
git commit -m "feat(guide): problem finale with fragment convergence and exit"
```

- [ ] **Step 7: STOP — Gate 5 checkpoint**

Show the three screenshots; tune `STATIONS.problem`, `STATIONS.exit`, `PROBLEM_SLOT_WIDTH` or the fragment `spread` on request; wait for confirmation before Task 14.

---

### Task 14: Gate 6 — mobile, reduced motion, failure fallback, performance, remove lab

**Files:**
- Modify: `components/guide/GuideCanvas.tsx`
- Delete: `components/guide/LabViewer.tsx`, `app/lab/guide/page.tsx`

- [ ] **Step 1: Add the mobile branch to `GuideCanvas.tsx`**

After the desktop `mm.add(...)` block:
```tsx
      // Mobile: Hero station only, fading out as the hero leaves
      mm.add(`(max-width: 767px) and ${MOTION_OK}`, () => {
        gsap.fromTo(
          fadeRef.current,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: '[data-guide="hero"]',
              start: "top top",
              end: "bottom top",
              scrub: true,
              refreshPriority: -1,
            },
          }
        );
      });
```

- [ ] **Step 2: Remove the lab page**

```bash
git rm components/guide/LabViewer.tsx app/lab/guide/page.tsx
```

- [ ] **Step 3: Verify mobile**

Dev preview, `resize_window` preset `mobile`, reload `/`.
- Laptop appears in the hero, fades out by the time the hero has scrolled off; no laptop over the lifecycle rail or below.
- Screenshot the hero. Reset with preset `desktop`.

- [ ] **Step 4: Verify reduced motion**

The preview tools cannot emulate `prefers-reduced-motion`, so this check runs in a browser with it on (OS setting, or Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce"). Open `/` there and confirm:
- `document.documentElement.classList.contains("guide-on")` → `false`.
- Lifecycle shows its normal vertical/static layout with stage cards visible; Problem shows its cluster and ring.
- The laptop sits static, open, in the Hero; nothing moves on scroll.
If no such browser is available to the executor, ask the user to run this one check and report back.

- [ ] **Step 5: Verify a failed asset load (Review Focus 4)**

Temporarily change the first entry of `SCREENS` in `screens.ts`:
```ts
  "/images/home/missing.jpeg",
```
Reload `/`:
- No canvas content, `guide-on` → `false`, lifecycle cards and Problem cluster visible, no uncaught error overlay beyond the logged failed request.
Revert the line. Confirm with `git diff components/guide/screens.ts` → empty.

- [ ] **Step 6: Performance**

```bash
npm run build
```
Start `aurify-prod`, open `/`, run the Task 10 LCP snippet 3 times; the median must not exceed the Task 10 baseline by more than 100 ms. Then scroll from Hero to the end of Problem while recording:
```js
await new Promise((r) => { const long = []; const o = new PerformanceObserver((l) => long.push(...l.getEntries().map((e) => Math.round(e.duration)))); o.observe({ type: "long-animation-frame", buffered: false }); setTimeout(() => { o.disconnect(); r({ count: long.length, worst: Math.max(0, ...long) }); }, 8000); })
```
(start it, then scroll for ~8 s). Report the numbers; frames over 100 ms during scroll are a failure to fix before shipping (first suspects: `dpr`, texture size, environment resolution).

- [ ] **Step 7: Run all checks**

```bash
npm test
```
```bash
npm run lint
```
```bash
npx tsc --noEmit
```
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add components/guide/GuideCanvas.tsx
git commit -m "feat(guide): mobile hero-only fade, hardening, remove lab page"
```

- [ ] **Step 9: STOP — Gate 6 checkpoint**

Report: mobile screenshot, reduced-motion result, failure-fallback result, LCP before/after, long-frame numbers. Wait for the user's sign-off.
