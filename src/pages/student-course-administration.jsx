import { useEffect, useState } from 'react';
import { Icon } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { getPayments } from '../domain/payments.js';

function downloadReceipt(receipt) {
  if (!receipt?.dataUrl) return;
  const link = document.createElement('a');
  link.href = receipt.dataUrl;
  link.download = receipt.name || 'payment-receipt';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function CourseAdministration({ student, onMessage }) {
  const [payments, setPayments] = useState([]);
  const [showArrangement, setShowArrangement] = useState(false);

  useEffect(() => {
    getPayments(student?.id).then(setPayments).catch(() => setPayments([]));
  }, [student?.id]);

  const receipts = payments.filter(payment => payment.receipt?.dataUrl);
  const arrangement = payments.some(payment => payment.arrangement);

  return (
    <section className="student-panel" style={{ marginBottom: 'var(--space-4)' }} data-testid="student-course-administration">
      <div className="student-panel-head">
        <div>
          <span className="student-panel-kicker">Course administration</span>
          <h2>Your course records</h2>
        </div>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 var(--space-3)' }}>
        Your learning progress and feedback are independent from payment records.
      </p>
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="card-row" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}><Icon.lock size={17} /><div className="card-row-body"><div className="card-row-title">Course access</div></div><span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>Active</span></div>
        <div className="card-row" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}><Icon.doc size={17} /><div className="card-row-body"><div className="card-row-title">Payment plan</div></div><span style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Private</span><Button variant="ghost" size="sm" onClick={() => setShowArrangement(value => !value)}>{showArrangement ? 'Hide' : 'View arrangements'}</Button></div>
        {showArrangement && <p className="card-row-meta" style={{ margin: 'var(--space-2) 0 var(--space-3)' }}>{arrangement ? 'A flexible course arrangement is in place. Your teacher can help with any questions.' : 'Your course arrangements are private. Contact your teacher if you would like to discuss them.'}</p>}
        <div className="card-row" style={{ padding: 'var(--space-3) 0' }}><Icon.download size={17} /><div className="card-row-body"><div className="card-row-title">Receipts</div></div><span style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>{receipts.length} available</span></div>
        {receipts.map(payment => <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}><span>{payment.receipt.name}</span><Button variant="ghost" size="sm" onClick={() => downloadReceipt(payment.receipt)}><Icon.download size={13} /> Download</Button></div>)}
      </div>
      <div className="alert-box" style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><span>Questions about your plan?</span><Button variant="ghost" size="sm" onClick={() => onMessage?.('messages')}>Send a message</Button></div>
    </section>
  );
}