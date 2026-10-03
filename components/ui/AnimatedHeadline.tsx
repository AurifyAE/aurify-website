"use client";

import { Fragment, useRef, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, STAGGER } from "@/lib/animation";

interface Unit {
  text: string;
  gradient: boolean;
  lead: boolean;
}

function inRange(wordStart: number, text: string, phrase?: string) {
  const start = phrase ? text.indexOf(phrase) : -1;
  if (start === -1) return false;
  return wordStart >= start && wordStart < start + (phrase?.length ?? 0);
}

/**
 * Word-level mask units. Words inside `highlight` carry the brand gradient;
 * words inside `lead` keep the full type size when `restClassName` shrinks
 * the rest of the line.
 */
function toUnits(text: string, highlight?: string, lead?: string): Unit[] {
  let cursor = 0;
  return text.split(" ").map((word) => {
    const wordStart = cursor;
    cursor += word.length + 1;
    return {
      text: word,
      gradient: inRange(wordStart, text, highlight),
      lead: inRange(wordStart, text, lead),
    };
  });
}

interface AnimatedHeadlineProps {
  text: string;
  highlight?: string;
  /** Substring that keeps the full type size; the rest takes restClassName. */
  lead?: string;
  /** Size class for the words outside `lead`, e.g. "text-[0.58em]". */
  restClassName?: string;
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
  lead,
  restClassName = "",
  as = "h1",
  className = "",
  mode = "load",
  delay = 0,
}: AnimatedHeadlineProps) {
  const rootRef = useRef<HTMLElement>(null);
  const Tag = as as ElementType;
  const units = toUnits(text, highlight, lead);

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

  // Consecutive words of the same kind become one block, so the smaller run
  // gets its own line box instead of inheriting the display line-height.
  const runs: { lead: boolean; units: Unit[] }[] = [];
  for (const unit of units) {
    const current = runs[runs.length - 1];
    if (current && current.lead === unit.lead) current.units.push(unit);
    else runs.push({ lead: unit.lead, units: [unit] });
  }

  const renderUnits = (group: Unit[], offset: number) =>
    group.map((unit, i) => (
        <Fragment key={`${unit.text}-${offset + i}`}>
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
          {i < group.length - 1 && " "}
        </Fragment>
    ));

  if (!lead || runs.length < 2) {
    return (
      <Tag ref={rootRef} className={className}>
        {renderUnits(units, 0)}
      </Tag>
    );
  }

  let offset = 0;
  return (
    <Tag ref={rootRef} className={className}>
      {runs.map((run, i) => {
        const start = offset;
        offset += run.units.length;
        return (
          <span
            key={i}
            className={`block ${run.lead ? "" : restClassName}`}
          >
            {renderUnits(run.units, start)}
          </span>
        );
      })}
    </Tag>
  );
}
