# Scroll Guide Laptop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One 3D laptop on a fixed canvas travels with the home page scroll from the Hero to the Problem section, posing beside each section's copy and changing its screen per section.

**Architecture:** A client-only R3F `<Canvas>` (`frameloop="demand"`) sits fixed in front of the page with `pointer-events: none`. GSAP ScrollTriggers scrub one plain mutable `pose` object between stations; the R3F render loop reads `pose` each frame, so scroll never touches React state. Lifecycle and Problem stations measure their DOM slot so the laptop lands exactly where the card / cluster sits at any viewport width.

**Tech Stack:** Next 15 (App Router), React 19, three, @react-three/fiber 9, @react-three/drei 10, GSAP + ScrollTrigger (existing, via `@/lib/gsap`), Lenis (existing), Node's built-in test runner with native TS.

**Spec:** `docs/superpowers/specs/2026-10-13-scroll-guide-laptop-design.md`

## Global Constraints

- Import gsap/ScrollTrigger/useGSAP only from `@/lib/gsap`, never from the packages.
- Scroll position never enters React state; GSAP writes `pose`, `useFrame` reads it.
- `html.guide-on` is set **only after the model and screen textures have loaded**, and only under `(prefers-reduced-motion: no-preference)`. It is removed on unmount.
- Without `guide-on` (no WebGL, load error, reduced motion) the page must look exactly as it does today.
- Canvas layer: `fixed inset-0 z-30 pointer-events-none`, `aria-hidden`. z-30 sits below the floating contact menu (40), navbar (50), mobile menu (60) and modals (70/80).
- GLB contract: one `.glb`, ≤ 50k triangles, ≤ 1.5 MB, **meshopt** (no Draco), metres, Y-up, front faces +Z, origin at base centre, nodes `Base` / `Lid` (pivot on hinge, closed at rotation 0) / `Screen` (mesh, material `ScreenMat`, UVs 0–1, 16:10).
- No network requests to third-party hosts from the guide (no Draco CDN, no drei HDR presets).
- Mobile (< 768px): Hero station only, fading out as the hero leaves.
- Reduced motion: static open laptop at the Hero station, no scroll triggers.
- Every gate (Tasks 4–9) ends with the user's confirmation before the next task starts.

## Review Focus

1. **Clicks through the canvas** – R3F sets `pointer-events: auto` on its own wrapper; hero CTAs, lifecycle numerals and the navbar must stay clickable. Pinned in Task 5 (`elementFromPoint` check).
2. **Leaving the home page** – client navigation to another page must remove `html.guide-on` and kill the guide's triggers, or other pages inherit hidden elements. Pinned in Task 5 (navigate to `/about`, assert class gone).
3. **Reload or resize mid-journey** – poses must stay correct when the page loads scrolled into Problem or the window is resized there (fromTo + `invalidateOnRefresh`, never `to`). Pinned in Task 8.
4. **Model load failure** – a missing or broken GLB must leave today's page intact (cards and cluster visible, no class). Pinned in Task 9 (point `MODEL_URL` at a missing file).
5. **Stage snap and quick-nav** – Lenis' stage snap and the numeral buttons must land the laptop on that stage's exact pose and screen. Pinned in Task 6 (click numeral 4, read pose).

---

## File Structure

| File | Responsibility |
|---|---|
| `components/guide/screen.ts` | Pure: fractional screen index → two texture indices + mix |
| `components/guide/slot.ts` | Pure: DOM box → pose `{x, y, scale}` units |
| `components/guide/nodes.ts` | Find and validate `Lid` / `Screen` in a model |
| `components/guide/standIn.ts` | Code-built stand-in laptop honouring the GLB node contract |
| `components/guide/stations.ts` | `Pose` type, station data, tuning constants |
| `components/guide/screens.ts` | Screen image URLs (index = `Pose.screen`) |
| `components/guide/Laptop.tsx` | R3F: loads model + textures, applies `pose` each frame; `Studio` lighting |
| `components/guide/LabViewer.tsx` + `app/lab/guide/page.tsx` | Gate 1 test page (removed in Task 9) |
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

### Task 2: Node contract and stand-in model

**Files:**
- Create: `components/guide/nodes.ts`, `components/guide/standIn.ts`
- Test: `components/guide/nodes.test.ts`

**Interfaces:**
- Produces: `type LaptopNodes = { lid: Object3D; screen: Mesh }`, `getLaptopNodes(root: Object3D): LaptopNodes` (throws `Error` naming each missing node)
- Produces: `buildStandIn(): Group` with children named `Base`, `Lid` (Group, pivot on hinge), `Screen` (Mesh, material `ScreenMat`, glTF-convention UVs)

- [ ] **Step 1: Write the failing test**

`components/guide/nodes.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { Group, Mesh } from "three";
import { getLaptopNodes } from "./nodes.ts";
import { buildStandIn } from "./standIn.ts";

test("stand-in honours the GLB node contract", () => {
  const root = buildStandIn();
  const { lid, screen } = getLaptopNodes(root);
  assert.equal(lid.name, "Lid");
  assert.equal(screen.name, "Screen");
  assert.ok(root.getObjectByName("Base"));
  assert.equal((screen.material as { name: string }).name, "ScreenMat");
});

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

test("stand-in lid is modelled closed (rotation 0)", () => {
  const { lid } = getLaptopNodes(buildStandIn());
  assert.equal(lid.rotation.x, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find `./nodes.ts`.

- [ ] **Step 3: Implement**

`components/guide/nodes.ts`:
```ts
import type { Mesh, Object3D } from "three";

export type LaptopNodes = { lid: Object3D; screen: Mesh };

/**
 * Finds the nodes the rig drives. The GLB comes from outside the codebase,
 * so a renamed node fails loudly here instead of silently not animating.
 */
export function getLaptopNodes(root: Object3D): LaptopNodes {
  const lid = root.getObjectByName("Lid");
  const screen = root.getObjectByName("Screen") as Mesh | undefined;
  const missing = [!lid && "Lid", !screen?.isMesh && "Screen"].filter(Boolean);
  if (!lid || !screen?.isMesh) {
    throw new Error(`laptop model is missing node(s): ${missing.join(", ")}`);
  }
  return { lid, screen };
}
```

`components/guide/standIn.ts`:
```ts
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from "three";

// shortcut: geometric stand-in for the designer's GLB, built to the same node
// contract (Base / Lid / Screen); delete once public/models/laptop.glb ships.
export function buildStandIn(): Group {
  const metal = new MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.9, roughness: 0.35 });
  const root = new Group();

  const base = new Mesh(new BoxGeometry(0.31, 0.012, 0.215), metal);
  base.name = "Base";
  base.position.y = 0.006;
  root.add(base);

  // Pivot on the hinge: back edge of the base's top face. Closed = rotation 0,
  // lid lying on the base with the display facing down.
  const lid = new Group();
  lid.name = "Lid";
  lid.position.set(0, 0.012, -0.1075);
  root.add(lid);

  const shell = new Mesh(new BoxGeometry(0.31, 0.006, 0.215), metal);
  shell.position.set(0, 0.003, 0.1075);
  lid.add(shell);

  const screenGeo = new PlaneGeometry(0.29, 0.18125); // 16:10
  // glTF UV convention (v = 0 at the image top) so one texture setup
  // (flipY = false) serves both the stand-in and the real GLB.
  const uv = screenGeo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  const screenMat = new MeshStandardMaterial({ color: 0x0b1530 });
  screenMat.name = "ScreenMat";
  const screen = new Mesh(screenGeo, screenMat);
  screen.name = "Screen";
  screen.rotation.x = Math.PI / 2; // face -Y, toward the base, while closed
  screen.position.set(0, -0.0005, 0.1075);
  lid.add(screen);

  return root;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add components/guide/nodes.ts components/guide/standIn.ts components/guide/nodes.test.ts
git commit -m "feat(guide): add laptop node contract check and code-built stand-in"
```

---

### Task 3: Stations, screens and the Laptop rig

**Files:**
- Create: `components/guide/stations.ts`, `components/guide/screens.ts`, `components/guide/Laptop.tsx`

**Interfaces:**
- Consumes: `screenBlend` (Task 1), `getLaptopNodes`, `buildStandIn` (Task 2)
- Produces (`stations.ts`): `type Pose = { x; y; rotX; rotY; scale; lid; screen }` (all `number`), `type LivePose = Pose & { rise: number }`, `STATIONS: { hero; lifecycle; opportunity; problem; exit }` (each `Pose`), `STAGE_YAW: number`, `LID_OPEN: number`, `PROBLEM_SLOT_WIDTH: number`
- Produces (`screens.ts`): `SCREENS: string[]`, `SCREEN: { overview: 0; firstStage: 1; fragmented: number; unified: number }`
- Produces (`Laptop.tsx`): `default Laptop(props: { pose: LivePose; onReady?: () => void })` (suspends while loading; must sit inside `<Suspense>` inside a `<Canvas>`), `Studio()` (lights + procedural environment)

No unit test: this is rendering code with no branching logic of its own (the logic is in the tested helpers). It is verified visually at Gate 1 (Task 4).

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

// shortcut: overview / fragmented / unified reuse home photos until the real
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

/** Fully open lid in radians (~105°). Flip the sign if the GLB's hinge axis is reversed. */
export const LID_OPEN = -1.83;

/** Laptop width relative to the Problem section's 256px convergence cluster. */
export const PROBLEM_SLOT_WIDTH = 1.4;
```

- [ ] **Step 3: Create `components/guide/Laptop.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { Box3, ShaderMaterial, SRGBColorSpace, Vector3, type Group, type Object3D } from "three";
import { getLaptopNodes } from "./nodes";
import { screenBlend } from "./screen";
import { SCREENS } from "./screens";
import { buildStandIn } from "./standIn";
import { LID_OPEN, type LivePose } from "./stations";

// Set to "/models/laptop.glb" once the designer's file is in public/models/.
const MODEL_URL: string | null = null;

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
  // width. Measured detached and closed: a cached GLB scene may still carry
  // a previous mount's parent transform or open lid.
  const unit = useMemo(() => {
    root.removeFromParent();
    lid.rotation.x = 0;
    root.updateMatrixWorld(true);
    return 1 / new Box3().setFromObject(root).getSize(new Vector3()).x;
  }, [root, lid]);

  const material = useMemo(() => {
    for (const t of textures) {
      t.colorSpace = SRGBColorSpace;
      t.flipY = false; // glTF UV convention (see standIn.ts)
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

function GltfLaptop(props: RigProps) {
  // No Draco (its decoder loads from a CDN); meshopt decodes locally.
  const { scene } = useGLTF(MODEL_URL as string, false, true);
  return <Rig root={scene} {...props} />;
}

function StandInLaptop(props: RigProps) {
  const root = useMemo(buildStandIn, []);
  return <Rig root={root} {...props} />;
}

/** The guide laptop. Suspends while the model and screens load. */
export default function Laptop(props: RigProps) {
  return MODEL_URL ? <GltfLaptop {...props} /> : <StandInLaptop {...props} />;
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

### Task 4: Gate 1 — the laptop alone on `/lab/guide`

**Files:**
- Create: `components/guide/LabViewer.tsx`, `app/lab/guide/page.tsx`

**Interfaces:**
- Consumes: `Laptop`, `Studio` (Task 3), `SCREENS` (Task 3), `LivePose` (Task 3)

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

// Internal review page for the guide laptop; removed at Gate 6.
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
- Drag to orbit, then move the Lid slider 0 → 1: the lid swings from flat to ~105° and the display faces the viewer when open (if it opens the wrong way, flip the sign of `LID_OPEN` in `stations.ts`).
- Move the Screen slider: images crossfade, appear upright and un-mirrored.
- Screenshot open at three angles (front, ¾, side).

- [ ] **Step 4: Commit**

```bash
git add components/guide/LabViewer.tsx app/lab/guide/page.tsx
git commit -m "feat(guide): add /lab/guide gate-1 viewer"
```

- [ ] **Step 5: STOP — Gate 1 checkpoint**

Show the user the screenshots. Ask them to confirm the model look, lighting, lid motion and screen crossfade (and, once the designer's GLB exists, to drop it into `public/models/laptop.glb` and set `MODEL_URL` in `Laptop.tsx`). Do not start Task 5 until they confirm.

---

### Task 5: Gate 2 — fixed canvas on the home page, Hero station

**Files:**
- Create: `components/guide/GuideCanvas.tsx`, `components/guide/GuideMount.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Laptop`, `Studio`, `STATIONS`, `LivePose`
- Produces: `GuideCanvas` with three `gsap.matchMedia` branches; Task 6 adds the desktop journey call, Task 9 the mobile fade. In development it exposes `window.__guidePose` for verification.

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

Expected at this gate: the laptop stays in its Hero pose as you scroll — scroll segments arrive in Task 6.

- [ ] **Step 6: Commit**

```bash
git add components/guide/GuideCanvas.tsx components/guide/GuideMount.tsx app/page.tsx
git commit -m "feat(guide): mount fixed guide canvas on home with hero station"
```

- [ ] **Step 7: STOP — Gate 2 checkpoint**

Show the Hero screenshot and the LCP baseline. Ask the user to confirm the Hero pose (position in the dial, size, tilt). Apply any requested tweaks to `STATIONS.hero` only, re-screenshot, and wait for confirmation before Task 6.

---

### Task 6: Gate 3 — lid reveal and Lifecycle stations

**Files:**
- Create: `components/guide/journey.ts`
- Modify: `lib/animation.ts`, `components/sections/home/LifecycleStrip.tsx:46` and `:219-221`, `components/sections/home/Hero.tsx:436-439`, `components/guide/GuideCanvas.tsx`

**Interfaces:**
- Consumes: `slotFromBox` (Task 1), `STATIONS`, `STAGE_YAW`, `LivePose`, `Pose` (Task 3)
- Produces: `LIFECYCLE_STAGE_SCROLL = 0.6` in `lib/animation.ts`; `buildJourney(pose: LivePose, render: () => void): void` in `journey.ts` (Task 8 adds a `fade: HTMLElement` parameter), plus internal `scrub`, `section`, `stage` helpers that Tasks 7–8 reuse in the same file.

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

Show the 6 stage screenshots plus one mid-reveal frame. Tune only `STATIONS.lifecycle`, `STAGE_YAW` or `LID_OPEN` on request; wait for confirmation before Task 7.

---

### Task 7: Gate 4 — Opportunity transit

**Files:**
- Modify: `components/sections/home/Opportunity.tsx:60`, `components/guide/journey.ts`

**Interfaces:**
- Consumes: `scrub`, `section`, `stage`, `LAST_STAGE` (Task 6, same file)

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

Show both screenshots; tune `STATIONS.opportunity` on request; wait for confirmation before Task 8.

---

### Task 8: Gate 5 — Problem finale and exit

**Files:**
- Modify: `lib/animation.ts`, `components/sections/home/ProblemInterlude.tsx`, `components/guide/journey.ts`, `components/guide/GuideCanvas.tsx`

**Interfaces:**
- Consumes: `scrub`, `section`, `TRIGGER_DEFAULTS` (Task 6), `STATIONS.problem`, `STATIONS.exit`, `PROBLEM_SLOT_WIDTH`, `SCREEN` (Task 3)
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

Show the three screenshots; tune `STATIONS.problem`, `STATIONS.exit`, `PROBLEM_SLOT_WIDTH` or the fragment `spread` on request; wait for confirmation before Task 9.

---

### Task 9: Gate 6 — mobile, reduced motion, failure fallback, performance, remove lab

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

- [ ] **Step 5: Verify a failed model load (Review Focus 4)**

Temporarily set in `Laptop.tsx`:
```ts
const MODEL_URL: string | null = "/models/missing.glb";
```
Reload `/`:
- No canvas content, `guide-on` → `false`, lifecycle cards and Problem cluster visible, no uncaught error overlay beyond the logged 404.
Revert to `null` (or the real GLB path if it has shipped). Confirm with `git diff components/guide/Laptop.tsx` → empty.

- [ ] **Step 6: Performance**

```bash
npm run build
```
Start `aurify-prod`, open `/`, run the Task 5 LCP snippet 3 times; the median must not exceed the Task 5 baseline by more than 100 ms. Then scroll from Hero to the end of Problem while recording:
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
