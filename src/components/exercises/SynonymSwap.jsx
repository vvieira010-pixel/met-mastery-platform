import { useState } from 'react';

const TEAL = 'var(--accent)';
const NAVY = 'var(--accent-text)';

export default function SynonymSwap({ exercise, onComplete, readOnly = false, result = null }) {
  const {
    sentence = '',
    swaps = [],
    explanation = '',
  } = exercise;

  const [selected, setSelected] = useState(() => result?.selected || {});
  const [submitted, setSubmitted] = useState(() => readOnly || Boolean(result));

  function handleSelect(swapIdx, optionIdx) {
    if (submitted || readOnly) return;
    setSelected(prev => ({ ...prev, [swapIdx]: optionIdx }));
  }

  function handleSubmit() {
    if (submitted || readOnly || Object.keys(selected).length < swaps.length) return;
    setSubmitted(true);
    const allCorrect = swaps.every((swap, i) => selected[i] === swap.correct);
    if (onComplete) onComplete({ correct: allCorrect, selected });
  }

  const segments = sentence.split(/(\[[^\]]+\])/);

  return (
    <div>
      {exercise.instruction && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 12 }}>
          {exercise.instruction}
        </p>
      )}

      <div style={{
        padding: '14px 16px', marginBottom: 18, borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        fontSize: 15, lineHeight: 2,
      }}>
        {segments.map((seg, i) => {
          if (/^\[.*\]$/.test(seg)) {
            const word = seg.slice(1, -1);
            const swapIdx = swaps.findIndex(s => s.word === word);
            const swap = swapIdx >= 0 ? swaps[swapIdx] : null;
            const selectedOpt = swap && selected[swapIdx] != null ? swap.options[selected[swapIdx]] : null;
            return (
              <span key={i} style={{
                background: submitted
                  ? (swap && selected[swapIdx] === swap.correct ? 'var(--ex-correct-bg)' : 'var(--ex-wrong-bg)')
                  : 'var(--accent-subtle)',
                color: submitted
                  ? (swap && selected[swapIdx] === swap.correct ? 'var(--ex-correct-text)' : 'var(--ex-wrong-text)')
                  : 'var(--accent-text)',
                padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                fontWeight: 600, margin: '0 3px',
              }}>
                {selectedOpt || word}
              </span>
            );
          }
          return <span key={i}>{seg}</span>;
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {swaps.map((swap, swapIdx) => (
          <div key={swapIdx}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6 }}>
              Choose a B2 synonym for: <strong style={{ color: 'var(--accent-text)' }}>[{swap.word}]</strong>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(swap.options || []).map((opt, optIdx) => {
                const isSelected = selected[swapIdx] === optIdx;
                let borderColor = 'var(--border)', bg = 'var(--surface)', color = 'var(--text)';
                if (!submitted) {
                  if (isSelected) { borderColor = TEAL; bg = 'var(--ex-selected-bg)'; color = NAVY; }
                } else {
                  if (optIdx === swap.correct) { borderColor = 'var(--ex-correct-strong)'; bg = 'var(--ex-correct-bg)'; color = 'var(--ex-correct-text)'; }
                  else if (isSelected && optIdx !== swap.correct) { borderColor = 'var(--danger)'; bg = 'var(--ex-wrong-bg)'; color = 'var(--ex-wrong-text)'; }
                  else { borderColor = 'var(--divider)'; color = 'var(--muted)'; }
                }
                return (
                  <button key={optIdx}
                    onClick={() => handleSelect(swapIdx, optIdx)}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${borderColor}`, background: bg, color,
                      fontWeight: 600, fontSize: 13, cursor: submitted ? 'default' : 'pointer',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted && !readOnly ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(selected).length < swaps.length}
          style={{
            marginTop: 18, padding: '10px 24px', borderRadius: 'var(--radius-sm)', border: 'none',
            cursor: Object.keys(selected).length < swaps.length ? 'not-allowed' : 'pointer',
            background: Object.keys(selected).length < swaps.length
              ? 'var(--border)'
              : `linear-gradient(120deg, ${TEAL} 0%, ${NAVY} 100%)`,
            color: '#fff', fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-sans)',
            opacity: Object.keys(selected).length < swaps.length ? 0.5 : 1,
          }}
        >
          Submit answer
        </button>
      ) : (
        <div style={{ marginTop: 14 }}>
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            background: swaps.every((s, i) => selected[i] === s.correct) ? 'var(--ex-correct-bg)' : 'var(--ex-wrong-bg)',
            border: `1px solid ${swaps.every((s, i) => selected[i] === s.correct) ? 'var(--ex-correct-border)' : 'var(--ex-wrong-border)'}`,
            fontSize: 14, fontWeight: 600,
            color: swaps.every((s, i) => selected[i] === s.correct) ? 'var(--ex-correct-text)' : 'var(--ex-wrong-text)',
          }}>
            {swaps.every((s, i) => selected[i] === s.correct)
              ? '✓ All synonyms correct!'
              : '✗ Some synonyms need review.'}
          </div>
          {explanation && (
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--ex-panel-bg)', border: '1px solid var(--ex-panel-border)',
              fontSize: 13.5, color: 'var(--ex-panel-text)', lineHeight: 1.65,
            }}>
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
