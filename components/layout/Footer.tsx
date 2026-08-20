"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Facebook02Icon,
  InstagramIcon,
  Linkedin02Icon,
} from "@hugeicons/core-free-icons";
import { site } from "@/lib/content/site";
import { useNavbarDarkZone } from "@/lib/hooks/useNavbarDarkZone";
import { BrochureDownloadButton } from "@/components/brochure/BrochureDownloadProvider";

type FooterColumn = {
  title: string;
  links: readonly { label: string; href: string }[];
};

const SOCIAL_ICONS = {
  LinkedIn: Linkedin02Icon,
  Instagram: InstagramIcon,
  Facebook: Facebook02Icon,
} as const;

/**
 * Mega-footer on brand navy: tagline, sitemap columns, office contact.
 *
 * The footer swaps one entry while browsing /connect: off Connect it links
 * to the module and hides its legal pages (privacy, terms, data deletion -
 * they govern the WhatsApp module, not the company); on Connect it drops
 * the now-redundant self-link and surfaces those legal pages instead.
 */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const onConnectPage = pathname?.startsWith("/connect") ?? false;

  useNavbarDarkZone(footerRef);

  const footerColumns: FooterColumn[] = onConnectPage
    ? [
        ...site.footer.columns.map((col) => ({
          ...col,
          links: col.links.filter((link) => link.href !== "/connect"),
        })),
        site.footer.connectColumn,
      ]
    : [...site.footer.columns];

  return (
    <footer ref={footerRef} className="border-t border-white/10 bg-navy text-white">
      <div className="mx-auto max-w-wide px-6 py-20 md:px-10 md:py-28">
        {/* Tagline block */}
        <div className="max-w-measure">
          <p className="text-title-sm text-white">{site.tagline}</p>
          <p className="mt-3 text-sm tracking-[0.18em] text-white/60">
            {site.signature}
          </p>
          <BrochureDownloadButton
            source="footer"
            variant="light"
            className="mt-7"
          />
        </div>

        {/* Columns */}
        {/* Logo block spans 2, so the track count follows the column count */}
        <div
          className={`mt-16 grid gap-12 border-t border-white/10 pt-12 ${
            onConnectPage ? "md:grid-cols-5" : "md:grid-cols-4"
          }`}
        >
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
            <nav className="mt-7" aria-label="Social media">
              <ul className="flex items-center gap-3">
                {site.footer.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow ${site.shortName} on ${social.label}`}
                      className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition-[transform,background-color,color,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-navy active:translate-y-0 active:scale-[0.98]"
                    >
                      <HugeiconsIcon
                        icon={SOCIAL_ICONS[social.label]}
                        className="h-5 w-5"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {footerColumns.map((col) => (
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
              target="_blank"
              rel="noopener noreferrer"
              className="underline-gradient transition-colors duration-300 hover:text-white"
            >
              {site.contact.email}
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
