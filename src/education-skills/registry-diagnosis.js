/**
 * registry-diagnosis.js — Skills for diagnosis task type only.
 */
import { parseSkillMd } from './parser.js';
import gapAnalysisMd from './skills/curriculum-assessment/gap-analysis-from-student-work/SKILL.md?raw';
import errorAnalysisMd from './skills/self-regulated-learning/error-analysis-protocol/SKILL.md?raw';
import feedbackDesignMd from './skills/ai-learning-science/ai-feedback-design-principles/SKILL.md?raw';
import rubricMd from './skills/curriculum-assessment/criterion-referenced-rubric-generator/SKILL.md?raw';
import feedbackQualityMd from './skills/memory-learning-science/feedback-quality-analyser/SKILL.md?raw';

const ALL = [gapAnalysisMd, errorAnalysisMd, feedbackDesignMd, rubricMd, feedbackQualityMd]
  .map(raw => parseSkillMd(raw))
  .filter(Boolean);

export function getAll() { return ALL; }
