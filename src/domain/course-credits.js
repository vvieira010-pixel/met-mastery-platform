function validClassCredits(value) {
  return Number.isInteger(value) && value >= 1 && value <= 100;
}

/**
 * Returns a student-safe course count. Money, receipts, and payment status
 * deliberately play no part in this calculation.
 */
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
