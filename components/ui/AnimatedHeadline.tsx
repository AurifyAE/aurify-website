"use client";

import { Fragment, useRef, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";

interface Unit {
  text: string;
  gradient: boolean;
}

/**
 * Word-level mask units. Words inside `highlight` carry the brand gradient.
 */
function toUnits(text: string, highlight?: string): Unit[] {
  const start = highlight ? text.indexOf(highlight) : -1;
  const end = start + (highlight?.length ?? 0);
  let cursor = 0;
  return text.split(" ").map((word) => {
    const wordStart = cursor;
    cursor += word.length + 1;
    return {
      text: word,
      gradient: start !== -1 && wordStart >= start && wordStart < end,
    };
  });
}

interface AnimatedHeadlineProps {
  text: string;
  highlight?: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** "load" plays on mount (hero); "scroll" waits for viewport entry */
  mode?: "load" | "scroll";
  delay?: number;
}

/**
 * Masked word-stagger headline. Server-rendered fully visible (LCP, no-JS);
 * under motion, GSAP hides the words on hydration and reveals them rising
 * out of per-word overflow masks. Reduced motion: text stays static.
 */
export default function AnimatedHeadline({
  text,
  highlight,
  as = "h1",
  className = "",
  mode = "load",
  delay = 0,
}: AnimatedHeadlineProps) {
  const rootRef = useRef<HTMLElement>(null);
  const Tag = as as ElementType;
  const units = toUnits(text, highlight);

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>(
        "[data-headline-word]",
        rootRef.current
      );
      if (!words.length) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(words, { yPercent: 110 });
        gsap.to(words, {
          yPercent: 0,
          duration: DURATION.slow,
          ease: EASE.expo,
          stagger: STAGGER.base,
          delay,
          ...(mode === "scroll" && {
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 80%",
              once: true,
            },
          }),
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <Tag ref={rootRef} className={className}>
      {units.map((unit, i) => (
        <Fragment key={`${unit.text}-${i}`}>
          {/* pb/-mb keeps descenders inside the overflow mask without
              shifting layout. The inner word carries the same allowance:
              .text-gradient paints glyphs via background-clip, and a
              background only exists inside the border box - without the
              padding, descenders (the "g" in "gold") fall below the tight
              line-height box and render transparent. */}
          <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em]">
            <span
              data-headline-word
              className={`inline-block pb-[0.12em] -mb-[0.12em] will-change-transform ${
                unit.gradient ? "text-gradient" : ""
              }`}
            >
              {unit.text}
            </span>
          </span>
          {i < units.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
