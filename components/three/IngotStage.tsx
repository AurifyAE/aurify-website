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
