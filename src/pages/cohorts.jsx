import { useState, useEffect } from 'react';
import { Icon, SectionHeader, Pill, Avatar } from '../components/shared.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { getStudents, getCohorts, getDiagnoses, getHomework, getAllSubmissions, getClassEvents, setStudentCohort } from '../lib/workflow.js';
import { buildReadinessEvidence, getReadinessDisplay, buildSkillsFromDiagnosis } from '../lib/report-metrics.js';

export default function CohortsPage({ onNavigate, "data-testid": testId }) {
  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [active, setActive] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [homework, setHomework] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [classEvents, setClassEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [s, dx, hw, sub, ce] = await Promise.all([
        getStudents(),
        getDiagnoses(),
        getHomework(),
        getAllSubmissions(),
        getClassEvents(),
      ]);
      setStudents(s);
      setDiagnoses(dx);
      setHomework(hw);
      setSubmissions(sub);
      setClassEvents(ce);
      setCohorts(getCohorts());
    } catch (e) {
      window.toast?.(`Error: ${e.message}`, 'warn');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function getCohortReadiness(cohort) {
    const cohortStudents = students.filter(s => cohort.studentIds.includes(s.id));
    if (cohortStudents.length === 0) return null;
    const allScores = [];
    for (const s of cohortStudents) {
      const dx = diagnoses.filter(d => d.studentId === s.id && d.status === 'approved')
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
      if (dx) {
        const skills = buildSkillsFromDiagnosis(dx);
        const evidence = buildReadinessEvidence(skills, 2);
        if (evidence.readiness != null) allScores.push(evidence.readiness);
      }
    }
    if (allScores.length === 0) return null;
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  }

  function getCohortHomeworkRate(cohort) {
    const cohortIds = new Set(cohort.studentIds);
    const total = homework.filter(h => cohortIds.has(h.studentId)).length;
    if (total === 0) return null;
    const done = homework.filter(h => cohortIds.has(h.studentId) && ['submitted', 'reviewed', 'completed', 'corrected'].includes(h.status)).length;
    return Math.round((done / total) * 100);
  }

  if (loading) return (
    <div className="page-shell" data-testid={testId}>
      <SectionHeader title="Cohorts" sub="Loading..." />
    </div>
  );

  return (
    <div className="page-shell">
      <SectionHeader title="Cohorts" sub={`${cohorts.length} group${cohorts.length !== 1 ? 's' : ''}`} />

      {!active && (
        <div className="grid-square" style={{ marginTop: 'var(--space-4)' }}>
          {cohorts.map(cohort => {
            const readiness = getCohortReadiness(cohort);
            const hwRate = getCohortHomeworkRate(cohort);
            const studentCount = cohort.studentIds.length;
            return (
              <Card key={cohort.name} className="square-card" onClick={() => setActive(cohort)} style={{ cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>{cohort.name}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: 4 }}>{studentCount} student{studentCount !== 1 ? 's' : ''}</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {readiness != null && <Pill tone={readiness >= 70 ? 'success' : readiness >= 45 ? 'warning' : 'danger'}>Avg readiness: {readiness}%</Pill>}
                  {hwRate != null && <Pill tone={hwRate >= 70 ? 'success' : 'info'}>Homework: {hwRate}%</Pill>}
                </div>
                <Button variant="ghost" size="sm" style={{ marginTop: 'auto', alignSelf: 'center' }}>View Cohort</Button>
              </Card>
            );
          })}
        </div>
      )}

      {active && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Button variant="ghost" size="sm" onClick={() => setActive(null)}><Icon.chevronLeft size={14} /> Back</Button>
            <SectionHeader title={active.name} sub={`${active.studentIds.length} students`} />
          </div>

          {active.studentIds.map(id => {
            const s = students.find(st => st.id === id);
            if (!s) return null;
            const dx = diagnoses.filter(d => d.studentId === id && d.status === 'approved')
              .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
            const hwPending = homework.filter(h => h.studentId === id && !['submitted', 'reviewed', 'completed', 'corrected'].includes(h.status)).length;
            const subPending = submissions.some(sub => sub.studentId === id && sub.status === 'submitted');
            const hasDiagnosis = Boolean(dx);
            return (
              <Card key={id} style={{ marginBottom: 'var(--space-2)', cursor: 'pointer' }} onClick={() => onNavigate('students:profile', { studentId: id })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Avatar name={s.name} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{s.currentLevel} → {s.targetLevel}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {hasDiagnosis && <Pill tone="success">Diagnosed</Pill>}
                    {hwPending > 0 && <Pill tone="warning">{hwPending} pending</Pill>}
                    {subPending && <Pill tone="danger">Needs review</Pill>}
                    {!hasDiagnosis && !hwPending && !subPending && <Pill tone="muted">Up to date</Pill>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
