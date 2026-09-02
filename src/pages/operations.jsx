import { useEffect, useMemo, useState } from 'react';
import { Avatar, Icon, Pill, SectionHeader } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { getClassEvents, getCohorts, getPayments, getStudents } from '../lib/workflow.js';

const TODAY = () => new Date().toISOString().slice(0, 10);

function money(value, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(value || 0));
}

export default function OperationsPage({ onNavigate, 'data-testid': testId }) {
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getStudents(), getClassEvents(), getPayments(), getCohorts()])
      .then(([roster, classes, records, groups]) => {
        if (!active) return;
        setStudents(roster || []);
        setEvents(classes || []);
        setPayments(records || []);
        setCohorts(groups || []);
      })
      .catch((error) => window.toast?.(`Could not load operations: ${error.message}`, 'warn'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const data = useMemo(() => {
    const today = TODAY();
    const upcoming = events.filter(e => e.status === 'scheduled' && e.date >= today).sort((a, b) => `${a.date}${a.startTime || ''}`.localeCompare(`${b.date}${b.startTime || ''}`));
    const completed = events.filter(e => e.status === 'completed');
    const missingDiagnosis = completed.filter(e => e.diagnosticStatus === 'not-started');
    const paidThisMonth = payments.filter(p => String(p.receivedOn || '').slice(0, 7) === today.slice(0, 7));
    const received = paidThisMonth.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const cohortRows = cohorts.map(cohort => ({ ...cohort, count: (cohort.studentIds || []).length }));
    return { today, upcoming, missingDiagnosis, received, paidThisMonth, cohortRows };
  }, [cohorts, events, payments]);

  if (loading) return <div className="page-shell" data-testid={testId}><SectionHeader title="Operations" sub="Loading school operations…" /></div>;

  return (
    <div className="page-container" data-testid={testId}>
      <div className="flex flex-between items-start mb-6 gap-4">
        <div>
          <h1 className="page-headline">Operations</h1>
          <p className="page-sub">Programme health, timetable follow-up, cohorts, and payment visibility.</p>
        </div>
        <Button variant="primary" onClick={() => onNavigate('calendar')}><Icon.calendar size={14} /> Schedule class</Button>
      </div>

      <section className="kpi-grid" aria-label="Operations summary" style={{ marginBottom: 'var(--space-5)' }}>
        <Metric label="Active learners" value={students.length} detail={`${data.cohortRows.length} cohort${data.cohortRows.length === 1 ? '' : 's'}`} tone="var(--primary)" />
        <Metric label="Upcoming classes" value={data.upcoming.length} detail={data.upcoming[0] ? `Next: ${data.upcoming[0].date}` : 'Nothing scheduled'} tone="var(--info)" />
        <Metric label="Needs diagnosis" value={data.missingDiagnosis.length} detail="Completed classes awaiting feedback" tone="var(--warning)" />
        <Metric label="Received this month" value={money(data.received)} detail={`${data.paidThisMonth.length} payment${data.paidThisMonth.length === 1 ? '' : 's'} logged`} tone="var(--success)" compact />
      </section>

      <div className="grid-2fr-1fr">
        <Card style={{ padding: 'var(--space-4)' }}>
          <SectionHeader title="Programme follow-up" sub="Turn completed teaching into the next learner action." />
          {data.missingDiagnosis.length === 0 ? (
            <p className="text-sm text-muted" style={{ marginTop: 12 }}>No completed classes are waiting for a diagnosis.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {data.missingDiagnosis.slice(0, 6).map(event => {
                const learner = students.find(student => student.id === event.studentId);
                return <div key={event.id} className="flex items-center gap-3" style={{ padding: '10px 0', borderBottom: '1px solid var(--divider)' }}>
                  <Avatar name={learner?.name || 'Learner'} size={34} />
                  <div className="flex-1 min-w-0"><strong className="text-sm">{learner?.name || 'Learner'}</strong><div className="text-xs text-muted">{event.date} · {event.metSkillFocus || event.classFocus || 'Class evidence ready'}</div></div>
                  <Button size="sm" variant="primary" onClick={() => onNavigate('diagnostics:create', { studentId: event.studentId, classEventId: event.id })}>Diagnose</Button>
                </div>;
              })}
            </div>
          )}
        </Card>

        <Card style={{ padding: 'var(--space-4)' }}>
          <SectionHeader title="Cohort health" sub="Learners grouped for planning." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {data.cohortRows.length === 0 ? <p className="text-sm text-muted">No cohorts have been created yet.</p> : data.cohortRows.map(cohort => (
              <button key={cohort.id || cohort.name} type="button" onClick={() => onNavigate('cohorts')} style={{ textAlign: 'left', padding: 10, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                <div className="flex flex-between gap-2"><strong className="text-sm">{cohort.name}</strong><Pill tone="info">{cohort.count}</Pill></div>
                <div className="text-xs text-muted mt-1">Open cohort planning and readiness.</div>
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => onNavigate('cohorts')} style={{ marginTop: 12 }}>Manage cohorts <Icon.arrowR size={13} /></Button>
        </Card>
      </div>

      <Card style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        <SectionHeader title="Next scheduled classes" action={<Button size="sm" variant="ghost" onClick={() => onNavigate('calendar')}>Open calendar</Button>} />
        {data.upcoming.length === 0 ? <p className="text-sm text-muted" style={{ marginTop: 12 }}>No future classes scheduled. Add the next class so the learner journey remains visible.</p> : (
          <div className="grid-square" style={{ marginTop: 12 }}>
            {data.upcoming.slice(0, 8).map(event => {
              const learner = students.find(student => student.id === event.studentId);
              return <div key={event.id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex flex-between gap-2"><strong className="text-sm">{learner?.name || 'Learner'}</strong><Pill tone="info">{event.date}</Pill></div>
                <div className="text-xs text-muted mt-1">{event.startTime || 'Time not set'} · {event.metSkillFocus || event.title || 'MET class'}</div>
                <Button size="sm" variant="ghost" onClick={() => onNavigate('calendar:class', { classEventId: event.id })} style={{ marginTop: 8 }}>Open class</Button>
              </div>;
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Metric({ label, value, detail, tone, compact = false }) {
  return <Card className="kpi-card"><div className="kpi-value" style={{ color: tone, fontSize: compact ? 'var(--text-2xl)' : undefined }}>{value}</div><div className="kpi-label">{label}</div><div className="text-xs text-muted" style={{ marginTop: 4 }}>{detail}</div></Card>;
}
