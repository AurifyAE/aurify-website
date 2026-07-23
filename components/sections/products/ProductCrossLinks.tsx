import Link from "next/link";
import { productOrder, products, type ProductSlug } from "@/lib/content/products";
import { ProductIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

interface ProductCrossLinksProps {
  current: ProductSlug;
}

/**
 * Sibling products + CTA — the product page's closing row.
 */
export default function ProductCrossLinks({ current }: ProductCrossLinksProps) {
  const siblings = productOrder.filter((slug) => slug !== current);

  return (
    <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
      <Reveal className="flex flex-col gap-10 border-t border-ink/10 pt-12 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Related products" className="flex flex-wrap gap-6">
          {siblings.map((slug) => (
            <Link
              key={slug}
              href={`/products/${slug}`}
              className="underline-gradient group flex items-center gap-2 text-sm text-ink/60 transition-colors duration-300 hover:text-navy"
            >
              <ProductIcon name={products[slug].icon} className="h-4 w-4" />
              {products[slug].name}
            </Link>
          ))}
        </nav>
        <Button href="/contact">Talk to Us</Button>
      </Reveal>
    </section>
  );
}
