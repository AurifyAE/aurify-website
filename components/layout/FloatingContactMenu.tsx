"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  Cancel01Icon,
  CustomerService02Icon,
  FormIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { site } from "@/lib/content/site";

/**
 * Fixed contact speed dial. The primary control reveals direct call,
 * WhatsApp, and enquiry actions without competing with page CTAs.
 */
export default function FloatingContactMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHoverClose = () => {
    if (!hoverCloseTimer.current) return;
    clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = null;
  };

  const scheduleHoverClose = () => {
    cancelHoverClose();
    hoverCloseTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => () => cancelHoverClose(), []);

  const actionClass =
    "group flex h-12 items-center gap-3 rounded-full border border-navy/10 bg-white py-1.5 pl-4 pr-1.5 text-sm font-medium text-navy shadow-[0_12px_32px_rgb(var(--navy)/0.16)] transition-[opacity,transform,background-color,color,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-navy hover:text-white hover:shadow-[0_16px_36px_rgb(var(--navy)/0.22)] active:translate-y-0 active:scale-[0.98]";
  const iconClass =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-blue transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white";

  return (
    <div
      ref={menuRef}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") cancelHoverClose();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") scheduleHoverClose();
      }}
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end md:bottom-8 md:right-8"
    >
      <div
        id="floating-contact-actions"
        aria-hidden={!open}
        className={`mb-3 flex flex-col items-end gap-2 transition-[opacity,transform] duration-300 ease-out-expo ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <a
          href={site.contact.phoneHref}
          className={`${actionClass} ${
            open ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
          }`}
          style={{ transitionDelay: open ? "100ms" : "0ms" }}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span>Call</span>
          <span className={iconClass} aria-hidden>
            <HugeiconsIcon icon={Call02Icon} className="h-5 w-5" strokeWidth={1.8} />
          </span>
        </a>

        <a
          href={site.contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${actionClass} ${
            open ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
          }`}
          style={{ transitionDelay: open ? "60ms" : "0ms" }}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span>WhatsApp</span>
          <span className={iconClass} aria-hidden>
            <HugeiconsIcon icon={WhatsappIcon} className="h-5 w-5" strokeWidth={1.8} />
          </span>
        </a>

        <Link
          href="/contact"
          className={`${actionClass} ${
            open ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
          }`}
          style={{ transitionDelay: open ? "20ms" : "0ms" }}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span>Enquiry form</span>
          <span className={iconClass} aria-hidden>
            <HugeiconsIcon icon={FormIcon} className="h-5 w-5" strokeWidth={1.8} />
          </span>
        </Link>
      </div>

      <button
        type="button"
        aria-controls="floating-contact-actions"
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Open contact options"}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            cancelHoverClose();
            setOpen(true);
          }
        }}
        onClick={() => setOpen((current) => !current)}
        className="group flex h-14 items-center gap-3 rounded-full border border-white/15 bg-navy p-1.5 text-white shadow-[0_16px_40px_rgb(var(--navy)/0.25)] transition-[transform,background-color,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:bg-blue hover:shadow-[0_20px_48px_rgb(var(--navy)/0.32)] active:translate-y-0 active:scale-[0.98] md:pr-5"
      >
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover:bg-white/15">
          <HugeiconsIcon
            icon={CustomerService02Icon}
            className={`absolute h-6 w-6 transition-[opacity,transform] duration-300 ease-out-expo ${
              open ? "rotate-45 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
            strokeWidth={1.8}
            aria-hidden
          />
          <HugeiconsIcon
            icon={Cancel01Icon}
            className={`absolute h-6 w-6 transition-[opacity,transform] duration-300 ease-out-expo ${
              open ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-75 opacity-0"
            }`}
            strokeWidth={1.8}
            aria-hidden
          />
        </span>
        <span className="hidden whitespace-nowrap text-sm font-medium md:block">
          Contact us
        </span>
      </button>
    </div>
  );
}
