# Session Overview — MET platform (app-shell redesign + P0 remediation)

> Supersedes the previous contents of this file (the 2026-09-02 frontend-audit pass).
> That record is preserved in `.workbuddy-ai/memory/2026-09-02.md`.

## What was done

Two threads: finishing the **unified app-shell design deliverable**, then a **P0 bug hunt**
uncovered while auditing why the shell's target files had no static analysis.

### 1. App-shell redesign — design deliverable complete, not yet integrated

A single shell primitive (`design/shell.css`, contract in `design/shell-tokens.md`, reviewable
harness in `design/shell-prototype.html`) replacing the divergent teacher/student chrome.

- **DECISION LOCK — geometry by breakpoint, never by role.** Both roles get the same chrome at
  the same widths. No role conditionals in geometry.
- Three contiguous `min-width`-only bands, so no fractional width falls between them:
  ≥861px vertical rail · 769–860px topbar + horizontal nav row · ≤768px topbar + bottom tab bar.
- All shell rules authored as `.mm-shell .mm-*` (0,2,0) to outrank legacy CSS without `!important`.
- **Root defect fixed:** every `@media` block had been authored *before* the component base rules
  at equal specificity, making all `display` switches inert. Moved to end of file.
- Round 1 critique: REVISE (10/25). Round 2: **PASS (19/25)**, all 6 hard checks green.
  Verified at 1280px: `display: grid`, rail `{0,0,280,760}`, `railTop 0` after 193px scroll.

**Integration is still NOT done** — `src/styles/shell.css` does not exist and
`grep -rn "mm-shell" src/` returns nothing.

### 2. P0 — the live teacher dashboard rendered permanently empty

Found by running `eslint src/ --no-ignore`, which exposed 2 **Errors** hidden by the lint config.

`src/pages/teacher-dashboard.jsx` called `getReviews()` without importing it. Because the call sat
inside a `Promise.allSettled([...])` **array literal** — evaluated synchronously — the
`ReferenceError` fired *before* `allSettled` ran, was swallowed by the surrounding `try/catch`, and
control fell through to `finally { setLoading(false) }` with every list still `[]`. The teacher
dashboard showed zero classes, zero cycle states and zero seeds on **every** load. The E2E test only
asserted the container was *visible*, so it passed the whole time.

**Fixed:** removed `getReviews(),` and `getAllSubmissions(),` (neither result was ever read —
`pendingReview` derives from `cycleStage`) and reindexed the two read sites. Two fewer full-table
queries per mount and per `window.focus` as a side benefit. Also fixed a `preserve-caught-error`
violation in `src/lib/workflow-academic.js` (duplicate-submission guard now rethrows `{ cause: e }`).

### 3. Blind spot closed — the root cause of the P0 shipping

`eslint.config.js` globally ignored **45 `src/` files** — including `App.jsx`, `shared.jsx` and both
dashboards. That is why a hard `ReferenceError` reached production with a clean lint tree.

The ignore list is now build output only (`dist-build`, `node_modules`, `archive`, `.vite-cache*`).
The 45 files moved to a `files:` block that disables **only** the three noisy style rules
(`no-unused-vars`, `react-refresh/only-export-components`, `react-hooks/exhaustive-deps`) while
keeping every correctness rule from `js.configs.recommended` as an **error**.

Verified by reintroducing the bug: `npm run lint` → **exit 1**, `'getReviews' is not defined (no-undef)`.

### 4. Test infrastructure — vitest was completely dead

`npm test` failed with 4 vitest suites collecting **0 tests**:
`TypeError: Cannot read properties of undefined (reading 'config')` at the top-level `describe()`.
Not caused by the edits above — a 5-line trivial probe failed identically. Root cause was a
corrupted Vite dep-optimizer cache; moving `node_modules/.vite` aside fixed it instantly.

## Verification

| Gate | Result |
|---|---|
| `npm run lint` (`--max-warnings 0`) | **exit 0** — now covering the 45 previously-ignored files |
| `npm test` | **exit 0** — 250 unit + 25 vitest, stable over 3 consecutive runs |
| Regression proof (bug reintroduced) | `npm run lint` → **exit 1**, `no-undef` at `teacher-dashboard.jsx` |

## Files changed

- `src/pages/teacher-dashboard.jsx` — removed the undefined call + 1 dead call, reindexed read sites
- `eslint.config.js` — global ignore → linted `files:` block with 3 style rules off
- `src/lib/workflow-academic.js` — attach `{ cause: e }`
- `src/lib/tts-utils.js` — removed a stale `eslint-disable` directive

## Still open

1. **Integrate the shell** — copy `design/shell.css` → `src/styles/`, import after `system.css`,
   migrate `shared.jsx:100` and `student-dashboard.jsx:122` to `.mm-shell` + `data-shell`.
2. `WorkflowStageStrip` at ≤860px — the switch must be implemented in the page component.
3. `design-tokens.json` is stale (primary `#457B9D` vs `tokens.css:45` `#19647E`).
4. Real-device verification — all shell measurements came from a resized iframe in desktop Chrome.
5. Two toast systems coexist (`src/lib/toast-provider.jsx` + an ad-hoc inline toast).
6. Wider audit items: CSP `report-to`; `src/core/` (99 dead files, 4,297 LOC); ~62 MB of MP3s;
   `axe-core` in CI; `npm test` not yet in the pre-ship gate.
