import { connectIdealFor } from "@/lib/content/connect";
import Marquee from "@/components/ui/Marquee";

/**
 * "Ideal for" audience list, styled as the same two-row counter-scrolling
 * marquee used on the homepage's Who We Serve section rather than the
 * static chip row (AudienceChips) used on the four core product pages.
 */
export default function IdealForMarquee() {
  const [rowOne, rowTwo] = connectIdealFor.rows;

  return (
    <section className="mt-28 overflow-hidden">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <h2 className="text-eyebrow uppercase text-ink/60">Ideal for</h2>
      </div>
      <div className="mt-10 space-y-2">
        <Marquee items={rowOne} direction="left" duration={170} />
        <div className="-mt-4 md:-mt-6">
          <Marquee items={rowTwo} direction="right" duration={185} />
        </div>
      </div>
    </section>
  );
}
