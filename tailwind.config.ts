import type { Config } from "tailwindcss";

/**
 * All design tokens live here + app/globals.css (CSS variables).
 * Components must not use magic values.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    // Brand-only palette: intentionally replaces Tailwind's default color
    // scales so no off-brand colors can creep into components.
    // The <alpha-value> placeholder is what lets opacity modifiers such as
    // text-ink/60 emit a real rule; a bare var(--ink) silently drops them.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "rgb(var(--white) / <alpha-value>)",
      paper: "rgb(var(--paper) / <alpha-value>)",
      ink: "rgb(var(--ink) / <alpha-value>)",
      mist: "rgb(var(--mist) / <alpha-value>)",
      navy: "rgb(var(--navy) / <alpha-value>)",
      blue: "rgb(var(--blue) / <alpha-value>)",
      sky: "rgb(var(--sky) / <alpha-value>)",
      teal: "rgb(var(--teal) / <alpha-value>)",
    },
    fontFamily: {
      sans: ["var(--font-sans)", "system-ui", "sans-serif"],
    },
    extend: {
      fontSize: {
        // Hero display - short declarative sentences only.
        // The vw term carries a rem offset so the size keeps scaling below
        // ~600px instead of flattening onto the clamp floor: a plain 8vw
        // sits under the 3rem minimum on phones, which pinned the headline
        // at 48px and pushed "Infrastructure" past the 320px viewport.
        display: [
          "clamp(2.25rem, 6.6vw + 1rem, 7rem)",
          { lineHeight: "1.04", letterSpacing: "-0.03em", fontWeight: "500" },
        ],
        // Section titles
        title: [
          "clamp(2rem, 4.5vw, 3.5rem)",
          { lineHeight: "1.12", letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        // Sub-section / card titles
        "title-sm": [
          "clamp(1.375rem, 2.2vw, 1.75rem)",
          { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "500" },
        ],
        // Standard body copy
        body: ["1.0625rem", { lineHeight: "1.7" }],
        // Eyebrow / label
        eyebrow: [
          "0.8125rem",
          { lineHeight: "1.2", letterSpacing: "0.12em", fontWeight: "500" },
        ],
      },
      maxWidth: {
        measure: "65ch",
        content: "72rem",
        wide: "80rem",
      },
      spacing: {
        // Section rhythm
        section: "clamp(6rem, 12vw, 10rem)",
        "section-sm": "clamp(4rem, 8vw, 6rem)",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, rgb(var(--navy)) 0%, rgb(var(--blue)) 50%, rgb(var(--sky)) 100%)",
        // Monochrome SVG grain tile - breaks up banding on blurred gradient
        // layers; always used at very low opacity (≤0.05)
        noise:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        // Gradient-mesh blobs - transform-only so the blurred layers
        // composite once and drift cheaply
        "mesh-a": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "100%": { transform: "translate3d(10%, -8%, 0) scale(1.15)" },
        },
        "mesh-b": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1.1)" },
          "100%": { transform: "translate3d(-12%, 10%, 0) scale(1)" },
        },
        "mesh-c": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "100%": { transform: "translate3d(8%, 12%, 0) scale(1.2)" },
        },
        // Hero background wash - pans an oversized gradient by
        // background-position; runs alternate so the turnaround is seamless
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        // Hero halo wander - split across two nested elements (one axis
        // each) with mismatched periods, the drift traces a smooth
        // Lissajous-style path instead of a flat back-and-forth; the scale
        // breath rides the vertical axis
        "halo-x": {
          "0%": { transform: "translate3d(-4%, 0, 0)" },
          "100%": { transform: "translate3d(4%, 0, 0)" },
        },
        "halo-y": {
          "0%": { transform: "translate3d(0, -3%, 0) scale(1)" },
          "100%": { transform: "translate3d(0, 3%, 0) scale(1.05)" },
        },
        // Hero scroll cue pulse
        cue: {
          "0%, 100%": { transform: "scaleY(0.2)", opacity: "0.4" },
          "50%": { transform: "scaleY(1)", opacity: "1" },
        },
        // Audience marquee - track holds two copies, so -50% loops seamlessly.
        // translate3d rather than translateX so the track is promoted to its
        // own compositor layer for the whole loop: at this width the row is
        // long enough that a repaint per frame shows up as uneven drift.
        marquee: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(-50%, 0, 0)" },
        },
        // Teal ring pulse on the IQ ecosystem card
        "iq-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--teal) / 0.40)" },
          "70%": { boxShadow: "0 0 0 16px rgb(var(--teal) / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(var(--teal) / 0)" },
        },
        // Order-flow beads on the Bullion Pro network visual: the dash
        // pattern period is 18 units, so a -36 offset per cycle advances
        // exactly two periods - the loop is seamless
        "bead-flow": {
          to: { "stroke-dashoffset": "-36" },
        },
        // Gentle bob for the counterparty nodes; instances stagger via
        // animation-delay so the columns don't move in lockstep
        float: {
          "0%, 100%": { transform: "translateY(4px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        // Gloss streak sweeping across the Refine X ingot — parks off-canvas
        // from 45% so it reads as an occasional glint, not a loop
        sheen: {
          "0%": { transform: "translateX(-160%) skewX(-14deg)" },
          "45%, 100%": { transform: "translateX(520%) skewX(-14deg)" },
        },
      },
      animation: {
        "mesh-a": "mesh-a 26s ease-in-out infinite alternate",
        "mesh-b": "mesh-b 32s ease-in-out infinite alternate",
        "mesh-c": "mesh-c 38s ease-in-out infinite alternate",
        "gradient-pan": "gradient-pan 16s ease-in-out infinite alternate",
        cue: "cue 2.2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "iq-pulse": "iq-pulse 2.8s ease-out infinite",
        "bead-flow": "bead-flow 2.4s linear infinite",
        float: "float 7s ease-in-out infinite",
        sheen: "sheen 4.5s ease-in-out infinite",
        // Tailwind's built-in spin keyframes at an ambient pace
        "spin-slow": "spin 16s linear infinite",
        // Counter-rotation for the hero halo's outer ring - slower and
        // reversed so the two rings visibly orbit against each other
        "spin-slow-rev": "spin 26s linear infinite reverse",
        // 9s vs 7s periods keep the two wander axes out of phase for a
        // long stretch; the negative delay starts mid-glide, not at a
        // corner of the path
        "halo-x": "halo-x 9s ease-in-out infinite alternate",
        "halo-y": "halo-y 7s ease-in-out -3s infinite alternate",
        // Faster spin for the RMS radar sweep — slow enough to stay calm,
        // quick enough to read as live surveillance
        "spin-dial": "spin 7s linear infinite",
      },
      zIndex: {
        nav: "50",
        menu: "60",
      },
    },
  },
  plugins: [],
};

export default config;
