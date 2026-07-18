import { about } from "@/lib/content/about";
import Reveal from "@/components/ui/Reveal";

export default function MissionVision() {
  const blocks = [about.mission, about.vision];

  return (
    <section className="mx-auto mt-24 max-w-content px-6 md:px-10">
      <Reveal stagger className="grid gap-12 md:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.title} className="border-t border-ink/10 pt-8">
            <h2 className="text-eyebrow uppercase text-ink/60">{block.title}</h2>
            <p className="mt-4 text-title-sm font-light leading-normal text-navy">
              {block.text}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
