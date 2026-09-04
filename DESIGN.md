---
name: MET Mastery
description: Calm, clinical MET prep platform for nurses and healthcare professionals — teacher-run diagnostic → homework → feedback loop.
colors:
  primary: "#19647E"
  primary-hover: "#0F4C61"
  primary-light: "#D9F0F1"
  accent: "#FFC857"
  accent-hover: "#19647E"
  accent-light: "#FFF8E7"
  accent-text: "#1F2041"
  orange-text: "#1F2041"
  bg: "#FFFFFF"
  surface: "#FFFFFF"
  ink: "#1F2041"
  ink-muted: "#4B3F72"
  border: "rgba(25,100,126,0.26)"
  on-dark: "#FFFFFF"
  on-dark-muted: "rgba(255,255,255,0.7)"
  hero-deep: "#1F2041"
  hero-orb: "rgba(17,157,164,0.24)"
  brand-mark-accent: "#FFC857"
  shadow-ink: "rgba(31,32,65,0.12)"
  shadow-soft: "rgba(31,32,65,0.04)"
  success: "#3A845F"
  warning: "#A56931"
  error: "#A34E48"
  info: "#19647E"
  section-reading: "#19647E"
  section-listening: "#1F2041"
  section-speaking: "#19647E"
  section-writing: "#4B3F72"
  overlay: "#0F1B2D"
  scrim: "rgba(0,0,0,0.3)"
  /* Stitch redesign overlay palette (loaded last via stitch-theme.css).
     These colors intentionally extend the MET system with Stitch-brand hues.
     They are not drift — they are an approved overlay palette. */
  stitch-rust: "#a95325"
  stitch-rust-soft: "#fff0e6"
  stitch-deep: "#123f46"
  stitch-teal-soft: "#dff1ef"
  stitch-accent: "#a95325"
  stitch-accent-hover: "#8c4420"
  stitch-accent-text: "#6b3a17"
  stitch-accent-soft: "rgba(169, 83, 37, .10)"
  stitch-success-bg: "#e8f2f1"
  stitch-card-bg: "#ffffff"
  stitch-ink: "#173338"
  stitch-ink-muted: "#455f62"
  stitch-border: "#d4e2e0"
  stitch-paper: "#f2f7f6"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.045em"
    textTransform: "uppercase"
  mono:
    fontFamily: "Space Mono, monospace"
    fontWeight: 400
    letterSpacing: "-0.02em"
  scale:
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    2xl: "1.5rem"
    3xl: "2rem"
    4xl: "2.5rem"
    hero: "1.85rem"
    display: "clamp(1.85rem, 4vw, 3rem)"
    max: "3rem"
rounded:
  sm: "8px"
  xs: "4px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "99px"
  focus: "6px"
  brand-mark: "8px 8px 8px 2px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "0.625rem 1rem"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary-hover}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 1rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
---

# Design System: MET Mastery

## Overview

**Creative North Star: "The Clinical Consult Room"**

MET Mastery is a teacher-run MET (Michigan English Test) prep platform for nurses and healthcare professionals. The interface should feel like a calm, competent clinical environment: low visual noise, high information density where the workflow needs it, and a single deep-teal accent that signals action without shouting. Every screen serves the diagnose → assign → review → feedback loop; the teacher owns the workflow and the student sees concrete progress.

The system is intentionally restrained. Teal carries structure and primary action; a warm amber/orange carries highlights, active states, and the "human" warmth of feedback. The brand palette is restrained to two voice colors — teal for action, amber for warmth — while semantic status colors (success/warning/error/info) use conventional hues. Surfaces are soft and paper-like; depth comes from faint teal-tinted shadows, not heavy borders.

**Key Characteristics:**
- Deep teal (`#2D7A8C`) as the brand action color; warm amber (`#E08E45`) as its companion.
- Soft, warm off-white surfaces (`#FFFFFF` on `#FDFCF8`), close to white by design.
- DM Sans for UI, Cormorant Garamond for display/serif moments, Space Mono for data/code.
- 8–20px radius scale; 44px minimum touch targets on every interactive control.
- Light and dark themes are both composed from one token set — dark mode is a real dark surface, not an inverted light theme.

## Colors

A warm-clinical palette: teal carries brand action and structure, warm amber carries highlights and human warmth, and semantic status colors (success/warning/error/info) use conventional, instantly-readable hues. Restraint is the point: the saturated teal appears on ≤10% of any screen so its rarity reads as authority.

### Primary
- **Deep Teal** (`#2D7A8C`): primary action, active navigation, links, focus rings, progress fills, section coding for reading/writing. Hover `#1F5A67`, tint `#E2F0F3`.
- **Amber** (`#E08E45`): highlights, active states, speaking-section coding, warm feedback moments. Used sparingly; never as a background for body text. Hover `#C67833`, tint `#FBF0E4`.

### Neutral
- **Page** (`#FDFCF8`): app page background — a warm off-white, not pure white.
- **Surface** (`#FFFFFF`): cards, panels, inputs; the raised paper layer.
- **Ink** (`#1A2E35`): primary text and icons.
- **Ink Muted** (`#67777B`): secondary text, captions, meta.
- **Border** (`#E8E5DF`): hairline structure and input strokes.

### Semantic
- **Success** (`#3D8C65`): conventional green — confirms completion and correct answers. Background `#EDF7F1`.
- **Warning** (`#C9803C`): amber-brown for cautions and due dates; text `#804E1E` on `#FAF2E8`.
- **Error** (`#A34E48`): muted clay-red for destructive/incorrect; text on `#FAECEB`.
- **Info** (`#2D7A8C`): shares the brand teal for neutral notices; background `#E2F0F3`.

### Section coding (diagnostic → homework → feedback)
- Reading / Writing → Deep Teal (`#2D7A8C`)
- Listening → Green (`#3D8C65`)
- Speaking → Amber (`#E08E45`)

### Named Rules
**The One Voice Rule.** The primary teal owns primary action and active state only. Decorative teal (tints, shadows) is desaturated; the saturated `#2D7A8C` is rare and therefore authoritative.

**The Warm Companion Rule.** Amber is the brand companion — it encodes speaking sections, highlights, and human feedback. Semantic status colors (success-green, error-red, warning-amber, info-teal) are permitted only as *status*, never as brand surfaces or primary actions.

## Typography

**Display Font:** Cormorant Garamond (Georgia serif fallback)
**Body Font:** DM Sans (Inter sans fallback)
**Label/Mono Font:** Space Mono for data, scores, and code; DM Sans uppercase for field labels

**Character:** Clinical and editorial. Serif display lends the calm authority of a textbook; DM Sans keeps the dense workflow scannable; Space Mono makes scores feel measured and exact.

### Hierarchy
- **Display** (600, `clamp(1.85rem, 4vw, 3rem)` / 1.08, -0.025em): page headlines, hero statements. Landing hero may scale to `clamp(2rem, 7vw, 5.5rem)` as editorial variant.
- **Title** (600, ~1.25–1.5rem): section and card titles. Landing section h3 at `1.5rem` / `1.75rem` are approved variants.
- **Body** (400, 1rem / 1.55): default text; max line length 65–75ch. Landing lede at `1.125rem` is an approved large-body variant.
- **Label** (700, 0.72rem, 0.045em, uppercase): field labels, table headers, filter tags.
- **Mono** (400, Space Mono, -0.02em): scores, bands, data — e.g. `3.5rem` B2 score, `0.75rem` captions.
- **Scale tokens:** `xs 0.75rem / sm 0.875rem / base 1rem / lg 1.125rem / xl 1.25rem / 2xl 1.5rem / 3xl 2rem / 4xl 2.5rem / display clamp(1.85rem,4vw,3rem)`

### Named Rules
**The Measured Score Rule.** Numeric scores and bands render in Space Mono so they read as data, not prose.

## Layout

A centered content column (`min(100% - 2rem, 1120px)`, teacher) / app shell with a fixed sidebar on desktop and a bottom nav on mobile. Density is moderate: dashboards use bento/card grids; workflow screens use a single primary column with secondary actions in a "More" menu. Spacing rhythm follows the 8px scale (0.5 / 1 / 1.5 / 2rem). Breakpoints: ≤1024 tablet, ≤860 student-mobile, ≤768 teacher-mobile, ≤420 / ≤390 small-mobile.

## Elevation & Depth

Depth is conveyed by faint, cool teal-tinted shadows on a paper surface — not by borders. Surfaces are flat at rest; shadow appears on hover, elevation, and focus. Dark mode shifts shadows darker and softer.

### Shadow Vocabulary
- **Card** (`0 1px 4px rgba(26,46,53,0.04)`): resting surface.
- **Modal** (`0 12px 36px rgba(26,46,53,0.14)`): overlay elevation.
- **Float** (`0 18px 45px rgba(26,46,53,0.08)`): sticky/topbar and popovers.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow is a response to state (hover, focus, elevation), never a constant.

## Shapes

Gently rounded rectangles. Radius scale: 8px (controls, inputs, chips), 12px (cards, panels), 16px (large containers, hero), 20px (xl), 99px (pills, badges, progress). Borders are 1px hairlines; selections use a teal border + tint rather than a heavy outline.

## Components

### Buttons
- **Shape:** 8px radius, 44px min height.
- **Primary:** background `#2D7A8C`, white text; hover `#1F5A67`.
- **Secondary / Ghost:** transparent background, `#1F5A67` text, teal border; used for lower-emphasis actions.
- **Focus:** 3px ring `rgba(45,122,140,0.2)` (light) / `rgba(95,184,196,0.35)` (dark). Icon-only buttons MUST carry an `aria-label`.

### Cards / Containers
- **Corner:** 12px. **Background:** `#FFFFFF`. **Border:** none at rest; 1px `#E8E5DF` on hover/selection. **Padding:** 1.5rem. **Shadow:** card vocabulary.

### Inputs / Fields
- **Style:** 1px `#E8E5DF` stroke, `#FFFFFF` fill, 8px radius.
- **Focus:** border `#2D7A8C` + focus ring, outline 0.
- **Error:** clay border `#A34E48` + `role="alert"` message in `#804E1E`/`#A34E48`.
- **Label:** uppercase DM Sans 0.72rem, `#67777B`.

### Navigation
- **Desktop:** fixed left sidebar; active item gets `#E2F0F3` tint + `#1F5A67` text + teal indicator.
- **Mobile:** fixed bottom bar, 48px targets, five daily destinations; secondary items in a "More" popover.

### Chips / Pills / Tabs
- **Pill:** 99px radius, teal-tinted fill, ink text; selected uses teal border + stronger tint.
- **Tab line:** ink-muted text, teal underline on active.

## Do's and Don'ts

### Do:
- Do keep the saturated primary teal rare — reserve it for action and active state.
- Do use `#FDFCF8` page / `#FFFFFF` surface; the system is intentionally warm and near-white.
- Do give every interactive control a 44px minimum touch target.
- Do label icon-only buttons and inputs with `aria-label`.
- Do flip the full token set in dark mode (already composed in `dark.css`).

### Don't:
- Don't introduce a third *brand* hue — teal is the action color and amber is its only companion. Semantic status colors (success-green, error-red, warning-amber, info-teal) are allowed only as status, never as brand surfaces or primary actions.
- Don't use green for brand action or primary buttons; green is reserved for success status only.
- Don't rely on color alone for state (error/success need text or icon).
- Don't hard-code hex in components; consume tokens from `tokens.css` (the single source of truth).
- Don't edit the root-level duplicate `components.css` / `redesign.css` / `tokens.css` — they are dead copies of `src/styles/*`.

## Stitch Redesign Overlay

This design system overlay (`stitch-theme.css`, loaded last via `system.css`) applies the Stitch brand palette on top of the MET Mastery design foundation. The MET system remains the single source of truth for semantic colors, typography, and spacing; the Stitch overlay re-colors certain components for visual brand differentiation.

### Stitch Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `stitch-rust` | `#a95325` | Accent color for todo items, badges, active states |
| `stitch-rust-soft` | `#fff0e6` | Soft rust background for completed steps |
| `stitch-deep` | `#123f46` | Deep teal-brown for topbar gradients |
| `stitch-teal-soft` | `#dff1ef` | Soft teal tint for surfaces and inputs |
| `stitch-accent` | `#a95325` | Stitch rust — sole companion hue (replaces MET amber in overlay) |
| `stitch-accent-hover` | `#8c4420` | Hover state for accent |
| `stitch-accent-text` | `#6b3a17` | Text on accent backgrounds |
| `stitch-accent-soft` | `rgba(169, 83, 37, .10)` | Subtle accent overlay |
| `stitch-success-bg` | `#e8f2f1` | Success state background (teal-tinted) |
| `stitch-card-bg` | `#ffffff` | Card background in overlay mode |
| `stitch-ink` | `#173338` | Primary text color in overlay |
| `stitch-ink-muted` | `#455f62` | Muted text in overlay |
| `stitch-border` | `#d4e2e0` | Border color in overlay |
| `stitch-paper` | `#f2f7f6` | Page background in overlay |

### Radius Scale

The Stitch overlay uses a slightly expanded radius scale for cards and inputs:

| Token | Value | MET Equivalent |
|-------|-------|----------------|
| `--mm-radius` | `14px` | Between MET `md` (12px) and `lg` (16px) |
| `--radius-lg` | `14px` | — |
| `--radius-xl` | `18px` | Between MET `xl` (20px) and pill (99px) |

### Shadow Vocabulary (Stitch)

| Token | Value | Description |
|-------|-------|-------------|
| `--mm-shadow` | `0 20px 55px rgba(23, 51, 56, .1)` | Elevation shadow for overlayer cards |
| `--shadow-sm` | `0 1px 2px rgba(23, 51, 56, .04)` | Small shadow |
| `--shadow-md` | `0 2px 10px rgba(23, 51, 56, .06)` | Medium shadow |
| `--shadow-card` | `0 1px 4px rgba(23, 51, 56, .05)` | Card shadow |
| `--shadow-lg` | `0 10px 24px rgba(23, 51, 56, .08)` | Large shadow |
| `--shadow-xl` | `0 18px 40px rgba(23, 51, 56, .10)` | Extra-large shadow |

### Import Order Note

`stitch-theme.css` is loaded **last** in `system.css` (`tokens → base → components → responsive → dark → redesign → stitch-theme`). This ensures the Stitch palette wins over all earlier tokens for Stitch-branded components, while MET-typed components continue to consume from `tokens.css` as their single source of truth.

### When to Use Each System

- **MET Mastery components** (buttons, forms, cards without `.stitch-` prefix): Consume tokens from `tokens.css` — the canonical MET design system.
- **Stitch-branded components** (`.stitch-` prefixed, or components inside Stitch-branded screens): May consume from `stitch-theme.css` for brand-consistent coloring.
- **Never mix**: Do not use `var(--mm-*)` and `var(--surface)` / `var(--primary)` from different systems in the same component without intentional override.
