# Design-System Audit — MET Mastery Platform

**Date:** 2026-09-03
**Auditor:** Diana (design-system architect)
**Scope:** Design-token integrity + brand coherence. Companion to `FRONTEND-AUDIT-2026-09-02.md` (which covered code correctness, perf, a11y). This pass answers a different question: *does the platform actually render the design system it claims to have?*
**Verdict:** The design system exists on paper but is **not the single source of truth at runtime**. Three canonical sources disagree, a de-facto second (Tailwind-default) palette permeates the codebase, and a shipped dashboard chart uses a fourth palette. Brand coherence is degraded, not broken — but it is getting worse with each new feature.

> **STATUS — 2026-09-03 remediation (same day):**
> - **D1 resolved.** `src/styles/tokens.css` ratified as the single source of truth. `design-tokens.json` regenerated to mirror it (was an orphaned, lying artifact); `DESIGN.md` realigned to the live warm palette.
> - **D4 resolved.** DM Sans added to global `--font-sans`; green stop in `--gradient-brand` → `var(--accent)` (teal→amber→ink, two-hue).
> - **D2 resolved.** Tailwind-default leakage cut from **397 → 3** off-brand hexes via a controlled codemod (23 hexes → MET tokens, 405 replacements across 15 component/page files). `AcademicProgressChart.jsx` deliberately excluded (its 3 remaining hexes belong to the D3 chart palette). `eslint --max-warnings 0` passes; `vite build` succeeds (EXIT=0).
> - **D3 still open (deliberate).** The `academic-progress-chart.html` blue+emerald palette is a *user-accepted* divergence, not accidental drift — left as-is.
> - **D5/D6 open** → same as prior-audit items (see "Re-baseline" below).

---

## TL;DR

| # | Finding | Severity | One-line evidence |
|---|---|---|---|
| D1 | **No single source of truth** — `DESIGN.md`, `design-tokens.json`, and `tokens.css` disagree on primary/accent/success/surfaces | 🔴 Critical | Live `--primary` is `#2D7A8C`, spec says `#006877`; live `--success` is **green** `#3D8C65` |
| D2 | **Tailwind-default palette leaks everywhere** — a 2nd design language runs alongside MET tokens | 🔴 Critical | 397 hardcoded Tailwind hexes (slate/blue/green/red) of 1,144 total in `src/` |
| D3 | **Shipped chart artifact is off-brand** (4th palette) | 🟠 High | `academic-progress-chart.html` uses navy/periwinkle/emerald, 0 MET colors; live on `student-home` |
| D4 | **Body font regression** — DM Sans never applied app-wide | 🟠 High | Global `--font-sans` is `'Inter', system-ui…`; DM Sans absent from the chain |
| D5 | **`design-tokens.json` is orphaned** | 🟡 Medium | Referenced nowhere in code; claims `source: tokens.css` but values don't match |
| D6 | **Prior-audit M-series still open** (CSS monolith, dead selectors, breakpoints, `!important`) | 🟡 Medium | `components.css` = 193 KB; 416 dead selectors; 19 ad-hoc breakpoints |

---

## D1 — Three canonical sources disagree (no single source of truth)

DESIGN.md states tokens.css is *"the single source of truth"* and *"Don't edit the root-level duplicate `components.css` / `redesign.css` / `tokens.css` — they are dead copies of `src/styles/*`."* But the living `src/styles/tokens.css` itself contradicts the brand spec, and the JSON copy of it has drifted from both.

| Token | `DESIGN.md` (spec) | `design-tokens.json` (generated) | `tokens.css` (LIVE) | Verdict |
|---|---|---|---|---|
| Primary | `#006877` | `#006877` | **`#2D7A8C`** | ❌ Live differs from spec |
| Accent | `#904D0E` | `#904D0E` | **`#E08E45`** | ❌ Live differs |
| Success | `#006877` (teal) | `#006877` (teal) | **`#3D8C65` (green)** | ❌ **Violates "success is teal, not green"** |
| Section–Listening | `#0996AB` (bright teal) | `#0996AB` | **`#3D8C65` (green)** | ❌ Recoded as green |
| Page bg | `#E5F0F0` (clinical teal) | `#FFFFFF` | **`#FDFCF8` (warm cream)** | ❌ All three differ |
| Surface | `#F6FAFB` | `#F6FAFB` | **`#FFFFFF`** | ❌ Live differs |
| Border | `#C6D5D4` (cool grey) | `#BDC9CC` | **`#E8E5DF` (warm beige)** | ❌ All three differ |
| Body font | DM Sans | DM Sans | **`Inter` only** | ❌ DM Sans never wired app-wide |

**Two hard brand-rule violations baked into the live tokens:**
- `--gradient-brand: linear-gradient(135deg, var(--primary) 0%, #3D8C65 52%, var(--ink) 100%);` — green is a literal stop in the brand gradient. DESIGN.md: *"Don't introduce a third hue."*
- `--success`, `--section-listening`, `--type-main-idea` are all green `#3D8C65`. DESIGN.md: *"Don't use pure green for success; success is teal in this system."*

**Interpretation:** Either the platform was intentionally re-branded to a warmer cream/amber/teal aesthetic (in which case DESIGN.md + design-tokens.json are stale and must be updated), **or** the token values drifted accidentally (in which case they must be realigned to the spec). Right now nobody can tell which, because the three sources disagree. **This ambiguity is the root cause of D2–D4.**

---

## D2 — Tailwind-default palette leaks everywhere (second design language) — ✅ RESOLVED 2026-09-03

`src/` contained **1,144 hardcoded hex literals**. Of those, **397 were Tailwind's default palette** (`slate-*, sky-*, blue-*, green-*, red-*, amber-*`) — a cool-grey/blue/green/red vocabulary opposite to MET's warm-clinical teal/amber system.

**Remediation:** A scoped codemod (`.tmp/normalize-colors.mjs`) mapped 23 Tailwind-default hexes → MET tokens, run across 15 component/page files (excluding `AcademicProgressChart.jsx`, whose 3 remaining hexes are the deliberate D3 chart palette). Result: **397 → 3** off-brand hexes, 405 replacements, `eslint --max-warnings 0` passes, `vite build` EXIT=0.

**Off-brand counts (raw hex literals in `src/`):**
- 🟢 Green "success" hexes: **44** (violates "success is teal") — files include `AcademicProgressChart.jsx`, `MetProgressPathGraph.jsx`, `BaselineDiagnosticModal.jsx`, `ImprovementMatrix.jsx`, `Listening.jsx`, `StudentResources.jsx`
- 🔵 Blue hues (forbidden 3rd hue): **54**
- ⚪ Tailwind slate/neutral defaults: the bulk of the 397

**Worst offenders (off-brand Tailwind hex count per file):**

| File | Off-brand hexes | Notes |
|---|---|---|
| `src/components/StudentResources.jsx` | 99 | Almost entirely slate/blue/green |
| `src/components/MetProgressPathGraph.jsx` | 77 | Chart colors are Tailwind greens/blues |
| `src/components/BaselineDiagnosticModal.jsx` | 52 | Diagnostic feedback uses red-600/green-600 |
| `src/components/ActionOrientedEvidenceCards.jsx` | 39 | |
| `src/components/LiveClassSchedulingGuardrails.jsx` | 38 | |
| `src/components/TargetedSynonymTracker.jsx` | 25 | |
| `src/components/ImprovementMatrix.jsx` | 24 | |
| `src/components/CefrSkillGapFlags.jsx` | 22 | |

> Even the *brand-family* hardcoded values (e.g. `#087887`, `#0f766e`, `#0E5F6B`, `#114a50`) violate the "consume tokens, don't hardcode" rule — they should be `var(--primary)` etc. The fix is not just recoloring; it's routing everything through tokens.

---

## D3 — Shipped dashboard chart uses a 4th palette

`academic-progress-chart.html` (227 lines, **fully hardcoded, 0 CSS variables**) is referenced by `src/pages/student-home.jsx`, so it renders on the student home dashboard. Its palette:

| Color | Value | MET-system equivalent |
|---|---|---|
| Navy | `#1b2a4a` | none — off-brand |
| Periwinkle | `#7d9cc4` | none — off-brand |
| Emerald | `#10b981` | success should be teal `#006877`/`#2D7A8C` |
| Slate | `#6b7891`, `#1f2a3d`, `#eef1f6` | none — off-brand |

A student landing on their home dashboard sees a progress chart that looks like a **different SaaS product** than the rest of the app. `src/components/AcademicProgressChart.jsx` (the React wrapper) also carries 44 green hexes of its own. **This is the single most visible brand-break on a core screen.**

---

## D4 — Body font regression (DM Sans never applied app-wide)

The brand book mandates **DM Sans** for UI body. Evidence:
- `tokens.css:137` → `--font-sans: 'Inter', system-ui, -apple-system, sans-serif;` — **DM Sans is not in the chain.**
- `src/index.html` does load DM Sans (the 09-02 landing audit added it), and the *landing page* correctly uses `'DM Sans', 'Inter', sans-serif`. But every non-landing screen inherits the global `--font-sans` → renders in Inter or system-ui.
- Result: the app's body typeface quietly regressed to Inter while the spec/landing say DM Sans. The two largest surfaces of the product (app shell vs landing) use **different body fonts**.

---

## D5 — `design-tokens.json` is orphaned

`design-tokens.json` (`generated: 2026-08-31`, `source: src/styles/tokens.css`) is **referenced nowhere** in `src/`, `index.html`, or build config. It is a decorative artifact. Worse, it disagrees with the very file it claims as its source (primary `#006877` vs tokens.css `#2D7A8C`). It provides zero guardrail value and actively misleads anyone who opens it expecting the live palette.

---

## Re-baseline of the 2026-09-02 frontend audit

**Fixed since last pass (verified in git + prior report):** C1 (render loop), C2 (form labels), H1 (recharts lazy), H2 (realtime closure), H4 (responsive on 11/11 pages + missing `.card-row`), H5 (toast memo), H6 (tts guard), M8 (lint 0), M9 (validation memo), landing font/CTA/a11y wave. `npm run build` + `eslint --max-warnings 0` pass.

**Still open from the 09-02 audit:**
- **H3** — dark-mode token split (`--primary` foreground remap vs 109-selector patch in `dark.css`).
- **M1** — `components.css` is a **193 KB monolith** (grep-confirmed, grew since the 7.6k-line count in the prior audit).
- **M2/M3** — specificity wars (123 selectors in 2+ files), 134 `!important`.
- **M5** — 11 tokens referenced but never declared.
- **M6** — ~416 dead selectors (still needs safelist care for `FadingBanner`).
- **M7** — 19 ad-hoc breakpoints (`390, 420, 480, 520, 600, 640, 700, 767, 768, 830, 850, 860, 861, 900, 959, 960, 1024, 1240, 1500`).
- **Low** — duplicate `SectionHeader` (re-verified: not a real dup), legacy auth module, `qs` vuln, minified landing CSS.
- **Landing (deferred)** — 7-variant orange accent, workspace callouts hidden ≤1500px, meta-copy never says "nurse".

---

## What's genuinely good (preserve)

1. **Token *structure* in `tokens.css` is sound** — semantic names, `-rgb` variants for alpha compositing, clean spacing/radius/z-index scales. The problem is *values*, not architecture.
2. **The 09-02 a11y/correctness wins hold** — `Modal.jsx` focus trap, `FormField` label graft, lazy recharts, body-scroll-lock, `prefers-reduced-motion` in key flows, zero `outline:none`.
3. **Landing page is now on-brand** (Cormorant + DM Sans + Space Mono, single `<h1>`, working CTAs, skip-link, focus ring).

---

## Prioritized remediation plan

**Step 0 — Decide the truth (blocks everything else), ~0.5 day**
Pick one: (a) *Re-brand to the warmer cream/teal/amber tokens.css values* → update `DESIGN.md` + regenerate `design-tokens.json`; or (b) *Realign tokens.css to the spec* → fix `--primary/--accent/--success/--section-*/--bg/--surface/--border/--font-sans` and remove the green from `--gradient-brand`. Until this is decided, D2–D5 will keep recurring.

**Week 1 — Stop the bleeding**
1. **D1** Apply the Step-0 decision to `tokens.css`; delete the green stop from `--gradient-brand`.
2. **D4** Add DM Sans to global `--font-sans` chain (`'DM Sans', 'Inter', system-ui, sans-serif`).
3. **D3** Re-skin `academic-progress-chart.html` + `AcademicProgressChart.jsx` to MET tokens (teal success, no navy/periwinkle). Highest visibility.
4. **D5** Either wire `design-tokens.json` into the build (stylelint token lint) or delete it. Don't leave a lying artifact.

**Week 2 — Route through tokens**
5. **D2** ESLint rule: ban raw hex in `style={{}}` and CSS (allow `var()` only). Then fix the 8 worst files in D2's table by swapping to `var(--*)`. This alone removes ~397 off-brand literals.
6. **M7** Collapse 19 breakpoints → 4 (640/768/1024/1280).
7. **M5** Declare or remove the 11 dead tokens.

**Foundations (parallel, lower urgency)**
8. **M1/M2/M3/M6** Split `components.css` (193 KB), dedupe specificity wars, purge 416 dead selectors (safelist `FadingBanner`), cut `!important`.
9. **H3** Token-split dark mode properly.
10. **Guardrail** Add a bundle-size + token-lint CI check so green-success and off-brand hex can't re-enter.

---

## Verification commands used

```bash
grep -rhoE "#[0-9a-fA-F]{3,8}\b" src | wc -l                       # 1144 hardcoded hex in src/
grep -rhoE "#(0f172a|64748b|0284c7|16a34a|dc2626|e2e8f0|…)\b" src | wc -l   # 397 Tailwind-default
grep -rhoE "#(16a34a|059669|10b981|…)\b" src | wc -l              # 44 green "success" violations
grep -rIl "academic-progress-chart" src index.html                # → src/pages/student-home.jsx (live)
grep -n "gradient-brand" src/styles/tokens.css                    # green stop confirmed
```

**Audited files:** `src/styles/tokens.css`, `design-tokens.json`, `DESIGN.md`, `src/components/*` (hex scan), `academic-progress-chart.html`, `src/pages/student-home.jsx`, `src/components/AcademicProgressChart.jsx`.
