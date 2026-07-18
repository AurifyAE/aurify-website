import { about } from "@/lib/content/about";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";

/**
 * Team scale stats (count-up) + office cards.
 */
export default function TeamScale() {
  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <h2 className="text-eyebrow uppercase text-ink/60">{about.scale.title}</h2>

      <Reveal stagger className="mt-10 grid gap-10 md:grid-cols-3">
        {about.scale.stats.map((stat) => (
          <div key={stat.label} className="border-t border-ink/10 pt-6">
            <p className="text-title text-navy">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60">
              {stat.label}
            </p>
          </div>
        ))}
      </Reveal>

      <Reveal stagger className="mt-14 grid gap-6 md:grid-cols-2">
        {about.scale.offices.map((office) => (
          <div key={office.city} className="rounded-2xl bg-paper p-8">
            <div className="flex items-baseline gap-3">
              <h3 className="text-title-sm text-navy">{office.city}</h3>
              <span className="text-eyebrow uppercase text-ink/60">
                {office.role}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              {office.detail}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
