import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { eInvoicingFaq } from "@/lib/content/e-invoicing";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

/**
 * FAQ accordion on native <details>, so it works without JS and every
 * answer stays in the server HTML for search engines (the page also emits
 * matching FAQPage structured data).
 */
export default function EInvoicingFaq() {
  return (
    <section className="bg-paper py-section">
      <div className="mx-auto grid max-w-content gap-12 px-6 md:px-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionHeading eyebrow={eInvoicingFaq.eyebrow} title={eInvoicingFaq.title} />

        <Reveal stagger className="divide-y divide-ink/10 border-y border-ink/10">
          {eInvoicingFaq.items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left font-medium text-navy transition-colors hover:text-blue [&::-webkit-details-marker]:hidden">
                {item.q}
                <HugeiconsIcon
                  icon={Add01Icon}
                  className="h-5 w-5 shrink-0 text-ink/40 transition-transform duration-300 ease-out-expo group-open:rotate-45"
                  strokeWidth={1.8}
                  aria-hidden
                />
              </summary>
              <p className="max-w-measure pb-6 text-body text-ink/60">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
