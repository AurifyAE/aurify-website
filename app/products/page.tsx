import type { Metadata } from "next";
import { productsPage, engagement } from "@/lib/content/products";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import Ecosystem from "@/components/sections/home/Ecosystem";

export const metadata: Metadata = {
  title: "Products",
  description: productsPage.intro,
  openGraph: { title: "The Aurify Product Suite", description: productsPage.intro },
};

/**
 * Suite overview: the four products as one ecosystem (the same bento
 * section the homepage uses - the two pages were carrying near-duplicate
 * "one platform, complete control" copy for what was otherwise a plainer
 * grid here), engagement models, closing signature line.
 */
export default function ProductsPage() {
  return (
    <div className="pb-section">
      <Ecosystem />

      {/* Architecture & engagement models (content sheet §13) */}
      <section className="bg-paper py-section-sm">
        <div className="mx-auto max-w-content px-6 md:px-10">
          <SectionHeading
            eyebrow="Engagement"
            title={engagement.title}
            body={engagement.intro}
          />
          <Reveal stagger className="mt-14 grid gap-10 md:grid-cols-4">
            {engagement.items.map((item) => (
              <div key={item.name}>
                <span className="block h-0.5 w-8 bg-gradient-brand" aria-hidden />
                <h3 className="mt-4 font-medium text-navy">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  {item.summary}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Reveal className="mx-auto mt-24 flex max-w-content flex-col items-center gap-8 px-6 text-center md:px-10">
        <p className="text-sm tracking-[0.18em] text-ink/60">
          {productsPage.closing}
        </p>
        <Button href="/contact">Book a Demo</Button>
      </Reveal>
    </div>
  );
}
