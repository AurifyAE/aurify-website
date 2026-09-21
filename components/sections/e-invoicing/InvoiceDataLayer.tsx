import { HugeiconsIcon } from "@hugeicons/react";
import { eInvoicingData } from "@/lib/content/e-invoicing";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { eInvoicingIcons } from "./icons";

/**
 * The seven operational data sources behind an invoice, tiled in a 4×2
 * grid whose eighth cell is the "one connected data layer" payoff.
 */
export default function InvoiceDataLayer() {
  return (
    <section className="bg-mist/60 py-section">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <SectionHeading
          eyebrow={eInvoicingData.eyebrow}
          title={eInvoicingData.title}
          body={eInvoicingData.body}
        />

        <Reveal stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {eInvoicingData.sources.map((source) => (
            <div
              key={source.name}
              className="flex flex-col rounded-2xl border border-ink/5 bg-white p-6"
            >
              <HugeiconsIcon
                icon={eInvoicingIcons[source.icon]}
                className="h-6 w-6 text-blue"
                strokeWidth={1.6}
                aria-hidden
              />
              <h3 className="mt-5 font-medium text-navy">{source.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{source.detail}</p>
            </div>
          ))}
          <div className="flex flex-col justify-end rounded-2xl bg-gradient-brand p-6 text-white">
            {eInvoicingData.closing.map((line) => (
              <p key={line} className="text-lg font-medium leading-snug">
                {line}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
