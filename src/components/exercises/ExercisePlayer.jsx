import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react'; // ExercisePlayer
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from '../shared.jsx';
import { loadExercises } from './validateExercise.js';
import { hintLimit } from '../../lib/fading-manager.js';
import { callAI } from '../../lib/callAI.js';
import { withSkills } from '../../education-skills/active-skills.js';
import MultipleChoice from './MultipleChoice.jsx';
import FillBlank from './FillBlank.jsx';
import ShortAnswer from './ShortAnswer.jsx';
import OrderSentences from './OrderSentences.jsx';
import ErrorCorrection from './ErrorCorrection.jsx';
import Listening from './Listening.jsx';
import ReadExercise from './ReadExercise.jsx';
import EmbeddedLesson from './EmbeddedLesson.jsx';
import Writing from './Writing.jsx';
import ErrorDiagnosisGate from '../ErrorDiagnosisGate.jsx';

const TEAL = 'var(--accent)';
const NAVY = 'var(--accent-text)';

const TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  multiple_choice_single: 'Multiple Choice',
  multiple_choice_multiple: 'Multiple Choice',
  fill_blank: 'Fill in the Blank',
  short_answer: 'Speaking Practice',
  order_sentences: 'Order Sentences',
  error_correction: 'Level Up',
  drag_and_drop_matching: 'Matching',
  true_false_with_explanation: 'True/False',
  interactive_scenario_case_study: 'Scenario',
  timed_quick_fire: 'Quick Fire',
  mcq: 'Multiple Choice',
  blank: 'Fill in the Blank',
  short: 'Speaking Practice',
  order: 'Ordering',
  fix: 'Level Up',
  listen: 'Listening',
  read: 'Reading',
  embed: 'Embedded Lesson',
};

function InvalidExercise({ reason }) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--ex-wrong-bg)', border: '1px solid var(--ex-wrong-border)', borderRadius: 'var(--radius-sm, 6px)', color: 'var(--ex-wrong-text)', fontSize: 13.5, lineHeight: 1.6 }}>
      <strong>This exercise could not be loaded</strong> — {reason}
    </div>
  );
}

const SPEAKING_FEEDBACK_CRITERIA = [
  ['task', 'Task completion'],
  ['language', 'Language resources'],
  ['delivery', 'Intelligibility / delivery'],
];

function feedbackList(value) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim()).slice(0, 4)
    : [];
}

function FeedbackList({ items, tone = 'var(--text)' }) {
  if (items.length === 0) return null;
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, color: tone, fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
      {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
    </ul>
  );
}

function SavedPracticeFeedback({ result }) {
  const evaluation = result?.evaluation;
  if (!evaluation) {
    return <p role="status" style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.55 }}>Your response is saved. This question is locked and cannot be changed.</p>;
  }

  const strengths = feedbackList(evaluation.strengths);
  const weaknesses = feedbackList(evaluation.weaknesses);
  const rationale = evaluation.rationale && typeof evaluation.rationale === 'object' ? evaluation.rationale : {};
  const corrections = Array.isArray(evaluation.corrections)
    ? evaluation.corrections.filter(correction => correction && (correction.original || correction.corrected)).slice(0, 4)
    : [];

  return (
    <div role="status" data-testid="practice-studio-saved-feedback" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.55 }}>
        This AI-scored attempt is saved and locked. You can revisit its feedback any time.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {evaluation.estimatedBandLabel && <span style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm, 6px)', background: TEAL, color: 'var(--on-dark)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>{evaluation.estimatedBandLabel}</span>}
        {evaluation.cefrEstimate && <span style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm, 6px)', background: 'var(--accent-subtle)', color: 'var(--text)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>{evaluation.cefrEstimate}</span>}
        {evaluation.rubricAvg != null && <span style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm, 6px)', background: 'var(--accent-subtle)', color: 'var(--text)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>Rubric average {evaluation.rubricAvg} / 4</span>}
        {evaluation.scaledScore != null && <span style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm, 6px)', background: 'var(--accent-subtle)', color: 'var(--text)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>Estimated score {evaluation.scaledScore} / 80</span>}
      </div>
      {evaluation.feedback && (
        <section aria-label="Overall speaking feedback" style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)' }}>
          <strong style={{ display: 'block', marginBottom: 6, fontSize: 'var(--text-xs)', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall feedback</strong>
          <div style={{ color: 'var(--text)', fontSize: 'var(--text-sm)', lineHeight: 1.65 }}>{evaluation.feedback}</div>
        </section>
      )}
      {SPEAKING_FEEDBACK_CRITERIA.some(([key]) => evaluation.scores?.[key] != null || rationale[key]) && (
        <section aria-label="Speaking rubric feedback" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong style={{ fontSize: 'var(--text-xs)', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rubric feedback</strong>
          {SPEAKING_FEEDBACK_CRITERIA.map(([key, label]) => {
            const score = evaluation.scores?.[key];
            const explanation = rationale[key];
            if (score == null && !explanation) return null;
            return (
              <div key={key} style={{ padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                  <strong style={{ color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{label}</strong>
                  {score != null && <span style={{ color: TEAL, fontSize: 'var(--text-sm)', fontWeight: 700 }}>{score} / 4</span>}
                </div>
                {explanation && <p style={{ margin: '5px 0 0', color: 'var(--text-2)', fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>{explanation}</p>}
              </div>
            );
          })}
        </section>
      )}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {strengths.length > 0 && (
            <section aria-label="Speaking strengths" style={{ padding: '12px 14px', background: 'var(--success-bg, var(--bg))', border: '1px solid var(--success-border, var(--border))', borderRadius: 'var(--radius-sm, 6px)' }}>
              <strong style={{ display: 'block', marginBottom: 6, fontSize: 'var(--text-xs)', color: 'var(--success, var(--text))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What worked</strong>
              <FeedbackList items={strengths} />
            </section>
          )}
          {weaknesses.length > 0 && (
            <section aria-label="Speaking next steps" style={{ padding: '12px 14px', background: 'var(--ex-hint-bg, var(--bg))', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)' }}>
              <strong style={{ display: 'block', marginBottom: 6, fontSize: 'var(--text-xs)', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next steps</strong>
              <FeedbackList items={weaknesses} tone="var(--text-2)" />
            </section>
          )}
        </div>
      )}
      {corrections.length > 0 && (
        <section aria-label="Speaking corrections" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <strong style={{ fontSize: 'var(--text-xs)', color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Language corrections</strong>
          {corrections.map((correction, index) => <div key={index} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 1.5 }}><s>{correction.original || 'Original wording'}</s> → <strong>{correction.corrected || 'Suggested wording'}</strong>{correction.explanation ? ` — ${correction.explanation}` : ''}</div>)}
        </section>
      )}
      {evaluation.deliveryEvidence && <div style={{ paddingTop: 2, fontSize: 'var(--text-xs)', color: 'var(--text-2)', lineHeight: 1.55 }}><strong>Evidence note:</strong> {evaluation.deliveryEvidence}</div>}
    </div>
  );
}

function useAIPoweredHints(exercise, scaffoldLevel) {
  const [hints, setHints] = useState(null);
  const [loading, setLoading] = useState(false);
  const maxHints = hintLimit(scaffoldLevel);

  useEffect(() => {
    if (exercise.hints?.length > 0) {
      setHints(exercise.hints.slice(0, maxHints));
      return;
    }
    if (maxHints === 0) return;

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const prompt = [
          `You are a MET tutor. Generate up to ${maxHints} progressive hints for this exercise.`,
          `Exercise type: ${exercise.type}`,
          `Question: ${exercise.prompt || exercise.question || ''}`,
          exercise.options ? `Options: ${JSON.stringify(exercise.options)}` : '',
          exercise.blanks ? `Blanks: ${JSON.stringify(exercise.blanks.map(b => ({ before: b.before, after: b.after })))}` : '',
          exercise.text ? `Text: ${exercise.text}` : '',
          `Correct answer: ${exercise.correct || exercise.answer || ''}`,
          '',
          'Rules:',
          '- Hint 1: conceptual nudge only — what concept or rule this tests',
          '- Hint 2: procedural guidance — how to approach solving it',
          '- Hint 3: concrete pointer — without giving the answer directly',
          'Return ONLY a JSON array of hint strings. Example: ["Hint one...", "Hint two...", "Hint three..."]',
        ].filter(Boolean).join('\n');

        const data = await callAI(prompt, await withSkills('practice', { temperature: 0.4, max_tokens: 500 }));
        const raw = data.content?.map(b => b.text || '').join('') || '';
        const match = raw.match(/\[[\s\S]*?\]/);
        const parsed = match ? JSON.parse(match[0]) : null;

        if (!cancelled) {
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHints(parsed.slice(0, maxHints));
          } else {
            setHints(null);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setHints(null); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [exercise.prompt, exercise.question, exercise.type, exercise.answer, exercise.blanks, exercise.correct, exercise.hints, exercise.options, exercise.text, maxHints]);

  return { hints, loading };
}

const ExerciseCard = memo(function ExerciseCard({ exercise, index, total, result, onComplete, onNext, onBack, onSkip, saving = false, scaffoldLevel = 4, onHintLevelChange, practiceStudio = false }) {
  const label = TYPE_LABELS[exercise.type] || exercise.type;
  const skill = exercise.skill || exercise.focus || null;
  const done = result != null;

  const [hintLevel, setHintLevel] = useState(0);
  const [showErrorGate, setShowErrorGate] = useState(false);
  const [errorCategory, setErrorCategory] = useState(null);
  const { hints, loading: hintsLoading } = useAIPoweredHints(exercise, scaffoldLevel);
  const maxHints = hintLimit(scaffoldLevel);
  const actualHints = (hints || []).length > 0 ? hints : [];
  const hintCount = actualHints.length;

  const handleHintClick = useCallback(() => {
    if (!result || result.correct === false) {
      setShowErrorGate(true);
      return;
    }
    setHintLevel(l => {
      const next = l + 1;
      onHintLevelChange?.(next);
      return next;
    });
  }, [result, onHintLevelChange]);

  const handleDiagnose = useCallback((category) => {
    setErrorCategory(category);
    setShowErrorGate(false);
    setHintLevel(l => {
      const next = l + 1;
      onHintLevelChange?.(next);
      return next;
    });
  }, [onHintLevelChange]);

  const handleSkipGate = useCallback(() => {
    setShowErrorGate(false);
    setHintLevel(l => {
      const next = l + 1;
      onHintLevelChange?.(next);
      return next;
    });
  }, [onHintLevelChange]);

  const handleComplete = useCallback((answerResult) => {
    onComplete?.({ ...answerResult, errorCategory: errorCategory || null });
  }, [onComplete, errorCategory]);

  function renderExercise() {
    const props = { exercise, onComplete: handleComplete, practiceStudio };
    switch (exercise.type) {
      case 'multiple_choice':
      case 'multiple_choice_single':
      case 'multiple_choice_multiple':
      case 'mcq': return <MultipleChoice {...props} />;
      case 'fill_blank':
      case 'blank':      return <FillBlank {...props} />;
      case 'short_answer':
      case 'short':
      case 'speak':
      case 'speaking':   return <ShortAnswer {...props} />;
      case 'writing':    return <Writing {...props} />;
      case 'order_sentences':
      case 'ordering_sequencing':
      case 'order':      return <OrderSentences {...props} />;
      case 'error_correction':
      case 'fix':        return <ErrorCorrection {...props} />;
      case 'listen':     return <Listening {...props} />;
      case 'read':       return <ReadExercise {...props} />;
      case 'embed':      return <EmbeddedLesson {...props} />;
      // New types (stubs for now)
      case 'drag_and_drop_matching':
      case 'true_false_with_explanation':
      case 'interactive_scenario_case_study':
      case 'timed_quick_fire':
        return <InvalidExercise reason={`Component for type "${exercise.type}" is not yet implemented.`} />;
      default:       return <InvalidExercise reason={`Unknown type "${exercise.type}".`} />;
    }
  }

  const isCorrect = done && result?.correct === true;
  const isIncorrect = done && result?.correct === false;
  const isAiScored = done && practiceStudio && result?.evaluation;
  const doneBorderColor = isCorrect ? 'var(--success)' : isIncorrect ? 'var(--error)' : 'var(--border)';

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden',
      border: `1px solid var(--border, #e5e7eb)`,
      borderLeft: done ? `3px solid ${doneBorderColor}` : '1px solid var(--border, #e5e7eb)',
      boxShadow: '0 4px 20px -8px rgba(14,31,92,0.18), 0 1px 4px rgba(18,40,121,0.06)',
      transition: 'border-color 0.2s ease',
    }}>
      {/* Card header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--divider)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        background: isCorrect ? 'var(--success-bg)' : isIncorrect ? 'var(--ex-wrong-bg)' : 'var(--surface)',
        transition: 'background 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 'var(--radius-sm, 6px)',
            background: TEAL, color: 'var(--on-dark)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {label}
          </span>
          {done && (
            <span style={{
              padding: '2px 8px', borderRadius: 'var(--radius-sm, 6px)',
              fontSize: 12, fontWeight: 700,
              background: isCorrect ? 'var(--success)' : isIncorrect ? 'var(--error)' : 'var(--ink-soft)',
              color: isCorrect ? 'var(--on-dark)' : isIncorrect ? 'var(--on-dark)' : 'var(--text-muted)',
            }}>
              {isCorrect ? '✓ Correct' : isIncorrect ? '✗ Incorrect' : isAiScored ? '✓ AI scored' : 'Skipped'}
            </span>
          )}
          {skill && (
            <span style={{
              padding: '3px 10px', borderRadius: 'var(--radius-sm, 6px)',
              background: 'var(--accent-soft)', color: NAVY,
              fontSize: 11, fontWeight: 600,
            }}>
              {skill}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={onBack}
            disabled={index === 0 || saving}
            aria-label="Previous exercise"
            className="focus-visible:ring-2 focus-visible:ring-offset-2 hover:brightness-105"
            style={{
              width: 40, height: 40, padding: 0, borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #e5e7eb)', background: 'var(--surface)',
              color: index === 0 ? 'var(--faint, #d1d5db)' : 'var(--text-2, var(--ex-panel-text))',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, lineHeight: 1,
            }}
          >
            <span aria-hidden="true">←</span>
          </button>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, minWidth: 42, textAlign: 'center' }}>
            {index + 1} / {total}
          </span>
          <button
            onClick={done ? onNext : onSkip}
            disabled={saving || (index === total - 1 && !done)}
            aria-label={done ? 'Next exercise' : 'Skip exercise'}
            className="focus-visible:ring-2 focus-visible:ring-offset-2 hover:brightness-105"
            style={{
              width: 40, height: 40, padding: 0, borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #e5e7eb)', background: 'var(--surface)',
              color: (index === total - 1 && !done) ? 'var(--faint, #d1d5db)' : 'var(--text-2, var(--ex-panel-text))',
              cursor: (index === total - 1 && !done) ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, lineHeight: 1,
            }}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* Exercise body */}
      <div style={{ padding: '20px 20px 24px' }}>
        {done && practiceStudio ? (
          <SavedPracticeFeedback result={result} />
        ) : renderExercise()}
        {saving && <p role="status" aria-live="polite" style={{ margin: '12px 0 0', color: 'var(--text-2)', fontSize: 13 }}>Saving this question…</p>}
      </div>

      {/* Error diagnosis gate — shown when wrong answer + hint clicked */}
      {!done && showErrorGate && (
        <div style={{ padding: '0 20px' }}>
          <ErrorDiagnosisGate onDiagnose={handleDiagnose} onSkip={handleSkipGate} />
        </div>
      )}

      {/* Progressive hint ladder — AI-powered, controlled by scaffold level */}
      {!done && !showErrorGate && maxHints > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          {hintLevel > 0 && (
            <div role="status" aria-live="polite" style={{ marginBottom: 8, padding: '8px 12px', background: 'var(--ex-hint-bg)', border: '1px solid var(--ex-hint-border)', borderRadius: 'var(--radius-sm, 6px)', fontSize: 'var(--text-xs)', color: 'var(--ex-hint-text)', lineHeight: 1.5 }}>
              <strong>Hint {hintLevel}:</strong> {actualHints[hintLevel - 1] || 'Think about what rule or concept applies here.'}
            </div>
          )}
          {hintLevel < hintCount && (
            <button
              onClick={handleHintClick}
              disabled={hintsLoading}
              style={{ minHeight: 44, padding: '8px 16px', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)', fontSize: 13, fontWeight: 600, cursor: hintsLoading ? 'default' : 'pointer', fontFamily: 'var(--font-sans)', opacity: hintsLoading ? 0.5 : 1 }}
            >
              {hintsLoading ? 'Generating hints…' : hintLevel === 0 ? 'Need a hint?' : 'Next hint →'}
            </button>
          )}
        </div>
      )}

      {/* Navigation footer */}
      <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <button
          onClick={onBack}
          disabled={index === 0 || saving}
          style={{
            padding: '8px 16px', borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border, #e5e7eb)', background: 'none',
            color: 'var(--text-2, var(--ex-panel-text))', fontSize: 13, fontWeight: 600,
            cursor: index === 0 ? 'default' : 'pointer', fontFamily: 'var(--font-sans)',
            opacity: index === 0 ? 0.5 : 1,
          }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {!done && (
            <button
              onClick={onSkip}
              disabled={saving}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e5e7eb)', background: 'none',
                color: 'var(--muted, #9ca3af)', fontSize: 13, fontWeight: 500,
                cursor: saving ? 'default' : 'pointer', fontFamily: 'var(--font-sans)', opacity: saving ? 0.5 : 1,
              }}
            >
              Skip →
            </button>
          )}
          {done && (
            <button
              onClick={onNext}
              disabled={saving}
              style={{
                padding: '8px 22px', borderRadius: 'var(--radius-sm, 6px)', border: 'none',
                cursor: saving ? 'default' : 'pointer', background: `linear-gradient(120deg, ${TEAL} 0%, ${NAVY} 100%)`, opacity: saving ? 0.5 : 1,
                color: 'var(--on-dark)', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-sans)',
              }}
            >
              {index < total - 1 ? 'Next exercise →' : 'Finish session →'}
            </button>
          )}
          {!done && (
            <button
              onClick={onNext}
              disabled={index >= total - 1}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #e5e7eb)', background: 'none',
                color: index >= total - 1 ? 'var(--faint, #d1d5db)' : 'var(--text-2)',
                fontSize: 13, fontWeight: 500,
                cursor: index >= total - 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
                opacity: index >= total - 1 ? 0.5 : 1,
              }}
            >
              {index < total - 1 ? 'Next →' : 'Finish →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const reduceMotion = useReducedMotion();
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 500 }}>
        <span id="ex-progress-label">Progress</span>
        <span>{current} of {total} completed</span>
      </div>
      <div role="progressbar" aria-labelledby="ex-progress-label" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} style={{ height: 6, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99, background: TEAL,
          width: '100%',
          transform: `scaleX(${pct / 100})`,
          transformOrigin: 'left',
          transition: reduceMotion ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  );
}

function ScoreSummary({ results, waitingForFinalSubmission = false }) {
  const total = results.length;
  const correctCount = results.filter(r => r?.correct === true).length;
  const incorrectCount = results.filter(r => r?.correct === false).length;
  const skippedCount = results.filter(r => r?.correct == null).length;

  const pct = total > 0 ? correctCount / total : 0;
  const tone = pct >= 0.8 ? 'celebratory' : pct >= 0.5 ? 'constructive' : 'supportive';
  const toneStyles = {
    celebratory: { border: 'var(--success)', headingColor: 'var(--success)', msg: 'Great work — keep this momentum going.' },
    constructive: { border: 'var(--primary)', headingColor: 'var(--primary)', msg: 'Solid effort — review the missed ones to tighten up.' },
    supportive: { border: 'var(--warning)', headingColor: 'var(--warning-text)', msg: 'Every practice round builds skill — review and try again.' },
  };
  const { border, headingColor, msg } = toneStyles[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: '24px', borderRadius: 'var(--radius-md, 8px)', background: 'var(--surface)',
        border: `2px solid ${border}`, textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: headingColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            {waitingForFinalSubmission ? 'Ready to submit' : 'Session Complete'}
          </div>

          {/* Per-exercise completion indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {results.map((r, i) => {
              const isCorrect = r?.correct === true;
              const isIncorrect = r?.correct === false;
              return (
                <span
                  key={i}
                  aria-label={isCorrect ? `Exercise ${i + 1}: correct` : isIncorrect ? `Exercise ${i + 1}: incorrect` : `Exercise ${i + 1}: skipped`}
                  style={{
                    width: 30, height: 30, borderRadius: 'var(--radius-sm, 6px)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, lineHeight: 1,
                    background: isCorrect ? 'var(--success-bg)' : isIncorrect ? 'var(--ex-wrong-bg)' : 'var(--ink-light)',
                    color: isCorrect ? 'var(--success)' : isIncorrect ? 'var(--error)' : 'var(--muted)',
                    border: `1px solid ${isCorrect ? 'var(--success-soft)' : isIncorrect ? 'var(--ex-wrong-border)' : 'var(--border)'}`,
                  }}
                >
                  {isCorrect ? '✓' : isIncorrect ? '✗' : '—'}
                </span>
              );
            })}
          </div>

          <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.6 }}>
            {correctCount} correct{incorrectCount > 0 ? ` · ${incorrectCount} incorrect` : ''}{skippedCount > 0 ? ` · ${skippedCount} skipped` : ''}.{' '}
            {waitingForFinalSubmission ? 'You can review your work or submit this final attempt once.' : msg}
          </div>
        </div>
      );
    }

/**
 * ExercisePlayer
 *
 * Props:
 *   exercises — raw JSON value (array or { exercises: [...] }) OR already-parsed array
 *   title — optional session title
 *   onSessionComplete — called with { results, score } when all done
 */
export default function ExercisePlayer({ exercises: raw, title, onSessionComplete, onExerciseComplete, scaffoldLevel = 4, requireFinalSubmission = false, finalSubmissionLabel = 'Submit this practice once', practiceStudio = false, initialResults = [] }) {
  const { exercises, errors } = useMemo(() => loadExercises(Array.isArray(raw) ? raw : (raw || [])), [raw]);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState(() => initialResults);
  const [done, setDone] = useState(false);
  const [reviewVersion, setReviewVersion] = useState(0);
  const [pendingSummary, setPendingSummary] = useState(null);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [confidenceBefore] = useState(5);
  const reduceMotionMain = useReducedMotion();
  const currentRef = useRef(current);
  const totalRef = useRef(exercises.length);
  const onDoneRef = useRef(onSessionComplete);
  const resultsRef = useRef(results);
  const maxHintLevelRef = useRef(0);
  const savingExerciseRef = useRef(false);
  const [savingExercise, setSavingExercise] = useState(false);
  useEffect(() => { currentRef.current = current; });
  useEffect(() => { totalRef.current = exercises.length; });
  useEffect(() => { onDoneRef.current = onSessionComplete; });
  useEffect(() => { resultsRef.current = results; });
  useEffect(() => {
    setResults(initialResults);
    setCurrent(0);
    setDone(false);
    setPendingSummary(null);
    setSubmissionError('');
  }, [initialResults]);

  const handleHintLevelChange = useCallback((level) => {
    if (level > maxHintLevelRef.current) maxHintLevelRef.current = level;
  }, []);

  const saveExerciseResult = useCallback(async (result) => {
    const idx = currentRef.current;
    if (savingExerciseRef.current || resultsRef.current[idx]) return false;
    const savedResult = { ...result, index: idx };
    savingExerciseRef.current = true;
    setSavingExercise(true);
    try {
      await onExerciseComplete?.({ exercise: exercises[idx], index: idx, result: savedResult });
      setResults(prev => {
        const next = [...prev];
        next[idx] = savedResult;
        return next;
      });
      return true;
    } catch (error) {
      setSubmissionError(error?.message || 'We could not save this question. Please try again.');
      setReviewVersion(version => version + 1);
      return false;
    } finally {
      savingExerciseRef.current = false;
      setSavingExercise(false);
    }
  }, [exercises, onExerciseComplete]);

  const handleComplete = useCallback((result) => {
    void saveExerciseResult(result);
  }, [saveExerciseResult]);

  const buildSummary = useCallback((completedResults = resultsRef.current) => {
    const live = completedResults.filter(r => r && r.correct !== null && r.correct !== undefined);
    const score = live.length > 0 ? Math.round((live.filter(r => r.correct).length / live.length) * 100) : null;
    return {
      results: completedResults,
      score,
      maxHintLevel: maxHintLevelRef.current,
      hintUsed: maxHintLevelRef.current > 0,
      confidenceBefore,
    };
  }, [confidenceBefore]);

  const finishSession = useCallback((completedResults = resultsRef.current) => {
    setDone(true);
    const summary = buildSummary(completedResults);
    if (requireFinalSubmission) {
      setPendingSummary(summary);
      setSubmissionError('');
      return;
    }
    onDoneRef.current?.(summary);
  }, [buildSummary, requireFinalSubmission]);

  const submitFinalAttempt = useCallback(async () => {
    const cb = onDoneRef.current;
    if (!cb || !pendingSummary || submittingFinal) return;
    setSubmissionError('');
    setSubmittingFinal(true);
    try {
      await cb(pendingSummary);
    } catch (error) {
      setSubmissionError(error?.message || 'We could not save your final attempt. Please try again.');
    } finally {
      setSubmittingFinal(false);
    }
  }, [pendingSummary, submittingFinal]);

  const reviewResponses = useCallback(() => {
    setDone(false);
    setPendingSummary(null);
    setSubmissionError('');
    setCurrent(0);
    setReviewVersion(version => version + 1);
  }, []);

  const handleNext = useCallback(() => {
    const idx = currentRef.current;
    const nextIdx = idx + 1;
    if (nextIdx >= totalRef.current) {
      finishSession();
    } else {
      maxHintLevelRef.current = 0;
      setCurrent(nextIdx);
    }
  }, [finishSession]);

  const handleBack = useCallback(() => {
    if (currentRef.current > 0) setCurrent(c => c - 1);
  }, [setCurrent]);

  const handleSkip = useCallback(async () => {
    if (!onExerciseComplete) {
      const nextIdx = currentRef.current + 1;
      if (nextIdx >= totalRef.current) finishSession();
      else setCurrent(nextIdx);
      return;
    }
    const saved = await saveExerciseResult({ correct: null, skipped: true });
    if (!saved) return;
    const nextIdx = currentRef.current + 1;
    if (nextIdx >= totalRef.current) finishSession();
    else setCurrent(nextIdx);
  }, [onExerciseComplete, saveExerciseResult, setCurrent, finishSession]);

  // Errors only (nothing valid loaded)
  if (errors.length > 0 && exercises.length === 0) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px' }}>
        {title && <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', fontWeight: 700, color: NAVY, marginBottom: 16 }}>{title}</h2>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {errors.map((e, i) => <InvalidExercise key={i} reason={e} />)}
        </div>
      </div>
    );
  }

  const completedCount = results.filter(Boolean).length;
  const reduceMotion = reduceMotionMain;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px' }}>
      {title && (
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', fontWeight: 700, color: NAVY, marginBottom: 6 }}>{title}</h2>
      )}

      {/* Load errors (partial — some valid exercises exist) */}
      {errors.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {errors.map((e, i) => (
            <div key={i} style={{ padding: '8px 12px', background: 'var(--ex-hint-bg)', border: '1px solid var(--ex-hint-border)', borderRadius: 'var(--radius-sm, 6px)', fontSize: 13, color: 'var(--ex-hint-text)' }}>
              <Icon.warning size={12} /> {e}
            </div>
          ))}
        </div>
      )}

      <ProgressBar current={completedCount} total={exercises.length} />

      {!done ? (
        <motion.div
          key={`${current}-${reviewVersion}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <ExerciseCard
            exercise={exercises[current]}
            index={current}
            total={exercises.length}
            result={results[current]}
            onComplete={handleComplete}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            saving={savingExercise}
            scaffoldLevel={scaffoldLevel}
            onHintLevelChange={handleHintLevelChange}
            practiceStudio={practiceStudio}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <ScoreSummary results={results.filter(Boolean)} total={exercises.length} waitingForFinalSubmission={requireFinalSubmission} />
          {requireFinalSubmission ? (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={reviewResponses}
                disabled={submittingFinal}
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm, 6px)', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: submittingFinal ? 'wait' : 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                Review my responses
              </button>
              <button
                type="button"
                onClick={submitFinalAttempt}
                disabled={submittingFinal}
                data-testid="practice-studio-final-submit"
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm, 6px)', border: 'none', background: `linear-gradient(120deg, ${TEAL} 0%, ${NAVY} 100%)`, color: 'var(--on-dark)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: submittingFinal ? 'wait' : 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                {submittingFinal ? 'Saving to your teacher record…' : finalSubmissionLabel}
              </button>
              {submissionError && <p role="alert" style={{ width: '100%', margin: 0, color: 'var(--ex-wrong-text)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>{submissionError}</p>}
            </div>
          ) : (
            <button
              onClick={() => {
                setCurrent(0);
                setResults([]);
                setDone(false);
                maxHintLevelRef.current = 0;
              }}
              style={{
                marginTop: 16, padding: '10px 24px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1.5px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-2)', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Restart exercises
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
