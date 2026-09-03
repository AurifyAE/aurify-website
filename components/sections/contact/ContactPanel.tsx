"use client";

import { contact } from "@/lib/content/contact";
import { site } from "@/lib/content/site";
import ContactForm from "@/components/contact/ContactForm";
import Reveal from "@/components/ui/Reveal";

/**
 * Offices and the shared contact form. The form is also reused by the
 * timed demo dialog so validation and submission behavior stay identical.
 */
export default function ContactPanel() {
  return (
    <section className="mx-auto mt-16 grid max-w-content items-start gap-12 px-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:px-10">
      <Reveal stagger>
        {contact.offices.map((office) => (
          <div key={office.city} className="border-t border-ink/10 py-8">
            <div className="flex items-baseline gap-3">
              <h2 className="text-title-sm text-navy">{office.city}</h2>
              <span className="text-eyebrow uppercase text-ink/60">
                {office.role}
              </span>
            </div>
            <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed text-ink/60">
              {office.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {office.phone && (
                <p className="pt-2">
                  <a
                    href={office.phoneHref}
                    className="underline-gradient text-blue transition-colors duration-300 hover:text-navy"
                  >
                    {office.phone}
                  </a>
                </p>
              )}
            </address>
          </div>
        ))}
        <p className="border-t border-ink/10 pt-8 text-sm leading-relaxed text-ink/60">
          Prefer email?{" "}
          <a
            href={site.contact.emailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-gradient text-blue transition-colors duration-300 hover:text-navy"
          >
            {site.contact.email}
          </a>
        </p>
      </Reveal>

      <Reveal delay={0.15}>
        <ContactForm />
      </Reveal>
    </section>
  );
}
