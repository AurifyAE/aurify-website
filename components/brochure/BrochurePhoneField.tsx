"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { countries, FlagIcon } from "@/lib/content/countries";

const defaultCountry =
  countries.find((country) => country.code === "AE") ?? countries[0];

/**
 * Country code picker + local number for the brochure dialog. Submits as
 * `phone` and `phoneCountryCode`, the same shape the contact form sends, so
 * the server can validate with validatePhoneForCountry.
 */
export default function BrochurePhoneField({
  id,
  invalid,
  describedBy,
  onEdit,
}: {
  id: string;
  invalid: boolean;
  describedBy: string;
  onEdit: () => void;
}) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const countryListId = `${id}-country-list`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  return (
    <div
      ref={dropdownRef}
      // Escape closes the country list first instead of the whole dialog.
      onKeyDown={(event) => {
        if (event.key === "Escape" && isDropdownOpen) {
          event.stopPropagation();
          setIsDropdownOpen(false);
        }
      }}
      className={`relative flex rounded-lg border bg-white transition-colors focus-within:ring-2 focus-within:ring-blue/15 ${
        invalid
          ? "border-[#a12b24] focus-within:border-[#a12b24]"
          : "border-ink/20 focus-within:border-blue"
      }`}
    >
      <button
        type="button"
        onClick={() => {
          setIsDropdownOpen((current) => !current);
          setSearchQuery("");
        }}
        className="flex shrink-0 items-center gap-2 rounded-l-lg border-r border-ink/10 bg-paper/50 px-3 py-3 text-[0.9375rem] text-ink transition-colors hover:bg-ink/5 focus:outline-none sm:px-4"
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
        id={id}
        type="tel"
        required
        value={localPhone}
        onChange={(event) => {
          setLocalPhone(event.target.value.replace(/[^0-9\s-()]/g, ""));
          onEdit();
        }}
        inputMode="tel"
        autoComplete="tel-national"
        maxLength={25}
        placeholder="50 123 4567"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="w-full min-w-0 rounded-r-lg bg-transparent px-3 py-3 text-[0.9375rem] text-ink placeholder:text-ink/40 focus:outline-none sm:px-4"
      />

      <input type="hidden" name="phone" value={localPhone.trim()} />
      <input type="hidden" name="phoneCountryCode" value={selectedCountry.code} />

      {isDropdownOpen && (
        <div
          id={countryListId}
          role="listbox"
          className="scrollbar-hidden absolute left-0 top-full z-50 mt-2 max-h-64 w-[min(20rem,calc(100vw-3rem))] overflow-y-auto rounded-xl border border-ink/10 bg-white p-2.5 shadow-[0_18px_50px_rgb(var(--navy)/0.18)]"
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
                autoFocus
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
                  onEdit();
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
  );
}
