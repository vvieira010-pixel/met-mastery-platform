import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCourseCredits } from '../src/domain/course-credits.js';

test('sums explicit class credits and subtracts only completed classes', () => {
  assert.deepEqual(calculateCourseCredits({
    payments: [{ classCredits: 6 }, { classCredits: 4 }],
    classEvents: [
      { status: 'completed' }, { status: 'completed' },
      { status: 'scheduled' }, { status: 'cancelled' },
    ],
  }), {
    hasRecordedCredits: true,
    purchasedClasses: 10,
    completedClasses: 2,
    remainingClasses: 8,
  });
});

test('does not invent credits from money and never returns a negative count', () => {
  assert.deepEqual(calculateCourseCredits({
    payments: [{ amount: 500 }, { classCredits: 2 }],
    classEvents: [{ status: 'completed' }, { status: 'completed' }, { status: 'completed' }],
  }), {
    hasRecordedCredits: true,
    purchasedClasses: 2,
    completedClasses: 3,
    remainingClasses: 0,
  });
  assert.equal(calculateCourseCredits({ payments: [{ amount: 500 }], classEvents: [] }).hasRecordedCredits, false);
});
