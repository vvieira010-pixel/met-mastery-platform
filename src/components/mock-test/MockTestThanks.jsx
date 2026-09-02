import { useState, useEffect } from 'react';
import { MOCK_TEST_1 } from '../../data/mock-test-1/index.js';
import { MOCK_TEST_2 } from '../../data/mock-test-2/index.js';
import { scoreReading, scoreListening, scoreReading2, scoreListening2 } from '../../lib/mock-test-scoring.js';
import { computeScaledScores, getCefrLevelFromPercent, targetMessage } from '../../lib/met-scoring.ts';
import { saveMockTestResult } from '../../lib/workflow.js';
import { uploadMockTestAudio } from '../../lib/supabase-db.js';
import { getCefrColor, getCefrLongLabel, getCefrDescription, CEFR_CONFIG } from './constants.js';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../shared.jsx';

const TEST_META = {
  'mock-test-1': { data: MOCK_TEST_1, scoreReading, scoreListening },
  'mock-test-2': { data: MOCK_TEST_2, scoreReading: scoreReading2, scoreListening: scoreListening2 },
};

export default function MockTestThanks({ answers, student, onBack, testId = 'mock-test-1' }) {
  const meta = TEST_META[testId] || TEST_META['mock-test-1'];
  const [status, setStatus] = useState('saving');
  const [readingScore, setReadingScore] = useState(null);
  const [listeningScore, setListeningScore] = useState(null);
  const [error, setError] = useState(null);
  const [savedResult, setSavedResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus('saving');

        const reading = meta.scoreReading(answers);
        const listening = meta.scoreListening(answers);
        if (!cancelled) { setReadingScore(reading); setListeningScore(listening); }

        // Use official MET scaled scoring (0-80) + CEFR bands
        const scaled = computeScaledScores({ reading, listening });
        const cefr = scaled.cefr;

        const speakingRecordings = {};
        const speakingTasks = answers && Object.keys(answers).filter(k =>
          !isNaN(Number(k)) && typeof answers[k] === 'string' && answers[k].startsWith('blob:')
        );

        for (const idx of speakingTasks) {
          try {
            const resp = await fetch(answers[idx]);
            const blob = await resp.blob();
            const path = `${testId}/${student?.email || 'anon'}/speaking_task${idx}_${Date.now()}.webm`;
            const savedPath = await uploadMockTestAudio(blob, path);
            speakingRecordings[idx] = savedPath;
          } catch {
            speakingRecordings[idx] = null;
          }
        }

        const payload = {
          studentId: student?.local_id || student?.id || '',
          studentName: student?.name || student?.firstName || '',
          studentEmail: student?.email || '',
          testId,
          testTitle: meta.data.title,
          answers,
          scores: {
            reading: { total: reading.total, max: reading.max, details: reading.details, scaled: scaled.reading, cefr: getCefrLevelFromPercent(reading.max > 0 ? Math.round((reading.total / reading.max) * 100) : 0) },
            listening: { total: listening.total, max: listening.max, details: listening.details, scaled: scaled.listening, cefr: getCefrLevelFromPercent(listening.max > 0 ? Math.round((listening.total / listening.max) * 100) : 0) },
            overall: { scaled: scaled.overall, cefr: scaled.cefr, cefrLabel: scaled.cefrLabel, cefrDescription: scaled.cefrDescription },
          },
          cefr,
          speakingRecordings,
          submittedAt: new Date().toISOString(),
        };

        try {
          await saveMockTestResult(payload);
        } catch (e) {
          console.warn('[MockTestThanks] Supabase save failed, keeping localStorage:', e.message);
        }

        try {
          localStorage.setItem(`met:${testId}:submission`, JSON.stringify(payload));
        } catch {}

        meta.data.sections.forEach(s => {
          try { localStorage.removeItem(`met:timer:${s.id}`); } catch {}
          try { sessionStorage.removeItem(`met:section:${s.id}:answers`); } catch {}
        });

        if (!cancelled) { setSavedResult(payload); setStatus('done'); }
      } catch (e) {
        if (!cancelled) { setError(e.message); setStatus('error'); }
      }
    })();
    return () => { cancelled = true; };
  }, [answers, student, testId]);

  if (status !== 'done') {
    const isSaving = status === 'saving';
    const isError = status === 'error';
    return (
      <div className="mtr-container">
        <div className="card mtr__loading" role={isError ? 'alert' : 'status'} aria-live={isError ? 'assertive' : 'polite'}>
          {isSaving && (
            <>
              <div className="mtr__loading-spinner" aria-hidden="true">
                <div className="spinner" />
              </div>
              <h3 className="mtr__loading-title">Saving Your Results</h3>
              <p className="mtr__loading-text">We're calculating your scores and saving your test submission. This usually takes a few seconds.</p>
            </>
          )}
          {isError && (
            <>
               <div className="mtr__error-icon" aria-hidden="true"><Icon.warning size={32} /></div>
              <h3 className="mtr__error-title">Something Went Wrong</h3>
              <p className="mtr__error-text">We couldn't save your test results: {error}</p>
              <p className="mtr__error-hint">Your answers are saved locally. Try refreshing the page or contact support if this continues.</p>
              <Button variant="primary" onClick={() => window.location.reload()}>Refresh Page</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Use official MET scaled scores for display
  const readingPct = readingScore?.max > 0 ? Math.round((readingScore.total / readingScore.max) * 100) : 0;
  const listeningPct = listeningScore?.max > 0 ? Math.round((listeningScore.total / listeningScore.max) * 100) : 0;
  
  // Compute scaled scores for display (same as in useEffect)
  const scaled = computeScaledScores({ reading: readingScore, listening: listeningScore });
  const cefr = scaled.cefr;
  const cefrColor = getCefrColor(cefr);
  const combinedTotal = (readingScore?.total || 0) + (listeningScore?.total || 0);
  const combinedMax = (readingScore?.max || 0) + (listeningScore?.max || 0);

  return (
    <div className="mtr-container">
      <article className="mtr card">
        <header className="mtr__header">
          <h1 className="mtr__title">Mock Test Results</h1>
          <p className="mtr__subtitle">{meta.data.title}</p>

          <div className="mtr__badge" style={{ background: cefrColor }}>{cefr}</div>
          <div className="mtr__score">{scaled.overall} / 80 <span className="mtr__score-raw">({combinedTotal} / {combinedMax} raw)</span></div>
          <p className="mtr__label">{scaled.cefrLabel}</p>
          <p className="mtr__label-desc">{scaled.cefrDescription}</p>

          <div className="mtr__bar" role="img" aria-label={`CEFR level progression, current level: ${cefr}`}>
            {CEFR_CONFIG.LEVELS.map(l => (
              <div
                key={l.id}
                className={`mtr__bar-level ${l.id === cefr ? 'mtr__bar-level--active' : ''}`}
                style={{ background: l.color }}
              >
                <span className="mtr__bar-label">{l.label}</span>
                <span className="mtr__bar-desc">{l.desc}</span>
              </div>
            ))}
          </div>
          
          {/* Target progress */}
          <div className="mtr__target" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span className="text-sm font-medium text-primary">🎯 Nursing Target: 58 Overall / 59 Speaking</span>
            <div className="text-xs text-ink-muted mt-1">{targetMessage(scaled)}</div>
          </div>
        </header>

        <div className="mtr__message alert-box" style={{ background: 'var(--info-bg)', borderColor: 'var(--info-soft)' }}>
          You've completed your mock test. Your score is a starting point, not a final judgment.
          This result shows us exactly where to focus next. Together, we'll analyse your performance
          by skill area, identify the gaps, and build a targeted plan to close them before exam day.
          Every mistake here is a mistake you won't make in the real test.
        </div>

        <div className="mtr__skills">
          <SkillCard
            label="Listening"
            score={listeningScore}
            scaled={scaled.listening}
            pct={listeningPct}
            cefr={getCefrLevelFromPercent(listeningPct)}
          />
          <SkillCard
            label="Reading & Grammar"
            score={readingScore}
            scaled={scaled.reading}
            pct={readingPct}
            cefr={getCefrLevelFromPercent(readingPct)}
          />
        </div>

        <div className="mtr__actions">
          <h2 className="mtr__actions-title">Next Steps</h2>
          <ActionItem priority="high" label="HIGH">
            <strong>Review your mistakes</strong>
            Look at the questions you got wrong and understand why. Each incorrect answer reveals a specific gap to work on.
          </ActionItem>
          <ActionItem priority="medium" label="MEDIUM">
            <strong>Focus on your weaker skill</strong>
            {cefr === 'Below B1' || cefr === 'B1'
              ? 'Prioritise building foundational vocabulary and grammar through daily practice exercises.'
              : 'Practise with authentic materials at or slightly above your current level to push toward the next band.'}
          </ActionItem>
          <ActionItem priority="low" label="NEXT">
            <strong>Take another mock test</strong>
            Track your progress over time. Aim to move up one CEFR band with each practice cycle.
          </ActionItem>
        </div>

        <Button variant="primary" size="lg" className="mtr__btn" onClick={onBack}>
          Return to Dashboard
        </Button>
      </article>
      <style>{`
        .mtr-container { max-width: 800px; margin: 0 auto; padding: var(--space-5) var(--space-4); }
        .mtr { overflow: hidden; }
        .mtr__header { padding: var(--space-8) var(--space-6) var(--space-5); text-align: center; }
        .mtr__title { font-size: var(--text-3xl); margin: 0 0 var(--space-1); font-weight: 800; }
        .mtr__subtitle { color: var(--text-muted); font-size: var(--text-base); margin: 0 0 var(--space-5); }
        .mtr__badge { display: inline-block; padding: var(--space-3) var(--space-8); border-radius: var(--radius-pill); font-size: var(--text-3xl); font-weight: 800; color: var(--on-dark); }
        .mtr__score { font-size: var(--text-4xl); font-weight: 800; margin-top: var(--space-2); }
        .mtr__score-raw { font-size: var(--text-lg); font-weight: 400; color: var(--text-muted); margin-left: var(--space-2); }
        .mtr__label { font-size: var(--text-sm); color: var(--text-muted); margin-top: var(--space-2); }
        .mtr__label-desc { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1); }
        .mtr__bar { display: flex; gap: var(--space-1); margin-top: var(--space-5); border-radius: var(--radius-md); overflow: hidden; }
        .mtr__bar-level { flex: 1; padding: var(--space-2) var(--space-1); text-align: center; font-size: var(--text-2xs); font-weight: 700; color: var(--on-dark); position: relative; transition: transform var(--transition-base); }
        .mtr__bar-level--active { transform: scaleY(1.15); box-shadow: 0 -2px 8px rgba(0,0,0,0.2); z-index: 1; }
        .mtr__bar-label { display: block; font-size: var(--text-xs); }
        .mtr__bar-desc { display: block; font-size: 0.55rem; opacity: 0.85; margin-top: 2px; }
        .mtr__target { margin-top: var(--space-4); padding: var(--space-3); background: var(--primary-light); border-radius: var(--radius-md); text-align: center; }
        .mtr__message { border-radius: var(--radius-md); padding: var(--space-4) var(--space-5); margin: 0 var(--space-6) var(--space-5); font-size: var(--text-sm); line-height: 1.6; }
        .mtr__skills { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); padding: 0 var(--space-6) var(--space-5); }
        .mtr__actions { padding: 0 var(--space-6) var(--space-5); }
        .mtr__actions-title { font-size: var(--text-xl); margin: 0 0 var(--space-4); font-weight: 700; }
        .mtr__btn { display: block; width: calc(100% - var(--space-12)); margin: 0 var(--space-6) var(--space-6); }
        @media (max-width: 600px) {
          .mtr__skills { grid-template-columns: 1fr; }
          .mtr__badge { font-size: var(--text-2xl); padding: var(--space-2) var(--space-6); }
          .mtr__bar-desc { display: none; }
        }
      `}</style>
    </div>
  );
}

function SkillCard({ label, score, scaled, pct, cefr }) {
  if (!score) return null;
  const color = getCefrColor(cefr);
  return (
    <div className="mtr__skill card">
      <div className="mtr__skill-header">
        <span>{label}</span>
        <span className="pill mtr__skill-badge" style={{ background: color }}>{cefr}</span>
      </div>
      <div className="mtr__skill-score">{scaled} / 80 <span className="mtr__score-raw">({score.total} / {score.max} raw)</span></div>
      <div className="progress-bar mtr__skill-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="mtr__skill-desc">{getCefrDescription(cefr) || ''}</p>
    </div>
  );
}

function ActionItem({ priority, label, children }) {
  const priorityClasses = {
    high: 'pill-danger',
    medium: 'pill-warning',
    low: 'pill-success',
  };
  return (
    <div className="mtr__action-item">
      <span className={`pill ${priorityClasses[priority] || 'pill-default'} mtr__action-priority`}>{label}</span>
      <div className="mtr__action-text">{children}</div>
    </div>
  );
}