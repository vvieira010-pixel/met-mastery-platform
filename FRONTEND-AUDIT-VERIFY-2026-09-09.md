# Frontend Audit — Verification Pass
**Verified:** 2026-09-09 20:1x · **Against:** `FRONTEND-AUDIT-2026-09-09.md` (774 lines, written ~20:10 today)
**Method:** re-measured the live working tree and `dist/`. Every number below was produced by a command run now, not copied from the audit.

---

## ✅ Applied during this pass (20:2x)

| Item | Before | After |
|---|---:|---:|
| `dist/` weight | **129 MB** | **71 MB** (−58 MB, −45%) |
| `.wav` in dist | 30 files / 40.2 MB | **0** |
| Duplicate `Practice Studio audios/` | 28.3 MB / 75 files | **removed** |
| MP3s in dist | 228 | 165 (63 duplicates gone) |

Ran `node scripts/prune-shipped-assets.mjs` directly — no rebuild needed, because `dist/`
(20:02) was already newer than the last source change to `index.html` (18:51), i.e. it
already contained all 7 P0 fixes. A full `npm run build` would have hit the sandbox's
bulk-delete guard on `emptyOutDir` and risked a partially-deleted `dist/`.

**Audio integrity re-checked after pruning:** resolved all 145 audio references in `src/`
against `dist/` → **0 genuine misses.** The 23 apparent misses were all false positives:
19 were `/part1/part1_convNN.mp3` relative paths that resolve once the `audio/listening/`
base is applied, and the rest were prose/placeholder strings (including an
`asking-for-directions-pt1.mp3` example URL inside an `<input placeholder>`).

---

## TL;DR — next action

**Delete `.tmp/dist-*` (605 MB, manual — a delete guard blocks it from here), then add CSP
`report-to`.** Everything else on the list is either done or needs your decision.

---

## 1. P0 fixes — verified present on disk

| # | Fix | Evidence | Status |
|:--:|---|---|:--:|
| 1 | CSP allows Supabase Realtime + `object-src 'none'` | `vercel.json:28` → `connect-src … wss://*.supabase.co …; object-src 'none'` | ✅ |
| 2 | Theme bootstrap externalised (no inline script) | `index.html:15` → `<script src="/theme-boot.js">`; `public/theme-boot.js` exists (1,024 B) | ✅ |
| 3 | Role default → least privilege | `src/lib/supabase-db/auth.js:28` → `let role = 'student'` | ✅ |
| 4 | `Pill` keyboard-operable, conditional role/tabIndex | `src/components/ui/Pill.jsx:14-31` — `interactive = typeof onClick === 'function'`; Enter/Space handled | ✅ |
| 5 | `object-src 'none'` added | `vercel.json:28` | ✅ |
| 6 | `target: 'es2019'` + browserslist declared | `vite.config.js:20`; `package.json.browserslist` = `defaults, not dead, Safari >= 15.4, iOS >= 15.4` | ✅ |
| 7 | `-webkit-backdrop-filter` prefixed | `redesign.css:30` & `:327`; `CommandPalette.jsx:60` | ✅ (2 leftovers, see N3) |

**Lint:** `npx eslint src/ api/ --max-warnings 0` → **clean, 0 warnings.** ✅

---

## 2. Corrections — three claims in the audit are now wrong

### ❌ C-1: "Playwright browser matrix — not done"
**It is already enabled.** `playwright.config.ts` declares three projects: `Chromium`
(`Desktop Chrome`), `Firefox` (`Desktop Firefox`), `WebKit` (`Desktop Safari`), with
`webServer.command = 'npm run build && npm run start'`. Roadmap item #26 is already satisfied.
Delete it from the list.

### ❌ C-2: "Clean hygiene — 0 `console.log`"
**There are 44.** All of them live in `src/core/**` (see N1). The audit likely scoped the
grep to `.jsx/.js` and missed the `.ts` tree.

### ❌ C-3: "`dist/` is 172 MB" / "`excludeLegacyAudioFromDist()` plugin in `vite.config.js`"
Two separate corrections:
- **Measured `dist/` right now: 129 MB** (127.2 MB summed file bytes). Not 172.
- **There is no `excludeLegacyAudioFromDist` plugin** in `vite.config.js` — it only has
  `tailwindcss()` and `react()`. Pruning happens *after* the build, via
  `scripts/prune-shipped-assets.mjs`, which `npm run build` runs as step 2. Same outcome,
  different mechanism — but any note pointing at the Vite plugin is wrong.

---

## 3. New findings (not in the audit)

### 🆕 N1 — `src/core/**` is 100% dead code: 99 files, 4,297 LOC, 0 importers
`grep -rn "…/core…" src/ --include=*.{jsx,js,ts,tsx}` **outside** `src/core/` returns
**zero matches**. No page, component, lib, or test imports it. It is a DDD /
claude-flow kernel scaffold (6 domains: event-coordination, health-monitoring,
lifecycle-management, mock-test, session-management, task-management) that was never wired up.

Consequences: it carries **all 44 `console.log` calls**, it inflates the file/LOC counts in
the audit header, and it is a permanent trap — it *looks* like the real domain model while
`src/domain/` (which **is** imported by `FeedbackForm.jsx`, `StudentDashboard.jsx`,
`MockTestUseCase.js`) is the one that actually runs. Two competing domain layers, and the
wrong one is the bigger one.

**Fix:** delete `src/core/` (or move to `attic/`). Vite already tree-shakes it out of the
bundle, so this is a *clarity* win, not a size win. 10 min.

### 🆕 N2 — 605 MB of orphaned build output in `.tmp/`
| Path | Size |
|---|---:|
| `.tmp/dist-broken-20260909` | 172 MB |
| `.tmp/dist-es2022-20260909` | 172 MB |
| `.tmp/dist-prev-20260909` | 172 MB |
| `.tmp/dist-before-dedupe-20260909` | 89 MB |
| **Total** | **605 MB** |

These are leftovers from the sandbox's bulk-delete guard blocking Vite's `emptyOutDir`.
They are not referenced by anything. Deleting them is safe — they are regenerable build output.
**This is the single largest chunk of disk the project is wasting.** 1 min, manual (a delete
guard blocks removal from here).

### ✅ N3 — RETRACTED: no unprefixed `backdrop-filter` remains
My first grep counted *lines*, and a `-webkit-` line looks unprefixed when you only match
the bare property. Re-checked the two candidates properly:
- `components.css:1186-1187` → `-webkit-backdrop-filter` **then** `backdrop-filter` ✅
- `redesign.css:810-811` → `backdrop-filter` **then** `-webkit-backdrop-filter` ✅

All 6 hand-written declarations have a prefixed sibling (`landing-prototype.jsx:290` is
`backdrop-filter: none`, harmless). **Nothing to fix.** The audit's P0 item #7 is complete.

### ✅ N4 — RESOLVED: the 35 deleted `public/audio/` files are unreferenced
`git status --short public/` shows 35 `D` entries (`script-q13-q19*/`, `script-q13-q19-nano/`
— wavs + `manifest.json`), predating today's work. `grep -rn "script-q13" src/` → **0 hits.**
Nothing in the app points at them, so the deletions are harmless and the exercises cannot
404. No action needed; optionally commit the deletion to clear the noise.

### 🟡 N5 — Largest bundle chunk is GrapesJS (1,096.5 kB JS + 37.8 kB CSS)
`dist/assets/vendor-grapesjs-pumq3gdR.js`. **Not a blocker:** `App.jsx:58` lazy-loads
`visual-editor.jsx`, and `dist/app.html` does **not** modulepreload it — so it only downloads
on that one route. Flagging it so it doesn't get "discovered" later as an emergency.
If the Visual Editor is admin-only, consider gating the route behind the role check too.

---

## 4. Measured state — the numbers that matter

| Metric | Measured now | Target | Gap |
|---|---:|---:|---|
| `dist/` total | **71 MB** (was 129) | < 25 MB | −46 MB |
| → `.wav` in dist | **0** (was 40.2 MB / 30 files) | 0 | ✅ |
| → `Practice Studio audios/` dupe | **0** (was 28.3 MB / 75 files) | 0 | ✅ |
| → remaining: MP3 + images | 71 MB | | re-encode next |
| `.tmp/` orphans | 605 MB | 0 | manual delete |
| Largest CSS | 295.1 kB (`dist/assets/index-*.css`) | < 100 kB | still render-blocking |
| `console.log` in src | 44 (all in dead `src/core/`) | 0 | delete `src/core/` |
| XSS sinks (`dangerouslySetInnerHTML`) | **0** | 0 | ✅ |
| Non-`VITE_` env refs in client | **0** | 0 | ✅ |
| Index-as-key usages | 135 | ~0 | open |
| ESLint warnings | **0** | 0 | ✅ |
| CSP `report-to` | **absent** | present | highest-value gap |
| `axe-core` | **not installed** | in CI | a11y gate missing |
| Playwright matrix | **Chromium + Firefox + WebKit** | — | ✅ already done |

---

## 5. Do these, in order

1. ~~**`npm run build`**~~ → **DONE** (129 MB → 71 MB, via the prune script directly).
2. **Delete `.tmp/dist-*`** — reclaim **605 MB**. ~1 min, **manual** (delete guard blocks it here).
3. **Add CSP `report-to`** — the mechanism that would have auto-caught C1 and C2. Needs a small
   `api/csp-report.js` logging into the existing `api/_ml/log.js`. ~30 min. **Highest value left.**
4. **Delete `src/core/`** — 99 dead files, 4,297 LOC, all 44 `console.log`. ~10 min.
   *Needs your OK — it's a delete, and I won't do it unprompted.*
5. ~~Prefix the last 2 `backdrop-filter`~~ → **NOTHING TO DO** (already prefixed, see N3).
6. ~~Check the 35 deleted `public/audio/` files~~ → **SAFE** (0 references, see N4).
7. **Re-encode the ~62 MB of MP3s to 96k mono** — next big weight win, dist → under 60 MB. ~1 h.
8. **Install `axe-core` and gate CI on it** — the a11y net that would catch C5/M19/M20. ~1 h.

---

## 5b. What the audit never checked (found by this pass)

The audit was **static analysis only**. It never executed anything. Running the actual
tooling surfaced things no grep can find.

### 🔴 G1 — The test suite had never been run. It was failing.
`node --test "tests/**/*.test.js"` → **247/248 pass, 1 fail.**
- `practice-studio-listening.test.js:49` → `unexpected group file /exercises/audio/listening/conversation_01.mp3`
- **Cause:** today's WAV→MP3 migration rewrote 124 references in `src/data/**` and
  `src/lib/vocab-homework-bank.js`, but **not** this test. Lines 44 and 46 still asserted
  `/^conversation_\d+\.wav$/` and `/^met_audio_\d+_.+\.wav$/`.
- **Not a real defect** — the data is correct (63 groups, confirmed). It was a **false alarm
  waiting to happen**, and it was the only thing standing between you and a red suite.
- **Fixed:** both regexes now accept `\.(wav|mp3)`. **Re-run: 248/248 pass.**
- `npx vitest run` → **25/25 pass.** Total **273/273 green.**

> This is the finding that matters most: "build green, lint clean" was being reported while
> the suite was red. Add `npm test` to whatever you run before shipping.

### 🔴 G2 — Zero Core Web Vitals data. Every perf claim is theoretical.
No Lighthouse run, no LCP/CLS/INP measurement, on any device or throttle. The audit's
"Performance: D" grade is inferred from bundle size alone. You cannot tell whether the
295 kB CSS or the 40 MB of audio actually hurts a real Brazilian 3G session — you're guessing.
**~20 min to measure; it re-prioritises the whole P1 list.**

### 🟡 G3 — No `Cache-Control` policy anywhere in `vercel.json`
The headers block sets CSP/HSTS for `/(.*)` and Content-Type for two `.well-known` files —
**and nothing else.** No `Cache-Control: public, max-age=31536000, immutable` for
`/assets/*`, no `no-store` for `app.html`. You're inheriting Vercel defaults and hoping.
~10 min.

### 🟡 G4 — Effect / listener cleanup was never audited
| Signal | Count |
|---|---:|
| `useEffect(` | 148 |
| `return () =>` cleanups | 51 |
| `addEventListener(` | 34 |
| `removeEventListener(` | 29 |

~97 effects return nothing and 5 listeners are added without a matching remove. Most are
probably harmless, but on a platform where students sit on one page for a 2-hour mock test,
this is exactly how you get a slow leak that shows up as "the app gets laggy after a while".

### 🟡 G5 — Heading hierarchy not checked: **40 `<h1>` in `src/`**
Landmarks are healthy (`<main>` 10, `<nav>` 16, `<header>` 21, `<footer>` 6), but 40 `h1`s
across 48 pages suggests either multiple-h1 pages or an inconsistent page-title pattern.

### 🟡 G6 — `autocomplete` on only 11 inputs (WCAG 1.3.5)
Identify Input Purpose is largely unaddressed — relevant for sign-in, profile, and payment forms.

### 🟡 G7 — No cookie/consent mechanism (LGPD)
All 23 `consent|lgpd` hits in `src/` are **exercise content about bioethics**, not app
functionality. Your users are Brazilian. If you set any non-essential cookie or run analytics,
LGPD requires a banner. Confirm whether you actually set cookies — if you don't, this is a
non-issue and worth writing down so it isn't re-litigated.

### ✅ Cleared — checked and fine
- `npm audit --omit=dev` → **0 vulnerabilities**
- Error boundaries: **3 present** (`App.jsx`, `components/error-boundary.jsx`, `lib/utils.js`)
- `robots.txt` + `sitemap.xml` present; `<html lang="en">` correct
- Images: 15 `<img>`, **15 with `alt`**, 12 lazy — better than most
- `font-display` declared in 5 places; `focus-visible` styled in 47 places

---

## 6. What the audit got right

Re-confirmed independently, no drift:
- **Zero XSS sinks** and **zero secret leakage** to the client — genuinely excellent for a
  codebase this size.
- Route-level code splitting is real (`lazyWithRetry` throughout), and heavy vendor chunks
  (recharts 489 kB, grapesjs 1,096 kB) are correctly isolated and not preloaded.
- The accessibility baseline (skip links, roving tabindex, reduced-motion in 26 places) is
  present, and the `Pill` fix is correctly implemented — not just patched, but made
  conditional so decorative status pills no longer pollute the tab order.
- `target: 'es2019'` is the right call, and the comment block explaining *why* `es2022`
  would not have worked is exactly the kind of note that saves an hour later.

---

## Verification commands used

```bash
# Weight
du -sh dist .tmp
find dist -name "*.wav" -printf "%s\n" | awk '{s+=$1} END {printf "%.1f MB / %d files\n", s/1048576, NR}'

# Hygiene
grep -rn "dangerouslySetInnerHTML" src/ | wc -l                      # 0
grep -rnE "import\.meta\.env\.[A-Z0-9_]+" src/ | grep -v VITE_ | wc -l # 0
grep -rn "console\.log" src/ | wc -l                                 # 44
grep -rc "console\.log" src/ | grep -v ":0"                          # all in src/core/

# Dead code
grep -rn "core/" src/ --include=*.jsx --include=*.js | grep -v "^src/core/" | wc -l  # 0

# Gates
npx eslint src/ api/ --max-warnings 0 --format compact               # clean
```
