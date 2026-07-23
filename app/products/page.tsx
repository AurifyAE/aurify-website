import type { Metadata } from "next";
import Link from "next/link";
import {
  productOrder,
  products,
  productsPage,
  engagement,
} from "@/lib/content/products";
import { ProductIcon, ArrowRightIcon } from "@/components/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Products",
  description: productsPage.intro,
  openGraph: { title: "The Aurify Product Suite", description: productsPage.intro },
};

/**
 * Suite overview: the four products as one ecosystem, engagement models,
 * closing signature line.
 */
export default function ProductsPage() {
  return (
    <div className="pb-section pt-40">
      <header className="mx-auto max-w-content px-6 md:px-10">
        <SectionHeading
          eyebrow={productsPage.eyebrow}
          title={productsPage.title}
          body={productsPage.intro}
        />
      </header>

      <Reveal
        stagger
        className="mx-auto mt-16 grid max-w-content gap-6 px-6 md:grid-cols-2 md:px-10"
      >
        {productOrder.map((slug) => {
          const product = products[slug];
          return (
            <Link
              key={slug}
              href={`/products/${slug}`}
              className="group rounded-2xl border border-ink/10 p-8 transition-colors duration-300 hover:border-navy/40"
            >
              <ProductIcon name={product.icon} className="h-7 w-7 text-blue" />
              <div className="mt-6 flex items-baseline gap-3">
                <h2 className="text-title-sm text-navy">{product.name}</h2>
                <span className="text-eyebrow uppercase text-ink/60">
                  {product.category}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {product.role}
              </p>
              <ArrowRightIcon className="mt-6 h-5 w-5 opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
            </Link>
          );
        })}
      </Reveal>

      {/* Architecture & engagement models (content sheet §13) */}
      <section className="mt-28 bg-paper py-section-sm">
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
        <Button href="/contact">Talk to Us</Button>
      </Reveal>
    </div>
  );
}
