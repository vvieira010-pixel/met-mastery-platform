import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon, Pill, SectionHeader } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { getPayments, PAYMENT_METHODS, savePayment } from '../domain/payments.js';

const EMPTY_FORM = { amount: '', currency: 'BRL', receivedOn: new Date().toISOString().slice(0, 10), method: 'pix', reference: '', note: '', arrangement: false, receipt: null };
const MAX_RECEIPT_BYTES = 1024 * 1024;

function formatMoney(payment) {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: payment.currency || 'BRL' }).format(payment.amount); }
  catch { return `${payment.currency || 'BRL'} ${payment.amount}`; }
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : '—';
}

function downloadReceipt(receipt) {
  if (!receipt?.dataUrl) return;
  const link = document.createElement('a');
  link.href = receipt.dataUrl;
  link.download = receipt.name || 'payment-receipt';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function StudentPayments({ studentId }) {
  const [payments, setPayments] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);

  const load = useCallback(async () => {
    setPayments(await getPayments(studentId));
  }, [studentId]);

  useEffect(() => { load().catch(error => window.toast?.(error.message, 'warn')); }, [load]);

  async function handleReceipt(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || file.size > MAX_RECEIPT_BYTES) {
      window.toast?.('Choose a PDF, JPG or PNG file up to 1 MB.', 'warn');
      event.target.value = '';
      return;
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('The receipt could not be read.'));
      reader.readAsDataURL(file);
    });
    setForm(current => ({ ...current, receipt: { name: file.name, type: file.type, size: file.size, dataUrl } }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await savePayment({ ...form, studentId });
      setForm(EMPTY_FORM);
      setOpen(false);
      await load();
      window.toast?.('Payment record saved.', 'ok');
    } catch (error) {
      window.toast?.(error.message, 'warn');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack-list" data-testid="teacher-payments">
      <section className="card" style={{ padding: 'var(--space-5)' }}>
        <SectionHeader
          title="Course administration"
          sub="Private course records. These never affect a student’s feedback or progress."
          action={<Button variant="ghost" size="sm" onClick={() => setOpen(value => !value)} aria-expanded={open}><Icon.plus size={14} /> Record payment</Button>}
        />
        {payments.some(payment => payment.arrangement) && <Pill tone="info" style={{ marginTop: 'var(--space-2)' }}>Arrangement in place</Pill>}

        {open && (
          <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }} data-testid="payment-form">
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              <label className="field-label">Amount<input className="input" required min="0.01" step="0.01" type="number" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} /></label>
              <label className="field-label">Currency<input className="input" required maxLength="3" value={form.currency} onChange={event => setForm(current => ({ ...current, currency: event.target.value.toUpperCase() }))} /></label>
              <label className="field-label">Received on<input className="input" required type="date" value={form.receivedOn} onChange={event => setForm(current => ({ ...current, receivedOn: event.target.value }))} /></label>
              <label className="field-label">Method<select className="input" value={form.method} onChange={event => setForm(current => ({ ...current, method: event.target.value }))}>{PAYMENT_METHODS.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}</select></label>
            </div>
            <div className="form-grid" style={{ marginTop: 'var(--space-3)', gridTemplateColumns: '1fr 1fr' }}>
              <label className="field-label">Reference<input className="input" maxLength="80" placeholder="Optional reference" value={form.reference} onChange={event => setForm(current => ({ ...current, reference: event.target.value }))} /></label>
              <label className="field-label">Receipt <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span><input ref={fileInput} className="input" type="file" accept="application/pdf,image/jpeg,image/png" onChange={handleReceipt} /></label>
            </div>
            {form.receipt && <p className="card-row-meta" style={{ marginTop: 'var(--space-2)' }}><Icon.doc size={13} /> {form.receipt.name}</p>}
            <label className="field-label" style={{ display: 'block', marginTop: 'var(--space-3)' }}>Private note<textarea className="input" rows="3" maxLength="1000" placeholder="Optional note for your records" value={form.note} onChange={event => setForm(current => ({ ...current, note: event.target.value }))} /></label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)' }}><input type="checkbox" checked={form.arrangement} onChange={event => setForm(current => ({ ...current, arrangement: event.target.checked }))} /> Flexible arrangement in place</label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}><Button type="button" variant="ghost" onClick={() => { setOpen(false); setForm(EMPTY_FORM); }}>Cancel</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save payment'}</Button></div>
          </form>
        )}

        <div style={{ marginTop: 'var(--space-4)', overflowX: 'auto' }}>
          {payments.length === 0 ? <p className="card-row-meta">No payment records yet.</p> : (
            <table className="data-table" style={{ minWidth: 620 }}><thead><tr><th>Received</th><th>Method</th><th>Reference</th><th>Amount</th><th>Receipt</th></tr></thead><tbody>{payments.map(payment => (
              <tr key={payment.id}><td>{formatDate(payment.receivedOn)}</td><td>{PAYMENT_METHODS.find(method => method.value === payment.method)?.label || 'Other'}</td><td>{payment.reference || '—'}</td><td>{formatMoney(payment)}</td><td>{payment.receipt ? <Button variant="ghost" size="sm" onClick={() => downloadReceipt(payment.receipt)}><Icon.download size={13} /> {payment.receipt.name}</Button> : '—'}</td></tr>
            ))}</tbody></table>
          )}
        </div>
      </section>
    </div>
  );
}