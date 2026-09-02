# Usability Test Plan: Practice Studio Flow

**Version:** 1.0  
**Date:** 2026-08-31  
**Author:** UX Research & Design  
**Status:** Ready for recruitment

---

## 1. Research Questions

| # | Question | Priority |
|---|----------|----------|
| RQ1 | Can users complete a practice session (kind → topic → exercises → results) without help? | Critical |
| RQ2 | Do users discover "Recent selections" quick-pick on return visits? | High |
| RQ3 | Is the breadcrumb useful for orientation and back-navigation? | Medium |
| RQ4 | Do users understand the difference between "Teacher Feedback" and "Practice Results"? | High |
| RQ5 | Where do users hesitate, backtrack, or express confusion? | Critical |

---

## 2. Method

| Attribute | Choice |
|-----------|--------|
| **Format** | Moderated remote (Zoom/Google Meet) |
| **Duration** | 45 minutes per session |
| **Participants** | 5 students (B1/B2 level, mixed exam proximity) |
| **Device** | Desktop (primary), mobile (1 participant) |
| **Recording** | Screen + audio + webcam (with consent) |
| **Incentive** | $50 gift card |

---

## 3. Participant Criteria

| Criterion | Target |
|-----------|--------|
| **Role** | Active MET Mastery student |
| **Proficiency** | B1 (2), B2 (3) |
| **Exam window** | ≤30 days (2), 31-90 days (2), >90 days (1) |
| **Practice frequency** | ≥2 sessions/week (3), <2 sessions/week (2) |
| **Tech comfort** | Comfortable with web apps |
| **Exclusion** | Teachers, admins, prior test participants |

**Recruitment source:** In-app banner + teacher referral + Slack community

---

## 4. Test Environment

- **Build:** Latest `main` branch deployed to `staging.metmastery.com`
- **Test accounts:** 5 pre-seeded student accounts with:
  - 3-5 completed practice sessions (varied modes/topics)
  - 1-2 teacher feedback items
  - Mixed streak counts (3, 7, 12, 1, 0 days)
- **Data reset:** Fresh account per participant (no cross-contamination)

---

## 5. Task Scenarios

### Task 1: First-Time Practice Selection (5 min)
> **Scenario:** "You have 20 minutes before your next class. You want to practice the skill that will help you most right now. Show me how you'd choose and start a practice session."
>
> **Success:** Reaches ExercisePlayer first question within 3 minutes
> **Metrics:** Time to first exercise, path taken (grid vs recent), hesitations

### Task 2: Return Visit — Continue Recent Practice (3 min)
> **Scenario:** "You practiced 'Grammar Sprint: Conditionals' yesterday and want to continue. Pick up where you left off."
>
> **Success:** Uses "Recent selections" quick-pick card
> **Metrics:** Notices recent section, clicks correct card, time to exercise

### Task 3: Switch Practice Mode Mid-Session (4 min)
> **Scenario:** "You're halfway through a Listening Lab but realize you'd rather do Vocabulary. Switch to a Vocab Deep-Dive on 'Academic Collocations'."
>
> **Success:** Uses breadcrumb → Practice Studio → Vocab → topic
> **Metrics:** Breadcrumb usage, backtracking steps, time

### Task 4: Review Practice Results (3 min)
> **Scenario:** "After finishing a session, you want to see your score and what you got wrong. Find your most recent practice result."
>
> **Success:** Navigates to Teacher Feedback tab → Practice Results section
> **Metrics:** Finds Practice Results section, reads score, identifies mode/topic

### Task 5: Distinguish Feedback Types (3 min)
> **Scenario:** "Your teacher left feedback on your last diagnosis. You also completed a practice session today. Which is which?"
>
> **Success:** Correctly identifies Teacher Feedback cards vs Practice Results cards
> **Metrics:** Verbal labeling accuracy, confusion points

### Task 6: Free Exploration (5 min)
> **Prompt:** "Spend a few minutes exploring anything you haven't tried yet. Think aloud."
>
> **Goal:** Uncover discoverability gaps, delight/friction moments

---

## 6. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Task 1 completion** | 5/5 | Reaches ExercisePlayer Q1 |
| **Task 1 time** | ≤3 min | Stopwatch |
| **Task 2 recent-pick usage** | 4/5 | Observation |
| **Task 3 breadcrumb usage** | 3/5 | Observation |
| **Task 4 Practice Results found** | 5/5 | Observation |
| **Task 5 correct labeling** | 5/5 | Verbal check |
| **SUS score** | ≥80 | Post-test questionnaire |
| **Critical issues** | 0 | Severity 4 (blocks task) |

---

## 7. Moderator Guide

### Introduction (3 min)
- "We're testing a new practice flow. No wrong answers — we're testing the product, not you."
- "Think aloud: say what you're looking for, what you expect, any confusion."
- Consent for recording

### Warm-up (2 min)
- "Show me your dashboard. What do you usually do first?"

### Task Loop (per task)
1. Read scenario aloud
2. "Start when ready"
3. Observe silently; only prompt if stuck >30s:
   - "What are you looking for?"
   - "What did you expect to happen?"
4. On completion: "How easy/hard was that? (1-5)"

### Post-Task Questions (per task)
- "What worked well?"
- "What was confusing?"
- "If you could change one thing..."

### Wrap-up (5 min)
- SUS questionnaire (10 items)
- "One thing you'd tell the team to fix"
- "One thing you liked"

---

## 8. Analysis Plan

### Within 24 hours per session
- Timestamped notes in shared doc
- Clip 30s video segments for each critical moment
- Severity rating per issue:
  - **4 — Critical:** Prevents task completion
  - **3 — Major:** Significant delay/frustration
  - **2 — Minor:** Hesitation, recoverable
  - **1 — Cosmetic:** Noted but not problematic

### After all 5 sessions
- Affinity map issues by theme
- Prioritize: Frequency × Severity × Fix Effort
- Top 5 fixes with owner + deadline

---

## 9. Deliverables

| Deliverable | Format | Deadline |
|-------------|--------|----------|
| Raw recordings | Cloud folder (access-controlled) | Session + 1 day |
| Annotated clips | 2-3 min highlight reel | Session + 2 days |
| Findings report | Notion page + PDF export | All sessions + 3 days |
| Prioritized backlog | GitHub issues (linked to repo) | All sessions + 3 days |
| Stakeholder walkthrough | 30-min sync | All sessions + 5 days |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Recruitment < 5 | Medium | High | Extend to teacher-referred + community; allow async unmoderated backup |
| Staging env bugs | Low | High | Smoke test 1 hour before each session |
| Participant no-show | Medium | Medium | Over-recruit to 7; 48h confirmation |
| Data contamination | Low | Medium | Fresh seeded account per participant |
| Participant fatigue | Low | Medium | 45 min cap; breaks allowed |

---

## 11. Ethical Considerations

- Informed consent form (GDPR-compliant)
- Right to withdraw at any time
- No PII in recordings (blur names/emails)
- Recordings deleted 90 days after report
- Incentive paid regardless of completion

---

## 12. Appendix: SUS Questionnaire

| # | Statement |
|---|-----------|
| 1 | I think that I would like to use this system frequently. |
| 2 | I found the system unnecessarily complex. |
| 3 | I thought the system was easy to use. |
| 4 | I think that I would need the support of a technical person to be able to use this system. |
| 5 | I found the various functions in this system were well integrated. |
| 6 | I thought there was too much inconsistency in this system. |
| 7 | I would imagine that most people would learn to use this system very quickly. |
| 8 | I found the system very cumbersome to use. |
| 9 | I felt very confident using the system. |
| 10 | I needed to learn a lot of things before I could get going with this system. |

**Scoring:** Odd items: (response - 1); Even items: (5 - response); Sum × 2.5 = 0-100.