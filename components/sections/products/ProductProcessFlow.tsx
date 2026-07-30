import Reveal from "@/components/ui/Reveal";

interface ProductProcessFlowProps {
  steps: { step: string; summary: string }[];
  /** Section eyebrow - defaults to "Process flow" for the product template */
  title?: string;
}

/** Column count keyed to the exact step count so the band always spans edge-to-edge. */
const GRID_COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

/**
 * Refine X process flow - gate to vault as a numbered band.
 */
export default function ProductProcessFlow({
  steps,
  title = "Process flow",
}: ProductProcessFlowProps) {
  const gridCols = GRID_COLS[steps.length] ?? "md:grid-cols-4";

  return (
    <section className="mt-28 bg-paper py-section-sm">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <h2 className="text-eyebrow uppercase text-ink/60">{title}</h2>
        <Reveal stagger className={`mt-10 grid gap-10 ${gridCols}`}>
          {steps.map((item, i) => (
            <div key={item.step} className="border-t border-ink/10 pt-4">
              <span className="text-sm font-light text-ink/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-medium text-navy">{item.step}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {item.summary}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
