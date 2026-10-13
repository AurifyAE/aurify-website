# Scroll Guide Laptop — Design

**Date:** 2026-10-13
**Scope:** Home page, Hero → ProblemInterlude
**Status:** Approved in brainstorming, awaiting spec review

## Goal

One 3D laptop on a fixed canvas accompanies the visitor from the Hero to the
Problem section. At each section it moves left / centre / right, rotates to sit
beside that section's text, and its screen shows the matching product view —
a product guide walking alongside the scroll.

## Decisions

| Topic | Decision |
|---|---|
| Object | Space-grey laptop modelled in three.js code (no designer, no GLB file), built and approved part by part |
| Screen | Changes per section (crossfade between product screenshots) |
| Stack | React Three Fiber + drei, GSAP ScrollTrigger drives the pose |
| Layer | Canvas **in front** of sections, `pointer-events: none` (sections have opaque backgrounds) |
| Mobile (< md) | Hero station only, fades out as the hero leaves |
| Reduced motion | Static open laptop at the hero station, no scroll-driven motion |
| Range | Hero → end of ProblemInterlude pin, then exits |

## Choreography

Stations are data in `stations.ts`; each is
`{ x, y, rotX, rotY, scale, lid, screen }` (x/y in viewport-relative units,
lid 0 = closed, 1 = open ~105°).

| # | Section | Range | Pose | Screen |
|---|---|---|---|---|
| 0 | Hero | load | Centre, lower third inside the dial rings, ~15° toward viewer, **lid closed**; rises in once loaded | — |
| 0→1 | Hero exit | hero scrolls out | **Lid opens to ~105°**, travels right, turns toward the text | `overview` fades in |
| 1 | LifecycleStrip (pinned, 6 stages) | inside the pin | Right, in the stage card's slot; ~4° extra yaw per stage | `stage-1` … `stage-6` |
| 1→2 | Opportunity | section passes | Turns edge-on, moves to the empty space right of the heading, scale ~0.6, clear of the 3-column grid | `overview` |
| 3 | ProblemInterlude (pinned) | inside the pin | Right, in the convergence cluster's slot, angled back toward the text | `fragmented` → each gap line pulls one fragment into the screen → closer line resolves to `unified` |
| exit | after Problem pin | — | Lid half-closes, scales down, fades out | — |

## Architecture

### New files (`components/guide/`)

- **`stations.ts`** — the station list above. The only file touched when tuning poses.
- **`GuideCanvas.tsx`** — client component. Fixed `inset-0` layer,
  `pointer-events-none`. Renders the R3F `<Canvas>` with
  `frameloop="demand"` and `dpr={[1, 1.5]}`. Builds the GSAP ScrollTriggers
  that tween a single plain `pose` object between stations and call
  `invalidate()` on update. Scroll position never enters React state
  (matches `AppProviders` rule).
- **`model.ts`** — `buildLaptop()`: the code-built laptop (see Model).
- **`Laptop.tsx`** — mounts `buildLaptop()` plus the lid logo; applies `pose` to the
  root group each frame, `pose.lid` to the `Lid` node's X rotation, and
  `pose.screen` to the `Screen` material: a two-texture mix uniform so screen
  changes crossfade.

### Changes to existing files

- **`app/page.tsx`** — `dynamic(() => import('@/components/guide/GuideCanvas'), { ssr: false })`.
  Mounted after hydration; zero first-paint cost.
- **Hero, LifecycleStrip, Opportunity, ProblemInterlude** — one
  `data-guide="hero|lifecycle|opportunity|problem"` attribute each.
- **LifecycleStrip** — the desktop stage card gets a class hidden only under
  `html.guide-on`.
- **ProblemInterlude** — fragments converge on the laptop screen's position;
  ring hidden under `html.guide-on`. Its own GSAP timeline stays in charge.

### Pin sync

Guide triggers use the same section elements with `refreshPriority: -1`, so
they measure after both pins insert their spacers. Lifecycle stage index and
Problem line index derive from the trigger's progress over the pin distance,
the same way the sections compute their own stages.

### Fallbacks

`html.guide-on` is set **only after the model, screen textures and logo have loaded**. With no WebGL, a
load error (caught by an error boundary around the canvas), reduced motion
(no scroll rig), or mobile below the hero, the class is never set — the
stage cards and fragment cluster render exactly as today.

### Dependencies

`three`, `@react-three/fiber@9` (React 19), `@react-three/drei`,
`@types/three` (dev). ~200 KB gz, only in the lazily loaded guide chunk.

## Asset contract

### Model (code-built)

There is no designer, so the laptop is modelled in three.js code
(`components/guide/model.ts`) — no asset file to download, every proportion is
a number. Built and approved one part at a time on `/lab/guide`:

| Part | Content |
|---|---|
| 1 · Body | Rounded, bevelled aluminium base; rubber feet |
| 2 · Lid + hinge | Rounded lid shell pivoting on the hinge axis; hinge barrel |
| 3 · Display | Black glass bezel, 16:10 screen panel, camera dot |
| 4 · Keyboard deck | 77 keys (one instanced mesh per key size), key well, trackpad, speaker grilles |
| 5 · Branding + finish | Aurify wordmark (from `public/logo/aurify-logo.svg`) polished into the lid; final space-grey finish and lighting |

Contract the rig relies on (unit-tested):
- Real-world scale in metres (~14" laptop, 0.312 × 0.221 m), Y-up, front facing **+Z**, origin at base centre.
- Named nodes: `Base`; `Lid` — pivot **on the hinge axis**, **closed** at rotation 0; `Screen` — mesh, material `ScreenMat`, UVs 0–1, 16:10, v = 0 at the image top.
- ≤ 50k triangles total.

### Screen images

1600×1000 webp in `public/images/guide/`: `overview`, `stage-1`…`stage-6`
(reuse the existing lifecycle images), `fragmented`, `unified`.

## Build gates

Each gate ends with the user's confirmation before the next starts.

1. **Model**, one sub-gate per part (1.1 Body → 1.5 Branding) — `/lab/guide`
   (noindex) page: the laptop alone with orbit controls, lighting, lid
   slider, screen switcher.
2. **Canvas + Hero station** — fixed layer on the home page, load-in, lid closed.
3. **Hero exit + Lifecycle stations** — lid reveal, pin-synced stage poses and screens.
4. **Opportunity transit.**
5. **Problem finale + exit** — fragment convergence, `unified` resolve.
6. **Hardening** — mobile hero-only, reduced motion, WebGL-off, performance.
   `/lab/guide` removed.

## Verification (every gate)

- Browser preview: visual check + console clean.
- Scroll frame rate stays smooth (no long frames while scrubbing).
- Reduced-motion and WebGL-disabled runs show today's page unchanged.
- Lighthouse on `/` before vs after: Hero LCP does not regress.

## Out of scope

- The guide on any page other than home.
- Sections after ProblemInterlude.
- Interaction with the laptop (it never receives pointer events).
