"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/content/site";
import { useNavbarDarkZone } from "@/lib/hooks/useNavbarDarkZone";

/**
 * Mega-footer on brand navy: tagline, sitemap columns, office contact.
 */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useNavbarDarkZone(footerRef);

  return (
    <footer ref={footerRef} className="border-t border-white/10 bg-navy text-white">
      <div className="mx-auto max-w-wide px-6 py-20 md:px-10 md:py-28">
        {/* Tagline block */}
        <div className="max-w-measure">
          <p className="text-title-sm text-white">{site.tagline}</p>
          <p className="mt-3 text-sm tracking-[0.18em] text-white/60">
            {site.signature}
          </p>
        </div>

        {/* Columns */}
        <div className="mt-16 grid gap-12 border-t border-white/10 pt-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="inline-flex"
              aria-label={`${site.name} - home`}
            >
              {/* Mono white treatment on navy */}
              <Image
                src="/logo/aurify-logo.svg"
                alt=""
                width={112}
                height={32}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {site.description}
            </p>
          </div>

          {site.footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-eyebrow uppercase text-white/60">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="underline-gradient text-sm text-white/70 transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact + legal */}
        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <address className="not-italic leading-relaxed">
            {site.contact.address}
            <span className="mx-2 hidden md:inline" aria-hidden>
              ·
            </span>
            <br className="md:hidden" />
            <a
              href={site.contact.phoneHref}
              className="underline-gradient transition-colors duration-300 hover:text-white"
            >
              {site.contact.phone}
            </a>
            <span className="mx-2 hidden md:inline" aria-hidden>
              ·
            </span>
            <br className="md:hidden" />
            <a
              href={site.contact.emailHref}
              className="underline-gradient transition-colors duration-300 hover:text-white"
            >
              {site.domain}
            </a>
          </address>
          <p>
            © {new Date().getFullYear()} {site.footer.legalNote}
          </p>
        </div>
      </div>
    </footer>
  );
}
