---
target: the landing page
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 3
timestamp: 2026-09-04T02-53-02Z
slug: src-pages-landing-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Sticky nav shadow is the only status; WhatsApp launch silent after click |
| 2 | Match System / Real World | 3 | "Handovers", "12h roster", inversion rule, night-shift language = audience idiom |
| 3 | User Control and Freedom | 2 | Mobile drawer lacks Esc-to-close; no skip-to-section, only skip-to-main |
| 4 | Consistency and Standards | 3 | Token system honored; nav-link emoji prefixes (🎓/👤) clash with editorial tone |
| 5 | Error Prevention | 3 | No destructive paths; WhatsApp number hardcoded but correct |
| 6 | Recognition Rather Than Recall | 3 | Nav mirrors section IDs; showcase tabs self-document |
| 7 | Flexibility and Efficiency | n/a | Landing page — not applicable |
| 8 | Aesthetic and Minimalist Design | 2 | 6 feature cards + 4 process steps + 2 showcase tabs tell the same story three times |
| 9 | Error Recovery | 2 | No fallback if WhatsApp fails; no email alternative surfaced |
| 10 | Help and Documentation | n/a | Landing page — not applicable |
| **Total** | | **20/32** | **Acceptable (62.5%)** |

## Design Specificity Verdict

**LLM assessment: Partial-specific, structurally generic.**

The hero carries real product character — "Pass the MET without quitting shifts" + "between handovers" + "Night-shift nurse" + the inversion-rule teacher note are unmistakably MET-for-nurses. The 24h feedback promise is triple-anchored. But the rest is a stock SaaS template: Hero → Tabbed Showcase → 6-Card Feature Grid → 4-Step Process → FAQ → CTA → Footer. The 6 features ("Practise with purpose", "Review what matters") are interchangeable with any ed-tech. Process duplicates features. The two strongest artifacts (teacher note, diagnostic band) appear once each and never recur. The page trades the thing that would sell a skeptical nurse — proof other nurses passed — for a generic value-prop list.

**Deterministic scan:** Detector returned 0 findings on landing.jsx itself. Wider `src/` scan: 689 findings — 354 design-system-color, 239 design-system-font-size, 78 design-system-radius, 8 side-tab, 6 overused-font. The token system is violated pervasively in components outside the landing page, which corroborates "tokens exist on paper, components improvise around them."

**Where assessments agree:** feature duplication, hero strength, repetition of the WhatsApp CTA (4 instances).
**Where the detector missed what LLM caught:** fake-mockup divs, 20 em-dashes, 17 eyebrow labels — none of these are detector rules, all confirmed by static source scan.
**False positives:** none flagged.

**Static source scan highlights (landing.jsx):**
- 20 visible em-dashes (lines 286, 301, 306, 315, 332, 396, 410, 421, 431, 439, 446, 513, 514, 592, 610, 625, 762) — the single densest AI tell on the page
- 17 `v8-label` eyebrow overlays — over the whole page, way past the 1-per-3-sections ceiling
- Two hand-rolled mockup windows (`v8-mockup-window` lines 372-465, 502-649) with fake URL bars — the #1 div-based fake-screenshot tell
- "Book a MET diagnostic" appears 4 times; same-intent repetition
- No version labels, no scroll cues, no locale/weather strips — clean there

## Overall Impression

A page with one strong product voice (the nurse-shift hero and the teacher annotation) wrapped around two sections that could belong to any ed-tech product. The single biggest opportunity: replace the abstract feature grid with the proof artifacts already inside the showcase mockups.

## What's Working

1. **Hero specificity.** The teacher note in the mockup ("scarcely does the budget allow" — inversion after negative adverbial) is the single most credible element; the exact artifact a B2-targeting nurse would screenshot.
2. **24h feedback promise triple-anchored** (hero subtitle, mockup header, fine print) — concrete and rare in the category.
3. **Showcase surfaces real diagnostic data** (B1/B2/C1 band scores) — the only numbers on the page that make "diagnostic" tangible.

## Priority Issues

- **[P0] No risk-reversal for "what if I fail the MET?"**
  Why: high-stakes buyers asked to WhatsApp a stranger with zero proof anyone passed.
  Fix: 3-quote testimonial strip from named nurses with band gains; pull "free 30-min diagnostic" out of 11px fine print next to the H1.
  Suggested command: `/impeccable bolder`

- **[P0] Feature grid is category-interchangeable**
  Why: the actual product (inversion drills, 24h teacher notes, band diagnostics) hides inside the showcase.
  Fix: replace the 6 abstract cards with 6 concrete MET artifacts — handover task screenshot, real feedback snippet, mock-test result card, band chart, async calendar slice, inversion callout.
  Suggested command: `/impeccable distill`

- **[P1] Process section duplicates the feature grid**
  Why: two sections tell the same story; costs scroll budget.
  Fix: delete the 4-step process or recut around the nurse's week ("On shift → Between handovers → After handover → Next shift start").
  Suggested command: `/impeccable polish`

- **[P1] Hero button density crowds the primary CTA**
  Why: 7 controls above the fold split attention; the WhatsApp CTA loses weight.
  Fix: demote portal previews to a text link; move Sign in to top-right; keep "Book a MET diagnostic" as the only filled button.
  Suggested command: `/impeccable clarify`

- **[P1] Two hand-rolled fake mockup windows**
  Why: div-based fake product UI is a strong AI tell; the content inside them is good, the frame is the problem.
  Fix: replace with real screenshots of the actual product, or keep content but strip the browser-chrome frame (fake URL bar, window dots).
  Suggested command: `/impeccable polish`

## Persona Red Flags

**Jordan (first-timer, Brazilian nurse, hasn't booked anything):**
- No price anywhere; commits to WhatsApp with no cost scope
- FAQ "How long does MET preparation take?" answers "It depends"
- No band-target guide (B1 vs B2 vs C1) even though C1 appears in the mockup
- Brand mismatch: page title "MET Proficiency Platform", wordmark "MET Mastery", footer "MET MASTERY PLATFORM"

**Riley (stress-tester, ICU nurse, 4 weeks to test date):**
- Page asks for a long scroll despite promising "no fixed class"
- 24h promise has no proof (no count, no SLA badge, no recent turnaround)
- No sample exercise to try without signing in
- Hero promise undercut by marketing-essay length

**Casey (mobile, one-handed, between handovers):**
- 6+ controls stacked in hero; fat-finger risk on portal buttons
- Showcase tab UI is a pill inside a bezel inside a card on a 6" screen
- WhatsApp deep link assumes WhatsApp installed; no email fallback for hospital Wi-Fi

## Minor Observations

1. Brand-name strings: 4 variants on one page (title vs wordmark vs footer vs OG tags).
2. Same teacher-note anecdote verbatim in two places (line 437 and line 619).
3. Showcase is centered; its inner content is left-aligned — micro-rhythm break.
4. `WHATSAPP_URL` hardcoded to +55 number, no language toggle.
5. Last FAQ repeats the hero CTA verbatim — wasted slot.
6. Stale comments at lines 536-541 reference Tab 3 / Tab 4 that don't exist.

## Provocative Questions

1. What if the page ended on a face — a named nurse, band gain, hospital, week-count — instead of a button?
2. What if the teacher-note WAS the page: "Here is what a teacher writes on your writing. Here is another. Want your own?"
3. What does the 60-second Casey cut look like — one between-handover scroll?
4. If only 2 of the 6 features could survive, which two — and is the page honest about that?
