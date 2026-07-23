"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Marquee row of icon + label pill chips. The track holds the items twice
 * and translates -50% on a linear loop; chips use right-margins (not
 * container gap) so both halves measure identically and the loop is
 * seamless.
 *
 * Hover pause ramps `playbackRate` toward 0/1 over RAMP_MS instead of the
 * CSS `animation-play-state` toggle, which snaps the scroll to a dead stop
 * with no deceleration — noticeably abrupt on a row moving this fast.
 *
 * Reduced motion: the global kill-switch freezes the animation; the
 * duplicate set is hidden and the row wraps into a static centered cloud.
 */

const RAMP_MS = 450;

interface MarqueeItem {
  label: string;
  icon: string;
}

interface MarqueeProps {
  items: MarqueeItem[];
  direction?: "left" | "right";
  /** Seconds per loop */
  duration?: number;
}

export default function Marquee({
  items,
  direction = "left",
  duration = 40,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const rampTo = (target: number) => {
    const animation = trackRef.current?.getAnimations()[0];
    if (!animation) return;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const start = animation.playbackRate;
    const startTime = performance.now();

    const step = (now: number) => {
      // rAF's frame timestamp can predate the performance.now() read above
      // (it marks when the frame began, which may be before this callback
      // was scheduled), so elapsed time can be briefly negative on the
      // first tick — clamp both ends or the eased value overshoots [0,1].
      const t = Math.max(0, Math.min(1, (now - startTime) / RAMP_MS));
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      animation.playbackRate = start + (target - start) * eased;
      rafRef.current = t < 1 ? requestAnimationFrame(step) : null;
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  // The -50% loop only stays seamless if one pass through `items` is at
  // least as wide as the row. With just 4-5 chips that fails on any normal
  // desktop width, so the track runs dry before it wraps and bare
  // background shows through. Padding with extra passes (rather than
  // capping the row's width) keeps the full-bleed feel while covering wide
  // viewports — it's still the same items cycling, just enough copies that
  // the seam never outruns the visible row.
  const REPEAT = Math.max(2, Math.ceil(24 / items.length));
  const set = Array.from({ length: REPEAT }, () => items).flat();

  return (
    <div className="marquee-mask overflow-hidden">
      <div
        ref={trackRef}
        onMouseEnter={() => rampTo(0)}
        onMouseLeave={() => rampTo(1)}
        className="flex w-max bg-white border border-blue/15 animate-marquee motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: direction === "right" ? "reverse" : undefined,
        }}
      >
        {[...set, ...set].map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            aria-hidden={i >= items.length || undefined}
            className={`my-3 mr-3 inline-flex items-center gap-4 whitespace-nowrap px-5 py-2.5 text-base text-ink/70 ${
              i >= items.length ? "motion-reduce:hidden" : ""
            }`}
          >
            <Image
              src={item.icon}
              alt=""
              width={16}
              height={16}
              unoptimized
              className="h-5 w-5 shrink-0"
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
