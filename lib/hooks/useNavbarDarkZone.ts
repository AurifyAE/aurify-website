"use client";

import type { RefObject } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

// Roughly the fixed navbar's tallest (desktop) height — the band a section
// crosses while it sits directly behind the header.
const NAV_ZONE = 80;

export const NAVBAR_THEME_EVENT = "navbar-theme-zone";

/**
 * Marks a full-bleed dark section as a "dark zone" for the navbar. While the
 * section is scrolled behind the fixed header, it dispatches a window event
 * carrying its active/inactive state; Navbar listens and flips its own
 * light/dark theme accordingly. Decoupled via a DOM event (rather than the
 * section reaching into Navbar, or vice versa) so it doesn't matter whether
 * the section is a static import or one of the dynamic() chunks in
 * app/page.tsx that may not exist in the DOM yet when Navbar mounts.
 */
export function useNavbarDarkZone(ref: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (!ref.current) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: `top top+=${NAV_ZONE}`,
        end: `bottom top+=${NAV_ZONE}`,
        onToggle: (self) => {
          window.dispatchEvent(
            new CustomEvent(NAVBAR_THEME_EVENT, { detail: { active: self.isActive } })
          );
        },
      });
    },
    { scope: ref }
  );
}
