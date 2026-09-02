import { parseSkillMd } from './parser.js';
import confidenceMd from './skills/student-learning/confidence-calibration-check/SKILL.md?raw';
import hintLadderMd from './skills/student-learning/progressive-hint-ladder/SKILL.md?raw';
import stuckMd from './skills/student-learning/stuck-and-error-diagnosis-coach/SKILL.md?raw';
import retrieveMd from './skills/student-learning/retrieve-first-gate/SKILL.md?raw';
import transferMd from './skills/student-learning/transfer-bridge/SKILL.md?raw';
import claimMd from './skills/student-learning/ai-claim-checker/SKILL.md?raw';

const ALL = [confidenceMd, hintLadderMd, stuckMd, retrieveMd, transferMd, claimMd]
  .map(raw => parseSkillMd(raw))
  .filter(Boolean);

export function getAll() { return ALL; }
