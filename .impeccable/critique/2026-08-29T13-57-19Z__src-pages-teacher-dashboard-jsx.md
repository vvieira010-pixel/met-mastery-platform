---
target: teacher-dashboard
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-08-29T13-57-19Z
slug: src-pages-teacher-dashboard-jsx
---
# MET Mastery — Design Critique

> **Mode:** Operate · **Target:** `src/pages/teacher-dashboard.jsx` (primary surface) + holistic read of student dashboard, submission-review, shared UI, and the style system.

## Design Health Score: 24/40 (Acceptable)

| # | Heuristic | Score | Key Issue |
|---|-----------|:----:|-----------|
| 1 | Visibility of system status | 3 | Offscreen aria-live exists, but no visible loading affordance; KPI/filter actions give only chip-state feedback |
| 2 | Match system ↔ real world | 3 | "Good {timeOfDay}" + band tracking apt, but icons generic; no clinical vocabulary in chrome |
| 3 | User control & freedom | 2 | AI compare/evaluate overwrite teacher notes with no undo; no global undo |
| 4 | Consistency & standards | 2 | .btn radius pill (99px) reads playful vs clinical brief; Card bezel prop swallowed |
| 5 | Error prevention | 2 | Save allows empty feedback while sendFeedback true; AI fills unconfirmed |
| 6 | Recognition not recall | 3 | Icon+label pairs help, but Icon.spark overloaded; bands/section colors unexplained |
| 7 | Flexibility & efficiency | 2 | No keyboard shortcuts, bulk-review, or teacher command palette |
| 8 | Aesthetic & minimalist | 3 | Token system clean, but submission-review stacks everything in one column |
| 9 | Error recovery | 2 | AI failures only window.toast warn — non-blocking, no role |
| 10 | Help & documentation | 2 | ContextualHelp exists but not wired into teacher dashboard |

## Design Specificity Verdict
Category-generic, lightly re-skinned. DESIGN.md is specific on paper; implemented surfaces read as generic SaaS admin. square-card CRUD idiom reused verbatim. Only band notation, STAGE_CONFIG, and section colors anchor it to MET/nursing.

Deterministic scan: 222 findings, 0 errors, 2 warnings, 220 advisory (color 104, font-size 93, radius 23, side-tab 2). Corroborates "not reconciled to DESIGN.md" — entire CSS predates the doc. No contrast/layout/structural violations. 2 side-tab warnings are the one AI-slop tell.

LLM vs detector: A flagged .btn pill as P0 "violation" but DESIGN.md documents pill:99px, so not a system break — design-direction call. Detector missed nested interactive StudentRow and AI-overwrite-no-undo (semantic, outside its pattern set).

## Priority Issues
- [P0] Nested interactive controls in StudentRow (teacher-dashboard.jsx:322-344): Card div[role=button] wrapping a button. -> harden
- [P1] AI fills mutate teacher notes with no undo (submission-review.jsx:189-215,256). -> harden
- [P1] Teacher dashboard floods working memory (6 quick actions + 30+ board). -> layout
- [P1] No efficiency path for power teacher (no shortcuts/bulk/palette). -> optimize
- [P2] Status tones inverted (needs-diagnosis=danger, submitted=success). -> colorize
- [P2] Clinical Consult Room never materializes. -> shape/bolder
- [P2] Teacher dashboard no help/onboarding. -> onboard
- [P3] AI/async errors use window.toast no role. -> harden

## Persona Red Flags
- Alex: no accelerators/bulk/palette; AI overwrites curated notes; no next-action shortcut.
- Sam: nested interactive StudentRow (invalid, dual tab stops); KpiCard role=button only aria-label; unstyled confirm() focus trap; KPI values not Space Mono.
- Casey: Today page not mobile-composed; mock test no save-resume; sticky review bar is the one good concession.
- Priya (ESL nurse-teacher, 30+ students): 30+ rows overwhelm; needs-diagnosis danger reads as failure; B1->B2 assumes CEFR literacy; jargon no hint; AI Compare overwrites slow-typed notes no undo; no one-click accept-and-send.

## Minor Observations
- bg-grain undefined (dead). Card bezel prop discarded. Button secondary -> btn-outline inconsistency. mock-test.jsx:191 score sums only reading+listening. Native confirm() clashes with token UI.

## Questions to Consider
1. Frame submissions as evidence / diagnoses as clinical notes?
2. Redesign review around accept/reject/edit AI suggestions?
3. needs-diagnosis danger trains teachers to feel behind?
4. Teacher surface as queue not status board?
