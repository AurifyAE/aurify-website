import { ICON_GRADIENT_ID, ICON_GRADIENT_DARK_ID } from "@/components/icons";

/**
 * Shared <linearGradient> defs, mounted once in the root layout. SVG paint
 * references (url(#id)) resolve against the whole document, not just the
 * local <svg>, so every "featured" icon can point stroke="url(#...)" at
 * these single defs instead of each icon carrying its own copy.
 * Two ramps: the brand navy→sky for light backgrounds, and sky→teal for
 * dark/navy sections where the navy end would disappear.
 */
export default function IconGradientDefs() {
  return (
    <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <linearGradient id={ICON_GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "rgb(var(--navy))" }} />
          <stop offset="50%" style={{ stopColor: "rgb(var(--blue))" }} />
          <stop offset="100%" style={{ stopColor: "rgb(var(--sky))" }} />
        </linearGradient>
        <linearGradient id={ICON_GRADIENT_DARK_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "rgb(var(--sky))" }} />
          <stop offset="100%" style={{ stopColor: "rgb(var(--teal))" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
