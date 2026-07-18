import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "ghost-dark" | "light" | "gradient";

const variants: Record<Variant, string> = {
  // Solid navy — the default CTA
  primary: "bg-navy text-white hover:bg-blue",
  // Outline on light backgrounds
  ghost: "border border-ink/15 text-navy hover:border-navy/50",
  // Outline on dark sections
  "ghost-dark": "border border-white/25 text-white hover:border-white/60",
  // Solid white on dark sections
  light: "bg-white text-navy hover:bg-paper",
  // Signature gradient — one per viewport, closing CTAs only
  gradient: "bg-gradient-brand text-white hover:opacity-90",
};

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  disabled,
  className = "",
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.9375rem] font-medium transition-all duration-300 ease-out-expo disabled:opacity-50 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
