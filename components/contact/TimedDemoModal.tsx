"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ComputerVideoCallIcon,
} from "@hugeicons/core-free-icons";
import { useLenis } from "@/components/providers/AppProviders";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const MODAL_DELAY_MS = 30_000;
const DIALOG_RETRY_MS = 10_000;
const SESSION_KEY = "aurify-timed-demo-shown";

const ContactForm = dynamic(() => import("@/components/contact/ContactForm"), {
  ssr: false,
  loading: () => (
    <div
      className="mt-3 h-64 animate-pulse rounded-xl bg-paper"
      aria-label="Loading contact form"
      role="status"
    />
  ),
});

function wasShownThisSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberShown() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    // The modal still works when session storage is unavailable.
  }
}

export default function TimedDemoModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();

  const closeDialog = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (wasShownThisSession()) return;

    let timer = 0;
    const tryToOpen = () => {
      if (window.location.pathname.startsWith("/contact")) {
        rememberShown();
        return;
      }

      const anotherDialogIsOpen = document.querySelector(
        '[role="dialog"][aria-modal="true"]'
      );
      if (anotherDialogIsOpen) {
        timer = window.setTimeout(tryToOpen, DIALOG_RETRY_MS);
        return;
      }

      previousFocusRef.current = document.activeElement as HTMLElement | null;
      rememberShown();
      setOpen(true);
    };

    timer = window.setTimeout(tryToOpen, MODAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      document.getElementById("demo-modal-name")?.focus();
    }, 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      previousFocusRef.current?.focus();
    };
  }, [closeDialog, lenis, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-navy/70 p-2 backdrop-blur-sm sm:p-4"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <motion.div
            ref={dialogRef}
            id="timed-demo-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="timed-demo-title"
            aria-describedby="timed-demo-description"
            data-lenis-prevent
            className="relative max-h-[calc(100dvh-1rem)] w-full max-w-4xl overflow-visible rounded-2xl text-ink shadow-[0_28px_90px_rgb(14_26_57_/_0.3)] sm:max-h-[calc(100dvh-2rem)]"
            initial={
              reducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{
              duration: reducedMotion ? 0 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <button
              type="button"
              onClick={closeDialog}
              className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-3 md:top-3 md:text-ink/60 md:hover:bg-mist md:hover:text-navy md:focus-visible:ring-blue"
              aria-label="Close book a demo form"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="h-5 w-5"
                strokeWidth={1.8}
                aria-hidden
              />
            </button>

            <div className="grid md:grid-cols-[0.36fr_0.64fr]">
              <div className="rounded-t-2xl bg-navy px-4 py-4 pr-12 text-white sm:px-5 sm:py-5 md:flex md:flex-col md:rounded-l-2xl md:rounded-tr-none md:px-6 md:py-7 md:pr-6">
                <div>
                  <h2
                    id="timed-demo-title"
                    className="text-xl font-semibold leading-tight sm:text-2xl"
                  >
                    See Aurify in action.
                  </h2>
                  <p
                    id="timed-demo-description"
                    className="mt-1.5 max-w-sm text-xs leading-relaxed text-white/70 sm:text-sm [@media(max-height:640px)]:hidden"
                  >
                    Get a focused walkthrough shaped around your precious-metals operation.
                  </p>
                </div>

                <div className="hidden flex-1 items-center justify-center py-4 md:flex">
                  <HugeiconsIcon
                    icon={ComputerVideoCallIcon}
                    className="h-24 w-24 text-sky/80"
                    strokeWidth={1.15}
                    aria-hidden
                  />
                </div>

                <div className="mt-8 hidden space-y-3 text-sm text-white/80 md:block">
                  {[
                    "Discuss the workflows that matter to you",
                    "See the Aurify products relevant to your operation",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="mt-0.5 h-4 w-4 shrink-0 text-sky"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-b-2xl bg-white p-3 sm:p-4 md:rounded-bl-none md:rounded-r-2xl md:p-5">
                <p className="mb-2 text-xs font-medium text-navy/65 sm:mb-3">
                  Tell us a little about your needs.
                </p>
                <ContactForm
                  idPrefix="demo-modal"
                  title={null}
                  submitLabel="Book a Demo"
                  className="rounded-xl bg-paper p-3 sm:p-4"
                  onSuccess={closeDialog}
                  compact
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
