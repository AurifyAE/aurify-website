"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content/site";
import Button from "@/components/ui/Button";
import { NAVBAR_THEME_EVENT } from "@/lib/hooks/useNavbarDarkZone";

// Deferred until first open so framer-motion stays out of the initial bundle
const MobileMenu = dynamic(() => import("@/components/layout/MobileMenu"), {
  ssr: false,
});

/**
 * Sticky glass navbar. Transparent at top; blur + hairline border once
 * scrolled - toggled via a data attribute set directly on the DOM by
 * ScrollTrigger (never through React state).
 *
 * Theme (light/dark) is the one exception: it drives a Button variant swap,
 * which needs an actual React value, not just a DOM attribute. It's still
 * cheap - full-bleed dark sections dispatch NAVBAR_THEME_EVENT only on
 * enter/leave (see useNavbarDarkZone), not per scroll frame, so this only
 * re-renders a handful of times per page visit. A counter (not a plain
 * boolean) survives sections whose enter/leave events land out of order at
 * their shared boundary.
 */
export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Mount the menu (and its chunk) only once it has been requested
  const [menuMounted, setMenuMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const darkZoneCount = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const onZoneToggle = (e: Event) => {
      const { active } = (e as CustomEvent<{ active: boolean }>).detail;
      darkZoneCount.current += active ? 1 : -1;
      setTheme(darkZoneCount.current > 0 ? "dark" : "light");
    };
    window.addEventListener(NAVBAR_THEME_EVENT, onZoneToggle);
    return () => window.removeEventListener(NAVBAR_THEME_EVENT, onZoneToggle);
  }, []);

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
        data-theme={theme}
        className="fixed inset-x-0 top-0 z-nav border-b border-transparent transition-all duration-300 data-[scrolled=true]:backdrop-blur-xl data-[scrolled=true]:data-[theme=light]:border-ink/5 data-[scrolled=true]:data-[theme=light]:bg-white/75 data-[scrolled=true]:data-[theme=dark]:border-white/10 data-[scrolled=true]:data-[theme=dark]:bg-navy/75"
      >
        <div className="mx-auto flex h-16 max-w-wide items-center justify-between px-6 md:h-[4.5rem] md:px-10">
          <Link
            href="/"
            className="flex items-center"
            aria-label={`${site.name} - home`}
          >
            <Image
              data-nav-logo
              src="/logo/aurify-logo.svg"
              alt=""
              width={98}
              height={28}
              priority
              className="h-10 w-auto transition-all duration-300"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {site.nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-nav-link
                  data-active={active}
                  className={`underline-gradient text-[0.9375rem] transition-colors duration-300 ${
                    active ? "text-navy" : "text-ink/60 hover:text-navy"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button
              href={site.navCta.href}
              variant={theme === "dark" ? "light" : "primary"}
              className="!px-5 !py-2"
            >
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
            data-nav-toggle
            className="flex h-10 w-10 items-center justify-center text-navy transition-colors duration-300 md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <HugeiconsIcon icon={Menu01Icon} className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </header>

      {menuMounted && (
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}
