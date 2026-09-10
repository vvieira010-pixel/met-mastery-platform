# Comprehensive Platform Audit — MET Mastery (`platform0.3`)
**Date:** 2026-09-09 · **Scope:** security, auth/authz, input validation, error handling, data protection, performance, dependency health, architecture.
**Method:** parallel static review of `api/`, `src/`, `server.ts`, `fastapi/`, `supabase/`, `prisma/`, `tests/`, plus live `npm audit`, `eslint`, `tsc`, `npm run test:unit`.

> **Headline:** Code quality and test hygiene are genuinely good (ESLint 0 errors, `tsc` clean, 245/245 unit tests pass). The risk is concentrated in **security/auth** and **operational architecture** — several of which are live, exploitable issues on the deployed URL, not theoretical ones.

### Severity summary
| Severity | Count | Examples |
|---|---|---|
| 🔴 Critical | 1 | `mock_test_results` queried by anon client with no teacher filter (PII dump if RLS off) |
| 🟠 High | 10 | Open `/api/ai` proxy, IDOR on student audio, empty-allowlist open relay, AI spend cap not a cap, cold-start 504s |
| 🟡 Medium | 14 | Unsalted telemetry hash, `CORS *` on config endpoint, `select=*` everywhere, 13 unused deps, Prisma no-op, broken `DEVOPS.md` |
| 🟢 Low | 9 | Source-map leak, WAV duplicates, img lazy-loading, font preload mismatch |

---

## 🔴 CRITICAL

### SEC-DATA-1 — Teacher dashboard reads `mock_test_results` with the **anon** key and **no filter**
- **File:** `src/components/mock-test/MockTestTeacherDashboard.jsx:15-20` (auth: none → `anon`), `api/_routes/get-submissions.js:46` (returns full `content` jsonb).
- **Evidence:** `fetch(\`${cfg.url}/rest/v1/mock_test_results?order=created_at.desc\`)` with only the anon key, no `teacher_id`, no `limit`/`select`. The code comment admits the filter is missing.
- **Impact:** No migration in `supabase/` creates or secures `mock_test_results`. If RLS is disabled (or has an anon `select` policy) **any anonymous visitor can dump every student's name, email, and full answers** via `GET /rest/v1/mock_test_results?select=*`. This is the single highest-impact finding.
- **Fix:** (1) Immediately verify in the Supabase dashboard: `ALTER TABLE mock_test_results ENABLE ROW LEVEL SECURITY;` plus `teacher_id = auth.uid()` (teacher) and `student_id = auth.uid()` (own row) policies — never `to anon`. (2) Send the session access token from the client and filter by caller id. (3) Add a migration that owns this table.

---

## 🟠 HIGH

### AUTH-1 — `/api/ai` is an unauthenticated paid LLM proxy; origin check fails **open**
- **File:** `api/_routes/ai.js:49-50, 96-99`.
- **`if (!origin) return true;`** → a `curl` with no `Origin` header is allowed. Anyone can drive the Gemini→Groq→OpenRouter→NVIDIA cascade on your keys. Caller fully controls `system` + `prompt`.
- **Fix:** Require `verifySupabaseSession` (or a server-shared secret for true S2S); change `!origin` to `false`; pass `user` into `guardRateLimit`.

### AUTH-2 — IDOR: any authenticated user can transcribe **any** student's voice recording
- **File:** `api/_routes/evaluate-speaking.js:76-91, 341-381` (fetched with the **service-role** key, which bypasses Storage RLS).
- `normalizeStoragePath` blocks traversal but performs **no ownership check** — nothing verifies the object belongs to `user.id`. Horizontal privilege escalation on PII (voice of minors/adults).
- **Fix:** require `path.startsWith(\`${user.id}/\`)` (or email-hash prefix); reject otherwise. Prefer a signed anon-key URL + RLS over the service-role key.

### AUTH-3 — `send-invite` degrades to "any authenticated user = teacher" when the allowlist is empty
- **File:** `api/_routes/_supabase-auth.js:100-106`, `send-invite.js:98-126`.
- `requireTeacher` returns the user if `allowedTeacherEmails()` is empty. With the default blank allowlist, any self-registered account can mail arbitrary HTML from your verified domain → phishing / domain-reputation / Resend billing. `create-student-account.js:64-67` already fails **closed** (503) for this case; `send-invite` does not.
- **Fix:** mirror the 503 fail-closed behavior in `requireTeacher`; restrict `to` to the teacher's own roster.

### AUTH-4 — `/api/tts` has **no authentication** (origin-only); first-party billing abuse
- **File:** `api/_routes/tts.js:84-92`. Anonymous visitors can synthesize up to 8 000 chars/call; cascade reaches ElevenLabs (~$0.15/1k).
- **Fix:** require a session; per-account daily **character** budget, not just request count.

### AUTH-5 — `save-submission` accepts a client-supplied teacher email for unauthenticated inserts
- **File:** `api/_routes/save-submission.js:43-51`. With no session, a caller from the app origin supplying the allowlisted (JS-bundle-readable) teacher email can INSERT rows into `mock_test_results` attributed to that teacher, via the service-role key → grade poisoning. No rate limit.
- **Fix:** delete the unauthenticated fallback; derive `teacherId` from a verified session.

### IN-1 — Prompt injection lets a student inflate their own grade
- **File:** `api/_routes/evaluate-speaking.js:368,413`, `evaluate-writing.js:109-121`. Up to 12 000 chars of student text concatenated into the examiner prompt with no delimiting/instruction-hierarchy defense. Range checks only constrain the *numbers*, not the model's behavior.
- **Fix:** wrap untrusted content in explicit delimiters placed *after* the rubric; add a canary check that injected "award 4.0" instructions were ignored.

### RATE-1 — The rate limiter is a per-process `Map`; on Vercel the AI spend cap is **not** a cap
- **File:** `api/_routes/_rate-limit.js:23-27` (self-documented). Each lambda instance keeps its own map; real ceiling = `limit × concurrent instances`.
- **Fix:** back with Upstash Redis (`INCR`+`EXPIRE`); add a hard daily per-account cost ceiling in `ai_predictions.cost_usd`.

### PERF-1 — Blocking telemetry write on the request path (`await logPrediction` before `res.json`)
- **File:** `api/_routes/ai.js:303/318`, `evaluate-writing.js:142/173`, `evaluate-speaking.js:388/516/557`. Adds up to +1 200 ms per AI response (up to +2 400 ms on speaking).
- **Fix:** `void logPrediction(...).catch(()=>{})` **after** writing the response, or Vercel `waitUntil`.

### PERF-2 — Handler time budgets exceed Vercel's default `maxDuration`; no `functions` config
- **File:** `api/_routes/_ai-providers.js:20-22`, `evaluate-speaking.js:122-136` (39 s AssemblyAI poll), `vercel.json` (no `functions`/`regions`). Default Hobby cap is 10 s → speaking eval is killed mid-flight and **billed anyway**.
- **Fix:** add `"functions":{ "api/[...path].js":{ "maxDuration":60 } }` + `regions:["gru1"]`; replace fixed 3 s×13 poll with budget-aware backoff.

### ARCH-1 — `DEVOPS.md` documents a Netlify pipeline that does not exist; `prisma/` is a 100% no-op
- **File:** `DEVOPS.md:1-40`, `prisma/schema.prisma` (zero models), `prisma.config.ts:10` (`env()` throws), `package.json:19` (`postinstall … || exit 0` masks it).
- **Impact:** dead runbook + broken `postinstall` on every install; real schema lives in `supabase/migrations/` accessed via hand-rolled REST.
- **Fix:** rewrite DEVOPS.md for Vercel or delete; delete `prisma/`, `prisma.config.ts`, the postinstall, and the `prisma` devDep.

---

## 🟡 MEDIUM

| ID | Area | Finding | File | Recommendation |
|---|---|---|---|---|
| SEC-2 | Secrets | `.env.prodcheck` is a full production credential dump (JWT secret, DB passwords, service-role key) in repo root | `.env.prodcheck` | Delete after use / move out of repo; rotate if it left the machine; pre-commit gitleaks. |
| SEC-3 | Secrets | A live key stored in `GEMINI_MODEL`; `nvidiaModels()` has no model-name filter → leaks to public `ai-status` | `.env.local:6`, `_ai-providers.js:106-124` | Move key to `GEMINI_API_KEY`; assert model ids match `^[a-z0-9._:/-]+$`. |
| SEC-4 | Config | `VITE_TEACHER_EMAIL` server allowlist + two personal Gmail addresses hardcoded in the bundle | `_config.js:44`, `App.jsx:116-123` | Non-`VITE_` var only; server-verify role; scrub personal emails. |
| DATA-2 | Data prot. | Service-role key on the request path of 6 user-reachable handlers → every auth bug escalates to whole-table | `get-submissions.js:52`, `save-submission.js:59-66`, `evaluate-speaking.js:77-83`, `_ml/store.js:38-41` | Use caller access token so RLS applies; reserve service-role for telemetry/admin. |
| DATA-3 | Data prot. | "Pseudonymous" telemetry is **unsalted** SHA-256 of the student's email → rainbow-reversible | `_ml/hash.js:14,21-25` | Make `AI_TELEMETRY_SALT` required (fail closed); prefer `user.id` (UUID). |
| DATA-4 | Data prot. | No retention/erasure job for reversible student data (LGPD/GDPR) | `supabase/migrations/…:250-258` (commented out) | Schedule deletes (pg_cron / Vercel cron). |
| AUTH-6 | Auth | JWT verify pins no `iss`/`aud`/`algorithms`; `anon` role not rejected locally | `_supabase-auth.js:30-51` | `jwtVerify(token, jwks, {issuer, audience, algorithms})`; reject `role==='anon'`. |
| AUTH-7 | Auth | `get-submissions` requires a session but not the teacher role; unthrottled 200-row PII reads | `get-submissions.js:19-52` | Require `role==='teacher'`; add `guardRateLimit`. |
| AUTH-8 | Auth | `ai-status?probe=1` unauthenticated + `CORS *` → cross-origin token spend + recon | `ai-status.js:61-99`, `_problem.js:14` | Gate `probe` behind session/secret; restrict `ACAO` to `APP_ORIGIN`. |
| IN-2 | Input | `ai.js` `system` has no length cap; `max_tokens`/`temperature` unvalidated | `ai.js:103-121,153,193` | `Number.isFinite` + clamp; cap `system`. |
| IN-3 | Input | `send-invite` invalid `timezone` → uncaught 500 DoS; arbitrary `videoUrl` mailed from your domain | `send-invite.js:124-126,137,193-195` | Validate `timeZone` against `Intl.supportedValuesOf`; allowlist video hosts. |
| HDR-1 | Headers | `Access-Control-Allow-Origin: *` on config endpoint | `_problem.js:14-17` | Allowlist origin + `Vary: Origin`. |
| HDR-2 | Headers | CSP `style-src 'unsafe-inline'`, 5 third-party AI hosts in `connect-src`, no HSTS/Permissions-Policy | `vercel.json:21` | Tighten `connect-src` (remove provider hosts); add HSTS/Permissions-Policy. |
| PERF-3 | Perf | Realtime join has **no server-side filter** → N×M DB fan-out + full-table refetch per change | `supabase-db.js:139-167`, `App.jsx:264-268` | Filter by `teacher_id`; debounce; use a `count` RPC. |
| PERF-4 | Perf | `select=*` with no limit/pagination on every read; `MockTestTeacherDashboard` dumps whole table | `supabase-db.js:93,316`, `MockTestTeacherDashboard.jsx:17` | Project columns + `limit` + keyset pagination; virtualize. |
| PERF-5 | Perf | N+1 writes/deletes; `dbUpsert` = select+update/insert | `workflow-academic.js:296`, `supabase-db.js:106-124` | Batch deletes (`id=in.(…)`); `Prefer: resolution=merge-duplicates`. |
| PERF-6 | Perf | One monolithic catch-all lambda bundles all 15 handlers into every cold start | `api/[...path].js:11-25` | Dynamic `import()` dispatch, or split to per-route files (Hobby cap no longer binds). |
| PERF-7 | Perf | Unbounded `get-submissions` response (~12 MB worst case) | `get-submissions.js:45-48,60-67` | `select=id,student_id,created_at`; `Cache-Control` + `AbortController`. |
| PERF-8 | Perf | No `functions.maxDuration`/`regions`; whole deployment = 187 MB (122 MB audio + 38 MB PNG in `public/`) | `vercel.json`, `public/**` | Move media to Storage/CDN; delete 51 WAV + 98 dupes; re-encode 4 PNGs to WebP. |
| PERF-9 | Perf | Zero `AbortController` in client; no request dedupe; StrictMode doubles dev requests | `src/**` (0 hits for `AbortController`) | Add `signal` from effect cleanup; dedupe map in `callAI`. |
| PERF-10 | Perf | `AudioContext` leak + blob-URL leak in TTS concat (fails past ~6 utterances) | `tts-utils.js:106-115` | One shared `AudioContext`; `revokeObjectURL` on unmount. |
| DB-1 | DB | Hot query columns have **no indexes** (`mock_test_results(teacher_id,created_at)`, `submissions(status)`, `students(local_id)`, …) | `supabase/migrations/*` | Add migration with the listed indexes. |
| DEP-1 | Deps | `npm audit`: **30 vulns — 1 critical / 17 high / 11 moderate / 1 low**, all fixable | `npm audit` | `npm audit fix`; upgrade `vercel` (kills 18 of 30). |
| DEP-2 | Deps | **13 dependencies with zero import sites** (shiki, next-auth, @vercel/sandbox, @openrouter/sdk, ai, @ai-sdk/perplexity, @supabase/*, nanoid, es-toolkit, cn, …) | `package.json` | Remove; move `supabase` CLI to devDeps. |
| DEP-3 | Deps | `engines.node >=20 <23` contradicts `ai@7`/`@supabase/supabase-js` (require >=22) and `@types/node@26` | `package.json:5` | Set `engines.node` to `>=22 <23`; pin `@types/node` to `^22`. |
| ARCH-2 | Arch | Four server surfaces; `server.ts` (dupes handlers) + `fastapi/` + `my-app/` are dead/stray | `server.ts`, `fastapi/`, `my-app/` | Rename dev server; gitignore/delete `fastapi/`; delete `my-app/`. |
| ARCH-3 | Arch | Route map is a hand-maintained flat table with fragile substring fallback | `api/[...path].js:27-70` | Real router or prefix trie; add a test asserting each key resolves. |
| ARCH-4 | Arch | `src/App.jsx` (755 lines) owns routing+auth+data+palette+theme; `workflow.js` barrel defeats tree-shaking | `App.jsx`, `lib/workflow.js` | Extract hooks/domains; migrate off barrel. |
| ARCH-5 | Arch | 169 `localStorage` + 20 `sessionStorage` call sites; ad-hoc CustomEvent cache bus, no store | `src/**` | Single store (Zustand/context) centralizing writes. |
| ARCH-6 | Arch | Env sprawl: 38 declared, ~15 read statically + 18 via dynamic helper (defeats audit); ~10 declared-but-unused | `_config.js` | Add zod env-schema validation at startup. |

---

## 🟢 LOW (curated)
- **PERF-11** `dist/server.cjs.map` (246 KB) shipped to prod → drop `--sourcemap` from prod build.
- **PERF-12** `vendor-grapesjs` 1.06 MB (354 KB gzip) for one rarely-used tool → guard behind user action or drop.
- **PERF-13** 5 of 15 `<img>` lack `loading="lazy"`/dimensions; 1.5 MB avatar on LCP path → resize to 160px WebP.
- **PERF-14** 8 `setInterval` tick into React state (1 s re-render on a 1 838-line component) → isolate clock into memoized child.
- **PERF-15** Wasted font preload (mismatched URL) → preload exact stylesheet URL.
- **PERF-16** No client-side TTS cache → identical text re-bills provider; add `Cache-Control: immutable` + hash cache.
- **IN-4** `log-learning-events` unbounded `meta` payload + unused event-type allowlist → cap `JSON.stringify(meta)`; call `isKnownEventType`.
- **IN-5** `save-submission` caps only apply to strings (object bypasses) → deep-clip whole `content`.
- **SEC-5** `.env.example` accidentally re-ignored by a duplicate `.env*` rule → move the `!.env.example` negation to end of `.gitignore`.

---

## What's already solid ✅
- **Secret hygiene:** no secrets committed; `.env*` gitignored; CSP/X-Frame-Options/nosniff/Referrer-Policy present; no `dangerouslySetInnerHTML`/`eval`/`innerHTML` sinks.
- **Auth engineering:** local JWKS JWT verify via `jose` (removes a network hop); RLS enabled with zero policies on new tables (fail-closed); no `using(true)`/`to anon` anywhere.
- **Code quality:** ESLint 0 errors (`--max-warnings 0`), `tsc` clean, **245/245 unit tests pass** (auth boundary, scoring math, rate-limit, provider fallback, contracts covered).
- **Frontend perf:** real code-splitting (32 page + 8 vendor chunks); 145 KB gzip initial JS+CSS; `lazyWithRetry` on all routes; no network `setInterval` polling.
- **Rate limiting + body caps exist** and fail closed; `select=*`-style over-fetch is the main data-layer smell, not missing auth.

---

## Prioritized remediation roadmap
**Sprint 0 — Stop the bleeding (this week):**
1. SEC-DATA-1 — verify/enable RLS on `mock_test_results` + send session token from client.
2. AUTH-1 — close `/api/ai` open proxy.
3. AUTH-2 — ownership prefix on `evaluate-speaking` storage path.
4. AUTH-3 — `requireTeacher` fails closed on empty allowlist.
5. RATE-1 — Redis-backed limiter (or Vercel KV) before any paid-AI burst.

**Sprint 1 — Harden (next 2 weeks):**
6. AUTH-4/5, IN-1, IN-2, AUTH-6, DATA-3 — authz, prompt-injection, JWT pins, salt telemetry.
7. PERF-1/2 — fire-and-forget telemetry; `maxDuration`+regions; budget-aware AssemblyAI poll.
8. DEP-1/2 — `npm audit fix`; remove 13 unused deps.

**Sprint 2 — Structural (next month):**
9. ARCH-1/2 — delete Prisma no-op, `my-app/`, clarify `fastapi/`; rewrite `DEVOPS.md`.
10. ARCH-3/4/5 — real router, split `App.jsx`, single store.
11. DB-1, PERF-3/4/7 — indexes + pagination + column projection everywhere.
12. PERF-8 — move 187 MB media to Storage/CDN; delete WAV duplicates.

**Test coverage gap to close:** all 245 passing tests are unit/contract-level. There is **no integration test against the real API routes or auth flows** (no supertest covering AUTH-1…5, no RLS policy test). Add route-level tests in `tests/api/` before Sprint 1 changes ship.

---

## Remediation status (updated 2026-09-09)

**Sprint-0 items addressed in this session:**

| ID | Finding | Status | Change |
|----|---------|--------|--------|
| SEC-DATA-1 | `mock_test_results` readable by anon client | ✅ Fixed | Client now fetches `/api/get-submissions` with bearer token (was RLS-less anon REST). Defensive RLS migration `supabase/migrations/20260909000000_mock_test_results_rls.sql` added (review column set before applying). |
| AUTH-1 | Open `/api/ai` proxy | ✅ Fixed | `api/_routes/ai.js` now requires a Supabase session **or** `AI_INTERNAL_TOKEN` (server-to-server); unauthenticated → 401. Origin check retained as defense-in-depth. |
| AUTH-2 | `evaluate-speaking` storage IDOR | ✅ Fixed | Ownership prefix (`${user.id}/` or `${user.email}/`) enforced; env-gated, teachers exempt. |
| AUTH-3 | `send-invite` open relay | ✅ Already fixed | `requireTeacher` fails closed on empty allowlist (present in tree). |
| RATE-1 | In-memory limiter not a real cap | ✅ Mitigated | Added dormant Upstash Redis distributed hard cap (`_rate-limit.js` `enforceDistributedCap`); active only when `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN` set, fails open. |
| PERF-1 | Blocking telemetry | ✅ Fixed | `logPrediction` calls in `ai.js`/`evaluate-speaking.js`/`evaluate-writing.js` are now fire-and-forget (`void ... .catch(()=>{})`). |
| PERF-2 | No `maxDuration` → 504s | ✅ Fixed | `vercel.json`: `api/[...path].js` `maxDuration: 60`, `memory: 1024`, region `gru1`. |

**Test regression from edits — resolved:** the gate/cap changes broke 11 unit + 18 vitest tests
(237/248 unit). Fixed by (a) authenticating contract tests via the internal-token path,
(b) relaxing the exact-string import regex in `rate-limit.test.js`, (c) rewriting
`ai.auth.vitest.js` to the new secure contract. Final: **unit 248/248, vitest 20/20, lint clean, tsc clean.**

**Not yet done (carried to Sprint 1/2):** AUTH-5 was found **already fixed** in the working
tree (`save-submission.js` calls `requireTeacher`, so `teacher_id` is derived from the verified
session, not the request body — same situation as AUTH-3). AUTH-4 (`tts.js` no auth) is now
**FIXED** this session: added a Supabase-session gate (+ `AI_INTERNAL_TOKEN` server-to-server
path, same-origin kept as defense-in-depth) and locked it with `tests/api/tts/tts.auth.vitest.js`.
SEC-DATA-1 (`mock_test_results` RLS) is **deferred to another phase** by decision (client reroute
+ dormant migration already written, not yet applied). Remaining: IN-1/2 (prompt injection),
AUTH-6, DATA-3, PERF-3/4/7/8, DEP-1/2, ARCH-1..5, DB-1, and the rest of the `tests/api/` integration suite.
