# Unified app-shell — delivery & hand-off

**Date:** 2026-09-10 · **Owner:** Vini · **Status:** quality gate PASSED, ready to wire in.

Replaces two structurally identical, separately-maintained shells — teacher
(`src/components/shared.jsx:100`) and student (`src/pages/student-dashboard.jsx:122`) — with one
primitive. Production context: `redesign.css` has a broken cascade (`.shell-*` defined in five
places, `redesign.css` loading *after* `responsive.css`), so the new primitive is written entirely
as `.mm-shell .mm-*` = specificity (0,2,0) to outrank every legacy rule without `!important`.

---

## 1. What's in this folder

| File | What it is |
|---|---|
| `shell-tokens.md` | **The contract.** Opens with the 🔒 DECISION LOCK. Read this first. |
| `shell.css` | **The implementation.** Drop-in stylesheet, ~1,000 lines. |
| `shell-prototype.html` | **The reviewable artifact.** Self-contained harness; links the real `shell.css`, drives a resized iframe so media queries genuinely evaluate. |

---

## 2. Verified state — measured, not asserted

Measured in the prototype's iframe via `getComputedStyle` + `matchMedia` at each width:

| Viewport | `.mm-nav` | `.mm-tabbar` | `.mm-rail` | section label | `main` pad-top | tabs |
|---|---|---|---|---|---|---|
| 360 | none | **flex** | none | none | 56px | 5 |
| 768.5 → 769 | **flex** | none | none | none | 100px | 5 |
| 860.5 → 861 | none | none | **flex** | **block** | 56px | 5 |
| 900 | none | none | flex | **block** | 56px | 5 |
| 1024 | none | none | flex | block | 56px | 5 |
| 1440 | none | none | flex | block | 56px | 5 |

Horizontal overflow: **zero at every width** (`scrollWidth == clientWidth`).

At 1280px, with the rail in place:

| Property | Value |
|---|---|
| `.mm-shell` display | `grid` |
| rail | `position: sticky`, `top: 0`, `align-self: start`, `block-size: 100dvh` |
| rail rect | `{x: 0, y: 0, w: 280, h: 760}` |
| main rect | `{x: 280, y: 0, w: 1000}` — **side by side** |
| rail item width | 263px (fills the 280px column) |
| **rail top after scrolling 193px** | **0** — stays pinned |

---

## 3. The decision

**Geometry is by BREAKPOINT, never by role.** One code path, zero role conditionals.

| Width | Both roles |
|---|---|
| ≥861px | vertical left rail (280px) |
| 769–860px | horizontal topbar + horizontal nav row |
| ≤768px | horizontal topbar + bottom tab bar |

An earlier version of this gave the student a topbar at every width. **That was reversed.** The
justification ("students have less to navigate") was false — the student shell has **9
destinations** (`student-dashboard.jsx:30-43`) versus the teacher's 9 (`App.jsx:499-509`). Item
count could not justify the asymmetry, and role-based geometry is exactly the drift this project
exists to remove.

**What stays role-specific is content, never geometry:**
- `WorkflowStageStrip` (`shared.jsx:128`) is teacher-only. In the rail it docks at the bottom via
  `.mm-rail__strip { margin-block-start: auto }`; students omit the slot entirely.
- Below 861px the strip renders **inside `.mm-main` as page content** — the shell deliberately
  provides no topbar-mode slot, because workflow state is page context, not global chrome.
- A five-token Teacher/Student delta (§5.7): chrome colour, content max-width, nav padding, nav
  weight, amber on/off.

---

## 4. How to wire it in

**Step 1 — copy the stylesheet.**
```
design/shell.css  →  src/styles/shell.css
```

**Step 2 — import it LAST.** `src/main.jsx` currently imports two sheets:
```js
import './styles/tailwind.css';
import './styles/system.css';
```
`system.css` is nine `@import`s with an explicit **"Do not reorder the imports above"** note, and
`redesign.css` is 7th in that chain. So add a third import in `main.jsx` rather than editing the
chain:
```js
import './styles/shell.css';   // MUST load after system.css
```
⚠ **If `shell.css` loads before `redesign.css`, the entire (0,2,0) specificity lock is worthless.**

**Step 3 — migrate the two roots.**

| File | From | To |
|---|---|---|
| `src/components/shared.jsx:100` | `<div className="shell">` | `<div className="mm-shell" data-shell="teacher">` |
| `src/pages/student-dashboard.jsx:122` | `<div className="dash">` | `<div className="mm-shell" data-shell="student">` |

Then rename the descendants to the `.mm-*` classes (`shell-topbar` → `mm-topbar`, `shell-main` →
`mm-main`, etc.). Legacy class names survive in exactly **three** files: `src/App.jsx`,
`src/components/shared.jsx`, `src/pages/student-dashboard.jsx`.

**Step 4 — prerequisites.**
- Confirm `base.css` zeroes the `body` margin. `.mm-shell` uses `min-height: 100dvh`, so an 8px UA
  body margin produces a permanent ~16px phantom scroll.
- Confirm `index.html` has `viewport-fit=cover` on the viewport meta. Without it every
  `env(safe-area-inset-*)` in `shell.css` evaluates to 0 and the bottom bar sits under the iPhone
  home indicator.

---

## 5. Quality gate

Two rounds of independent review. Round 1 was a rejection.

| Dimension | Round 1 | Round 2 |
|---|---|---|
| 哲学 Philosophy | 2/5 | **4/5** |
| 层次 Layering | 2/5 | **3/5** |
| 执行 Execution | 2/5 | **4/5** |
| 特异性 Specificity | 1/5 | **4/5** |
| 克制 Restraint | 3/5 | **4/5** |
| **Total** | **10/25** | **19/25** |
| Hard checks 1–6 | 2 pass / 4 fail | **6 pass** |
| Verdict | REVISE | **PASS** |

Round-1 findings all closed by measurement: contrast 3.19:1 → 6.63:1 on active; twelve emoji
replaced with `aria-hidden` inline SVG; `aria-current="page"` aligned with the CSS; 6 cramped tabs
→ 5 slots at 60px+; 114px horizontal overflow → zero; PT labels "Acompanhamento" (117px) and
"Material de Apoio" (114px) fit the 280px rail with zero clipping.

### ⚠ The bug worth remembering

The root cause of nearly every "the display switch doesn't work" symptom: **the `@media` blocks
were authored *before* the component base rules.** Both are (0,2,0), so the later base rule won and
every media-query `display` switch was inert — measured flat across 320→1440. The fix was a pure
reorder to the end of the file.

**Breakpoints in `shell.css` MUST stay at the end of the file.** There is a "do not move these back
up" comment at the old location (line ~233). Do not move them.

---

## 6. Open items

| # | Item | Notes |
|---|---|---|
| 1 | ~~Bottom bar split~~ **Confirmed** | 4 destinations + "More" = 5 slots for **both** roles, with `progress` in the More sheet. Owner-confirmed 2026-09-10. Still just one array per role if you ever want to revisit it. |
| 2 | ~~Student toast~~ **Fixed** | This turned out to be a **live bug, not a migration issue**. The toast sat at `z-index: 80` while the *legacy* bottom nav is already at `--z-fixed: 1000` (`tokens.css:207`) — so its lower half, including the Dismiss button, rendered behind the tab bar on every mobile width, today. Now `zIndex: 'var(--z-toast, 3000)'` and lifted clear of the nav via `bottom: calc(var(--mm-bottomnav-total, 70px) + 16px)`. `shell.css` mirrors that layer as `--mm-z-toast: 3000` so shell and app layers interleave. |
| 3 | **WorkflowStageStrip at ≤860px** | The prototype demonstrates the hide-at-861 switch. Production must implement it in the page component — don't let it get lost. |
| 4 | **Fractional proof is structural, not empirical** | CSS-px layout snaps, so an iframe set to 860.5 reports `clientWidth` 861. The no-dead-zone property holds by construction because all queries are `min-width`-only. The harness now states this in the preset tooltips instead of implying it was measured. |

### Resolved in the de-duplication pass

- **Nav duplication.** The prototype rendered `buildNavItems()` twice — once into `.mm-nav`, once
  into `.mm-rail` — putting **18 links in the DOM for 9 destinations** and two identical landmarks
  in the accessibility tree. Now a single `<nav id="mm-nav">` that `syncNavSlot()` re-parents
  between the topbar slot and the rail grid area on resize, swapping `.mm-nav` ↔ `.mm-rail`. The
  teacher workflow strip travels with it. Two harness chips (`nav links`, `nav landmarks`) are the
  standing proof: 9 and 2, not 18 and 3.
- **Duplicated token.** `--mm-rail-w: 280px` was declared in the base `:root` *and* re-declared in
  the 861 block. The second is gone — it was duplication that could drift. It resolves from the
  base and is consumed by the `.mm-rail` base rule and the grid.
- **Stale screenshots.** `mm-shell-1200.png` / `mm-shell-360.png` (round 1, broken layout) deleted.

---

## 7. Accessibility

Skip link at every width (targets `<main id="mm-main" tabindex="-1">`) · `aria-current="page"` on
the active item · focus-visible ring on every interactive element, never `outline: none` without a
replacement · 44px minimum touch targets via `min-height` + `padding-block`, never a fixed `height`
· the More sheet is a real dialog (`role="dialog" aria-modal="true"`) with Escape, focus trap, focus
return and scrim-click close · `prefers-reduced-motion` honoured · `forced-colors` fallback ·
contrast ≥4.5:1 on every text pair in both themes.
