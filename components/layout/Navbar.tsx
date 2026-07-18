"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content/site";
import Button from "@/components/ui/Button";

// Deferred until first open so framer-motion stays out of the initial bundle
const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu"), {
  ssr: false,
});

/**
 * Sticky glass navbar. Transparent at top; blur + hairline border once
 * scrolled — toggled via a data attribute set directly on the DOM by
 * ScrollTrigger (never through React state).
 */
export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Mount the menu (and its chunk) only once it has been requested
  const [menuMounted, setMenuMounted] = useState(false);
  const pathname = usePathname();

  useGSAP(
    () => {
      const el = headerRef.current;
      if (!el) return;
      el.dataset.scrolled = String(window.scrollY > 10);
      ScrollTrigger.create({
        start: 10,
        end: "max",
        onToggle: (self) => {
          el.dataset.scrolled = String(self.isActive);
        },
      });
    },
    { scope: headerRef }
  );

  return (
    <>
      <header
        ref={headerRef}
        data-scrolled="false"
        className="fixed inset-x-0 top-0 z-nav border-b border-transparent transition-all duration-300 data-[scrolled=true]:border-ink/5 data-[scrolled=true]:bg-white/75 data-[scrolled=true]:backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-wide items-center justify-between px-6 md:h-[4.5rem] md:px-10">
          <Link
            href="/"
            className="flex items-center"
            aria-label={`${site.name} — home`}
          >
            <Image
              src="/logo/aurify-logo.svg"
              alt=""
              width={98}
              height={28}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {site.nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[0.9375rem] transition-colors duration-300 ${
                    active ? "text-navy" : "text-ink/60 hover:text-navy"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button href={site.navCta.href} className="!px-5 !py-2">
              {site.navCta.label}
            </Button>
          </nav>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => {
              setMenuMounted(true);
              setMenuOpen(true);
            }}
            className="flex h-10 w-10 items-center justify-center text-navy md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </header>

      {menuMounted && (
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}
