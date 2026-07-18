import { services } from "@/lib/content/services";
import Reveal from "@/components/ui/Reveal";

/**
 * The three service offerings as numbered editorial splits.
 */
export default function ServiceBlocks() {
  return (
    <div className="mx-auto mt-20 max-w-content space-y-16 px-6 md:px-10">
      {services.items.map((service, i) => (
        <Reveal
          key={service.title}
          as="section"
          className="grid gap-8 border-t border-ink/10 pt-12 md:grid-cols-2"
        >
          <div>
            <span className="text-sm font-light text-ink/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-2 text-title-sm text-navy">{service.title}</h2>
          </div>
          <div>
            <p className="text-body text-ink/70">{service.summary}</p>
            <ul className="mt-6 space-y-3">
              {service.points.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm text-ink/60"
                >
                  <span
                    className="h-0.5 w-4 shrink-0 bg-gradient-brand"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
