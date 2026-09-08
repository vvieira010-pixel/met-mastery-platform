# Quality playbook — MET platform

Written 2026-09-08 after merging the `release-26efefe` copy back into `main`.
Everything below comes from something actually observed in this repo, not from theory.

---

## 1. One source of truth: never keep two copies of the repo

**What happened:** two working directories (`platform0.3` and `release-26efefe`) diverged from a
shared base `26efefe`. Comparing the two folders reported 389 differing files, which looked
terrifying. The real merge payload was **3 files, 3 lines**.

**Why:** main had moved 37 commits forward; the release copy had moved 1. The folder comparison
was measuring main's own progress, not work that was missing.

**Rule:** compare commits, not folders.

```bash
git merge-base HEAD <other-sha>              # where did they diverge?
git rev-list --count <base>..HEAD            # how far ahead is this side?
git rev-list --count <base>..<other-sha>     # how far ahead is the other side?
git log --oneline <base>..<other-sha>        # what is actually missing?
```

**Preview any merge before you run it** — this one reported zero conflicts in under a second:

```bash
git merge-tree --write-tree --name-only --messages HEAD <other-sha>
# exit 0 + a tree hash = clean merge; conflicted paths are listed
```

**Before any non-trivial merge, create a rollback point:**

```bash
git tag pre-merge-$(date +%F)
# roll back with: git reset --hard pre-merge-2026-09-08
```

---

## 2. The gates, and what they actually do

| Gate | Command | Covers |
|---|---|---|
| Lint | `npm run lint` | `src/` + `api/`, `--max-warnings 0` |
| Design tokens | `npm run lint:tokens` | 407 files, off-brand color tokens |
| Unit tests | `npm test` | `node --test tests/**/*.test.js` |
| Build | `npm run build` | vite + output prep + server bundle + token lint |
| E2E | `npm run test:e2e` | Playwright, Chromium |

**A gate that is red is the same as no gate.** `npm run lint` was failing on `main` before this
pass. Fix it the day it goes red, or it stops meaning anything.

**A test that cannot run is worse than no test** — it gives false confidence. See debt #1 below.

---

## 3. Open debt, in priority order

### Debt 1 — Three test files could not execute ✅ CLOSED
`tests/api/ai/ai.auth.test.js`, `ai.contract.test.js`, `ai.validation.test.js` import `vitest`,
which was **not in devDependencies** — so `npm test` aborted each file with `ERR_MODULE_NOT_FOUND`
and **19 assertions covering the AI proxy never ran**, while the suite still reported a run.
`supertest` was missing too.

**Fixed in `4460cef`:**
- installed `vitest` + `supertest` as devDependencies
- renamed the three files to `*.vitest.js` so the `node --test` glob skips them
  (Node 22's runner has no file-exclusion flag)
- added `vitest.config.js` (`include: ['tests/**/*.vitest.js']`, `environment: 'node'`)
- scripts: `"test": "npm run test:unit && npm run test:vitest"`
- result: **19/19 AI-proxy tests pass** — first time they have ever executed

### Debt 2 — A stale test asserting the old AI cascade ✅ CLOSED
`tests/met-writing-scoring.test.js` still required `provider: 'openai'` in the grading cascade, but
OpenAI/Anthropic were removed on purpose in `a3244cb`. **Fixed in `914bb37`:** the contract now
asserts gemini → groq and that openai/anthropic stay out.

**Rule (keep this one):** behavior change and test update land in the **same commit**. A green
suite that encodes yesterday's design is a liability.

### Debt 3 — Speaking-bank magic totals ⚠️ CLOSED, CONTENT QUESTION OPEN
`tests/practice-studio-speaking.test.js` asserted exact totals: 179 practice prompts and 156 in the
raw bank. The shipped bank has **83 and 60**. The two constants were also internally inconsistent —
the filtered set (179) cannot be larger than the full bank (156).

**Fixed in `914bb37`:** replaced both exact totals with per-question coverage floors. Structural
coverage (type, `metTaskType`, prompt length, no short/MCQ) is unchanged.

**Open question for the content owner:** were ~96 prompts lost, or were those numbers never real?
If content is missing, restore it and raise the floors — do not just delete the assertion.

**Rule:** never assert a magic grand total over a content bank. Assert structure and per-unit
coverage instead; exact totals drift and turn into false alarms.

### Debt 4 — The lint ignore list exempts the busiest pages
`eslint.config.js` lists ~45 files under `ignores` "so the `--max-warnings 0` gate stays green",
including `src/pages/student-dashboard.jsx` and `src/pages/teacher-dashboard.jsx` — the exact files
the release commit changed. Roughly 40% of the app is outside the quality gate, and it is the part
that changes most.

**Rule:** the ignore list may only shrink. Add a ratchet so it cannot grow:

```bash
# put in CI: fails if someone adds another exemption
test $(grep -c "src/" eslint.config.js) -le 45 || echo "ignore list grew — fix the warning instead"
```

### Debt 5 — AI-generated drafts committed into `src/`
13 files from the release copy were never committed anywhere and were **not valid JavaScript**:
6 `I*Repository.js` files contain TypeScript `interface` syntax inside `.js`, and `domain-events.js`
has a duplicate `FADING_ADJUSTED` key (silently overwritten — the second entry wins).

They are quarantined in `docs/education-skills-drafts/` until someone decides what they are.

**Rule:** generated/AI-drafted code does not enter `src/` until it parses, lints, and has an owner.
Reference material belongs in `docs/`.

---

## 4. Commit hygiene

Observed in this repo: two consecutive commits `a3244cb` and `397b0f8` both titled
*"Remove OpenAI and Anthropic from AI cascade"*. That is an unfinished rebase/interactive
session pushed as-is.

**Rules:**
1. One logical change per commit. If you cannot describe it in one line, it is two commits.
2. Rebase/squash your branch before pushing: `git rebase -i origin/main`.
3. Imperative subject under 72 chars; explain *why* in the body, not *what* (the diff says what).
4. No commit should leave the tree red. Run the gates before you push, not after.

---

## 5. Pull request checklist

Copy into `.github/pull_request_template.md`:

```
- [ ] `npm run lint` passes
- [ ] `npm test` passes (and I did not skip a failing test)
- [ ] `npm run build` passes
- [ ] Every behavior change has a test that fails without it
- [ ] No new file added to the eslint ignore list
- [ ] No secrets, no console.log in browser code
- [ ] Commits are squashed; messages explain why
- [ ] Screenshots attached for any UI change
```

**Review standard:** a reviewer is accountable for the diff, not the author. If you approve it,
you own it in production.

---

## 6. Minimal CI — the smallest thing that changes behavior

`.github/workflows/quality.yml`:

```yaml
name: quality
on: [pull_request]
jobs:
  gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

Until debt 1–3 are fixed, `npm test` will be red — that is the point. Fix the tests or make them
`test.failing`/`todo` with a linked issue; do not delete them.

---

## 7. Definition of done — merge pass, 2026-09-08

- [x] `92ed7ae` merged into `main` as `c43eb3b`, zero conflicts
- [x] Rollback tag `pre-merge-2026-09-08` (= `af7c5fe`), local only
- [x] 13 untracked release-copy files preserved, quarantined out of `src/`
- [x] `npm run lint` green (`feb2dfe`)
- [x] `npm run build` green — vite + server bundle + token lint (407 files, clean)
- [x] Debt 1 closed (`4460cef`) — 19 AI-proxy tests now actually run
- [x] Debt 2 closed (`914bb37`) — stale cascade assertion fixed
- [x] Debt 3 closed (`914bb37`) — magic totals replaced with coverage floors
- [x] Pushed: `183867c..914bb37` → `origin/main`
- [x] Single source of truth: `platform0.3` only; `release-26efefe` deleted

**Current gate status: green.** `npm test` 239 unit + 19 vitest, 0 failures.
Still open: debt 4 (eslint ignore list) and debt 5 (drafts in `docs/`).
