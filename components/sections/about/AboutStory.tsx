import { about } from "@/lib/content/about";
import Reveal from "@/components/ui/Reveal";

/**
 * Founder story with the name-origin aside pinned alongside (CSS sticky).
 */
export default function AboutStory() {
  return (
    <section className="mx-auto mt-24 max-w-content px-6 md:px-10">
      <div className="grid items-start gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <Reveal>
          <h2 className="text-eyebrow uppercase text-ink/60">
            {about.story.title}
          </h2>
          <div className="mt-6 space-y-6">
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-body text-ink/70">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="rounded-2xl bg-paper p-8 md:sticky md:top-28">
          <span className="block h-0.5 w-8 bg-gradient-brand" aria-hidden />
          <h3 className="mt-4 font-medium text-navy">{about.name.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            {about.name.text}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
