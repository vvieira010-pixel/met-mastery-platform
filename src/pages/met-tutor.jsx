import { useState, useMemo, useEffect } from 'react';
import { SectionHeader, Icon } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { getB2Modules, b2BankMeta } from '../lib/met-b2-bank.js';
import { getDueItems, toMCQ, getAllEntries } from '../lib/spaced-repetition.js';
import { getTutorProfile, recordTutorAnswer, getTutorStats } from '../lib/met-tutor-store.js';
import { autoGrade, createEmptyResponse, shuffleArray } from '../lib/exercise-types.js';
import { trackEvent } from '../lib/ml-events.js';

const SKILL_TABS = [
  { id: 'all', label: 'All skills' },
  { id: 'listening', label: 'Listening (Comp I)' },
  { id: 'reading', label: 'Reading (Comp II)' },
  { id: 'grammar', label: 'Grammar (Comp II)' },
  { id: 'vocabulary', label: 'Vocabulary (Comp II)' },
  { id: 'writing', label: 'Writing (Comp III)' },
  { id: 'speaking', label: 'Speaking (Comp IV)' },
];

function pickNextExercise(studentId, skillFilter, cefrLevel, askedIds) {
  // Priority 1: spaced-repetition due items (homework error review)
  try {
    const due = getDueItems(studentId);
    const all = getAllEntries(studentId);
    const dueExercises = due.map(d => toMCQ(d, all)).filter(e => !askedIds.has(e.id));
    if (dueExercises.length) return { ex: dueExercises[0], source: 'review' };
  } catch { /* no SR */ }

  // Priority 2: B2 bank filtered by skill + level, excluding already asked
  const mods = getB2Modules();
  let pool = [];
  for (const m of mods) {
    if (skillFilter !== 'all' && m.skill !== skillFilter) continue;
    for (const ex of m.exercises) {
      if (!askedIds.has(ex.id)) pool.push({ ...ex, _moduleLabel: m.label });
    }
  }
  // level filter soft: prefer cefrLevel, fallback to any
  const levelPool = pool.filter(e => (e.level || 'B2').toUpperCase() === cefrLevel);
  const chosen = (levelPool.length ? levelPool : pool);
  if (!chosen.length) return null;
  // deterministic shuffle seeded by studentId+asked size to avoid repeats clumping
  const shuffled = shuffleArray(chosen, studentId + ':' + askedIds.size);
  return { ex: shuffled[0], source: 'bank' };
}

function TutorExercise({ exercise, response, setResponse, showFeedback, result }) {
  if (!exercise) return null;
  const q = exercise.question || exercise.prompt || exercise.template || '';
  if (exercise.type === 'mcq' || exercise.type === 'listen') {
    const opts = exercise.options || [];
    return (
      <div className="stack-list" style={{ gap: 12 }}>
        {exercise.context && <p style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap' }}>{exercise.context}</p>}
        {exercise.audioText && <p style={{ fontStyle: 'italic', color: 'var(--muted)' }}>Audio: “{exercise.audioText.slice(0, 220)}…”</p>}
        <p style={{ fontWeight: 600 }}>{q}</p>
        <div className="stack-list" style={{ gap: 8 }}>
          {opts.map((opt, i) => {
            const selected = response?.selected === i;
            const correct = exercise.correct === i;
            const cls = showFeedback ? (correct ? 'tutor-opt tutor-opt--correct' : selected ? 'tutor-opt tutor-opt--wrong' : 'tutor-opt') : (selected ? 'tutor-opt tutor-opt--selected' : 'tutor-opt');
            return (
              <button key={i} type="button" className={cls} onClick={() => !showFeedback && setResponse({ selected: i })} disabled={showFeedback}>
                <span className="tutor-opt-label">{String.fromCharCode(65 + i)}</span> {opt}
              </button>
            );
          })}
        </div>
        {showFeedback && <p style={{ color: result?.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{result?.feedback} {exercise.explanation && <span style={{ fontWeight: 400, color: 'var(--muted)' }}>— {exercise.explanation}</span>}</p>}
      </div>
    );
  }
  if (exercise.type === 'blank') {
    const parts = String(exercise.template || '').split(/(_{3,})/);
    let idx = 0;
    return (
      <div className="stack-list" style={{ gap: 12 }}>
        <p style={{ fontWeight: 600, lineHeight: 1.8 }}>
          {parts.map((part, i) => /^_{3,}$/.test(part)
            ? (() => { const cur = idx++; return <input key={i} className="input" style={{ display: 'inline-block', width: 140, margin: '0 4px' }} value={response?.blanks?.[cur] || ''} onChange={e => { const next = [...(response?.blanks || [])]; next[cur] = e.target.value; setResponse({ blanks: next }); }} disabled={showFeedback} placeholder={`blank ${cur + 1}`} />; })()
            : <span key={i}>{part}</span>)}
        </p>
        {showFeedback && <p style={{ color: result?.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{result?.feedback}</p>}
      </div>
    );
  }
  if (exercise.type === 'fix') {
    return (
      <div className="stack-list" style={{ gap: 12 }}>
        <p style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>{exercise.errorText}</p>
        <textarea className="input" rows={3} value={response?.text || ''} onChange={e => setResponse({ text: e.target.value })} disabled={showFeedback} placeholder="Type the corrected sentence…" />
        {showFeedback && <p style={{ color: result?.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{result?.feedback} {!result?.correct && <span style={{ color: 'var(--muted)', fontWeight: 400 }}> — Correct: {exercise.correctedText}</span>}</p>}
      </div>
    );
  }
  if (exercise.type === 'read') {
    return (
      <div className="stack-list" style={{ gap: 12 }}>
        <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto' }}>{exercise.passage}</div>
        {(exercise.questions || []).map(qi => (
          <div key={qi.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
            <p style={{ fontWeight: 600 }}>{qi.question}</p>
            <div className="stack-list" style={{ gap: 6, marginTop: 8 }}>
              {(qi.options || []).map((opt, oi) => (
                <button key={oi} type="button" className={response?.answers?.[qi.id] === oi ? 'tutor-opt tutor-opt--selected' : 'tutor-opt'} onClick={() => !showFeedback && setResponse(r => ({ answers: { ...(r?.answers || {}), [qi.id]: oi } }))} disabled={showFeedback}>
                  {String.fromCharCode(65 + oi)} {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        {showFeedback && <p style={{ color: result?.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{result?.feedback}</p>}
      </div>
    );
  }
  if (exercise.type === 'order') {
    const cur = response?.order || [];
    return (
      <div className="stack-list" style={{ gap: 12 }}>
        <p style={{ fontWeight: 600 }}>Put the sentences in the correct order:</p>
        <div className="stack-list" style={{ gap: 6 }}>
          {(exercise.sentences || []).map((s, i) => (
            <button key={i} type="button" className={cur.includes(i) ? 'tutor-opt tutor-opt--selected' : 'tutor-opt'} onClick={() => !showFeedback && setResponse(r => { const o = r?.order || []; return { order: o.includes(i) ? o.filter(x => x !== i) : [...o, i] }; })} disabled={showFeedback}>
              {cur.indexOf(i) >= 0 ? `${cur.indexOf(i) + 1}. ` : ''}{s}
            </button>
          ))}
        </div>
        {showFeedback && <p style={{ color: result?.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{result?.feedback}</p>}
      </div>
    );
  }
  // short/speak/flash fallback: tutor treats as review-only (show prompt)
  return (
    <div className="stack-list" style={{ gap: 12 }}>
      <p style={{ fontWeight: 600 }}>{q || exercise.prompt || 'Review this item:'}</p>
      <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>This is a {exercise.type} task — mark yourself after reviewing.</p>
      {showFeedback && exercise.explanation && <p style={{ color: 'var(--muted)' }}>{exercise.explanation}</p>}
    </div>
  );
}

export default function MetTutorPage({ studentId: propStudentId, students, onNavigate, auth }) {
  const studentId = propStudentId || auth?.studentId || students?.[0]?.id || 'demo-student';
  const student = students?.find(s => s.id === studentId) || { id: studentId, name: auth?.displayName || 'Student' };
  const [skill, setSkill] = useState('all');
  const [askedIds, setAskedIds] = useState(() => new Set());
  const [profile, setProfile] = useState(() => getTutorProfile(studentId));
  const [response, setResponse] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  const stats = useMemo(() => getTutorStats(studentId), [studentId]);
  const dueCount = useMemo(() => { try { return getDueItems(studentId).length; } catch { return 0; } }, [studentId]);

  const current = useMemo(() => pickNextExercise(studentId, skill, profile.cefrLevel, askedIds), [studentId, skill, profile.cefrLevel, askedIds]);
  const exercise = current?.ex || null;

  useEffect(() => {
    setProfile(getTutorProfile(studentId));
    setAskedIds(new Set());
    setSessionCount(0);
  }, [studentId]);

  useEffect(() => {
    if (exercise) setResponse(createEmptyResponse(exercise.type));
  }, [exercise]);

  function handleCheck() {
    if (!exercise) return;
    const graded = autoGrade(exercise, response);
    // autoGrade returns null for non-auto types (short/speak) — tutor self-rate: if no grade, treat as practice (no SM-2 penalize)
    const correct = graded ? graded.correct : true;
    const feedback = graded || { correct, score: correct ? 1 : 0, feedback: correct ? 'Recorded.' : 'Review and try again.' };
    setResult(feedback);
    setShowFeedback(true);
    const nextProfile = recordTutorAnswer(studentId, exercise.id, { correct, skill: exercise.type, quality: correct ? 4 : 1 });
    setProfile({ ...nextProfile });
    try { trackEvent({ eventType: 'tutor_check', itemId: exercise.id, itemType: exercise.type, correct, meta: { skill, source: current?.source } }); } catch {}
  }

  function handleNext() {
    if (exercise) setAskedIds(prev => { const n = new Set(prev); n.add(exercise.id); return n; });
    setShowFeedback(false);
    setResult(null);
    setResponse(null);
    setSessionCount(c => c + 1);
  }

  if (!exercise) {
    return (
      <div className="page-shell" data-testid="met-tutor-page">
        <SectionHeader title="MET B2 Tutor" sub={`Student: ${student.name} · ${profile.cefrLevel} (target ${profile.targetLevel})`} action={<Button variant="ghost" onClick={() => onNavigate('dashboard')}>Back</Button>} />
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <p>No more exercises for this filter. <Button variant="primary" size="sm" onClick={() => { setAskedIds(new Set()); setSessionCount(c => c + 1); }}>Restart pool</Button></p>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>{b2BankMeta.exerciseCount} exercises in bank · {dueCount} review due</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell" data-testid="met-tutor-page">
      <SectionHeader
        title="MET B2 Tutor"
        sub={`${student.name} · ${profile.cefrLevel} → ${profile.targetLevel} · ${stats.accuracy}% accuracy · streak ${stats.streak}`}
        action={<Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>Back</Button>}
      />
      {/* Progress + due */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <Card style={{ padding: 12, flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>This session</div>
          <div style={{ fontWeight: 700 }}>{sessionCount} answered · {stats.totalAnswered} total</div>
          <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, stats.totalAnswered % 20 * 5)}%`, height: '100%', background: 'var(--primary)' }} />
          </div>
        </Card>
        <Card style={{ padding: 12, flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Review due (homework)</div>
          <div style={{ fontWeight: 700 }}>{dueCount} item{dueCount !== 1 ? 's' : ''} due {current?.source === 'review' && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>(next is review)</span>}</div>
          {stats.weakSkills.length > 0 && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>Weak: {stats.weakSkills.map(([k, n]) => `${k}(${n})`).join(', ')}</div>}
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {SKILL_TABS.map(t => (
          <button key={t.id} type="button" className={skill === t.id ? 'homework-pack-filter-btn homework-pack-filter-btn--active' : 'homework-pack-filter-btn'} onClick={() => { setSkill(t.id); setAskedIds(new Set()); }}>
            {t.label}
          </button>
        ))}
      </div>

      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{exercise.type} · {exercise.level || profile.cefrLevel} {exercise._moduleLabel ? `· ${exercise._moduleLabel}` : ''}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{b2BankMeta.exerciseCount} in bank</span>
        </div>
        <TutorExercise exercise={exercise} response={response} setResponse={setResponse} showFeedback={showFeedback} result={result} />
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          {!showFeedback ? (
            <Button variant="primary" onClick={handleCheck}><Icon.check size={14} /> Check</Button>
          ) : (
            <Button variant="primary" onClick={handleNext}>Next →</Button>
          )}
          <Button variant="ghost" onClick={handleNext} disabled={!showFeedback}>Skip</Button>
        </div>
        {showFeedback && (
          <div style={{ marginTop: 12, padding: 10, background: result?.correct ? 'rgba(16,122,72,0.08)' : 'rgba(180,40,40,0.06)', borderRadius: 8, fontSize: 'var(--text-sm)' }}>
            <strong>{result?.correct ? 'Correct' : 'Not quite'}</strong> — interval updated (SM-2) · Level stays {profile.cefrLevel} (3 correct in a row = level up, 2 wrong = level down). Next item adapts.
          </div>
        )}
      </Card>

      <Card style={{ padding: 14, marginTop: 12 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>How it works</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.6 }}>
          One question at a time → <strong style={{ color: 'var(--ink)' }}>immediate feedback</strong> → SM-2 schedules the next review → difficulty adapts (B1↔B2↔C1). Homework “Review due” items from spaced-repetition are injected first.
        </div>
      </Card>
    </div>
  );
}
