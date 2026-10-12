# Ingot Scroll Guide - Design Spec

**Date:** 2026-10-12
**Branch:** `homepage-redesign`
**Scope:** Home page, Hero → ProblemInterlude (sections §1-§4)

## 1. Intent

One 3D object - a gold bullion ingot stamped with the Aurify mark - accompanies
the reader from the Hero down to the Problem section, like a product guide. It
lives in a single fixed canvas and travels left / right / centre, scaling and
rotating to sit beside each section's copy. After the Problem section it leaves.

**Success criteria**

- Motion is smooth on scroll (no jank against Lenis + the two existing GSAP pins).
- The ingot never covers readable text (Hero is the one deliberate exception:
  it sits *behind* the headline, softened - see §4.1).
- On-brand: gold metal, Aurify mark, brand palette around it.
- No first-load JS increase on `/` - `three` loads in its own lazy chunk.
- Built and approved one stage at a time (§7).

**Decisions already made**

| Question | Decision |
|---|---|
| Object | Gold ingot (trapezoid bullion bar, Aurify mark on top face) |
| Existing art | Ingot **replaces** the Hero orb and the Problem CSS convergence visual |
| Tight sections | Lifecycle + Opportunity layouts stay unchanged; the ingot adapts |
| Mobile | Lite 3D (same canvas, reduced path - §5) |
| Approach | Vanilla `three` + existing GSAP/ScrollTrigger, ingot built in code |
| Hero placement | Behind the headline, softened (blur + dim), sharpens on exit |

**Out of scope:** sections after ProblemInterlude, other pages, a modelled
`.glb` asset, React Three Fiber, any layout change to Lifecycle or Opportunity.

## 2. Architecture

### Layering

`LifecycleStrip` (`bg-paper`) and `ProblemInterlude` (`bg-mist`) have opaque
backgrounds, so a canvas literally behind the page would be hidden. The canvas
is therefore `position: fixed; inset: 0; pointer-events: none` **above section
backgrounds**, below the navbar, mobile menu, floating contact menu and modals.
In the Hero only, the copy wrapper gets a higher z-index than the canvas so the
ingot reads as behind the headline (works because the Hero is not pinned; pinned
sections create their own stacking context, which is fine because the ingot
sits in clear space there).

### Units

| Unit | Responsibility | Depends on |
|---|---|---|
| `lib/ingot/createIngot.ts` | Pure three.js. Builds the ingot as **4 flush fragments** in one `Group`; `MeshPhysicalMaterial` gold; Aurify mark rasterised from `public/logo/aurify-logo.svg` into a canvas texture used as a bump map on the top face; lighting from `RoomEnvironment` + PMREM (no HDR file). Returns `{ group, fragments }`. | `three` |
| `lib/ingot/ingotState.ts` | Small shared mutable object written by section timelines: `{ lifecycle: 0..1, split: 0..1 }`. | - |
| `lib/ingot/rectToWorld.ts` | Maps a dock's screen rect to world position + scale for the camera. Has an assert-based self-check script. | `three` (math only) |
| `components/three/IngotStage.tsx` | Client component. Mounts the canvas, dynamically imports `three` + `createIngot` after the hero has painted, runs the render loop, picks the active dock, damps the ingot toward it, applies the pose table and `ingotState`. | the above |
| `data-ingot-dock="hero" \| "lifecycle" \| "opportunity" \| "problem"` | Invisible boxes in each section's markup marking where the ingot sits. Placement stays in CSS, so pins, resizes and breakpoints need no JS geometry. | - |

`IngotStage` is rendered once from `app/page.tsx` (home only).

### Data flow (per frame)

1. Active dock = the dock whose section contains the viewport centre line
   (none after ProblemInterlude → exit).
2. Read that dock's `getBoundingClientRect()` (one read per frame) →
   `rectToWorld` → target position + scale. Lifecycle is the exception: its
   target is computed from `ingotState.lifecycle` (§4.2).
3. Position / scale damp toward target (frame-rate independent exponential
   damping). Rotation damps toward the dock's pose, plus a **bank** term
   proportional to horizontal velocity while travelling.
4. Fragment offsets = `ingotState.split` × each fragment's scatter vector.
5. Canvas `filter: blur() / opacity` eased by the Hero-softening factor.
6. Render. Loop pauses when no dock is active and the ingot has finished
   shrinking, or when `document.hidden`.

Section timelines **write** `ingotState`; they never touch three.js objects.
That keeps the Problem split on exactly the same scrub as its copy.

## 3. The ingot

- Trapezoid bullion profile: top face narrower than base, ~2:1 length:width,
  bevelled edges.
- Top face carries the Aurify mark as an engraved bump.
- Cut into 4 pieces that sit flush when `split = 0`. Each piece has a scatter
  vector + small scatter rotation used when `split > 0`.
- Material: physical gold (high metalness, low-mid roughness, warm base colour);
  environment reflections from `RoomEnvironment`.

## 4. Choreography (desktop, `md` and up, motion allowed)

| Phase | Dock | Size | Pose / behaviour | Driver |
|---|---|---|---|---|
| Hero | Orb's old position: centred, `top-[46%]` | ~40vmin | ~20° tilt toward viewer so the stamp shows; idle Y spin ~1 turn / 8s + gentle float; softened (blur + dim) | Time |
| → travel | down-left | shrinking | Banks into the turn; softening eases to 0 | Damped follow |
| Lifecycle (pinned) | Head of the gradient progress line, `top-[76%]` | ~10vmin | Lies along the line; **rolls 90° per stage** (6 stages) | `ingotState.lifecycle` |
| → travel | up-right | growing | Banks | Damped follow |
| Opportunity | Right of `SectionHeading`, top-right of content column, above stat cards | ~22vmin | Three-quarter view, stamp angled toward heading, slow float | Damped follow + time |
| → travel | into right column | growing | Settles front-on | Damped follow |
| Problem (pinned) | Existing right-column box (replaces the CSS fragments; box enlarged slightly) | ~28vmin | Fractures into 4 scattered fragments on entry; each gap line docks one fragment as it fades in; closer line reassembles the bar + one specular glint across the stamp | `ingotState.split` from Problem's scrub |
| Exit | none (Ecosystem at viewport centre) | → 0, fades | Loop pauses | Damped follow |

### 4.1 Hero details

- The orb markup and its keyframes are removed from `Hero.tsx`; the gradient
  washes, grid and crosshairs stay.
- The carousel's image banner ("E-Invoicing Seminar") covers the hero; the
  ingot fades out on image slides and returns on text slides.
- Headline contrast is checked on every text banner with the ingot behind it.

### 4.2 Lifecycle details

The line spans the whole track and scales from its left origin while the track
translates; the head's screen x is therefore `progress × viewportWidth`. The
dock target is `x = lerp(12vw, 88vw, progress)` at `y = 76%` of the viewport -
a band clear of the numerals, copy and image cards. Roll angle =
`progress × 5 × 90°`, so it lands square on each stage when the strip
snaps (snap goes through `lenis.scrollTo`, which the scrub follows; a
stage-jump click gives a fast roll, which is acceptable).

### 4.3 Problem details

The existing timeline already scatters four DOM fragments and docks one per
line. That DOM visual is removed; the same tweens instead drive
`ingotState.split` in four steps (1 → 0.75 → 0.5 → 0.25 → 0) so fragment *i*
docks with gap line *i*, and the closer line triggers the glint.

## 5. Mobile lite (below `md`)

Lifecycle and Problem use vertical full-width layouts on mobile, so there is no
clear space beside text.

- Hero: same as desktop (behind headline, softened), ~55vw.
- Lifecycle, Opportunity: ingot scales to 0 (would otherwise cover text).
- Problem: reappears above the stacked list, small, assembled, slow spin; no split.
- Budget: DPR ≤ 1.5, antialias off, fewer bevel segments, loop paused when hidden.

## 6. Reduced motion, failure, performance

- **Reduced motion** (any width): ingot visible at each dock pose; no idle spin,
  no banking, no travel - cross-fade between docks; Problem shows the assembled bar.
- **WebGL unavailable / no JS:** canvas never mounts. Hero keeps its washes +
  grid; Problem's right column collapses. No fallback image.
- **Performance:** `three` in a lazy chunk imported after hero paint; DPR ≤ 2
  desktop; single draw group; loop pauses off-screen / hidden tab; one
  `getBoundingClientRect` per frame.

## 7. Build stages (each needs explicit approval before the next)

| # | Stage | Proof shown for approval |
|---|---|---|
| 1 | Ingot alone on a dev-only page, drag to rotate | Screenshots: front, three-quarter, top (stamp) |
| 2 | Fracture with a split slider on the same page | Screenshots at split 0 / 0.5 / 1 |
| 3 | Fixed canvas on `/` + Hero dock (orb removed) | 1440 + 375 screenshots, headline contrast, clean console, `next build` first-load JS unchanged |
| 4 | Lifecycle dock + roll | Screenshots at stages 1 / 3 / 6 |
| 5 | Opportunity dock + travel | In-transit + docked screenshots |
| 6 | Problem split/dock + exit (CSS fragments removed) | Each gap line, closer, post-exit |
| 7 | Mobile lite, reduced motion, perf pass | 375 screenshots, reduced-motion emulation, frame-time sample over a full scroll |

The dev-only page from stages 1-2 is deleted at the end of stage 7.

## 8. Testing

- `lib/ingot/rectToWorld.ts` gets an assert-based self-check script (the repo
  has no test runner; none is added).
- Everything else is verified visually in the browser preview at each stage gate.

## 9. Risks

- Mobile GPU cost of the lite mode on low-end phones - measured in stage 7; the
  fallback lever is dropping mobile to Hero-only.
- Per-frame rect read alongside Lenis + two pins - proven in stage 3/4.
- Hero headline legibility over gold - mitigated by softening; checked in stage 3.
