## Summary

<!-- One-line summary of the change. Fixes #issue if applicable. -->

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] CI/CD or DevOps change
- [ ] Refactor (no functional change)

## Scope

<!-- Which package(s) and routes are affected? -->

- [ ] Frontend (`src/`)
- [ ] API serverless functions (`api/`, `netlify/functions/`)
- [ ] Express server (`server.ts`)
- [ ] CI/CD pipeline (`.github/`)
- [ ] Netlify config (`netlify.toml`)
- [ ] Content / public assets (`public/`, `Exercises/`)
- [ ] Documentation

## What changed

<!-- Bullet list of concrete changes. Be specific. -->

-

## Verification checklist

<!-- Tick everything that applies. CI will run all of these automatically,
     but the author is responsible for the local sanity check too. -->

- [ ] `npm run lint` passes locally
- [ ] `npm run test` passes locally
- [ ] Local build works: `npm run build`
- [ ] Smoke-tested the affected route(s) manually
- [ ] No new secrets introduced to the repo
- [ ] No `console.log` left behind in production code
- [ ] Supabase migrations applied (if schema changed)

## How to test in preview

<!-- Steps for the reviewer to manually verify the preview deploy. -->

1. Wait for the "Deploy preview" check to finish and grab the URL from the PR comment.
2. ...

## Rollback plan

<!-- What is the rollback plan? delete a row? revert a commit? feature flag? -->

-

## Screenshots / recordings

<!-- Optional but very helpful for UI changes. -->

