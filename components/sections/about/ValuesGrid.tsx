import { about } from "@/lib/content/about";
import Reveal from "@/components/ui/Reveal";

export default function ValuesGrid() {
  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <h2 className="text-eyebrow uppercase text-ink/60">{about.values.title}</h2>
      <Reveal stagger className="mt-10 grid gap-10 md:grid-cols-3">
        {about.values.items.map((value) => (
          <div key={value.name}>
            <span className="block h-0.5 w-8 bg-gradient-brand" aria-hidden />
            <h3 className="mt-4 font-medium text-navy">{value.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              {value.line}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
