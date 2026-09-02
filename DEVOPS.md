# MET Proficiency Platform — DevOps Guide

> Owned by the DevOps Automator skill.
> Last updated: 2026-08-17.

## Overview

This project deploys automatically through GitHub Actions → Netlify.
Every push lands in a preview; every merge to `main` lands in production, with a post-deploy health check.

```
   ┌──────────┐        ┌──────────────────────────────────┐        ┌──────────────┐
   │  commit  │──push──▶  GitHub Actions: ci.yml          │──net──▶│  Netlify CDN │
   └──────────┘        │                                  │        └──────────────┘
                       │  1. lint           (PR gate)   │
                       │  2. typecheck      (PR gate)   │
                       │  3. test [20,22]   (PR gate)   │   PRs only:
                       │  4. build                       │   auto-deploy to a
                       │  5. audit          (soft)       │   unique preview URL
                       │  6. preview deploy (PR only)    │
                       │  7. prod deploy    (main only)  │   main only:
                       │  8. smoke /api/health           │   deploy --prod
                       │                                  │
                       │  security.yml (parallel):        │
                       │  • CodeQL                        │
                       │  • gitleaks                      │
                       │  • npm audit (weekly cron)       │
                       └──────────────────────────────────┘
```

## Quick links

| What | Where |
|---|---|
| Pipeline config | `.github/workflows/ci.yml` |
| Security scans | `.github/workflows/security.yml` |
| Dependabot | `.github/dependabot.yml` |
| Netlify build | `netlify.toml` |
| Required secrets | _see "Required GitHub secrets" below_ |
| Node version | `.nvmrc` (22) |

## Required GitHub secrets

| Secret | Purpose | How to create |
|---|---|---|
| `NETLIFY_AUTH_TOKEN` | Auth for `netlify-cli` deploy | Netlify → User Settings → Personal access tokens |
| `NETLIFY_SITE_ID` | Which site to deploy to | Netlify → Site settings → Site details → "Site ID" |
| `NETLIFY_SITE_NAME` | Used for preview URL construction | The site's subdomain (e.g. `met-mastery`) |

Configure these in **Settings → Secrets and variables → Actions → New repository secret** once per repo.

> **Note:** the supabase and Gemini keys should be configured in **Netlify's environment variables** (Site settings → Environment variables), not in GitHub secrets — they are read at runtime by `api/*.js`, never by CI.

## Branch protection (recommended)

In **Settings → Branches → main → Edit**:

- [x] Require a pull request before merging
- [x] Require approvals: **1**
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require review from Code Owners
- [x] Require status checks to pass before merging
  - `Lint (ESLint)`
  - `Type check (tsc)`
  - `Tests (node:test) / Node 22`
  - `Build`
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings

## Local parity

```bash
# Match the CI runtime exactly
nvm use            # reads .nvmrc → Node 22
npm ci             # clean install, matches lockfile exactly
npm run lint       # same as CI lint job
npm test           # same as CI test job
npm run build      # same as CI build job
```

## Deployment

### Preview (every PR)

`build` → `preview` jobs run automatically.
Netlify assigns a unique URL like `https://pr-42--met-mastery.netlify.app`.
URL is auto-posted to the PR as a sticky comment.

### Production (main only)

`build` → `audit` → `deploy-production` → `smoke` jobs run.
The `smoke` job hits `/api/health` and fails the workflow if the deploy did not boot — this is the canary.

### Rollback

```bash
# Option 1: revert the commit on main and push — full pipeline runs.
git revert <bad-sha>
git push origin main

# Option 2: Netlify "Publish deploy" from the dashboard (last known good).
```

## Observability

This pipeline ships **no** external monitoring yet. Recommended next steps:

1. **Netlify Analytics** — already available without config in the Netlify UI.
2. **Sentry** — install `@sentry/react` and `@sentry/node`, add DSN to env, ship.
3. **UptimeRobot** — HTTP(s) check on `/api/health`, free tier.
4. **Status badge** — add to README:

   ```markdown
   ![CI](https://github.com/<owner>/met-platform/workflows/CI%2FCD/badge.svg)
   ```

## Operational runbook

| Symptom | Likely cause | Fix |
|---|---|---|
| `Lint (ESLint)` fails | New warning introduced | Fix locally: `npm run lint:fix` |
| `Type check (tsc)` fails | TS regression | `npx tsc --noEmit` locally |
| `Tests` fails only on Node 20 | Compat issue with new dep | Bump `.nvmrc` to 22 if unavoidable |
| `Build` exceeds 10 min | Asset bloat / cache miss | Restore npm cache, check `dist/` size in summary |
| Preview deploy URL 404 | Netlify DNS not propagated | Wait 30s, retry, check Netlify dashboard |
| Smoke check 5xx | Service crashed post-deploy | Check Netlify function logs, roll back |

## Cost optimisation

- `npm ci` uses cache by default → most installs < 20s after first build.
- `cacheDir` is pinned to `.vite-cache-v2` — survives CI runs if `actions/cache` is added later.
- Build artifact compressed & uploaded once per run, kept 14 days, then auto-purged.

## Future improvements (backlog)

- [ ] Add `actions/cache` step for `.vite-cache-v2`
- [ ] Migrate from `npm` to `pnpm` once `engines.npm` is added
- [ ] Wire Sentry source maps on deploy
- [ ] Add Lighthouse CI to `preview` job
- [ ] Add Playwright E2E suite
- [ ] Configure Netlify branch-deploy contexts per env (dev/staging/prod)
