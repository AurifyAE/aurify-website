import type { ProductDimension } from "@/lib/content/products";
import Reveal from "@/components/ui/Reveal";

interface IQDimensionsProps {
  dimensions: ProductDimension[];
}

/**
 * IQ page only — the Product / Platform / Consultancy three-dimension
 * layout, replacing the "Powered by IQ" band.
 */
export default function IQDimensions({ dimensions }: IQDimensionsProps) {
  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <h2 className="text-eyebrow uppercase text-ink/60">
        IQ works across three dimensions
      </h2>
      <Reveal stagger className="mt-10 grid gap-6 md:grid-cols-3">
        {dimensions.map((dim) => (
          <div key={dim.title} className="rounded-2xl bg-paper p-8">
            <span className="block h-0.5 w-8 bg-gradient-brand" aria-hidden />
            <h3 className="mt-4 text-title-sm text-navy">{dim.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              {dim.summary}
            </p>
            <ul className="mt-5 space-y-2.5 border-t border-ink/5 pt-5">
              {dim.points.map((point) => (
                <li
                  key={point}
                  className="text-sm leading-relaxed text-ink/60"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
