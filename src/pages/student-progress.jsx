import { useState, useEffect, useCallback } from 'react';
import { getDiagnoses } from '../lib/workflow.js';
import { asArray, getProgressStage, getSkillTrend, PROGRESS_STAGES, STAGE_DESCRIPTIONS, TrendChip, SkillRow } from './student-helpers.jsx';
import { Icon } from '../components/shared.jsx';
import MetProgressPathGraph from '../components/MetProgressPathGraph.jsx';
import BaselineDiagnosticModal from '../components/BaselineDiagnosticModal.jsx';
import CefrSkillGapFlags from '../components/CefrSkillGapFlags.jsx';
import TargetedSynonymTracker from '../components/TargetedSynonymTracker.jsx';

function sectionToLabel(section) {
  if (!section) return '';
  return section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Speaking/g, 'Sp.').replace(/Writing/g, 'Wr.').replace(/Grammar/g, 'Gr.')
    .replace(/Vocabulary/g, 'Voc.').replace(/Listening/g, 'Lis.').replace(/Reading/g, 'Read.').slice(0, 18);
}

function SubskillRadar({ sectionData }) {
  const [loaded, setLoaded] = useState(false);
  const [Modules, setModules] = useState(null);
  const [chartHeight, setChartHeight] = useState(400);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => { import('recharts').then(mod => { setModules(mod); setLoaded(true); }); }, []);
  useEffect(() => {
    const check = () => setChartHeight(window.innerWidth < 640 ? 300 : 400);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  if (!loaded) return (
    <div className="student-radar-skeleton" aria-hidden="true" data-testid={testId}>
      <div className="student-radar-skeleton-pulse" />
    </div>
  );

  const hasData = sectionData?.some(d => (d.current || 0) > 0);
  if (!hasData || !sectionData?.length) return null;

  const { ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } = Modules;
  const maxVal = Math.max(...sectionData.map(d => Math.max(d.current || 0, d.previous || 0, d.target || 0)), 60);
  const domainMax = Math.ceil(maxVal / 10) * 10;

  return (
    <div>
      <div className="student-radar-wrap">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={sectionData} margin={{ top: 8, right: 16, bottom: 8, left: -8 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" horizontal={false} />
            <XAxis type="number" domain={[0, domainMax]} tick={{ fill: 'var(--text-2)', fontSize: 11 }} tickLine={{ stroke: 'var(--divider)' }} axisLine={{ stroke: 'var(--divider)' }} label={{ value: 'Score', position: 'insideBottom', offset: -2, fill: 'var(--text-2)', fontSize: 11 }} />
            <YAxis type="category" dataKey="skill" tick={{ fill: 'var(--text-2)', fontSize: 12, fontFamily: 'var(--font-sans)' }} width={60} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--text-2)', paddingTop: 8 }} />
            <Bar name="Current" dataKey="current" fill="var(--accent)" radius={[0, 3, 3, 0]} isAnimationActive={!reduceMotion} animationDuration={1000} animationBegin={300} />
            {sectionData.some(d => d.previous != null) && (
              <Bar name="Previous" dataKey="previous" fill="var(--muted)" fillOpacity={0.7} radius={[0, 3, 3, 0]} isAnimationActive={!reduceMotion} animationDuration={800} animationBegin={0} />
            )}
            <Bar name="Target" dataKey="target" fill="var(--primary)" fillOpacity={0.55} radius={[0, 3, 3, 0]} isAnimationActive={!reduceMotion} animationDuration={900} animationBegin={150} />
          </BarChart>
        </ResponsiveContainer>
        <table className="sr-only">
          <caption>Skill scores across MET sections</caption>
          <thead><tr><th>Skill</th><th>Current</th><th>Previous</th><th>Target</th></tr></thead>
          <tbody>
            {sectionData.map(d => (
              <tr key={d.skill}><td>{d.skill}</td><td>{d.current}</td><td>{d.previous != null ? d.previous : '—'}</td><td>{d.target}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StudentProgress({ student, "data-testid": testId }) {
  const [diagnoses, setDiagnoses] = useState([]);
  const [legendOpen, setLegendOpen] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [baselineModalOpen, setBaselineModalOpen] = useState(false);

  const refreshDiagnoses = useCallback(async () => {
    try {
      const dx = await getDiagnoses(student.id);
      const approved = (dx || []).filter(d => d.status === 'approved');
      setDiagnoses(approved);
    } catch (err) {
      console.warn('[StudentProgress] Failed refreshing diagnoses:', err);
    }
  }, [student.id]);

  useEffect(() => {
    refreshDiagnoses();
  }, [refreshDiagnoses]);

  const sorted = [...diagnoses].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const latest = sorted[0];
  const skills = sorted.reduce((acc, d) => {
    if (acc.length > 0) return acc;
    const snap = asArray(d?.content?.section_snapshot);
    return snap.filter(s => s.evaluated || (Number(s.score_0_80) || 0) > 0);
  }, []) || [];
  const lowestSkill = skills.length > 1
    ? [...skills].sort((a, b) => (Number(a.score_0_80) || 0) - (Number(b.score_0_80) || 0))[0]
    : null;

  const handleExpand = (section) => {
    setExpandedSkill(expandedSkill === section ? null : section);
  };

  return (
    <div className="student-progress-page">
      <section className="student-hero bg-grain fade-up">
        <div>
          <p className="student-hero-kicker">MET progress profile</p>
          <h1>Your MET progress path</h1>
        </div>
      </section>

      <div className="student-stage-legend">
        <button className="student-stage-legend-toggle" onClick={() => setLegendOpen(v => !v)} aria-expanded={legendOpen}>
          <span>What do the stages mean?</span>
          <span aria-hidden="true" className="text-2xs">{legendOpen ? '▲' : '▼'}</span>
        </button>
        {legendOpen && (
          <div className="student-stage-legend-body">
            {PROGRESS_STAGES.map(s => (
              <div key={s.label} className="student-stage-legend-row">
                <span className="student-stage-legend-name">{s.label}</span>
                <span className="student-stage-legend-desc">{STAGE_DESCRIPTIONS[s.label]}</span>
              </div>
            ))}
            <div className="student-stage-legend-row student-stage-legend-row--goal">
              <span className="student-stage-legend-name">Your goal</span>
              <span className="student-stage-legend-desc">Stage 5 = Ready for Mock Practice = B2 performance on the MET. The actual exam requires 65/80 or higher across all sections.</span>
            </div>
          </div>
        )}
      </div>

      <MetProgressPathGraph student={student} diagnoses={diagnoses} />

      {diagnoses.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Baseline Diagnostic Trigger: Replace static empty state with direct CTA */}
          <div
            className="student-empty-card"
            style={{
              padding: 24,
              border: '2px dashed var(--primary, #2D7A8C)',
              background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
              borderRadius: 12,
            }}
            data-testid="baseline-diagnostic-trigger"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'rgba(2, 132, 199, 0.12)',
                    color: 'var(--primary, #2D7A8C)',
                  }}
                >
                  Baseline Diagnostic Trigger
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted, #6B7C80)' }}>
                  Immediate Baseline Data Collection
                </span>
              </div>

              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text, #1A2E35)' }}>
                  Begin Your Structured Class Baseline Diagnosis
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2, #2B454E)', lineHeight: 1.6 }}>
                  No approved diagnosis is ready yet. Take the structured 4-section assessment (Listening, Reading, Writing, and Speaking) to collect immediate baseline data and map your abilities directly onto the 0–80 scaled score framework.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', paddingTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setBaselineModalOpen(true)}
                  style={{
                    background: 'var(--primary, #2D7A8C)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 22px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                  }}
                  data-testid="begin-baseline-diagnosis-btn"
                >
                  <Icon.progress size={16} />
                  Begin Structured Baseline Diagnosis (0–80 Scaled Score)
                </button>
              </div>
            </div>
          </div>

          {/* Targeted Synonym Tracker */}
          <TargetedSynonymTracker />
        </div>
      ) : (
        <>
          {skills.length > 0 && (() => {
            const sortedDx = [...diagnoses].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            const previousDx = sortedDx.find(d => {
              const snap = asArray(d?.content?.section_snapshot);
              return snap.length > 0 && snap.some(s => Number(s.score_0_80) > 0) && d.id !== latest?.id;
            });
            const prevSnapshot = asArray(previousDx?.content?.section_snapshot);
            const radarData = skills.map(skill => {
              const prevSkill = prevSnapshot.find(s => s.section === skill.section);
              return { skill: sectionToLabel(skill.section), current: Number(skill.score_0_80) || 0, previous: prevSkill ? (Number(prevSkill.score_0_80) || 0) : null, target: 65 };
            });
            return (
              <section className="student-panel student-panel--primary cursor-default mb-5">
                <div className="student-panel-head">
                  <div>
                    <span className="student-panel-kicker">Skill overview</span>
                    <h2>Skill comparison</h2>
                  </div>
                  <span className="student-pill">{skills.length} skill{skills.length !== 1 ? 's' : ''}</span>
                </div>
                <SubskillRadar sectionData={radarData} />
              </section>
            );
          })()}

          {/* CEFR Skill Gap Flags: Visual blue & emerald green progress indicators */}
          <CefrSkillGapFlags snapshot={skills} diagnoses={diagnoses} className="mb-5" />

          {/* Targeted Synonym Tracker */}
          <TargetedSynonymTracker className="mb-5" />

          <section className="student-panel cursor-default mb-5">
            <div className="student-panel-head">
              <div>
                <span className="student-panel-kicker">Readiness Snapshot</span>
                <h2>Evaluated skills</h2>
              </div>
              <button
                type="button"
                onClick={() => setBaselineModalOpen(true)}
                style={{
                  border: 'none',
                  background: 'rgba(2, 132, 199, 0.1)',
                  color: 'var(--primary, #2D7A8C)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Icon.progress size={13} /> Update Baseline Diagnosis
              </button>
            </div>
            {skills.length > 0 ? (
              <div className="student-skill-list">
                {skills.map(skill => {
                  const skillTrend = getSkillTrend(skill.section, sorted);
                  const isExpanded = expandedSkill === skill.section;
                  return (
                    <div key={skill.section} className={`student-skill-detail${isExpanded ? ' is-open' : ''}`}>
                      <SkillRow skill={skill} trend={skillTrend} onClick={() => handleExpand(skill.section)} />
                      {isExpanded && (
                        <div className="student-skill-expanded">
                          <div className="student-skill-expanded-grid">
                            <div><strong>Current focus</strong><p>{skill.next_step || `Keep building more control in ${skill.section}.`}</p></div>
                            <div><strong>Last assessed</strong><p>{skillTrend?.evaluations > 1 ? `Based on ${skillTrend.evaluations} classes` : 'Based on your latest class'}.</p></div>
                          </div>
                          <div className="student-confidence-list">
                            {(() => {
                              const stage = getProgressStage(Number(skill.score_0_80) || 0);
                              return PROGRESS_STAGES.map((st, i) => (
                                <div key={st.label} className={`student-todo-row${stage.order >= st.order ? ' done' : ''}`}>
                                  <span className="student-todo-check">{stage.order >= st.order ? '✓' : ''}</span>
                                  <span>
                                    <strong>{['I understand the task', 'I can do it with support', 'I can do it independently', 'I can try mock practice', 'Ready for the MET'][i] || st.label}</strong>
                                    <small>{['Foundation', 'Building control', 'Consistency', 'Timed practice', 'Exam ready'][i] || ''}</small>
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="student-empty-card">No evaluated skills are ready to show yet. When a class evaluates speaking only, only speaking progress will appear here.</div>
            )}
          </section>

          {lowestSkill && lowestSkill.score_0_80 > 0 && (() => {
            const lowScore = Number(lowestSkill.score_0_80) || 0;
            return (
              <section className="sp-section-callout student-panel student-panel--clickable cursor-default">
                <div className="student-panel-head">
                  <div>
                    <span className="student-panel-kicker">Focus Area</span>
                    <h2>{lowestSkill.section.replace(/_/g, ' ')}</h2>
                  </div>
                </div>
                <p className="text-sm lh-1_6" style={{ color: 'var(--text)', margin: '8px 0 0' }}>
                  This skill needs the most attention. Focus on it in your next class or practice session.
                </p>
                {lowestSkill.next_step && (
                  <p className="text-sm lh-1_6" style={{ color: 'var(--text-2)', margin: '6px 0 0' }}>
                    <strong>Next step:</strong> {lowestSkill.next_step}
                  </p>
                )}
              </section>
            );
          })()}

          {sorted.length > 1 && (
            <section className="student-panel cursor-default">
              <div className="student-panel-head">
                <div><span className="student-panel-kicker">Compare by date</span><h2>Progress history</h2></div>
              </div>
              <div className="student-history-list">
                {sorted.map(dx => {
                  const snap = asArray(dx?.content?.section_snapshot).filter(s => s.evaluated || Number(s.score_0_80) > 0);
                  if (snap.length === 0) return null;
                  return (
                    <div key={dx.id} className="student-history-item items-start gap-4">
                      <span className="text-xs text-muted shrink-0" style={{ minWidth: 80, paddingTop: 3 }}>
                        {new Date(dx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex-col-gap2 flex-1">
                        {snap.map(s => {
                          const stage = getProgressStage(s.score_0_80);
                          return (
                            <div key={s.section} className="flex-row-gap3">
                              <span className="text-xs text-muted capitalize" style={{ minWidth: 88 }}>
                                {s.section.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs font-semibold" style={{ color: 'var(--text)', minWidth: 148 }}>
                                {stage.label}
                              </span>
                              <div className="flex gap-1" aria-label={`${stage.order} of 5 stages`}>
                                {PROGRESS_STAGES.map(st => (
                                  <div key={st.label} className="progress-dot"
                                    style={{ background: st.order <= stage.order ? 'var(--accent)' : 'var(--border)' }} />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* Baseline Diagnostic Modal */}
      {baselineModalOpen && (
        <BaselineDiagnosticModal
          student={student}
          isOpen={baselineModalOpen}
          onClose={() => setBaselineModalOpen(false)}
          onCompleted={() => {
            refreshDiagnoses();
            setBaselineModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
