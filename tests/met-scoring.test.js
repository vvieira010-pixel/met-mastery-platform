import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  percentToScaled,
  rawToScaled,
  scaledToCefr,
  getCefrLevelFromPercent,
  computeScaledScores,
  distanceFromTarget,
  targetMessage,
  TARGET_OVERALL,
} from '../src/lib/met-scoring.ts';
import {
  scoreSection,
  scoreReading,
  scoreListening,
  getAllReadingQuestions,
  getAllListeningQuestions,
} from '../src/lib/mock-test-scoring.js';

describe('met-scoring — percentToScaled / rawToScaled', () => {
  test('100% -> 80, 0% -> 0, 50% -> 40', () => {
    assert.equal(percentToScaled(100), 80);
    assert.equal(percentToScaled(0), 0);
    assert.equal(percentToScaled(50), 40);
  });
  test('clamps out-of-range', () => {
    assert.equal(percentToScaled(150), 80);
    assert.equal(percentToScaled(-20), 0);
  });
  test('rawToScaled divides by max', () => {
    assert.equal(rawToScaled(40, 40), 80);
    assert.equal(rawToScaled(20, 40), 40);
    assert.equal(rawToScaled(5, 0), 0); // guard zero max
  });
});

describe('met-scoring — CEFR bands', () => {
  test('band boundaries', () => {
    assert.equal(scaledToCefr(0), 'A2');
    assert.equal(scaledToCefr(39), 'A2');
    assert.equal(scaledToCefr(40), 'B1');
    assert.equal(scaledToCefr(52), 'B1');
    assert.equal(scaledToCefr(53), 'B2');
    assert.equal(scaledToCefr(63), 'B2');
    assert.equal(scaledToCefr(64), 'C1');
    assert.equal(scaledToCefr(80), 'C1');
    assert.equal(scaledToCefr(999), 'C1'); // clamp
  });
  test('getCefrLevelFromPercent wraps correctly', () => {
    assert.equal(getCefrLevelFromPercent(100), 'C1');
    assert.equal(getCefrLevelFromPercent(0), 'A2');
    assert.equal(getCefrLevelFromPercent(66), 'B2'); // 0.66*80=52.8 -> 53 B2
  });
});

describe('met-scoring — computeScaledScores + targets', () => {
  test('two perfect sections -> overall 80 C1', () => {
    const s = computeScaledScores({
      listening: { total: 40, max: 40 },
      reading: { total: 40, max: 40 },
    });
    assert.equal(s.listening, 80);
    assert.equal(s.reading, 80);
    assert.equal(s.overall, 80);
    assert.equal(s.cefr, 'C1');
  });

  test('only listening present -> overall = listening scaled', () => {
    const s = computeScaledScores({ listening: { total: 20, max: 40 } });
    assert.equal(s.listening, 40);
    assert.equal(s.reading, 0); // absent sections default to 0 in output
    assert.equal(s.overall, 40); // average of available only
    assert.equal(s.cefr, 'B1');
  });

  test('overall hitting TARGET_OVERALL (58) reports target met', () => {
    const s = computeScaledScores({ listening: { total: 29, max: 40 } }); // 72.5% -> 58
    assert.equal(s.overall, TARGET_OVERALL);
    assert.equal(s.cefr, 'B2');
    assert.equal(distanceFromTarget(s).overall, 0);
    assert.match(targetMessage(s), /Overall target met/);
  });
});

describe('mock-test-scoring — scoreSection (pure, injected)', () => {
  const questions = [
    { id: 'q1', type: 'mcq', level: 'B2', answer: 2 },
    { id: 'q2', type: 'mcq', level: 'B2', answer: 0 },
  ];
  const pts = () => 1;

  test('all correct', () => {
    const r = scoreSection({ q1: 2, q2: 0 }, questions, pts);
    assert.equal(r.total, 2);
    assert.equal(r.max, 2);
    assert.ok(r.details.every(d => d.correct));
  });
  test('all wrong', () => {
    const r = scoreSection({ q1: 0, q2: 1 }, questions, pts);
    assert.equal(r.total, 0);
    assert.equal(r.max, 2);
  });
  test('partial', () => {
    const r = scoreSection({ q1: 2, q2: 9 }, questions, pts);
    assert.equal(r.total, 1);
    assert.equal(r.max, 2);
    assert.equal(r.details[0].correct, true);
    assert.equal(r.details[1].correct, false);
  });
});

describe('mock-test-scoring — real bank consistency', () => {
  test('scoreReading returns documented shape; details length == max', () => {
    const r = scoreReading({});
    assert.equal(r.total, 0);
    assert.ok(Array.isArray(r.details));
    assert.equal(r.details.length, r.max); // every question gets a detail row
  });
  test('answering every reading question correctly yields max', () => {
    const qs = getAllReadingQuestions();
    const allCorrect = {};
    qs.forEach(q => { allCorrect[q.id] = q.answer; });
    const r = scoreReading(allCorrect);
    assert.equal(r.total, r.max);
    assert.ok(r.details.every(d => d.correct));
  });
  test('scoreListening returns documented shape; details length == max', () => {
    const qs = getAllListeningQuestions();
    const r = scoreListening({});
    assert.equal(r.total, 0);
    assert.ok(Array.isArray(r.details));
    assert.equal(r.details.length, r.max);
  });

  test('mock-test-1 reading bank is populated with valid 4-option MCQs', () => {
    const qs = getAllReadingQuestions();
    assert.ok(qs.length > 0);
    qs.forEach(q => {
      assert.ok(q.id, 'question has id');
      assert.equal(q.options.length, 4, `options length for ${q.id}`);
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `answer in range for ${q.id}`);
    });
  });
  test('mock-test-1 listening bank is populated with valid 4-option MCQs', () => {
    const qs = getAllListeningQuestions();
    assert.ok(qs.length > 0);
    qs.forEach(q => {
      assert.ok(q.id, 'question has id');
      assert.equal(q.options.length, 4, `options length for ${q.id}`);
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `answer in range for ${q.id}`);
    });
  });
});
