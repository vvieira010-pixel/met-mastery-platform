---
target: contrast
total_score: 23
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 2
timestamp: 2026-09-04T11-43-26Z
slug: src-styles-tokens-css
---
# Critique: Color Contrast — tokens.css

Target: `src/styles/tokens.css` (MET Mastery palette)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | n/a silent-bg |
| 2 | Match System / Real World | 3 | jargon ok |
| 3 | User Control and Freedom | 3 | — |
| 4 | Consistency and Standards | 2 | palette drift vs DESIGN.md |
| 5 | Error Prevention | 3 | — |
| 6 | Recognition Rather Than Recall | 3 | — |
| 7 | Flexibility and Efficiency of Use | n/a | color token surface |
| 8 | Aesthetic and Minimalist Design | 3 | — |
| 9 | Error Recovery | n/a | not a task surface |
| 10 | Help and Documentation | n/a | not applicable |
| **Total** | | **23/28** | **Good (82%)** |

## Design Specificity Verdict
(narrative in chat)

## Contrast audit results (WCAG 2.2 AA)

PASS pairs:
- ink #022B3A on white: 14.90
- muted #1F7A8C on white: 4.98
- white on primary #1F7A8C: 4.98
- white on ink #022B3A: 14.90
- ink on lavender #E1E5F2: 11.84

FAIL pairs:
- muted #1F7A8C on lavender #E1E5F2: 3.95 (needs 4.5)
- teal #1F7A8C on pale-sky #BFDBF7: 3.48 (needs 4.5)
- info #1F7A8C on info-bg #BFDBF7: 3.48 (needs 4.5)
- lavender border #E1E5F2 on white: 1.26 (non-text/border — advisory)

## Priority Issues
- P1: muted text on lavender / teal-on-pale-sky / info-on-info-bg all fall 3.4–4.0, below 4.5 AA for normal text. Small UI text using --ink-muted against --bg-deep/--surface-hover or --info against --info-bg will fail.
- P1: DESIGN.md/PRODUCT.md still record old palette (primary #2D7A8C, accent #E08E45, bg #FDFCF8) while tokens.css ships new palette (#1F7A8C/#022B3A/#E1E5F2/#FFFFFF). Detector flags #119DA4, #1F2041, #FFC857 as "outside DESIGN.md."
- P2: --border #E1E5F2 at 1.26 vs white is intentionally subtle; fine for decorative borders but must never carry meaning/state.

## Persona Red Flags
- Sam (accessibility): muted/lavender and info/info-bg pairs at <4.5 fail AA; low-vision users lose secondary text and info chips.
- Riley (stress): the drift between DESIGN.md and live tokens means components pick up undocumented hues.

## Minor Observations
- --ink-muted #1F7A8C is a teal, not a neutral gray, so it carries brand weight in secondary text and doubles as info color — semantic overlap with --info.

## Questions to Consider
- Should muted secondary text be a neutral (gray) rather than teal, freeing teal for action/links only?
- Is the new palette intended to replace DESIGN.md (needs a document pass) or is it accidental drift?
