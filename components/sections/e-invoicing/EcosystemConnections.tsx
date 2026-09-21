import Link from "next/link";
import { eInvoicingEcosystem } from "@/lib/content/e-invoicing";
import { ArrowUpRightIcon, ProductIcon } from "@/components/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

/** How e-invoicing plugs into each Aurify product - cards link through. */
export default function EcosystemConnections() {
  return (
    <section className="mx-auto max-w-content px-6 py-section md:px-10">
      <SectionHeading
        eyebrow={eInvoicingEcosystem.eyebrow}
        title={eInvoicingEcosystem.title}
        body={eInvoicingEcosystem.body}
      />

      <Reveal stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {eInvoicingEcosystem.products.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="group relative flex flex-col rounded-3xl border border-ink/10 bg-white p-7 transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-blue/30 hover:shadow-[0_20px_50px_rgb(14_26_57_/_0.08)]"
          >
            <ArrowUpRightIcon className="absolute right-6 top-6 h-5 w-5 opacity-40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
            <ProductIcon name={product.icon} className="h-8 w-8" />
            <h3 className="mt-6 text-title-sm text-navy">{product.name}</h3>
            <p className="mt-1 text-eyebrow uppercase text-ink/50">{product.category}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">{product.summary}</p>
          </Link>
        ))}
      </Reveal>

      <Reveal className="mt-14 text-center">
        <p className="text-title-sm text-navy">{eInvoicingEcosystem.closing}</p>
        <p className="mt-2 text-title-sm font-light text-gradient">
          {eInvoicingEcosystem.closingSub}
        </p>
      </Reveal>
    </section>
  );
}
