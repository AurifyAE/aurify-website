"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type BrandedSelectProps = {
  id: string;
  name: string;
  options: readonly string[];
  placeholder: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  describedBy?: string;
  autoComplete?: string;
  onValueChange?: (value: string) => void;
};

export default function BrandedSelect({
  id,
  name,
  options,
  placeholder,
  value,
  defaultValue = "",
  disabled = false,
  required = false,
  error,
  describedBy,
  autoComplete,
  onValueChange,
}: BrandedSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedValue = value ?? internalValue;
  const selectedIndex = options.indexOf(selectedValue);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
    setActiveIndex(nextIndex);
    requestAnimationFrame(() => optionRefs.current[nextIndex]?.focus());
  }, [open, selectedIndex]);

  function choose(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function focusOption(nextIndex: number) {
    const normalizedIndex = (nextIndex + options.length) % options.length;
    setActiveIndex(normalizedIndex);
    optionRefs.current[normalizedIndex]?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative mt-2"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <input
        type="hidden"
        name={name}
        value={selectedValue}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        aria-required={required}
        data-field={name}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`group flex w-full items-center rounded-xl border bg-white py-1.5 pl-4 pr-1.5 text-left text-[0.9375rem] shadow-[0_1px_0_rgb(var(--navy)/0.03)] transition-[border-color,box-shadow,background-color] duration-200 hover:border-navy/35 hover:bg-mist/30 focus:outline-none focus:ring-2 focus:ring-dbrg-gold/25 disabled:cursor-not-allowed disabled:bg-mist/50 ${
          error ? "border-dbrg-ink/60" : open ? "border-dbrg-gold" : "border-navy/20"
        }`}
      >
        <span className={`min-w-0 flex-1 truncate ${selectedValue ? "font-medium text-ink" : "text-ink/60"}`}>
          {selectedValue || placeholder}
        </span>
        <span
          className={`ml-3 grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors duration-200 ${
            open ? "bg-dbrg-gold/20 text-dbrg-ink" : "bg-mist text-navy/60 group-hover:text-navy"
          }`}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </button>

      {open && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-label={placeholder}
          className="absolute left-0 top-full z-30 mt-2 max-h-72 w-full min-w-64 overflow-y-auto rounded-xl border border-navy/15 bg-white p-2.5 shadow-[0_20px_55px_rgb(var(--navy)/0.18)]"
        >
          {options.map((option, index) => {
            const selected = option === selectedValue;
            return (
              <button
                key={option}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={activeIndex === index ? 0 : -1}
                onClick={() => choose(option)}
                onPointerMove={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    focusOption(index + 1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    focusOption(index - 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    focusOption(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    focusOption(options.length - 1);
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    setOpen(false);
                    triggerRef.current?.focus();
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-[background-color,color] duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dbrg-gold/50 ${
                  selected
                    ? "bg-dbrg-gold/20 font-semibold text-navy"
                    : "text-ink/75 hover:bg-mist hover:text-navy"
                }`}
              >
                <span className="min-w-0 flex-1">{option}</span>
                {selected && (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="h-4 w-4 shrink-0 text-dbrg-ink"
                    strokeWidth={2.2}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
