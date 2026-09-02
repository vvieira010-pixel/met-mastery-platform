import { K, uid, listVia, saveVia, removeVia } from '../lib/workflow-core.js';

const METHODS = new Set(['bank-transfer', 'pix', 'card-link', 'cash', 'other']);

export async function getPayments(studentId) {
  const records = await listVia('payments', K.payments, studentId ? (payment => payment.studentId === studentId) : null);
  return records.sort((a, b) => String(b.receivedOn || b.createdAt).localeCompare(String(a.receivedOn || a.createdAt)));
}

export async function savePayment(data) {
  const amount = Number(data.amount);
  const method = METHODS.has(data.method) ? data.method : 'other';
  if (!data.studentId) throw new Error('A student is required.');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) throw new Error('Enter a valid payment amount.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.receivedOn || ''))) throw new Error('Choose the date received.');

  return saveVia('payments', K.payments, {
    id: data.id || uid(),
    studentId: data.studentId,
    amount,
    currency: /^[A-Z]{3}$/.test(String(data.currency || '').toUpperCase()) ? String(data.currency).toUpperCase() : 'BRL',
    receivedOn: data.receivedOn,
    method,
    reference: String(data.reference || '').trim().slice(0, 80),
    note: String(data.note || '').trim().slice(0, 1000),
    arrangement: Boolean(data.arrangement),
    receipt: data.receipt || null,
    createdAt: data.createdAt || new Date().toISOString(),
  });
}

export async function deletePayment(id) {
  return removeVia('payments', K.payments, id);
}

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'bank-transfer', label: 'Bank transfer' },
  { value: 'card-link', label: 'Payment link' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];