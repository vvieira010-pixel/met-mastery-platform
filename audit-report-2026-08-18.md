# Audit Report — met-platform

**Audit Date**: 2026-08-18
**Tool**: `impeccable detect` + manual verification (tokens, contrast math, JSX/CSS inspection)
**Detector Findings**: 426 anti-patterns (422 in `public/mock-test-*` static HTML, 4 in `src/styles/components.css`)

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | Live React tokens pass AA (verified), but the exam surface (mock-test HTML) fails: 110 low-contrast hits, no reduced-motion support |
| 2 | Performance | 3/4 | Good code-splitting and lazy pages; `transition: width` layout animation persists in exam CSS |
| 3 | Theming | 2/4 | Two parallel token systems — live `system.css` (teal #01796F) vs unwired `index.css` @theme (green #005344) |
| 4 | Responsive Design | 3/4 | 5 breakpoints, 44px buttons; undersized 10-12px text and cramped padding in exam pages |
| 5 | Implementation Integrity | 2/4 | React app is largely coherent; static exam pages are concentrated AI-slop patterns (glows, pulsing dots, side-tabs, all-caps body) |
| **Total** | | **12/20** | **Acceptable** — significant work needed |

**Rating band**: 10-13 Acceptable (significant work needed)

---

## Implementation Integrity Verdict

**Pass (with conditions).** The React application expresses a coherent, product-specific design system: `src/styles/tokens.css` is a complete token set (color/type/radius/spacing/z-index/shadow scales) that passes WCAG AA contrast on every sampled pair (10/10 verified ≥4.5:1), dark mode is implemented via `[data-theme]` with careful foreground remapping (`dark.css`), and the UI kit is custom-built (not a stock framework theme).

The integrity failures are concentrated in **two places**:

1. **The static mock-test exam surface** (`public/mock-test-2`, `public/mock-test-3` — opened from `mock-test.jsx:15`, the real exam-taking flow). These 15+ hand-written HTML files carry 422 detector findings: colored box-shadow glows on dark backgrounds (66), all-caps body text (60), layout-property transitions (51), side-tab borders (30), nested cards (24), infinite pulsing dots (24), overused generic fonts (20), undersized text (16). They are visually and technically a different product from the React app.

2. **Design-system drift in the React app itself**: `index.css` (Tailwind 4 `@theme`, "extended tokens (audit 2026-08-12)") is imported only by an orphaned `main.tsx` that nothing loads — the live entry is `src/main.jsx` → `src/styles/system.css`. The 2026-08-12 contrast fixes landed in the live `tokens.css` (good), but the duplicate green/Hanken Grotesk token set remains as dead twin code, and Tailwind is installed yet never wired (`@tailwindcss/vite` present, no plugin configured; the app hand-writes its own utilities in `base.css`). Two primaries now exist in the repo: `#01796F` (live) and `#005344` (dead).

---

## Executive Summary

- **Audit Health Score**: 12/20 (Acceptable)
- **Total issues found**: 15 findings (by severity: 0 P0, 5 P1, 7 P2, 3 P3) + 426 detector hits folded into those findings
- **Top 5 critical issues**:
  1. Exam pages fail WCAG AA contrast on primary buttons (`#ffffff` on `#3f7dbc` = 4.3:1) — the student's core flow
  2. Exam pages have no `prefers-reduced-motion` handling while running infinite pulse animations and width transitions
  3. Duplicate/dead token system: `index.css` @theme + `main.tsx` never wired; two conflicting primaries in repo
  4. Clickable elements without keyboard semantics (`mtr-row` div in mock-test-results.jsx:204)
  5. All-caps body text (60 occurrences) in exam reading passages

---

## Detailed Findings by Severity

### P0 Blocking

None. No issue prevents task completion outright.

### P1 Major (WCAG AA violation / significant difficulty)

- **[P1] Exam buttons fail contrast** — `#ffffff` on `#3f7dbc` = 4.3:1 (need 4.5:1), repeated across listening/reading pages incl. `:hover`
  - **Location**: `public/mock-test-2/sections/*.html`, `public/mock-test-3/sections/*.html` (110 detector hits)
  - **Category**: Accessibility · **Impact**: The most important action on the exam surface (answer/continue buttons) is unreadable for users with moderate low vision; fails WCAG 1.4.3
  - **WCAG**: 1.4.3 (AA)
  - **Recommendation**: Darken `#3f7dbc` to ≥ `#3672a8` (or move to the app's AA-passing token set); audit all `--met-*` exam palette colors against AA
  - **Suggested command**: `/impeccable adapt`

- **[P1] No reduced-motion support in exam pages** — zero `prefers-reduced-motion` rules across `public/mock-test-2/css/*` and `public/mock-test-3/css/*`, while pages run infinite pulse animations (`met-blink`, 24 findings) and width transitions
  - **Location**: `public/mock-test-2/css/met-shell.css`, all 15 section HTML files
  - **Category**: Accessibility · **Impact**: Users with vestibular disorders get motion on the timed exam surface; violates WCAG 2.3.3; pulse indicators are also semantically misleading (recording dots animate even when nothing is live)
  - **WCAG**: 2.3.3 (AAA), motion-sensitivity best practice
  - **Recommendation**: Add a reduced-motion block in `met-shell.css`/`met-brand.css`; reserve pulse for genuinely live states
  - **Suggested command**: `/impeccable animate`

- **[P1] Clickable row without keyboard semantics** — `<div className="mtr-row" onClick={() => toggleExpand(r)}>`
  - **Location**: `src/pages/mock-test-results.jsx:204`
  - **Category**: Accessibility · **Impact**: Mouse-only expand/collapse; keyboard and screen-reader users cannot expand results; fails WCAG 2.1.1
  - **WCAG**: 2.1.1 (A)
  - **Recommendation**: Convert to `<button>` (or add `role="button"`, `tabIndex={0}`, `onKeyDown` Enter/Space handler)
  - **Suggested command**: `/impeccable harden`

- **[P1] All-caps body text in reading passages** — 60 detector hits of `text-transform: uppercase` on multi-word passages
  - **Location**: `public/mock-test-2/sections/reading-p1/2/3.html`, `public/mock-test-3/sections/reading-*.html`
  - **Category**: Accessibility · **Impact**: Uppercase removes word-shape recognition, measurably slower and harder reading for all users, worse for dyslexia; exam comprehension suffers
  - **Recommendation**: Reserve uppercase for labels/headings; use normal case for passages
  - **Suggested command**: `/impeccable clarify`

- **[P1] Dual token systems / dead theme** — `index.css` @theme (primary `#005344`, Hanken Grotesk) is imported only by orphaned `main.tsx`; live entry is `src/main.jsx` → `system.css` (primary `#01796F`, DM Sans)
  - **Location**: `index.css`, `main.tsx`, `src/styles/tokens.css`, `vite.config.js`
  - **Category**: Theming / Implementation Integrity · **Impact**: Two conflicting "primaries" in the repo; future contributors wire the wrong file; Tailwind classes in JSX (`.p-5`, `.gap-2`, `flex`) only work because `base.css` hand-reimplements them — Tailwind itself is dead weight
  - **Recommendation**: Pick one system. Either wire Tailwind 4 (`@tailwindcss/vite` + import `index.css`) and delete the hand-rolled utilities, or remove the Tailwind deps and `index.css`/`main.tsx` and document `system.css` as the system
  - **Suggested command**: `/impeccable extract` then `/impeccable document`

### P2 Minor (annoyance / workaround exists)

- **[P2] Layout-property transitions** — `transition: width var(--met-motion-base)` in `public/mock-test-2/css/met-shell.css` (51 detector hits across exam pages); `transition: all 0.2s ease` at `src/styles/components.css:758`
  - **Category**: Performance · **Impact**: Janky animation on low-end devices during timed exam; frame drops
  - **Recommendation**: Animate `transform`/`opacity` only; grid-template-rows for height
  - **Suggested command**: `/impeccable animate`

- **[P2] Colored box-shadow glows** — 66 detector hits (`#d4a843`, `#3f7dbc` glows) on dark exam backgrounds
  - **Location**: `public/mock-test-2`, `public/mock-test-3` sections
  - **Category**: Theming · **Impact**: AI-default "cool glow" pattern; visual noise on the timed exam surface
  - **Recommendation**: Neutral elevation shadows; keep colored light only where it means something (e.g., section color coding)
  - **Suggested command**: `/impeccable distill`

- **[P2] Side-tab accent borders** — 30 detector hits in exam HTML + 4 in live CSS: `border-left: 3px solid var(--orange)` (components.css:7393), `.td-card-accent::before` (5288), `.eval-priority-item::before` (5324), `.eval-verdict::before` (5338)
  - **Location**: `src/styles/components.css:7393, 5288, 5324, 5338`; exam sections
  - **Category**: Implementation Integrity · **Impact**: The single most recognizable AI-UI tell; cheapens the brand
  - **Recommendation**: Replace stripes with token-based accents or remove
  - **Suggested command**: `/impeccable quieter`

- **[P2] Undersized functional text** — 16 detector hits of 10-12px text in exam pages; `.avatar-sm { font-size: 10px }` (components.css:281)
  - **Category**: Accessibility · **Impact**: Legibility failure on high-DPI/small viewports
  - **Recommendation**: 14px floor for functional text, 16px ideal
  - **Suggested command**: `/impeccable typeset`

- **[P2] `outline: none` without visible focus replacement** — e.g. components.css:1622 (button with `border:none; outline:none; background:none` and no focus ring), 828, 5425, 5442, 6050
  - **Location**: `src/styles/components.css`
  - **Category**: Accessibility · **Impact**: Keyboard users lose focus visibility on these controls; WCAG 2.4.7 (AA)
  - **Recommendation**: Provide `:focus-visible` ring for every `outline: none` site (22 `focus-visible` rules exist — extend the pattern)
  - **Suggested command**: `/impeccable adapt`

- **[P2] Modal focus management gaps** — `qp-modal-overlay` has `role="dialog" aria-modal="true"` but no focus trap and no Escape handler (student-home.jsx:540); only 7 Escape handlers across 126+ component/page files
  - **Category**: Accessibility · **Impact**: Focus can escape modal; keyboard users must tab through the page behind
  - **Recommendation**: Focus trap + Escape-to-close + return focus to opener
  - **Suggested command**: `/impeccable harden`

- **[P2] Nested cards + overused fonts + kickers** — 24 nested-card hits, 20 overused-font hits (geist/plus-jakarta), 2 kicker-above-heading, 2 bounce-easing, 2 cramped-padding, 1 codex-grid background, 1 gpt-thin-border in exam pages
  - **Location**: `public/mock-test-2`, `public/mock-test-3`
  - **Category**: Implementation Integrity · **Impact**: Visual noise and AI-generic identity on the exam surface
  - **Suggested command**: `/impeccable distill`

### P3 Polish

- **[P3] Dead files** — `main.tsx` (imports `./App.tsx`, which doesn't exist; nothing references it) and `index.css` (only imported by `main.tsx`)
  - **Location**: repo root
  - **Recommendation**: Delete or wire; update `README.md` which is still the AI Studio scaffold
  - **Suggested command**: `/impeccable document`

- **[P3] Em-dash overuse** — 7 advisory hits in exam copy
  - **Suggested command**: `/impeccable clarify`

- **[P3] Global double-click dictionary popup** — inline script in `index.html` opens a Cambridge Dictionary popup on any double-click of a 2-30 char selection; unannounced popups, no reduced-motion/focus concerns, but surprising behavior on a timed exam (a stray double-click on a word opens an external window)
  - **Location**: `index.html`
  - **Recommendation**: Gate behind an explicit "define" affordance or confine to practice surfaces
  - **Suggested command**: `/impeccable harden`

---

## Patterns & Systemic Issues

- **The exam surface and the app are two different products**: 422 of 426 detector hits live in `public/mock-test-*`. The exam files were clearly generated in a different (AI-default) visual language than the careful `tokens.css` system — section-color coding (`--section-reading` etc.) exists in tokens but the HTML files use their own `--met-*` palette with no relation to it.
- **Dead twin system**: the 2026-08-12 audit's contrast/token fixes were written into `index.css`/`@theme` which never loads; the live system got the same fixes independently. Every future audit must verify against `system.css`, not `index.css`.
- **Hand-rolled utilities duplicate Tailwind**: `base.css:90-242` reimplements `.flex/.gap-2/.p-5/.mt-2/...` that Tailwind would generate — the dependency is installed but unconfigured.
- **AI-slop concentration**: side-tabs, pulsing dots, colored glows, kickers, all-caps body, bounce easing — each is minor, together they define the exam surface's identity.

## Positive Findings

- **Live token system passes AA** — verified by computation: all 10 sampled pairs (muted/ink/orange-text/primary/warning/error/info/success on their surfaces) ≥ 4.5:1, `on-dark on primary` 5.30:1
- **Code-splitting is mature**: `App.jsx` lazy-loads all pages with `Suspense`; vendor chunks split react/motion/recharts/grapesjs; initial bundle is lean (`index` 94KB + react vendor 190KB)
- **Images handled well**: every `<img>` (12/12 sampled) has `alt` (decorative ones explicitly `alt=""`), `loading="lazy"` throughout
- **Exam HTML is semantically labeled**: 186 `aria-label`s, `lang="en"` on all pages, proper viewport meta
- **Accessible primitives**: `role="status"` live region in App, `role="dialog" aria-modal` on modal, 22 `:focus-visible` rules, 44px min-height on primary buttons
- **Responsive discipline**: 5 breakpoints (1024/860/768/420/390), mobile-first utilities, safe-area insets in a few components
- **No performance anti-patterns in the app**: zero `will-change` overuse, zero blur/filter animations, no layout thrash in React CSS (only `transition: all` once)
- **Dark mode is genuinely designed**: `dark.css` documents why `--primary` is not flipped (used as both fg/bg) and remaps foreground usages to readable colors — thoughtful engineering

---

## Recommended Actions (Priority Order)

1. **[P1] `/impeccable adapt`**: Fix exam-page contrast (darken `#3f7dbc` and audit the `--met-*` palette to AA) and add `:focus-visible` rings where `outline: none` lacks a replacement
2. **[P1] `/impeccable animate`**: Add `prefers-reduced-motion` to `met-shell.css`/`met-brand.css`; replace `transition: width` with transform/opacity; retire infinite pulse dots
3. **[P1] `/impeccable clarify`**: Convert all-caps reading passages to normal case; keep uppercase for labels only
4. **[P1] `/impeccable harden`**: Keyboard semantics for `mtr-row` (mock-test-results.jsx:204); focus trap + Escape for the quick-practice modal; gate the dictionary popup
5. **[P1] `/impeccable extract` + `/impeccable document`**: Resolve the dual token systems — wire one (recommend: live `system.css` + delete `index.css`/`main.tsx`, or adopt Tailwind 4 and delete hand-rolled utilities); write DESIGN.md so the live system is the documented authority
6. **[P2] `/impeccable distill`**: Strip exam-page AI-slop (colored glows, side-tab stripes, nested cards, kickers, bounce easing)
7. **[P2] `/impeccable typeset`**: Raise 10-12px exam text to a 14px floor
8. **[P2] `/impeccable quieter`**: Remove the 4 live side-tab borders in components.css (7393, 5288, 5324, 5338)
9. **[P3] `/impeccable document`**: Update README from the AI Studio scaffold to the real platform
10. **[P3] `/impeccable polish`**: Final quality pass over the whole cycle

---

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/impeccable audit` after fixes to see your score improve.