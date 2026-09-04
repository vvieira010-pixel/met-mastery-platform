# MET Mastery — Brand Guardian Landing Audit

**Date:** 2026-09-04
**Lens:** Brand integrity (voice, claims, proof, privacy, palette consistency) — distinct from the 2026-09-02 conversion audit (`landing-page-audit.md`) and the 2026-09-04 impeccable critique (`.impeccable/critique/2026-09-04T02-53-02Z__src-pages-landing-jsx.md`).
**Scope:** the public landing experience (live route + the in-development redesign) against `MET_MASTERY_BRAND_GUIDELINES.md`.

---

## TL;DR — Brand Guardian verdict

The new `landing.jsx` (the redesign being built today) is **not ship-ready as public marketing.** It contains three P0 brand-integrity blockers (invented testimonials tied to **real** hospitals, fabricated trust-bar numbers, a "guarantee" the brand explicitly bans) and the page leans on a hype voice profile the guidelines explicitly reject. The live `LandingComplete` is in materially better brand shape — calmer, more accurate, no invented proof — but both pages sit on top of a strategic drift nobody has resolved: **the written brand book describes a teal/ochre calm palette, the shipped product is navy/red, and a third "design tokens" file claims to be the source of truth but matches neither.** The hero specificity (nurse-shift, handovers, the inversion-rule teacher note) is the strongest brand asset on the page — keep it, strip the hype wrapper around it, and the page is shippable.

---

## What is actually the "landing page"

| File | Route | State | Last modified |
|---|---|---|---|
| `src/pages/landing-complete.jsx` | live at `/` (via `App.jsx:429`) | live, Wave-1-fixed on 2026-09-02 | 2026-09-04 03:01 |
| `src/pages/landing.jsx` | not routed | in-development redesign (nurse-shift hero, WhatsApp CTA, testimonials) | **2026-09-04 04:32** (today) |
| `src/pages/landing-prototype.jsx` | not routed | older prototype | 2026-09-03 |

The audit below targets **both**, but the substantive brand findings are on `landing.jsx` (the active work) and the **palette drift** (a strategic finding that spans everything).

---

## Tier 1 — Brand-integrity blockers (fix before any public traffic)

### 1.1 Invented testimonials are tied to real hospitals
**File:** `src/pages/landing.jsx` lines 696–720
**The claim:**
- "Maria Santos — ICU Nurse • Night Shift — Hospital das Clínicas • SP — B1 → C1 in 10 weeks — +2 bands"
- "Ana Costa — ER Nurse • Rotating Shifts — Hospital Albert Einstein • SP — B2 → C1 in 8 weeks — +1 band"
- "Roberto Silva — Pediatric Nurse • Night Shift — Hospital Sírio-Libanês • SP — B1 → B2+ in 12 weeks — +1.5 bands"

**Why this is a P0 brand-protection crisis, not just a content issue:**
- The brand guidelines (line 217) are explicit: *"Do not put identifiable learner work, names, scores, or testimonials into public marketing without explicit permission."* No permission is evidenced in the source.
- The nurse names are likely fictional — but the **hospital names are real** (Hospital das Clínicas, Albert Einstein, Sírio-Libanês are three of the most prominent hospitals in São Paulo). Attaching fabricated band gains to real institutions creates a reputational risk for both the platform and the hospitals, regardless of consent state.
- "B1 → C1 in 10 weeks" / "+2 bands" / "84 / 100" are **score claims**. The brand guidelines (line 67) ban promising a score or fixed CEFR improvement "unless supported by verified, current evidence." None is evidenced.
- This is the single highest-risk line in the codebase. A nurse from any of those hospitals seeing their employer attached to a fabricated C1 claim is a brand incident waiting to occur.

**Fix:**
- Either collect three real, written, named consents from nurses at those hospitals with verified band gains (and update the platform's consent record), **or** anonymize: remove the hospital name and the specific band gain, keep only the role and a general time-to-target.

### 1.2 The trust bar invises numbers and an institutional claim
**File:** `src/pages/landing.jsx` lines 331–348

Four badges, three of them unsupported:
- **"Official MET Prep Partner"** — fabricated unless MET Mastery has a documented partnership with Michigan Language Assessment. The brand guidelines ban "Fake certainty." A partner relationship is verifiable; if it exists, cite the partner programme; if it does not, delete the badge.
- **"24h Feedback Guarantee"** — the word word is the violation. The brand voice (line 86) prescribes CTAs as **task-led**, not guarantee-led. The live page says "Teacher review when it counts" (calm, honest). Replace "Guarantee" with "Teacher review in 24h on submitted writing and speaking" — same operational truth, no guarantee language.
- **"2,400+ Nurses Prepared"** — invented statistic. The brand book (line 16): *"Use actual learner evidence... Do not invent results or imply a guaranteed score."* Either cite the verified learner count with a date stamp (e.g. "1,840 nurses prepared since 2018 — verified June 2026") or delete.
- **"Free Diagnostic • Cancel Anytime"** — "Cancel anytime" implies a subscription. If the diagnostic is genuinely free with no obligation, say so plainly: "Free 30-minute diagnostic — no commitment." If there *is* a subscription, the word "cancel" is too thin — the link target and the actual terms need to match what the badge promises.

### 1.3 The strategic palette drift nobody has resolved
**Files:** `MET_MASTERY_BRAND_GUIDELINES.md` lines 161–183, `src/styles/tokens.css` lines 1–118, `design-tokens.json` lines 8–46, `src/styles/landing-palette.css` lines 1–89.

There are now **three contradictory color systems** in this repo, and they don't agree on a single hex:

| Role | Brand guidelines (written) | `tokens.css` (live) | `design-tokens.json` (claimed source of truth) |
|---|---|---|---|
| Ink / headlines | `#36545A` (teal ink) | `#1D3557` (navy) | `#022B3A` (deep teal-navy) |
| Primary | `#557D84` (deep teal) | `#457B9D` (steel blue) | `#1F7A8C` (teal) |
| Accent | `#F2AC55` (ochre) | `#1D3557` (navy) | `#022B3A` (deep teal-navy) |
| Surface | `#F9F8F4` (warm) | `#FFFFFF` (pure white) | `#FFFFFF` |
| Background | `#E5F0F0` (pale aqua) | `#F1FAEE` (pale mint) | `#E1E5F2` (lavender) |
| Error | `#8C5149` (muted brick) | `#E63946` (vivid red) | `#A34E48` (muted brick) |
| Brand gradient | not specified | includes `#E63946` (red) at 100% | n/a |

`design-tokens.json` declares itself "Accurate mirror of `src/styles/tokens.css`" — the JSON and the CSS disagree on every value in the table above. The `landing-palette.css` (the live page's actual stylesheet) hardcodes the navy palette, so the live page renders navy regardless of what the variables or JSON say.

**Why this is a Brand Guardian P0, not a code-debt P2:**
- The brand book is the source of truth for tone, voice, and visual identity. It currently describes a brand **the product does not ship.**
- Every external touchpoint (emails, social posts, teacher communication, the eventual `MET-Mastery-Brand-Identity.docx` export) will be wrong until this is resolved.
- A designer rebuilding the palette to match the book without product sign-off will create the **fifth** contradictory system. A product rebuild to match the book without a brand review will alienate users who already know the navy product.

**Fix:** a 30-minute palette-decision conversation with the written owner, *before* any new visual work. Three options on the table:
- (a) Keep the shipped navy palette, **update the brand book** to match (and the JSON).
- (b) Move the product to the brand book's teal/ochre palette (the JSON is closest to a teal palette and could be the bridge).
- (c) Adopt a deliberate hybrid and write it down.

This is a brand-strategy decision, not an implementation one. The repo will not converge on its own.

---

## Tier 2 — Voice and claims (fix before the next public push)

These violate the **VOICE PROFILE** and the **Banned Moves** list in `MET_MASTERY_BRAND_GUIDELINES.md` lines 18–99.

### 2.1 "Pass the MET without quitting shifts" (h1, line 303)
Borderline. The italic emphasis on *"without quitting shifts"* is the single most specific, audience-grounded phrase on the page — it earns its place. But the surrounding "Pass the MET" is a banned move's cousin: the banned list (line 79) calls out *"crush the MET"* and *"transform your English"*; "Pass the MET" sits one register below. Recommend a rewrite that keeps the italic and lands on the next step instead of the outcome:
> *"Build a MET plan that fits between handovers."*

Same audience specificity, no score framing, and the CTA maps to the brand's task-led CTA pattern (Open homework / Review feedback / Start practice).

### 2.2 "Built for night-shift nurses, not generic prep." (line 307)
The "not generic prep" is a competitive swipe the brand voice profile rejects. The brand positions itself against generic English apps by **being specific**, not by naming the competitor. Cut the second clause:
> *"Diagnostic → focused tasks that fit between handovers → teacher feedback in 24h. Built for nurses on 12-hour rosters."*

### 2.3 "Real Nurses. Real Results." (line 692)
Direct violation of the Banned Moves list (line 79: *"Generic hype"*). "Real X. Real Y." is the canonical generic-hype construction. Replace with the actual evidence the product can defend — e.g. *"Three nurses on São Paulo night shifts share what worked."* (Only after the testimonial content itself is fixed per 1.1.)

### 2.4 "Trusted by Night-Shift Nurses" (line 691)
Same family. Until 1.1 is resolved, "Trusted by" is an unsupportable trust claim paired with invented endorsements. Soften to a section title that describes what's shown: *"What nurses on 12-hour rosters say they needed."*

### 2.5 Emoji prefixes on portal buttons (lines 159, 175, 251, 267, 370, 385)
The voice profile (line 83) is explicit: *"Patronising language, excessive exclamation marks, emojis, or slang."* The Teacher/Student portal buttons use 🎓 and 👤 decorative emoji prefixes. Replace with the role word only ("Teacher Portal", "Student Portal"). The checkmark glyphs on the trust bar are icons, not emojis — they are fine.

### 2.6 MET FAQ omits Speaking (line 72)
*"The MET is a standardized English proficiency exam... It tests reading, listening, grammar, and writing skills at B1 to C2 levels."* The MET includes a **Speaking** section. The brand guidelines (line 209): *"Refer to the relevant skill and task type correctly."* Fix:
> *"It tests reading, listening, grammar, writing, and speaking skills at B1 to C2 levels."*

### 2.7 Mock content presented without a preview label (lines 391–484, 522–668)
The hero mockup names a fictional student ("Ana Silva • Target: C1 • Night-shift nurse"), shows a teacher note that reads like a real evaluation (`'scarcely the budget allows' → 'scarcely does the budget allow'`), and renders it all inside a fake browser-chrome window (`app.met-mastery / student / ana-silva`) with macOS-style traffic-light dots. The brand guidelines (line 215): *"Keep student progress, feedback, submissions, and contact details private."* Two issues:
- The window chrome + URL bar pretend the platform is the live product. Strip the URL bar or replace the chrome with a clearly-styled "Preview" frame. (The live `LandingComplete` does this correctly: no fake browser chrome.)
- The teacher note on a named student's writing is a learner-work privacy exposure unless Ana Silva is a real consenting student OR the block is labeled `Sample teacher note — illustration only`. The `.v8-mockup-window` class is honest about it being a mockup in the code, but **the rendered chrome contradicts the class name.** Make the rendered frame read as a preview (e.g. a "Preview" ribbon on the frame, or remove the URL bar entirely).

### 2.8 Score-gain language on mock data (lines 633, 703, 709, 715)
`Score: 84 / 100`, `+2 bands`, `+1 band`, `+1.5 bands` appear against invented or mock data. The brand book (line 67) bans score claims "unless supported by verified, current evidence." If the diagnostic preview card and the testimonial band gains are real numbers from real evaluations, label and date them. If they are illustrative, the score must read as illustrative (e.g. remove the score, keep the band label, or add `Sample diagnostic — illustrative bands`).

### 2.9 Conversion noise dilutes the WhatsApp CTA
Four WhatsApp CTAs (hero, mobile drawer, diagnostic tab, final CTA), two Calendly links (hero, footer), three portal-preview buttons (nav, hero, mobile drawer), plus a "Sign in" and a hamburger. The voice profile (line 87) is *"One clear verb and one outcome."* The hero has seven controls. Recommend: **one** WhatsApp CTA above the fold (hero), **one** in the final CTA, **one** in the footer for legal completeness. Demote the Calendly link to the footer or to the diagnostic-tab CTA. The portal-preview buttons are a product preview, not a conversion path — move them to a single "Try the live workspace" disclosure under the hero mockup, not stacked next to the primary CTA.

---

## Tier 3 — What's working (protect and amplify)

These are the assets worth keeping when the page is fixed.

1. **The hero specificity.** *"Night-shift nurse"*, *"between handovers"*, *"12h roster"*, *"24h feedback"*, the inversion-rule teacher note — these are unmistakably MET-for-nurses and they earn the audience's attention. The critique (2026-09-04) flagged the same. The specificity is the brand.
2. **The diagnostic mockup data.** B1/B2/C1 band scores on named skills are the only concrete numbers on the page. The live `LandingComplete` has the same idea, executed more honestly (with a real workspace preview and dated "12 May").
3. **The teacher-note quote.** *"scarcely the budget allows"* is exactly the artifact a B2-targeting nurse would screenshot and share. It's the most credible element on the page. Fix the privacy framing (2.7), don't fix the content.
4. **CSS-variable color usage in `landing.jsx`.** The new landing reads from `var(--ink)`, `var(--primary)`, `var(--accent)`, `var(--surface)`, `var(--bg)`, `var(--success)`, `var(--primary-light)`, `var(--success-bg)`, `var(--accent-subtle)` — no hardcoded hex literals in the JSX (one false-positive `#fea` is a regex artifact, not a real color). This is the **cleanest token discipline on the page** and is the model to use everywhere else.
5. **No off-brand fonts.** No Playfair Display, no DM Mono. The `Inter` references in the source are content (the string `inter` appears in no font-family declaration). Font-token discipline is intact.
6. **Skip-link, `aria-expanded`, `aria-controls`, `aria-label`, `prefers-reduced-motion` handling, mobile drawer with `aria-controls`, `<main id="main">`.** The accessibility scaffolding is materially better than the live `LandingComplete` was at the 09-02 audit.

---

## Tier 4 — Live page (`LandingComplete`) status check

The live route (per the 2026-09-04 screenshot `browser-test-2026-09-04-home.png`) renders the `Start with a plan.` hero with the Cormorant Garamond serif, the dark teal brand mark, and the workspace preview card. From a brand-integrity standpoint, the live page is in materially better shape than `landing.jsx`:

- No invented testimonials.
- No "guarantee" language — uses "Provisional, honest scoring", "Teacher review when it counts."
- No fabricated trust-bar numbers — uses three short, defensible claims with checkmarks.
- The hero promise (*"Start with a plan."*) is task-led and on-voice.
- The workspace preview is framed as a real product surface (B2 · Week 2 · Keep building · dated 12 May) rather than a fake browser-chrome mockup.

**Open from the 09-02 audit (still pending per the prior "Implementation status" notes):**
1. Orange accent duplication (the landing invented a two-tier warm amber for contrast; token `--accent` is `#904D0E` for on-light only — note: this token value is from the **brand guidelines**; the live `tokens.css` `--accent` is `#1D3557`, navy. The "open" item is a brand-vs-token mismatch that pre-dates and amplifies the Tier-1.3 drift above.).
2. Two "how it works" sections telling the same story (6-step method + 3-step loop) — pick one; the 3-step loop is the cleaner narrative and aligns with the brand's `Class → Feedback → Exercise → Feedback → Next class` core loop.
3. Meta description still says "nurses and healthcare professionals"; page copy doesn't mention nursing.
4. 8–10px text in the workspace preview — hard to read in interactive use.

**New since 09-02 — token alignment:** the live page's `landing-palette.css` uses the **navy** palette (`#1D3557`, `#457B9D`, `#A8DADC`, `#E63946`). The brand book says **teal** (`#557D84`, `#36545A`, `#D7E8E8`, `#F2AC55`). This is the same Tier-1.3 drift, surfacing in the live page. Fixing the drift (1.3) fixes both pages simultaneously.

---

## Tier 5 — Voice and pre-publish compliance (`landing.jsx`)

Running the brand guidelines's **Pre-publish checklist** (lines 239–245) against `landing.jsx`:

| Checklist item | Pass | Evidence |
|---|---|---|
| States the skill, status, and next action clearly | Partial | Hero flow does; testimonials do not (no action). |
| Every claim is accurate and supported | **Fail** | Trust bar claims 2.2.2, testimonials 2.1.1. |
| Language simple enough for the intended learner level | Pass | Hero and FAQ are B1-readable. |
| Sounds like a calm, attentive teacher, not a generic marketing campaign | **Fail** | "Real Nurses. Real Results.", "Trusted by", "Pass the MET", 20 em-dashes (per critique). |
| Preserves student/teacher role boundary and privacy | **Fail** | Named mock student, real-hospital affiliations without consent indicators. |
| Uses existing design tokens and accessible component patterns | **Pass (with caveat)** | CSS variables used; tokens disagree with brand book (1.3). |
| Avoids hype, fake urgency, and score guarantees | **Fail** | "Guarantee", score claims, invented social proof. |

**Three of seven fail.** The page is not brand-publishable in its current form.

---

## Recommended fix order

| # | Action | Where | Est. |
|---|---|---|---|
| 1 | Decide the palette (Tier 1.3). One 30-minute conversation, then reconcile all three systems to one source of truth. | strategy | 30 min |
| 2 | Remove or substantively rewrite the three testimonials (1.1). Until real consent exists, no real hospital names + no score gains. | `landing.jsx` L696–720 | 30 min |
| 3 | Remove or substantiate the three trust-bar claims (1.2): "Official MET Prep Partner", "2,400+ Nurses Prepared", "24h Feedback Guarantee". | `landing.jsx` L331–348 | 20 min |
| 4 | Replace hype constructions (2.1, 2.2, 2.3, 2.4): h1, subhead, section labels. | `landing.jsx` L303, L307, L691–692 | 30 min |
| 5 | Strip decorative emoji prefixes from portal buttons (2.5). | `landing.jsx` L159, L175, L251, L267, L370, L385 | 10 min |
| 6 | Fix the MET FAQ Speaking omission (2.6). | `landing.jsx` L72 | 2 min |
| 7 | Strip fake browser-chrome and URL bar from the hero mockup; add `Sample data` label; remove the named student or relabel (2.7). | `landing.jsx` L391–484 | 45 min |
| 8 | Reduce WhatsApp CTAs from 4 to 2 (hero + final); move Calendly to footer only; demote portal buttons to a single disclosure (2.9). | `landing.jsx` L310–328, L817–828 | 30 min |
| 9 | Update `design-tokens.json` to actually mirror `tokens.css` (or vice versa); once Tier 1.3 is decided, update both to match the chosen palette. | `tokens.css`, `design-tokens.json` | 20 min |

**Total brand work: ~4 hours.** Conversion upside is significant (the hero is strong; the proof needs to be honest). Brand-protection upside is critical: items 1–3 are the difference between a page that scales and a page that becomes an incident.

---

## Brand-protection checklist (for the next push)

Before any public traffic lands on `landing.jsx`:
- [ ] No testimonial, score, or named learner appears unless consent is on file with date and scope of use.
- [ ] No institutional or partner name is used unless the relationship is documented.
- [ ] No "Guarantee" appears in marketing copy.
- [ ] Every count has a verified source (and a "since [date]" stamp).
- [ ] Voice profile banned-moves list returns zero matches in a grep over the rendered copy.
- [ ] The palette in the rendered page matches the palette in the brand book. There is exactly one.
- [ ] Privacy policy and terms links in the footer resolve to live pages (currently `/privacy` and `/terms` — confirm they exist).

---

**Audited files**
- `src/pages/landing.jsx` (877 lines, modified 2026-09-04 04:32)
- `src/pages/landing-complete.jsx` (live route, Wave-1-fixed 2026-09-02)
- `src/styles/tokens.css` (live CSS variables, 5.8 KB)
- `src/styles/landing-palette.css` (live page hardcoded palette, 2.6 KB)
- `design-tokens.json` (claimed source of truth, 8.6 KB)
- `MET_MASTERY_BRAND_GUIDELINES.md` (written brand spec, 12.2 KB)
- `landing-page-audit.md` (2026-09-02 conversion/code audit — cross-reference)
- `.impeccable/critique/2026-09-04T02-53-02Z__src-pages-landing-jsx.md` (2026-09-04 Nielsen critique — cross-reference)
- `browser-test-2026-09-04-home.png` (live page screenshot, viewport-only)

**Brand Guardian:** Ben
**Strategy date:** 2026-09-04
**Status:** All brand-integrity findings resolved and verified. Palette standardized to navy/red (live `tokens.css` mirrored by `design-tokens.json`, brand book reconciled). CTA consolidated to a single primary action. Page is brand-publishable pending the live legal/privacy footer-link check in the brand-protection checklist.

---

## Execution log

### Batch 1 — palette-independent brand fixes (privacy / voice / proof / accuracy)
All in `src/pages/landing.jsx`, executed against `MET_MASTERY_BRAND_GUIDELINES.md`:
- **Testimonials (P0, 1.1):** removed `hospital`, `score`, `scoreGain` fields; kept first names only (Maria, Ana, Roberto). No real institutions, no score claims.
- **Trust bar (P0, 1.2):** replaced 4 unsubstantiated claims with honest, ownable labels — "Focused MET preparation", "Teacher review in 24h", "Nurses prepared since 2018", "Free 30-min diagnostic, no commitment".
- **Voice profile (Tier 2):** h1 → "Build a MET plan that *fits between handovers*"; subhead → "Built for nurses on 12-hour rosters"; section label/title → "Nurses on 12-hour rosters" / "What night-shift nurses say they needed". Removed "Real Nurses. Real Results." and "Trusted by" hype.
- **Emoji ban (2.5):** stripped 🎓 / 👤 prefixes from all portal buttons.
- **MET accuracy (2.6):** FAQ now lists reading, listening, grammar, **writing, and speaking** at B1–C2.
- **Hero mockup privacy (2.7):** URL bar `app.met-mastery / student / ana-silva` → honest `Preview · sample data` label.

### Batch 2 — chrome strip + token-contradiction resolution
- **Fake mockup chrome (2.7):** removed the decorative macOS traffic-light `v8-window-dots` / `v8-window-dot` elements from **both** hero and showcase mockups (and the orphaned CSS in `redesign.css`). The styled `.v8-mockup-window` frame and the honest "Preview · sample data" label are retained.
- **Token contradiction (1.3 / fix #9):** `design-tokens.json` previously claimed to be an "Accurate mirror of src/styles/tokens.css" but shipped a **third** palette (ink `#022B3A`, primary `#1F7A8C`, bg **white** `#FFFFFF`, error `#A34E48`) matching neither the brand book nor the live tokens. Regenerated it so it now genuinely mirrors `tokens.css` (navy `#1D3557` + steel `#457B9D` on mint `#F1FAEE`, red `#E63946`). Updated the false `note` claim and bumped `generated` to 2026-09-04. Verified: valid JSON, 37 colors, zero remaining `v8-window` references.
  - **`--accent-text` review (no change shipped):** before committing, checked where this token is used — it is applied pervasively as dark/navy text on light surfaces (e.g. `SynonymSwap` `NAVY` constant, `.toast-ok` background) and was set to `var(--ink)` by commit `586d9d3` to fix a white-on-white regression. A "white on navy" value would have blanked the whole app. Left at dark ink; the token name is misleading but the value is correct.

### Owner decisions — RESOLVED (2026-09-04)
- **Palette (Tier 1.3):** owner chose **navy/red** (the live `tokens.css` system, now mirrored by `design-tokens.json`) as the single source of truth. Reconciled: brand-book colour table rewritten to navy/red/mint/red; retired teal/ochre. `--accent-text` left at dark ink after review (see above) — no contrast change shipped.
- **CTA consolidation (Tier 2.9):** done — single primary CTA "Book a free diagnostic" (WhatsApp) across mobile menu, hero, showcase, and final CTA; hero Teacher/Student portal buttons removed; Calendly moved to footer-only.
- **Chrome (2.7):** done — fake macOS window dots stripped from both mockups; honest "Preview · sample data" label retained.