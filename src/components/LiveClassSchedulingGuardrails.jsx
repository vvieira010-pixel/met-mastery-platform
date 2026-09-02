import { useState } from 'react';
import { Icon } from './shared.jsx';
import { updateClassEventStatus, sendMessage } from '../lib/workflow.js';

export default function LiveClassSchedulingGuardrails({
  classes = [],
  student = {},
  onClassUpdated,
  onNavigateToMessages,
  className = '',
  'data-testid': testId = 'live-class-scheduling-guardrails',
}) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [actionType, setActionType] = useState(null); // 'cancel' | 'reschedule' | 'policy-lock'
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [policyModalClass, setPolicyModalClass] = useState(null);
  const [now] = useState(() => new Date());
  const [minRescheduleDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  // Normalize upcoming classes
  const sortedClasses = (classes || [])
    .filter(c => c.status !== 'cancelled')
    .map(c => {
      const dateStr = c.date || new Date().toISOString().slice(0, 10);
      const timeStr = c.startTime || '12:00';
      const startObj = c.startAt instanceof Date ? c.startAt : new Date(`${dateStr}T${timeStr}`);
      const hoursUntil = (startObj.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isOver24h = hoursUntil >= 24;

      return {
        ...c,
        startObj,
        hoursUntil,
        isOver24h,
      };
    })
    .filter(c => c.startObj >= now)
    .sort((a, b) => a.startObj - b.startObj);

  const handleOpenAction = (cls, type) => {
    if (!cls.isOver24h) {
      // Trigger policy guardrail modal
      setPolicyModalClass(cls);
      return;
    }
    setSelectedClass(cls);
    setActionType(type);
    setReason('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedClass) return;
    setProcessing(true);
    try {
      await updateClassEventStatus(selectedClass.id, {
        status: 'cancelled',
        cancellationReason: reason.trim() || 'Student requested with 24+ hour advance notice',
        cancelledAt: new Date().toISOString(),
      });

      // Notify teacher
      try {
        await sendMessage({
          fromStudentId: student.id,
          fromName: student.firstName || student.name || 'Student',
          fromRole: 'student',
          toRole: 'teacher',
          type: 'class-cancellation',
          body: `Live class on ${selectedClass.date} was cancelled by student with 24+ hours advance notice. Reason: ${reason || 'Schedule adjustment'}`,
        });
      } catch {
        /* ignore notification error */
      }

      window.toast?.('Class cancelled with verified 24-hour advance notice.', 'ok');
      setSelectedClass(null);
      setActionType(null);
      if (onClassUpdated) onClassUpdated(selectedClass.id, 'cancelled');
    } catch (err) {
      console.error('[SchedulingGuardrails] cancel failed:', err);
      window.toast?.('Could not update class. Please retry.', 'err');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedClass || !newDate) {
      window.toast?.('Please select a requested new date.', 'warn');
      return;
    }
    setProcessing(true);
    try {
      await updateClassEventStatus(selectedClass.id, {
        rescheduleRequested: true,
        requestedDate: newDate,
        requestedTime: newTime,
        rescheduleReason: reason.trim() || 'Student request with 24+ hour notice',
      });

      // Send message to teacher
      try {
        await sendMessage({
          fromStudentId: student.id,
          fromName: student.firstName || student.name || 'Student',
          fromRole: 'student',
          toRole: 'teacher',
          type: 'class-reschedule-request',
          body: `Reschedule request for class originally on ${selectedClass.date}: proposed new time is ${newDate} at ${newTime}. Notice given: ${Math.round(selectedClass.hoursUntil)} hours in advance.`,
        });
      } catch {
        /* ignore */
      }

      window.toast?.('Reschedule request sent to teacher with verified 24-hour notice.', 'ok');
      setSelectedClass(null);
      setActionType(null);
      if (onClassUpdated) onClassUpdated(selectedClass.id, 'rescheduled');
    } catch (err) {
      console.error('[SchedulingGuardrails] reschedule failed:', err);
      window.toast?.('Could not submit reschedule request. Please retry.', 'err');
    } finally {
      setProcessing(false);
    }
  };

  const handleEmergencyMessageTeacher = async (cls) => {
    setPolicyModalClass(null);
    if (onNavigateToMessages) {
      onNavigateToMessages(`Regarding emergency adjustment for class on ${cls.date} (${cls.startTime})...`);
    } else {
      window.toast?.('Navigating to Messages to contact your teacher directly.', 'ok');
    }
  };

  return (
    <div
      className={`live-class-scheduling-guardrails ${className}`}
      data-testid={testId}
      style={{
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--primary, #0284c7)',
              }}
            >
              Scheduling Guardrails
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
              24-Hour Policy Enforcement
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
            Upcoming Live Classes & Scheduling Controls
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted, #64748b)' }}>
            Changes and cancellations require at least 24 hours advance notice to respect instructional preparation.
          </p>
        </div>

        {/* Policy Pill Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: 8 }}>
          <Icon.clock size={14} style={{ color: '#d97706' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>
            Enforced 24h Advance Notice
          </span>
        </div>
      </div>

      {/* Class List */}
      {sortedClasses.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg, #f8fafc)', borderRadius: 8, color: 'var(--muted, #64748b)', fontSize: '0.82rem' }}>
          No upcoming live classes scheduled at this moment. Check with your teacher to book your next session!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedClasses.map(cls => {
            const dateStr = cls.startObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
            const timeStr = cls.startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const hoursLeft = Math.max(0, Math.floor(cls.hoursUntil));
            const minsLeft = Math.max(0, Math.floor((cls.hoursUntil * 60) % 60));

            return (
              <div
                key={cls.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: 'var(--bg, #f8fafc)',
                  border: `1px solid ${cls.isOver24h ? 'var(--border, #e2e8f0)' : 'rgba(245, 158, 11, 0.4)'}`,
                }}
                data-testid={`upcoming-class-row-${cls.id}`}
              >
                {/* Left: Class Details */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 8,
                      background: cls.isOver24h ? 'rgba(2, 132, 199, 0.1)' : 'rgba(245, 158, 11, 0.12)',
                      color: cls.isOver24h ? 'var(--primary, #0284c7)' : '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon.calendar size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text, #0f172a)' }}>
                        {cls.title || 'Live MET Strategy Session'}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: cls.isOver24h ? 'rgba(22, 163, 74, 0.1)' : 'rgba(245, 158, 11, 0.15)',
                          color: cls.isOver24h ? '#16a34a' : '#b45309',
                        }}
                      >
                        {cls.isOver24h ? `In ${hoursLeft}h (Policy Met)` : `Locked: Starts in ${hoursLeft}h ${minsLeft}m`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: 'var(--text-2, #334155)' }}>
                      <span><Icon.clock size={13} /> {dateStr} at {timeStr}</span>
                      <span><Icon.progress size={13} /> Focus: {cls.metSkillFocus || cls.classFocus || 'MET Intensive'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Guarded Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {cls.isOver24h ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(cls, 'reschedule')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--border, #cbd5e1)',
                          background: 'var(--surface, #ffffff)',
                          color: 'var(--text, #0f172a)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        data-testid={`reschedule-btn-${cls.id}`}
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(cls, 'cancel')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.05)',
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        data-testid={`cancel-btn-${cls.id}`}
                      >
                        Cancel Class
                      </button>
                    </>
                  ) : (
                    /* Locked State under 24 hours */
                    <button
                      type="button"
                      onClick={() => handleOpenAction(cls, 'policy-lock')}
                      title="Adjustments within 24 hours are locked by policy"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        background: 'rgba(245, 158, 11, 0.08)',
                        color: '#92400e',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                      data-testid={`locked-policy-btn-${cls.id}`}
                    >
                      <Icon.lock size={13} /> 24h Lock · Policy Notice
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal: Cancel with 24h+ notice */}
      {selectedClass && actionType === 'cancel' && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{ background: 'var(--surface, #ffffff)', padding: 24, borderRadius: 12, maxWidth: 460, width: '100%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#dc2626' }}>Cancel Upcoming Class</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2, #334155)', margin: '0 0 14px' }}>
              Verified: You have provided <strong>{Math.round(selectedClass.hoursUntil)} hours advance notice</strong> (exceeds the 24-hour requirement). Your teacher will be notified immediately.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted, #64748b)', marginBottom: 4 }}>
                Reason for cancellation (optional):
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Work commitment conflict, need more preparation time..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border, #cbd5e1)', fontSize: '0.8rem' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border, #cbd5e1)', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={processing}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                data-testid="confirm-cancel-btn"
              >
                {processing ? 'Processing...' : 'Confirm 24h+ Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal: Reschedule with 24h+ notice */}
      {selectedClass && actionType === 'reschedule' && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{ background: 'var(--surface, #ffffff)', padding: 24, borderRadius: 12, maxWidth: 460, width: '100%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: 'var(--text, #0f172a)' }}>Request Class Reschedule</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2, #334155)', margin: '0 0 14px' }}>
              Notice policy met ({Math.round(selectedClass.hoursUntil)} hours in advance). Propose a new date and time for your teacher:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted, #64748b)', marginBottom: 4 }}>
                  Requested Date:
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={minRescheduleDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border, #cbd5e1)', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted, #64748b)', marginBottom: 4 }}>
                  Requested Time:
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border, #cbd5e1)', fontSize: '0.8rem' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted, #64748b)', marginBottom: 4 }}>
                Reason / Note:
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add a note to your teacher..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border, #cbd5e1)', fontSize: '0.8rem' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border, #cbd5e1)', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={processing}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--primary, #0284c7)', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                data-testid="confirm-reschedule-btn"
              >
                {processing ? 'Sending...' : 'Send Reschedule Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Guardrail Notice Modal (<24 hours) */}
      {policyModalClass && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{ background: 'var(--surface, #ffffff)', padding: 24, borderRadius: 12, maxWidth: 460, width: '100%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', marginBottom: 10 }}>
              <Icon.lock size={22} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#92400e' }}>24-Hour Notice Policy Guardrail</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text, #1e293b)', lineHeight: 1.5, margin: '0 0 12px' }}>
              Under the VV Method Course Policy, self-service cancellations and adjustments are locked within <strong>24 hours of class start</strong>.
            </p>
            <div style={{ padding: '10px 14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: 16, fontSize: '0.78rem', color: '#78350f' }}>
              <strong>Class session begins in {Math.floor(policyModalClass.hoursUntil)} hours {Math.floor((policyModalClass.hoursUntil * 60) % 60)} minutes.</strong>
              <div style={{ marginTop: 4 }}>
                For unexpected emergencies, please message your teacher directly in the platform messages to coordinate.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setPolicyModalClass(null)}
                style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border, #cbd5e1)', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleEmergencyMessageTeacher(policyModalClass)}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--primary, #0284c7)', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                data-testid="emergency-message-teacher-btn"
              >
                <Icon.chat size={14} /> Message Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
