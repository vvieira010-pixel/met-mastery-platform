# Label book — v0 (fill this in before labeling)

**Status: TEMPLATE.** This file is empty on purpose. It gets filled during Phase 0
by the teacher (the only rater), and it is the highest-leverage artifact in the
whole measurement program: two people scoring consistently beats any modeling work
you could do instead.

Rules for using it:

1. Score **one dimension at a time** across all samples. Do not read the response
   holistically and then justify. Dimensional scoring is measurably more reliable.
2. Do not look at your pass-1 scores during pass 2. The exporter gives the two
   passes different display IDs for exactly this reason.
3. When you hesitate between two bands, pick the lower one **and** write the
   hesitation in `comments`. Hesitation data is where the label book grows.
4. Every anchor below must eventually be a real response from this cohort, with
   the sample_id. Generic descriptions do not calibrate anyone.

---

## Scale

All dimensions: **0.0 – 4.0 in 0.5 steps** (matches the MET Speaking Rating Scale
implemented in `api/_met-speaking-scale.js`).

## Writing dimensions

| Dimension | What it measures |
|---|---|
| `task` | Did the response do what the prompt asked? Coverage, relevance, register, length. |
| `organization` | Paragraphing, cohesion, discourse markers, logical order. |
| `language` | Range and accuracy of grammar and vocabulary. Errors that impede meaning cost more than errors that don't. |

## Speaking dimensions

| Dimension | What it measures |
|---|---|
| `task` | Completeness and relevance of the response to the prompt. |
| `language` | Range and control of grammar and vocabulary in speech. |
| `delivery` | Intelligibility, fluency, rhythm. **Use the acoustic facts line** (wpm, pause counts) — not a re-reading of the transcript. |

---

## Anchors — fill each cell

Add the sample_id and a one-line justification. Two anchors per band is the
minimum; three is better.

### Writing — task

| Band | Anchor response | Why this band |
|---|---|---|
| 4.0 | _(sample_id —)_ | |
| 3.0 | _(sample_id —)_ | |
| 2.0 | _(sample_id —)_ | |
| 1.0 | _(sample_id —)_ | |
| 0.0 | _(sample_id —)_ | |

### Writing — organization

| Band | Anchor response | Why this band |
|---|---|---|
| 4.0 | | |
| 3.0 | | |
| 2.0 | | |
| 1.0 | | |
| 0.0 | | |

### Writing — language

| Band | Anchor response | Why this band |
|---|---|---|
| 4.0 | | |
| 3.0 | | |
| 2.0 | | |
| 1.0 | | |
| 0.0 | | |

### Speaking — task / language / delivery

| Band | task anchor | language anchor | delivery anchor |
|---|---|---|---|
| 4.0 | | | |
| 3.0 | | | |
| 2.0 | | | |
| 1.0 | | | |
| 0.0 | | | |

---

## Known hard cases

Record the responses that keep causing disagreement. These become the calibration
set you re-score every quarter to check that the label book still holds.

| sample_id | Why it is hard | Agreed resolution |
|---|---|---|
| | | |

---

## Known bias traps (check before finalizing)

- **Length bias** in writing: longer is not better. A 300-word response that
  repeats itself is not a 4.
- **Accent bias** in speaking: `delivery` is intelligibility, not nativeness. If
  the transcript is accurate and the rhythm is steady, a marked L1 accent does
  not lower the score.
- **Topic familiarity**: healthcare topics will read as stronger from nurses.
  That is content knowledge, not language — score the language.
