"use client";

import { useRef } from "react";
import { about } from "@/lib/content/about";
import Reveal from "@/components/ui/Reveal";
import { useNavbarDarkZone } from "@/lib/hooks/useNavbarDarkZone";

/**
 * The kakugo principle — the about page's single dark editorial moment.
 */
export default function Approach() {
  const [lead, ...rest] = about.approach.paragraphs;
  const sectionRef = useRef<HTMLElement>(null);

  useNavbarDarkZone(sectionRef);

  return (
    <section ref={sectionRef} className="mt-28 bg-ink py-section-sm text-white">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <Reveal>
          <h2 className="text-eyebrow uppercase text-sky">
            {about.approach.title}
          </h2>
          <p className="mt-8 max-w-3xl text-title-sm font-light leading-normal text-white/80">
            {lead}
          </p>
          {rest.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-6 max-w-3xl text-body text-white/60"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
