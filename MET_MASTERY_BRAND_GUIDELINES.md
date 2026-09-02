# MET Mastery brand guidelines

**Purpose:** A practical reference for product UI, learning materials, emails, social posts, and teacher communication.

**Positioning:** MET Mastery is a focused learning workspace for Michigan English Test preparation. It helps learners turn an individual diagnosis into clear practice, feedback, and the next useful step. It is not a generic English-learning app or a score-guarantee service.

## Brand foundation

| Element | Guideline |
| --- | --- |
| Promise | Clear, focused MET preparation with visible next steps. |
| Primary audience | Learners preparing for the Michigan English Test, usually working toward a specific CEFR level. |
| Secondary audience | The teacher, who needs a calm workspace for feedback, homework, progress, and class planning. |
| Core learning loop | **Class → Feedback → Exercise → Feedback → Next class**. |
| Brand feeling | Calm, capable, personal, structured, and encouraging without becoming childish. |
| Proof standard | Use actual learner evidence, completed work, evaluated feedback, and verified outcomes. Do not invent results or imply a guaranteed score. |

## VOICE PROFILE

```text
VOICE PROFILE
=============
Author: MET Mastery
Goal: Help a learner see what to do next for the MET, while giving the teacher
      clear, credible operational language.
Confidence: Medium-high for product copy and UI; lower for public marketing,
            because the strongest sources are current in-product copy.

Source Set
- Student dashboard: "Small steps, repeated well.", "Your next steps",
  task status, feedback, homework, and progress copy.
- Login and access screens: direct sign-in instructions and account recovery.
- Product landing page: diagnosis, personalized plan, four-skill preparation,
  and the journey from diagnosis to exam day.
- Existing product design tokens and shell labels: "Student space" and
  "Teacher workspace".

Rhythm
- Short to medium sentences. One idea per sentence.
- Use compact labels in UI: "View progress", "Open homework", "Next class".
- Explain the reason only when it helps the learner act.

Compression
- Practical and specific. Prefer the next action, skill, date, or evidence
  over broad motivational language.
- Give a little context before a task; do not write dense explanations.

Capitalization
- Conventional sentence case for normal copy.
- Use title case sparingly for navigation, page titles, and named programmes.
- Small uppercase labels are allowed as visual hierarchy, not as the default
  written voice.

Parentheticals
- Use only for a brief clarification that prevents confusion, such as
  "provisional Reading and Listening result".
- Do not use parentheticals for jokes, vague disclaimers, or extra sales copy.

Question Use
- Use direct questions only when asking the learner to reflect or choose an
  action: "Which skill needs attention this week?"
- Do not use rhetorical or bait questions in headlines.

Claim Style
- Be accurate and evidence-led. Say what the platform does and what is known.
- Use "based on your evaluated work" rather than "we know exactly".
- Never promise a score, visa outcome, university acceptance, or fixed CEFR
  improvement period unless supported by verified, current evidence.

Preferred Moves
- Name the skill: listening, reading, writing, speaking, grammar, vocabulary.
- Name the action: review, practise, submit, compare, prepare, ask.
- Connect work to the learning loop: feedback becomes the next exercise.
- Use friendly teacher language: calm, clear, direct, and respectful.
- State uncertainty honestly: "Waiting for teacher review" or
  "Teacher will confirm".

Banned Moves
- Generic hype: "unlock your potential", "transform your English", "crush the MET".
- Empty urgency: "Don't miss out" or "start your journey today".
- Corporate jargon: "ecosystem", "synergy", "cutting-edge" in learner copy.
- Fake certainty, invented testimonials, or unverified statistics.
- Patronising language, excessive exclamation marks, emojis, or slang.
- Long motivational paragraphs where a next step would be more useful.

CTA Rules
- One clear verb and one outcome.
- Product CTAs should be task-led: "Open homework", "Review feedback",
  "Start practice", "Message your teacher".
- Marketing CTAs can invite a concrete conversation: "Book a MET diagnostic"
  or "Ask about the next preparation group".

Channel Notes
- X: One concrete insight, teaching observation, or useful MET tip. Keep it
  short; avoid hooks that manufacture drama.
- LinkedIn: Lead with a classroom or learner problem, explain the teaching
  mechanism, and end with a quiet, specific invitation.
- Email: Friendly teacher voice. State why you are writing, the next action,
  and any deadline or preparation needed in the first few lines.
```

## Audience modes

### Student-facing copy

Write in simple, supportive English. The learner should understand what happened, why it matters, and what to do now.

- Use **you** and active verbs.
- Prefer short labels and short paragraphs.
- Be honest about incomplete work and pending teacher review.
- Make feedback specific to the task or skill.
- Encourage consistency, not perfection.

**Good**

> Your writing feedback is ready. Review the two changes first, then try the short correction exercise.

> You have 3 review items due. They are small, but completing them now will make the next class easier.

> Your Listening result is provisional. Writing and Speaking still need teacher review.

**Avoid**

> You are one step closer to unlocking your full potential!

> Our revolutionary AI will transform your learning journey.

### Teacher-facing copy

Be concise, specific, and operational. The teacher needs the relevant learner, status, evidence, and next action.

- Lead with the status or data point.
- Use neutral professional language; avoid vague praise or alarm.
- Preserve the learner's dignity—describe work and evidence, not personality.
- Distinguish **submitted**, **reviewed**, **approved**, and **awaiting action**.

**Good**

> 4 homework submissions are ready for review.

> The student has completed the grammar exercise. Add feedback before assigning the next writing task.

> Progress is based on evaluated evidence. No conclusion is available yet for Speaking.

## Messaging framework

Use this sequence whenever copy asks the learner to do something:

1. **Status:** What is ready, due, changed, or missing?
2. **Meaning:** Which skill or learning goal does it affect?
3. **Next step:** What should the learner do now?
4. **Support:** Where can they get help if needed?

Example:

> Your teacher has reviewed your speaking task. Your main focus is organizing longer answers. Open the feedback, then practise the follow-up question. Send a message if any comment is unclear.

## Visual identity

### Colour

Use the existing design tokens. Do not add arbitrary colours for a new screen or campaign.

| Role | Token / value | Use |
| --- | --- | --- |
| Deep teal | `--primary` / `#557D84` | Main actions, links, active states, and structural emphasis. |
| Primary hover | `--primary-hover` / `#41666D` | Hover and pressed primary actions. |
| Teal ink | `--ink` / `#36545A` | Headlines, dark brand panels, and strong contrast. |
| Warm surface | `--surface` / `#F9F8F4` | Cards and calm content areas. |
| Pale aqua background | `--bg` / `#E5F0F0` | Page backgrounds and quiet layout structure. |
| Soft blue-green | `--primary-light` / `#D7E8E8` | Selected states, soft highlights, low-intensity emphasis. |
| Ochre accent | `--accent` / `#F2AC55` | Small moments of emphasis, key numbers, and visual warmth. |
| Success | `--success` / `#557D84` | Completed work and confirmed success only. |
| Warning | `--warning` / `#B27A3E` | Attention needed without panic. |
| Error | `--error` / `#8C5149` | Failed, blocked, or destructive states. |

Rules:

- Teal signals direction or action; it is not decoration everywhere.
- Keep strong colour areas purposeful. Most screens should remain warm, open, and readable.
- Do not use success green to represent a score unless it is genuinely a completed/success state.
- Never rely on colour alone: pair statuses with plain-language labels and appropriate icons.

### Typography

| Role | Font token | Guidance |
| --- | --- | --- |
| Product and body | `--font-sans` — DM Sans, then Inter | Default for all product copy; readable and modern. |
| Editorial emphasis | `--font-serif` — Cormorant Garamond, then Georgia | Use rarely for a meaningful display moment, never for dense UI. |
| Data, IDs, and compact evidence | `--font-mono` — Space Mono | Use for codes, dates where appropriate, and technical metadata. |

- Keep body text at `--text-sm` or larger where possible.
- Use a clear heading hierarchy; do not use bold alone to create structure.
- Avoid all-caps sentences. Uppercase labels should be short, such as `NEXT STEP`.

### Layout and components

- Use soft cards, 8–20 px radii, light borders, and restrained shadows.
- Prioritise the next action above secondary insight or decoration.
- Let task states be scannable: task, status, deadline/context, action.
- Use the shared shell pattern: visible brand, clear role label, consistent navigation, and a reliable sign-out route.
- Preserve responsive behaviour. Student tasks must remain simple to scan and complete on a phone.
- Respect reduced-motion preferences; motion should confirm interaction, not create spectacle.

## Content standards

### MET accuracy

- Refer to the relevant skill and task type correctly.
- Use CEFR labels carefully and only in their proper context.
- Label provisional results clearly; do not present practice or partial marking as an official result.
- Separate automated feedback from teacher evaluation when both are present.

### Privacy and trust

- Keep student progress, feedback, submissions, and contact details private.
- Do not put identifiable learner work, names, scores, or testimonials into public marketing without explicit permission.
- Do not expose teacher-only notes in student-facing surfaces.

### Accessibility

- Prefer plain English, informative labels, visible focus states, and useful error messages.
- Give every meaningful icon a text label or accessible name.
- Avoid instructions that depend only on position, colour, or animation.
- Use descriptive links and buttons: `Review feedback`, not `Click here`.

## Ready-to-use examples

| Situation | Use this | Avoid this |
| --- | --- | --- |
| Homework due | `Your vocabulary homework is due Friday. Start with Part 1; it takes about 10 minutes.` | `Time is running out!` |
| Feedback ready | `Your feedback is ready. Focus first on linking ideas in longer answers.` | `Amazing work—check your feedback!` |
| No data yet | `No evaluated work yet. Complete one practice task to begin building your progress view.` | `Your progress is empty.` |
| Teacher message | `I reviewed your task. Please correct the three marked sentences before our next class.` | `You need to improve your grammar.` |
| Public offer | `MET preparation with a diagnostic, focused practice, and teacher feedback.` | `The complete ecosystem to guarantee MET success.` |

## Pre-publish checklist

- [ ] Does this state the skill, status, and next action clearly?
- [ ] Is every claim accurate and supported?
- [ ] Is the language simple enough for the intended learner level?
- [ ] Does it sound like a calm, attentive teacher—not a generic marketing campaign?
- [ ] Does it preserve the student/teacher role boundary and privacy?
- [ ] Does it use the existing design tokens and accessible component patterns?
- [ ] Does it avoid hype, fake urgency, and score guarantees?

## Source of truth

For implementation, treat [`src/styles/tokens.css`](src/styles/tokens.css) as the visual-token source of truth. When a proposed campaign or product change conflicts with the real learning flow, keep the learning flow clear first.
