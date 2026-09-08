## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Badge + tinted header show result instantly. Minor: no animated transition when result appears. |
| 2 | Match System / Real World | 3 | ✓/✗ universal. "—" for skipped is ambiguous (not attempted vs skipped). |
| 3 | User Control and Freedom | 3 | Back button works. Review flow allows re-attempt. |
| 4 | Consistency and Standards | 3 | Token-consistent. Minor: --ex-hint-bg (amber) used for skipped — unrelated concept. |
| 5 | Error Prevention | 2 | No undo after submission. No confirmation guard on Submit. |
| 6 | Recognition Rather Than Recall | 4 | Indicator row is a pure recognition aid — see all results at once. |
| 7 | Flexibility and Efficiency | 3 | Keyboard nav works. No Enter/Space shortcut to advance after result. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, minimal. 3px left border is economical. |
| 9 | Error Recovery | 3 | Incorrect state clear. But no indication of why at card level — must scroll to body. |
| 10 | Help and Documentation | 2 | No legend for indicator boxes. First-time users guess ✓/✗/— meaning. |
| **Total** | | **28/40** | **Good** |

## Design Specificity Verdict

Category-interchangeable with caveats. The ✓/✗ badge pattern and indicator grid are generic quiz-app idioms. Nothing authored for MET Mastery's aesthetic. Acceptable for drill context. Missed opportunity to differentiate.

## What's Working

1. The 3px left border — communicates completion state with zero vertical space cost.
2. The indicator row — students scan all results at a glance. aria-label on each box is correct accessibility.
3. Token discipline — all new colors use existing tokens. Zero ad-hoc hex values.

## Priority Issues

P0: --ex-wrong-* tokens undefined in light mode. Add :root definitions to tokens.css.

P1: Badge background defaults to red for skipped exercises. Add third ternary branch for muted.

P2: ScoreSummary is emotionally flat. Differentiate tone by score (celebratory/constructive/supportive).

P2: --ex-hint-bg used for skipped indicator boxes. Use neutral token instead.

P3: No role="status" on ScoreSummary. Add role="status" aria-live="polite".

## Persona Red Flags

Sam (Accessibility): No role="status" means screen reader won't announce "Session Complete".

Casey (Mobile): At 30+ exercises, indicator row wraps with no cap. No keyboard shortcut to advance.

## Minor Observations

Line 189: --ex-wrong-text as border on light surface has low contrast. Use --ex-wrong-border.

Line 428: Filter out zero-count categories from breakdown text.

Line 397: ScoreSummary border amber vs heading teal — color mismatch.

## Questions to Consider

1. Should ScoreSummary differentiate tone by score?
2. Should indicator boxes be tappable to jump to that exercise in review?
3. Should there be a keyboard shortcut (Enter) to advance after result?
