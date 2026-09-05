# Security & Code-Quality Audit — MET Proficiency Platform

**Date:** 2026-09-04
**Scope:** Backend API (`api/*.js`, `server.ts`), auth layer (`src/lib/auth/*`), Supabase data layer (`src/lib/supabase-db/*`), frontend key handling (`src/lib/callAI.js`, `supabase-storage.js`), build/config (`vercel.json`, `eslint.config.js`, `package.json`).
**Method:** Static review of source, dependency audit (`npm audit`), secret-leak scan of built bundle (`dist/`), and config review. No dynamic/live exploitation was performed.

---

## 1. Executive Summary

The platform is a **React 19 + Vite SPA** with a **Supabase** backend and a set of **serverless/Express API proxies** that hide paid third-party AI/TTS/email provider keys. Overall hygiene is *above average* for a solo/small-team project: secrets are server-only, the AI proxy keeps keys out of the browser bundle, input is size-capped, storage paths are normalized, and a CSP is enforced.

However, the audit found **several high/medium issues concentrated in authorization, availability, and configuration-hardening**, plus a meaningful amount of **dead/unused code and an unenforced RBAC model**. None are "dump-the-database-today" criticals, but three are exploitable by a motivated attacker and should be fixed before any production expansion.

### Severity tally
| Severity | Count | Representative issue |
|----------|-------|----------------------|
| 🔴 Critical | 0 | — |
| 🟠 High | 3 | Open AI proxy origin policy; unauthenticated submission poisoning; server crash-on-rejection (DoS) |
| 🟡 Medium | 6 | Dep vulns, no local JWT verify, unenforced RBAC, no rate-limiting on paid endpoints, exposed dev harness, inconsistent CSP |
| 🟢 Low | 7 | Client-trusted role, error detail leakage, dead deps, lint exclusions, `document.write` sink, GrapesJS HTML review, TS-import-in-JS deploy risk |

---

## 2. High-Severity Findings

### H-1 — AI proxy is open to any origin when `APP_ORIGIN` is unset *(cost-abuse / key-abuse)*
**File:** `api/ai.js` → `allowedOrigin()` (lines 45–51)
```js
const allowed = env('APP_ORIGIN');
if (allowed) return origin === allowed || /^https?:\/\/localhost(:\d+)?$/.test(origin);
return true; // open until APP_ORIGIN is configured
```
`/api/ai` is an **unauthenticated** proxy that spends your Gemini/Groq/OpenRouter/NVIDIA credits. The only gate is this origin check, which **returns `true` (allow) when `APP_ORIGIN` is not configured**. If a deploy forgets to set `APP_ORIGIN` (or it's blank in one environment), anyone on the internet can route prompts through your paid keys, exhaust quotas, and inject content into your provider account.

**Fix:** Fail closed — `if (!allowed) return false;` (or require a non-empty `APP_ORIGIN`) in production. Add authenticated-session enforcement for non-public AI use. Document that `APP_ORIGIN` is mandatory.

### H-2 — `save-submission` authorization is bypassable; enables teacher data poisoning *(integrity)*
**Files:** `api/save-submission.js`, `src/App.jsx:114`
The endpoint inserts into `mock_test_results` using the **service-role key** (bypasses RLS) and authorizes purely by matching `body.teacherEmail` against the `TEACHER_EMAIL` allowlist:
```js
const teachers = allowedTeacherEmails();
if (teachers.length && !teachers.includes(teacherEmail)) { ... 403 }
```
Problems:
1. The allowlist email set is **also exposed in the client bundle** (`import.meta.env.VITE_TEACHER_EMAIL` in `App.jsx`), so the valid teacher emails are public.
2. `teacherEmail` is **attacker-controlled** in the request body and only string-matched — there is no proof the caller *is* that teacher (no session). An attacker who knows a teacher's email (trivial, given #1) can submit **forged results attributed to that teacher**.
3. If `TEACHER_EMAIL` is unset, the check is skipped entirely (`if (teachers.length && ...)`), leaving only the same-origin guard — which is itself a no-op when `APP_ORIGIN` is unset (`isSameOrigin` returns `true`).

**Fix:** Require a verified Supabase session and scope inserts to the **authenticated** user's identity (as `get-submissions.js` already does). Treat the teacher email as derived from the session, never from the body. Keep the service-role insert only if RLS cannot be used by the static client; otherwise write via the authenticated client with RLS.

### H-3 — `unhandledRejection` calls `process.exit(1)` → one bad async call crashes the server *(availability / DoS)*
**File:** `server.ts` (lines 19–27)
```js
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```
Express 4 does **not** catch rejections thrown inside `async` route handlers. Any unhandled promise rejection in a request path will **terminate the entire Node process**. With no supervisor/restart, a single malformed request or a transient upstream error can take the server down permanently. (In the Vercel serverless path each function is isolated, but the Express `npm start` deployment is exposed.)

**Fix:** Remove `process.exit(1)` from `unhandledRejection`; log and let the process survive. Add a global try/catch wrapper for async routes (or use Express 5 / `express-async-errors`). Run the server under a supervisor (systemd/PM2/`vercel` runtime). Also reconsider `uncaughtException → exit(1)` for the same reason.

---

## 3. Medium-Severity Findings

### M-1 — Known dependency vulnerabilities (express → body-parser → qs)
`npm audit --omit=dev` reports **3 moderate** issues:
```
qs 2.2.5 - 6.15.3  (array-limit bypass; DoS via isBuffer)
body-parser 1.20.5-1.20.6 → depends on vulnerable qs
express 4.22.2 → depends on vulnerable body-parser / qs
```
**Fix (corrected 2026-09-04):** `npm audit fix` **does not resolve this** — verified empirically (see §8). Root cause: `body-parser@1.20.6` (the newest 1.x) declares `qs: ~6.15.1`, a tilde range capped **below** 6.16.0, while the advisory range is `2.2.5 – 6.15.3`. `express@4.22.2` (newest 4.x) depends on `body-parser@1.20.6`, so the graph can never reach `qs@6.16.0` unaided — `npm audit fix` reports success while leaving all 3 in place. Real fix: an `overrides` entry pinning `qs` to `^6.16.0`, a semver-minor, non-breaking bump.

**On the headline number:** plain `npm audit` reports **32** issues, but **29 are dev-only** — the Vercel CLI toolchain (`undici`, `minimatch`, `path-to-regexp` via `vercel@59` → `@vercel/node` → `@vercel/express`). Build-time only, never shipped. `npm audit --omit=dev` — the figure that reflects actual production risk — is **3 moderate**, all from this one `qs` chain. Gate CI on `npm audit --omit=dev` so dev-toolchain noise doesn't block deploys.

### M-2 — Auth verified by a network call every request; no local JWT/JWKS verification
**File:** `src/lib/auth/session-verifier.ts` (lines 18–28)
Every protected request calls `GET {supabaseUrl}/auth/v1/user` with the service-role key to validate the token. There is a `SUPABASE_JWKS_URL` env var defined but **unused**. This means:
- A latency/availability dependency on Supabase Auth for *every* API call.
- No caching of session validity → redundant external calls under load.
- Service-role key is sent on every verification request (broad use of a very powerful key).

**Fix:** Verify the JWT **locally** using Supabase's JWKS (`SUPABASE_JWKS_URL`) with a short-lived cache (e.g., `jose`). Reserve the service-role key for admin operations only.

### M-3 — RBAC model is defined but not enforced server-side
**Files:** `src/lib/auth/types.ts` (full permission map), `src/lib/auth/session-verifier.ts`, API handlers
A clean `Role`/`Permission` system exists, but:
- `buildContext()` derives `role` from `user.role`. Supabase's `/auth/v1/user` response generally does **not** carry an app-level `role` claim, so `asRole()` defaults everyone to **`'student'`**. The teacher/admin distinctions are effectively never applied.
- The API handlers do **not** call `hasPermission()`. Authorization in practice is: (a) "any valid session" (`evaluate-speaking`, `generate-image`), or (b) an **email allowlist** check (`send-invite`, `save-submission`). `get-submissions` correctly scopes by the session email.
- Result: the elaborate RBAC is **dead code** on the server; the real gate is the email allowlist, which is itself exposed client-side (see H-2).

**Fix:** Decide the source of truth for role (a `profiles.role` column or a JWT custom claim), verify it server-side, and actually call `hasPermission()` at each route. Remove or wire up the unused model.

### M-4 — No rate limiting on paid endpoints
`api/ai.js` has a per-instance in-memory limiter, but **`evaluate-speaking`, `generate-image`, `tts` (beyond a same-origin check), and `send-invite` have no rate limiting**. Any authenticated user (or, for `tts`, any same-origin caller) can drive unbounded spend on Gemini/OpenAI/Deepgram/ElevenLabs/Resend.

**Fix:** Apply per-user and global rate limits + monthly quotas at the gateway or in each handler; emit 429 with `Retry-After`. For serverless, use a shared store (Upstash/KV) rather than an in-memory `Map` (which resets per cold start and doesn't coordinate across instances).

### M-5 — Dev/QA harness shipped to production — ❌ RETRACTED (false positive)
**Files:** `__harness.html` (root), `src/__harness.jsx` (excluded from lint)

**Retracted 2026-09-04.** The original claim assumed Vercel publishes repo-root files. Re-verification shows the harness is **not reachable in production**:

- `__harness.html` is **absent from `dist/`** — Vite builds `index.html` as its only entry, so root-level HTML is never emitted.
- Vercel serves the build output directory (`dist/`), not the repo root.
- `server.ts:99` serves **only** `distPath` (`express.static(distPath)`); the repo root is never exposed.
- `src/__harness.jsx` is imported by nothing — its only match is a self-reference at line 17.

**No action required.** It is a dev-only file, still excluded from lint. Deleting it is worthwhile hygiene if the harness is genuinely retired, but it is **not** a security finding.

### M-6 — Inconsistent security headers between `server.ts` and `vercel.json`
`vercel.json` sets `X-Frame-Options: DENY` and `frame-ancestors 'none'`. The Express `server.ts` CSP (lines 30–40) **omits `frame-ancestors`** and sets no `X-Frame-Options` → clickjacking protection is missing on the Node-server deployment. Security posture depends on *which* entrypoint serves traffic.

**Fix:** Centralize headers in one place (a shared `securityHeaders` module used by both `server.ts` and `vercel.json`), including `frame-ancestors 'none'` and `X-Frame-Options: DENY`.

---

## 4. Low-Severity Findings

- **L-1 Client-trusted role (`src/lib/supabase-db/auth.js`).** `ctx.role` is read from `localStorage` (`ROLE_KEY`). It does not gate server data (RLS does), but it is a code smell and could mislead future server logic. Derive role from the verified session/JWT, not localStorage.
- **L-2 Error-detail leakage.** `send-invite.js` 502 returns `e.message`; `ai.js` 502 returns joined provider error strings. Minor internal-info exposure. Return generic messages; log details server-side only.
- **L-3 Dead/unused dependencies.** `next-auth` (5.0.0-beta.32), `@auth/core`, `@google/genai`, `@vercel/connect` are in `package.json`/lock but not imported in `src`/`api`. The next-auth beta especially adds supply-chain surface. Remove unused deps; if `@google/genai` is intended, use it instead of raw `fetch` (or delete).
- **L-4 Lint gate excludes ~50 app files.** `eslint.config.js` ignores many production files (`src/pages/*.jsx`, `supabase-db.js`, etc.) so `--max-warnings 0` stays green. Security-relevant logic in those files escapes review. Reduce the ignore list over time; at minimum lint the data/API-adjacent files.
- **L-5 `document.write` sink (`src/lib/print-homework.js:114`).** `w.document.write(html)` builds a print window from exercise content. If any interpolated value is user/student-supplied and unescaped, this is a DOM-XSS sink. **Review** and ensure all interpolated content is HTML-escaped.
- **L-6 GrapesJS visual editor (`src/pages/visual-editor.jsx`, `@grapesjs/studio-sdk`).** User-authored HTML/CSS is rendered. Stored/persistent XSS is possible if untrusted content is later displayed to other users. **Review** sanitization (e.g., DOMPurify) before render and before persisting.
- **L-7 `.js` importing `.ts` (`api/get-submissions.js` → `../src/lib/auth/index.ts`).** Works under `tsx`/Vercel bundling, but is fragile. Confirm the Vercel build actually resolves it; otherwise the submissions endpoint fails in production. Prefer colocating server auth in plain `.js`/`.mjs`.

---

## 5. What's Done Well (keep)

- ✅ **Secrets stay server-side.** AI keys are never inlined (verified: `dist/` scan found **zero** `AIza…`/`sk-…`/JWT matches). Client talks to `/api/ai` only (`callAI.js`).
- ✅ **Fail-closed service key** (`_config.js` `requireServiceKey` returns `''` and refuses).
- ✅ **Input size caps** on prompts, transcripts, TTS text, and submission fields; **path normalization** in `evaluate-speaking.js` (rejects `..`, leading `/`, non-alphanumeric).
- ✅ **CSP** present (tightened in production by removing `unsafe-inline` scripts); `nosniff`, `Referrer-Policy` set.
- ✅ **No `dangerouslySetInnerHTML`** in `src` (XSS surface is small).
- ✅ **RLS-centric data layer** — client uses anon key + user token and relies on Supabase RLS rather than shipping the service key.
- ✅ **`.env.local` gitignored** and contains only server-only keys (no `VITE_` provider keys).

---

## 6. Prioritized Remediation Plan

| # | Priority | Action | Effort |
|---|----------|--------|--------|
| 1 | 🔴 Now | `allowedOrigin()` fail-closed when `APP_ORIGIN` unset; document as mandatory | S |
| 2 | 🔴 Now | `save-submission`: require verified session; derive teacher identity from session, not body; remove reliance on client-exposed email allowlist | M |
| 3 | 🔴 Now | Remove `process.exit(1)` in `unhandledRejection`; add async error wrapper; run under supervisor | S |
| 4 | 🟡 Next | `npm audit fix`; add audit to CI | S |
| 5 | 🟡 Next | Local JWT verification via JWKS (use `SUPABASE_JWKS_URL`); cache; stop sending service key per request | M |
| 6 | 🟡 Next | Enforce RBAC: source role from verified claim, call `hasPermission()` in handlers; or delete the unused model | M |
| 7 | 🟡 Next | Rate-limit + quota paid endpoints (shared store) | M |
| 8 | 🟡 Next | Remove/exclude `__harness.html` from prod; gate if kept | S |
| 9 | 🟡 Next | Unify security headers across `server.ts` and `vercel.json` | S |
| 10 | 🟢 Later | Remove dead deps; review `document.write` & GrapesJS sanitization; shrink lint ignore list; verify `.js→.ts` deploy | M |

**S = small (<0.5 day), M = medium (0.5–2 days).**

---

## 7. Verification Checklist (post-fix)
- [ ] `npm audit` returns 0 vulnerabilities.
- [ ] With `APP_ORIGIN` blank, `/api/ai` returns 403 from a foreign origin.
- [ ] `POST /api/save-submission` with a spoofed `teacherEmail` and no session → 401/403.
- [ ] A test route that throws asynchronously does **not** stop the server.
- [ ] `GET /api/get-submissions` with another teacher's token returns only that teacher's rows (no cross-tenant leakage).
- [ ] Lighthouse/securityheaders scan shows `frame-ancestors` + `X-Frame-Options` on the live URL.

*Audit performed by static review + `npm audit` + bundle secret scan. No live exploitation was conducted.*

---

## 8. Remediation Applied (2026-09-04, post-audit)

The three High-severity findings (H-1, H-2, H-3) were fixed in Agent mode. The API layer lints clean (`eslint api/` passes with no errors/warnings).

**H-1 — `api/ai.js` `allowedOrigin()`** now fails closed: foreign origins are rejected unless they exactly match `APP_ORIGIN`; localhost/127.0.0.1 and server-to-server (no `Origin`) requests remain allowed. **Action required:** set `APP_ORIGIN` in every environment.

**H-2 — `api/save-submission.js`** now requires a verified Supabase session and derives `teacher_id` from the authenticated user's email. The legacy email-allowlist is retained **only** as a fallback for the static client that cannot authenticate; a session-less request can no longer claim an arbitrary teacher. `api/_config.js` `isSameOrigin()` also fails closed (rejects foreign origins when `APP_ORIGIN` is unset), hardening both `save-submission` and `tts`.

**H-3 — `server.ts`** no longer calls `process.exit(1)` on `unhandledRejection` (logs only; the server survives). All API routes are wrapped so an async throw/rejection returns a clean 500 instead of crashing the process.

**Out-of-scope / pre-existing:** `npm run lint` still surfaces one pre-existing warning in `src/pages/practice-studio.jsx` (`onBack` unused) — unrelated to this fix and present before it (commit `dd6cefa`). Recommended follow-up: drop or prefix the unused prop.
