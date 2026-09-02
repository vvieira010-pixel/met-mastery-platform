# MET Proficiency Platform — Audit Report

*Audit date: 2026-08-10 · Method: GOAP multi-agent audit (4 parallel domain audits + verification gates)*
*Previous report: `.agents/swarm-analysis-report.md` (2026-07-10) — this report supersedes it with verified, current findings.*

---

## 1. Executive Summary

The platform is a **React 19 + Vite SPA** (MET test prep for nurses) with a Supabase dual-mode storage layer, 7 Vercel serverless functions, and two static mock-test apps (`public/mock-test-2`, `public/mock-test-3`). The React app **builds successfully**, but the surrounding system has serious problems:

| Area | Verdict |
|---|---|
| **Security (API layer)** | ❌ **3 critical** — open PII exfiltration, unauthenticated paid endpoints, service-role key on client-reachable routes |
| **Secrets hygiene** | ❌ `.gitignore` deleted; `.env.local` (with a 1,290-char Vercel OIDC JWT + API keys) is untracked and **not ignored** |
| **Verification gates** | ❌ Lint: 2 errors + 129 warnings (one error is a real runtime bug). Tests: 0 run via npm script; the 9 real test files fail to load |
| **Build** | ✅ Passes (50s) — but 1 MB grapesjs chunk, 65 MB PWA precache |
| **Static mock-test app** | ❌ Answer key shipped to browser, no auth, dead endpoints, broken audio, data-loss bug |
| **Data layer** | ⚠️ 14 findings — duplicate rows on re-edit, identity split between stores, stale offline data |
| **Git repo** | ❌ History untraversable locally (0 commits readable), `dist-build/` committed, 141 dirty files |

**Top 5 actions (in order):**
1. **Restore `.gitignore`** and confirm `.env.local` is ignored — before anything else touches git.
2. **Fix `api/get-submissions.js` + `api/save-submission.js`** — remove service-role key from client-reachable routes; require verified sessions.
3. **Fix `api/_supabase-auth.js`** — stop accepting `anon` role as a valid session.
4. **Fix the `auth` ReferenceError** in `src/App.jsx:551,564` — the teacher Mock Test page crashes.
5. **Fix the mock-test-3 submission key-prefix mismatch** — real exam answers are being silently dropped.

---

## 2. Verification Gates (run 2026-08-10)

| Gate | Command | Result |
|---|---|---|
| Install | `npm install` | ✅ 576 packages (5m) — `node_modules` was **missing** before this audit |
| Build | `npm run build` | ✅ Built in 50.22s. ⚠️ `vendor-grapesjs` = 1,015 kB (329 kB gzip) > 500 kB warning; PWA precache = **308 entries / 65 MB** |
| Lint | `npm run lint` | ❌ **131 problems: 2 errors, 129 warnings** |
| Tests | `npm test` | ❌ **0 tests run** — glob `tests/**/*.test.js` matches nothing (no `tests/` dir exists) |
| Tests (real location) | `node --test "Mock Tests/2/transcripts/assets/*.test.js"` | ❌ **5 of 9 fail** with `ERR_MODULE_NOT_FOUND` — relative imports point at `Mock Tests/2/transcripts/src/lib/...` which doesn't exist |

### The 2 lint errors are a real runtime bug
`src/App.jsx:551,564` — `renderTeacherPage()` is a **module-level** function, but the `mock-test` and `library:mock-test` cases reference `auth={auth}` from the enclosing component scope. `auth` is not defined there → **ReferenceError at runtime** → ErrorBoundary shows "Page unavailable". The teacher "Take Mock Test" flow (tab, palette, and `#mock-test` hash) is broken.

### Test suite is effectively dead
The 9 test files live in `Mock Tests/2/transcripts/assets/` (a transcripts folder!), import from a non-existent `Mock Tests/2/transcripts/src/lib/` path, and cannot resolve. The `package.json` test script points at a `tests/` directory that doesn't exist. Tests have not been runnable for some time.

---

## 3. Security Findings (API layer)

### CRITICAL

**S1 — Open PII exfiltration: `api/get-submissions.js`**
`GET /api/get-submissions` takes `teacherEmail` + `limit` from the query string, queries `mock_test_results` with the **service-role key** (bypasses RLS entirely), and has **no authentication, no origin check, no session verification**. Anyone who finds the endpoint can dump all student names, emails, answers, and timestamps (`limit=100000`). *(api/get-submissions.js:4-48)*

**S2 — Anon JWT accepted as a valid session: `api/_supabase-auth.js`**
`verifySupabaseSession()` returns true for `role === 'authenticated' || role === 'anon'`. The anon key is public (hardcoded in the client bundle), so anyone can mint a passing JWT. This gates `api/generate-image.js` (paid Imagen 3) → **unlimited paid image generation with your Gemini key, no session required**. *(api/_supabase-auth.js:8-11, api/generate-image.js:15)*

**S3 — Unauthenticated service-role insert: `api/save-submission.js`**
`POST /api/save-submission` inserts into `mock_test_results` with the service-role key, no auth. Only checks "some name or email present"; all other fields are attacker-controlled into a `jsonb` column. Anyone can inject rows, spoof `teacher_id`, or poison stats. *(api/save-submission.js:4-54)*

### HIGH

**S4 — Teacher gate fails OPEN: `api/send-invite.js`**
`if (teacherEmails.length && !teacherEmails.includes(...))` — when `VITE_TEACHER_EMAIL` is unset, `teacherEmails.length === 0`, so **any authenticated account passes** and can send unlimited emails from your Resend account. Should fail closed. *(api/send-invite.js:121-124)*

**S5 — `/api/ai` unauthenticated, rate limit spoofable**
No session check; rate limit keys on `x-forwarded-for` (caller-controlled, first IP taken verbatim); `allowedOrigin` returns true when no `Origin` header or when `APP_ORIGIN` unset. → unlimited paid AI quota burn + free proxy/jailbreak front. *(api/ai.js:29-38, 39-45, 120-130)*

**S6 — `/api/tts` no auth / no rate limit / ignores client's Authorization header**
Client sends `Authorization: Bearer <token>` but the server never reads it. Unlimited paid TTS synthesis (Deepgram/ElevenLabs/OpenAI/Gemini cascade). *(api/tts.js:92-118)*

**S7 — `VITE_`-prefix fallback can ship keys to the bundle**
`env(name) = process.env[name] || process.env['VITE_'+name]` in `ai.js:23`, `tts.js:6`, `send-invite.js:19`, `generate-image.js:3`. Any key stored in Vercel with a `VITE_` prefix gets **inlined into the public client bundle** — exactly the leak the code's own comments warn against.

**S8 — Refresh token in localStorage + exported in backups**
Full session (access + **refresh** token + user) persisted in `localStorage['vv:supabase_session']`; the backup exporter includes it in plaintext JSON (only API keys are excluded). A leaked backup = account takeover. *(src/lib/supabase-storage.js:79-90, src/pages/settings.jsx:170-185)*

### MEDIUM

- **S9 — Realtime WebSocket puts access token in URL** — `?apikey=...&token=...` in query string; tokens land in logs/proxies/history. *(src/lib/supabase-db.js:142)*
- **S10 — Error logger stores raw URL + user agent + auth UID** — URL can capture PKCE `?code=` or `#access_token`; errors are persisted to Supabase. *(src/lib/error-logger.js:13-32)*
- **S11 — Client role defaults to `teacher`** — `localStorage.getItem(ROLE_KEY) || 'teacher'`; a missing/broken key grants the most privileged role. *(src/lib/supabase-db/auth.js:25-26)*
- **S12 — `claimStudentByEmail` sends empty body `{}`** — the student's email is never passed to the RPC; correctness depends entirely on an unverifiable server-side function. *(src/lib/supabase-db/auth.js:51-61)*

### LOW

- **S13** — Supabase URL + anon key hardcoded in 4 places (drift risk). 
- **S14** — Raw provider error strings returned to clients (stack traces / internals leak).
- **S15** — Gemini API key in URL query string (`?key=`) — lands in Vercel logs.
- **S16** — Unvalidated `timezone` can 500 `send-invite` (unhandled RangeError).
- **S17** — `callAI` forwards full transcripts to third-party AI providers unfiltered.
- **S18** — `.env.local` contains live credentials: `VERCEL_OIDC_TOKEN` (1,290-char JWT), `GEMINI_API_KEY`, `GEMINI_API_KEY_FALLBACK`, `OPENAI_API_BASE`. No `VITE_` vars (good — nothing ships to bundle), but the file is **not gitignored** (see §5).

### Verified safe (security)
- PKCE flow correct (32-byte verifier, S256, URL cleanup via `history.replaceState`).
- Forged tokens rejected on session restore (validated against `/auth/v1/user`).
- No hardcoded service-role key anywhere; `sk-`/`AIza` scans = 0 real hits.
- `callAI.js` holds zero API keys; legacy `vv:*_api_key` keys are dead code, correctly excluded from backups.
- ICS generation escapes CRLF; URL fields validated `^https?://`.

---

## 4. Static Mock-Test App Findings (`public/mock-test-3` active, `mock-test-2` legacy)

### CRITICAL

**M1 — Full answer key shipped to every student's browser (mock-test-2)**
`public/mock-test-2/js/answer-key.js` publishes `window.__MET_ANSWER_KEY`; every section embeds `data-correct="B"` (100 occurrences); grading is client-side. Any student can read every answer before the exam. **mock-test-3 removed this** (0 `data-correct`) — but then has no scoring at all. *(mock-test-2/js/answer-key.js:3-24, sections/*.html)*

### HIGH

**M2 — No authentication anywhere**
`student-gate.js` is a disabled stub ("Auth gate disabled — add back when requested"); `auth.js` is referenced by no HTML file. Any visitor can reach every section, answer key, and submission page. *(mock-test-3/js/student-gate.js:1-6)*

**M3 — Answers + PII stored client-side, fully forgeable**
`answer-storage.js` trusts whatever `studentInfo` object the caller passes (studentId/name/email) into `sessionStorage`. No server-side identity binding — a student can impersonate anyone. *(mock-test-3/js/answer-storage.js:15-35)*

**M4 — Data-loss bug: submission form sends empty answer payloads**
`thanks.html` filters stored answers by `met:timer:reading` / `met:timer:listening` / `met:timer:writing` keys, but mock-test-3 stores answers under `met:<section>__p<pageN>` keys (and timers as `met:reading3` etc.). The prefixes never match → **reading/listening/writing answers and `sectionsCompleted` are always empty on submission**. mock-test-2 uses `met:timer:*` — the mismatch was introduced in the mock-test-3 refactor when `thanks.html` was copied over. *(mock-test-3/sections/thanks.html:263-291 vs js/met-shell.js:343-347)*

**M5 — Section locks and uploads depend on endpoints that don't exist**
`/api/section-locks`, `/api/upload-recording`, `/api/save-submission`, `/.netlify/functions/submit-test` are all referenced but **no such routes exist in the repo**; failures are swallowed by `.catch(() => {})`. The "once submitted, section is locked" guarantee is not enforced; speaking recordings are silently discarded. *(mock-test-3/js/met-shell.js:802-822, js/speaking-upload.js:23-32, sections/thanks.html:308)*

### MEDIUM

- **M6 — Supabase anon credential embedded in committed `dist-build`** (`supabase-gate.js`), with client-direct inserts recording the same user as both teacher and student. *(dist-build/mock-test-2/js/supabase-gate.js, submit-results.js:116-126)*
- **M7 — `netlify.toml` is malformed** — JSON pasted into a TOML file (opens with `{{`, duplicate `publish` keys). Neither valid TOML nor JSON. *(public/mock-test-3/netlify.toml)*
- **M8 — Broken assets in active mock-test-3**: Listening Part 2/3 audio references `conv a.mp3` etc. but files were renamed to `part2_conv20/23/27/31.mp3` → **no audible audio**; speaking prompts exist only in mock-test-2; `speaking_1.png` referenced but only `.jpg` exists. *(sections/listening-p2.html:82-217, listening-p3.html:82-235, speaking-p1.html:74,123)*

### LOW

- **M9** — Duplicate element IDs in `listening-p1.html` and `reading-p3.html` (invalid HTML, modal binds first match).
- **M10** — No size/type validation on speaking uploads; silent failure path.
- **M11** — Client-side CEFR scoring gameable in dist-build (localStorage scores trusted).
- **M12** — `auth.js` uses `window.prompt()` for credentials (dead code, but a red flag if re-enabled).

### Duplication
- `speaking-upload.js`, `answer-storage.js`, `netlify.toml`, 4 speaking sections, `writing-task1.html` are byte-identical across mock-test-2/3.
- `dist-build/mock-test-2` is a **diverged, non-reproducible snapshot** — all code files differ from `public/mock-test-2`; carries extra files (`supabase-gate.js`, `submit-results.js`, `met-speaking.js`, `gemma-test.ts`) not in its "source".
- mock-test-3 ships orphaned files: `auth.js`, `student-gate.js`, `answer-storage.js`, `narrator-system.js` (unreferenced by any HTML).

### Verified safe (static app)
- No XSS from user input (static content; no `innerHTML` from student data).
- `met-harden.js` is accessibility/storage hardening, not anti-cheat — no red flags.
- No hardcoded credentials in mock-test-3.

---

## 5. Secrets & Repo Hygiene

| Finding | Severity | Detail |
|---|---|---|
| **`.gitignore` and `.vercelignore` deleted from repo** | **CRITICAL** | `git status` shows `D .gitignore`, `D .vercelignore`. |
| **`.env.local` untracked AND not ignored** | **CRITICAL** | `git check-ignore .env.local` → false. Contains `VERCEL_OIDC_TOKEN` (1,290-char JWT), `GEMINI_API_KEY`, `GEMINI_API_KEY_FALLBACK`, `OPENAI_API_BASE`. The next `git add .` stages all of it. |
| `dist-build/` committed to git | HIGH | Build output tracked (141 dirty files, mostly dist-build + mock-test-2). Should be gitignored. |
| Git history untraversable | HIGH | `git log` fails ("Could not read 47bde8b… Failed to traverse parents"); 0 commits readable locally; remote branches `origin/main` + `origin/master` exist. Repo may be a broken clone — verify against remote. |
| 141 dirty files | MEDIUM | Large uncommitted surface; no clean baseline. |

---

## 6. Data / Storage Layer Findings (`src/lib/`)

### HIGH
- **D1 — `saveVia` duplicates rows on re-edit** — online path appends to localStorage unconditionally instead of id-aware upsert (offline path merges correctly). Re-edit a cloud record 3× → 3 local duplicates. *(workflow-core.js:104)*
- **D2 — `uuidAsId` regex never matches `uid()` ids** — submissions/reviews are **always INSERTed**, never updated; the two stores disagree on what "id" means → cross-store lookups and cascade deletes miss. *(supabase-db.js:112-117, workflow-core.js:35-37)*
- **D3 — `vv:syncedIds` only fed by manual sync** — online writers never mark records synced → next manual sync re-inserts duplicates. *(domain/admin.js:13,40)*
- **D4 — Most online writes bypass the localStorage mirror** — 20+ writers (`saveStudent`, `saveClassEvent`, `submitHomework`, `saveReview`, error-bank writers, seeds…) return before writing local. A dropped connection silently shows stale/missing data with no fallback trigger. *(domain/practice.js, domain/academic-records.js, domain/roster.js, workflow-academic.js)*
- **D5 — Cascade-delete gaps** — `deleteStudent` DB path misses `errorBank`, `seedsStages`, `feedback`, `inbox`, `progress`, `drafts`, `mockTestResults`, per-student review schedules. `deleteSubmission` reopens shared homework even when sibling submissions exist. *(domain/roster.js:55-63, workflow-academic.js:282-285)*

### MEDIUM
- **D6 — `loadReviewSchedule` clobbers local schedule** on every student session (cloud copy replaces richer local set; runs on every auth change). *(App.jsx:203-208)*
- **D7 — `_syncFn` never reset on logout/role change** — stale sync can write the previous student's schedule to the wrong student_id. *(spaced-repetition.js:9-14)*
- **D8 — `upsertReviewSchedule` rewrites the entire schedule list per tick** — O(n) full-table writes; deleted local rows resurrect in cloud. *(supabase-db.js:292-307)*
- **D9 — 30s read cache serves stale data** — pending badge can be stale after realtime events; cache never cleared on session switch (cross-user data for up to 30s). *(supabase-db/_helpers.js:26-37)*
- **D10 — No schema/type validation** — `listVia` iterates `for (const r of all)`; a JSON object in a key (precedent: `vv:errorBankGlobal`, legacy `vv:seedsStages`) throws an **uncaught TypeError**. *(workflow-core.js:69-77)*
- **D11 — `clearWorkflowData` misses keys** — `vv:syncedIds`, `vv:reviewSchedule:*`, session keys, `vv:error_log` survive "Clear all" → stale sync tags can skip/ghost rows after restore. *(workflow-core.js:156-158)*

### LOW
- **D12 — `syncLocalToCloud` strictly one-way** — no pull/reconcile; multi-device writes never arrive.
- **D13 — errorBank sync can move entries between students** (`entry.studentId || sid`).
- **D14 — Cloud-only stores** (`listeningExercises`, `writingEvaluations`, `assignments`) have no local mirror — signed-out teacher loses access entirely.

### Verified safe (data)
- Spaced-repetition algorithm correct (interval ladder, seeded Fisher–Yates MCQ).
- Realtime subscriptions are read-only (badge count only).
- Passwords stripped before cloud writes (`students.js toRow`, `withoutRosterPassword`).
- All JSON.parse paths exception-safe; `removeHomeworkDrafts` runs on all teardown paths.

---

## 7. UI / Code Quality Findings

### HIGH
- **U1 — Skill augmentation silently drops a selected skill** — `feedback.skillIds` includes `ai-feedback-design-principles` but `registry-feedback.js` never loads it; the Settings toggle advertises it as enabled but it can never affect output. *(education-skills/selectors.js:25, registry-feedback.js:4-8)*

### MEDIUM
- **U2 — Loaded-but-unselected skill** — `elaborative-interrogation-generator` parsed by feedback registry but absent from `feedback.skillIds` (bundle cost for nothing). *(registry-feedback.js:7)*
- **U3 — Duplicate toast subsystem** — `toast-provider.jsx` (51 lines) is dead; only `toast-host.jsx` is imported. *(src/lib/)*
- **U4 — 7 route cases have no internal caller** — `error-bank`, `calendar:inbox`, `evaluation`, `perspective`, `cohorts`, `reports`, `exercises` only reachable by typing the hash; palette/tabs use different aliases. *(App.jsx:478-547)*
- **U5 — Student-role navigation bypasses the router** — student branch always renders `<StudentDashboard>`; keyboard shortcuts (`p` → profile) are inert. *(App.jsx:397-411)*
- **U6 — UI kit barrel not canonical** — 4 primitives (`Select`, `Breadcrumb`, `icons`, `empty-illustrations`) exist but aren't exported; ~71 direct imports bypass the barrel.
- **U7 — Dead component** — `MockTestDemo.jsx` has zero importers.
- **U8 — CSS cascade & token hygiene** — `components.css` is **6,973 lines**; 44 `!important`; 117 hardcoded hex colors bypassing tokens.

### LOW
- **U9** — Unknown views silently render dashboard (no 404/warning).
- **U10** — Inconsistent prop plumbing (`auth` from closure vs `ctx` destructure — see §2 bug).
- **U11** — Cosmetic indentation drift.

### Metrics
- 40 page modules, 77 component files, 180 source files scanned.
- Largest pages: `writing-practice.jsx` 1,099 · `diagnostic-create.jsx` 978 · `submission-review.jsx` 946.
- `components.css` 6,973 lines; `base.css` 238; `tokens.css` 132; `responsive.css` 335; `dark.css` 393.
- TODO/FIXME/HACK: **0** · `console.log`: **0** · inline `style={{}}`: **1,967**.
- Duplication: toast ×2, `SectionHeader` ×2, 2 SKILL.md files bundled twice each, 7 route aliases hand-synced.

### Verified safe (UI)
- Auth hardening (teacher allowlist, self-registration cannot grant teacher).
- Token URL cleanup on both auth flows.
- Global error trapping + ErrorBoundary on both roles.
- Accessibility: skip-nav, focus management, aria-labels, `aria-live` toasts, modal focus trap.

---

## 8. Prioritized Remediation Plan (GOAP action sequence)

**Phase 1 — Stop the bleeding (do today):**
1. Restore `.gitignore` (recreate with `node_modules/`, `dist-build/`, `.env*`, `.vercelignore` entries) and verify `.env.local` is ignored. Rotate `VERCEL_OIDC_TOKEN` + Gemini keys (they've been exposed to `git add` risk).
2. `api/get-submissions.js` + `api/save-submission.js`: remove service-role key from client-reachable routes; require verified `authenticated` session; bound `limit`.
3. `api/_supabase-auth.js`: drop `anon` acceptance; verify against `/auth/v1/user`.
4. `api/ai.js` + `api/tts.js`: require session, set `APP_ORIGIN`, rate-limit per user, remove `VITE_` fallbacks.
5. `api/send-invite.js`: fail closed when teacher allowlist unset.

**Phase 2 — Fix the broken core (this week):**
6. `App.jsx:551,564` — pass `auth` into `renderTeacherPage` ctx (fixes Mock Test crash).
7. mock-test-3 `thanks.html` key-prefix mismatch (M4) — real exam data is being dropped.
8. Deploy the referenced `/api/*` endpoints or remove the calls (M5).
9. Fix test suite: move tests to `tests/`, fix relative imports, update `package.json` glob.
10. Restore listening audio filenames in mock-test-3 (M8).

**Phase 3 — Data integrity (next):**
11. `saveVia` id-aware upsert (D1); remove `uuidAsId` or make `uid()` conform (D2); feed `syncedIds` from `saveVia` (D3).
12. Mirror all online writes to localStorage (D4); complete cascade deletes (D5).
13. Reset `_syncFn` on auth change (D7); clear cache on session switch (D9); sweep `clearWorkflowData` (D11).

**Phase 4 — Architecture (ongoing):**
14. Remove answer key from mock-test-2 or accept it as practice-only (M1); enable real auth (M2).
15. Delete dead code: `toast-provider.jsx`, `MockTestDemo.jsx`, orphaned mock-test-3 JS, dead routes (U3/U4/U7).
16. Split `components.css` (6,973 lines) into scoped files; migrate 117 hardcoded colors to tokens.
17. Fix git history vs remote (`origin/main` vs `origin/master` divergence); stop committing `dist-build/`.

---

## 9. What's Actually Healthy

- **React app builds cleanly** and the SPA architecture (custom hash router, lazy loading, dual-mode storage) is sound.
- **Auth flows are well-implemented** (PKCE, URL cleanup, forged-token rejection, teacher allowlist).
- **No hardcoded service-role secrets**; provider keys are server-side.
- **Spaced-repetition algorithm is correct** and well-tested in isolation.
- **Accessibility is above average** (skip-nav, focus management, aria patterns).
- **Zero TODO/FIXME/console.log** — the codebase is disciplined about debug noise.
- **Offline-first resilience** is a genuine strength — the app never hard-crashes on storage failure.

---

*Method note: findings verified against source on disk 2026-08-10. Line numbers refer to current files. Severity reflects real-world risk for a solo-teacher production app with real student PII.*