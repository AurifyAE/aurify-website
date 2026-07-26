"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  DURATION,
  EASE,
  MOTION_OK,
  MOTION_REDUCED,
  STAGGER,
} from "@/lib/animation";
import { hero } from "@/lib/content/home";
import { site } from "@/lib/content/site";
import Button from "@/components/ui/Button";
import AnimatedHeadline from "@/components/ui/AnimatedHeadline";

const AUTO_ADVANCE_MS = 6000;
const banners = hero.banners;
const hasImages = banners.some((b) => b.image);
// Track slots: banners, plus one cloned trailing slide (a duplicate of
// banner 0) that makes the last→first wrap slide forward seamlessly.
const hasClone = banners.length > 1;
const slots = hasClone ? banners.length + 1 : banners.length;

// Magnetic pull radius (px the button may travel) and how much of the
// cursor's offset from center it follows - kept small and heavily damped so
// it reads as a quiet, premium nudge rather than a gimmick.
const MAGNETIC_MAX = 10;
const MAGNETIC_STRENGTH = 0.35;

// Crosshair registration marks on the background grid - percentages keep
// them on the empty flanks, clear of the centered copy column at any
// viewport (they also hide below md, where the column owns the width).
const CROSSHAIRS: Array<{ left: string; top: string }> = [
  { left: "16%", top: "24%" },
  { left: "84%", top: "20%" },
  { left: "10%", top: "66%" },
  { left: "88%", top: "62%" },
];

/**
 * Wraps the primary CTA in a quiet magnetic-pull effect: within the
 * button's own bounds, it nudges a few px toward the cursor and eases back
 * on leave. No-op under reduced motion.
 */
function MagneticCTA({ href, children }: { href: string; children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = wrapRef.current;
      if (!el || window.matchMedia(MOTION_REDUCED).matches) return;

      const quickX = gsap.quickTo(el, "x", { duration: 0.5, ease: EASE.out });
      const quickY = gsap.quickTo(el, "y", { duration: 0.5, ease: EASE.out });

      const handleMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        quickX(gsap.utils.clamp(-MAGNETIC_MAX, MAGNETIC_MAX, relX * MAGNETIC_STRENGTH));
        quickY(gsap.utils.clamp(-MAGNETIC_MAX, MAGNETIC_MAX, relY * MAGNETIC_STRENGTH));
      };
      const handleLeave = () => {
        quickX(0);
        quickY(0);
      };

      el.addEventListener("pointermove", handleMove);
      el.addEventListener("pointerleave", handleLeave);
      return () => {
        el.removeEventListener("pointermove", handleMove);
        el.removeEventListener("pointerleave", handleLeave);
      };
    },
    { scope: wrapRef }
  );

  return (
    <div ref={wrapRef} className="inline-block">
      <Button href={href} className="hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]">
        {children}
      </Button>
    </div>
  );
}

/**
 * §1 - The Statement, a three-banner sliding carousel. White background with
 * a precision-dial animation (crisp hairline rings and a tick bezel behind
 * the headline, orbited by counter-rotating comet arcs over a soft core
 * glow, on a masked technical grid with perimeter brand washes, headline
 * veil, film grain) riding a
 * damped cursor parallax; banners sit side by
 * side on a horizontal track that slides to the active one, plus one cloned
 * trailing slide (a duplicate of banner 0) so the wrap from the last banner
 * back to the first keeps sliding forward instead of snapping back - once
 * the clone is fully in view it's an exact match for the real banner 0, so
 * swapping back to it is imperceptible. Auto-advances every 6s regardless of
 * hover/focus, and holds a static slide under reduced motion (instant snap
 * instead of an animated slide). Dots give manual control; the dots +
 * signature line fade out over the first 240px of scroll. If a banner.image
 * is set, its background photo slides in sync with the content behind the
 * mesh.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imageTrackRef = useRef<HTMLDivElement>(null);
  const cueWrapRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Continuous track position (0..banners.length, where banners.length is
  // the cloned slide's slot) and the previous `active`, so the slide effect
  // below can tell a natural last→first wrap from a manual dot jump.
  const posRef = useRef(0);
  const prevActiveRef = useRef(0);
  // True for the real active banner and, mid wrap-around, its clone
  // stand-in - shared by the crossfade and the Ken Burns zoom so both agree
  // on which slide is "the one currently in view."
  const isActiveSlide = (i: number) =>
    i === active || (hasClone && active === 0 && i === banners.length);

  // Auto-advance. Disabled under reduced motion. Keying the effect on
  // `active` restarts the timer on every change (auto or manual) so the
  // cadence resets from the last move.
  useEffect(() => {
    if (banners.length < 2) return;
    if (window.matchMedia(MOTION_REDUCED).matches) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % banners.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  // Slide the content + image tracks to the active banner. Reduced motion
  // snaps instantly instead of animating.
  useGSAP(
    () => {
      const N = banners.length;
      if (N < 2) return;
      const M = N + 1; // +1 for the cloned trailing slide
      const targets = [trackRef.current, imageTrackRef.current].filter(
        (el): el is HTMLDivElement => el !== null
      );
      if (!targets.length) return;

      const prevActive = prevActiveRef.current;
      prevActiveRef.current = active;

      const mm = gsap.matchMedia();
      mm.add(MOTION_REDUCED, () => {
        gsap.set(targets, { xPercent: -(active * 100) / M });
        posRef.current = active;
      });
      mm.add(MOTION_OK, () => {
        const isForwardWrap = prevActive === N - 1 && active === 0;
        const basePos = ((posRef.current % N) + N) % N;
        const targetPos = basePos + (isForwardWrap ? 1 : active - prevActive);
        posRef.current = targetPos;

        // power2.inOut eases into AND out of the move, so the slab glides up
        // to speed instead of kicking off at full velocity (what expo.out
        // was doing) - that abrupt launch was the "not smooth" part. The
        // slightly longer duration lets that gentler curve read as
        // deliberate rather than sluggish.
        gsap.to(targets, {
          xPercent: -(targetPos * 100) / M,
          duration: DURATION.slow,
          ease: EASE.inOut,
          onComplete: () => {
            // Landed on the clone (slot N, a duplicate of slide 0) - snap
            // back to the real slot instantly so position never grows
            // unbounded. Guarded against a newer transition already having
            // moved on.
            if (targetPos === N && posRef.current === targetPos) {
              gsap.set(targets, { xPercent: 0 });
              posRef.current = 0;
            }
          },
        });

        // Crossfade + soft depth on top of the slide: the outgoing content
        // dissolves back and settles slightly smaller while the incoming
        // content resolves to full size and opacity, on the same timing as
        // the position move above. Turns the slab-cut into a considered
        // dissolve-and-slide instead of a flat, hard-edged pan.
        const contentSlides = gsap.utils.toArray<HTMLElement>(
          "[data-hero-slide]",
          trackRef.current
        );
        contentSlides.forEach((slide, i) => {
          gsap.to(slide, {
            opacity: isActiveSlide(i) ? 1 : 0.4,
            scale: isActiveSlide(i) ? 1 : 0.97,
            duration: DURATION.slow,
            ease: EASE.inOut,
          });
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [active] }
  );

  // Cinematic slow-zoom on the active banner's background photo (Ken Burns).
  // Scoped to the image itself, not the track, so it never fights the
  // horizontal slide transform. Resting slides snap back to scale 1 the
  // instant they go inactive - invisible, since the track has already
  // carried them off-screen by then.
  useGSAP(
    () => {
      if (!hasImages) return;
      const slides = gsap.utils.toArray<HTMLElement>(
        "[data-hero-image-slide]",
        imageTrackRef.current
      );
      if (!slides.length) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        slides.forEach((slide, i) => {
          // Crossfade in step with the content track, independent of the
          // much longer zoom below - different property, so the two tweens
          // never fight over the same one.
          gsap.to(slide, {
            opacity: isActiveSlide(i) ? 1 : 0,
            duration: DURATION.slow,
            ease: EASE.inOut,
          });
          if (isActiveSlide(i)) {
            gsap.fromTo(
              slide,
              { scale: 1 },
              { scale: 1.06, duration: AUTO_ADVANCE_MS / 1000 + 1, ease: "none" }
            );
          } else {
            gsap.set(slide, { scale: 1 });
          }
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [active] }
  );

  // Content entrance - plays once on load across all banners (visible for
  // the first slide, already settled by the time later ones slide into
  // view).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-hero-rise]", {
          autoAlpha: 0,
          y: 24,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.loose,
          delay: 0.5,
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Dots + signature fade away as scrolling begins.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to(cueWrapRef.current, {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=240",
            scrub: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Cursor-parallax on the dial assembly - a faint drift riding on top of
  // the arcs' own CSS rotations, which sit on child elements, so the two
  // never fight. Heavily damped and range-capped to stay a quiet ambient
  // cue, not a spotlight-follows-cursor gimmick.
  useGSAP(
    () => {
      const section = sectionRef.current;
      const mesh = meshRef.current;
      if (!section || !mesh || window.matchMedia(MOTION_REDUCED).matches) return;

      const quickX = gsap.quickTo(mesh, "x", { duration: 1.2, ease: EASE.inOut });
      const quickY = gsap.quickTo(mesh, "y", { duration: 1.2, ease: EASE.inOut });
      const MAX = 18;

      const handleMove = (e: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        quickX(relX * MAX);
        quickY(relY * MAX);
      };
      const handleLeave = () => {
        quickX(0);
        quickY(0);
      };

      section.addEventListener("pointermove", handleMove);
      section.addEventListener("pointerleave", handleLeave);
      return () => {
        section.removeEventListener("pointermove", handleMove);
        section.removeEventListener("pointerleave", handleLeave);
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Aurify highlights"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-24 text-center"
    >
      {/* Ambient background - a precision dial behind the headline block:
          crisp hairline rings and a graduated tick bezel (inline SVG,
          engraved rather than glowing) with a bright sky→teal comet arc
          orbiting the mid ring and a quieter teal counter-arc on the inner
          one, all over a soft core glow. Beneath the dial, a hairline
          technical grid (.hero-grid, radially masked) and sparse crosshair
          registration marks give the white field engineered structure;
          asymmetric brand washes shade the perimeter. The dial assembly
          wanders on a slow two-axis drift so it floats rather than spinning
          on a fixed pivot. Transform-only animation; reduced motion freezes
          the orbits and drift via the global kill-switch in globals.css. */}
      <div
        ref={meshRef}
        aria-hidden
        className="pointer-events-none absolute -inset-[4%]"
      >
        {/* Surround shading - asymmetric brand washes (one element,
            layered radial gradients): a broad sky field high right, teal
            entering at the left edge, and a blue-over-sky horizon rising
            from the bottom to ground the composition. Each fades out well
            before the dial's zone; riding this wrapper, they also drift
            with the cursor parallax. */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_82%_0%,rgb(var(--sky)/0.16),rgb(var(--sky)/0)_70%),radial-gradient(45%_45%_at_0%_30%,rgb(var(--teal)/0.12),rgb(var(--teal)/0)_70%),radial-gradient(75%_45%_at_50%_100%,rgb(var(--blue)/0.16),rgb(var(--blue)/0)_70%),radial-gradient(45%_25%_at_50%_100%,rgb(var(--sky)/0.1),rgb(var(--sky)/0)_70%)]" />

        {/* Technical grid - hairline module masked to the mid-frame */}
        <div className="hero-grid absolute inset-0" />

        {/* Crosshair registration marks - sparse survey points on the
            grid's empty flanks; hidden on small screens where the copy
            column owns the full width */}
        {CROSSHAIRS.map((pos, i) => (
          <svg
            key={i}
            viewBox="0 0 12 12"
            fill="none"
            className="absolute hidden h-3 w-3 md:block"
            style={pos}
          >
            <path d="M6 1v10M1 6h10" className="stroke-navy/25" strokeWidth="1" />
          </svg>
        ))}

        {/* Centering translate stays on this wrapper; the wander keyframes
            live on the two nested axis divs below (one axis each, plus the
            scale breath), so the three transforms never fight. Each
            transformed div is also the containing block for the absolute
            dial layers inside it. */}
        <div className="absolute left-1/2 top-[46%] h-[min(92vmin,60rem)] w-[min(92vmin,60rem)] -translate-x-1/2 -translate-y-1/2">
          <div className="h-full w-full animate-halo-x will-change-transform">
            <div className="h-full w-full animate-halo-y will-change-transform">
              {/* Core glow - the one soft layer left, so the crisp rings
                  read as machined metal catching ambient light */}
              <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--sky)/0.13)_0%,rgb(var(--teal)/0.06)_45%,rgb(var(--white)/0)_70%)]" />

              {/* Engraved rings - static hairlines pinned to 1px by
                  non-scaling-stroke; the tick bezel draws 72 radial
                  graduations via the dash trick (stroke width is the tick
                  height, dash length its width: r=336 circumference
                  2111.15 / 72 = 29.32 period). */}
              <svg viewBox="0 0 800 800" fill="none" className="absolute inset-0 h-full w-full">
                <circle cx="400" cy="400" r="250" className="stroke-navy/10" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <circle cx="400" cy="400" r="320" className="stroke-navy/[0.13]" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <circle cx="400" cy="400" r="384" className="stroke-navy/[0.07]" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <circle cx="400" cy="400" r="336" className="stroke-navy/[0.16]" strokeWidth="9" strokeDasharray="1.5 27.82" />
              </svg>

              {/* Orbiting light - a 75° comet arc on the mid ring (dash 420
                  of circumference 2010.62), gradient running tail→head
                  along the arc's chord so the leading edge burns brightest;
                  the wide low-opacity twin underneath is its bloom. */}
              <div className="absolute inset-0 animate-spin-slow will-change-transform">
                <svg viewBox="0 0 800 800" fill="none" className="h-full w-full">
                  <defs>
                    <linearGradient id="hero-arc" gradientUnits="userSpaceOnUse" x1="720" y1="400" x2="483" y2="709">
                      <stop offset="0" style={{ stopColor: "rgb(var(--sky))" }} stopOpacity="0" />
                      <stop offset="0.6" style={{ stopColor: "rgb(var(--sky))" }} stopOpacity="0.5" />
                      <stop offset="1" style={{ stopColor: "rgb(var(--teal))" }} stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <circle cx="400" cy="400" r="320" stroke="url(#hero-arc)" strokeWidth="7" strokeLinecap="round" strokeDasharray="420 1590.62" className="opacity-30" />
                  <circle cx="400" cy="400" r="320" stroke="url(#hero-arc)" strokeWidth="2" strokeLinecap="round" strokeDasharray="420 1590.62" />
                </svg>
              </div>

              {/* Counter-orbit - a quieter teal arc riding the inner ring
                  the other way (dash 300 of circumference 1570.8) */}
              <div className="absolute inset-0 animate-spin-slow-rev will-change-transform">
                <svg viewBox="0 0 800 800" fill="none" className="h-full w-full">
                  <circle cx="400" cy="400" r="250" className="stroke-teal/40" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="300 1270.8" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Headline veil - a soft white radial right behind the copy keeps
          the text effortless to read where the ring band crosses it.
          Outside the parallax wrapper so the calm zone never moves. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_45%,rgb(var(--white)/0.5)_0%,rgb(var(--white)/0.15)_55%,rgb(var(--white)/0)_75%)]"
      />

      {/* Film grain - kills gradient banding on the blurred layers and adds
          a faint physical texture. Static, non-scrolling, low opacity. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-noise opacity-[0.04]"
      />

      {/* Optional background photos - slide in sync with the content track.
          Only rendered once a banner.image is set; otherwise the mesh above
          is the whole background, as in the original hero. */}
      {hasImages && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div
            ref={imageTrackRef}
            className="flex h-full"
            style={{ width: `${slots * 100}%` }}
          >
            {banners.map((banner, i) => (
              <div
                key={i}
                data-hero-image-slide
                className="relative h-full overflow-hidden"
                style={{ width: `${100 / slots}%` }}
              >
                {banner.image && (
                  <Image
                    src={banner.image}
                    alt={banner.imageAlt}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                )}
              </div>
            ))}
            {hasClone && (
              <div
                data-hero-image-slide
                className="relative h-full overflow-hidden"
                style={{ width: `${100 / slots}%` }}
              >
                {banners[0].image && (
                  <Image
                    src={banners[0].image}
                    alt={banners[0].imageAlt}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banner content track - all banners are mounted at once, side by
          side, and the track above slides to the active one. */}
      <div className="relative w-full overflow-hidden">
        <div ref={trackRef} className="flex" style={{ width: `${slots * 100}%` }}>
          {banners.map((banner, i) => (
            <div
              key={i}
              data-hero-slide
              aria-hidden={i !== active}
              inert={i !== active ? true : undefined}
              className="flex flex-col items-center"
              style={{ width: `${100 / slots}%` }}
            >
              <div className="relative w-full max-w-5xl">
                <div className="flex flex-col items-center">
                  <p data-hero-rise className="mb-5 text-eyebrow uppercase text-ink/50">
                    {banner.eyebrow}
                  </p>
                  <AnimatedHeadline
                    as={i === 0 ? "h1" : "h2"}
                    text={banner.headline}
                    highlight={banner.highlight}
                    mode="load"
                    delay={0.1}
                    className="text-display text-navy"
                  />
                  <p data-hero-rise className="mt-6 max-w-xl text-body text-ink/60 sm:mt-8">
                    {banner.subline}
                  </p>
                  <div
                    data-hero-rise
                    className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10"
                  >
                    <MagneticCTA href={banner.primary.href}>
                      {banner.primary.label}
                    </MagneticCTA>
                    <Button
                      href={banner.secondary.href}
                      variant="ghost"
                      className="hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                    >
                      {banner.secondary.label}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {hasClone && (
            <div
              data-hero-slide
              aria-hidden
              inert={true}
              className="flex flex-col items-center"
              style={{ width: `${100 / slots}%` }}
            >
              <div className="relative w-full max-w-5xl">
                <div className="flex flex-col items-center">
                  <p className="mb-5 text-eyebrow uppercase text-ink/50">
                    {banners[0].eyebrow}
                  </p>
                  <AnimatedHeadline
                    as="h2"
                    text={banners[0].headline}
                    highlight={banners[0].highlight}
                    mode="load"
                    delay={0.1}
                    className="text-display text-navy"
                  />
                  <p className="mt-6 max-w-xl text-body text-ink/60 sm:mt-8">
                    {banners[0].subline}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10">
                    <Button href={banners[0].primary.href}>{banners[0].primary.label}</Button>
                    <Button href={banners[0].secondary.href} variant="ghost">
                      {banners[0].secondary.label}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dots + signature - fade out on scroll */}
      <div ref={cueWrapRef} className="absolute inset-x-0 bottom-8">
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            {banners.map((banner, i) => (
              <button
                key={i}
                type="button"
                aria-current={i === active}
                aria-label={`Show banner ${i + 1}: ${banner.eyebrow}`}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 focus-visible:ring-offset-2 ${
                  i === active
                    ? "w-8 bg-navy"
                    : "w-2 bg-ink/20 hover:scale-125 hover:bg-ink/40"
                }`}
              />
            ))}
          </div>
          <p className="text-sm tracking-[0.18em] text-ink/60">{site.signature}</p>
        </div>
      </div>
    </section>
  );
}
