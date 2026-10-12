import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MOTION_REDUCED } from "@/lib/animation";
import { createIngot } from "@/lib/ingot/createIngot";
import { ingotState } from "@/lib/ingot/ingotState";
import {
  cameraDistance,
  pickDock,
  rectToWorld,
  shortestAngle,
  type DockName,
} from "@/lib/ingot/math";

const FOV = 30;
// Exponential follow rate (1/s): slow enough that the ingot visibly trails
// the scroll like a guide catching up, fast enough to land within ~1s.
const FOLLOW = 4;
const HALF_TURN = Math.PI;

type Pose = { rx: number; ry: number; rz: number; spin?: boolean; float?: boolean };
const POSES: Record<DockName, Pose> = {
  hero: { rx: 0.35, ry: 0, rz: 0, spin: true, float: true },
  lifecycle: { rx: 0.35, ry: -0.3, rz: 0 },
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

  const timer = new THREE.Timer();
  // Damped base transform; float is layered on top so it never accumulates.
  const base = { x: 0, y: 0, s: 0 };
  let soft = 1;
  let fade = 1;
  let lastDock: DockName | null = null;
  let drawn = false;

  renderer.setAnimationLoop((time) => {
    timer.update(time);
    // Floor keeps damp() finite (Infinity × 0 = NaN under reduced motion).
    const dt = THREE.MathUtils.clamp(timer.getDelta(), 1e-3, 0.1);
    const t = timer.getElapsed();
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
      vw,
      vh
    );
    const name = dock?.name ?? null;
    const target =
      dock && !(dock.name === "hero" && ingotState.heroHidden)
        ? rectToWorld(dock.rect, vw, vh)
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
    const rx = pose.rx;
    const ry =
      pose.ry +
      (pose.spin && !reduced ? (t * Math.PI) / 4 : 0) + // 1 turn / 8s
      // Half a turn per lifecycle stage - slow, and the stamped top stays up.
      (name === "lifecycle" ? ingotState.lifecycle * ingotState.lifecycleSteps * HALF_TURN : 0);
    const rz = pose.rz + bank;
    g.rotation.set(
      damp(shortestAngle(g.rotation.x, rx), rx),
      damp(shortestAngle(g.rotation.y, ry), ry),
      damp(shortestAngle(g.rotation.z, rz), rz)
    );

    ingot.setSplit(desktop ? ingotState.split : 0);
    glint.position.set(THREE.MathUtils.lerp(-0.7, 0.7, ingotState.glint), 0.6, 0.5);
    glint.intensity = Math.sin(ingotState.glint * Math.PI) * 3;

    // Softening: blurred + dimmed where it sits behind content (hero
    // headline, lifecycle cards), sharp at the beside-the-copy docks.
    soft = damp(soft, name === "hero" || name === "lifecycle" ? 1 : 0);
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
