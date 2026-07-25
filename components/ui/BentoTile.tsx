"use client";

import {
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

type Glow = "white" | "blue";

interface BentoTileProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Spotlight tint - white reads on gradient tiles, blue on light ones */
  glow: Glow;
}

const GLOW: Record<Glow, string> = {
  white:
    "bg-[radial-gradient(320px_circle_at_var(--px)_var(--py),rgb(var(--white)/0.16),transparent_70%)]",
  blue: "bg-[radial-gradient(320px_circle_at_var(--px)_var(--py),rgb(var(--blue)/0.08),transparent_70%)]",
};

/**
 * Bento card shell with a pointer-tracked spotlight. The highlight position
 * travels via CSS custom properties so pointermove never touches React state,
 * and the overlay only fades in on hover - touch devices simply never see it.
 * Rendered after the card content so it lights everything beneath it; at these
 * alpha levels text stays fully legible.
 */
export default function BentoTile({
  children,
  className = "",
  style,
  glow,
}: BentoTileProps) {
  const ref = useRef<HTMLDivElement>(null);

  const track = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", `${e.clientX - r.left}px`);
    el.style.setProperty("--py", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={track}
      style={style}
      className={`[--px:50%] [--py:50%] ${className}`}
    >
      {children}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${GLOW[glow]}`}
      />
    </div>
  );
}
