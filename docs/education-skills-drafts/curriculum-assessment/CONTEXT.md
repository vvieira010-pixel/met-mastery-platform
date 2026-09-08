# Bounded Context: curriculum-assessment

## Aggregate Roots

- **AssessmentPlan** — designType, criteria, rubric, status
- **RubricGenerator** — levels, descriptors, scoringGuide
- **CompetencyMapper** — proficiencyLevel, mappedStandards, coverage

## Repository Interfaces (to be implemented)

- `IAssessmentPlanRepository` — create/get/update/finalize assessment plans
- `IRubricRepository` — generate/get/add descriptor for rubrics
- `ICompetencyRepository` — map standards/get coverage/identify gaps

## Domain Events

- `PlanCreated`
- `RubricGenerated`
- `StandardMapped`
- `GapIdentified`

## Shared Kernel Boundaries

**Borrowed from:**
- `src/core/shared/types.js`
- `src/core/kernel/utils.js`

**Owned by this context:**
- All assessment design logic
- Rubric generation algorithms
- Competency mapping and gap analysis

## Implementation Mapping

| Skill | Aggregate | Repository |
|-------|-----------|------------|
| `assessment-design-orchestrator` | AssessmentPlan | IAssessmentPlanRepository |
| `criterion-referenced-rubric-generator` | RubricGenerator | IRubricRepository |
| `curriculum-knowledge-architecture-designer` | CompetencyMapper | ICompetencyRepository |
| `gap-analysis-from-student-work` | CompetencyMapper | ICompetencyRepository |
| `backwards-design-unit-planner` | AssessmentPlan | IAssessmentPlanRepository |