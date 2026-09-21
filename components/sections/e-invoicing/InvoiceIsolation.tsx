import { Fragment } from "react";
import { eInvoicingProblem } from "@/lib/content/e-invoicing";
import { ArrowRightIcon } from "@/components/icons";
import Reveal from "@/components/ui/Reveal";

/**
 * "Invoice in isolation" - the scattered transaction elements and the three
 * "No ..." lines sit side by side, then resolve into the single
 * Trade → Invoice → Finance → Compliance chain running full width below.
 */
export default function InvoiceIsolation() {
  return (
    <section className="bg-paper py-section">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="max-w-xl text-title text-navy">{eInvoicingProblem.title}</h2>
            <p className="mt-8 text-title-sm font-light text-ink/80">
              {eInvoicingProblem.lead}
            </p>
            <p className="mt-4 max-w-measure text-body text-ink/60">
              {eInvoicingProblem.body}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Transaction elements">
              {eInvoicingProblem.elements.map((element) => (
                <li
                  key={element}
                  className="rounded-full border border-ink/10 bg-white px-4 py-1.5 text-sm text-ink/70"
                >
                  {element}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal stagger as="ul" className="flex flex-col justify-end space-y-5">
            {eInvoicingProblem.nos.map((line) => (
              <li
                key={line}
                className="border-l-2 border-sky pl-5 text-title-sm font-light text-navy"
              >
                {line}
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal className="mt-20 rounded-3xl bg-gradient-brand p-8 text-white md:p-12">
          <p className="text-body text-white/80">{eInvoicingProblem.bridge}</p>
          <ol
            aria-label="Connected workflow"
            className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          >
            {eInvoicingProblem.chain.map((stage, i) => (
              <Fragment key={stage}>
                {i > 0 && (
                  <li aria-hidden className="hidden flex-1 items-center md:flex">
                    <span className="h-px flex-1 bg-white/30" />
                    <ArrowRightIcon tone="dark" className="h-5 w-5" />
                  </li>
                )}
                <li className="rounded-full bg-white/10 px-6 py-3 text-center text-title-sm backdrop-blur-sm">
                  {stage}
                </li>
              </Fragment>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
