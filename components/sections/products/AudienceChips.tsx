import Reveal from "@/components/ui/Reveal";

interface AudienceChipsProps {
  audiences: string[];
}

export default function AudienceChips({ audiences }: AudienceChipsProps) {
  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <h2 className="text-eyebrow uppercase text-ink/60">Ideal for</h2>
      <Reveal stagger className="mt-6 flex flex-wrap gap-3">
        {audiences.map((audience) => (
          <span
            key={audience}
            className="rounded-full border border-ink/10 px-5 py-2.5 text-sm text-ink/70"
          >
            {audience}
          </span>
        ))}
      </Reveal>
    </section>
  );
}
