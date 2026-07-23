"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MOTION_OK, RISE } from "@/lib/animation";
import { lifecycle } from "@/lib/content/home";
import { useLenis } from "@/components/providers/AppProviders";

/**
 * §2 — The Lifecycle Strip. Desktop + motion: the section pins and six
 * stages slide horizontally with a gradient progress line drawing itself
 * across the track. Mobile or reduced motion: a vertical rail layout
 * (separate markup, toggled purely by CSS so SSR stays deterministic).
 */
export default function LifecycleStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const total = String(lifecycle.stages.length).padStart(2, "0");
  // Held in a ref, not a useGSAP dependency: Lenis boots in an effect, so a
  // dependency would tear down and rebuild every trigger in this section the
  // moment it arrives. The snap only needs whatever instance exists when it
  // actually fires.
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Pinned horizontal scroll — only where the horizontal layout is visible
      mm.add(`(min-width: 768px) and ${MOTION_OK}`, () => {
        const track = trackRef.current;
        if (!track) return;
        const steps = lifecycle.stages.length - 1;

        // How far the track travels horizontally...
        const distance = () => track.scrollWidth - window.innerWidth;
        // ...deliberately decoupled from how far the user must scroll to
        // drive it. Mapping the two 1:1 costs a full viewport width of
        // scrolling per stage (~7200px at 1440), which reads as the section
        // being stuck. A stage per 0.6 viewport heights matches the pin
        // budget ProblemInterlude uses.
        const scrollLength = () => steps * window.innerHeight * 0.6;

        const range = {
          trigger: sectionRef.current,
          start: "top top",
          end: () => "+=" + scrollLength(),
          scrub: 0.6,
          invalidateOnRefresh: true,
        } as const;

        // The track tween owns the pin; the line rides the same scroll range.
        const horizontal = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { ...range, pin: true, anticipatePin: 1 },
        });

        // Settle on the nearest stage once the user stops, so the strip
        // lands on a composed panel instead of mid-transition.
        //
        // This is deliberately NOT ScrollTrigger's own `snap`. Lenis and
        // ScrollTrigger would then both be writing scroll position, and they
        // fight: the snap silently eats gestures, leaving the strip frozen
        // on a stage while the user scrolls at it. Driving the snap through
        // lenis.scrollTo keeps Lenis the single owner of scroll — GSAP only
        // reads it — and a user gesture cleanly interrupts an in-flight
        // snap the way Lenis already handles natively.
        const st = horizontal.scrollTrigger;
        let settle: ReturnType<typeof setTimeout>;
        const snapToStage = () => {
          clearTimeout(settle);
          settle = setTimeout(() => {
            // Outside the pin the section is being entered or exited —
            // never pull the user back into it
            if (!st?.isActive) return;
            const stride = (st.end - st.start) / steps;
            const target =
              st.start + Math.round((window.scrollY - st.start) / stride) * stride;
            if (Math.abs(target - window.scrollY) > 2) {
              lenisRef.current?.scrollTo(target, {
                duration: 0.5,
                easing: (t: number) => 1 - Math.pow(1 - t, 3),
              });
            }
          }, 140);
        };
        // Lenis drives the real window scroll, so a native listener sees
        // every scroll without needing the instance up front
        window.addEventListener("scroll", snapToStage, { passive: true });

        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: range }
        );

        // Per-stage reveals are triggered by horizontal position within the
        // track rather than page scroll — that's what containerAnimation buys.
        gsap.utils
          .toArray<HTMLElement>("[data-stage-copy]", track)
          .forEach((copy) => {
            gsap.from(copy, {
              autoAlpha: 0,
              y: RISE,
              duration: DURATION.base,
              ease: EASE.out,
              scrollTrigger: {
                trigger: copy,
                containerAnimation: horizontal,
                start: "left 80%",
                once: true,
              },
            });
          });

        // matchMedia cleanup: this runs when the query stops matching, so the
        // listener must not outlive the desktop layout it belongs to
        return () => {
          clearTimeout(settle);
          window.removeEventListener("scroll", snapToStage);
        };
      });

      // Vertical fallback entrance reveals (small screens, motion OK)
      mm.add(`(max-width: 767px) and ${MOTION_OK}`, () => {
        gsap.utils
          .toArray<HTMLElement>("[data-stage-v]", sectionRef.current)
          .forEach((item) => {
            gsap.from(item, {
              autoAlpha: 0,
              y: RISE,
              duration: DURATION.base,
              ease: EASE.out,
              scrollTrigger: { trigger: item, start: "top 85%", once: true },
            });
          });
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-paper">
      {/* Horizontal pinned strip — desktop with motion */}
      <div className="hidden motion-safe:md:block">
        <div className="relative flex h-svh items-center overflow-hidden">
          <h2 className="absolute left-[12vw] top-28 z-10 text-eyebrow uppercase text-blue">
            {lifecycle.eyebrow}
          </h2>

          <div ref={trackRef} className="relative flex will-change-transform">
            {/* Gradient progress line spanning the full track */}
            <div className="absolute left-0 top-[76%] h-px w-full">
              <div
                ref={lineRef}
                className="h-full w-full origin-left scale-x-0 bg-gradient-brand"
              />
            </div>

            {lifecycle.stages.map((stage, i) => (
              <article
                key={stage.word}
                className="relative flex h-svh w-screen shrink-0 items-center gap-[5vw] px-[12vw]"
              >
                {/* Ghost numeral via pseudo-element content so contrast
                    audits skip the intentionally faint watermark. It is a
                    flex sibling, not an overlay, so it can never land on
                    the copy at any viewport width. */}
                <span
                  aria-hidden
                  data-num={String(i + 1).padStart(2, "0")}
                  className="pointer-events-none shrink-0 select-none text-[13vw] font-light leading-none tracking-tighter text-navy/[0.10] before:content-[attr(data-num)]"
                />

                <div data-stage-copy className="max-w-md">
                  {/* The numeral beside this is decorative, so the stage
                      position is carried here for assistive tech */}
                  <span className="sr-only">{`Stage ${i + 1} of ${lifecycle.stages.length}: `}</span>
                  <h3 className="text-title text-navy">{stage.word}</h3>
                  <p className="mt-4 text-body text-ink/60">{stage.sentence}</p>
                </div>

                {/* Right-side visual */}
                <div
                  aria-hidden
                  className="relative ml-auto aspect-[4/5] w-[20vw] max-w-xs shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-white"
                >
                  <Image
                    src={stage.image}
                    alt={stage.imageAlt}
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical rail — mobile, and any width under reduced motion */}
      <div className="motion-safe:md:hidden">
        <div className="mx-auto max-w-content px-6 py-section md:px-10">
          <h2 className="text-eyebrow uppercase text-blue">{lifecycle.eyebrow}</h2>
          <div className="relative mt-12 space-y-16 pl-8">
            <span
              aria-hidden
              className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-navy via-blue to-sky"
            />
            {lifecycle.stages.map((stage, i) => (
              <article data-stage-v key={stage.word} className="relative">
                <p className="text-eyebrow tabular-nums text-blue">
                  {String(i + 1).padStart(2, "0")}
                  <span className="text-ink/30">
                    {" / "}
                    {total}
                  </span>
                </p>
                <h3 className="mt-2 text-title-sm text-navy">{stage.word}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/60">
                  {stage.sentence}
                </p>

                {/* Visual */}
                <div
                  aria-hidden
                  className="relative mt-6 aspect-[16/10] w-full max-w-xs overflow-hidden rounded-2xl border border-ink/10 bg-white"
                >
                  <Image
                    src={stage.image}
                    alt={stage.imageAlt}
                    fill
                    sizes="(min-width: 768px) 320px, 90vw"
                    className="object-cover"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
