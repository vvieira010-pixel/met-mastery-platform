/* met-tutor-store.js — MET B2 Tutor persistence: SM-2, CEFR estimate, weak skills, adaptive queue
 * Backed by localStorage + optional Supabase sync (mirrors spaced-repetition.js pattern).
 * Fused with homework creation: pulls spaced-repetition due items as priority queue.
 */

import { getDueItems, getAllEntries, recordPractice as srRecordPractice } from './spaced-repetition.js';
import { trackEvent } from './ml-events.js';

const STORE_KEY = (sid) => `vv:met-tutor:${sid}`;
const SM2_DEFAULT_EASE = 2.5;
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

// CEFR mapping (numeric for ordering)
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
function nextCEFR(cur, delta) {
  const i = CEFR_ORDER.indexOf(cur);
  const ni = Math.max(0, Math.min(CEFR_ORDER.length - 1, i + delta));
  return CEFR_ORDER[ni];
}

let _syncFn = null;
export function enableTutorSync(fn) { _syncFn = fn; }
async function maybeSync(sid, profile) {
  if (_syncFn) try { await _syncFn(sid, profile); } catch { /* silent */ }
}

function loadProfile(studentId) {
  try {
    const raw = localStorage.getItem(STORE_KEY(studentId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveProfile(studentId, profile) {
  localStorage.setItem(STORE_KEY(studentId), JSON.stringify(profile));
  maybeSync(studentId, profile);
}

export function getDefaultProfile(studentId) {
  return {
    studentId,
    cefrLevel: 'B1',
    targetLevel: 'B2',
    totalAnswered: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    // SM-2 per-item: { [exerciseId]: { ease, interval, due, reps, lapses } }
    sm2: {},
    // weak skills counted from incorrect answers: { reading: 2, grammar: 5 }
    weakSkills: {},
    // last 50 results for progress chart
    history: [],
    updatedAt: new Date().toISOString(),
  };
}

export function getTutorProfile(studentId) {
  if (!studentId) return getDefaultProfile('anon');
  return loadProfile(studentId) || getDefaultProfile(studentId);
}

export function saveTutorProfile(studentId, patch) {
  const cur = getTutorProfile(studentId);
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };
  saveProfile(studentId, next);
  return next;
}

// SM-2 update (simplified): quality 0-5, correct = quality >=3
// interval: 1,3,7,14,30 days; ease adjusted ±0.1/0.15
export function recordTutorAnswer(studentId, itemId, { correct, skill, quality }) {
  const p = getTutorProfile(studentId);
  const q = Number.isFinite(quality) ? quality : (correct ? 4 : 1);
  const isCorrect = correct || q >= 3;

  // --- CEFR / streak ---
  p.totalAnswered += 1;
  if (isCorrect) { p.correct += 1; p.streak += 1; p.bestStreak = Math.max(p.bestStreak, p.streak); }
  else p.streak = 0;

  // adaptive difficulty: 3 correct in a row -> bump, 2 wrong in a row -> drop
  const last3 = [...p.history.slice(-2).map(h => h.correct), isCorrect];
  if (last3.length === 3 && last3.every(Boolean) && p.streak >= 3) {
    p.cefrLevel = nextCEFR(p.cefrLevel, 1);
  } else if (p.history.slice(-1)[0] && !p.history.slice(-1)[0].correct && !isCorrect) {
    // two consecutive incorrect -> ease down (but never below B1 for B2 target)
    if (CEFR_ORDER.indexOf(p.cefrLevel) > CEFR_ORDER.indexOf('B1')) {
      p.cefrLevel = nextCEFR(p.cefrLevel, -1);
    }
  }

  // weak skills
  const sk = (skill || 'general').toLowerCase();
  if (!isCorrect) p.weakSkills[sk] = (p.weakSkills[sk] || 0) + 1;
  else if (p.weakSkills[sk]) p.weakSkills[sk] = Math.max(0, p.weakSkills[sk] - 1);

  // SM-2 per item
  const prev = p.sm2[itemId] || { ease: SM2_DEFAULT_EASE, interval: 0, reps: 0, lapses: 0 };
  let nextEase = prev.ease + (isCorrect ? 0.1 : -0.2);
  nextEase = Math.max(1.3, Math.min(2.8, nextEase));
  let nextInterval;
  if (!isCorrect) {
    nextInterval = 1;
  } else if (prev.reps === 0) nextInterval = 1;
  else if (prev.reps === 1) nextInterval = 3;
  else nextInterval = Math.ceil(prev.interval * nextEase);
  // snap to REVIEW_INTERVALS
  nextInterval = REVIEW_INTERVALS.reduce((a, b) => Math.abs(b - nextInterval) < Math.abs(a - nextInterval) ? b : a);

  p.sm2[itemId] = {
    ease: Number(nextEase.toFixed(2)),
    interval: nextInterval,
    due: new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString(),
    reps: isCorrect ? prev.reps + 1 : 0,
    lapses: isCorrect ? prev.lapses : prev.lapses + 1,
  };

  p.history.push({ itemId, skill: sk, correct: isCorrect, quality: q, at: new Date().toISOString(), cefrLevel: p.cefrLevel });
  if (p.history.length > 50) p.history = p.history.slice(-50);

  saveProfile(studentId, p);

  // also record into spaced-repetition if this item originated from review schedule
  try {
    const all = getAllEntries(studentId);
    const match = all.find(e => e.id === itemId || e.errorId === itemId);
    if (match) srRecordPractice(studentId, match.id, isCorrect);
  } catch { /* non-review item */ }

  try {
    trackEvent({ eventType: 'tutor_answer', itemId, itemType: 'met_tutor', correct: isCorrect, meta: { skill: sk, quality: q, cefrLevel: p.cefrLevel, interval: nextInterval } });
  } catch { /* telemetry best-effort */ }

  return p;
}

export function getTutorQueue(studentId) {
  // Priority 1: spaced-repetition due items (from homework error bank)
  try {
    const due = getDueItems(studentId);
    if (due.length) return { source: 'spaced-repetition', count: due.length, sample: due.slice(0, 3) };
  } catch { /* no SR */ }
  return { source: 'tutor-sm2', count: 0, sample: [] };
}

export function getTutorStats(studentId) {
  const p = getTutorProfile(studentId);
  const acc = p.totalAnswered ? Math.round((p.correct / p.totalAnswered) * 100) : 0;
  const dueInfo = getTutorQueue(studentId);
  const weakList = Object.entries(p.weakSkills).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return {
    cefrLevel: p.cefrLevel,
    totalAnswered: p.totalAnswered,
    correct: p.correct,
    accuracy: acc,
    streak: p.streak,
    bestStreak: p.bestStreak,
    dueCount: dueInfo.count,
    weakSkills: weakList,
    history: p.history.slice(-10),
  };
}

export function resetTutorProfile(studentId) {
  const fresh = getDefaultProfile(studentId);
  saveProfile(studentId, fresh);
  return fresh;
}
