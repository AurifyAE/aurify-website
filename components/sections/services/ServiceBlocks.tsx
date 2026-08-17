import { services } from "@/lib/content/services";
import Reveal from "@/components/ui/Reveal";

function ServiceNumber({ children }: { children: string }) {
  return (
    <span className="font-mono text-xs font-medium tracking-[0.2em] text-blue">
      {children}
    </span>
  );
}

/**
 * Three related offers, each with its own editorial composition. The layouts
 * shift from transformation path, to consultancy map, to modular build system
 * so the page does not read as a repeated stack of identical cards.
 */
export default function ServiceBlocks() {
  const [transformation, consultancy, development] = services.items;

  return (
    <div className="mt-24 space-y-section md:mt-32">
      <Reveal
        as="section"
        className="mx-auto grid max-w-content gap-12 px-6 md:grid-cols-12 md:px-10"
      >
        <header className="md:col-span-5 md:pr-10">
          <div className="flex items-center gap-4">
            <ServiceNumber>01</ServiceNumber>
            <span className="h-px flex-1 bg-navy/15" aria-hidden />
          </div>
          <h2 className="mt-8 max-w-md text-title text-navy">
            {transformation.title}
          </h2>
          <p className="mt-6 max-w-md text-body text-ink/65">
            {transformation.summary}
          </p>
        </header>

        <div className="relative md:col-span-7 md:pt-14">
          <div
            className="absolute bottom-8 left-[1.1875rem] top-20 hidden w-px bg-navy/10 sm:block"
            aria-hidden
          />
          <ol className="space-y-3">
            {transformation.points.map((point, index) => (
              <li
                key={point}
                className="relative grid gap-4 bg-paper px-5 py-6 sm:grid-cols-[2.5rem_1fr] sm:items-center sm:gap-6 sm:px-7"
              >
                <span className="relative z-10 flex h-10 w-10 items-center justify-center bg-white font-mono text-xs tabular-nums text-blue ring-1 ring-navy/10">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-medium text-navy">{point}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <section className="relative overflow-hidden bg-mist py-section-sm">
        <div
          className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgb(var(--navy)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--navy)/0.05)_1px,transparent_1px)] [background-size:4rem_4rem]"
          aria-hidden
        />
        <Reveal className="relative mx-auto max-w-content px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <header className="md:col-span-5">
              <ServiceNumber>02</ServiceNumber>
              <h2 className="mt-6 text-title text-navy">
                {consultancy.title}
              </h2>
            </header>
            <p className="max-w-measure text-body text-ink/65 md:col-span-6 md:col-start-7">
              {consultancy.summary}
            </p>
          </div>

          <ol className="relative mt-14 grid gap-4 md:grid-cols-3 md:gap-0">
            <span
              className="absolute left-[16.667%] right-[16.667%] top-5 hidden border-t border-dashed border-blue/30 md:block"
              aria-hidden
            />
            {consultancy.points.map((point, index) => (
              <li
                key={point}
                className="relative grid grid-cols-[2.5rem_1fr] items-center gap-5 bg-white/70 p-5 backdrop-blur-sm md:block md:bg-transparent md:p-0 md:text-center md:backdrop-blur-none"
              >
                <span className="relative z-10 flex h-10 w-10 items-center justify-center bg-navy font-mono text-xs tabular-nums text-white md:mx-auto">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-medium text-navy md:mx-auto md:mt-6 md:max-w-[13rem]">
                  {point}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <Reveal
        as="section"
        className="mx-auto max-w-content px-6 md:px-10"
      >
        <div className="border-t border-navy/15 pt-10">
          <div className="grid gap-8 md:grid-cols-12">
            <header className="md:col-span-5">
              <ServiceNumber>03</ServiceNumber>
              <h2 className="mt-5 max-w-lg text-title text-navy">
                {development.title}
              </h2>
            </header>

            <div className="md:col-span-6 md:col-start-7">
              <p className="max-w-measure text-body text-ink/65">
                {development.summary}
              </p>
              <ul className="mt-8 border-t border-navy/10">
                {development.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-4 border-b border-navy/10 py-4 text-sm text-ink/60"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 bg-blue" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
