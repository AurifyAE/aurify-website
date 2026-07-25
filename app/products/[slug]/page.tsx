import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  productOrder,
  products,
  type ProductSlug,
} from "@/lib/content/products";
import ProductHero from "@/components/sections/products/ProductHero";
import ModuleExplorer from "@/components/sections/products/ModuleExplorer";
import ProductProcessFlow from "@/components/sections/products/ProductProcessFlow";
import RmsArchitecture from "@/components/sections/products/RmsArchitecture";
import RmsOutputs from "@/components/sections/products/RmsOutputs";
import AudienceChips from "@/components/sections/products/AudienceChips";
import PoweredByIQ from "@/components/sections/products/PoweredByIQ";
import IQDimensions from "@/components/sections/products/IQDimensions";
import ProductCrossLinks from "@/components/sections/products/ProductCrossLinks";
import Reveal from "@/components/ui/Reveal";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return productOrder.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products[slug as ProductSlug];
  if (!product) return {};
  return {
    title: `${product.name} - ${product.category}`,
    description: product.intro,
    openGraph: {
      title: `Aurify ${product.name}`,
      description: product.intro,
    },
  };
}

/**
 * Shared product template, composed per-product from lib/content/products:
 * process flow (Refine X), module explorer, architecture + outputs (RMS),
 * three dimensions (IQ) in place of the Powered-by-IQ band.
 */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products[slug as ProductSlug];
  if (!product) notFound();

  return (
    <div className="pb-section">
      <ProductHero
        name={product.name}
        category={product.category}
        role={product.role}
        highlight={product.highlight}
        intro={product.intro}
      />

      {product.processFlow && <ProductProcessFlow steps={product.processFlow} />}

      {product.modules.length > 0 && <ModuleExplorer modules={product.modules} />}

      {product.architecture && (
        <RmsArchitecture architecture={product.architecture} />
      )}

      {product.outputs && <RmsOutputs outputs={product.outputs} />}

      <AudienceChips audiences={product.audiences} />

      {product.dimensions ? (
        <IQDimensions dimensions={product.dimensions} />
      ) : (
        <PoweredByIQ />
      )}

      {product.why && (
        <section className="mx-auto mt-28 max-w-content px-6 md:px-10">
          <Reveal className="max-w-3xl">
            <h2 className="text-eyebrow uppercase text-ink/60">
              {product.why.title}
            </h2>
            <p className="mt-6 text-title-sm font-light leading-normal text-ink/80">
              {product.why.text}
            </p>
          </Reveal>
        </section>
      )}

      <ProductCrossLinks current={product.slug} />
    </div>
  );
}
