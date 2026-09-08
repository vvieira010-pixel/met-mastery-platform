# Bounded Context: student-learning

## Aggregates

- **AdaptiveHintSequence** — cascading hint progression for problem types
- **FadingManager** — spaced retrieval scheduling and difficulty adjustment
- **RetrievalPracticeEngine** — evidence-based retrieval practice orchestration
- **CognitiveTutoringLoop** — real-time hint delivery and error diagnosis
- **FormativeAssessmentLoop** — evidence collection and feedback calibration
- **LearningAnalyticsPipeline** — session logging, pattern detection, and reporting

## Repository Interfaces (to be implemented)

- `ILearningSessionRepository` — append-only log of learning interactions
- `IHintSequenceRepository` — load/save hint sequences per problem type
- `IFadingScheduleRepository` — persist retrieval schedules and difficulty levels
- `IAssessmentResultRepository` — store formative assessment outcomes

## Domain Events

- `SessionLogged(studentId, mode, topicId, score, duration, timestamp)`
- `HintSequenceStarted(problemId, timestamp)`
- `HintRevealed(hintLevel, problemId, timestamp)`
- `FadingAdjusted(topicId, oldLevel, newLevel, reason, timestamp)`
- `RetrievalAttempted(studentId, topicId, success, timestamp)`
- `AssessmentScored(studentId, problemId, score, confidence, timestamp)`

## Shared Kernel

- In: Utilities from `src/core/shared` (date formatting, ID generation)
- Out: Domain-specific hint generation, fading algorithm, and tutoring logic

## Invariants

- Hint sequences must be non-decreasing in reveal level
- Fading adjustments require a minimum number of prior sessions
- Assessment scores must include confidence calibration
- Retrieval practice must follow spacing intervals

## Implementation Mapping

| Skill | Aggregate | Repository |
|-------|-----------|------------|
| `adaptive-hint-sequence-designer` | AdaptiveHintSequence | IHintSequenceRepository |
| `fading-manager` | FadingManager | IFadingScheduleRepository |
| `retrieve-first-gate` | RetrievalPracticeEngine | ILearningSessionRepository |
| `progressive-hint-ladder` | AdaptiveHintSequence | IHintSequenceRepository |
| `stuck-and-error-diagnosis-coach` | CognitiveTutoringLoop | ILearningSessionRepository |
| `teach-back-evaluator` | FormativeAssessmentLoop | IAssessmentResultRepository |
| `learning-engagement-orchestrator` | LearningAnalyticsPipeline | ILearningSessionRepository |