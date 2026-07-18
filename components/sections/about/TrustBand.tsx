import { about } from "@/lib/content/about";
import Reveal from "@/components/ui/Reveal";

/**
 * Compliance, ESG & Trust (content sheet §14) — paper editorial band.
 */
export default function TrustBand() {
  const [lead, ...rest] = about.trust.paragraphs;

  return (
    <section className="mt-28 bg-paper py-section-sm">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <Reveal className="max-w-3xl">
          <h2 className="text-eyebrow uppercase text-ink/60">
            {about.trust.title}
          </h2>
          <p className="mt-6 text-title-sm font-light leading-normal text-ink/80">
            {lead}
          </p>
          {rest.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-5 text-body text-ink/60"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
