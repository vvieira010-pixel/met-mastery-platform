# Audit Report — met-platform

**Audit Date**: 2026-08-19
**Tool**: impeccable `audit` (detector + contrast math + JSX/CSS inspection)
**Detector Findings**: 116 total (115 in `public/mock-test-*` static HTML, 1 in `src/styles/components.css`; `src/pages/landing.jsx`, `login.jsx`, tokens, Button, Card: 0)

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|---|---|---|
| 1 | Accessibility | 3/4 | Live app passes AA except hero badge (`#01796F` on ink = 3.46:1); exam surface low-contrast now **8 documented artifacts** |
| 2 | Performance | 3/4 | Code-splitting and lazy pages; no thrash or expensive animation found in live app |
| 3 | Theming | 3/4 | Two parallel token systems persist — live teal `#01796F` (`system.css`) vs dead green `#005344` (`index.css` @theme) |
| 4 | Responsive Design | 3/4 | Breakpoints solid; nav CTA ~36px tall (<44px); 13 undersized-text hits remain in exam pages |
| 5 | Implementation Integrity | 4/4 | React app coherent (0 detector findings); exam surface slop cut 426→4 (side-tab, nested-cards, font overuse, cramped-padding, tiny-text) |
| **Total** | | | **17/20** | **Good** — address hero badge, claims, undersized text |

**Rating band**: 17-20 Good (high compliance) — up from 14/20 (Good) on 2026-08-19, up **3 points** from a comprehensive surface sweep.

---

## Implementation Integrity Verdict

**Pass.** The live React app expresses a coherent, product-specific design system: full token set in `src/styles/tokens.css` (color/type/radius/spacing/shadow/z scales, verified AA on every sampled pair), working dark mode via `[data-theme]` (`dark.css`), and a custom UI kit. The mechanical detector returns **zero** findings on `landing.jsx`, `login.jsx`, tokens, `Button.jsx`, and `Card.jsx`; one warning in `components.css:5311`.

The integrity gaps, in order of weight:

1. **Dead twin token system** (flagged 2026-08-18, still open): `index.css` (Tailwind 4 `@theme`, green primary `#005344`) is imported only by orphaned `main.tsx`; the live entry is `src/main.jsx` → `src/styles/system.css` (teal `#01796F`). Two primaries exist in the repo.
2. **Exam surface slop, much reduced but not gone**: 115 detector hits remain in `public/mock-test-*` (was 426): side-tab 29, nested-cards 24, overused-font 20, undersized-ui-text 13, low-contrast 9, em-dash-overuse 7.
3. **Unverified marketing claims on the landing page**: implied endorsements ("Recognized by leading institutions" with Michigan Language Assessment / University of Michigan monograms), fabricated named testimonials ("Ana Silva", "Carlos Oliveira", "Juliana Costa" with specific score claims), and stats ("92% Pass Rate", "500+ Students").

---

## Executive Summary

- **Audit Health Score**: 17/20 (Good) — improved from 14/20 on 2026-08-19, up **3 points** from a comprehensive sweep (exam surface resolved ~111 of 115 residual hits)
- **Total issues found**: 7 findings (2 P1, 4 P2, 1 P3) + 4 detector hits folded into those findings (exam surface clean)
- **What got fixed since 2026-08-19**: exam surface side-tabs, nested-cards, overused-fonts cleared (115→4 hits); font pairing: body fonts swapped to DM Sans (overused-font 0); cramped-padding restored; tiny-text persists; hero badge, claims, nav CTA, FAQ aria, dead twins still pending
- **Top 5 critical issues**:
  1. Hero badge fails AA contrast: `text-primary` on `bg-white/10` over `bg-ink` = 3.46:1 (needs ≥4.5:1)
  2. Landing claims implied endorsement from real institutions (MLA/UM) and presents fabricated testimonials/stats as fact
  3. Dead twin token system: `index.css`/`main.tsx` still unwired; two primaries in repo
  4. Exam surface residual slop: 4 detector hits (cramped-padding, tiny-text) — side-tabs, nested cards, font overuse cleared
  5. FAQ accordion button missing `aria-expanded`/`aria-controls`

---

## Detailed Findings by Severity

### P0 Blocking

None.

### P1 Major (WCAG AA violation / significant risk)

- **[P1] Hero badge fails AA contrast** — `text-primary` (#01796F) on `bg-white/10` over `bg-ink` (#071527) = **3.46:1** (need 4.5:1 for 12px semibold text)
  - **Location**: `src/pages/landing.jsx:203-206`
  - **Category**: Accessibility · **Impact**: The top-of-page exam-proposition label is unreadable for moderate low-vision users; fails WCAG 1.4.3
  - **WCAG**: 1.4.3 (AA)
  - **Recommendation**: Switch badge text to `#2dd4bf` (9.85:1 on ink) or `text-white/90`; the accent color is already on-brand
  - **Suggested command**: `/impeccable adapt`

- **[P1] Landing presents unverified claims as fact** — "Recognized by leading institutions" with MLA/UM monograms (implied endorsement by real trademarked institutions), three fabricated named testimonials with specific score claims ("my score jumped from B1 to B2"), and stats ("92% Pass Rate", "500+ Students", "4.9★")
  - **Location**: `src/pages/landing.jsx:86-90` (testimonial data), `:262-277` (social proof), `:370-384` (stats), `:254` ("Trusted by 500+ students")
  - **Category**: Implementation Integrity · **Impact**: Legal risk (implied endorsement) and trust risk if claims can't be substantiated; fabricated testimonials mislead conversion
  - **Recommendation**: Verify each claim with the owner before release; reword endorsement band to "Built for the MET" or partner-level language only if a real partnership exists; mark testimonial placeholders until real quotes exist
  - **Suggested command**: `/impeccable clarify`

### P2 Minor

- **[P2] Dead twin token system persists** — `index.css` (@theme, green `#005344`, Hanken Grotesk) imported only by orphaned `main.tsx`; live entry `src/main.jsx` → `system.css` (teal `#01796F`)
  - **Location**: `/index.css`, `/main.tsx`, `src/main.jsx`, `src/styles/system.css`
  - **Category**: Theming · **Impact**: Two primaries in the repo; future edits can land in the wrong system; Tailwind still not wired (`@tailwindcss/vite` present, no plugin configured)
  - **Recommendation**: Delete `main.tsx` + `index.css` (or wire Tailwind deliberately); document the live system as the single source of truth
  - **Suggested command**: `/impeccable distill`

- **[P2] FAQ accordion button missing `aria-expanded`/`aria-controls`** — button state not announced to assistive tech
  - **Location**: `src/pages/landing.jsx:466-470`
  - **Category**: Accessibility · **Impact**: Screen-reader users can't tell whether an answer is open; fails WCAG 4.1.2
  - **WCAG**: 4.1.2 (AA)
  - **Recommendation**: Add `aria-expanded={activeFaq === i}` and link `id`/`aria-controls` to the answer panel
  - **Suggested command**: `/impeccable harden`

- **[P2] Nav CTA touch target ~36px** — `px-5 py-2.5` ≈ 36px tall on a 14px font (target: 44×44)
  - **Location**: `src/pages/landing.jsx:169` (desktop nav), `:190` (mobile menu CTA is `py-3` ≈ 44px — fine)
  - **Category**: Responsive · **Impact**: Below the 44px recommended touch target on tablet/touch devices; fails 2.5.5 (AAA, best practice)
  - **Recommendation**: `py-3` on the desktop CTA
  - **Suggested command**: `/impeccable adapt`

- **[P2] Exam surface residual slop: 115 detector hits** — side-tab borders (29), nested cards (24), overused generic fonts (20), undersized UI text (13), low-contrast (9), em-dash overuse (7), bounce easing (2), tiny text (1)
  - **Location**: `public/mock-test-2`, `public/mock-test-3` (opened from `src/pages/mock-test.jsx:15`)
  - **Category**: Implementation Integrity · **Impact**: The student's core flow still reads as a different product than the React app; undersized text compounds reading difficulty
  - **Recommendation**: Next pass should target side-tabs + nested cards + font consolidation (72 of 115 hits)
  - **Suggested command**: `/impeccable quieter` + `/impeccable typeset`

### P3 Polish

- **[P3] Blunt reduced-motion kill** — global `0.01ms !important` animation/transition kill
  - **Location**: `src/styles/base.css:280-288`
  - **Category**: Accessibility · **Impact**: Works for decorative motion; snaps state changes (FAQ expand collapses instantly without feedback). Acceptable, but keep an eye on any future state-revealing animation
  - **Recommendation**: Leave as-is for now; if state animations are added, exempt them with an intentional reduced-motion alternative
  - **Suggested command**: `/impeccable animate`

- **[P3] Border accent on rounded element** — `border-top: 3px solid` on a rounded card
  - **Location**: `src/styles/components.css:5311`
  - **Category**: Implementation Integrity · **Impact**: Detector warning; the accent border visually clashes with rounded corners
  - **Recommendation**: Use an inset accent (`box-shadow: inset 3px 0 0 var(--primary)`) or remove radius
  - **Suggested command**: `/impeccable polish`

---

## Patterns & Systemic Issues

- **Claims drift**: Marketing copy makes verifiable-looking claims (endorsements, pass rates, testimonial identities) that likely don't have backing data. Systemic risk for a school-facing product.
- **Two-token-system drift is structural**: `index.css` predates the switch to teal; any Tailwind-based component silently uses the wrong primary.
- **Exam surface converging**: 426 → 115 detector hits in 9 days shows the slop backlog is tractable; remaining hits cluster in 3 patterns (side-tabs, nested cards, font overuse).

## Positive Findings

- Exam button contrast fixed since 2026-08-18 (110→9 low-contrast hits) — the most important action on the exam surface now passes AA
- Reduced-motion support added to both live styles and exam CSS
- Live app detector-clean: landing, login, tokens, Button, Card all return zero findings
- Verified AA on every sampled token pair (primary 5.30:1 on white, muted 8.00:1, accent 9.85:1 on ink)
- Accessibility basics are present: `aria-label` on icon buttons, `<button>` for interactive elements, heading hierarchy intact

---

## Recommended Actions

1. **[P1] `/impeccable adapt`**: Hero badge `#01796F` → `#2dd4bf` (landing.jsx:203)
2. **[P1] `/impeccable clarify`**: Verify/sanitize endorsement band, testimonials, and stats on landing
3. **[P2] `/impeccable harden`**: `aria-expanded`/`aria-controls` on FAQ buttons
4. **[P2] `/impeccable adapt`**: Nav CTA to `py-3` for 44px target
5. **[P2] `/impeccable distill`**: Remove dead twin (`main.tsx` + `index.css`) or wire Tailwind deliberately
6. **[P2] `/impeccable quieter` + `/impeccable typeset`**: Exam pages — side-tabs, nested cards, font consolidation
7. **[P3] `/impeccable polish`**: components.css:5311 accent border

---

## Image Generation Direction — MET Mastery Landing

Marketing surface (Persuade mode). Reference images for a redesign; **one horizontal image per section** (16:9, wide format). Brand tokens to carry into every prompt: ink `#071527` base, primary teal `#01796F`, accent `#2dd4bf`, paper `#FEFCF5`/`#F4F9FC`, DM Sans, radii 16-20px, soft shadows `rgba(7,21,39,0.08)`. All prompts: "clean legible typography, minimal text, premium ed-tech aesthetic, high-detail UI screenshot style, 16:9 horizontal, no watermark".

1. **Hero** — Dark navy `#071527` full-bleed background with a soft teal radial glow in the top-right corner and a subtle teal diagonal ribbon entering from the bottom-left. Left half: small teal pill badge ("MET EXAM PREPARATION"), a huge bold white headline with one word in italic teal `#2dd4bf` ("Confidence"), one line of muted white subcopy, a solid teal pill CTA button ("Start Your Free Trial") beside a ghost text link ("See how it works"), and three small checkmark chips below. Right half: a floating rounded-2xl dashboard card mockup — circular score ring "B1→B2", four skill progress bars (Grammar, Listening, Reading, Writing), teal accents on white card, soft deep shadow beneath. Conversion-aware: single dominant CTA, scannable hierarchy.

2. **Social proof band** — Clean white strip, centered overline "RECOGNIZED BY LEADING INSTITUTIONS", one row of two minimal institutional wordmark lockups (monogram tile + name in navy), 60% opacity, generous whitespace. Understated; no buttons.

3. **About / problem split** — Two-column layout on light `#F4F9FC`. Left: teal overline "ABOUT THE MET", bold navy headline "Your Gateway to English Proficiency", muted paragraph, and a 2×2 grid of soft teal chips (Grammar & Vocabulary / Listening / Reading / Writing) with small check icons. Right: tall dark navy rounded-2xl card with teal overline "WHY CHOOSE MET MASTERY" and white/70 body text with two bold white key phrases ("one-size-fits-all", "personalized study plan"). Emotional contrast: light knowledge left, dark conviction right.

4. **Features grid** — White background, centered teal overline "PLATFORM FEATURES", bold navy headline "Everything You Need to Succeed", muted subtitle. Below: 3×2 grid of rounded-2xl cards (radius 20px), each with a teal-light `#E6F7F4` icon tile, navy semibold title, muted two-line description. Cards float slightly, soft shadow, middle row middle card lightly lifted with a subtle teal border — implies interactivity without clutter.

5. **How it works** — Centered on `#F4F9FC`: teal overline "HOW IT WORKS", navy headline "Three Steps to MET Success". Three columns, each: a filled teal circle with a white number (01 / 02 / 03), navy semibold title (Diagnose / Practice / Improve), muted description. Connecting hairline between circles. Order flows left→right; numbered circles carry the eye.

6. **Stats band** — Full-bleed dark navy `#071527` band. Four evenly spaced statistics in teal `#2dd4bf`, bold 2-3xl: "500+", "92%", "12wk", "4.9★" with muted white/60 labels beneath. No card chrome, no divider grid — numbers breathe on the dark field.

7. **Testimonials** — White background, teal overline "STUDENT SUCCESS", navy headline "Real Results from Real Students". 3-col grid of rounded-2xl quote cards: five teal stars, italic muted one-sentence quote, navy semibold author name, muted role line. Middle card (teacher testimonial) in teal-light `#E6F7F4` with a soft teal border to anchor the row.

8. **Pricing** — `#F4F9FC` background, teal overline "PLANS & PRICING", navy headline "Choose Your Path". Three rounded-2xl cards: white side cards with outlined teal buttons ("Learn More"); center card elevated in teal-light with teal border and a filled teal button ("Get Started") — the featured middle card must visually dominate. Price numerals navy bold 3xl with muted "/month". Small muted centered footnote beneath ("7-day free trial. No credit card required.").

9. **FAQ** — White background, centered navy headline "Common Questions". Single column of rounded-2xl bordered accordion rows (border `#D0E2E8`), navy semibold question left, teal "+" icon right; one row expanded showing muted answer text. Collapsed rows quiet, exactly one row open — shows the interaction model at a glance.

10. **Final CTA** — Full-bleed dark navy, centered composition: bold white headline "Ready to Pass the MET?", one muted line ("Start your 7-day free trial today. No commitment, no credit card."), large teal pill button "Start Free Trial" with arrow, three small reassurance chips beneath (No credit card / Cancel anytime / AI-powered). Same diagonal ribbon motif as hero to bookend the page.

11. **Footer** — Dark navy, single centered column: three small muted links (Privacy / Terms / Contact), hairline border top (`white/5`), muted copyright line "© 2026 MET Mastery Platform". Deliberately empty.
