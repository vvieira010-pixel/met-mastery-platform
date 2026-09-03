// CEFR scoring helper — kept in its own module so CefrSkillGapFlags.jsx
// only exports a component (satisfies react-refresh's only-export-components rule).

export function getCefrTier(score) {
  const num = Number(score) || 0;
  if (num >= 65) return { code: 'B2+', label: 'B2+ Advanced', isB2: true };
  if (num >= 53) return { code: 'B2', label: 'B2 Passing Standard', isB2: true };
  if (num >= 40) return { code: 'B1', label: 'B1 Developing', isB2: false };
  return { code: 'A2', label: 'A2 Foundation', isB2: false };
}
