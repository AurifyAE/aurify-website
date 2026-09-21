import { HugeiconsIcon } from "@hugeicons/react";
import { eInvoicingCapabilities } from "@/lib/content/e-invoicing";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { eInvoicingIcons } from "./icons";

/** Six capability cards - what makes the invoicing metal-aware. */
export default function MetalAwareCapabilities() {
  return (
    <section className="mx-auto max-w-content px-6 py-section md:px-10">
      <SectionHeading
        eyebrow={eInvoicingCapabilities.eyebrow}
        title={eInvoicingCapabilities.title}
        body={eInvoicingCapabilities.body}
      />
      <Reveal stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {eInvoicingCapabilities.items.map((item) => (
          <article
            key={item.title}
            className="group rounded-3xl border border-ink/10 bg-white p-8 transition-colors duration-300 ease-out-expo hover:border-blue/30"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-blue transition-colors duration-300 group-hover:bg-blue group-hover:text-white">
              <HugeiconsIcon
                icon={eInvoicingIcons[item.icon]}
                className="h-6 w-6"
                strokeWidth={1.6}
                aria-hidden
              />
            </span>
            <h3 className="mt-6 text-lg font-medium text-navy">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">{item.summary}</p>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
