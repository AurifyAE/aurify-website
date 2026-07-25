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
 * a slowly panning brand-tint gradient wash; banners sit side by
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

  // Cursor-parallax on the background gradient wash - a faint drift that
  // rides on top of its own CSS background-position pan, so the two never
  // fight. Heavily damped and range-capped to stay a quiet ambient cue, not
  // a spotlight-follows-cursor gimmick.
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
      {/* Animated background gradient - an oversized diagonal wash of brand
          tints that slowly pans back and forth. Tint alphas stay ≤0.16 over
          white so the navy headline keeps its contrast; reduced motion is
          handled by the global animation kill-switch in globals.css. */}
      <div
        ref={meshRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-gradient-pan bg-[linear-gradient(115deg,rgb(var(--sky)/0.16),rgb(var(--white)/0)_35%,rgb(var(--teal)/0.14)_50%,rgb(var(--white)/0)_65%,rgb(var(--blue)/0.16))] [background-size:220%_220%]"
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
