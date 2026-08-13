"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { countries, FlagIcon, type Country } from "@/lib/content/countries";

const controlClass =
  "w-full rounded-xl border border-navy/20 bg-white px-4 py-3.5 text-[0.9375rem] text-ink placeholder:text-ink/60 transition-[border-color,box-shadow] duration-200 focus:border-dbrg-gold focus:outline-none focus:ring-2 focus:ring-dbrg-gold/25 disabled:cursor-not-allowed disabled:bg-mist/50";
const dropdownClass =
  "absolute left-0 top-full z-20 mt-2 max-h-72 w-full min-w-64 overflow-y-auto rounded-xl border border-navy/20 bg-white p-2.5 shadow-[0_18px_50px_rgb(var(--navy)/0.16)]";

function matchesCountry(country: Country, query: string) {
  const normalized = query.trim().toLowerCase();
  return (
    country.name.toLowerCase().includes(normalized) ||
    country.code.toLowerCase().includes(normalized) ||
    country.dial.includes(normalized)
  );
}

export function SearchableCountryField({
  id,
  error,
  disabled = false,
  required = false,
  onValueChange,
  onCountryChange,
}: {
  id: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onValueChange?: () => void;
  onCountryChange?: (country: Country | null) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredCountries = useMemo(
    () => countries.filter((country) => matchesCountry(country, query)),
    [query]
  );
  const selectedCountry = countries.find(
    (country) => country.name.toLowerCase() === query.trim().toLowerCase()
  );

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative mt-2">
      <div className="relative">
        {selectedCountry && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <FlagIcon code={selectedCountry.code} className="h-4 w-6 rounded-sm object-cover" />
          </span>
        )}
        <input
          id={id}
          name="country"
          type="text"
          value={query}
          disabled={disabled}
          required={required}
          autoComplete="country-name"
          maxLength={80}
          placeholder="Type to search countries"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={`${id}-options`}
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          data-field="country"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            const nextQuery = event.target.value;
            const exactCountry = countries.find(
              (country) => country.name.toLowerCase() === nextQuery.trim().toLowerCase()
            );
            setQuery(nextQuery);
            setOpen(true);
            onValueChange?.();
            onCountryChange?.(exactCountry ?? null);
          }}
          className={`${controlClass} ${selectedCountry ? "pl-12" : ""} pr-11`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-navy/60 transition-colors hover:bg-mist hover:text-navy"
          aria-label={open ? "Close country options" : "Show country options"}
          tabIndex={-1}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div id={`${id}-options`} role="listbox" className={dropdownClass}>
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                role="option"
                aria-selected={selectedCountry?.code === country.code}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery(country.name);
                  setOpen(false);
                  onValueChange?.();
                  onCountryChange?.(country);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedCountry?.code === country.code
                    ? "bg-dbrg-gold/20 font-medium text-navy"
                    : "text-ink/75 hover:bg-mist hover:text-navy"
                }`}
              >
                <FlagIcon code={country.code} className="h-4 w-6 rounded-sm object-cover" />
                <span className="min-w-0 flex-1 truncate">{country.name}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-ink/60">
              No countries match your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function PhoneCountryField({
  id,
  error,
  disabled = false,
  onValueChange,
}: {
  id: string;
  error?: string;
  disabled?: boolean;
  onValueChange?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const defaultCountry = countries.find((country) => country.code === "AE") ?? countries[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [localPhone, setLocalPhone] = useState("");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCountries = useMemo(
    () => countries.filter((country) => matchesCountry(country, searchQuery)),
    [searchQuery]
  );

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative mt-2">
      <div
        className={`flex rounded-xl border bg-white transition-[border-color,box-shadow] duration-200 focus-within:border-dbrg-gold focus-within:ring-2 focus-within:ring-dbrg-gold/25 ${
          error ? "border-dbrg-ink/60" : "border-navy/20"
        }`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setOpen((current) => !current);
            setSearchQuery("");
          }}
          className="flex shrink-0 items-center gap-2 rounded-l-xl border-r border-navy/10 bg-mist/50 px-3 py-3.5 text-sm text-navy transition-colors hover:bg-mist disabled:cursor-not-allowed"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-dial-options`}
          aria-label={`Select country code, currently ${selectedCountry.dial}`}
        >
          <FlagIcon code={selectedCountry.code} className="h-4 w-6 rounded-sm object-cover" />
          <span className="font-medium">{selectedCountry.dial}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        <input
          id={id}
          type="tel"
          required
          disabled={disabled}
          value={localPhone}
          inputMode="tel"
          autoComplete="tel-national"
          maxLength={20}
          placeholder="50 123 4567"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          data-field="phone"
          onChange={(event) => {
            setLocalPhone(event.target.value.replace(/[^0-9\s()\-]/g, ""));
            onValueChange?.();
          }}
          className="min-w-0 flex-1 rounded-r-xl bg-transparent px-4 py-3.5 text-[0.9375rem] text-ink placeholder:text-ink/60 focus:outline-none disabled:cursor-not-allowed disabled:bg-mist/50"
        />
        <input
          type="hidden"
          name="phone"
          value={localPhone.trim() ? `${selectedCountry.dial} ${localPhone.trim()}` : ""}
        />
      </div>
      {!error && (
        <p id={`${id}-hint`} className="mt-2 text-xs text-ink/60">
          Choose a country code, then enter your mobile number.
        </p>
      )}

      {open && (
        <div id={`${id}-dial-options`} className={`${dropdownClass} sm:w-80`}>
          <div className="sticky top-0 z-10 bg-white pb-2">
            <label htmlFor={`${id}-dial-search`} className="sr-only">
              Search country or dialing code
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
                strokeWidth={2}
                aria-hidden
              />
              <input
                id={`${id}-dial-search`}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search country or code"
                className="w-full rounded-lg border border-navy/20 bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/60 focus:border-dbrg-gold focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div role="listbox" className="mt-1 space-y-0.5">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={selectedCountry.code === country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setOpen(false);
                    onValueChange?.();
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedCountry.code === country.code
                      ? "bg-dbrg-gold/20 font-medium text-navy"
                      : "text-ink/75 hover:bg-mist hover:text-navy"
                  }`}
                >
                  <FlagIcon code={country.code} className="h-4 w-6 rounded-sm object-cover" />
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-ink/60">{country.dial}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-6 text-center text-sm text-ink/60">
                No countries match your search.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
