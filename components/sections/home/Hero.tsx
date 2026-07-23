"use client";

import { useEffect, useRef, useState } from "react";
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
import GradientMesh from "@/components/ui/GradientMesh";

const AUTO_ADVANCE_MS = 6000;
const banners = hero.banners;

/**
 * §1 — The Statement, now a three-banner carousel. White background with the
 * ambient gradient mesh (as in the original hero); masked headline copy
 * crossfades between banners on top. Auto-advances every 6s, pauses on
 * hover/focus, and holds a static slide under reduced motion. Dots give
 * manual control; the dots + signature line fade out over the first 240px of
 * scroll. If a banner.image is set, it crossfades in behind the mesh.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cueWrapRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const [active, setActive] = useState(0);

  // Auto-advance. Disabled under reduced motion; paused while the hero is
  // hovered or focused. Keying the effect on `active` restarts the timer on
  // every change (auto or manual) so the cadence resets from the last move.
  useEffect(() => {
    if (banners.length < 2) return;
    if (window.matchMedia(MOTION_REDUCED).matches) return;
    const id = window.setInterval(() => {
      if (!hoverRef.current && !focusRef.current) {
        setActive((i) => (i + 1) % banners.length);
      }
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  // Content entrance — replays each time the active banner changes (the
  // content block is keyed by `active`, so AnimatedHeadline remounts too).
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
    { scope: contentRef, dependencies: [active] }
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

  const activeBanner = banners[active];

  return (
    <section
      ref={sectionRef}
      aria-label="Aurify highlights"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      onFocusCapture={() => (focusRef.current = true)}
      onBlurCapture={() => (focusRef.current = false)}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-24 text-center"
    >
      <GradientMesh />

      {/* Optional background photos — crossfade between banners. Only used
          once a banner.image is set; otherwise this renders nothing and the
          mesh above is the whole background, as in the original hero. */}
      {banners.map(
        (banner, i) =>
          banner.image && (
            <div
              key={i}
              aria-hidden
              className={`absolute inset-0 transition-opacity duration-1000 ease-out-expo ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={banner.image}
                alt={banner.imageAlt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          )
      )}

      {/* Active banner content — keyed so the entrance replays on change. */}
      <div key={active} ref={contentRef} className="relative flex flex-col items-center">
        <p data-hero-rise className="mb-5 text-eyebrow uppercase text-ink/50">
          {activeBanner.eyebrow}
        </p>
        <AnimatedHeadline
          as={active === 0 ? "h1" : "h2"}
          text={activeBanner.headline}
          highlight={activeBanner.highlight}
          mode="load"
          delay={0.1}
          className="max-w-5xl text-display text-navy"
        />
        <p data-hero-rise className="mt-6 max-w-xl text-body text-ink/60 sm:mt-8">
          {activeBanner.subline}
        </p>
        <div
          data-hero-rise
          className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10"
        >
          <Button href={activeBanner.primary.href}>{activeBanner.primary.label}</Button>
          <Button href={activeBanner.secondary.href} variant="ghost">
            {activeBanner.secondary.label}
          </Button>
        </div>
      </div>

      {/* Dots + signature — fade out on scroll */}
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
                  i === active ? "w-8 bg-navy" : "w-2 bg-ink/20 hover:bg-ink/40"
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
