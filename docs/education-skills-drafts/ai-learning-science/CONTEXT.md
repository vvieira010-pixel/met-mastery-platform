# Bounded Context: ai-learning-science

## Aggregates

- **AdaptiveHintSequence** — cascading hint progression for problem types
- **FadingManager** — spaced retrieval scheduling and difficulty adjustment
- **CognitiveTutoringLoop** — real-time hint delivery and error diagnosis
- **AI-FacilitatedCollaboration** — group learning orchestration with AI support
- **FormativeAssessmentLoop** — evidence collection and feedback calibration
- **LearningAnalyticsPipeline** — session logging, pattern detection, and reporting

## Repository Interfaces (to be implemented)

- `IHintSequenceRepository` — load/save hint sequences per problem type
- `IFadingScheduleRepository` — persist retrieval schedules and difficulty levels
- `ISessionLogRepository` — append-only log of learning interactions
- `IAssessmentResultRepository` — store formative assessment outcomes

## Domain Events

- `HintSequenceStarted(problemId, timestamp)`
- `HintRevealed(hintLevel, problemId, timestamp)`
- `FadingAdjusted(topicId, oldLevel, newLevel, reason, timestamp)`
- `SessionCompleted(mode, topicId, score, duration, timestamp)`
- `AssessmentScored(studentId, problemId, score, confidence, timestamp)`

## Shared Kernel

- In: Utilities from `src/core/shared` (date formatting, ID generation)
- Out: Domain-specific hint generation, fading algorithm, and tutoring logic

## Invariants

- Hint sequences must be non-decreasing in reveal level
- Fading adjustments require a minimum number of prior sessions
- Assessment scores must include confidence calibration