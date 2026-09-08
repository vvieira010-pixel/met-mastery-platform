# Bounded Context: historical-thinking

## Aggregates

- **InquiryTask** — phase, evidenceCount, argumentStrength, timestamp
- **SourceEvaluator** — credibilityScore, perspectiveBias, relevanceRating, usedInArgument
- **ArgumentBuilder** — claim, evidenceList, counterArguments, confidenceLevel

## Repository Interfaces (to be implemented)

- `IInquiryTaskRepository` — create/advance/get/get by student/complete tasks
- `ISourceEvaluatorRepository` — evaluate/get evaluations/get credibility/detect bias
- `IArgumentBuilderRepository` — create argument/add evidence/add counter/calculate confidence/validate structure

## Domain Events

- `TaskCreated`
- `PhaseAdvanced`
- `SourceEvaluated`
- `BiasDetected`
- `ArgumentConstructed`
- `TaskCompleted`

## Shared Kernel Boundaries

**Borrowed from:**
- `src/core/shared/types.js`
- `src/core/kernel/utils.js`

**Owned by this context:**
- All historical inquiry logic
- Source evaluation and bias detection
- Argument construction and validation

## Implementation Mapping

| Skill | Aggregate | Repository |
|-------|-----------|------------|
| `central-historical-question-evaluator` | InquiryTask | IInquiryTaskRepository |
| `close-reading-skill-builder` | SourceEvaluator | ISourceEvaluatorRepository |
| `contextualisation-skill-builder` | InquiryTask | IInquiryTaskRepository |
| `corroboration-skill-builder` | ArgumentBuilder | IArgumentBuilderRepository |
| `document-based-lesson-designer` | InquiryTask | IInquiryTaskRepository |
| `historical-document-set-curator` | SourceEvaluator | ISourceEvaluatorRepository |
| `historical-source-adapter` | SourceEvaluator | ISourceEvaluatorRepository |
| `historical-thinking-strategy-modelling-guide` | ArgumentBuilder | IArgumentBuilderRepository |
| `sourcing-skill-builder` | SourceEvaluator | ISourceEvaluatorRepository |