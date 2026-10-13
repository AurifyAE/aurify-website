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
