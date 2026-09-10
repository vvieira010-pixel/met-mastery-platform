# MET Mastery — Unified App Shell: Design System Choice & Token Spec

**Scope:** one shell primitive replacing `.shell-*` (teacher, `src/components/shared.jsx:74-160`) and `.dash-*` (student, `src/pages/student-dashboard.jsx:146-262`).
**Status:** Phase 2 — spec only. No existing source files were modified.
**Canonical colour source:** `src/styles/tokens.css` + `DESIGN.md`. `design-tokens.json` is stale (declares primary `#457B9D`, bg `#F1FAEE`) — **do not use it**.

---

## 🔒 DECISION LOCK (F0.7 resolved — team lead, 2026-09-09, **revised**)

**Geometry is by BREAKPOINT, never by role.** The cross-role inconsistency (F0.7) is resolved by removing the role branch entirely, not by choosing which role gets which layout.

```css
.mm-shell { /* shared: 100% of geometry, tokens, a11y */ }
@media (min-width: 861px) { .mm-shell { /* vertical left rail  */ } }
/* base (mobile-first): horizontal topbar + bottom tabs */
```

| Width | Both roles |
|---|---|
| **≥861px** | vertical left rail (17.5rem / 280px, `tokens.css:112`) |
| **≤860px** | horizontal topbar + bottom tab bar |

**Revision note.** An earlier version of this lock gave the student a topbar at every width. That was **reversed**. Reason: the stated justification ("students have less to navigate") is **false** — the student shell has **9 destinations** (`student-dashboard.jsx:36-43` six bottom tabs + `:30-34` mock-test / messages / settings) versus the teacher's 9 (`App.jsx:499-509`). Item count cannot justify the asymmetry. More importantly, **role-based geometry is exactly the drift this project exists to remove** — branching `data-layout` on role re-introduces a per-role layout branch that will drift again. One breakpoint rule, one code path, zero role conditionals in geometry.

**What stays role-specific:** only the *content* of the shell, never its geometry —
- `WorkflowStageStrip` (`shared.jsx:128`, `redesign.css:433-445`) is teacher-only. In the rail it sits at the bottom (`margin-top:auto`); students simply do not render it.
- The five-token Teacher/Student delta in §5.7 (chrome colour, content max-width, nav padding, nav weight, amber on/off).

**Decision 2 — student bottom bar is capped at 5 + "More".**
`.dash-bottom-nav` currently renders **6** tabs (`student-dashboard.jsx:251-265`) with `flex:1` (`responsive.css:113`). At 360px — the common width for this audience — that is ≈**57px per tab** with 10px labels ("Practice", "Subjects", "Homework", "Progress"). Bottom bars conventionally cap at 5; 6 clips or wraps on real hardware. The teacher bar is 4 (`shared.jsx:145`) and is fine.
**Ruling: 5 visible + overflow "More"; `progress` moves into `MORE_TABS`.** ⚠️ This specific choice is a product call made without usage analytics — **easily reversible, flag to the owner for confirmation.**

**Consequence for the prototype:** both Teacher and Student render a rail ≥861px; the only difference is rail *content* (teacher has the workflow strip, student does not). Build the rail once and vary the slot.

---

## 0. Eight findings that change the plan (read first)

*F0.1, F0.5, F0.6 and F0.7 were contributed or corrected by `discovery-analyst` after independent verification; all eight have been re-verified against source.*

These came out of reading the cascade, and they are load-bearing for everything below.

**F0.1 — There are FIVE competing shell definitions, not two.**
`.shell-*` is authored in `components.css:1176-1410`, then re-authored in `redesign.css:25-32 / 120-200 / 315-335 / 359-477 / 716-730`, re-skinned in `dark.css:132-158`, and re-skinned *again* in `stitch-theme.css:47-79`. `responsive.css:7-13 / 307-336` also touches it. Because `redesign.css` and `stitch-theme.css` load **after** `responsive.css`, the responsive layer loses on every equal-specificity collision.

*Correction:* `components.css:7782-7798` is **`@media print`**, not a viewport breakpoint — it cannot affect screen layout. It is also the **only** place `.shell-sidebar` is referenced as a class; **no such element exists in any JSX**. It is a ghost selector. The token `--shell-sidebar: 17.5rem` (`tokens.css:112`) is consumed only by `redesign.css:365` and `:372`.

**F0.2 — `redesign.css:359 @media (min-width: 861px)` turns the teacher topbar into a 17.5rem left sidebar.**
It sets `.shell { padding: 0 0 0 var(--shell-sidebar) }` and `.shell-topbar { position: fixed; inset: 0 auto 0 0; width: var(--shell-sidebar); height: 100vh; flex-direction: column }`. So on desktop today the teacher shell is **not** a horizontal topbar — it is a vertical left rail, contradicting the "no sidebar" target. Any unified-shell work must explicitly kill this block or the token spec below will not render.

This is a **pure CSS reflow of `.shell-topbar`** — there is no sidebar element in the DOM. The markup (`shared.jsx:100-142`) is genuinely topbar-shaped; `redesign.css` re-purposes it at ≥861px. Reading the JSX alone is misleading.

**F0.3 — `env(safe-area-inset-*)` is currently dead code.**
`index.html:7` is `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` — **no `viewport-fit=cover`**. Without it iOS Safari reports `0px` for all safe-area insets, so the safe-area padding already written into `components.css:1182-1183` and `components.css:1371` does nothing. Add `viewport-fit=cover` before shipping the bottom nav, otherwise the bottom tabs sit under the iPhone home indicator.

**F0.4 (colour) — the *effective* runtime accent is not `#FFC857`.**
`stitch-theme.css:262` overrides `--accent: #A46833` (and `:372` in dark). `#FFC857` on `#FDFCF8` is **1.50:1** — it cannot carry text or be a sole state indicator. Reconciliation: keep `#FFC857` as the **brand amber for fills/indicators only**; all amber *text and icons* use `--mm-accent-ink`. See §3.1.

**F0.5 — The breakpoint pair `max-width: 860` / `min-width: 861` leaves a fractional dead band.**
`redesign.css:320` uses `max-width: 860px` and `redesign.css:359` uses `min-width: 861px`. A viewport of **860.5px** — reachable at any non-100% browser zoom — matches **neither** query. Combined with F0.2 this is a second, independent reason the shell can render unstyled. **The fix is structural: `shell.css` uses `min-width`-only (mobile-first) queries, which cannot have gaps by construction.** See §3.4.

**F0.6 — `.shell` is height-locked with contradictory units and an `overflow: hidden` crutch.**
`redesign.css:716-723` (inside `@media (max-width: 860px)`):
```css
.shell { display: flex; height: 100dvh; min-height: 100vh; overflow: hidden;
         padding: calc(52px + env(safe-area-inset-top, 0px)) 0 0; }
```
Three defects in one rule:
- `height: 100dvh` **with** `min-height: 100vh` is self-defeating: `dvh ≤ vh` on mobile, so `min-height` always wins and the `dvh` correction never applies. Correct form is `min-height: 100vh; min-height: 100dvh;` (progressive enhancement), never `height`.
- `overflow: hidden` on the shell root forces scrolling onto an inner container (`.shell-main { overflow-y: auto }`). That breaks `position: sticky`, degrades scroll anchoring, and **prevents the Android URL bar from collapsing** — a real cost on the target device class.
- `calc(52px + …)` is the **third** hard-coded topbar height: `responsive.css:310` (`height: 52px`), `redesign.css:722` (`padding: calc(52px + …)`), `redesign.css:728` (`height: calc(52px + …)`). (`components.css:7697` also says `52px` but belongs to `.quick-practice-card-icon` — unrelated.)

**The deeper problem — it is a disagreement, not repetition.** `components.css:1182` sets `.shell-topbar { height: calc(56px + env(safe-area-inset-top, 0px)) }`, while the mobile overrides say **52px**. The *same element* therefore has two different base heights depending on which file wins, and the `env()`-aware variant exists **only** in `redesign.css`. All of it collapses into `--mm-topbar-h` (§3.4), which is `env()`-aware at every breakpoint.

**F0.7 — Cross-role inconsistency: the student shell never gets the rail.**
`.dash-*` appears in `redesign.css` only at `26-197` (unscoped) and `320-345` (all `max-width`). There is **no `min-width` block for `.dash-*`**. So teacher = left rail on desktop, student = topbar at every width. The unified primitive resolves this by construction: one geometry, one `[data-shell]` attribute, zero role-specific layout branches (§5.7).

**F0.9 — The student bottom bar has SIX tabs and fails at the target device width.**
`BOTTOM_NAV_TABS` (`student-dashboard.jsx:36-43`) has **6** entries — home, practice, subjects, homework, feedback, progress — rendered through `.dash-bottom-nav` with `.dash-nav-btn { flex: 1 }` (`responsive.css:113`). With `--mm-tab-min-w: 60px` (§3.5) six tabs need a **≥384px viewport**; the most common mid-range Android is **360px**, where six tabs get `(360 − 24) / 6 = 56px` each and labels like "Homework" / "Feedback" / "Progress" clip or wrap.

| Viewport | Content width | 6 tabs | 5 tabs (4 + More) |
|---|---|---|---|
| 360px *(target device)* | 336px | **56px — clips** | 67px — fits |
| 390px | 366px | 61px — marginal, no breathing room | 73px — fits |
| 412px | 380px | 63px — marginal | 76px — fits |

Convention caps bottom bars at 5. The teacher bar is 4 + More = 5 and is fine (`shared.jsx:145`). **This is a second, independent role asymmetry** (6 vs 4) on top of the desktop one (F0.7). See §5.5 for the rule and the recommended split.

**F0.10 (cascade) — Tailwind 4 output is layered, `system.css` is not.**
`main.jsx:4-5` imports `tailwind.css` then `system.css`. Tailwind 4's `@import "tailwindcss"` declares `@layer theme, base, components, utilities`. Every rule in `system.css` is **unlayered**, and unlayered CSS beats *all* layers regardless of source order. Consequence: **Tailwind utility classes written in JSX cannot override any legacy `system.css` rule.** This is why the unified shell must be authored as plain CSS (or in an explicitly-declared later layer), not as utility soup — see §4.

---

## 1. Candidate design systems

| # | System | Fit | Character | Why for this shell |
|---|--------|-----|-----------|--------------------|
| **A** ⭐ | **Mintlify** | ★★★★★ | Scholarly, calm, documentation-grade. Restrained single accent, disciplined type scale, dense categorised nav, bounded content column, best-in-class light/dark parity. | Its native topology *is* this shell: sticky topbar → categorised horizontal nav → single bounded content column → mobile tab bar. It is the only system in the library whose default chrome matches the required structure without invention. Its "one accent + one companion" model is literally MET's **One Voice Rule**. |
| **B** | **Linear** | ★★★★☆ | Precision instrument. Ultra-dense, focus-forward, motion-disciplined, subtle elevation. | Best possible reference for the **Teacher workspace** register and for focus-visible craft. But it is dark-first (MET is `#FDFCF8` paper-first), its 32px control height **violates the 44px floor**, and its coldness reads wrong for the Student register. |
| **C** | **Notion** | ★★★☆☆ | Warm, quiet, low-contrast structure, generous breathing room. | Right emotional temperature for **Student space**, and the calmest of the three. But its IA is a sidebar tree, not a horizontal nav, and its density is too low for the teacher's 5-section × multi-item nav. Adopting it would mean fighting the required structure. |

### Decision: **Mintlify (A)**, with Linear borrowed for interaction craft and Notion for the Student register's warmth.

**Why Mintlify wins for *this* shell specifically — four reasons:**

1. **Topology match.** Mintlify's canonical layout is sticky header → sectioned horizontal nav → `max-width` content column → mobile bottom tabs. Linear's is an app rail + command palette; Notion's is a sidebar tree. Only Mintlify gives us the target structure natively, so we adopt its *proportions* (nav row height, content max-width, gutter rhythm) instead of inventing them.
2. **It makes the two-register requirement cheap.** Mintlify is a documentation system — it is designed to be read by a novice in one moment and scanned by an expert the next. The Teacher/Student split becomes a **token delta, not a second component**: same geometry, different surface/ink/accent weights (§6.4). Linear and Notion would each require us to compromise one register.
3. **Bilingual PT/EN.** Portuguese UI strings run **~15–25% longer** than English. Mintlify's nav tolerates long labels via horizontal scroll + ellipsis rather than wrap, and its type scale (13–15px chrome) stays legible at that length. Linear's 12px micro-labels and Notion's icon-first nav both break first.
4. **Mid-range Android / 3G.** Mintlify's chrome is **flat surfaces + 1px hairlines**, no `backdrop-filter`, no blur, no gradient meshes. Linear and the current `components.css:1185-1187` glass island both depend on `backdrop-filter: blur(18px)`, which is one of the most expensive paints on a mid-range Android GPU. Dropping the glass is both a Mintlify property *and* a 3G win.

**What we deliberately take from the runners-up:** Linear's focus-visible treatment (2px ring + 2px offset, never `outline: none`) and its `prefers-reduced-motion` discipline; Notion's warmer resting surface and softer border contrast for the Student variant only.

---

## 2. Design direction in one line

> **"A calm reading desk, not a cockpit."** Flat paper surfaces, one teal voice for action, one amber for warmth, hairlines instead of shadows, and a bounded content column that never fights the learner's eye.

---

## 3. Token spec

All tokens are new `--mm-*` names. Nothing below redefines an existing token, so this file is safe to add without touching `tokens.css`.

### 3.1 Colour

```css
/* ══════════════════════════════════════════════════════════════
   MET Mastery — Shell colour tokens
   Light values reconcile tokens.css/DESIGN.md with the effective
   stitch-theme.css overlay (which loads last and wins today).
   ══════════════════════════════════════════════════════════════ */
:root {
  /* ── Primary: deep teal ────────────────────────────────────── */
  --mm-primary:         #19647E;   /* canonical (tokens.css:45)       */
  --mm-primary-hover:   #0F4C61;   /* DESIGN.md:6                     */
  --mm-primary-press:   #0B3E4F;
  --mm-primary-on:      #FFFFFF;   /* 6.6:1 on #19647E  ✅ AA         */
  --mm-primary-tint:    #E2F0F3;   /* active nav fill (DESIGN.md:140) */
  --mm-primary-rgb:     25 100 126;

  /* ── Accent: brand amber ───────────────────────────────────── */
  --mm-accent:          #FFC857;   /* FILL / INDICATOR ONLY ⚠         */
  --mm-accent-ink:      #8B562A;   /* amber text+icon on light 6.1:1 ✅ */
  --mm-accent-tint:     #FFF8E7;   /* amber chip bg (5.7:1 w/ ink) ✅ */
  --mm-accent-rgb:      255 200 87;

  /* ── Surfaces ──────────────────────────────────────────────── */
  --mm-page:            #FDFCF8;   /* warm paper (DESIGN.md:144)      */
  --mm-surface:         #FFFFFF;   /* cards, menus                    */
  --mm-surface-sunken:  #F6F3EC;   /* inset wells / scroll track      */
  --mm-chrome:          #FFFFFF;   /* topbar + bottomnav fill         */
  --mm-chrome-muted:    #FDFCF8;

  /* ── Ink ───────────────────────────────────────────────────── */
  --mm-ink:             #1A2E35;   /* effective (stitch-theme.css:239) */
  --mm-ink-muted:       #5D787D;   /* 4.7:1 on #FFFFFF  ✅ AA          */
  --mm-ink-disabled:    #9AA9AC;   /* 2.4:1 — non-text-safe only      */

  /* ── Lines ─────────────────────────────────────────────────── */
  --mm-border:          #E8E5DF;   /* hairline (DESIGN.md:148)        */
  --mm-border-strong:   #CFC9BE;   /* hover / focus-adjacent          */
  --mm-divider:         rgba(26 46 53 / .06);

  /* ── Semantic (shell use only) ─────────────────────────────── */
  --mm-danger:          #A34E48;
  --mm-danger-on:       #FFFFFF;   /* 5.3:1 ✅                        */
  --mm-scrim:           rgba(11 21 32 / .38);

  /* ── Focus ─────────────────────────────────────────────────── */
  --mm-focus-ring:      0 0 0 2px var(--mm-chrome), 0 0 0 4px var(--mm-primary);
  --mm-focus-ring-dark: 0 0 0 2px var(--mm-chrome), 0 0 0 4px var(--mm-primary);
}

/* Dark — matches the winning dark palette in stitch-theme.css:357-376
   and dark.css:6. Scoped to :root[data-theme] (0,2,0) so it outranks
   every existing [data-theme="dark"] block (0,1,0). */
:root[data-theme="dark"] {
  --mm-primary:         #7FC9D2;   /* dark.css:6 — 8.8:1 on #12202b ✅ */
  --mm-primary-hover:   #A5DCE3;
  --mm-primary-press:   #5FB4BE;
  --mm-primary-on:      #06202B;   /* 8.9:1 on #7FC9D2 ✅             */
  --mm-primary-tint:    #14343D;   /* 11.6:1 with --mm-ink ✅         */
  --mm-primary-rgb:     127 201 210;

  --mm-accent:          #F0B74A;   /* 9.1:1 on #12202b ✅             */
  --mm-accent-ink:      #FCD34D;   /* dark.css:9                      */
  --mm-accent-tint:     #2A2113;
  --mm-accent-rgb:      240 183 74;

  --mm-page:            #0b1520;   /* stitch-theme.css:357            */
  --mm-surface:         #12202b;   /* :358                            */
  --mm-surface-sunken:  #0b1520;
  --mm-chrome:          #12202b;
  --mm-chrome-muted:    #1a2c38;   /* :359                            */

  --mm-ink:             #eaf1f2;   /* :362 — 14.5:1 on #12202b ✅     */
  --mm-ink-muted:       #9fb4b8;   /* :363 — 7.6:1 ✅                 */
  --mm-ink-disabled:    #5C7076;

  --mm-border:          #2a3e49;   /* :368                            */
  --mm-border-strong:   #45616a;   /* :355                            */
  --mm-divider:         rgba(255 255 255 / .06);

  --mm-danger:          #E0857F;
  --mm-danger-on:       #2A1210;
  --mm-scrim:           rgba(0 0 0 / .55);
}
```

**Amber rule (non-negotiable).** `--mm-accent` (`#FFC857`) is **1.50:1** against `#FDFCF8`. It may only ever appear as:
- a 3px indicator bar / underline / dot,
- a fill behind `--mm-accent-ink` text on `--mm-accent-tint`,
- a focus-adjacent highlight.

It must **never** be a text colour, never the *only* signal of active state (WCAG 1.4.1), and never a large background.

### 3.2 Spacing, radius, elevation

```css
:root {
  /* 4px base — subset of the existing --space-* scale */
  --mm-s-1: 4px;   --mm-s-2: 8px;   --mm-s-3: 12px;  --mm-s-4: 16px;
  --mm-s-5: 20px;  --mm-s-6: 24px;  --mm-s-8: 32px;  --mm-s-10: 40px;
  --mm-s-12: 48px;

  --mm-r-sm: 8px;        /* nav item, chip   */
  --mm-r-md: 10px;       /* menu, popover    */
  --mm-r-lg: 12px;       /* sheet            */
  --mm-r-pill: 999px;    /* bottom-nav pill  */

  /* Flat by default (DESIGN.md "Flat-By-Default Rule").
     Shadows are a state response, never ambient. */
  --mm-e-0: none;
  --mm-e-1: 0 1px 2px rgba(26 46 53 / .04);
  --mm-e-2: 0 2px 8px -2px rgba(26 46 53 / .10), 0 1px 2px rgba(26 46 53 / .04);
  --mm-e-3: 0 12px 32px -12px rgba(26 46 53 / .20), 0 2px 6px rgba(26 46 53 / .06);

  /* Motion — respect prefers-reduced-motion in the component layer */
  --mm-dur-1: 120ms;
  --mm-dur-2: 180ms;
  --mm-ease:  cubic-bezier(.2, 0, .2, 1);
}
:root[data-theme="dark"] {
  --mm-e-1: 0 1px 2px rgba(0 0 0 / .40);
  --mm-e-2: 0 2px 8px -2px rgba(0 0 0 / .55), 0 1px 2px rgba(0 0 0 / .40);
  --mm-e-3: 0 12px 32px -12px rgba(0 0 0 / .70), 0 2px 6px rgba(0 0 0 / .45);
}
```

### 3.3 Typography (shell chrome only)

```css
:root {
  --mm-font-ui: 'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI',
                Roboto, 'Helvetica Neue', Arial, sans-serif;
  --mm-font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --mm-font-mono: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  /* size / line-height / weight / tracking */
  --mm-t-brand:       0.9375rem / 1.2 / 600 / -0.01em;  /* 15px  MET Mastery */
  --mm-t-brand-sub:   0.6875rem / 1.2 / 600 /  0.08em;  /* 11px  TEACHER WORKSPACE */
  --mm-t-nav:         0.875rem  / 1.2 / 500 /  0;       /* 14px  nav item */
  --mm-t-nav-active:  0.875rem  / 1.2 / 600 /  0;
  --mm-t-section:     0.625rem  / 1.2 / 700 /  0.14em;  /* 10px  TODAY / WORKFLOW */
  --mm-t-tab:         0.6875rem / 1.1 / 600 /  0.01em;  /* 11px  bottom tab label */
  --mm-t-mobile-title:0.9375rem / 1.2 / 600 / -0.01em;  /* 15px  mobile header */
  --mm-t-menu:        0.9375rem / 1.3 / 500 /  0;       /* 15px  overflow menu item */
}
```

**Bilingual notes.**
- Ship `font-display: swap` on DM Sans / Cormorant, and keep `Inter`/`system-ui` in the stack — on 3G the webfont may never arrive and the fallback must be metrically sane.
- **Do not `text-transform: uppercase` Portuguese nav labels.** Accented capitals (`Á`, `Ã`, `Ç`, `É`) combined with `letter-spacing: .14em` lose legibility at 10–11px. Section labels stay uppercase (they're single short words); nav item labels stay **sentence case**.
- Nav labels: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-inline-size: 24ch;`

### 3.4 Layout tokens — the five required states

```css
:root {
  /* ── Geometry — BASE = smallest phone (below 391px) ────────
     Every rule below is min-width ONLY. Min-width-only queries
     cannot have dead bands by construction: the base covers
     [0, 391) and each threshold covers "itself and everything
     wider", so every possible width — including 390.5px,
     420.5px, 860.5px — matches at least one rule and gets a
     deliberate value. This is the structural fix for F0.5. */
  --mm-topbar-h:    56px;
  --mm-navbar-h:    0px;                 /* no nav row on phones */
  --mm-bottomnav-h: 56px;
  --mm-gutter:      12px;
  --mm-content-max: 880px;               /* student reading column */
  --mm-t-tab:       0.625rem / 1.1 / 600 / 0;   /* 10px — XS only */

  --mm-safe-t:      env(safe-area-inset-top, 0px);
  --mm-safe-b:      env(safe-area-inset-bottom, 0px);

  /* Derived — main consumes these, never the raw numbers */
  --mm-chrome-h:        calc(var(--mm-topbar-h) + var(--mm-navbar-h) + var(--mm-safe-t));
  --mm-bottomnav-total: calc(var(--mm-bottomnav-h) + var(--mm-safe-b));
  --mm-content-pad-b:   calc(var(--mm-bottomnav-total) + var(--mm-s-4));

  --mm-z-chrome: 1000;   /* = --z-fixed */
  --mm-z-menu:   1100;   /* above bottom nav, below --z-modal (2000) */
  --mm-z-scrim:  1050;
}

/* 4 + 3 · Small mobile + mobile: 391px and up get the phone gutter
   and the full-size tab label. (XS ≤390 keeps the base 12px / 10px.) */
@media (min-width: 391px) {
  :root {
    --mm-gutter: 16px;
    --mm-t-tab: 0.6875rem / 1.1 / 600 / 0.01em;   /* 11px, restored */
  }
}

/* 2b · Compact tablet: bottom nav off, horizontal nav row on */
@media (min-width: 769px) {
  :root {
    --mm-navbar-h: 44px;
    --mm-gutter: 20px;
    --mm-content-pad-b: var(--mm-s-8);   /* 32px, no bottom nav */
  }
}

/* 2 · Tablet 861–1024 — compressed */
@media (min-width: 861px) {
  :root { --mm-gutter: 24px; }
}

/* 1 · Desktop ≥1025 — topbar + full horizontal nav */
@media (min-width: 1025px) {
  :root { --mm-navbar-h: 48px; --mm-gutter: 32px; }
  /* data-shell lives on .mm-shell (§4.2), NOT on :root */
  .mm-shell[data-shell="teacher"] { --mm-content-max: 1120px; }  /* DESIGN.md:187 */
  .mm-shell[data-shell="student"] { --mm-content-max: 880px; }
}
```

> **Why no `max-width` anywhere.** `redesign.css` pairs `max-width: 860` with `min-width: 861`, so 860.5px matches neither and the shell renders unstyled (F0.5). Min-width-only queries are immune: each one *overrides upward* and the base covers everything below the first threshold. Never reintroduce a `max-width` band into `shell.css`.

| State | Width | Chrome | Gutter | Content max | Nav |
|---|---|---|---|---|---|
| 1 Desktop | ≥1025 | 56 + 48 = **104px** | 32px | 1120 T / 880 S | horizontal, 2nd row, 5 sections, labels shown |
| 2 Tablet | 861–1024 | 56 + 44 = **100px** | 24px | 880 (fluid) | horizontal, scroll-x, labels hidden |
| 2b Compact | 769–860 | 56 + 44 = **100px** | 20px | 880 (fluid) | horizontal, scroll-x, labels hidden |
| 3 Mobile | 421–768 | **56px** topbar + **56px** bottom nav | 16px | fluid | bottom tabs (4 + More) |
| 4 Small | 391–420 | same | 16px | fluid | bottom tabs, brand copy hidden |
| 5 XS | ≤390 | same | 12px | fluid | bottom tabs, 10px labels — **verify only** |
| 5 XS | ≤390 | same | 12px | fluid | verify: 5 × 60px tabs fit at 10px labels |

### 3.5 Touch targets & nav sizing

```css
:root {
  --mm-touch:        44px;   /* WCAG 2.5.8 floor + comfort target */
  --mm-nav-item-h:   44px;   /* horizontal nav button             */
  --mm-nav-item-px:  12px;
  --mm-nav-item-gap: 4px;
  --mm-tab-min-w:    60px;   /* 5 items × 60 = 300 ≤ 320 safe     */
  --mm-tab-h:        56px;   /* bottom-nav cell (44 hit area min)  */
  --mm-menu-item-h:  48px;   /* overflow menu row                  */
  --mm-icon:         20px;   /* nav glyph                          */
  --mm-icon-tab:     22px;   /* bottom-nav glyph                   */
}
```

**Why these beat the current values.** `.shell-nav-btn` is `padding: 6px 12px` with `--text-xs` (12px) → **≈30px** tall (`components.css:1312-1330`), failing WCAG 2.5.8. `.dash-nav-btn` is worse at `7px/12px` padding (`components.css:2836`). Raising `min-height` to **44px** with `padding-block` derived (not fixed) fixes both without changing the visual density, and 44px still fits a 48px nav row.

Never set a fixed `height` on a nav item — use `min-height` + `padding-block` so the 44px survives a user font-size increase (WCAG 1.4.4).

---

## 4. Cascade strategy — define the shell exactly once

### 4.1 The new file

**`src/styles/shell.css`** — the single, self-contained home for the unified shell. It contains *base rules, every breakpoint, every state, and both variants*. No other file may contain a `.mm-*` rule.

### 4.2 The specificity lock (this is the important bit)

Every rule is scoped under a new root class **`.mm-shell`**, which is added to both wrappers:

```jsx
// shared.jsx:100            <div className="shell mm-shell" data-shell="teacher">
// student-dashboard.jsx:122 <div className="dash mm-shell"  data-shell="student">
```

This makes every selector `.mm-shell .mm-topbar` = **(0,2,0)**, which permanently outranks **every** existing shell selector in `components.css`, `responsive.css`, `dark.css`, `redesign.css` and `stitch-theme.css` — all of which are **(0,1,0)**. Source order stops mattering; we win on specificity. This is what neutralises F0.1 and F0.2 without deleting a line of legacy CSS.

For dark mode, use `.mm-shell[data-theme]`-adjacent selectors of the form `:root[data-theme="dark"] .mm-shell .mm-nav-btn` = **(0,3,0)**, beating `dark.css`'s `[data-theme="dark"] .shell-nav-btn` **(0,2,0)**.

No `!important` anywhere in `shell.css`. If one is ever needed, the specificity lock is broken — fix the selector instead.

### 4.3 Ordering rule

`src/styles/system.css` becomes:

```css
@import './tokens.css';
@import './base.css';
@import './components.css';
@import './hierarchy.css';
@import './responsive.css';
@import './dark.css';
@import './redesign.css';
@import './shell.css';        /* ← NEW: after redesign, before stitch */
@import './stitch-theme.css'; /* stays LAST (non-negotiable) */
@import './feedback-form.css';
```

**Why this position.** After `redesign.css` so we beat it on order *and* specificity (belt and braces). Before `stitch-theme.css` so the Stitch overlay keeps its contractual right to re-skin — but because of the §4.2 lock, it can only re-skin **colour tokens**, never structure. That is exactly the desired contract: *theme overlays change paint, not geometry.*

### 4.4 Why the responsive layer can no longer lose

The responsive behaviour is **inside `shell.css`**, in the same file, in the same specificity class, ordered base → widest → narrowest. There is nothing left to override it, because:

- `redesign.css:359` (`min-width: 861px` sidebar block, F0.2) is beaten on specificity.
- `redesign.css:320 / 341 / 345` (`max-width` mobile blocks) are beaten on specificity *and* order.
- `responsive.css:307-336` is beaten on order.
- `stitch-theme.css:47-79` is beaten on specificity for any structural property.
- `dark.css:132-158` is beaten by the (0,3,0) dark selectors.

### 4.5 Tailwind 4 bridge (CSS-first, no JS config)

Add to `src/styles/tailwind.css`. `@theme` values are **static** — they cannot vary by breakpoint — so only static tokens go here; the responsive geometry stays as plain custom properties redefined in media queries (§3.4).

```css
@import "tailwindcss";

@theme {
  --color-mm-primary:       #19647E;
  --color-mm-primary-hover: #0F4C61;
  --color-mm-primary-tint:  #E2F0F3;
  --color-mm-accent:        #FFC857;
  --color-mm-accent-ink:    #8B562A;
  --color-mm-accent-tint:   #FFF8E7;
  --color-mm-page:          #FDFCF8;
  --color-mm-surface:       #FFFFFF;
  --color-mm-ink:           #1A2E35;
  --color-mm-ink-muted:     #5D787D;
  --color-mm-border:        #E8E5DF;
  --color-mm-danger:        #A34E48;

  --font-sans:    'DM Sans', 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-mono:    'Space Mono', ui-monospace, monospace;

  --radius-mm-sm: 8px;
  --radius-mm-md: 10px;
  --radius-mm-lg: 12px;

  --shadow-mm-1: 0 1px 2px rgba(26 46 53 / .04);
  --shadow-mm-2: 0 2px 8px -2px rgba(26 46 53 / .10), 0 1px 2px rgba(26 46 53 / .04);
  --shadow-mm-3: 0 12px 32px -12px rgba(26 46 53 / .20), 0 2px 6px rgba(26 46 53 / .06);

  --spacing-mm-touch: 44px;
}
```

> **Caveat from F0.10.** Because `system.css` is unlayered, Tailwind utilities will **not** beat legacy rules. Keep the shell's structural styling in `shell.css` (plain CSS) and use utilities only for leaf-level content inside `<main>`.

### 4.6 Required one-line prerequisite

`index.html:7` → add `viewport-fit=cover`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Without it every `env(safe-area-inset-*)` in §3.4 evaluates to `0px` on iOS (F0.3).

---

## 5. Component spec — the unified shell primitive

### 5.1 Anatomy

```html
<div class="mm-shell" data-shell="teacher|student">
  <a class="mm-skip" href="#main-content">Skip to content</a>   <!-- keep -->

  <header class="mm-topbar">
    <div class="mm-topbar-row">
      <button class="mm-brand" aria-label="…">
        <span class="mm-brand-mark" aria-hidden="true">M</span>
        <span class="mm-brand-copy"><strong>MET Mastery</strong><small>Teacher workspace</small></span>
      </button>
      <h1 class="mm-mobile-title">…</h1>          <!-- mobile only -->
      <div class="mm-topbar-actions">…</div>       <!-- rightSlot -->
    </div>
    <nav class="mm-nav" aria-label="Main navigation">…</nav>  <!-- ≥769 only -->
  </header>

  <main id="main-content" class="mm-main">{children}</main>

  <nav class="mm-tabbar" aria-label="Mobile navigation">…</nav> <!-- ≤768 only -->
  <div class="mm-scrim" hidden></div>
  <div class="mm-sheet" role="menu" hidden>…</div>              <!-- overflow -->
</div>
```

**Preserved a11y contracts:** `.skip-nav` → `#main-content` (`shared.jsx:101,142`) and `#student-content` (`student-dashboard.jsx:236`) both retained — `mm-main` carries the id; the focus-move in `App.jsx:396-399` keeps working; `aria-current="page"` is the active-state selector of choice (§5.4); `<main>` keeps `tabIndex={-1}`.

### 5.2 `.mm-topbar`

| Property | Value |
|---|---|
| `position` | `fixed; top:0; left:0; right:0` |
| `height` | `calc(var(--mm-topbar-h) + var(--mm-navbar-h) + var(--mm-safe-t))` |
| `padding-top` | `var(--mm-safe-t)` |
| `padding-inline` | `var(--mm-gutter)` |
| `background` | `var(--mm-chrome)` — **solid**, no `backdrop-filter` (3G) |
| `border-bottom` | `1px solid var(--mm-border)` — hairline, not shadow (DESIGN.md Flat-By-Default) |
| `z-index` | `var(--mm-z-chrome)` |
| `display` | `flex; flex-direction: column; gap: 0` |

Row 1 = `.mm-topbar-row` (`height: var(--mm-topbar-h)`, flex, `justify-content: space-between`, `gap: var(--mm-s-3)`).
Row 2 = `.mm-nav` (`height: var(--mm-navbar-h)`, `border-top: 1px solid var(--mm-divider)`).

**This replaces the current floating glass island** (`components.css:1176-1197`: `top:10px; left:12px; right:12px; border-radius:28px; backdrop-filter: blur(18px)`). Rationale: the island's inset geometry breaks `env(safe-area-inset-*)` compensation, doubles the paint cost on mid-range Android, and its 28px radius fights the 44px nav items inside a 56px bar.

### 5.3 `.mm-nav` (horizontal, ≥769px)

- `display: none` in the base; `display: flex` in the `min-width: 769px` block.
- `display: flex; align-items: center; gap: var(--mm-nav-item-gap)`
- `overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain`
- Sections: `.mm-nav-section { display: flex; gap: 4px; align-items: center }`, separated by a 1px `var(--mm-divider)` divider with `var(--mm-s-3)` margins.
- `.mm-nav-section-label` — `--mm-t-section`, colour `var(--mm-ink-muted)`; **shown only ≥1025px** (`display: none` in the base, `display: block` in the `min-width: 1025px` block).
- Edge fade on scroll: `mask-image: linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)` — only when `scrollWidth > clientWidth`.

### 5.4 `.mm-nav-item` — states

| State | Background | Text | Border / decoration | Notes |
|---|---|---|---|---|
| **default** | `transparent` | `var(--mm-ink-muted)` | none | `min-height: var(--mm-nav-item-h)`, `padding: 0 var(--mm-nav-item-px)`, `border-radius: var(--mm-r-sm)`, `gap: var(--mm-s-2)`, `font: var(--mm-t-nav)` |
| **hover** | `var(--mm-primary-tint)` | `var(--mm-ink)` | — | `transition: background var(--mm-dur-1)` |
| **active** (`[aria-current="page"]`) | `var(--mm-primary-tint)` | `var(--mm-primary)` weight 600 | `box-shadow: inset 0 -2px 0 var(--mm-primary)` | ⚠ **text is teal, never white-on-teal** — a filled teal pill on every active item would paint ~10% of the screen and break DESIGN.md's One Voice Rule |
| **focus-visible** | as current | as current | `box-shadow: var(--mm-focus-ring)` | 2px chrome + 4px primary. Never `outline: none` without a replacement. |
| **press** | `var(--mm-primary-tint)` | `var(--mm-primary-press)` | `transform: scale(.97)` | disabled under `prefers-reduced-motion` |
| **disabled** | `transparent` | `var(--mm-ink-disabled)` | `cursor: not-allowed` | also `aria-disabled="true"`, keep focusable |

Badge: `background: var(--mm-danger); color: var(--mm-danger-on); min-width: 18px; height: 18px; border-radius: var(--mm-r-pill); font-size: 10px; font-weight: 700` + `aria-label` on the parent ("3 unread").

### 5.5 `.mm-tabbar` (bottom nav, ≤768px)

- `position: fixed; bottom:0; left:0; right:0; height: var(--mm-bottomnav-total)`
- `padding-bottom: var(--mm-safe-b)`
- `background: var(--mm-chrome); border-top: 1px solid var(--mm-border)`
- `display: flex; justify-content: space-around; align-items: stretch`
- Item: `flex: 1 1 0; min-width: var(--mm-tab-min-w); min-height: var(--mm-touch); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6px 4px`
- Active indicator: **3px top bar** in `var(--mm-primary)` + a `--mm-primary-tint` pill behind the icon (`border-radius: var(--mm-r-pill)`, `padding: 4px 12px`). Both — never colour alone.
- Icon `var(--mm-icon-tab)`, label `--mm-t-tab`, `max-inline-size: 100%`, `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`.
- **No `backdrop-filter`** (same 3G reason).
- `display: flex` in the base; `display: none` in the `min-width: 769px` block (the exact complement of `.mm-nav` — the two never coexist).

**Overflow menu (state 4).** Trigger is the 5th tab ("More"), `min-width: var(--mm-tab-min-w)`, `aria-haspopup="menu"`, `aria-expanded`. Panel:
- `position: fixed; left: var(--mm-gutter); right: var(--mm-gutter); bottom: calc(var(--mm-bottomnav-total) + var(--mm-s-2))`
- `background: var(--mm-surface); border: 1px solid var(--mm-border); border-radius: var(--mm-r-lg); box-shadow: var(--mm-e-3)`
- `max-height: min(60dvh, 420px); overflow-y: auto; overscroll-behavior: contain`
- Row: `min-height: var(--mm-menu-item-h); padding: 0 var(--mm-s-4); display: flex; gap: var(--mm-s-3); align-items: center; font: var(--mm-t-menu)`
- `z-index: var(--mm-z-menu)`; scrim `var(--mm-scrim)` at `var(--mm-z-scrim)`, click-to-close.
- Behaviour: `Escape` closes and returns focus to the trigger; `Tab` cycles within; outside `mousedown`/`touchstart` closes (mirrors the existing effect at `shared.jsx:84-97`). On select: navigate, close, **and return focus to the trigger** — not to `<main>`, or the mobile keyboard user loses their place.
- ✅390px check: 5 items × 60px = 300px ≤ 390 − 24 (gutter) = 366px. Passes with 66px spare.

### 5.6 `.mm-main`

```css
.mm-shell .mm-main {
  padding-top:    var(--mm-chrome-h);
  padding-bottom: var(--mm-content-pad-b);
  padding-inline: var(--mm-gutter);
  inline-size: 100%;
  max-inline-size: calc(var(--mm-content-max) + var(--mm-gutter) * 2);
  margin-inline: auto;
  min-height: 100vh;       /* fallback for engines without dvh */
  min-height: 100dvh;      /* dvh — Android Chrome URL bar */
  content-visibility: auto;
  contain-intrinsic-size: 800px;   /* keep existing lazy-render win */
}
```

`min-height`, **never `height`** — and the `100vh` line must come *first* so `dvh` wins where supported. `content-visibility: auto` is kept from `components.css:1346` — a real 3G win; just keep `contain-intrinsic-size` generous enough to avoid scroll-anchoring jumps.

### 5.6a `.mm-shell` root — the F0.6 fix

```css
.mm-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  /* NO height. NO overflow: hidden. NO padding-top. */
}
```

Three explicit prohibitions, each fixing a defect in `redesign.css:717-723`:

| Legacy | Why it's wrong | Replacement |
|---|---|---|
| `height: 100dvh; min-height: 100vh` | `dvh ≤ vh` on mobile, so `min-height` always wins — the `dvh` correction can never apply | `min-height: 100vh; min-height: 100dvh;` (declaration order matters, no `height`) |
| `overflow: hidden` on the root | Forces scroll onto `.shell-main { overflow-y: auto }`, which breaks `position: sticky`, degrades scroll anchoring, and **stops the Android URL bar collapsing** | Nothing. Let the **document** scroll. |
| `padding: calc(52px + env(...)) 0 0` | Third hard-coded topbar height (also `redesign.css:728`, `responsive.css:310`) | No root padding; `.mm-main` carries `padding-top: var(--mm-chrome-h)` |

**Let the document scroll.** An inner scrolling container is the single most common cause of "why won't the address bar hide" on Android Chrome. With document scroll we also get native find-in-page, correct `scroll-margin-top` for the skip link, and correct safe-area behaviour for free.

Because scrolling moves to the document, the skip-link target needs `scroll-margin-top`:

```css
.mm-shell .mm-main { scroll-margin-top: var(--mm-chrome-h); }
```

### 5.7 Variants

Both variants share 100% of the geometry and differ only in **five tokens**, applied by `[data-shell]`:

| Token | Teacher workspace | Student space |
|---|---|---|
| `--mm-chrome` (light) | `#FFFFFF` | `#FDFCF8` (warmer, Notion borrow) |
| `--mm-content-max` | `1120px` | `880px` |
| `--mm-nav-item-px` | `12px` (denser) | `14px` (airier) |
| `--mm-t-nav` weight | `500` | `600` |
| `--mm-accent` usage | **suppressed** in nav; amber only in feedback/status | **enabled** — amber dot on "new" items, amber ring on the next-action tab |

```css
/* Note: these are (0,2,0) — the same specificity as every other .mm-shell rule,
   so they must come LAST in shell.css to win the cascade. */
.mm-shell[data-shell="teacher"] { --mm-nav-item-px: 12px; }
.mm-shell[data-shell="student"] { --mm-nav-item-px: 14px; --mm-chrome: var(--mm-page); }
.mm-shell[data-shell="teacher"] .mm-nav-item { --mm-accent: var(--mm-primary); } /* one voice */
```

`--mm-content-max` is applied **inside the `≥1025px` block** (§3.4), not here — below desktop both roles are fluid at 880px.

The Teacher variant stays monochrome-teal (a professional tool); the Student variant gets the amber warmth (encouraging, per `MET_MASTERY_BRAND_GUIDELINES.md:15` "encouraging without becoming childish"). **Teacher suppresses amber in the shell** — this is the whole two-register mechanism, and it costs five lines.

---

## 6. Hand-off checklist for the prototype builder

- [ ] Add `viewport-fit=cover` to `index.html:7` (F0.3) — blocks safe-area entirely.
- [ ] Create `src/styles/shell.css`; import after `redesign.css`, before `stitch-theme.css` (§4.3).
- [ ] Add `mm-shell` + `data-shell` to both roots (`shared.jsx:100`, `student-dashboard.jsx:122`).
- [ ] Scope every rule as `.mm-shell .mm-*` (§4.2). Zero `!important`.
- [ ] Neutralise `redesign.css:359-477` — the `min-width:861px` sidebar block (F0.2). Either delete it or let the specificity lock win; **verify at 1280px that `.shell` has no left padding.**
- [ ] Remove `height` / `overflow: hidden` / `padding-top` from the shell root; move scrolling to the document (F0.6, §5.6a). **Verify the Android URL bar collapses** and `position: sticky` still works inside `<main>`.
- [ ] Collapse all three hard-coded topbar heights (`redesign.css:722`, `redesign.css:728`, `responsive.css:310`) into `--mm-chrome-h`. Grep for `52px` afterwards — should be zero hits in shell CSS.
- [ ] Add `scroll-margin-top: var(--mm-chrome-h)` to `.mm-main` now that the document scrolls (§5.6a).
- [ ] Delete the ghost `.shell-sidebar` selector from `components.css:7784` — or leave it; it is inert (F0.1).
- [ ] **Resolve the cross-role rail split (F0.7).** Decided by team lead (DECISION LOCK at top): **geometry is by breakpoint, not by role** — both roles get the vertical left rail ≥861px. `[data-shell]` varies only rail *content* (WorkflowStageStrip teacher-only) and the five tokens in §5.7. There is **no `data-layout`**; the 861px media query itself is the rail.
- [ ] Keep `.skip-nav`, `#main-content`, `#student-content`, `aria-current="page"`, focus-move (§5.1).
- [ ] Verify all 5 breakpoints: 1280 / 1024 / 900 / 768 / 390.
- [ ] **Verify at 860.5px and 768.5px** (browser zoom → fractional viewport). Must render compact-tablet and mobile respectively, never unstyled (F0.5).
- [ ] Verify the 769–860 dead zone now renders a topbar + scrollable nav (F0.2).
- [ ] `shell.css` must contain **zero `max-width` queries** — min-width only (§3.4). Lint this if possible.
- [ ] Run `npm run lint:tokens` — `scripts/token-lint.mjs` exists in the build pipeline.
- [ ] Contrast audit: `--mm-ink-muted` on `--mm-chrome`, `--mm-primary` on `--mm-chrome`, `--mm-accent-ink` on `--mm-accent-tint`. All ≥4.5:1 per §3.1.
- [ ] Kill `backdrop-filter` on shell chrome; confirm no regression on a throttled mid-range Android profile.
- [ ] `prefers-reduced-motion`: disable the press `scale()` and the sheet slide.
- [ ] Regenerate `design-tokens.json` from `tokens.css` (or delete it) — it is actively misleading.
