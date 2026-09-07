# Student Class Credit Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a student privately see how many paid class credits remain after completed classes, without exposing financial information.

**Architecture:** Store the number of classes bought as an explicit `classCredits` integer on every newly recorded payment. A small pure domain calculator will sum those credits and subtract only completed class events. The teacher payment form owns the financial input; the student Course administration page consumes only the calculator’s count result and renders neutral course-progress copy.

**Tech Stack:** React 19, JavaScript ES modules, existing domain modules, Supabase/localStorage adapter, Node built-in test runner, Vite.

**Spec:** `docs/superpowers/specs/2026-09-06-student-class-credit-indicator.md`

## Global Constraints

- Do not derive class quantity from `payment.amount`, currency, payment method, receipt, reference, private note, or arrangement status.
- New course payments must record `classCredits` as an integer from 1 through 100; legacy records may keep `classCredits: null`.
- Count only `classEvent.status === 'completed'` as a used class. Scheduled, cancelled, and other statuses must not reduce remaining classes.
- Do not change `student.totalSessions`; it is a separate profile target and is not payment-linked.
- Put the student indicator only in `student-course-administration.jsx`; do not add a payment or credit badge to the student dashboard, feedback, homework, or practice pages.
- Student-facing class-credit markup must not contain price, currency, payment method, reference, receipt, note, arrangement, “payment due,” “invoice,” “balance,” or debt language.
- Preserve existing teacher-only receipts, arrangements, and payment records.

---

## File structure

| File | Responsibility |
|---|---|
| `src/domain/course-credits.js` | Pure, shared calculation of purchased, completed, and remaining class counts. |
| `src/domain/payments.js` | Validate and persist the payment’s optional/required class-credit field while preserving legacy rows. |
| `src/pages/student-payments.jsx` | Teacher-only input and history column for `classCredits`. |
| `src/pages/student-course-administration.jsx` | Student-only discreet rendering of the calculated class count. |
| `tests/course-credits.test.js` | Executable calculation contract for normal, exhausted, legacy, and non-completed-event cases. |
| `tests/payments.test.js` | Payment persistence and validation contract for class credits. |
| `tests/student-course-administration.test.js` | Source-level student-privacy and integration contract, matching the project’s existing JSX test style. |

### Task 1: Create the course-credit domain calculator

**Files:**

- Create: `src/domain/course-credits.js`
- Create: `tests/course-credits.test.js`

**Interfaces:**

- Consumes: `payments: Array<{ classCredits?: number | null }>` and `classEvents: Array<{ status?: string }>`.
- Produces: `calculateCourseCredits({ payments, classEvents }): { hasRecordedCredits: boolean, purchasedClasses: number, completedClasses: number, remainingClasses: number }`.

- [ ] **Step 1: Write the failing calculation tests**

```js
// tests/course-credits.test.js
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

test('does not invent class credits from legacy payments and never returns a negative count', () => {
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
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

Run: `node --test tests/course-credits.test.js`

Expected: FAIL because `src/domain/course-credits.js` does not exist.

- [ ] **Step 3: Implement the pure calculation contract**

```js
// src/domain/course-credits.js
function validClassCredits(value) {
  return Number.isInteger(value) && value >= 1 && value <= 100;
}

export function calculateCourseCredits({ payments = [], classEvents = [] } = {}) {
  const creditPayments = payments.filter(payment => validClassCredits(payment?.classCredits));
  const purchasedClasses = creditPayments.reduce((total, payment) => total + payment.classCredits, 0);
  const completedClasses = classEvents.filter(event => event?.status === 'completed').length;

  return {
    hasRecordedCredits: creditPayments.length > 0,
    purchasedClasses,
    completedClasses,
    remainingClasses: Math.max(0, purchasedClasses - completedClasses),
  };
}
```

- [ ] **Step 4: Run the calculation tests**

Run: `node --test tests/course-credits.test.js`

Expected: PASS; 10 purchased / 2 completed returns 8 remaining, scheduled and cancelled events are ignored, and legacy payments do not create guessed credits.

- [ ] **Step 5: Commit the isolated domain change**

```bash
git add src/domain/course-credits.js tests/course-credits.test.js
git commit -m "feat: calculate remaining class credits"
```

### Task 2: Record explicit classes included with teacher payments

**Files:**

- Modify: `src/domain/payments.js:1-31`
- Modify: `src/pages/student-payments.jsx:5-106`
- Modify: `tests/payments.test.js:15-41`

**Interfaces:**

- Consumes: Teacher form value `classCredits` as a numeric string or number.
- Produces: A saved payment with `classCredits: number` for new course payments; `getPayments()` continues to return legacy payments with no guessed value.

- [ ] **Step 1: Extend the payment test with class-credit persistence and invalid values**

```js
await savePayment({
  studentId: 'student-1', amount: 200, currency: 'BRL',
  receivedOn: '2026-08-12', method: 'bank-transfer', classCredits: '8',
});
const payments = await getPayments('student-1');
assert.equal(payments[0].classCredits, 8);

await assert.rejects(
  () => savePayment({ studentId: 'student-1', amount: 10, receivedOn: '2026-08-12', method: 'pix', classCredits: 1.5 }),
  /whole number of classes/
);
await assert.rejects(
  () => savePayment({ studentId: 'student-1', amount: 10, receivedOn: '2026-08-12', method: 'pix', classCredits: 101 }),
  /between 1 and 100/
);
```

- [ ] **Step 2: Run the payment test and confirm the new assertions fail**

Run: `node --test tests/payments.test.js`

Expected: FAIL because `savePayment()` does not yet store or validate `classCredits`.

- [ ] **Step 3: Validate and persist `classCredits` without changing legacy records**

```js
// src/domain/payments.js, inside savePayment before saveVia
const rawClassCredits = data.classCredits;
const classCredits = rawClassCredits === null || rawClassCredits === undefined || rawClassCredits === ''
  ? null
  : Number(rawClassCredits);
if (classCredits !== null && !Number.isInteger(classCredits)) {
  throw new Error('Enter a whole number of classes.');
}
if (classCredits !== null && (classCredits < 1 || classCredits > 100)) {
  throw new Error('Enter between 1 and 100 classes.');
}

// add to the saved record
classCredits,
```

- [ ] **Step 4: Add the teacher-only “Classes included” field and private history column**

```jsx
// src/pages/student-payments.jsx
const EMPTY_FORM = { amount: '', classCredits: '', currency: 'BRL', /* existing fields */ };

<label className="field-label">
  Classes included
  <input
    className="input"
    required
    min="1"
    max="100"
    step="1"
    type="number"
    value={form.classCredits}
    onChange={event => setForm(current => ({ ...current, classCredits: event.target.value }))}
  />
</label>

// Add a private teacher-table heading and value.
<th>Classes</th>
<td>{payment.classCredits ? `${payment.classCredits} classes` : 'Not set'}</td>
```

Keep this field in the teacher-only `StudentPayments` page. Its helper copy should say: “Used for the student’s private classes-remaining count; price is never shown there.”

- [ ] **Step 5: Run the payment test and focused lint**

Run: `node --test tests/payments.test.js && .\\node_modules\\.bin\\eslint.cmd src/domain/payments.js src/pages/student-payments.jsx --max-warnings 0`

Expected: PASS. A valid integer is saved, decimal/out-of-range values are rejected, and the teacher form renders a required input.

- [ ] **Step 6: Commit the payment-record change**

```bash
git add src/domain/payments.js src/pages/student-payments.jsx tests/payments.test.js
git commit -m "feat: record classes included with payments"
```

### Task 3: Add the discreet student course-progress line

**Files:**

- Modify: `src/pages/student-course-administration.jsx:1-57`
- Create: `tests/student-course-administration.test.js`

**Interfaces:**

- Consumes: `getPayments(student.id)`, `getClassEvents(student.id)`, and `calculateCourseCredits({ payments, classEvents })`.
- Produces: A student-only line with remaining/used class counts when explicit credits exist; no class count when all payments are legacy rows.

- [ ] **Step 1: Write a failing student-privacy and integration test**

```js
// tests/student-course-administration.test.js
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('course administration shows a discreet class count without financial fields', async () => {
  const source = await readFile(new URL('../src/pages/student-course-administration.jsx', import.meta.url), 'utf8');

  assert.match(source, /getClassEvents/);
  assert.match(source, /calculateCourseCredits/);
  assert.match(source, /Classes remaining/);
  assert.match(source, /classes remaining/);
  assert.doesNotMatch(source, /formatMoney|payment\.amount|payment\.currency|payment\.method|payment\.reference/);
});
```

- [ ] **Step 2: Run the test and confirm the integration is absent**

Run: `node --test tests/student-course-administration.test.js`

Expected: FAIL because the component does not yet load class events or use `calculateCourseCredits`.

- [ ] **Step 3: Load only the two required record sets and calculate the display state**

```jsx
// src/pages/student-course-administration.jsx imports
import { getClassEvents } from '../lib/workflow.js';
import { calculateCourseCredits } from '../domain/course-credits.js';

// component state
const [courseCredits, setCourseCredits] = useState(null);

// effect body
Promise.all([getPayments(student?.id), getClassEvents(student?.id)])
  .then(([payments, classEvents]) => {
    setPayments(payments);
    setCourseCredits(calculateCourseCredits({ payments, classEvents }));
  })
  .catch(() => {
    setPayments([]);
    setCourseCredits(null);
  });
```

- [ ] **Step 4: Render the neutral count inside the existing Course access row**

```jsx
{courseCredits?.hasRecordedCredits && (
  <div className="card-row-body" style={{ marginTop: 'var(--space-1)' }}>
    <div className="card-row-title">Classes remaining</div>
    <div className="card-row-meta">
      {courseCredits.remainingClasses === 0
        ? 'No classes remaining'
        : `${courseCredits.remainingClasses} ${courseCredits.remainingClasses === 1 ? 'class' : 'classes'} remaining`}
      {' · '}{courseCredits.completedClasses} of {courseCredits.purchasedClasses} completed
    </div>
  </div>
)}
```

Place it beneath the existing green “Active” access status. Do not make it clickable, do not use an alert color, and retain the existing “Questions about your plan? Send a message” route as the only follow-up path.

- [ ] **Step 5: Run student privacy, calculator, and payment tests**

Run: `node --test tests/course-credits.test.js tests/payments.test.js tests/student-course-administration.test.js`

Expected: PASS. The source contains the private course-count integration and does not contain financial fields in the student component.

- [ ] **Step 6: Commit the student display**

```bash
git add src/pages/student-course-administration.jsx tests/student-course-administration.test.js
git commit -m "feat: show remaining classes in student course settings"
```

### Task 4: Verify the teacher-to-student flow in the browser

**Files:**

- Modify: none unless the checks below find a defect.
- Test: `tests/course-credits.test.js`, `tests/payments.test.js`, `tests/student-course-administration.test.js`

**Interfaces:**

- Consumes: A teacher account with one test student and the saved payment/class-event records from Tasks 1–3.
- Produces: Evidence that the student sees a correct, non-financial class count in the real UI.

- [ ] **Step 1: Record a controlled teacher payment**

In the teacher’s **Students → student profile → Payments** tab, record a test payment with `Classes included = 10`. Confirm the private teacher table shows `10 classes`.

- [ ] **Step 2: Create completed and non-completed class records**

For the same student, mark two class events `completed`, leave one `scheduled`, and mark one `cancelled`.

- [ ] **Step 3: Open the student Settings → Course administration screen**

Expected visible copy: `8 classes remaining · 2 of 10 completed`.

Confirm that the screen does not show the amount, currency, method, payment reference, receipt filename, private note, arrangement status, a payment warning, or a debt/balance label.

- [ ] **Step 4: Verify the exhausted state**

Create enough completed class events to use all ten credits. Refresh the student Course administration screen.

Expected visible copy: `No classes remaining · 10 of 10 completed`, presented without an error style or blocking access.

- [ ] **Step 5: Run the complete focused verification set**

Run: `node --test tests/course-credits.test.js tests/payments.test.js tests/student-course-administration.test.js && .\\node_modules\\.bin\\vite.cmd build`

Expected: All tests pass and Vite produces the production bundle. Treat existing unrelated Vite chunk-size warnings separately from this feature.

- [ ] **Step 6: Commit only after browser verification**

```bash
git add src/domain/course-credits.js src/domain/payments.js src/pages/student-payments.jsx src/pages/student-course-administration.jsx tests/course-credits.test.js tests/payments.test.js tests/student-course-administration.test.js
git commit -m "feat: add private remaining class count for students"
```

## Self-review

**Spec coverage:** Task 1 implements the exact calculation. Task 2 makes every new payment auditable with an explicit class quantity. Task 3 limits student output to course counts and removes financial fields from that display. Task 4 proves the full teacher-to-student flow, including scheduled/cancelled exclusion and the exhausted state.

**Placeholder scan:** No task contains unfinished markers, unspecified validation, or implicit tests. Every implementation task identifies exact modules, the interface it creates, a failing test, a command, expected behavior, and a focused commit.

**Type consistency:** `classCredits` is an integer `1..100` on a payment. `calculateCourseCredits` returns `hasRecordedCredits`, `purchasedClasses`, `completedClasses`, and `remainingClasses`; the student component consumes those exact names.
