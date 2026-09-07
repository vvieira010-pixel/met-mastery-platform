# Student Class Credit Indicator Specification

## Problem

Students need a clear answer to “how many classes do I still have?” without exposing tuition amounts, payment methods, receipt references, payment status, or private teacher notes in their learning experience.

## Product decision

Show a small course-progress line only in the student’s existing **Course administration** screen:

> **Classes remaining**  
> 8 classes remaining · 4 of 12 completed

The line is deliberately not placed on the student home dashboard, homework screen, feedback screens, or next-class card. It uses neutral copy and normal/quiet status styling; it is never framed as a balance, an invoice, a payment warning, or a debt notice.

## Source of truth

Money cannot reliably determine class quantity because packages, discounts, and arrangements can have different prices. Each teacher payment record must therefore store an explicit integer `classCredits` value: the number of classes that payment adds to the student’s course.

```
classes purchased = sum(payment.classCredits for this student)
classes completed = count(classEvent.status === 'completed' for this student)
classes remaining = max(0, classes purchased - classes completed)
```

Scheduled, cancelled, and no-show class events do not reduce the count. A legacy payment without `classCredits` is not guessed from its amount and contributes no credit. The student sees no count until at least one payment has an explicit class-credit value.

## Acceptance criteria

- New teacher payment records require a whole-number “Classes included” value from 1 through 100.
- The teacher can see this value in the private payment table.
- The student’s Course administration page shows the remaining and completed counts only when explicit credit data exists.
- The student page never renders amount, currency, payment method, payment reference, receipt filename, private note, or arrangement status in the class-credit indicator.
- A completed class reduces the displayed remaining count by one; scheduled and cancelled events do not.
- When all explicit credits are used, show “No classes remaining” in the same calm presentation, without an error or payment alert.
- Existing payment records remain readable and do not gain guessed credits.

