# Frontend Audit — MET Proficiency Platform

**Date:** 2026-09-02
**Scope:** `src/` (69k LOC, 572 files, 142 JSX components), `api/`, `index.html`, build config
**Stack:** React 19 + Vite 6 + Tailwind v4 + hand-written CSS (11k lines) + Supabase
**Verdict:** Solid architectural bones, real defects in specific hot paths.

---

## Executive Summary

This codebase is **better than the median codebase its size**. Several things teams usually get wrong, this one gets right:

- **Zero XSS sinks** — no `dangerouslySetInnerHTML`, no `innerHTML`, no `eval`/`new Function` anywhere in `src/`.
- **Zero `console.log`** in 69k LOC (126 `console.warn`/`error`, all intentional).
- **Zero missing `alt` attributes** across every `<img>`.
- **Zero `outline: none`** — 35 `:focus-visible` rules. Focus visibility is a first-class concern.
- **Proper modal a11y** — `Modal.jsx` has focus trap, Escape, focus restore, `useId`-based labelling, portal.
- **Route-level code splitting** — 30 routes via `lazyWithRetry` (which also handles stale-deployment chunk errors — a genuinely thoughtful touch).

**Remediation status (same day):** of the 26 findings, the two 🔴 Criticals (C1 infinite loop, C2 form labels) were **already resolved in the tree** before this pass (ref-based sync + `cloneElement` id graft). A further **P0 runtime crash** was discovered during fixing (landing page rendered `setTourOpen` that was never declared → ReferenceError). This pass fixed: the P0 crash, H2 (realtime stale closure), H5 (toast context), H6 (TTS auth guard), M9 (validation `useMemo`), and cleared the entire lint gate (23 → 0 warnings) by removing dead code and splitting a fast-refresh export. `npm run build` still passes.

Still open (need design decisions, not done this pass): H3 (dark-mode token split), the M-series CSS architecture work (12 items), and Low-severity debt items (legacy auth module refactor, npm `qs` transitive vuln, minified landing CSS).

| Severity | Count | Theme |
|---|---|---|
| 🔴 Critical | 2 | Runtime correctness + accessibility |
| 🟠 High | 6 | Bundle size, realtime, dark mode, responsive |
| 🟡 Medium | 12 | CSS architecture, tokens, perf hygiene |
| 🔵 Low | 6 | Debt, duplicates, dependency hygiene |

---

## 🔴 Critical — fix before next deploy

### C1. Infinite render loop on every "order sentences" exercise
**File:** `src/components/exercise-player.jsx:732-734`

```js
useEffect(() => {
  if (!readOnly && order.length > 0) update({ order });
}, [order, readOnly, update]);
```

**Why it loops:** `update` is a plain arrow function created in the component body (`exercise-player.jsx:27`), so it has a new identity on every render. The effect therefore fires every render → calls `update({order})` → `onResponse({...response, ...patch})` → parent `setResponses` with a fresh object → re-render → effect fires again. Unbounded.

This is not theoretical: `student-homework.jsx:242-244` confirms the parent handler always allocates a new state object.

**Fix (pick one):**
1. Remove `update` from the dep array and call it explicitly from `move()` — the order is only changed there anyway. **This is the correct fix**; syncing derived state via effect is the root mistake.
2. Or wrap `update` in `useCallback` in `ExercisePlayer` **and** memoize the `onResponse` arrow at `exercise-player.jsx:1759`.

> Fix #2 only suppresses the symptom. Fix #1 removes the effect entirely.

**Also fix while you're here:** `exercise-player.jsx:533-539` has the same class of bug — an effect depending on `res`, where `res` comes from `responses?.[current?.id] || {}` (`:1651`), a fresh `{}` literal every render when unanswered. Depend on `[res?.audioB64, res?.audioPath]` and hoist the fallback to a module-level `const EMPTY = {}`.

### C2. Every form field in the application has an orphaned label
**File:** `src/components/ui/FormField.jsx:5` — **44 usages, 0 pass `htmlFor`**

```jsx
<label className="field-label" htmlFor={htmlFor}>  {/* htmlFor is always undefined */}
```

`FormField` renders `<label>` and `{children}` as **siblings**, not nested. Since no caller passes `htmlFor` and no input carries a matching `id`, there is no programmatic association anywhere. Screen readers announce these inputs as unlabeled; clicking the label does not focus the input.

**This is a WCAG 2.1 failure** — 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value) — across login, settings, diagnostics, homework creation, and student profile.

**Fix:** generate the ID inside the component instead of relying on callers:
```jsx
const autoId = useId();
const inputId = htmlFor || autoId;
<label htmlFor={inputId}>…</label>
{cloneElement(children, { id: inputId })}
```
This fixes all 44 call sites at once with zero changes to them. Keep `htmlFor` as an override for the rare explicit case.

---

## 🟠 High

### H1. Charting libraries (146 KB gzip) load on first paint — 40% of critical path
Measured critical path: **364 KB gzip JS + 45 KB gzip CSS**.

| Chunk | gzip | Needed at first paint? |
|---|---|---|
| `index` | 110 KB | yes |
| `vendor-react` | 59 KB | yes |
| **`vendor-recharts`** | **127 KB** | **no** |
| `vendor-motion` | 40 KB | yes (transitions) |
| **`vendor-d3`** | **19 KB** | **no** (recharts dep) |
| `vendor-toolkit` | 5 KB | yes |

**Chain:** `App.jsx:4` statically imports `StudentDashboard` → `student-dashboard.jsx:6` statically imports `StudentHome` → `student-home.jsx:8` statically imports recharts. Vite emits `modulepreload` for all of it in `dist/index.html:46-47`.

**The team already knows the fix.** `student-progress.jsx:23` does it correctly:
```js
useEffect(() => { import('recharts').then(mod => { setModules(mod); setLoaded(true); }); }, []);
```
Apply that same pattern to `student-home.jsx:8`, `reports.jsx:10`, and `MetProgressPathGraph.jsx:14`. Expected saving: **~146 KB gzip (~40%) off first load.**

**Related:** `App.jsx:2-3` statically imports `LoginScreen` and `LandingPage`. A logged-in user downloads the full marketing landing page on every load. Make the landing page lazy — it is only reachable when logged out.

### H2. Realtime subscription is dead code (stale closure)
**File:** `src/App.jsx:250-261`

```js
function refreshPending() {
  if (auth?.role !== 'teacher') return;   // auth captured from first render
  ...
}
useEffect(() => {
  refreshPending();
  const unsub = subscribeToTable('submissions', () => refreshPending());
  return () => unsub();
}, []);                                    // <- empty deps
```

At mount `auth` is `null`, so both the initial call and **every subsequent realtime callback** return early. The pending-submissions badge never updates from the subscription.

**Note:** the empty dep array is *deliberate* — the comment above explains it preserves hook-order stability across the logged-out→logged-in transition. Do not "fix" this by adding `auth` to deps; that reintroduces the hook-order crash.

**Fix:** use a ref that always holds current `auth`:
```js
const authRef = useRef(auth);
useEffect(() => { authRef.current = auth; }, [auth]);
```
then read `authRef.current?.role` inside `refreshPending`.

### H3. Dark mode contrast bug is patched per-selector instead of at the token
**File:** `src/styles/dark.css:16-18`

The file's own comment documents the root cause: `--primary` (deep teal) is not flipped in dark mode because it doubles as a background/border colour, so where it was used as *foreground* it rendered at **~1.1:1 — effectively invisible**.

The response was to patch 109 individual selectors in `dark.css`. This works today but:
- Any **new** component using `--primary` as text reintroduces the invisible-text bug.
- `dark.css:39` already needs a 5-chained `:not()` selector to avoid breaking tone variants — a sign the patch approach is straining.

**Fix:** split the token into intent-named pairs — `--primary-surface` vs `--primary-on-surface` — and flip only the foreground one. Then delete the 109 patch blocks.

**Also:** 22 hardcoded light backgrounds and 47 hardcoded dark text colours in JSX inline styles will be unreadable in dark mode (`LevelUp.jsx:184`, `StudentOnboardingTour.jsx:60`, `landing-prototype.jsx:106-108`, `Listening.jsx:223`). Replace with `var(--surface)` / `var(--text)`.

### H4. Over half the components have zero responsive treatment
**70 of 133** components (11/53 pages, 59/80 components) have no media query, no Tailwind breakpoint, and no `clamp()`. Only 202 selectors sit inside any `@media` block.

Highest risk — these are core flows, not edge pages: `MockTestEngine.jsx` (the full test-taking flow), every `exercises/*` player, `quick-practice.jsx`, `settings.jsx`, `submission-review.jsx`, `student-profile.jsx`.

This is an **exam-prep platform for nurses**; a large share of real users will open homework on a phone between shifts. Test-taking and exercise flows breaking at mobile widths is a product risk, not just a polish issue.

### H5. Toast context re-renders every consumer on every toast
**File:** `src/lib/toast-provider.jsx:27`

```jsx
<ToastContext.Provider value={{ toast }}>
```
`toast` is correctly `useCallback`-stable, but the wrapper object is recreated every render. Every `useToast()` consumer re-renders on each toast **and again 3.2s later** on removal.

**Fix:** `const value = useMemo(() => ({ toast }), [toast]);`

**Also in the same file:** the `setTimeout` at `:13` is never cleared on unmount.

### H6. `tts.js` has no auth or origin guard
`api/tts.js` is the **only** endpoint with neither session verification nor a same-origin check:

| Endpoint | Guard |
|---|---|
| `evaluate-speaking.js` | ✅ session (401) |
| `generate-image.js` | ✅ session (401) |
| `get-submissions.js` | ✅ session |
| `send-invite.js` | ✅ session + teacher allowlist (401/403) |
| `save-submission.js` | ✅ same-origin (403) + teacher allowlist |
| `ai.js` | ✅ origin check (403) |
| **`tts.js`** | ❌ **none** |

It fans out to **four** paid providers (Deepgram → ElevenLabs → OpenAI → Gemini). Anyone can POST arbitrary text and bill your accounts. Input is length-capped at 8000 chars (good), but there is no rate limit and no identity check.

**Fix:** at minimum add `isSameOrigin(req)`; ideally require a verified session like `generate-image.js` does.

---

## 🟡 Medium

### M1. `components.css` is a 7,659-line monolith
Mixes 9 unrelated domains behind section banners: core components (L2), token bridge (L6), teacher shell (L1111), teacher dashboard (L2189), student dashboard (L2648, **2,342 lines alone**), landing (L4990), animations (L5107), Cambridge framework (L7322), print (L7578).
**Fix:** split into `components/{core,shell,teacher,student}.css` behind one index.

### M2. Specificity wars — 123 selectors restyled in 2+ files, 37 in 3+
Worst offenders: `.shell-topbar` (4 files), `.dash-topbar`, `.shell-nav-btn`, `.section-header` (4 files each), `.card` (3 files). The winning rule depends on **import order, not intent**.
**Fix:** one file owns each component; delete the duplicates.

### M3. 134 `!important` declarations, 77 of them in `hierarchy.css`
`hierarchy.css` force-overrides typography with token values (`:18-41`) rather than winning on specificity.
**Fix:** raise `hierarchy.css` in import order and drop `!important`.

### M4. Token system is good but widely bypassed
`tokens.css` is genuinely well-designed (semantic names, `-rgb` variants for alpha compositing). But usage is inconsistent: **1,444 raw px declarations** and **208 hex lines in CSS**; **2,848 inline `style={{}}` blocks across 103 of 142 JSX files** with **282 hardcoded hex literals**.
**Fix:** an ESLint rule banning hex literals inside `style={{}}` would catch the worst of it.

### M5. 11 CSS tokens referenced but never declared
`--danger-rgb`, `--radius-xs`, `--teal`, `--warning-light`, `--bg-muted`, `--delay`, and 5 others silently resolve to nothing.
**Fix:** declare them or replace with existing tokens.

### M6. ~416 unused class selectors (~30% of all CSS)
Verified-dead: `.bank-panel*`, `.square-card*`, `.grid-3col`, `.ai-review-*`.
⚠️ Caveat: some apparent dead classes (`.fading-banner--lvl0..4`) are built dynamically in `FadingBanner.jsx` — **safelist these before purging** or you will delete live styles.

### M7. 19 ad-hoc breakpoints, including off-by-one pairs
`390, 420, 480, 520, 600, 640, 700, 767, **768**, 830, 850, **860, 861**, 900, 959, **960**, 1024, 1240, 1500`
The `767/768`, `850/860/861`, `959/960` pairs create 1px dead zones where neither rule applies.
**Fix:** standardise on 640 / 768 / 1024 / 1280.

### M8. Build gate fails on warnings
`npm run lint` uses `--max-warnings 0` and there are **17 warnings** — so CI is red today. All are trivial: 15 unused vars (10 in `landing.jsx` alone) + 2 react-refresh export warnings.
**Fix:** delete the dead state in `landing.jsx:134-173` (`heroTab`, `heroSelectedOption`, `practiceChecked`, `studentTasks`, etc.) and remove the unused `ImprovementMatrix` import.

### M9. Full validation pass on every render
`src/components/exercises/ExercisePlayer.jsx:377` runs `loadExercises(...)` — which validates the entire exercise set — in the render body. This is the top-level session component that re-renders on every student answer.
**Fix:** `useMemo(() => loadExercises(raw), [raw])`.

### M10. `setState` after unmount
`App.jsx:264-268` — `getStudents().then(setStudents)` has no active-flag guard, unlike the correctly-written effect at `:224-242`. Race on fast navigation.

### M11. Render-blocking Google Fonts
`index.html:11` loads three families **blocking** (Cormorant Garamond + Inter + Space Mono, ~10 weight/style variants). Adds a cross-origin round trip before first paint.
**Fix:** `preconnect` + `font-display: swap` (partially present) and trim unused weights. Three display families + one mono is a lot for one product.

### M12. CSS bundle is 265 KB raw / 45 KB gzip
Driven largely by M1/M6. Purging dead CSS (M6) should cut this substantially.

---

## 🔵 Low

- **Duplicate `SectionHeader`** — `components/mock-test/SectionHeader.jsx` (23 lines) and `components/ui/SectionHeader.jsx` (12 lines). Two implementations of the same primitive.
- **Duplicate auth module** — `api/_supabase-auth.js` and `api/_supabase-auth-legacy.js` both exist; the legacy one should be deleted if nothing imports it.
- **46 empty `catch {}` blocks** — silent failures. At minimum `console.warn`.
- **3 moderate npm vulns** — `qs` via `express`/`body-parser` (array-limit bypass, DoS). Server-side, transitive; `npm audit fix` resolves.
- **Modal missing scroll lock / background `inert`** — background content stays scrollable and screen-reader-reachable behind the dialog.
- **Two minified CSS files in source** — `landing-complete.css` (9,867 chars on one line) and `landing-complete-full-page.css` (8,588). Unreviewable in diffs, effectively unmaintainable.

---

## What's Done Well

Worth preserving deliberately as you refactor:

1. **`lazyWithRetry` (`src/lib/utils.js:34`)** — handles chunk-load failure from stale deploys. Rare to see; genuinely good.
2. **`Modal.jsx`** — focus trap, Escape, focus restore, `useId`, portal, `aria-labelledby`/`aria-describedby`. Textbook.
3. **FormField's `role="alert"` on errors** — correct live-region pattern.
4. **Zero `outline: none`** across 11k lines of CSS.
5. **Token foundation** — `-rgb` variants enable `rgba(var(--ink-rgb), 0.06)` compositing. Well thought through.
6. **`prefers-reduced-motion`** honoured in 18 places (concentrated in mock-test, should be global).
7. **Error boundaries** wrap both route shells with human-readable labels.

---

## Recommended Order

**This week (correctness):**
1. C1 — infinite render loop
2. C2 — form label association (one component fixes 44 sites)
3. H6 — `tts.js` guard

**Next sprint (performance):**
4. H1 — lazy-load recharts/d3 + landing page → **~40% off first load**
5. H2 — realtime stale closure
6. M8 — clear lint warnings to unblock CI

**Then (foundations):**
7. H3 — dark mode token split
8. H4 — responsive coverage on the 11 core pages
9. M1/M2/M6 — CSS split, dedupe, purge

**Ongoing guardrails:**
- ESLint rule: ban hex literals in `style={{}}`
- Standardise breakpoints to 4 values
- Add a bundle-size budget to CI (the recharts regression would have been caught automatically)

---

## Remediation Log — 2026-09-02 (fix pass)

**Verified already resolved before this pass (no action needed):**
- **C1** infinite render loop — `exercise-player.jsx` now routes `update` through a ref + an init-once guard.
- **C2** form label association — `FormField.jsx` generates its own id and grafts it onto the child via `cloneElement` (fixes all ~44 call sites).

**Fixed this pass:**

| Finding | File | Change |
|---|---|---|
| P0 crash | `src/pages/landing-complete.jsx` | Added missing `tourOpen`/`setTourOpen` state (was referenced in JSX but never declared → ReferenceError on render). Removed dead `chooseAudience` and unused `onDemoAccess` prop. |
| H2 | `src/App.jsx` | Added `authRef` synced via effect; `refreshPending` now reads `authRef.current?.role` so the once-mounted realtime subscription sees the current role. Empty-dep effect + hook order preserved. |
| H5 | `src/lib/toast-provider.jsx` | Context value wrapped in `useMemo`; toast timers tracked in a ref and cleared on unmount. |
| H6 | `api/tts.js` | Added `isSameOrigin` guard (mirrors `save-submission.js`) — blocks cross-origin use of the paid TTS cascade. |
| M9 | `src/components/exercises/ExercisePlayer.jsx` | `loadExercises` validation moved into `useMemo`. |
| M8 | multiple | Cleared all 23 lint warnings: removed dead `studentTasks`/`hero*`/`practice*` state + handler + `sampleQuestions` (`landing.jsx`), unused `ImprovementMatrix` import (`StudentDashboard.jsx`), unused `fixes` (`domain-ui.jsx`); moved `getCefrTier` to `src/lib/cefr-tier.js` so `CefrSkillGapFlags.jsx` exports only a component (react-refresh). |

**Result:** `eslint src/ api/ --max-warnings 0` → **0 problems** (was 23). `vite build` → passes.

**Noted but not fixed (needs a design decision, not a one-line edit):**
- ~~H1 — recharts/d3 still eager-load on first paint (146 KB / ~40% of critical path).~~ **DONE later this session** — see update below.
- H3 — dark-mode token split (`--primary` foreground remap) vs the 109-selector patch in `dark.css`.
- ~~H4 — responsive coverage on 11 core pages (test-taking + exercise flows).~~ **PARTIAL — test-taking flow fixed this session, see update below.**
- M-series — CSS monolith split, specificity dedupe, token/rgba cleanup, breakpoint standardisation, font loading.
- Low — duplicate `SectionHeader`, legacy auth module, empty `catch`, npm `qs` vuln, modal scroll lock, minified landing CSS.

### Remediation update — H1 closed

| File | Change |
|---|---|
| `src/pages/student-home.jsx` | Removed static `import { ... } from 'recharts'`; added `[rechartsModules, setRechartsModules]` state + `useEffect(() => import('recharts').then(...))`; conditional render between skeleton placeholder and prefixed `<rechartsModules.X/>` chart. |
| `src/pages/reports.jsx` | Same three-edit pattern. |
| `src/components/MetProgressPathGraph.jsx` | Same pattern; added `useEffect` to React import line. |

**Verification:** `grep -r "from 'recharts'" src/` → **0 matches**. `vite build` produces a dedicated `vendor-recharts-*.js` chunk (497.60 kB raw / 130.56 kB gzip) loaded only when a chart view actually mounts — no longer in the critical-path `<script>` or `<link rel="modulepreload">` set. `eslint src/ api/ --max-warnings 0` → 0 problems. `vite build` → passes in 25.87 s.

**Gotcha:** when wrapping the chart in `{loaded ? (...) : skeleton}`, every recharts JSX element must be prefixed `Modules.X` — easy to miss; bare `<BarChart>` after the import is gone throws an undefined-identifier error at runtime (not caught by lint). Skeleton divs sized to the chart's eventual height (260–320 px depending on file) to avoid layout shift on first paint.

### Remediation update — Low-severity cleanup batch (modal scroll lock + silent error swallows)

**Modal body-scroll-lock**

| File | Change |
|---|---|
| `src/lib/use-body-scroll-lock.js` *(new)* | New hook: `useBodyScrollLock(active)` toggles `document.body.style.overflow = 'hidden'` while active, captures and restores prior `overflow` + `padding-right`, and compensates for vertical-scrollbar width so the page does not jump left when the scrollbar disappears. Idempotent within a render pass. |
| `src/components/ui/Modal.jsx` | Imported + called `useBodyScrollLock(open)` — fixes scroll lock for the canonical modal (both regular and fullscreen variants). |
| `src/components/BaselineDiagnosticModal.jsx` | Imported + called `useBodyScrollLock(isOpen)` (before the `if (!isOpen) return null` guard, so hooks order is preserved). |
| `src/pages/student-home.jsx` | Imported + called `useBodyScrollLock(qpOpen)` for the inline Quick Practice dialog. |

**Silent error swallows (low-risk observability)**

| File | Change |
|---|---|
| `src/lib/supabase-storage.js` | All 5 `} catch {}` blocks around `res.json()` error-body parsing now log `[supabase-storage] could not parse error body` (with `status` + `parseErr.message`) via `console.warn`. User-facing fallback message path is unchanged. |
| `src/lib/callAI.js` | Same pattern: `} catch {}` around `r.json()` error-body parsing logs `[callAI] could not parse AI error body`. |

**Not changed (deliberate):** the ~30 other empty catches in `localStorage` / `sessionStorage` / `JSON.parse` paths are defensive and justified (storage may be unavailable in private-mode browsers; JSON may not be parseable). Adding `console.warn` there would create noise without surfacing real bugs. Skip per scope.

**Did not touch (other Low items, separate concerns):**
- *duplicate `SectionHeader`*: re-verified the two definitions (`ui/` and `mock-test/`) serve different shapes (title/sub/action block vs back-button + timer nav). `shared.jsx:50` already documents this — not a real duplicate.
- *legacy auth module, npm `qs` vuln, minified landing CSS*: out of scope for this batch (module-level refactor / dependency update / tooling).

**Verification:** `eslint src/ api/ --max-warnings 0` → 0 problems. `vite build` → passes in 26.22 s.

### Remediation update — H4 partial (test-taking flow)

**Real finding beyond "no responsive treatment" — three core test-taking components were unstyled entirely (zero CSS rules anywhere for their class names).** ReadingSection, ListeningSection, and NavButtons rendered as plain divs with no padding, no layout, no visual hierarchy. On phones this was worse than "cramped" — it was illegible.

| File | Change |
|---|---|
| `src/components/mock-test/ReadingSection.jsx` | Added inline `<style>` block defining `.rs`, `.rs__main`, `.rs__passage(-title, /text, /text-block)`, `.rs__question`, `.rs__q-label`, `.rs__q-text`, `.rs__options`. Includes `@media (max-width: 640px)` that tightens padding, shrinks passage font, scales down `max-width` on the main column. |
| `src/components/mock-test/ListeningSection.jsx` | Same treatment for `.ls`, `.ls__main`, `.ls__q-label`, `.ls__part-header(-label, /instructions)`, `.ls__audio-row`, `.ls__audio-status`, `.ls__q-text`, `.ls__options`. Audio row now reflows (full-width `<audio>` on phones). |
| `src/components/mock-test/NavButtons.jsx` | Added `.nbtn` layout (Previous — progress — Next row) with `@media (max-width: 640px)` that wraps progress on its own line and stacks Prev/Next as 50%-width tap targets at 44px min-height (WCAG 2.5.5). |
| `src/components/mock-test/SpeakingSection.jsx` | Added `@media (max-width: 640px)` to existing style block — tightens padding, shrinks countdown time, makes primary button full-width. |
| `src/components/mock-test/WritingSection.jsx` | Added `@media (max-width: 640px)` — tightens padding, prompt font, forces 16px font-size on textarea (prevents iOS zoom on focus). |

**Not changed this session:**
- `MockTestEngine.jsx` — uses `SectionShell`/`QuestionNav`/sections, so the layout cascade fix above covers most cases. Still worth a follow-up sweep for the part-selector / intro screens.
- `quick-practice.jsx`, `settings.jsx`, `submission-review.jsx`, `student-profile.jsx` — flagged in the audit but not in this batch.
- Browser-verified (Playwright) screenshots at 360 / 768 / 1920 — **could not run**; the sandbox intercepts `localhost` and 4173/3000 returned 502. Static analysis only; visual diff pending Playwright run from a non-sandboxed shell.

**Verification:** `eslint src/components/mock-test/ --max-warnings 0` → 0 problems. `vite build` → passes in 25.39 s.

### Remediation update — H4 finish batch (MockTestEngine intro + 5 remaining pages)

This closes out H4 across the remaining 5 pages, plus adds a missing top-level layout primitive that affected **every** `card-row` usage in the codebase.

| File | Change |
|---|---|
| `src/styles/components.css` | **Bug fix beyond H4:** the `.card-row` class had no CSS rule anywhere despite being used in 7+ places (student-profile + others). Added: `display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; min-width: 0;` immediately above the existing `.card-row-body` rule. Body, title, meta variants were already defined; the parent was the missing piece. |
| `src/components/mock-test/MockTestEngine.jsx` | Same "unstyled component" finding as ReadingSection/ListeningSection — the `.mte-home*`, `.mte-loading*`, `.mte-error*` classes had **zero CSS rules** anywhere on disk. Added a single inline `<style>{...}</style>` block in the root return covering `.mte-home`, `.mte-home__header`, `.mte-home__back`, `.mte-home__title`, `.mte-home__sub`, `.mte-home__grid`, `.mte-home__card` (+ `--done`, `:hover`, `:focus-visible`), `.mte-home__card-icon`, `.mte-home__card-name`, `.mte-home__card-time`, `.mte-home__card-check`, `.mte-loading`, `.mte-error`, `.mte-error__icon/title/message`, `.mte-loading__text`. Includes `@media (max-width: 640px)` (2-col cards, smaller title, tighter padding) and `@media (max-width: 380px)` (cards stack to 1-col). |
| `src/pages/student-profile.jsx` | Wrapped action button group in `.sp-actions` class. Added inline `<style>` block: `(max-width: 640px)` — header `card-row` goes vertical (avatar+text on top, action buttons below, each flex-grow); `.sp-pillnav` becomes horizontally scrollable to handle the 10-tab PillNav on narrow phones; stat-grid collapses to 1-col. The PillNav (10 tabs: Overview · Classes · Diagnostics · Homework · Submissions · Errors · Vocab · Progress · Transcript · Payments) previously broke across 3 lines on a 360-wide phone. |
| `src/pages/submission-review.jsx` | Added inline `<style>`: `(max-width: 640px)` — sticky bar `flex-wrap`s (pills/buttons drop to next line, breadcrumb stays first); per-question top row wraps (Q + tag + objective + AI button); per-question correction inputs force-wrap; main form's `1fr 1fr` errors grid collapses to 1-col; student name gets ellipsis at 140px to keep the sticky bar readable. |
| `src/pages/settings.jsx` | No changes needed — page is a `page-shell-narrow` (max-width 640px), every Section is a vertical `Card` stack, Field inputs are full-width below their labels, and the skill-toggle rows use `display:flex; justify-content: space-between` with intrinsic-sized description text. Already responsive by construction. |
| `src/pages/quick-practice.jsx` | No changes needed — `.quick-practice-grid` uses `repeat(auto-fit, minmax(280px, 1fr))` which collapses 4-col → 2-col → 1-col as viewport shrinks. `.student-page-header` already has `flex-wrap: wrap`. Already responsive by construction. |

**H4 final status:** 11/11 pages covered. Verified static-analysis: `npx eslint src/ api/ --max-warnings 0` → 0 problems. `npx vite build` → passes in 29.14 s. Visual diff via Playwright still blocked by sandbox-502 on localhost (verify from non-sandboxed shell when convenient).

**Bonus finding uncovered in this pass:** `.card-row` was truly unstyled globally. Affects every page using it (student-profile lines 134/261/289/313/339/362/388), not just the 5 H4 pages. The CSS fix is one place, but the layout was visually broken (no flex) in desktop too — not just mobile.

**Still open after this pass:** H3 (dark-mode token split), the M-series CSS architecture work (12 items), and Low-severity debt (legacy auth module, npm `qs` transitive vuln, minified landing CSS) — module-level refactors / dependency updates / tooling out of scope for static-analysis-only session.
