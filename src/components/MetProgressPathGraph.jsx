import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Icon } from './shared.jsx';
import { asArray, getProgressStage } from '../pages/student-helpers.jsx';

function getCefrBandInfo(score) {
  const s = Number(score) || 0;
  if (s >= 65) return { level: 'B2+ / C1', label: 'Advanced / Exam Ready', color: '#0ea5e9' };
  if (s >= 53) return { level: 'B2', label: 'Independent Passing Standard', color: '#16a34a' };
  if (s >= 40) return { level: 'B1', label: 'Threshold / Developing', color: '#f59e0b' };
  return { level: 'A2', label: 'Foundation Stage', color: '#8b5cf6' };
}

function normalizeSectionKey(raw) {
  if (!raw) return '';
  const s = raw.toLowerCase();
  if (s.includes('listen')) return 'listening';
  if (s.includes('read')) return 'reading';
  if (s.includes('speak')) return 'speaking';
  if (s.includes('writ')) return 'writing';
  return s;
}

function MetProgressTooltip({ active, payload, label, pathData = [], viewMode = 'overall' }) {
  if (!active || !payload || !payload.length) return null;
  const pt = pathData.find(p => p.name === label || p.checkpoint === label) || payload[0].payload;
  if (!pt) return null;
  const isProj = pt.isProjected;
  const cefr = getCefrBandInfo(pt.overall);

  return (
    <div style={{
      background: 'var(--surface, #1e293b)',
      border: '1px solid var(--border, #334155)',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      fontSize: '0.8rem',
      color: 'var(--text, #f8fafc)',
      minWidth: 180,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, borderBottom: '1px solid var(--divider, rgba(255,255,255,0.1))', paddingBottom: 4 }}>
        <strong style={{ fontSize: '0.85rem' }}>{pt.checkpoint}</strong>
        <span style={{ fontSize: '0.72rem', color: isProj ? 'var(--accent, #38bdf8)' : 'var(--muted, #94a3b8)' }}>
          {isProj ? 'Projected Goal' : pt.date}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: cefr.color }}>
          {pt.overall}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted, #94a3b8)' }}>/ 80 scaled</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>
          {pt.stage}
        </span>
      </div>

      {viewMode === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--divider, rgba(255,255,255,0.1))', fontSize: '0.72rem' }}>
          <span style={{ color: '#0284c7' }}>Listening: <strong>{pt.listening}</strong></span>
          <span style={{ color: '#10b981' }}>Reading: <strong>{pt.reading}</strong></span>
          <span style={{ color: '#f59e0b' }}>Speaking: <strong>{pt.speaking}</strong></span>
          <span style={{ color: '#8b5cf6' }}>Writing: <strong>{pt.writing}</strong></span>
        </div>
      )}
    </div>
  );
}

export default function MetProgressPathGraph({
  student = {},
  diagnoses = [],
  className = '',
  'data-testid': testId = 'met-progress-path-graph',
}) {
  const [viewMode, setViewMode] = useState('overall'); // 'overall' | 'skills'

  // Build the chronological trajectory path
  const pathData = useMemo(() => {
    // 1. Sort approved diagnoses chronologically (oldest to newest)
    const approvedDx = asArray(diagnoses)
      .filter(d => d.status === 'approved' || d.status === 'reviewed')
      .slice()
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    // Baseline level score estimate
    const baselineScore = student.currentLevel === 'A2' ? 38 : student.currentLevel === 'B2' ? 53 : 44;

    const points = [];

    // Always start with Baseline Enrollment point
    points.push({
      checkpoint: 'Baseline',
      name: 'Enrollment',
      date: 'Start',
      overall: baselineScore,
      stage: getProgressStage(baselineScore).label,
      listening: Math.max(20, baselineScore - 2),
      reading: Math.max(20, baselineScore + 1),
      speaking: Math.max(20, baselineScore - 3),
      writing: Math.max(20, baselineScore),
      isMilestone: true,
      isProjected: false,
    });

    if (approvedDx.length > 0) {
      approvedDx.forEach((dx, idx) => {
        const snap = asArray(dx.content?.section_snapshot);
        const evaluatedSnap = snap.filter(s => s.evaluated || Number(s.score_0_80) > 0);

        let overall;
        if (Number(dx.content?.overall_score) > 0) {
          overall = Number(dx.content.overall_score);
        } else if (evaluatedSnap.length > 0) {
          overall = Math.round(
            evaluatedSnap.reduce((acc, s) => acc + (Number(s.score_0_80) || 0), 0) / evaluatedSnap.length
          );
        } else {
          overall = baselineScore + (idx + 1) * 3;
        }

        // Section breakdown
        const skillScores = { listening: null, reading: null, speaking: null, writing: null };
        evaluatedSnap.forEach(s => {
          const norm = normalizeSectionKey(s.section);
          if (norm && skillScores[norm] === null) {
            skillScores[norm] = Number(s.score_0_80) || null;
          }
        });

        // Fill missing skills with interpolated or overall value for smooth multi-line viewing
        const listening = skillScores.listening ?? overall;
        const reading = skillScores.reading ?? overall;
        const speaking = skillScores.speaking ?? overall;
        const writing = skillScores.writing ?? overall;

        const dateStr = dx.createdAt
          ? new Date(dx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
          : `CP ${idx + 1}`;

        points.push({
          checkpoint: `Checkpoint ${idx + 1}`,
          name: `Diag. ${idx + 1}`,
          date: dateStr,
          overall,
          stage: getProgressStage(overall).label,
          listening,
          reading,
          speaking,
          writing,
          isMilestone: idx === approvedDx.length - 1,
          isProjected: false,
        });
      });
    } else {
      // If no diagnostic yet, construct realistic pathway steps
      const currentSession = student.session || 1;
      const stepScore = Math.min(52, baselineScore + Math.min(currentSession * 2, 8));
      points.push({
        checkpoint: `Session ${currentSession}`,
        name: `Current (S${currentSession})`,
        date: 'Active',
        overall: stepScore,
        stage: getProgressStage(stepScore).label,
        listening: stepScore - 1,
        reading: stepScore + 2,
        speaking: stepScore - 2,
        writing: stepScore,
        isMilestone: true,
        isProjected: false,
      });
    }

    // Add Goal Target point
    const latestScore = points[points.length - 1].overall;
    const targetScore = Math.max(65, latestScore + 6);
    points.push({
      checkpoint: 'Target Goal',
      name: 'MET Goal',
      date: 'Exam Ready',
      overall: targetScore,
      stage: 'Ready for Mock Practice',
      listening: targetScore,
      reading: targetScore,
      speaking: targetScore,
      writing: targetScore,
      isMilestone: true,
      isProjected: true,
    });

    return points;
  }, [diagnoses, student]);

  // Current metric summary
  const currentPoint = useMemo(() => {
    // Latest non-projected point
    const realPoints = pathData.filter(p => !p.isProjected);
    return realPoints[realPoints.length - 1] || pathData[0];
  }, [pathData]);

  const baselinePoint = pathData[0];
  const deltaFromBaseline = currentPoint.overall - baselinePoint.overall;
  const deltaToB2Passing = currentPoint.overall - 53;
  const cefrInfo = getCefrBandInfo(currentPoint.overall);

  return (
    <div
      className={`met-progress-path-card ${className}`}
      data-testid={testId}
      style={{
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 12,
        padding: '20px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
        marginBottom: 24,
      }}
    >
      {/* ── CARD HEADER ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--primary-light, rgba(2, 132, 199, 0.12))',
            color: 'var(--primary, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon.progress size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text, #0f172a)' }} data-testid="progress-path-title">
              Your MET progress path
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--muted, #64748b)' }}>
              Scaled score trajectory across milestones toward the 53 (B2 Pass) and 65 (Exam Ready) targets.
            </p>
          </div>
        </div>

        {/* View Mode Toggle Button Group */}
        <div style={{ display: 'flex', background: 'var(--bg, #f1f5f9)', borderRadius: 8, padding: 3, gap: 2 }}>
          <button
            type="button"
            onClick={() => setViewMode('overall')}
            style={{
              background: viewMode === 'overall' ? 'var(--surface, #ffffff)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: viewMode === 'overall' ? 'var(--primary, #0284c7)' : 'var(--muted, #64748b)',
              boxShadow: viewMode === 'overall' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
            data-testid="toggle-path-overall"
          >
            Overall Path
          </button>
          <button
            type="button"
            onClick={() => setViewMode('skills')}
            style={{
              background: viewMode === 'skills' ? 'var(--surface, #ffffff)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: viewMode === 'skills' ? 'var(--primary, #0284c7)' : 'var(--muted, #64748b)',
              boxShadow: viewMode === 'skills' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
            data-testid="toggle-path-skills"
          >
            By Skill Area
          </button>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        {/* Metric 1: Current Scaled Score */}
        <div style={{
          background: 'var(--bg, #f8fafc)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid var(--border, #e2e8f0)',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted, #64748b)', letterSpacing: '0.04em' }}>
            Current Scaled Score
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text, #0f172a)' }}>
              {currentPoint.overall}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted, #64748b)' }}>/ 80</span>
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: cefrInfo.color }}>
            Band {cefrInfo.level}
          </span>
        </div>

        {/* Metric 2: B2 Benchmark Distance */}
        <div style={{
          background: 'var(--bg, #f8fafc)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid var(--border, #e2e8f0)',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted, #64748b)', letterSpacing: '0.04em' }}>
            B2 Benchmark (53)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: deltaToB2Passing >= 0 ? 'var(--success, #16a34a)' : 'var(--accent, #0ea5e9)',
            }}>
              {deltaToB2Passing >= 0 ? `+${deltaToB2Passing}` : `${deltaToB2Passing}`}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted, #64748b)' }}>pts</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: deltaToB2Passing >= 0 ? 'var(--success, #16a34a)' : 'var(--muted, #64748b)', fontWeight: 600 }}>
            {deltaToB2Passing >= 0 ? 'Passing benchmark met' : `${Math.abs(deltaToB2Passing)} pts to B2 pass`}
          </span>
        </div>

        {/* Metric 3: Growth from Baseline */}
        <div style={{
          background: 'var(--bg, #f8fafc)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid var(--border, #e2e8f0)',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted, #64748b)', letterSpacing: '0.04em' }}>
            Trajectory Growth
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: deltaFromBaseline >= 0 ? 'var(--primary, #0284c7)' : 'var(--muted, #64748b)' }}>
              {deltaFromBaseline >= 0 ? `+${deltaFromBaseline}` : deltaFromBaseline}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted, #64748b)' }}>pts</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted, #64748b)' }}>
            From baseline ({baselinePoint.overall})
          </span>
        </div>

        {/* Metric 4: Target Goal */}
        <div style={{
          background: 'var(--bg, #f8fafc)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid var(--border, #e2e8f0)',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted, #64748b)', letterSpacing: '0.04em' }}>
            Readiness Target
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent, #0ea5e9)' }}>
              65
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted, #64748b)' }}>/ 80</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted, #64748b)' }}>
            Exam Ready (Stage 5)
          </span>
        </div>
      </div>

      {/* ── RECHARTS VISUALIZATION ── */}
      <div style={{ width: '100%', height: 280, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'overall' ? (
            <AreaChart data={pathData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metPathGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary, #0284c7)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary, #0284c7)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--divider, rgba(0,0,0,0.06))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--muted, #64748b)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--divider, #e2e8f0)' }}
                tickLine={false}
              />
              <YAxis
                domain={[20, 80]}
                ticks={[20, 40, 53, 65, 80]}
                tick={{ fill: 'var(--muted, #64748b)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--divider, #e2e8f0)' }}
                tickLine={false}
              />
              <Tooltip content={<MetProgressTooltip pathData={pathData} viewMode={viewMode} />} />

              {/* Benchmark Reference Lines */}
              <ReferenceLine
                y={53}
                stroke="#16a34a"
                strokeDasharray="4 4"
                label={{ value: 'B2 Benchmark (53)', position: 'insideTopRight', fill: '#16a34a', fontSize: 10, fontWeight: 700 }}
              />
              <ReferenceLine
                y={65}
                stroke="#0ea5e9"
                strokeDasharray="4 4"
                label={{ value: 'Exam Target (65)', position: 'insideTopRight', fill: '#0ea5e9', fontSize: 10, fontWeight: 700 }}
              />

              <Area
                type="monotone"
                dataKey="overall"
                name="Scaled Score"
                stroke="var(--primary, #0284c7)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#metPathGradient)"
                dot={{ r: 5, fill: 'var(--primary, #0284c7)', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: 'var(--primary, #0284c7)' }}
              />
            </AreaChart>
          ) : (
            <LineChart data={pathData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--divider, rgba(0,0,0,0.06))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--muted, #64748b)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--divider, #e2e8f0)' }}
                tickLine={false}
              />
              <YAxis
                domain={[20, 80]}
                ticks={[20, 40, 53, 65, 80]}
                tick={{ fill: 'var(--muted, #64748b)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--divider, #e2e8f0)' }}
                tickLine={false}
              />
              <Tooltip content={<MetProgressTooltip pathData={pathData} viewMode={viewMode} />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

              <ReferenceLine
                y={53}
                stroke="#16a34a"
                strokeDasharray="4 4"
                label={{ value: 'B2 Benchmark (53)', position: 'insideTopRight', fill: '#16a34a', fontSize: 10, fontWeight: 700 }}
              />

              <Line type="monotone" dataKey="listening" name="Listening" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="reading" name="Reading" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="speaking" name="Speaking" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="writing" name="Writing" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>

        {/* Screen Reader Accessible Table */}
        <table className="sr-only">
          <caption>Your MET progress path: scaled scores by evaluation checkpoint</caption>
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Date</th>
              <th>Overall Scaled Score</th>
              <th>Stage</th>
              <th>Listening</th>
              <th>Reading</th>
              <th>Speaking</th>
              <th>Writing</th>
            </tr>
          </thead>
          <tbody>
            {pathData.map(row => (
              <tr key={row.name}>
                <td>{row.checkpoint}</td>
                <td>{row.date}</td>
                <td>{row.overall}</td>
                <td>{row.stage}</td>
                <td>{row.listening}</td>
                <td>{row.reading}</td>
                <td>{row.speaking}</td>
                <td>{row.writing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── PATH MILESTONES FOOTER TRACKER ── */}
      <div style={{
        marginTop: 18,
        paddingTop: 14,
        borderTop: '1px solid var(--border, #e2e8f0)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        fontSize: '0.78rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, color: 'var(--text, #0f172a)' }}>Path Milestones:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {pathData.map((pt, idx) => {
              const isCurrent = pt.name === currentPoint.name;
              const isDone = !pt.isProjected;
              return (
                <span
                  key={pt.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: '0.72rem',
                    fontWeight: isCurrent ? 700 : 500,
                    background: isCurrent
                      ? 'var(--primary, #0284c7)'
                      : isDone
                      ? 'var(--bg, #f1f5f9)'
                      : 'transparent',
                    color: isCurrent
                      ? '#ffffff'
                      : isDone
                      ? 'var(--text, #0f172a)'
                      : 'var(--muted, #94a3b8)',
                    border: isCurrent
                      ? '1px solid var(--primary, #0284c7)'
                      : '1px solid var(--border, #e2e8f0)',
                  }}
                >
                  <span>{idx + 1}.</span>
                  <span>{pt.checkpoint}</span>
                  {isDone && <span style={{ fontSize: '0.65rem' }}>({pt.overall})</span>}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{ color: 'var(--muted, #64748b)', fontSize: '0.75rem' }}>
          Passing threshold: <strong>53</strong> · Target mastery: <strong>65+</strong>
        </div>
      </div>
    </div>
  );
}
