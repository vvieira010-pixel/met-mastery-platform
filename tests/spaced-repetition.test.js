// In-memory localStorage shim so the browser-bound modules run under node --test.
// NOTE: this surfaces a real portability gap — spaced-repetition.js `save()` and
// fading-manager.js `setScaffoldLevel`/`logSession` call localStorage.setItem
// unguarded and will throw in any non-browser env (SSR, Node, tests).
class MemStorage {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new MemStorage();

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  initSchedule,
  recordPractice,
  getDueItems,
  getDueCount,
  markSRMastered,
  toMCQ,
  getAllEntries,
} from '../src/lib/spaced-repetition.js';
import {
  classifyRetrieval,
  evaluateFading,
  hintLimit,
  recallGateActive,
  getLevelInfo,
  computeCalibration,
  extractErrorCategories,
  setScaffoldLevel,
  logSession,
} from '../src/lib/fading-manager.js';

const uid = () => 't_' + Math.random().toString(36).slice(2, 8);

describe('spaced-repetition — initSchedule', () => {
  test('creates entry: interval 1, not mastered, due in future', () => {
    const sid = uid();
    const e = initSchedule(sid, { id: 'err1', error: 'He go', correct: 'He goes' });
    assert.equal(e.errorId, 'err1');
    assert.equal(e.interval, 1);
    assert.equal(e.mastered, false);
    assert.equal(e.practiceCount, 1);
    assert.ok(new Date(e.nextDue).getTime() > Date.now());
  });
  test('does not duplicate an existing error entry', () => {
    const sid = uid();
    const a = initSchedule(sid, { id: 'errX', error: 'x', correct: 'X' });
    const b = initSchedule(sid, { id: 'errX', error: 'x', correct: 'X' });
    assert.equal(a.id, b.id);
    assert.equal(getAllEntries(sid).length, 1);
  });
});

describe('spaced-repetition — recordPractice interval progression', () => {
  test('high-confidence correct advances 1 -> 3 -> 7 -> 14 -> 30', () => {
    const sid = uid();
    let e = initSchedule(sid, { id: 'err2', error: 'a', correct: 'A' });
    e = recordPractice(sid, e.id, true, 5);
    assert.equal(e.interval, 3);
    e = recordPractice(sid, e.id, true, 5);
    assert.equal(e.interval, 7);
    e = recordPractice(sid, e.id, true, 5);
    assert.equal(e.interval, 14);
    e = recordPractice(sid, e.id, true, 5);
    assert.equal(e.interval, 30); // capped at max interval
  });
  test('incorrect resets interval to 1', () => {
    const sid = uid();
    let e = initSchedule(sid, { id: 'err3', error: 'a', correct: 'A' });
    e = recordPractice(sid, e.id, true, 5);
    assert.equal(e.interval, 3);
    e = recordPractice(sid, e.id, false);
    assert.equal(e.interval, 1);
  });
});

describe('spaced-repetition — due items + mastery', () => {
  test('fresh item not due; past-due appears; mastered filtered out', () => {
    const sid = uid();
    initSchedule(sid, { id: 'err4', error: 'a', correct: 'A' });
    assert.equal(getDueCount(sid), 0); // nextDue is ~1 day ahead

    // White-box: flip nextDue into the past via the storage shim.
    const key = `vv:reviewSchedule:${sid}`;
    const list = JSON.parse(localStorage.getItem(key));
    list[0].nextDue = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem(key, JSON.stringify(list));

    assert.equal(getDueCount(sid), 1);
    assert.equal(getDueItems(sid).length, 1);

    markSRMastered(sid, 'err4');
    assert.equal(getDueCount(sid), 0); // mastered excluded from due
  });
});

describe('spaced-repetition — toMCQ', () => {
  test('produces 4 options with correctText as the answer', () => {
    const sid = uid();
    const e = initSchedule(sid, { id: 'err5', error: 'bad', correct: 'Good sentence.' });
    const mcq = toMCQ(e, []);
    assert.equal(mcq.type, 'mcq');
    assert.equal(mcq.options.length, 4);
    assert.equal(mcq.options[mcq.correct], 'Good sentence.');
  });
});

describe('fading-manager — classifyRetrieval', () => {
  test('independent strong recall', () => {
    assert.equal(classifyRetrieval(3, false, 95), 'strong');
  });
  test('assisted low score', () => {
    assert.equal(classifyRetrieval(0, true, 40), 'minimal');
  });
  test('mid retrieval', () => {
    assert.equal(classifyRetrieval(2, true, 65), 'partial');
  });
});

describe('fading-manager — level gates', () => {
  test('hintLimit tiers', () => {
    assert.equal(hintLimit(4), 2);
    assert.equal(hintLimit(3), 2);
    assert.equal(hintLimit(2), 1);
    assert.equal(hintLimit(1), 0);
    assert.equal(hintLimit(0), 0);
  });
  test('recallGateActive at level >= 3', () => {
    assert.equal(recallGateActive(3), true);
    assert.equal(recallGateActive(2), false);
  });
  test('getLevelInfo falls back for unknown level', () => {
    assert.equal(getLevelInfo(0).label, 'Independent');
    assert.equal(getLevelInfo(99).label, 'Guided Practice');
  });
});

describe('fading-manager — calibration + errors', () => {
  test('computeCalibration detects overconfidence', () => {
    const c = computeCalibration([{ confidenceBefore: 9, score: 50 }]);
    assert.equal(c.trend, 'overconfident');
    assert.ok(c.gap > 15);
  });
  test('computeCalibration detects underconfidence', () => {
    const c = computeCalibration([{ confidenceBefore: 5, score: 80 }]);
    assert.equal(c.trend, 'underconfident');
  });
  test('computeCalibration null for empty', () => {
    assert.equal(computeCalibration([]), null);
  });
  test('extractErrorCategories counts', () => {
    const cats = extractErrorCategories([
      { errorCategories: ['prep', 'article'] },
      { errorCategories: ['prep'] },
    ]);
    const prep = cats.find(c => c.category === 'prep');
    assert.equal(prep.count, 2);
  });
});

describe('fading-manager — evaluateFading verdicts', () => {
  test('level 4 storage is migrated to level 3 and cannot reduce past the new maximum', () => {
    const mode = 'mode';
    const topic = uid();
    setScaffoldLevel(mode, topic, 4);
    const v = evaluateFading(mode, topic);
    assert.equal(v.currentLevel, 3);
    assert.equal(v.verdict, 'hold');
  });
  test('two minimal low-score sessions -> restore', () => {
    const mode = 'mode';
    const topic = uid();
    setScaffoldLevel(mode, topic, 2);
    logSession(mode, topic, { quality: 'minimal', score: 40 });
    logSession(mode, topic, { quality: 'minimal', score: 45 });
    const v = evaluateFading(mode, topic);
    assert.equal(v.verdict, 'restore');
    assert.equal(v.newLevel, 3);
  });
  test('too few sessions -> hold', () => {
    const mode = 'mode';
    const topic = uid();
    setScaffoldLevel(mode, topic, 4);
    logSession(mode, topic, { quality: 'strong', maxHintLevel: 0, score: 95 });
    const v = evaluateFading(mode, topic);
    assert.equal(v.verdict, 'hold');
  });
});
