import { useState, useEffect } from 'react';

export default function Dialogue({ exercise, onComplete, readOnly = false, result = null }) {
  const {
    lines = [],
    explanation = '',
  } = exercise;

  const [revealed, setRevealed] = useState(() => readOnly || result ? lines.length - 1 : 0);

  useEffect(() => {
    if (lines.length <= 1 && onComplete) {
      onComplete({ correct: true });
    }
  }, [lines.length, onComplete]);

  function handleReveal() {
    if (readOnly || result) return;
    const next = revealed + 1;
    setRevealed(next);
    if (next >= lines.length - 1 && onComplete) {
      onComplete({ correct: true });
    }
  }

  const visibleLines = lines.slice(0, revealed + 1);
  const isFinished = lines.length <= 1 || revealed >= lines.length - 1;

  return (
    <div>
      {exercise.instruction && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 12 }}>
          {exercise.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleLines.map((line, i) => {
          const isSpeakerA = line.speaker === 'A';
          return (
            <div key={line.id || i} style={{
              display: 'flex', gap: 10, padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: isSpeakerA ? 'var(--accent-subtle)' : 'var(--surface)',
              border: '1px solid var(--border)',
              opacity: 1,
            }}>
              <span style={{
                fontWeight: 700, color: 'var(--primary)', width: 24, flexShrink: 0,
                fontSize: 'var(--text-sm)',
              }}>
                {line.speaker}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                {line.text}
              </span>
            </div>
          );
        })}
      </div>

      {!isFinished && !readOnly && !result && (
        <button
          onClick={handleReveal}
          style={{
            marginTop: 14, padding: '10px 20px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Reveal next line ({revealed + 1} / {lines.length})
        </button>
      )}

      {isFinished && (
        <div style={{
          marginTop: 14,
          padding: '10px 14px',
          background: 'var(--accent-subtle)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--primary)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          ✓ Dialogue complete
        </div>
      )}

      {explanation && isFinished && (
        <div style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-hover)', border: '1px solid var(--border)',
          fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65,
        }}>
          {explanation}
        </div>
      )}
    </div>
  );
}
