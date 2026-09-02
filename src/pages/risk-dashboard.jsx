import { useState, useEffect, useMemo } from 'react';
import { SectionHeader, Pill, Avatar } from '../components/shared.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { getStudents, getDiagnoses, getHomework, getAllSubmissions, getReviews, getErrorBank, getCohorts } from '../lib/workflow.js';
import { getDueCount } from '../lib/spaced-repetition.js';
import { buildRiskScore, buildCohortComparison } from '../lib/risk-metrics.js';

export default function RiskDashboard({ onNavigate, "data-testid": testId }) {
  const [students, setStudents] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [homework, setHomework] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [errorBanks, setErrorBanks] = useState({});
  const [srDues, setSrDues] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [selected, setSelected] = useState(null);

  async function load() {
    try {
      const [s, dx, hw, sub, rev] = await Promise.all([
        getStudents(),
        getDiagnoses(),
        getHomework(),
        getAllSubmissions(),
        getReviews(),
        getCohorts(),
      ]);
      setStudents(s);
      setDiagnoses(dx);
      setHomework(hw);
      setSubmissions(sub);
      setReviews(rev);

      const eb = {};
      const sr = {};
      await Promise.all((s || []).map(async (st) => {
        eb[st.id] = await getErrorBank(st.id);
        sr[st.id] = getDueCount(st.id);
      }));
      setErrorBanks(eb);
      setSrDues(sr);
    } catch (e) {
      window.toast?.(`Error: ${e.message}`, 'warn');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const allData = useMemo(() => ({ students, diagnoses, homework, submissions, reviews, errorBanks, srDues }), [students, diagnoses, homework, submissions, reviews, errorBanks, srDues]);

  const riskScores = useMemo(() => (students || []).map(s => ({
    student: s,
    risk: buildRiskScore(s.id, allData),
  })), [students, allData]);

  const cohortComparisons = useMemo(() => getCohorts().map(c => buildCohortComparison(c.name, c.studentIds, allData)), [allData]);

  const filtered = useMemo(() => {
    let f = riskScores;
    if (filter === 'high') f = f.filter(r => r.risk.level === 'high');
    else if (filter === 'medium') f = f.filter(r => r.risk.level === 'medium');
    else if (filter === 'low') f = f.filter(r => r.risk.level === 'low');
    if (sortBy === 'score') f = [...f].sort((a, b) => a.risk.score - b.risk.score);
    else if (sortBy === 'name') f = [...f].sort((a, b) => (a.student.name || '').localeCompare(b.student.name || ''));
    return f;
  }, [riskScores, filter, sortBy]);

  const highCount = useMemo(() => riskScores.filter(r => r.risk.level === 'high').length, [riskScores]);
  const mediumCount = useMemo(() => riskScores.filter(r => r.risk.level === 'medium').length, [riskScores]);
  const lowCount = useMemo(() => riskScores.filter(r => r.risk.level === 'low').length, [riskScores]);

  if (loading) return (
    <div className="page-shell" data-testid={testId}>
      <SectionHeader title="Risk Dashboard" sub="Loading..." />
    </div>
  );

  return (
    <div className="page-shell">
      <SectionHeader title="Risk Dashboard" sub={`${students.length} students · ${highCount} high risk`} />

      <div className="kpi-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <Card className="kpi-card"><div className="kpi-value" style={{ color: 'var(--danger)' }}>{highCount}</div><div className="kpi-label">High Risk</div></Card>
        <Card className="kpi-card"><div className="kpi-value" style={{ color: 'var(--warning)' }}>{mediumCount}</div><div className="kpi-label">Medium Risk</div></Card>
        <Card className="kpi-card"><div className="kpi-value" style={{ color: 'var(--success)' }}>{lowCount}</div><div className="kpi-label">Low Risk</div></Card>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
        {['all', 'high', 'medium', 'low'].map(f => (
          <Button key={f} variant={filter === f ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <Button variant="ghost" size="sm" onClick={() => setSortBy(sortBy === 'score' ? 'name' : 'score')}>
            Sort by {sortBy === 'score' ? 'name' : 'risk'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {filtered.map(({ student, risk }) => (
          <Card as="div" key={student.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === student.id ? null : student)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Avatar name={student.name} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{student.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{student.currentLevel} → {student.targetLevel} · {student.cohort || 'No cohort'}</div>
              </div>
              <Pill tone={risk.level === 'high' ? 'danger' : risk.level === 'medium' ? 'warning' : 'success'}>
                {risk.score}% · {risk.level}
              </Pill>
            </div>
            {selected?.id === student.id && (
              <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Risk Factors:</div>
                {risk.factors.length === 0 && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>No significant risk factors detected</div>}
                {risk.factors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', padding: '3px 0' }}>
                    <span>{f.label}</span>
                    <span style={{ color: f.weight < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{f.weight > 0 ? '+' : ''}{f.weight}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onNavigate('students:profile', { studentId: student.id }); }}>
                    Profile
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onNavigate('diagnostics:create', { studentId: student.id }); }}>
                    New Diagnosis
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onNavigate('homework:create', { studentId: student.id }); }}>
                    Assign Homework
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {cohortComparisons.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <SectionHeader title="Cohort Comparison" sub="Risk distribution across groups" />
          <div className="grid-square">
            {cohortComparisons.map(cc => (
              <Card key={cc.cohortName} className="square-card">
                <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>{cc.cohortName}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: 4 }}>{cc.studentCount} students</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {cc.avgRiskScore != null && <Pill tone={cc.avgRiskScore >= 70 ? 'success' : cc.avgRiskScore >= 40 ? 'warning' : 'danger'}>Avg risk: {cc.avgRiskScore}%</Pill>}
                  {cc.avgHomeworkRate != null && <Pill tone="info">Homework: {cc.avgHomeworkRate}%</Pill>}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                  {cc.riskDistribution.high > 0 && <Pill tone="danger">{cc.riskDistribution.high} high</Pill>}
                  {cc.riskDistribution.medium > 0 && <Pill tone="warning">{cc.riskDistribution.medium} med</Pill>}
                  {cc.riskDistribution.low > 0 && <Pill tone="success">{cc.riskDistribution.low} low</Pill>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
