"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/content/site";
import Button from "@/components/ui/Button";
import { useLenis } from "@/components/providers/AppProviders";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const lenis = useLenis();
  const reduced = usePrefersReducedMotion();

  // Lock page scroll while the menu is open
  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [open, lenis]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-menu flex flex-col bg-white px-6 pb-10 pt-16 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-3 flex h-10 w-10 items-center justify-center text-navy"
            aria-label="Close menu"
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
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <nav className="mt-10 flex flex-col gap-2" aria-label="Mobile">
            {site.nav.map((item, i) => (
              <motion.div
                key={item.href}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.06 * i, ease: "easeOut" }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block py-3 text-title-sm text-navy"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="mt-auto">
            <Button href={site.navCta.href} className="w-full">
              {site.navCta.label}
            </Button>
            <p className="mt-6 text-center text-sm tracking-wide text-ink/60">
              {site.signature}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
