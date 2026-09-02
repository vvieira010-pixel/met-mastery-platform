# MET B2 Exercises - Platform Content Bank

**Location:** `Exercises/met-b2/`
**Levels:** B1-B2+ | **Exam:** Michigan English Test (MET)

## Structure

| Folder | Content | Files |
|---|---|---|
| `listening/` | Audio scripts, transcripts | _empty - add next_ |
| `reading/` | Passages + MC homework bank | `b2_met_homework_bank.md` |
| `writing/` | Prompts + rubrics | _empty_ |
| `speaking/` | Picture prompts, speaking tasks | `.zip` (4 pictures) + `.csv/.md/.xlsx` practice set |
| `grammar/` | Grammar drills | _empty_ |
| `vocabulary/` | Vocab banks (JSON + MD) | `met_b2_vocab_interactive_exercises.json`, `Exercises_for_platform_MET.md` |
| `framework/` | MET competencies + skills guides | 3 guides |

## Where things moved from

- `Exercises/*.md|json|zip` -> sorted into matching subfolders
- `quizzes/*` (was duplicate speaking content) -> merged into `speaking/` and `quizzes/` deleted

## Next steps

1. Unzip `speaking/met_speaking_style_pictures_4_files.zip` if platform needs loose PNGs
2. Fill `listening/`, `writing/`, `grammar/` as content is created
3. Update any import paths that referenced `quizzes/` -> now `Exercises/met-b2/speaking/`


---
## Workshop Fix-All (2026-08-25)
- UI cleaner: 6→3 tabs collapsed, card grids fixed, focus-visible + reduced-motion added
- Listening: 10×3 SAPI WAVs generated (Zira/David/Maria) in public/exercises/audio/listening/
- Images: width/height added, placeholders … fixed
- Next: run workshop .agents/workshops/workshop-clean-ui-agenda.md (90 min) and validate Backlog-Clean-UI.md with teacher

