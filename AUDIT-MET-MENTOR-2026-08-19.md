# MET Platform Mentor — Audit (Pedagogical & Architecture Fidelity)

**Audit Date**: 2026-08-19
**Auditor**: `met-platform-mentor` skill — dual lens (MET tutor + senior developer)
**Scope**: MET *fidelity* + alignment with the skill's **locked decisions** (audience 58 overall / 59 speaking; MVP = Reading+Listening, score-only; 0-80 + CEFR A2-C1; React/Vite/Supabase; Brazil LGPD, GMT-3).
**Prior audits (not duplicated here)**: `audit-report-2026-08-19.md` (impeccable UI/visual, 17/20), `AUDIT-FIX-SUMMARY.md` (security PII/JWT fixes). This audit covers what those did **not**: does the platform actually teach and report MET correctly?

> Authoritative MET facts used below come from the skill's `references/met-structure.md` (CaMLA / Michigan Language Assessment). Flag anything not in that file as **unverified** — and re-verify the exact equating cut scores against the official examinee manual before shipping score reporting.

---

## Verdict

**Pedagogically risky to ship as-is.** The *content* (section scaffolding, tasks, healthcare context) is faithful and strong. But the *scoring/reporting engine* does **not** mirror official MET: it reports raw percentage-correct instead of the official **0-80 scaled score per section**, derives CEFR from a home-grown percentage table (not the official 0-39 A2 / 40-52 B1 / 53-63 B2 / 64-80 C1 bands), and one calculator even invents **C2** — a level MET does not award. For a test-prep product whose entire promise is "show students where they fall on the CEFR," misreporting the band by up to a full level is the central defect.

## Mentor Health Score

| # | Dimension | Score | One-line |
|---|---|---|---|
| 1 | MET Scoring Fidelity | 1/4 | %-correct, not 0-80 scaled; 3 inconsistent CEFR calculators; C2 invented |
| 2 | Content & Section Fidelity | 4/4 | Speaking Q1–Q5 + Writing W1Q1-3/W2 + Reading/Listening 3 parts — faithful |
| 3 | Pedagogical Soundness | 3/4 | Diagnose→homework→feedback loop solid; AI feedback shipped before validation |
| 4 | Architecture Alignment | 4/4 | React/Vite/Supabase DDD; matches recommended stack; single-teacher constraint met |
| 5 | Privacy & Compliance (LGPD) | 2/4 | PII in Supabase; key rotation still open; consent/erasure unverified |
| 6 | Security Carryover | 2/4 | PII/JWT fixed; service-role key rotation + anon key still outstanding |
| **Total** | | **16/24** | Fix scoring + key rotation before relying on reported bands |

---

## Findings

### P0 — Pedagogical ship-blocker

**[P0] Scoring does not mirror official MET (0-80 scaled + CEFR bands)**
- **What's wrong**:
  - `MockTestScoringService.calculateScores` returns raw summed `total`/`max` points — never a **0-80 scaled score per section**. Students see e.g. "reading 32/40", not their MET position on the 0-80 ruler.
  - CEFR is derived from **percentage-correct**, via three *different* calculators that disagree:
    - `src/core/domains/mock-test/services/mock-test-scoring.service.ts:30-42` → `>=85 C2, >=75 C1, >=65 B2, >=55 B1, >=45 A2, else A1`
    - `src/components/mock-test/constants.js:34-47` (student-facing `MockTestThanks`) → `<50 Below B1, <70 B1, <85 B2, else C1`
    - `src/core/domains/lifecycle-management/value-objects/band-level.vo.ts:7` → includes `A1` and `C2`, both **outside MET's A2–C1 scope**.
  - Official MET (skill reference): **0-80 per section + average; 0-39 A2, 40-52 B1, 53-63 B2, 64-80 C1; no C2, no A1, no pass/fail.**
- **Impact (tutor)**: A learner at 65% correct is told **B2** by the scoring service (official scaled ≈52 → **B1**) — over-reported by a full band. At 75% the service says **C1** (official ≈60 → **B2**). The student-facing UI is milder but still percentage-based and test-form dependent, so "B2" means different numbers-correct on different tests. Students build a false picture of exam readiness.
- **Impact (dev)**: Three divergent CEFR paths = any future fix lands in only one; unpredictable reporting across surfaces.
- **Fix**: Create one `src/lib/met-scoring.ts` as the single source of truth:
  1. `rawSectionPoints → scaled0to80` (documented linear or equating table per section/test form),
  2. `average(taken sections) → overall0to80`,
  3. `mapToCefr(score)` using the official band ranges, **capped at C1** (drop A1/C2 from MET band vocabulary),
  4. wire it into both the scoring service and `MockTestThanks`; delete the other calculators.
- **Suggested command**: `/met-platform-mentor fix scoring`

### P1 — Major

**[P1] Landing implies official endorsement it likely doesn't have** (cross-ref impeccable audit P1; mentor reinforces the *pedagogical-integrity* angle)
- "Recognized by leading institutions" with **Michigan Language Assessment + University of Michigan monograms**, three fabricated named testimonials ("Ana Silva", "Carlos Oliveira", "Juliana Costa") with specific score claims, and stats ("92% Pass Rate", "500+ Students", "4.9★") at `src/pages/landing.jsx:86-90, 262-277, 370-384, 254`.
- **Tutor lens**: Implying a CaMLA/MLA partnership you don't hold misleads students about official recognition and is a legal/brand risk. Product principle #3 ("AI as assistant, not replacement") and your educator credibility are undermined if the front door overclaims.
- **Fix**: Reword to "Built for the MET" / remove monograms unless a real partnership exists; mark testimonials as placeholders until real quotes exist; substantiate or drop the stats.

**[P1] AI detailed feedback shipped as authoritative before validation** (deviates from MVP "score-only" plan)
- The locked MVP deferred detailed explanations *because they're hard to get right*. The product already ships AI speaking/writing evaluation (`api/evaluate-speaking.js`, `api/ai.js`) and a full diagnosis engine (`skillDiagnosis`, `studentFeedback`, `homeworkRecommendation`, `estimatedOverallScore`) on **real student PII under LGPD**.
- **Tutor lens**: AI eval of speaking/writing is inherently noisy. Presented as fact, it over-trains students on wrong signals. Product principle #3 must be enforced in the *UX*, not just the docs.
- **Fix**: Every AI output gets an explicit "AI-assisted · teacher-confirmed" frame + a confidence/disclaimer; never present `estimatedOverallScore` as a guaranteed prediction; keep the teacher as the decision-maker (the review UI already does this — good, make it visible to students).

**[P1] Supabase service-role key rotation STILL OPEN** (security carryover, `AUDIT-FIX-SUMMARY.md #4`)
- The exposed `sb_secret_…` was scrubbed from source but **not rotated** — it remains valid until you rotate it in the Supabase dashboard and set `SUPABASE_SERVICE_ROLE_KEY` in Vercel/Netlify. Under LGPD + real student voice/writing data this is the top security risk.
- Also: anon key hardcoded at `src/lib/supabase-storage.js:20-21` (browser-exposed by design, RLS-protected) — confirm RLS is airtight before relying on it.
- **Fix**: Rotate now; verify the old key is invalidated; re-run the lint gate.

### P2 — Minor / should-fix

**[P2] Drift: three parallel score/CEFR code paths** — consolidate into the single `met-scoring.ts` from P0.

**[P2] Dead twin token system** (cross-ref impeccable P2) — `index.css`/`main.tsx` green `#005344` vs live teal `#01796F`; Tailwind present but unwired. Two primaries in the repo = brand drift + silent wrong-color edits. **Fix**: delete the orphan or wire Tailwind deliberately; document `system.css` as the single source of truth.

**[P2] Cohort target 58/59 not encoded** — locked decision sets audience target **58 overall / 59 speaking**, but the platform has `targetScoreRelevance`/`estimatedOverallScore` fields with no hard-coded default. **Fix**: persist `TARGET_OVERALL=58`, `TARGET_SPEAKING=59` constants; use in goal messaging ("you're 5 points from your MET goal").

**[P2] LGPD mechanics unverified** — jurisdiction (GMT-3) is correct, but no visible consent capture at student claim, retention period, or data-subject **erasure** (delete student record + audio). You hold nurses' voice recordings + writing — sensitive PII. **Fix**: consent checkbox at roster claim; documented retention + deletion path; confirm Supabase region + DPO contact.

**[P2] Exam-surface UI slop residual** (cross-ref impeccable) — 115→4 detector hits remain (cramped padding, undersized text in `public/mock-test-*`); undersized text compounds reading difficulty for test-takers. **Fix**: finish the quieter/typeset pass.

---

## Positive Findings (keep doing these)

- **Faithful section scaffolding** — `src/lib/met-task-spec.js` models Speaking Q1–Q5 and Writing W1Q1-3 + W2 with structure, sentence frames, self-checks, and the common trap. Reading/Listening use 3 parts each. This is the platform's strongest pedagogical asset and matches `met-structure.md` exactly.
- **Sound domain architecture** — `src/core/domains/*` with scoring service, repositories, events, value objects; unit tests exist (`mock-test-scoring.service.test.ts`). Extensible and testable.
- **Security fixes landed** — PII dump + forged-JWT closed (see `AUDIT-FIX-SUMMARY.md`); lint gate green.
- **Healthcare-context content** aligns the audience (nurses/healthcare professionals).
- **AI provider cascade** (Gemini/OpenAI/Anthropic/Groq/OpenRouter) gives resilience.
- **Accessibility basics present** (aria-labels, heading hierarchy, reduced-motion) per impeccable audit.

---

## Recommended Next Actions (priority order)

1. **[P0]** Build single `met-scoring.ts`: raw → 0-80 scaled per section → average → official CEFR bands (cap C1, drop A1/C2). Wire to scoring service + `MockTestThanks`. Delete the 3 divergent calculators.
2. **[P1]** Rotate the Supabase service-role key; confirm old key invalid; re-verify RLS on the anon key.
3. **[P1]** Sanitize landing endorsement band, testimonials, and stats.
4. **[P1]** Add "AI-assisted · teacher-confirmed" framing + disclaimers on every AI output.
5. **[P2]** Encode `58`/`59` targets; add LGPD consent + erasure path.
6. **[P2]** Delete dead twin token system; finish exam-surface polish.

---

## Reference — official MET facts applied (from `references/met-structure.md`)

- Scaled **0-80 per section** + average; **no pass/fail**.
- CEFR by total: **0-39 A2, 40-52 B1, 53-63 B2, 64-80 C1** (scope A2–C1; **no C2/A1**).
- Listening: 3 parts (short convos / longer convos / talks). Reading: 3 parts (main idea / detail / inference+grammar).
- Speaking: 5 progressive tasks (describe picture → personal experience → opinion → adv/disadv → persuade). Writing: 2 tasks (short responses + formal essay), human-scored 0-4.
- Retake: single section, min 8 weeks study between attempts. **Re-verify exact equating cut scores against the official examinee manual before shipping.**
