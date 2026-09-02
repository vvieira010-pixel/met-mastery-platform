# Practice Studio file space

Use one of the six skill folders inside `incoming/` for new files that should be reviewed and added to the Practice Studio tab:

- `incoming/reading/`
- `incoming/listening/`
- `incoming/speaking/`
- `incoming/writing/`
- `incoming/vocabulary/`
- `incoming/grammar/`

The `current/` folder is a copy of the active files currently involved in the student Practice Studio and listening flow. These are reference copies; the running app still uses the original files in `src/`, `public/`, and `tests/`.

## Current implementation copies

- `current/shared/` — shared Practice Studio shell, dashboard entry point, players, workflow, and tests.
- `current/skills/reading/` — reading page, subject data, reading banks, and reading components.
- `current/skills/listening/` — listening page, listening banks, the supplementary pack, 69 listening audio files, and listening tests.
- `current/skills/speaking/` — speaking page/evaluator, subject and exercise data, prompt audio, pictures, and mock-test speaking component.
- `current/skills/writing/` — writing page, writing practice page, writing bank, and short-answer component.
- `current/skills/vocabulary/` — vocabulary pages, subject/data banks, and vocabulary exercise components.
- `current/skills/grammar/` — grammar page, subject/data banks, grammar bank, and grammar exercise components.

Writing intake is divided by the source time limit: `incoming/writing/10 minutes/` and `incoming/writing/45 minutes/`.

Vocabulary intake is divided by exercise type inside `incoming/vocabulary/`: synonym choice, antonym choice, definition match, collocation, phrasal verb, word in context, register, confusables, and mixed vocabulary.

All six skills also have a topic-organized copy under `current/by-topic/`. New writing and speaking intake packs are split into `incoming/.../by-topic/` where topic data exists; packs without topic metadata are kept in an `uncategorized.json` file.

When adding a file, paste it into `incoming/` and describe its intended source path and change in a short note. Review and wire files into the real app only after checking the data shape, asset path, and student flow.

Speaking rule: a task labeled as picture description counts only when an image file is present and linked. Text-only picture descriptions are removed from the speaking prompt data.
