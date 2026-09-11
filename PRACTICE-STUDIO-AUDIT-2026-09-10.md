# Practice Studio — Code & Feedback-Pipeline Audit
**Date:** 2026-09-10 · **Author:** WorkBuddy AI · **Scope:** speaking + graded saved-feedback path, data model, answer display

## TL;DR (headline finding)
The saved/locked feedback screen (the one you screenshotted) shows **"✗ Incorrect"** and the banner **"Answer checked — review the correct answer below"**, but for several graded exercise types **no answer is rendered below the banner**. The student is promised an answer that never appears.

Root cause: `SavedPracticeFeedback` (in `src/components/exercises/ExercisePlayer.jsx`) only renders the answer value when `result.correctAnswer` (or `exercise.options` / `exercise.correctedText`) is truthy. Exercise types `Reading` and `LevelUp` submit `{ correct: selected === correct }` and store **nothing else**, so `correctAnswer` resolves to `''` and the "Correct answer" block is skipped. `selectedAnswer` and `answerRows` are also empty → the banner points at nothing.

---

## Architecture & data flow (as built)

| Layer | File | Role |
|---|---|---|
| Page | `src/pages/practice-studio.jsx` | mode/topic/question selection; loads exercises; reads prior submissions; renders `ExercisePlayer` with `initialResults` |
| Player | `src/components/exercises/ExercisePlayer.jsx` | session state, locked/one-submit logic, renders `SavedPracticeFeedback` when `done && practiceStudio` |
| Feedback renderer | `SavedPracticeFeedback` (ExercisePlayer.jsx lines 74–247) | the locked view — two branches: **non-evaluation** (correct/incorrect) and **evaluation** (speaking AI score) |
| Recorder | `src/components/exercises/ShortAnswer.jsx` → `SpeakingRecorder` | recording + "Get AI score"; shows sample answer **only while recording, before scoring** |
| Storage | `src/domain/practice.js` `submitPracticeStudioExercise` (161–199) | stores `data.result` verbatim as `result` + mirrors to `results[0]` |
| Exercise data | `src/data/exercises/speaking/image-description.js`, `practice-studio-speaking.js` | carry `sampleAnswer` for a subset only |

Key invariant: `SavedPracticeFeedback` receives the **full exercise object** (`exercises[current]`), so `exercise.sampleAnswer` / `exercise.correctedText` / `exercise.options` are available — the gap is purely that they are not all rendered in the saved view.

---

## Findings

### F1 — High · Saved graded feedback shows a dangling "review the correct answer below" banner
- **Where:** `ExercisePlayer.jsx` lines 117–121 (banner) and 97–100 / 145–150 (`correctAnswer` computation + render gate).
- **Trigger:** any graded exercise whose `onComplete` payload lacks `correctAnswer`/`answers`/`selectedAnswer`.
- **Confirmed offenders:**
  - `Reading.jsx:47` → `onComplete({ correct: selected === correct })`
  - `LevelUp.jsx:30` → `onComplete({ correct: selected === correct })`
  - `SynonymSwap.jsx:25` → `onComplete({ correct: allCorrect, selected })` (`selected` ≠ `selectedAnswer`, so the "Your answer" line is also empty)
- **Effect:** wrong answer → "✗ Incorrect" + banner, but zero answer content. This is the screenshot you posted.
- **Fix:** make the banner conditional on an answer actually being available, and/or render the correct answer from the exercise definition (`exercise.correct` / `exercise.options[exercise.correct]` / `exercise.correctedText`) which the saved view already has access to.

### F2 — Medium/High · Speaking saved feedback drops the sample answer
- **Where:** `SavedPracticeFeedback` evaluation branch (lines 168–246) renders Question, recording, transcript, band, overall feedback, rubric scores, strengths/weaknesses, corrections — **but never `exercise.sampleAnswer`**.
- **Behavior:** `SpeakingRecorder` shows a "Compare with a sample answer" `<details>` (ShortAnswer.jsx lines 431–448) **only in the `status === 'done'` state, before AI scoring**. Once the student clicks *Get AI score*, the row is saved and the parent re-renders `SavedPracticeFeedback` (which has no sample answer). **So the sample answer disappears the moment the attempt is scored and locked.**
- **Data that exists but isn't shown:** `image-description.js` `sampleAnswer` for index 0 (stadium), and `practice-studio-speaking.js` `sampleAnswer` for `spk-quiz-02..05`.
- **Fix:** add a "Sample answer" section to the evaluation branch of `SavedPracticeFeedback` (read `exercise.sampleAnswer`).

### F3 — Low · Banner wording is split/incoherent
- `correct === true` → "Correct answer" (line 118–120).
- `correct === false` → "Answer checked — review the correct answer below" (line 117–121).
- Two different phrasings for the same concept; the second is a pointer ("below") that is dead when no answer renders (see F1).

### F4 — Informational · Rationale removal side-effect (from prior task)
- The `rationale` object was surgically removed from one `practice_submissions` row (`722214ba-…`, the stadium speaking submission). `SavedPracticeFeedback` reads `evaluation.rationale` per criterion (lines 162, 203–220), so for that row the rubric-feedback section now shows the **score but an empty per-criterion explanation**. Expected outcome of the earlier "remove this from the feedback" request; flagged only so the empty explanation block isn't mistaken for a new bug.

### F5 — Medium · Sample-answer data coverage gap
- `image-description.js`: `sampleAnswer` exists **only for index 0 (stadium)**. The other 14 base prompts + 29 topic prompts have **no `sampleAnswer`**. `practice-studio-speaking.js`: `spk-audio-02..05` (the Q2–Q5 audio prompts) also lack one.
- Fixing F2 helps only the 5 exercises that have a sample answer. To make "show the answer" meaningful across Practice Studio, author sample answers for the Q1 image set and the audio-prompt bank.

### F6 — Low · FillBlank / ReadExercise store `answers` but not `correctAnswer`
- `FillBlank.jsx:36–42` and `ReadExercise.jsx:38` send `answers: [{given, expected, correct}]` (no `correctAnswer`). Their expected answers **do** appear via the "Your answers" block (lines 128–144). Acceptable, but inconsistent with the F1 banner — the standalone "Correct answer" panel is still skipped for these two types.

---

## What works well (positives)
- **One-submission lock** is enforced both client-side (key check) and server-side (unique index + `23505` duplicate-key handling in `practice.js` 191–198 / 240–247).
- **Supabase-only persistence** for Practice Studio (no localStorage fallback) — correct for teacher-visible records (`practice.js` 130–149).
- **AI scoring gated to Practice Studio** — homework recordings go to teacher-only eval (`ShortAnswer.jsx` 363–364, 84).
- **Re-recordable until scored** for speaking (`ShortAnswer.jsx` 81–84) — good UX; the lock only engages on the chosen final AI-scored attempt.

---

## Recommended fixes (priority order)
1. **F1 (do first):** in `SavedPracticeFeedback`, derive the correct answer from the saved result **and** the exercise definition; only show the "review the correct answer" banner when an answer value exists. Render `exercise.correctedText` / `options[exercise.correct]` as the fallback so Reading/LevelUp/SynonymSwap show the answer.
2. **F2:** add a "Sample answer" panel to the speaking evaluation branch of `SavedPracticeFeedback`.
3. **F5:** author `sampleAnswer` for the remaining Q1 image prompts + audio prompts so F2 is useful platform-wide.
4. **F3:** unify the correct/incorrect banner text.

## How to reproduce F1 (the screenshot)
1. Practice Studio → any graded mode (e.g. Reading or Level Up).
2. Answer incorrectly, submit.
3. Result locks with "✗ Incorrect" + "Answer checked — review the correct answer below" and **no answer shown**.

## Next steps
- Say the word and I'll patch `ExercisePlayer.jsx` (`SavedPracticeFeedback`) for F1 + F2 and add the missing sample answers (F5). Both are small, additive changes; I'd commit + deploy as before.
