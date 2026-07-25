"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, RISE, STAGGER } from "@/lib/animation";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "header";
  /** Stagger direct children instead of fading the wrapper as one */
  stagger?: boolean;
  delay?: number;
}

/**
 * Generic fade-up on first viewport entry. Lets server components stay
 * server components - wrap the animated part and pass `stagger` to reveal
 * direct children one after another. Reduced motion: renders static.
 */
export default function Reveal({
  children,
  className,
  as = "div",
  stagger = false,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as ElementType;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const targets = stagger ? Array.from(el.children) : el;
        gsap.from(targets, {
          autoAlpha: 0,
          y: RISE,
          duration: DURATION.base,
          ease: EASE.out,
          delay,
          stagger: stagger ? STAGGER.base : 0,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
          // Otherwise the tween leaves an inline transform/opacity behind,
          // which (being inline) outranks any hover/focus class a revealed
          // element defines afterward. Only the animated props, though -
          // "all" wipes the whole style attribute, destroying inline CSS
          // vars children rely on (e.g. ModuleExplorer's grid placement).
          clearProps: "opacity,visibility,transform",
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
