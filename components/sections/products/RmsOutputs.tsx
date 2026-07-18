import Reveal from "@/components/ui/Reveal";

interface RmsOutputsProps {
  outputs: { name: string; summary: string }[];
}

/**
 * RMS key system outputs — editorial two-column list, matching WhyAurify.
 */
export default function RmsOutputs({ outputs }: RmsOutputsProps) {
  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <h2 className="text-eyebrow uppercase text-ink/60">Key system outputs</h2>
      <Reveal stagger className="mt-10 grid gap-x-16 md:grid-cols-2">
        {outputs.map((output, i) => (
          <div
            key={output.name}
            className="flex gap-6 border-t border-ink/10 py-8"
          >
            <span className="text-sm font-light text-ink/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-medium text-navy">{output.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {output.summary}
              </p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
