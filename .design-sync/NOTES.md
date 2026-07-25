# design-sync notes - aurify-website

## Repo shape
- No Storybook anywhere in the repo (checked `.storybook/`, `*.stories.*` - none found).
- No component-library build. `package.json`'s `build` script is `next build --turbopack`,
  which produces a full Next.js app bundle, not an importable `dist/index.js`. The converter
  runs in **synth-entry mode**, scanning `components/ui/*.tsx` directly. `.d.ts` prop
  contracts are synthesized from source rather than extracted from a real build - weaker
  than the storybook/package-with-dist path, but every component still ships fully functional.
- Scope is intentionally limited to `components/ui/` (9 components: AnimatedHeadline, Button,
  CountUp, CtaRow, GradientMesh, Marquee, PageHero, Reveal, SectionHeading) - user's explicit
  choice. The rest of `components/` (sections, layout, products, icons) is page-specific and
  content-coupled (GSAP scroll timelines, `lib/content/*.ts` data shapes) and was excluded as
  out of scope for a first sync.

## CSS / tokens
- Raw `app/globals.css` only contains `@tailwind` directives + custom `:root` vars - it does
  NOT contain compiled utility classes (`bg-navy`, `text-navy`, etc.). Those only exist after
  Tailwind's build step runs.
- Source of truth for `cssEntry`: a production `npm run build` (Turbopack). Turbopack emits
  the compiled CSS under `.next/static/chunks/<hash>.css` (NOT `.next/static/css/` like
  webpack - don't assume the webpack path when re-deriving this).
- The filename is content-hashed and changes every build, so it's copied to a stable path:
  `.design-sync/.cache/css/tailwind-build.css`, with the sibling font files copied to
  `.design-sync/.cache/media/` (the CSS's `@font-face` rules reference `../media/<hash>.woff2`
  relative to itself - the two dirs must keep that relative layout or fonts go
  `[FONT_DANGLING]`). `cfg.buildCmd` runs the build and does both copies; re-run it (or redo
  manually) before any re-sync if `app/globals.css` or `tailwind.config.ts` changed.
- **`rm -rf .next` before rebuilding is required, not optional.** A `.next/` left over from
  `npm run dev` mixes dev-mode per-route CSS chunks in with the next `npm run build`'s output -
  hit this once: `.next/static/chunks/` had 4 `*.css` files instead of 1, and the extra ones
  weren't the real compiled bundle. `cfg.buildCmd` cleans first; don't skip it if reproducing
  by hand.
- **`--font-sans` is not defined anywhere at `:root` in Next's compiled output.** `next/font`
  (Poppins, in `app/layout.tsx`) only defines the `--font-sans` custom property scoped to a
  content-hashed class (`.poppins_<hash>-module__*__variable`) that Next applies to `<body>` at
  runtime - every other rule just *consumes* `var(--font-sans)`. A design built with this DS
  would never have that class, so `--font-sans` would resolve to nothing and every component
  would silently render in `system-ui` instead of the real brand font - found by grepping the
  compiled CSS for `--font-sans:` (a definition, not a usage) and seeing only the hashed-class
  hit. `cfg.buildCmd` now appends a real `:root{--font-sans:"Poppins","Poppins Fallback"}` rule
  after the copy. If re-deriving `cssEntry` by hand on a future re-sync, re-add this or ship
  fonts that silently never render.

## Re-sync risks
- **Button.tsx uses `next/link`; Marquee.tsx uses `next/image`; CtaRow.tsx imports Button.**
  Confirmed (not speculative) - the actual failure was `ReferenceError: process is not
  defined`: both Next.js components read many `process.env.__NEXT_*` internals (router base
  path, image-opts, trailing-slash config, etc.) that only exist inside a real Next.js runtime,
  and esbuild has no way to strip or polyfill them. This isn't a preview-only problem - the
  same code ships inside `_ds_bundle.js`, so any design built with `AurifyUI.Button` or
  `AurifyUI.Marquee` would crash at runtime in the actual product, and because every component
  shares one IIFE, an unguarded module-init failure there could have taken every other
  component down with it too. No config override fixes this (the only `define` available is
  hardcoded in the un-forkable `lib/bundle.mjs`). **User decision**: excluded all three via
  `componentSrcMap: {Button: null, Marquee: null, CtaRow: null}` for this sync. Fix upstream
  (recommended for whoever maintains this repo): give `Button` an `as`/render-prop or plain
  `<a>` fallback so it doesn't hard-depend on `next/link`, and same idea for `Marquee`/`next/image`
  - then drop the exclusions and re-sync.
- The `.design-sync/overrides/source-kit.mjs` fork (see `cfg.libOverrides`) is load-bearing -
  without it, `export * from` silently drops every default-exported component (all 9 in this
  repo use `export default function Name()`), and `[BUNDLE_EXPORT]` fails the whole sync. If a
  future design-sync skill update changes `lib/source-kit.mjs` upstream, diff it against the
  fork before re-syncing (per the base skill's fork-maintenance guidance).
- This repo has no `node_modules/aurify-website` self-reference (npm won't self-install a
  package into its own tree), which the synth-entry path needs to resolve `PKG_DIR` correctly
  without `--entry` forcing a fake dist entry. Fixed with a **Windows junction**:
  `New-Item -ItemType Junction -Path node_modules/aurify-website -Target .` (PowerShell) - NOT
  `ln -s`, which on this machine's Git Bash silently fell back to a real recursive directory
  copy instead of a symlink (confirmed via `fsutil reparsepoint query` + a bare `rmdir` probe
  before it was safe to delete). The `.design-sync/overrides/source-kit.mjs` fork also needs
  `.design-sync/node_modules` → junction → `.ds-sync/node_modules` so its bare `ts-morph`
  import resolves from the fork's location. Both junctions are gitignored (live in
  `node_modules`/`.design-sync/node_modules`) and must be recreated on a fresh clone before any
  re-sync - they will NOT survive `git clone`.
- The compiled CSS bundle is **whole-app**, not scoped to `components/ui` - it's a superset
  (includes every Tailwind class used anywhere in the site). Harmless for rendering, but means
  `cssEntry` doesn't shrink even if synced component scope narrows.
- No `.d.ts` build exists, so prop contracts (`<Name>.d.ts`) are synthesized from TSX source.
  If a component's props come from a complex generic or type alias, the synthesized contract
  may be weaker than what a real `tsc` build would emit - check `[DTS_PARSE]`/`[DTS_REACT]`
  warnings on first build.
- Preview scope for this sync: **floor cards only** (user's explicit choice) - all 6 synced
  components ship as name-only placeholder previews, not rendered compositions. Fully
  functional/importable either way; authoring real `.design-sync/previews/<Name>.tsx` files is
  a standing, incremental offer on any future re-sync (see package SKILL.md §4.2). `CountUp`
  specifically renders "NaN" on its floor card (needs real numeric props) - same category as
  the others, not a distinct bug.
