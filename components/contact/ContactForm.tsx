"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { contact } from "@/lib/content/contact";
import { countries, FlagIcon } from "@/lib/content/countries";
import {
  validateContact,
  type ContactField,
  type ContactFieldErrors,
} from "@/lib/contact-validation";
import Button from "@/components/ui/Button";

type Status = "idle" | "sending" | "error";

type ContactFormProps = {
  idPrefix?: string;
  title?: string | null;
  submitLabel?: string;
  className?: string;
  onSuccess?: () => void;
  compact?: boolean;
};

const fieldCls =
  "w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink/40 transition-colors duration-300 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15";
const labelCls = "mb-2 block text-sm font-medium text-navy";

function FieldError({
  id,
  error,
  compact = false,
}: {
  id: string;
  error?: string;
  compact?: boolean;
}) {
  if (!error) return null;
  return (
    <p
      id={id}
      role="alert"
      className={`${compact ? "mt-1" : "mt-2"} text-xs font-medium text-[#a12b24]`}
    >
      {error}
    </p>
  );
}

export default function ContactForm({
  idPrefix = "contact",
  title = contact.form.title,
  submitLabel = contact.form.submitLabel,
  className = "rounded-2xl bg-paper p-8 md:p-10",
  onSuccess,
  compact = false,
}: ContactFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const { fields } = contact.form;

  const defaultCountry = countries.find((country) => country.code === "AE") ?? countries[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dial.includes(searchQuery)
  );

  function clearError(field: ContactField) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (status === "error") setStatus("idle");
  }

  function focusFirstError(form: HTMLFormElement, fieldErrors: ContactFieldErrors) {
    const firstField = Object.keys(fieldErrors)[0] as ContactField | undefined;
    if (!firstField) return;
    requestAnimationFrame(() => {
      form
        .querySelector<HTMLElement>(`[data-field="${firstField}"], [name="${firstField}"]`)
        ?.focus();
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const validation = validateContact(data);

    if (Object.keys(validation.errors).length > 0) {
      setErrors(validation.errors);
      setStatus("idle");
      focusFirstError(form, validation.errors);
      return;
    }

    setErrors({});
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json().catch(() => null)) as
        | { fields?: ContactFieldErrors }
        | null;

      if (!response.ok) {
        if (result?.fields && Object.keys(result.fields).length > 0) {
          setErrors(result.fields);
          setStatus("idle");
          focusFirstError(form, result.fields);
        } else {
          setStatus("error");
        }
        return;
      }

      onSuccess?.();
      router.push("/contact/thank-you");
    } catch {
      setStatus("error");
    }
  }

  const nameId = `${idPrefix}-name`;
  const emailId = `${idPrefix}-email`;
  const companyId = `${idPrefix}-company`;
  const phoneId = `${idPrefix}-phone`;
  const messageId = `${idPrefix}-message`;
  const countryListId = `${idPrefix}-country-list`;
  const activeFieldCls = compact
    ? "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm leading-5 text-ink placeholder:text-ink/40 transition-colors duration-300 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
    : fieldCls;
  const activeLabelCls = compact
    ? "mb-1 block text-xs font-medium leading-4 text-navy"
    : labelCls;

  return (
    <form
      onSubmit={handleSubmit}
      onInputCapture={(event) => {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;
        const field = target.dataset.field ?? target.name;
        if (field) clearError(field as ContactField);
      }}
      className={className}
      aria-busy={status === "sending"}
      noValidate
    >
      {title && <h2 className="text-title-sm text-navy">{title}</h2>}

      <div
        className={
          compact
            ? "grid gap-2 min-[360px]:grid-cols-2"
            : title
              ? "mt-8 grid gap-6 sm:grid-cols-2"
              : "grid gap-5 sm:grid-cols-2"
        }
      >
        <div>
          <label htmlFor={nameId} className={activeLabelCls}>
            {fields.name.label}
          </label>
          <input
            id={nameId}
            name="name"
            type="text"
            required
            autoComplete="name"
            minLength={2}
            maxLength={100}
            placeholder={fields.name.placeholder}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            data-field="name"
            className={`${activeFieldCls} ${errors.name ? "border-[#a12b24]" : ""}`}
          />
          <FieldError id={`${nameId}-error`} error={errors.name} compact={compact} />
        </div>

        <div>
          <label htmlFor={emailId} className={activeLabelCls}>
            {fields.email.label}
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
            placeholder={fields.email.placeholder}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            data-field="email"
            className={`${activeFieldCls} ${errors.email ? "border-[#a12b24]" : ""}`}
          />
          <FieldError id={`${emailId}-error`} error={errors.email} compact={compact} />
        </div>
      </div>

      <div
        className={
          compact
            ? "mt-2 grid items-start gap-2 min-[520px]:grid-cols-2"
            : ""
        }
      >
        <div className={compact ? "" : "mt-5"}>
          <label htmlFor={companyId} className={activeLabelCls}>
            {fields.company.label}
          </label>
          <input
            id={companyId}
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={120}
            placeholder={fields.company.placeholder}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? `${companyId}-error` : undefined}
            data-field="company"
            className={`${activeFieldCls} ${errors.company ? "border-[#a12b24]" : ""}`}
          />
          <FieldError id={`${companyId}-error`} error={errors.company} compact={compact} />
        </div>

        <div className={compact ? "" : "mt-5"}>
          <label htmlFor={phoneId} className={activeLabelCls}>
            {fields.phone.label}
          </label>
          <div
            ref={dropdownRef}
            className={`relative flex rounded-lg border bg-white transition-colors duration-300 focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/15 ${
              errors.phone ? "border-[#a12b24]" : "border-ink/15"
            }`}
          >
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen((current) => !current);
              setSearchQuery("");
            }}
            className={`flex shrink-0 items-center rounded-l-lg border-r border-ink/10 bg-paper/50 text-ink transition-colors hover:bg-ink/5 focus:outline-none ${
              compact
                ? "gap-1.5 px-2 py-2 text-sm"
                : "gap-2 px-3 py-3 text-[0.9375rem] sm:px-4"
            }`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-controls={countryListId}
            aria-label={`Country code, ${selectedCountry.name} ${selectedCountry.dial}`}
          >
            <FlagIcon code={selectedCountry.code} />
            <span className="font-semibold text-navy/80">{selectedCountry.dial}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={`h-3.5 w-3.5 text-ink/45 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180 text-blue" : ""
              }`}
              strokeWidth={2}
              aria-hidden
            />
          </button>

          <input
            id={phoneId}
            type="tel"
            required
            value={localPhone}
            onChange={(event) =>
              setLocalPhone(event.target.value.replace(/[^0-9\s-()]/g, ""))
            }
            inputMode="tel"
            autoComplete="tel-national"
            maxLength={25}
            placeholder={fields.phone.placeholder}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? `${phoneId}-error` : `${phoneId}-hint`
            }
            data-field="phone"
            className={`w-full min-w-0 rounded-r-lg bg-transparent text-ink placeholder:text-ink/40 focus:outline-none ${
              compact ? "px-2 py-2 text-sm leading-5" : "px-3 py-3 text-[0.9375rem] sm:px-4"
            }`}
          />

          <input type="hidden" name="phone" value={localPhone.trim()} />
          <input
            type="hidden"
            name="phoneCountryCode"
            value={selectedCountry.code}
          />

          {isDropdownOpen && (
            <div
              id={countryListId}
              role="listbox"
              className={`scrollbar-hidden absolute left-0 z-50 w-[min(20rem,calc(100vw-3rem))] overflow-y-auto rounded-xl border border-ink/10 bg-white p-2.5 shadow-[0_18px_50px_rgb(var(--navy)/0.18)] ${
                compact
                  ? "bottom-full mb-2 max-h-48"
                  : "top-full mt-2 max-h-64"
              }`}
              data-lenis-prevent
            >
              <div className="sticky top-0 z-10 bg-white pb-2">
                <div className="relative flex items-center">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="pointer-events-none absolute left-3 h-4 w-4 text-ink/35"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                  <input
                    type="search"
                    placeholder="Search country or code"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-lg border border-ink/15 bg-paper/30 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 transition-colors focus:border-blue focus:bg-white focus:outline-none"
                    aria-label="Search countries"
                    autoFocus={!compact}
                  />
                </div>
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={selectedCountry.code === country.code}
                    onClick={() => {
                      setSelectedCountry(country);
                      setIsDropdownOpen(false);
                      clearError("phone");
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                      selectedCountry.code === country.code
                        ? "bg-blue/5 font-semibold text-blue"
                        : "text-ink/80 hover:bg-ink/5 hover:text-navy"
                    }`}
                  >
                    <FlagIcon code={country.code} />
                    <span className="flex-1 truncate text-[0.875rem]">
                      {country.name}
                    </span>
                    <span className="font-mono text-xs font-normal text-ink/45">
                      {country.dial}
                    </span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-ink/50">
                    No matching countries.
                  </p>
                )}
              </div>
            </div>
          )}
          </div>
          {errors.phone ? (
            <FieldError id={`${phoneId}-error`} error={errors.phone} compact={compact} />
          ) : (
            <p
              id={`${phoneId}-hint`}
              className={compact ? "sr-only" : "mt-2 text-xs text-ink/60"}
            >
              Choose a country code and enter the local phone number.
            </p>
          )}
        </div>
      </div>

      <div className={compact ? "mt-2" : "mt-5"}>
        <label htmlFor={messageId} className={activeLabelCls}>
          {fields.message.label}
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          rows={compact ? 2 : 4}
          minLength={10}
          maxLength={2000}
          placeholder={fields.message.placeholder}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${messageId}-error` : undefined}
          data-field="message"
          className={`${activeFieldCls} ${compact ? "resize-none" : "resize-y"} ${errors.message ? "border-[#a12b24]" : ""}`}
        />
        <FieldError id={`${messageId}-error`} error={errors.message} compact={compact} />
      </div>

      <div className={`${compact ? "mt-2 gap-2" : "mt-7 gap-4"} flex flex-wrap items-center`}>
        <Button
          type="submit"
          disabled={status === "sending"}
          className={compact ? "w-full px-5 py-2.5 text-sm sm:w-auto" : ""}
        >
          {status === "sending" ? (
            "Sending..."
          ) : (
            <>
              {submitLabel}
              {compact && (
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  className="h-4 w-4"
                  strokeWidth={1.8}
                  aria-hidden
                />
              )}
            </>
          )}
        </Button>
        <p aria-live="polite" className="text-sm">
          {status === "error" && (
            <span className="font-medium text-navy">{contact.form.error}</span>
          )}
        </p>
      </div>
    </form>
  );
}
