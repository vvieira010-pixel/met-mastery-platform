import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
};

const { getPayments, savePayment } = await import('../src/domain/payments.js');

beforeEach(() => storage.clear());

test('payment records are validated and returned newest first for the student', async () => {
  await savePayment({
    studentId: 'student-1', amount: '180.50', currency: 'brl', receivedOn: '2026-08-01', method: 'pix', reference: 'PIX-001',
  });
  await savePayment({
    studentId: 'student-1', amount: 200, currency: 'BRL', receivedOn: '2026-08-12', method: 'bank-transfer', arrangement: true,
    receipt: { name: 'receipt.pdf', type: 'application/pdf', size: 42, dataUrl: 'data:application/pdf;base64,AA==' },
  });
  await savePayment({ studentId: 'student-2', amount: 99, currency: 'BRL', receivedOn: '2026-08-18', method: 'cash' });

  const payments = await getPayments('student-1');
  assert.equal(payments.length, 2);
  assert.equal(payments[0].receivedOn, '2026-08-12');
  assert.equal(payments[0].currency, 'BRL');
  assert.equal(payments[0].receipt.name, 'receipt.pdf');
  assert.equal(payments[1].reference, 'PIX-001');
});

test('payment records reject invalid amounts and dates', async () => {
  await assert.rejects(() => savePayment({ studentId: 'student-1', amount: 0, receivedOn: '2026-08-12', method: 'pix' }), /valid payment amount/);
  await assert.rejects(() => savePayment({ studentId: 'student-1', amount: 10, receivedOn: '12-08-2026', method: 'pix' }), /date received/);
});