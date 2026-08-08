import { legal } from "@/lib/content/legal";
import Reveal from "@/components/ui/Reveal";

const { meta, intro, sections } = legal.dataDeletion;

const bulletCls = "flex items-start gap-3 text-body text-ink/70";
const dotCls = "mt-2.5 h-1 w-1 flex-none rounded-full bg-blue";

/**
 * Full data-deletion body: meta strip, sticky table-of-contents, and
 * numbered sections. Data-driven off lib/content/legal so future revisions
 * only touch the content file.
 */
export default function DataDeletionBody() {
  return (
    <section className="mx-auto mt-16 max-w-content px-6 md:px-10">
      <Reveal>
        <dl className="flex flex-wrap gap-x-10 gap-y-2 border-y border-ink/10 py-6 text-sm">
          <div className="flex gap-2">
            <dt className="font-medium text-navy">Product</dt>
            <dd className="text-ink/60">{meta.product}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-navy">Company</dt>
            <dd className="text-ink/60">{meta.company}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-navy">Last Updated</dt>
            <dd className="text-ink/60">{meta.lastUpdated}</dd>
          </div>
        </dl>
      </Reveal>

      <div className="mt-16 grid items-start gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)]">
        {/* Table of contents */}
        <Reveal className="md:sticky md:top-28">
          <h2 className="text-eyebrow uppercase text-ink/60">Contents</h2>
          <ol className="mt-4 space-y-2 border-l border-ink/10 pl-4">
            {sections.map((section) => (
              <li key={section.number}>
                <a
                  href={`#section-${section.number}`}
                  className="underline-gradient text-sm text-ink/70 transition-colors duration-300 hover:text-navy"
                >
                  {section.number}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Body */}
        <div className="space-y-16">
          <Reveal>
            <div className="space-y-6">
              {intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-body text-ink/70">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          {sections.map((section) => (
            <Reveal key={section.number} as="section">
              <div id={`section-${section.number}`} className="scroll-mt-28">
                <h2 className="text-title-sm text-navy">
                  <span className="text-blue">{section.number}.</span> {section.title}
                </h2>

                {section.paragraphs && (
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)} className="text-body text-ink/70">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {section.definitions && (
                  <dl className="mt-6 space-y-4">
                    {section.definitions.map((definition) => (
                      <div key={definition.term}>
                        <dt className="font-medium text-navy">{definition.term}</dt>
                        <dd className="mt-1 text-body text-ink/70">{definition.text}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.items && (
                  <ul className="mt-4 space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className={bulletCls}>
                        <span className={dotCls} aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections && (
                  <div className="mt-8 space-y-8">
                    {section.subsections.map((subsection) => (
                      <div key={subsection.title}>
                        <h3 className="font-medium text-navy">{subsection.title}</h3>
                        {subsection.intro && (
                          <p className="mt-2 text-body text-ink/70">{subsection.intro}</p>
                        )}
                        {subsection.items && (
                          <ul className="mt-3 space-y-2">
                            {subsection.items.map((item) => (
                              <li key={item} className={bulletCls}>
                                <span className={dotCls} aria-hidden />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {subsection.outro && (
                          <p className="mt-3 text-sm text-ink/60">{subsection.outro}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {section.outro && (
                  <p className="mt-4 text-body text-ink/70">{section.outro}</p>
                )}

                {section.contact && (
                  <div className="mt-6 space-y-2 rounded-2xl bg-paper p-6 text-body text-ink/70">
                    {section.contact.label && (
                      <p className="font-medium text-navy">{section.contact.label}</p>
                    )}
                    <p>Company: {section.contact.company}</p>
                    <p>
                      Email:{" "}
                      <a
                        href={section.contact.emailHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-gradient text-blue transition-colors duration-300 hover:text-navy"
                      >
                        {section.contact.email}
                      </a>
                    </p>
                    {section.contact.address && <p>Address: {section.contact.address}</p>}
                    {section.contact.note && (
                      <p className="text-sm text-ink/60">{section.contact.note}</p>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
