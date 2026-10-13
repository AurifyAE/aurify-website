import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MOTION_REDUCED } from "@/lib/animation";
import { createIngot } from "@/lib/ingot/createIngot";
import { ingotState } from "@/lib/ingot/ingotState";
import { cameraDistance, pickDock, rectToWorld, type DockName } from "@/lib/ingot/math";

const FOV = 30;
// Exponential follow rate (1/s) for growing in and shrinking away.
const FOLLOW = 4;
// Tilt toward the viewer so the stamped top face shows.
const TILT = 0.35;

/** Starts the ingot loop on `canvas`; resolves to a dispose function. */
export async function runIngotStage(canvas: HTMLCanvasElement): Promise<() => void> {
  // shortcut: breakpoint + motion preference are read once; crossing md or
  // toggling reduced motion applies on the next load. Upgrade if QA flags it.
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const reduced = window.matchMedia(MOTION_REDUCED).matches;

  // Ingot first: if its stamp fails to load, no GPU resources exist yet to leak.
  const ingot = await createIngot({ segments: desktop ? 4 : 2 });

  // Probe WebGL2 ourselves - three logs a console error before throwing
  // when it can't get a context, and r186 is WebGL2-only.
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: desktop });
  let renderer: THREE.WebGLRenderer;
  try {
    if (!gl) throw new Error("WebGL2 unavailable");
    renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true });
  } catch {
    // No WebGL: the hero reads fine without the ingot.
    ingot.dispose();
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, desktop ? 2 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 10000);

  const g = ingot.group;
  g.scale.setScalar(0);
  scene.add(g);

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
  let drawn = false;

  const frame = (time: number) => {
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
    // Shrinks away in place once the hero scrolls past or a poster slide covers it.
    const target =
      dock && !ingotState.heroHidden
        ? rectToWorld(dock.rect, vw, vh)
        : { x: base.x, y: base.y, scale: 0 };

    base.x = damp(base.x, target.x);
    base.y = damp(base.y, target.y);
    base.s = damp(base.s, target.scale);

    const float = reduced ? 0 : Math.sin(t * 1.2) * base.s * 0.03;
    g.position.set(base.x, base.y + float, 0);
    g.scale.setScalar(base.s);
    g.rotation.set(TILT, reduced ? 0 : (t * Math.PI) / 4, 0); // 1 turn / 8s

    // Softened behind the headline, sharp as it leaves.
    soft = damp(soft, dock ? 1 : 0);
    canvas.style.filter = soft > 0.01 ? `blur(${(soft * 4).toFixed(2)}px)` : "";
    canvas.style.opacity = (1 - soft * 0.4).toFixed(3);

    // Skip GPU work while the ingot is invisible; clear once so no stale frame lingers.
    if (base.s > 0.5) {
      renderer.render(scene, camera);
      drawn = true;
    } else if (drawn) {
      renderer.clear();
      drawn = false;
    }

    // No dock in view and nothing on screen: stop until the page scrolls or resizes.
    if (!dock && !drawn) sleep();
  };
  const wake = () => {
    window.removeEventListener("scroll", wake);
    window.removeEventListener("resize", wake);
    renderer.setAnimationLoop(frame);
  };
  const sleep = () => {
    renderer.setAnimationLoop(null);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
  };
  renderer.setAnimationLoop(frame);

  return () => {
    renderer.setAnimationLoop(null);
    window.removeEventListener("scroll", wake);
    window.removeEventListener("resize", wake);
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
