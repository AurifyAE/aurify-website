"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, RISE, STAGGER } from "@/lib/animation";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  body?: string;
  /** "light" for white/paper sections, "dark" for ink/navy moments */
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}

/**
 * Standard section opener: eyebrow + title (+ body) with a staggered
 * fade-up reveal on first viewport entry.
 */
export default function SectionHeading({
  eyebrow,
  title,
  body,
  tone = "light",
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const light = tone === "light";

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        rootRef.current
      );
      if (!items.length) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(items, {
          autoAlpha: 0,
          y: RISE,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.base,
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 80%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className={`${
        align === "center" ? "flex flex-col items-center text-center" : ""
      } ${className}`}
    >
      {eyebrow && (
        <p
          data-reveal
          className={`text-eyebrow uppercase ${light ? "text-blue" : "text-sky"}`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        data-reveal
        className={`mt-4 max-w-3xl text-title ${light ? "text-navy" : "text-white"}`}
      >
        {title}
      </h2>
      {body && (
        <p
          data-reveal
          className={`mt-6 max-w-measure text-body ${
            light ? "text-ink/60" : "text-white/60"
          }`}
        >
          {body}
        </p>
      )}
    </div>
  );
}
