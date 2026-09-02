/**
 * registry-homework.js — Skills for homework + exercise task types.
 */
import { parseSkillMd } from './parser.js';
import differentiationMd from './skills/curriculum-assessment/differentiation-adapter/SKILL.md?raw';
import scaffoldMd from './skills/eal-language-development/scaffolded-task-modifier/SKILL.md?raw';
import practiceSequenceMd from './skills/explicit-instruction/practice-problem-sequence-designer/SKILL.md?raw';
import workedExampleMd from './skills/memory-learning-science/worked-example-fading-designer/SKILL.md?raw';
import retrievalPracticeMd from './skills/memory-learning-science/retrieval-practice-generator/SKILL.md?raw';
import rubricMd from './skills/curriculum-assessment/criterion-referenced-rubric-generator/SKILL.md?raw';

const ALL = [differentiationMd, scaffoldMd, practiceSequenceMd, workedExampleMd, retrievalPracticeMd, rubricMd]
  .map(raw => parseSkillMd(raw))
  .filter(Boolean);

export function getAll() { return ALL; }
