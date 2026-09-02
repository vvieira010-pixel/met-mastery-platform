# Journey Map: B2 Student — 30 Days to MET Exam

**Persona:** "Ambitious Alex"  
**Profile:** 28, software engineer, B2 level, targets B2+ (C1), 30 days until exam  
**Goal:** Pass MET with B2+ score to meet employer requirement  
**Context:** Studies 45 min/day on weekdays, 2 hrs weekends; uses desktop + phone  

---

## Journey Stages (End-to-End)

```
Awareness → Onboarding → Daily Practice → Midpoint Check → Final Sprint → Exam Day → Post-Exam
```

---

## Detailed Stage Map

### Stage 1: Awareness & Setup (Days -30 to -28)

| Layer | Details |
|-------|---------|
| **User Actions** | Receives employer email: "MET B2+ required by [date]"; searches "MET prep"; lands on MET Mastery landing page; clicks "Get Started"; creates account via Google OAuth |
| **Touchpoints** | Landing page → Signup → Onboarding flow → Dashboard |
| **Emotions** | 😰 Anxious (deadline pressure) → 🤔 Skeptical (will this work?) → 😊 Relieved (clear path) |
| **Pain Points** | - Onboarding doesn't ask "when is your exam?"<br>- No diagnostic auto-schedule suggestion<br>- "Practice Studio" label unclear vs "Mock Test" |
| **Opportunities** | Add exam-date capture in onboarding → auto-generate study plan<br>Show "30-day sprint" preset on first login |

**KPIs:** Signup completion rate, onboarding drop-off, time to first practice

---

### Stage 2: Onboarding & First Diagnosis (Days -28 to -26)

| Layer | Details |
|-------|---------|
| **User Actions** | Lands on Student Dashboard; sees "Start Practice" CTA; clicks → Practice Studio → Grammar Sprint (first card); completes 10 questions; gets score 65%; sees "Focus for Next Time: Conditionals" |
| **Touchpoints** | Dashboard → Practice Studio → Grammar Sprint → ExercisePlayer → Results → RecommendedNextStep |
| **Emotions** | 😰 Overwhelmed (too many options) → 😅 Nervous (first score) → 🎯 Focused (clear next step) |
| **Pain Points** | - No "recommended first skill" highlight<br>- Grammar Sprint chosen arbitrarily<br>- Doesn't know if 65% is good/bad for B2 target |
| **Opportunities** | "Smart Start" banner: "Based on your exam in 30 days, start with Grammar Sprint → Conditionals"<br>Show benchmark: "B2 target: 70%+ on Grammar" |

**KPIs:** First session completion, time to first insight, "RecommendedNextStep" click-through

---

### Stage 3: Daily Practice Loop (Days -25 to -10)

| Layer | Details |
|-------|---------|
| **User Actions** | Daily: Opens dashboard → "Continue Grammar Sprint: Conditionals" (Recent selections quick-pick) → 10-15 min session → Reviews score → Checks streak → Closes |
| **Touchpoints** | Dashboard (Home) → Practice Studio (recent pick) → ExercisePlayer → Results → Dashboard |
| **Emotions** | 📈 Confident (streak building) → 😤 Frustrated (plateau at 68%) → 💪 Motivated (sees progress) |
| **Pain Points** | - No "continue last session" on mobile bottom nav<br>- Can't see weekly trend on dashboard Home<br>- Forgets to check Teacher Feedback tab |
| **Opportunities** | Add micro-trend sparkline on Home card: "Grammar: 65% → 72% this week"<br>Push notification: "Your streak is 7 days — keep it going!"<br>Weekly digest email: "3 sessions, +7% Grammar, 1 teacher note" |

**KPIs:** Daily active days, session duration, streak retention, score trajectory

---

### Stage 4: Midpoint Check & Teacher Feedback (Days -15 to -12)

| Layer | Details |
|-------|---------|
| **User Actions** | Teacher assigns diagnostic; completes it; waits 2 days; sees "Teacher Feedback" dot on tab; opens → reads "Current Focus: Article usage"; sees Practice Results showing Listening 75%, Grammar 72%; clicks "Practice next" → Homework |
| **Touchpoints** | Diagnostic → Teacher Feedback tab → Practice Results section → Homework tab → ExercisePlayer |
| **Emotions** | 😰 Nervous (teacher judgment) → 😊 Validated (knows exactly what to fix) → 🎯 Purposeful (homework aligned) |
| **Pain Points** | - Feedback tab labeled "Feedback" not "Teacher Feedback" (confused with practice results)<br>- Practice Results section easy to miss below fold<br>- No direct link from teacher's "Focus for Next Time" to relevant practice mode |
| **Opportunities** | Deep link: Teacher's "Focus: Articles" → opens Practice Studio → Grammar → Articles<br>Unified "Next Action" card on Home combining teacher feedback + practice trend |

**KPIs:** Feedback open rate, time to first homework, homework completion rate

---

### Stage 5: Final Sprint (Days -10 to -2)

| Layer | Details |
|-------|---------|
| **User Actions** | Increases to 2 sessions/day; uses Mock Test (full timed); scores 78%; reviews Error Bank; does targeted Vocab Deep-Dive on weak topics; streak hits 21 days |
| **Touchpoints** | Mock Test → Mock Test Results → Error Bank → Practice Studio (vocab) → Dashboard (streak) |
| **Emotions** | 🚀 In flow (routine locked) → 😰 Pre-exam jitters → 🏆 Proud (streak 21) |
| **Pain Points** | - Mock Test timer stressful, no "practice mode" toggle<br>- Error Bank doesn't filter by "last 7 days"<br>- No "exam day checklist" (what to bring, timing, tech check) |
| **Opportunities** | "Exam Simulator" mode: same timer, but with pause/review<br>Error Bank smart filter: "Recent errors" + "By skill"<br>Exam Day Prep card on Home (Days -3 to 0) |

**KPIs:** Mock test completion, score vs target, error-bank usage, streak peak

---

### Stage 6: Exam Day (Day 0)

| Layer | Details |
|-------|---------|
| **User Actions** | Opens app for last confidence boost; sees "Exam Day" banner with checklist; does 5-min warmup (Flashcard); closes app; takes exam |
| **Touchpoints** | Dashboard (Exam Day banner) → Practice Studio (Flashcard quick warmup) |
| **Emotions** | 😰 Nervous → 🧘 Calm (routine) → ✅ Done |
| **Pain Points** | No "good luck" / exam-day mode<br>No offline access to flashcards for commute |
| **Opportunities** | Exam Day mode: minimal UI, warmup only, offline flashcards<br>Post-exam: "How did it feel?" quick pulse survey |

**KPIs:** Warmup completion, exam-day banner engagement

---

### Stage 7: Post-Exam (Days +1 to +14)

| Layer | Details |
|-------|---------|
| **User Actions** | Receives results email; logs in; sees "Results received" banner; shares score with teacher; decides next goal (C1 or maintain) |
| **Touchpoints** | Email → Dashboard → Teacher Feedback (final) → Settings (goal update) |
| **Emotions** | 🎉 Relief → 🏆 Pride → 🤔 What's next? |
| **Pain Points** | No "results received" flow in app<br>- Teacher feedback loop ends abruptly<br>- No celebration/achievement for passing |
| **Opportunities** | Results ingestion: manual entry → auto-update progress chart<br>Achievement badge: "MET B2+ Certified"<br>Next-goal wizard: "Ready for C1? Here's your 60-day plan" |

**KPIs:** Result entry rate, next-goal selection, retention at 30/90 days

---

## Three Experience Paths

| Stage | Happy Path | Difficult Path | Fail Path |
|-------|------------|----------------|-----------|
| **Awareness** | Lands → signs up → sees 30-day plan | Signs up but misses exam-date capture | Bounces at signup (OAuth fails) |
| **First Diagnosis** | Grammar Sprint → 65% → clear next step | Tries Listening first → 50% → confused | Quits after 3 questions (too hard) |
| **Daily Loop** | Recent pick → session → streak grows | Forgets recent pick → re-navigates grid | Misses 3+ days → streak breaks → demotivated |
| **Midpoint** | Teacher feedback → aligned homework | Feedback delayed → practices wrong skill | No feedback → continues blind |
| **Final Sprint** | Mock test 78% → targeted vocab → confident | Mock test 60% → panic → unfocused cramming | Mock test 45% → gives up |
| **Exam Day** | Warmup → calm → passes | No warmup → rusty start → passes barely | Technical issue → reschedules |
| **Post-Exam** | Enters score → gets badge → plans C1 | Forgets to enter score → no closure | Fails → no retry path shown |

---

## Friction Points & Interventions (Prioritized)

| # | Friction Point | Stage | Frequency | Severity | Solvability | Intervention | Effort | Owner |
|---|----------------|-------|-----------|----------|-------------|--------------|--------|-------|
| 1 | No exam-date capture in onboarding | 1 | 100% | High | High | Add date picker + auto-plan | S | Product |
| 2 | "Feedback" tab label ambiguous | 4 | 80% | High | High | Rename → "Teacher Feedback" | S | Design |
| 3 | No "continue last session" on mobile | 3 | 70% | High | Medium | Add to bottom nav | M | Eng |
| 4 | No benchmark context for scores | 2,3 | 90% | Medium | High | Show "B2 target: 70%+" | S | Design |
| 5 | Practice Results below fold | 4 | 60% | Medium | Medium | Move up / sticky card | S | Design |
| 6 | No deep link from teacher feedback → practice | 4 | 50% | High | Medium | "Practice this" button | M | Eng |
| 7 | Mock Test no practice mode | 5 | 40% | Medium | Medium | Add untimed toggle | M | Eng |
| 8 | No exam-day mode/checklist | 6 | 30% | Medium | Low | Day 0 banner + warmup | M | Product |
| 9 | No post-exam results flow | 7 | 20% | Low | Low | Manual entry + badge | L | Product |

**Priority Score = Frequency × Severity × Solvability**

---

## KPI Dashboard (Target vs Actual)

| Metric | Target | Measurement | Owner |
|------|--------|-------------|-------|
| **Activation** | 80% complete first session Day 1 | Mixpanel: `practice_session_started` | Growth |
| **Retention D7** | 60% | Daily active / signups | Growth |
| **Retention D30** | 40% (exam day) | Daily active / signups | Growth |
| **Score Trajectory** | +15% Grammar avg | `practice_session.completed` → score diff | Product |
| **Mock Test Completion** | 50% take ≥1 | `mock_test.completed` | Product |
| **Teacher Feedback Open** | 90% within 48h | `feedback_tab.opened` | Product |
| **Streak ≥14 days** | 35% | `streak_count` | Product |
| **Exam Pass Rate** | 75% self-reported | Post-exam survey | Research |
| **SUS (Practice Studio)** | ≥80 | Usability test | UX |

---

## Emotional Journey Visualization

```
Emotion
  ^  😊 Confident ────────────────────────────────┐
  |                                               │  Happy Path
  |  😰 Anxious ──┐                               │
  |               │  😤 Frustrated (plateau) ────┤  Difficult Path
  |               │                               │
  |  😰 Nervous ──┘  😊 Validated ──────────────┘
  |
  +──────────────────────────────────────────────→ Time
  -30  -25  -20  -15  -10   -5    0    +5   +10
  Setup  1st   Daily   Mid   Sprint Exam  Post
        Diag  Loop    Point
```

---

## Design Implications (From Journey)

1. **Onboarding must capture exam date** — drives all downstream personalization
2. **Home dashboard = command center** — streak, trend, next action, teacher feedback unified
3. **Practice Studio = low-friction re-entry** — recent picks, breadcrumb, smart defaults
4. **Teacher Feedback = actionable bridge** — deep links to practice modes
5. **Mock Test = simulator, not just test** — practice mode, review mode, error analysis
6. **Exam Day = minimal, calm** — warmup only, offline-ready
7. **Post-Exam = celebration + next step** — badge, goal wizard, retention hook

---

## Validation Plan

| Method | When | Participants | Questions |
|--------|------|--------------|-----------|
| **Diary Study** | Weeks 1-4 | 5 students (B2, 30-day window) | Daily: "What did you do? How did it feel? What blocked you?" |
| **Usability Test** | Week 2 | 5 (from test plan) | Task success on Practice Studio flow |
| **Analytics Audit** | Week 4 | All 30-day cohort | Funnel: signup → first session → D7 → D30 → mock test → pass |
| **Teacher Interview** | Week 3 | 3 teachers | "How do you use feedback? What's missing?" |

---

## Appendix: Persona Detail (Alex)

| Attribute | Value |
|-----------|-------|
| **Name** | Alex Chen |
| **Age** | 28 |
| **Role** | Backend Engineer |
| **English Level** | B2 (CEFR) — strong reading, weak speaking |
| **Goal** | MET B2+ (score 59+/80) for visa/employer |
| **Timeline** | 30 days |
| **Study Budget** | 45 min weekdays, 2 hrs weekends |
| **Devices** | MacBook Pro (primary), iPhone (commute) |
| **Motivation** | Career requirement, not personal interest |
| **Frustrations** | Speaking anxiety, article/preposition errors, time pressure |
| **Tech Comfort** | High — expects keyboard shortcuts, dark mode, shortcuts |
| **Quote** | *"I don't need gamification. I need to know exactly what to practice today to pass in 30 days."* |

---

## Next Steps

1. **Validate** with 3 current B2 students (30-min interviews)
2. **Prioritize** top 3 interventions (exam-date capture, tab rename, recent-pick mobile)
3. **Prototype** Exam Day mode + Post-Exam flow
4. **Instrument** analytics events for all KPIs
5. **Schedule** diary study for next cohort