# Practice Studio WebMCP tour

The first WebMCP-enabled workflow is **Start a Grammar Sprint** for an authenticated student.

## Tour contract

The browser exposes six `met_practice_tour_*` tools through `document.modelContext` when a student dashboard is open:

- `list_targets` discovers stable semantic targets, labels, descriptions, and visibility.
- `read_state` returns the active tab, Practice Studio screen, and state revision.
- `read_instructions` returns the learner-first tour instructions.
- `highlight_target` and `dismiss_highlight` only control the visual guide.
- `wait_for_state_change` waits for the learner’s own UI action and returns updated state.

No WebMCP tour tool navigates, chooses a skill, answers an exercise, or submits work. Existing application authentication and permission checks remain the authority for all user actions.

## Semantic targets

| Target ID | Meaning |
| --- | --- |
| `practice-navigation` | Student navigation item that opens Practice Studio |
| `practice-skill-grammar` | Grammar Sprint selection card |
| `practice-session` | The learner-owned grammar exercise session |

## Browser support

WebMCP is an emerging browser API. The app feature-detects `document.modelContext.registerTool`; browsers without it render the ordinary student experience with no tour side effects. For local browser testing, use a WebMCP-capable Chrome build or provide a compatible `document.modelContext` test shim.
