import { useState } from 'react';
import { scoreWriting } from '../../lib/writing-score.js';

const TEAL = 'var(--accent)';
const NAVY = 'var(--accent-text)';

function scoreColor(val) {
  if (val == null) return 'var(--muted)';
  if (val >= 3) return 'var(--success)';
  if (val >= 2) return TEAL;
  if (val >= 1) return 'var(--warning)';
  return 'var(--error)';
}

function scoreBg(val) {
  if (val == null) return 'var(--bg)';
  if (val >= 3) return 'var(--success-bg)';
  if (val >= 2) return 'var(--primary-light)';
  if (val >= 1) return 'var(--warning-bg)';
  return 'var(--error-bg)';
}

export default function Writing({ exercise, onComplete }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const prompt = exercise.prompt || exercise.question || '';
  const instruction = exercise.instruction || '';
  const minChars = 10;
  const maxChars = 12000;

  const canScore = text.trim().length >= minChars;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  async function handleScore() {
    if (!canScore) return;
    setLoading(true);
    setError(null);
    try {
      const data = await scoreWriting({ essay: text, taskPrompt: prompt });
      setResult(data.evaluation);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    if (onComplete) {
      onComplete({
        score: result?.scaledScore ?? null,
        total: 80,
        correct: null,
      });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {instruction && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
          {instruction}
        </p>
      )}
      <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: NAVY, lineHeight: 1.6, margin: 0 }}>
        {prompt}
      </p>

      <textarea
        data-testid="writing-textarea"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxChars))}
        placeholder="Write your response here..."
        rows={exercise.rows || 8}
        disabled={loading}
        style={{
          width: '100%',
          minHeight: 160,
          padding: '12px 14px',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.7,
          color: 'var(--text)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm, 6px)',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          {wordCount} words{text.length >= maxChars ? ' · limit reached' : ''}
        </span>
        <button
          data-testid="writing-score-button"
          onClick={handleScore}
          disabled={!canScore || loading}
          style={{
            padding: '11px 22px',
            borderRadius: 'var(--radius-sm, 6px)',
            border: 'none',
            background: canScore && !loading ? `linear-gradient(120deg, ${TEAL} 0%, ${NAVY} 100%)` : 'var(--border)',
            color: canScore && !loading ? 'var(--on-dark)' : 'var(--muted)',
            fontWeight: 700,
            fontSize: 'var(--text-sm)',
            cursor: canScore && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Scoring with AssemblyAI…' : 'Score my writing'}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ padding: '10px 12px', background: 'var(--ex-wrong-bg)', border: '1px solid var(--ex-wrong-border)', borderRadius: 'var(--radius-sm, 6px)', color: 'var(--ex-wrong-text)', fontSize: 'var(--text-sm)' }}>
          {error}
        </div>
      )}

      {result && (
        <div data-testid="writing-results" style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.22s ease-out both' }}>
          {/* Overall */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estimated MET band</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: NAVY }}>{result.scaledScore ?? '—'}</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>/ 80</span>
            <span style={{ padding: '2px 10px', borderRadius: 99, background: 'var(--primary-light)', color: TEAL, fontSize: 'var(--text-xs)', fontWeight: 700 }}>
              {result.cefrEstimate ?? '—'}
            </span>
          </div>

          {/* Criteria */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { key: 'task', label: 'Task Completion' },
              { key: 'organization', label: 'Cohesion & Organization' },
              { key: 'grammar', label: 'Grammatical Accuracy' },
              { key: 'vocabulary', label: 'Vocabulary' },
              { key: 'mechanics', label: 'Mechanics' },
            ].map(({ key, label }) => {
              const val = result.scores?.[key];
              const c = scoreColor(val);
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 99, background: scoreBg(val), color: c, fontSize: 'var(--text-xs)', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                    {val ?? '—'}
                  </span>
                </div>
              );
            })}
          </div>

          {result.feedback && (
            <div style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm, 6px)', fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text)' }}>
              {result.feedback}
            </div>
          )}

          {result.corrections?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corrections</span>
              {result.corrections.map((c, i) => (
                <div key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--error)', textDecoration: 'line-through' }}>{c.original}</span>
                  {' → '}
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{c.corrected}</span>
                  {c.explanation && <span style={{ color: 'var(--muted)' }}> — {c.explanation}</span>}
                </div>
              ))}
            </div>
          )}

          {(result.strengths?.length > 0 || result.weaknesses?.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {result.strengths?.length > 0 && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strengths</span>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 'var(--text-sm)', color: 'var(--text-2)' }}>
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {result.weaknesses?.length > 0 && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weaknesses</span>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 'var(--text-sm)', color: 'var(--text-2)' }}>
                    {result.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            data-testid="writing-continue-button"
            onClick={handleContinue}
            style={{
              marginTop: 8,
              padding: '11px 22px',
              borderRadius: 'var(--radius-sm, 6px)',
              border: 'none',
              background: `linear-gradient(120deg, ${TEAL} 0%, ${NAVY} 100%)`,
              color: 'var(--on-dark)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
