import { useState } from 'react';
import { Icon } from './shared.jsx';
import { saveDiagnosis } from '../lib/workflow.js';
import { useBodyScrollLock } from '../lib/use-body-scroll-lock.js';

const BASELINE_QUESTIONS = [
  {
    id: 'q-listening',
    section: 'Listening',
    title: 'Section 1: Academic Listening Comprehension',
    prompt: 'Listen to this scenario: In a university tutorial, Professor Hayes advises a student regarding their final project: "You have strong secondary research, but your primary methodology lacks clear sampling controls. I strongly advise revising your survey sample before advancing to data synthesis."',
    question: 'What is the professor primarily urging the student to do?',
    options: [
      { text: 'Conclude the research report immediately based on secondary data', score: 32 },
      { text: 'Readjust their participant sampling methodology before analyzing results', score: 58 },
      { text: 'Change their research thesis topic completely', score: 28 },
      { text: 'Publish the survey results without further review', score: 24 },
    ],
    correctIdx: 1,
    benchmarkNote: 'Targets MET Part 2 / Section I academic inference.',
  },
  {
    id: 'q-reading',
    section: 'Reading',
    title: 'Section 2: Reading & Contextual Vocabulary',
    prompt: 'Read this brief excerpt: "Urban planners historically considered wetlands purely as obstacles to expansion; however, contemporary ecological models recognize their [____] function in mitigating flash floods and filtering industrial runoff."',
    question: 'Choose the word that most appropriately elevates the register and fits the context:',
    options: [
      { text: 'ordinary (A2)', score: 30 },
      { text: 'paramount (B2+)', score: 68 },
      { text: 'helpful (B1)', score: 45 },
      { text: 'negligible (B2, incorrect meaning)', score: 35 },
    ],
    correctIdx: 1,
    benchmarkNote: 'Targets MET Section II academic collocations and B2 vocabulary precision.',
  },
  {
    id: 'q-writing',
    section: 'Writing',
    title: 'Section 3: Structured Writing Evaluation',
    prompt: 'Prompt: Some argue remote work enhances productivity, while others maintain that in-person collaboration is irreplaceable. In 3–4 sentences, state your stance with one clear supporting reason and a concession.',
    isTextInput: true,
    placeholder: 'Write your 3-4 sentence response here. Focus on clear transitions (e.g., "While...", "Consequently...", "Nevertheless...").',
    benchmarkNote: 'Evaluates grammatical range, discourse coherence, and academic stance markers.',
  },
  {
    id: 'q-speaking',
    section: 'Speaking',
    title: 'Section 4: 45-Second Spoken Response Self-Assessment',
    prompt: 'Speaking Task: Describe a situation where you resolved an unexpected challenge. Speak for 45 seconds with one specific example, focusing on chronological transitions and clear pronunciation.',
    isSpeakingSelfCheck: true,
    rubricCriteria: [
      { id: 'fluency', label: 'Spoke with minimal hesitation and sustained discourse for 40+ seconds', b2Score: 16 },
      { id: 'vocabulary', label: 'Used varied lexical choices rather than repetitive basic words (good, bad, happy)', b2Score: 16 },
      { id: 'grammar', label: 'Used complex sentences (e.g., conditional, passive, or relative clauses) with few errors', b2Score: 16 },
      { id: 'cohesion', label: 'Connected thoughts with clear discourse markers (furthermore, as a result, initially)', b2Score: 16 },
    ],
    benchmarkNote: 'Maps to Michigan English Test (MET) Speaking 4-trait scoring rubric.',
  },
];

export default function BaselineDiagnosticModal({
  student,
  isOpen,
  onClose,
  onCompleted,
  'data-testid': testId = 'baseline-diagnostic-modal',
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    listeningOption: null,
    readingOption: null,
    writingText: '',
    speakingChecklist: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);

  // Prevent background page scroll while this modal is open.
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const currentQ = BASELINE_QUESTIONS[currentStep];

  const handleSelectOption = (idx) => {
    if (currentStep === 0) setAnswers(prev => ({ ...prev, listeningOption: idx }));
    if (currentStep === 1) setAnswers(prev => ({ ...prev, readingOption: idx }));
  };

  const handleToggleChecklist = (critId) => {
    setAnswers(prev => {
      const exists = prev.speakingChecklist.includes(critId);
      return {
        ...prev,
        speakingChecklist: exists
          ? prev.speakingChecklist.filter(c => c !== critId)
          : [...prev.speakingChecklist, critId],
      };
    });
  };

  const calculateScores = () => {
    // 1. Listening (0-80)
    const lOption = answers.listeningOption !== null ? BASELINE_QUESTIONS[0].options[answers.listeningOption] : null;
    const listeningScore = lOption ? lOption.score : 42;

    // 2. Reading (0-80)
    const rOption = answers.readingOption !== null ? BASELINE_QUESTIONS[1].options[answers.readingOption] : null;
    const readingScore = rOption ? rOption.score : 44;

    // 3. Writing (0-80 based on length and discourse markers)
    const wText = (answers.writingText || '').trim();
    const wordCount = wText.split(/\s+/).filter(Boolean).length;
    let writingScore = 38;
    if (wordCount > 15) writingScore += 8;
    if (wordCount > 35) writingScore += 10;
    if (/while|although|consequently|nevertheless|furthermore|in addition|therefore/i.test(wText)) {
      writingScore += 8;
    }
    writingScore = Math.min(68, Math.max(30, writingScore));

    // 4. Speaking (0-80 based on rubric traits checked)
    const traitsCount = answers.speakingChecklist.length;
    const speakingScore = 32 + traitsCount * 9; // 32 to 68

    const overall = Math.round((listeningScore + readingScore + writingScore + speakingScore) / 4);

    return {
      listening: listeningScore,
      reading: readingScore,
      writing: writingScore,
      speaking: speakingScore,
      overall,
    };
  };

  const handleSubmitDiagnostic = async () => {
    setSubmitting(true);
    try {
      const scores = calculateScores();

      const newDx = {
        studentId: student.id,
        isBaseline: true,
        cycleStage: 'baseline',
        status: 'approved',
        teacherNotes: 'Initial Baseline Diagnostic Assessment completed. Scores successfully mapped to MET 0–80 scaled score.',
        createdAt: new Date().toISOString(),
        content: {
          overall_score: scores.overall,
          section_snapshot: [
            {
              section: 'listening',
              score_0_80: scores.listening,
              evaluated: true,
              confidence: 2,
              next_step: scores.listening >= 53 ? 'Maintain B2 listening with authentic lectures' : 'Focus on identifying discourse markers and speaker intent in lectures',
            },
            {
              section: 'reading',
              score_0_80: scores.reading,
              evaluated: true,
              confidence: 2,
              next_step: scores.reading >= 53 ? 'Practice timed reading for MET multi-text passages' : 'Target academic vocabulary collocations and syntax decoding',
            },
            {
              section: 'writing',
              score_0_80: scores.writing,
              evaluated: true,
              confidence: 2,
              next_step: scores.writing >= 53 ? 'Refine cohesive transitions and lexical variety' : 'Build complex sentence structures with subordinate clauses',
            },
            {
              section: 'speaking',
              score_0_80: scores.speaking,
              evaluated: true,
              confidence: 2,
              next_step: scores.speaking >= 53 ? 'Enhance spontaneous discourse pacing' : 'Practice timed 45-second responses with clear structured examples',
            },
          ],
        },
        sections: {
          studentFeedback: {
            content: {
              classFocus: 'MET Baseline Diagnostic Assessment',
              whatYouDidWell: [
                {
                  strength: 'Initial Diagnostic Completion',
                  explanation: 'Successfully established your starting MET baseline across all 4 assessed skill areas.',
                },
              ],
              whatToImprove: [
                {
                  area: scores.writing <= scores.reading ? 'Writing Structure' : 'Spoken Fluency',
                  howToImprove: 'Focus on transitioning from basic B1 vocabulary to academic B2 equivalents in upcoming homework.',
                },
              ],
              finalNote: 'Your baseline diagnostic is now calibrated. Continue with your assigned homework and review materials!',
            },
          },
        },
      };

      const saved = await saveDiagnosis(newDx);
      setCompletedResult(scores);
      if (onCompleted) {
        onCompleted(saved || newDx);
      }
    } catch (err) {
      console.error('[BaselineDiagnostic] submission failed:', err);
      window.toast?.('Could not save baseline diagnosis. Please retry.', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="baseline-diag-title"
      data-testid={testId}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 14,
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          padding: 24,
          position: 'relative',
        }}
      >
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close diagnostic modal"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted, #64748b)',
            padding: 6,
            borderRadius: 6,
          }}
        >
          <Icon.close size={20} />
        </button>

        {completedResult ? (
          /* Diagnostic Completed Screen */
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(22, 163, 74, 0.12)',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Icon.check size={32} />
            </div>
            <h2 id="baseline-diag-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 6px' }}>
              Baseline Diagnosis Calibrated!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted, #64748b)', margin: '0 0 20px' }}>
              Your answers have been mapped directly to the Michigan English Test (MET) 0–80 scaled score.
            </p>

            {/* Score Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
                background: 'var(--bg, #f8fafc)',
                padding: 16,
                borderRadius: 10,
                border: '1px solid var(--border, #e2e8f0)',
                marginBottom: 24,
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted, #64748b)', textTransform: 'uppercase' }}>Listening</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: completedResult.listening >= 53 ? '#16a34a' : '#0284c7' }}>
                  {completedResult.listening}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted, #64748b)', textTransform: 'uppercase' }}>Reading</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: completedResult.reading >= 53 ? '#16a34a' : '#0284c7' }}>
                  {completedResult.reading}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted, #64748b)', textTransform: 'uppercase' }}>Writing</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: completedResult.writing >= 53 ? '#16a34a' : '#0284c7' }}>
                  {completedResult.writing}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted, #64748b)', textTransform: 'uppercase' }}>Speaking</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: completedResult.speaking >= 53 ? '#16a34a' : '#0284c7' }}>
                  {completedResult.speaking}
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(2, 132, 199, 0.08)', borderRadius: 8, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '0.9rem', color: '#0284c7' }}>Overall Scaled Score: {completedResult.overall} / 80</strong>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: completedResult.overall >= 53 ? '#16a34a' : '#f59e0b' }}>
                  {completedResult.overall >= 53 ? 'B2 Independent' : 'B1 Developing'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--muted, #64748b)' }}>
                Target benchmark for Michigan English Test certification is 53+ pts across all sections.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'var(--primary, #0284c7)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
              data-testid="finish-baseline-btn"
            >
              View Updated MET Progress Path
            </button>
          </div>
        ) : (
          /* Step-by-Step Question Assessment */
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary, #0284c7)', letterSpacing: '0.05em' }}>
                  Baseline Diagnostic · Step {currentStep + 1} of {BASELINE_QUESTIONS.length}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
                  Section: {currentQ.section}
                </span>
              </div>
              {/* Progress Bar */}
              <div style={{ width: '100%', height: 4, background: 'var(--bg, #f1f5f9)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${((currentStep + 1) / BASELINE_QUESTIONS.length) * 100}%`,
                    height: '100%',
                    background: 'var(--primary, #0284c7)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <h2 id="baseline-diag-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
              {currentQ.title}
            </h2>

            <div
              style={{
                background: 'var(--bg, #f8fafc)',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 16,
                fontSize: '0.84rem',
                lineHeight: 1.5,
                color: 'var(--text, #1e293b)',
              }}
            >
              {currentQ.prompt}
            </div>

            {/* Question Text */}
            {currentQ.question && (
              <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text, #0f172a)', marginBottom: 12 }}>
                {currentQ.question}
              </p>
            )}

            {/* Options for Listening & Reading */}
            {currentQ.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = currentStep === 0 ? answers.listeningOption === idx : answers.readingOption === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: isSelected ? '2px solid var(--primary, #0284c7)' : '1px solid var(--border, #e2e8f0)',
                        background: isSelected ? 'rgba(2, 132, 199, 0.06)' : 'var(--surface, #ffffff)',
                        color: 'var(--text, #0f172a)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: isSelected ? '5px solid var(--primary, #0284c7)' : '2px solid var(--border, #cbd5e1)',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Writing Text Input */}
            {currentQ.isTextInput && (
              <div style={{ marginBottom: 20 }}>
                <textarea
                  rows={5}
                  value={answers.writingText}
                  onChange={(e) => setAnswers(prev => ({ ...prev, writingText: e.target.value }))}
                  placeholder={currentQ.placeholder}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border, #cbd5e1)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                    color: 'var(--text, #0f172a)',
                    resize: 'vertical',
                  }}
                  data-testid="baseline-writing-input"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted, #64748b)', marginTop: 4 }}>
                  <span>Word count: {answers.writingText.trim().split(/\s+/).filter(Boolean).length}</span>
                  <span>Minimum recommendation: 25–40 words</span>
                </div>
              </div>
            )}

            {/* Speaking Rubric Checklist */}
            {currentQ.isSpeakingSelfCheck && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted, #64748b)', margin: '0 0 6px' }}>
                  Evaluate your spoken performance against B2 criteria:
                </p>
                {currentQ.rubricCriteria.map(crit => {
                  const isChecked = answers.speakingChecklist.includes(crit.id);
                  return (
                    <label
                      key={crit.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 12px',
                        background: isChecked ? 'rgba(22, 163, 74, 0.06)' : 'var(--bg, #f8fafc)',
                        border: isChecked ? '1px solid #16a34a' : '1px solid var(--border, #e2e8f0)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleChecklist(crit.id)}
                        style={{ marginTop: 3 }}
                      />
                      <span style={{ color: 'var(--text, #0f172a)' }}>{crit.label}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)', marginBottom: 20, fontStyle: 'italic' }}>
              💡 {currentQ.benchmarkNote}
            </div>

            {/* Navigation & Submit Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border, #e2e8f0)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                style={{
                  padding: '8px 14px',
                  background: 'none',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentStep === 0 ? 0.4 : 1,
                  color: 'var(--text, #0f172a)',
                }}
              >
                Back
              </button>

              {currentStep < BASELINE_QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  style={{
                    padding: '8px 18px',
                    background: 'var(--primary, #0284c7)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  data-testid="next-diagnostic-step-btn"
                >
                  Next Section
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitDiagnostic}
                  disabled={submitting}
                  style={{
                    padding: '8px 18px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: submitting ? 'wait' : 'pointer',
                  }}
                  data-testid="submit-baseline-diagnostic-btn"
                >
                  {submitting ? 'Calibrating 0–80 Scores...' : 'Complete & Map Baseline'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
