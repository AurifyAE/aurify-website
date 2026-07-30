import Link from "next/link";
import { connectCompliance } from "@/lib/content/connect";

/**
 * Meta / WhatsApp Business Platform compliance disclaimer - the section
 * reviewers check first. Sits directly above the global footer rather than
 * inside the main content flow.
 */
export default function ComplianceNotice() {
  return (
    <section className="mx-auto max-w-content px-6 py-10 md:px-10">
      <p className="max-w-3xl text-sm leading-relaxed text-ink/50">
        {connectCompliance.text}{" "}
        {connectCompliance.links.map((link, i) => (
          <span key={link.href}>
            <Link
              href={link.href}
              className="underline-gradient text-ink/70 transition-colors duration-300 hover:text-navy"
            >
              {link.label}
            </Link>
            {i < connectCompliance.links.length - 1 &&
              (i === connectCompliance.links.length - 2 ? ", and " : ", ")}
          </span>
        ))}{" "}
        {connectCompliance.after}
      </p>
    </section>
  );
}
