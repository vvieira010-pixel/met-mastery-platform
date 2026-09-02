# met-platform Audit Fix Summary — 2026-08-18

**Session goal:** "fix all" audit findings (#1–#10), prioritizing the 4 P0 ship-blockers.
**Verdict before this session:** teacher/student core flows FUNCTIONALLY WORKING; security ship-blockers (#1–#4) were the only true blockers for tomorrow's prod deploy (real student PII).

## Done this session (code on disk, verified)

| # | Sev | Finding | Status |
|---|-----|---------|--------|
| 1 | P0/S1 | get-submissions returned all rows (PII dump) + trusted attacker `teacherEmail` | **FIXED** — verify session → 401; fail-closed key; scoped to `teacher_id=eq.${user.email}`; limit 1–200 |
| 2 | P0/S2 | Forged JWT accepted (no signature check) | **FIXED** — `verifySupabaseSession` validates vs Supabase `/auth/v1/user`; rejects `anon`; null on any failure |
| 3 | P0/S3 | save-submission unauth service-role insert | **FIXED** — same-origin 403; fail-closed key; teacher allowlist 403; field caps. SPA writes via RLS instead |
| 4 | P0 | Hardcoded service-role key in source | **CODE DONE** — removed from all `api/*.js`; fail-closed `api/_config.js`. **KEY ROTATION STILL REQUIRED (see below)** |
| 5 | P1 | `VITE_` fallback leaked server secrets to client env | **FIXED** — dropped `process.env['VITE_'+name]` in send-invite/evaluate-speaking/generate-image; evaluate-speaking now requires session |
| 7 | P1 | Lint gate excluded `api/` | **FIXED** — `api/` now linted with Node globals; `npm run lint` covers `src/ api/ --max-warnings 0`; 55 pre-existing benign `src/` files ignored (user-approved). **GATE GREEN** |
| 9 | P2 | XSS on met-harden.js:45 innerHTML | **VERIFIED SAFE** — fully static string, no interpolation. No fix. |

SPA wiring: `src/pages/mock-test-results.jsx` now forwards `Bearer` token to `/api/evaluate-speaking`.

## Still OPEN (needs your decision / action before prod)

- **#4 — ROTATE THE SERVICE-ROLE KEY (do this first).** A service-role key (`sb_secret_67u_…`, prefix only) was committed to source and must be **rotated in the Supabase dashboard** and set as `SUPABASE_SERVICE_ROLE_KEY` env (Vercel/Netlify). Until rotated, the exposed key is still valid. `.env.example` documents this. The literal value has been scrubbed from this doc on purpose.
- **#6 — anon Supabase key hardcoded in `src/lib/supabase-storage.js:20-21`.** Browser-exposed by design (RLS-protected). Decision: leave (documented safety net) or gate behind `VITE_` env.
- **#8 — deferred manual reviews:** AI/LLM feature paths (evaluate-speaking, diagnosis-prompts) beyond auth, and build/deploy pipeline (vite build, netlify.toml, vercel serverless).
- **#10 — live Supabase DB contract for real student sign-in.** Depends on deployed RPC `claim_student_by_email` + columns + `local_id` matching seed ids. Cannot verify from source — confirm in deployed Supabase or students hit PageLoader/denied.

## How to confirm the gate
```
npm run lint   # exit 0, no warnings/errors
```

## Files changed this session
- `api/_config.js` (new) — fail-closed server config
- `api/_supabase-auth.js`, `api/get-submissions.js`, `api/save-submission.js` (rewritten)
- `api/send-invite.js`, `api/evaluate-speaking.js`, `api/generate-image.js` (VITE_ fallback removed)
- `src/pages/mock-test-results.jsx` (token forwarding)
- `eslint.config.js`, `package.json`, `.env.example` (lint gate + key-rotation note)
