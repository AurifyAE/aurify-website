"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createIngot, type Ingot } from "@/lib/ingot/createIngot";

export default function IngotSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splitRef = useRef(0);

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
    camera.position.set(0, 1.4, 3.2);
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
      ingot?.setSplit(splitRef.current);
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
}
