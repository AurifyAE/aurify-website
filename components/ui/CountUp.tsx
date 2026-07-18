"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/animation";

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts from 0 to `value` on first viewport entry by tweening a plain
 * object and writing textContent — no React state, no re-renders.
 * Server-rendered with the final value; reduced motion keeps it static.
 */
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className = "",
}: CountUpProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = numRef.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const counter = { v: 0 };
        el.textContent = "0";
        gsap.to(counter, {
          v: value,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 85%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v));
          },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <span ref={rootRef} className={className}>
      {prefix}
      <span ref={numRef}>{value}</span>
      {suffix}
    </span>
  );
}
