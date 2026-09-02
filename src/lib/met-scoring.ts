/**
 * MET Scoring — Single Source of Truth
 *
 * Implements official Michigan English Test (MET) scoring per CaMLA / Michigan Language Assessment:
 * - Scaled score 0–80 per section (Listening, Reading, Writing, Speaking)
 * - Overall = average of taken sections (0–80)
 * - CEFR bands: 0–39 A2, 40–52 B1, 53–63 B2, 64–80 C1
 * - Scope: A2–C1 only (no A1, no C2)
 * - No pass/fail designation
 *
 * Reference: official MET Examinee Manual equating tables.
 * Re-verify exact equating cut scores against the manual before shipping score reporting.
 */

export interface SectionScore {
  total: number;
  max: number;
  details?: Array<{ qId: string; correct: boolean; pts: number }>;
}

export interface ScaledScores {
  listening: number;   // 0–80
  reading: number;     // 0–80
  writing?: number;    // 0–80 (human-scored 0–4 → scaled)
  speaking?: number;   // 0–80 (human-scored 0–12 → scaled)
  overall: number;     // average of available sections, 0–80
  cefr: 'A2' | 'B1' | 'B2' | 'C1';
  cefrLabel: string;
  cefrDescription: string;
}

/** Official MET CEFR band boundaries (scaled 0–80) */
const CEFR_BANDS: Array<{ min: number; max: number; level: 'A2' | 'B1' | 'B2' | 'C1'; label: string; description: string }> = [
  { min: 0,  max: 39, level: 'A2', label: 'A2 (Elementary)',      description: 'Can understand basic phrases and familiar topics. Needs foundational work to reach B1.' },
  { min: 40, max: 52, level: 'B1', label: 'B1 (Intermediate)',    description: 'Can understand the main points of clear standard input on familiar matters. Ready to push toward B2.' },
  { min: 53, max: 63, level: 'B2', label: 'B2 (Upper-Intermediate)', description: 'Can understand the main ideas of complex text on both concrete and abstract topics. Strong foundation for C1.' },
  { min: 64, max: 80, level: 'C1', label: 'C1 (Advanced)',        description: 'Can understand a wide range of demanding, longer texts. Excellent progress toward mastery.' },
];

/**
 * Map a raw percentage-correct (0–100) to the official 0–80 scaled score.
 * Uses a simple linear mapping as a baseline; replace with official equating tables per test form.
 * @param pct - Percentage correct (0–100)
 * @returns Scaled score 0–80
 */
export function percentToScaled(pct: number): number {
  const clamped = Math.max(0, Math.min(100, pct));
  // Linear: 0% → 0, 100% → 80
  return Math.round((clamped / 100) * 80);
}

/**
 * Map raw section points to 0–80 scaled score.
 * @param rawPoints - Points earned
 * @param maxPoints - Maximum possible points
 * @returns Scaled score 0–80
 */
export function rawToScaled(rawPoints: number, maxPoints: number): number {
  if (maxPoints <= 0) return 0;
  const pct = (rawPoints / maxPoints) * 100;
  return percentToScaled(pct);
}

/**
 * Map a 0–80 scaled score to official MET CEFR band.
 * @param scaled - Scaled score 0–80
 * @returns CEFR level (A2|B1|B2|C1)
 */
export function scaledToCefr(scaled: number): 'A2' | 'B1' | 'B2' | 'C1' {
  const clamped = Math.max(0, Math.min(80, scaled));
  const band = CEFR_BANDS.find(b => clamped >= b.min && clamped <= b.max);
  return band?.level ?? 'A2';
}

/**
 * Get full CEFR info for a scaled score.
 */
export function getCefrInfo(scaled: number) {
  const clamped = Math.max(0, Math.min(80, scaled));
  const band = CEFR_BANDS.find(b => clamped >= b.min && clamped <= b.max) ?? CEFR_BANDS[0];
  return {
    level: band.level,
    label: band.label,
    description: band.description,
  };
}

/**
 * Compute complete MET scaled scores from raw section scores.
 * @param sections - Raw section scores { listening?, reading?, writing?, speaking? }
 * @returns ScaledScores with overall and CEFR
 */
export function computeScaledScores(sections: {
  listening?: SectionScore;
  reading?: SectionScore;
  writing?: SectionScore;
  speaking?: SectionScore;
}): ScaledScores {
  const listening = sections.listening ? rawToScaled(sections.listening.total, sections.listening.max) : undefined;
  const reading = sections.reading ? rawToScaled(sections.reading.total, sections.reading.max) : undefined;
  const writing = sections.writing ? rawToScaled(sections.writing.total, sections.writing.max) : undefined;
  const speaking = sections.speaking ? rawToScaled(sections.speaking.total, sections.speaking.max) : undefined;

  // Overall = average of available sections
  const available = [listening, reading, writing, speaking].filter(v => v !== undefined) as number[];
  const overall = available.length > 0
    ? Math.round(available.reduce((a, b) => a + b, 0) / available.length)
    : 0;

  const { level, label, description } = getCefrInfo(overall);

  return {
    listening: listening ?? 0,
    reading: reading ?? 0,
    writing: writing ?? 0,
    speaking: speaking ?? 0,
    overall,
    cefr: level,
    cefrLabel: label,
    cefrDescription: description,
  };
}

/**
 * Legacy compatibility: map percentage to CEFR (for old callers).
 * @deprecated Use computeScaledScores + scaledToCefr instead.
 */
export function getCefrLevelFromPercent(pct: number): 'A2' | 'B1' | 'B2' | 'C1' {
  return scaledToCefr(percentToScaled(pct));
}

/** Target scores for nursing candidates (locked product decision) */
export const TARGET_OVERALL = 58;      // B2 threshold
export const TARGET_SPEAKING = 59;     // Speaking-specific target

/** Distance from target (positive = above target) */
export function distanceFromTarget(scaled: ScaledScores) {
  return {
    overall: scaled.overall - TARGET_OVERALL,
    speaking: (scaled.speaking || 0) - TARGET_SPEAKING,
  };
}

/** Human-readable target message */
export function targetMessage(scaled: ScaledScores): string {
  const { overall, speaking } = distanceFromTarget(scaled);
  const parts: string[] = [];
  if (overall < 0) parts.push(`${Math.abs(overall)} points from overall target (${TARGET_OVERALL})`);
  else parts.push(`Overall target met (+${overall})`);
  if (speaking < 0) parts.push(`${Math.abs(speaking)} points from speaking target (${TARGET_SPEAKING})`);
  else parts.push(`Speaking target met (+${speaking})`);
  return parts.join(' · ');
}

export { CEFR_BANDS };