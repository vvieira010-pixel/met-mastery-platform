export const STORAGE_KEYS = {
  SECTION_ANSWERS: (sectionId) => `met:section:${sectionId}:answers`,
  SECTION_TIMER: (sectionId) => `met:timer:${sectionId}`,
  MOCK_TEST_SUBMISSION: 'met:mock1:submission',
  MOCK_TEST_SESSION_PREFIX: 'met:mock1',
  SPEAKING_RECORDING: (taskIdx) => `met:speaking:recording:${taskIdx}`,
};

export const TIMER_CONFIG = {
  WARNING_THRESHOLD_SECONDS: 60,
  AUTO_SAVE_INTERVAL_MS: 1000,
  BEFORE_UNLOAD_WARNING: true,
};

/** Legacy CEFR config - DEPRECATED. Use met-scoring.ts for official MET scoring. */
export const CEFR_CONFIG = {
  LEVELS: [
    { id: 'Below B1', label: 'A1–A2', desc: 'Beginner / Elementary', color: 'var(--danger)' },
    { id: 'B1', label: 'B1', desc: 'Intermediate', color: 'var(--warning)' },
    { id: 'B2', label: 'B2', desc: 'Upper-Intermediate', color: 'var(--success)' },
    { id: 'C1', label: 'C1', desc: 'Advanced', color: 'var(--info)' },
  ],
  LONG_LABELS: {
    'Below B1': 'Beginner / Elementary (Below B1)',
    'B1': 'Intermediate (Independent User)',
    'B2': 'Upper-Intermediate (Independent User)',
    'C1': 'Advanced (Proficient User)',
  },
  DESCRIPTIONS: {
    'Below B1': 'Can understand basic phrases and familiar topics. Needs foundational work to reach B1.',
    'B1': 'Can understand the main points of clear standard input on familiar matters. Ready to push toward B2.',
    'B2': 'Can understand the main ideas of complex text on both concrete and abstract topics. Strong foundation for C1.',
    'C1': 'Can understand a wide range of demanding, longer texts. Excellent progress toward mastery.',
  },
  THRESHOLDS: [
    { min: 0, max: 49, level: 'Below B1' },
    { min: 50, max: 69, level: 'B1' },
    { min: 70, max: 84, level: 'B2' },
    { min: 85, max: 100, level: 'C1' },
  ],
};

/** @deprecated Use met-scoring.ts getCefrLevelFromPercent instead (official 0-80 scaled) */
export function getCefrLevelFromPercent(pct) {
  if (pct < 50) return 'Below B1';
  if (pct < 70) return 'B1';
  if (pct < 85) return 'B2';
  return 'C1';
}

export function getCefrColor(level) {
  const found = CEFR_CONFIG.LEVELS.find(l => l.id === level);
  return found?.color || 'var(--text-muted)';
}

export function getCefrLongLabel(level) {
  return CEFR_CONFIG.LONG_LABELS[level] || level;
}

export function getCefrDescription(level) {
  return CEFR_CONFIG.DESCRIPTIONS[level] || '';
}