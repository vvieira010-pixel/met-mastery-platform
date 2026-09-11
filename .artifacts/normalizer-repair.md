# Normalizer Repair — "repair instead of drop" for partial AI output

**Round 2 of the homework-creation fix.** Round 1 repaired the Homework Forge
swarm (`Promise.all` collapse + `grammar` mis-mapping). This round makes the
single-item normalizers in `exercise-ai-helpers.js` *repair* partial AI output
instead of silently dropping the whole exercise at the completeness gate.

## Why this matters

`createCompleteExercise` runs `isStructuredAiExerciseComplete` as a gate. Before
this round, the normalizers fed that gate data that could never pass:

- `normalizeMcqOptions` padded a 3-option MCQ with `''`. The MCQ gate requires
  **4 non-empty** options, so the item was dropped even though 3 real options +
  a valid key were present.
- `normalizeBlankAnswers` returned fewer entries than there were `___` in the
  template, failing the `>= blankCount` check and misaligning answer keys with
  the rendered inputs.

Both caused fully-usable exercises to vanish from an AI-generated assignment —
low yield on every partial model response.

## Changes

### `src/lib/exercise-ai-helpers.js`

- Replaced `normalizeMcqOptions` with `normalizeMcq(rawOptions, correct)` (now
  exported). It returns `{ options, correct }`:
  - Keeps all real options (filtered non-empty).
  - Pads up to 4 with **context-neutral generic distractors**
    (`None of the above`, `All of the above`, `Both A and B`, `I'm not sure`)
    instead of `''`. These are safe because the answer key is resolved against
    the **real option count**, never the padded length.
  - Resolves `correct` against `realCount`, so a 3-option item keyed `D` (index 3)
    is treated as a broken key (`null`) and dropped, not mis-graded toward a
    synthetic distractor. Zero real options also yields `null` -> dropped.
- Wired the new helper into all three MCQ-producing paths: `mcq`, `listen`, and
  `read` sub-questions.
- `normalizeBlankAnswers` now preserves **one slot per `___`** in the template
  (real answers kept in place, missing slots left `''`). This keeps answer keys
  aligned with rendered blank inputs and lets a partially-returned item survive.
- Blank completeness gate relaxed from `>= blankCount` to `>= 1` real answer, so
  a partial (but present) answer key yields instead of dropping.

### `src/lib/exercise-types.js` (auto-grader hardening)

- `autoGrade` blank branch now **skips blanks without an answer key** while
  keeping positional alignment, so an empty key can no longer grade as "only
  empty is correct". Total is computed over keyed blanks only.

### `tests/exercise-ai-helpers.test.js` (NEW, 13 assertions, all passing)

Covers: 3/2-option MCQ repair, distractor never empty, broken `D` key dropped,
zero-option dropped, 4-option unchanged, listening + reading repair, blank
partial-keep + alignment, blank-with-no-answers still dropped, and the hardened
blank auto-grader (skip empty keys, all-keys-present still works, repaired MCQ
never keyed to a distractor).

## Safety properties verified by tests

- A repaired MCQ can **never** auto-grade a fallback distractor as correct.
- A 3-option item whose key points past the last real option is dropped (broken
  key), not silently mis-graded.
- Blank items with at least one real answer survive and stay aligned; truly
  empty items are still dropped.

## Test / lint status

- `npm run test:unit` -> **288 pass, 0 fail** (was 275 before this round; +13
  from the new file).
- ESLint (`--max-warnings 0`) clean on `exercise-ai-helpers.js`,
  `exercise-types.js`, `tests/exercise-ai-helpers.test.js`.

## Not yet done (carry-over from round 1)

- All changes across round 1 + round 2 are still **uncommitted**.
- `/api/create-zoom-meeting` works locally but 404s in production (registered in
  `server.ts`, missing from the Vercel catch-all routes map) — undecided.
