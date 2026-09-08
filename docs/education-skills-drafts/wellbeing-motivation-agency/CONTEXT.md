# Bounded Context: wellbeing-motivation-agency

## Aggregates

- **MotivationSession** — motivationLevel, engagementScore, sessionDuration, interventions
- **EngagementOrchestrator** — currentState, history, lastActivity
- **AgencyScaffold** — agencyScore, goals, reflections, progressMarkers

## Repository Interfaces (to be implemented)

- `IMotivationSessionRepository` — log/get history/get trend/detect disengagement
- `IEngagementOrchestratorRepository` — get state/transition/get optimal activity/get history
- `IAgencyScaffoldRepository` — get scaffold/set goal/record reflection/calculate agency score

## Domain Events

- `SessionLogged`
- `StateChanged`
- `DisengagementDetected`
- `GoalSet`
- `ScaffoldAdjusted`

## Shared Kernel Boundaries

**Borrowed from:**
- `src/core/shared/types.js`
- `src/core/kernel/utils.js`

**Owned by this context:**
- All motivation and engagement tracking logic
- Agency scaffold calculations
- Disengagement detection algorithms

## Implementation Mapping

| Skill | Aggregate | Repository |
|-------|-----------|------------|
| `motivation-diagnostic-task-redesign` | MotivationSession | IMotivationSessionRepository |
| `flow-state-condition-designer` | EngagementOrchestrator | IEngagementOrchestratorRepository |
| `agency-scaffold-generator` | AgencyScaffold | IAgencyScaffoldRepository |
| `self-efficacy-builder-sequence` | AgencyScaffold | IAgencyScaffoldRepository |
| `wellbeing-learning-connection-mapper` | EngagementOrchestrator | IEngagementOrchestratorRepository |