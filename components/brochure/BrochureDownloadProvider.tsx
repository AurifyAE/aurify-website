"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import Button, { type ButtonVariant } from "@/components/ui/Button";
import { useLenis } from "@/components/providers/AppProviders";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { site } from "@/lib/content/site";

type BrochureSource = "header" | "mobile-menu" | "footer";
type FormStatus = "idle" | "sending" | "success" | "error";

type BrochureContextValue = {
  openBrochureDialog: (source: BrochureSource) => void;
};

const BrochureContext = createContext<BrochureContextValue | null>(null);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useBrochureDownload() {
  const context = useContext(BrochureContext);
  if (!context) {
    throw new Error(
      "useBrochureDownload must be used within BrochureDownloadProvider."
    );
  }
  return context;
}

export function BrochureDownloadButton({
  source,
  variant = "ghost",
  className = "",
  onOpen,
}: {
  source: BrochureSource;
  variant?: ButtonVariant;
  className?: string;
  onOpen?: () => void;
}) {
  const { openBrochureDialog } = useBrochureDownload();

  return (
    <Button
      variant={variant}
      className={`whitespace-nowrap ${className}`}
      ariaHaspopup="dialog"
      ariaControls="brochure-download-dialog"
      onClick={() => {
        onOpen?.();
        openBrochureDialog(source);
      }}
    >
      {site.brochure.label}
    </Button>
  );
}

function startDownload(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = site.brochure.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export default function BrochureDownloadProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<BrochureSource>("header");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string>(
    site.brochure.downloadUrl
  );
  const emailRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const successTitleRef = useRef<HTMLHeadingElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();

  const closeDialog = useCallback(() => setOpen(false), []);

  const openBrochureDialog = useCallback((nextSource: BrochureSource) => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setSource(nextSource);
    setStatus("idle");
    setError("");
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => emailRef.current?.focus(), 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]):not([tabindex="-1"])'
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

  useEffect(() => {
    if (status === "success") successTitleRef.current?.focus();
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    if (!email || email.length > 254 || !emailPattern.test(email)) {
      setStatus("error");
      setError("Enter a valid work email address.");
      emailRef.current?.focus();
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          page: window.location.pathname,
          website: String(formData.get("website") ?? ""),
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { downloadUrl?: string; error?: string }
        | null;

      if (!response.ok || !result?.downloadUrl) {
        setStatus("error");
        setError(
          result?.error ?? "We could not prepare the brochure. Please try again."
        );
        return;
      }

      setDownloadUrl(result.downloadUrl);
      setStatus("success");
      startDownload(result.downloadUrl);
    } catch {
      setStatus("error");
      setError("We could not prepare the brochure. Please try again.");
    }
  }

  return (
    <BrochureContext.Provider value={{ openBrochureDialog }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-navy/65 px-4 py-8 backdrop-blur-sm"
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
              id="brochure-download-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="brochure-dialog-title"
              aria-describedby="brochure-dialog-description"
              className="relative w-full max-w-lg rounded-2xl bg-white p-7 text-ink shadow-[0_28px_90px_rgb(14_26_57_/_0.28)] md:p-10"
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
                disabled={status === "sending"}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-ink/60 transition-colors hover:bg-paper hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-blue disabled:opacity-40"
                aria-label="Close brochure form"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="h-5 w-5"
                  strokeWidth={1.8}
                  aria-hidden
                />
              </button>

              {status === "success" ? (
                <div aria-live="polite">
                  <p className="text-eyebrow uppercase text-blue">Download ready</p>
                  <h2
                    ref={successTitleRef}
                    id="brochure-dialog-title"
                    tabIndex={-1}
                    className="mt-3 pr-10 text-title-sm text-navy focus:outline-none"
                  >
                    Your brochure is ready
                  </h2>
                  <p
                    id="brochure-dialog-description"
                    className="mt-3 text-sm leading-relaxed text-ink/65"
                  >
                    Your download should begin automatically. You can also use
                    the link below.
                  </p>
                  <a
                    href={downloadUrl}
                    download={site.brochure.fileName}
                    className="mt-7 inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 text-[0.9375rem] font-medium text-white transition-colors duration-300 hover:bg-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
                  >
                    Download again
                  </a>
                </div>
              ) : (
                <>
                  <p className="text-eyebrow uppercase text-blue">Aurify overview</p>
                  <h2
                    id="brochure-dialog-title"
                    className="mt-3 pr-10 text-title-sm text-navy"
                  >
                    Download the Aurify brochure
                  </h2>
                  <p
                    id="brochure-dialog-description"
                    className="mt-3 max-w-md text-sm leading-relaxed text-ink/65"
                  >
                    Enter your work email for instant access to our company and
                    product overview.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-7"
                    aria-busy={status === "sending"}
                    noValidate
                  >
                    <label
                      htmlFor="brochure-email"
                      className="mb-2 block text-sm font-medium text-navy"
                    >
                      Work email
                    </label>
                    <input
                      ref={emailRef}
                      id="brochure-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={254}
                      placeholder="name@company.com"
                      aria-invalid={status === "error"}
                      aria-describedby={
                        status === "error"
                          ? "brochure-email-error brochure-email-note"
                          : "brochure-email-note"
                      }
                      onInput={() => {
                        if (status === "error") {
                          setStatus("idle");
                          setError("");
                        }
                      }}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue/15 ${
                        status === "error"
                          ? "border-[#a12b24] focus:border-[#a12b24]"
                          : "border-ink/20 focus:border-blue"
                      }`}
                    />
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      className="sr-only"
                      aria-hidden="true"
                    />
                    <p
                      id="brochure-email-note"
                      className="mt-2 text-xs leading-relaxed text-ink/60"
                    >
                      We use your email to provide the brochure and respond to
                      related enquiries.
                    </p>
                    <p
                      id="brochure-email-error"
                      role="alert"
                      className="mt-3 min-h-5 text-sm font-medium text-[#a12b24]"
                    >
                      {error}
                    </p>
                    <Button
                      type="submit"
                      disabled={status === "sending"}
                      className="mt-3 w-full"
                    >
                      {status === "sending"
                        ? "Preparing download..."
                        : "Get the brochure"}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BrochureContext.Provider>
  );
}
