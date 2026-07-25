## Aurify UI — build conventions

No provider or root wrapper is required — none of these components read from
React context. Just import `styles.css` once; everything else is plain
Tailwind utility classes plus the six components below.

**Components in this sync**: `AnimatedHeadline`, `CountUp`, `GradientMesh`,
`PageHero`, `Reveal`, `SectionHeading`. (`Button`, `Marquee`, `CtaRow` are
intentionally not included — they depend on Next.js runtime internals that
don't exist outside a Next.js server.)

### The styling idiom: a closed brand palette, not default Tailwind

This DS **replaces** Tailwind's default color scale entirely — there is no
`blue-500` or `gray-100`. Use only these tokens, each usable as
`bg-<name>`, `text-<name>`, `border-<name>`, with an optional
`/<opacity>` modifier (e.g. `text-ink/60`, `border-ink/10`):

| Token | Role |
|---|---|
| `navy` | Primary brand — headings, dark CTAs |
| `blue` | Secondary — links, active states |
| `sky` | Accent — gradients, highlights, data-viz |
| `teal` | Accent — success, secondary highlights |
| `ink` | Body text, dark-section backgrounds |
| `white` / `paper` | White vs. off-white section background |
| `mist` | Navy-tinted light grey, for section separation without going dark |

Brand gradient: `bg-gradient-brand` (navy → blue → sky, 135deg). For gradient
*text* (used for emphasis inside a headline), use the `text-gradient`
utility class directly — it's a hand-written CSS class, not a Tailwind
utility, and needs no extra setup.

Type scale (each already sets its own line-height/tracking/weight — don't
layer `font-*`/`leading-*` on top): `text-display` (hero headlines),
`text-title` / `text-title-sm` (section headings), `text-body` (base copy),
`text-eyebrow` (small uppercase labels).

Layout tokens: `max-w-content` (72rem, standard page/section width),
`max-w-wide` (80rem), `max-w-measure` (65ch, prose line length),
`py-section` / `py-section-sm` (responsive section vertical rhythm).
Signature easing: `ease-out-expo` on `transition-*` utilities for hover/
motion — this is the DS's one consistent easing curve, used everywhere
instead of Tailwind's defaults.

### Motion: compose with `Reveal`, don't hand-write it

`Reveal` is the DS's scroll-triggered fade-up entrance — wrap new content
in it (`<Reveal>...</Reveal>`, or `stagger` to animate children
individually) instead of writing custom animation. It's a no-op under
`prefers-reduced-motion`, so it's always safe to reach for. `AnimatedHeadline`
is the equivalent for headline copy specifically — it does a masked
word-stagger reveal and takes `highlight` (the exact substring to render in
the brand gradient).

### Where the truth lives

Read `styles.css` (it `@import`s the component CSS) before styling anything
by hand — every class above is real and present there. Each component's own
`.prompt.md` has its full prop contract and usage notes.

### Example composition

```tsx
import { SectionHeading, Reveal } from 'aurify-website';

<section className="py-section">
  <div className="mx-auto max-w-content px-6">
    <SectionHeading
      eyebrow="The Ecosystem"
      title="One Platform. Complete Control."
      body="A short supporting sentence under the title."
      align="center"
    />
    <Reveal stagger className="mt-16 grid gap-10 md:grid-cols-3">
      <div className="border-t border-ink/10 pt-6">
        <p className="text-title-sm text-navy">Card title</p>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">Body copy.</p>
      </div>
    </Reveal>
  </div>
</section>
```
