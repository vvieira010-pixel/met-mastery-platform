import { useState, useEffect, useMemo } from 'react';
import { getMockTestResults, saveMockTestResult } from '../lib/workflow.js';
import { getMockTestAudioUrl } from '../lib/supabase-db.js';
import { getCefrColor } from '../data/mock-test-1/index.js';
import { readStoredSupabaseSession } from '../lib/supabase-storage.js';
import { getAllReadingQuestions, getAllListeningQuestions } from '../lib/mock-test-scoring.js';
import { SPEAKING_TASKS } from '../data/mock-test-2/speaking.js';
import { Icon, SectionHeader } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';

const READING_QS = getAllReadingQuestions();
const LISTENING_QS = getAllListeningQuestions();

const Q_LOOKUP = {};
READING_QS.forEach(q => { Q_LOOKUP[q.id] = { ...q, section: 'reading' }; });
LISTENING_QS.forEach(q => { Q_LOOKUP[q.id] = { ...q, section: 'listening' }; });

const LABELS = ['A', 'B', 'C', 'D'];

const SPEAKING_TASK_MAP = {};
(SPEAKING_TASKS.tasks || SPEAKING_TASKS || []).forEach(t => { SPEAKING_TASK_MAP[t.id] = t; });

export default function MockTestResults({ onNavigate, "data-testid": testId }) {
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [audioUrls, setAudioUrls] = useState({});
  const [filter, setFilter] = useState('all');
  const [evals, setEvals] = useState({});
  const [evalLoading, setEvalLoading] = useState({});
  const [evalError, setEvalError] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getMockTestResults();
        setResults(data || []);
        const loaded = {};
        (data || []).forEach(r => {
          if (r.content?.speakingEvaluation) {
            Object.entries(r.content.speakingEvaluation).forEach(([taskId, e]) => {
              loaded[`${r.id}-${taskId}`] = e;
            });
          }
        });
        setEvals(loaded);
      } catch {}
    })();
  }, []);

  const toggleExpand = async (r) => {
    if (expanded === r.id) { setExpanded(null); return; }
    setExpanded(r.id);
    const urls = {};
    const recordings = r.speakingRecordings || r.content?.speakingRecordings || r.answers?.speakingRecordings || {};
    for (const [idx, path] of Object.entries(recordings)) {
      if (path && typeof path === 'string' && !path.startsWith('blob:')) {
        try { urls[idx] = await getMockTestAudioUrl(path); } catch { urls[idx] = null; }
      }
    }
    setAudioUrls(urls);
  };

  const allQuestions = useMemo(() => {
    const qs = [];
    results.forEach(r => {
      if (r.scores?.reading?.details) {
        r.scores.reading.details.forEach(d => qs.push({ ...d, studentId: r.id, studentName: r.studentName, testType: r.testType, section: 'reading' }));
      }
      if (r.scores?.listening?.details) {
        r.scores.listening.details.forEach(d => qs.push({ ...d, studentId: r.id, studentName: r.studentName, testType: r.testType, section: 'listening' }));
      }
    });
    return qs;
  }, [results]);

  const filteredQuestions = useMemo(() => {
    if (filter === 'correct') return allQuestions.filter(q => q.correct);
    if (filter === 'incorrect') return allQuestions.filter(q => !q.correct);
    return allQuestions;
  }, [allQuestions, filter]);

  const correctCount = allQuestions.filter(q => q.correct).length;
  const totalCount = allQuestions.length;

  const evaluateSpeaking = async (result, taskIdx, storagePath) => {
    const taskNum = Number(taskIdx);
    const taskKey = `spk${taskNum + 1}`;
    const task = SPEAKING_TASK_MAP[taskKey];
    const evalKey = `${result.id}-spk${taskNum + 1}`;
    if (!task) return;

    setEvalLoading(prev => ({ ...prev, [evalKey]: true }));
    setEvalError(prev => ({ ...prev, [evalKey]: null }));

    try {
      const token = readStoredSupabaseSession()?.access_token || '';
      const res = await fetch('/api/evaluate-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          storagePath,
          taskPrompt: task.prompt,
          taskId: taskKey,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      const evaluation = {
        transcription: data.transcription,
        scores: data.evaluation?.scores || {},
        overallScore: data.evaluation?.overallScore,
        cefrEstimate: data.evaluation?.cefrEstimate,
        corrections: data.evaluation?.corrections || [],
        feedback: data.evaluation?.feedback || '',
        error: data.evaluation?.error,
        evaluatedAt: new Date().toISOString(),
      };

      setEvals(prev => ({ ...prev, [evalKey]: evaluation }));

      const updatedContent = {
        ...(result.content || {}),
        speakingEvaluation: {
          ...((result.content?.speakingEvaluation) || {}),
          [taskKey]: evaluation,
        },
      };

      try {
        await saveMockTestResult({
          id: result.id,
          content: updatedContent,
          studentId: result.studentId,
          testId: result.testId || 'mock-test-2',
        });
      } catch {}
    } catch (err) {
      setEvalError(prev => ({ ...prev, [evalKey]: err.message }));
    } finally {
      setEvalLoading(prev => ({ ...prev, [evalKey]: false }));
    }
  };

  return (
    <div className="page-shell" data-testid={testId}>
      <div className="hero-section hero-section--inbox" style={{ marginBottom: 'var(--space-5)' }}>
        <SectionHeader title="Mock Test Results" subtitle="All student submissions" />
        <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
          {onNavigate && <Button variant="primary" size="sm" onClick={() => onNavigate('mock-test')}>
            <Icon.practice size={13} /> Take a Mock Test
          </Button>}
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.('mock-test-eval')}>
            <Icon.diagnose size={13} /> AI Evaluation
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-muted" style={{ padding: '32px 20px' }}>No submissions yet.</p>
      ) : (
        <>
          <div className="mtr-summary">
            <div className="mtr-stats">
              <div className="mtr-stat">
                <span className="mtr-stat__value">{results.length}</span>
                <span className="mtr-stat__label">Submissions</span>
              </div>
              <div className="mtr-stat">
                <span className="mtr-stat__value">{totalCount}</span>
                <span className="mtr-stat__label">Total Questions</span>
              </div>
              <div className="mtr-stat success">
                <span className="mtr-stat__value">{correctCount}</span>
                <span className="mtr-stat__label">Correct Answers</span>
              </div>
              <div className="mtr-stat error">
                <span className="mtr-stat__value">{totalCount - correctCount}</span>
                <span className="mtr-stat__label">Incorrect</span>
              </div>
            </div>

            <div className="mtr-filters">
              <span className="mtr-filter-label">Filter Questions:</span>
              <div className="mtr-filter-buttons">
                <button className={`mtr-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                  All ({totalCount})
                </button>
                <button className={`mtr-filter-btn ${filter === 'correct' ? 'active' : ''}`} onClick={() => setFilter('correct')}>
                  Correct ({correctCount})
                </button>
                <button className={`mtr-filter-btn ${filter === 'incorrect' ? 'active' : ''}`} onClick={() => setFilter('incorrect')}>
                  Incorrect ({totalCount - correctCount})
                </button>
              </div>
            </div>
          </div>

          <div className="mtr-list">
            {results.map(r => {
              const recordings = r.speakingRecordings || r.content?.speakingRecordings || r.answers?.speakingRecordings || {};
              return (
                <div key={r.id} className="mtr-row">
                  <button
                    type="button"
                    className="mtr-row__header"
                    onClick={() => toggleExpand(r)}
                    aria-expanded={expanded === r.id}
                    aria-controls={`mtr-detail-${r.id}`}
                  >
                    <div className="mtr-row__student">{r.studentName || r.studentEmail || 'Unknown'}</div>
                    <div className="mtr-row__meta">
                      <span>{new Date(r.submittedAt).toLocaleDateString()}</span>
                      {r.testType && <span className="pill pill--accent" style={{ fontSize: 10 }}>{r.testType}</span>}
                      {r.cefr && <span className="mtr-cefr-badge" style={{ background: getCefrColor(r.cefr) }}>{r.cefr}</span>}
                    </div>
                  </button>
                  {expanded === r.id && (
                    <div className="mtr-detail" id={`mtr-detail-${r.id}`}>
                      {r.scores?.reading && <ScoreSection label="Reading & Grammar" score={r.scores.reading} />}
                      {r.scores?.listening && <ScoreSection label="Listening" score={r.scores.listening} />}

                      {Object.keys(recordings).length > 0 && (
                        <div className="mtr-block">
                          <h4 className="mtr-block__title">Speaking ({Object.keys(recordings).length} tasks)</h4>
                          {Object.entries(recordings).map(([taskIdx, storagePath]) => {
                            const taskNum = Number(taskIdx);
                            const taskKey = `spk${taskNum + 1}`;
                            const task = SPEAKING_TASK_MAP[taskKey];
                            const evalKey = `${r.id}-${taskKey}`;
                            const evaluation = evals[evalKey];
                            const loading = evalLoading[evalKey];
                            const error = evalError[evalKey];

                            return (
                              <div key={taskIdx} className="mtr-speaking-task">
                                <div className="mtr-speaking-task__header">
                                  <span className="mtr-speaking-task__label">{task?.label || `Task ${taskNum + 1}`}</span>
                                  <div className="mtr-speaking-task__actions">
                                    {audioUrls[taskIdx] ? (
                                      <audio controls src={audioUrls[taskIdx]} style={{ height: 28, width: 180 }} />
                                    ) : storagePath && !storagePath.startsWith('blob:') ? (
                                      <span className="text-muted" style={{ fontSize: 12 }}>Loading audio...</span>
                                    ) : (
                                      <span className="text-muted" style={{ fontSize: 12 }}>No recording</span>
                                    )}
                                    {storagePath && !storagePath.startsWith('blob:') && (
                                      <button
                                        className="mtr-eval-btn"
                                        disabled={loading}
                                        onClick={(e) => { e.stopPropagation(); evaluateSpeaking(r, taskIdx, storagePath); }}
                                      >
                                        {loading ? 'Evaluating...' : (evaluation ? 'Re-evaluate' : 'Evaluate with AI')}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {loading && (
                                  <div className="mtr-speaking-eval">
                                    <div className="mtr-eval-loading">
                                      <span className="mtr-spinner" />
                                      Transcribing and evaluating...
                                    </div>
                                  </div>
                                )}

                                {error && (
                                  <div className="mtr-speaking-eval">
                                    <div className="mtr-eval-error">Evaluation failed: {error}</div>
                                  </div>
                                )}

                                {evaluation && !loading && (
                                  <div className="mtr-speaking-eval">
                                    {evaluation.error && (
                                      <div className="mtr-eval-error">{evaluation.error}</div>
                                    )}

                                    <div className="mtr-eval-transcript">
                                      <strong>Transcription:</strong>
                                      <p>{evaluation.transcription || '(empty)'}</p>
                                    </div>

                                    {evaluation.overallScore && (
                                      <div className="mtr-eval-scores">
                                        <div className="mtr-eval-score">
                                          <span className="mtr-eval-score__value">{evaluation.overallScore}/9</span>
                                          <span className="mtr-eval-score__label">Overall</span>
                                        </div>
                                        {evaluation.cefrEstimate && (
                                          <div className="mtr-eval-cefr">{evaluation.cefrEstimate}</div>
                                        )}
                                        {evaluation.scores?.fluency && (
                                          <span className="mtr-eval-criterion">Fluency: {evaluation.scores.fluency}/9</span>
                                        )}
                                        {evaluation.scores?.lexical && (
                                          <span className="mtr-eval-criterion">Vocabulary: {evaluation.scores.lexical}/9</span>
                                        )}
                                        {evaluation.scores?.grammar && (
                                          <span className="mtr-eval-criterion">Grammar: {evaluation.scores.grammar}/9</span>
                                        )}
                                        {evaluation.scores?.task && (
                                          <span className="mtr-eval-criterion">Task: {evaluation.scores.task}/9</span>
                                        )}
                                      </div>
                                    )}

                                    {evaluation.corrections?.length > 0 && (
                                      <div className="mtr-eval-corrections">
                                        <strong>Corrections:</strong>
                                        {evaluation.corrections.map((c, i) => (
                                          <div key={i} className="mtr-eval-correction">
                                            <span className="mtr-eval-original">{c.original}</span>
                                            <span className="mtr-eval-arrow">&rarr;</span>
                                            <span className="mtr-eval-corrected">{c.corrected}</span>
                                            <span className="mtr-eval-explanation">{c.explanation}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {evaluation.feedback && (
                                      <div className="mtr-eval-feedback">
                                        <strong>Feedback:</strong>
                                        <p>{evaluation.feedback}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {r.answers && (
                        <>
                          {Object.entries(r.answers).filter(([k]) => k.startsWith('w')).length > 0 && (
                            <div className="mtr-block">
                              <h4 className="mtr-block__title">Writing Responses</h4>
                              {Object.entries(r.answers).filter(([k]) => k.startsWith('w')).map(([k, v]) => (
                                <div key={k} className="mtr-writing-row">
                                  <span className="mtr-writing-id">{k.replace('w', 'Task ')}</span>
                                  <p className="mtr-writing-text">{v || '(blank)'}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {Object.entries(r.answers).filter(([k]) => !k.startsWith('w') && !k.startsWith('spk') && !k.startsWith('speak')).length > 0 && (
                            <div className="mtr-block">
                              <h4 className="mtr-block__title">Other Answers</h4>
                              {Object.entries(r.answers).filter(([k]) => !k.startsWith('w') && !k.startsWith('spk') && !k.startsWith('speak')).map(([k, v]) => (
                                <div key={k} className="mtr-writing-row">
                                  <span className="mtr-writing-id">{k}</span>
                                  <p className="mtr-writing-text">{v || '(blank)'}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      <div className="mtr-block">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <h4 className="mtr-block__title" style={{ margin: 0 }}>
                            All Questions ({filteredQuestions.filter(q => q.studentId === r.id).length} of {allQuestions.filter(q => q.studentId === r.id).length})
                          </h4>
                        </div>
                        <div className="mtr-qs">
                          {filteredQuestions.filter(q => q.studentId === r.id).map(d => {
                            const q = Q_LOOKUP[d.qId];
                            return (
                              <div key={`${r.id}-${d.qId}`} className={`mtr-q ${d.correct ? 'mtr-q--ok' : 'mtr-q--miss'}`}>
                                <div className="mtr-q__id">{d.qId}</div>
                                <div className="mtr-q__detail">
                                  {q && <div className="mtr-q__text">{q.text}</div>}
                                  <div className="mtr-q__meta">
                                    <span>{d.correct ? '\u2713' : '\u2717'} {d.pts}/{d.max}pts</span>
                                    {d.selected !== undefined && q && (
                                      <span className="mtr-q__ans">
                                        Your answer: {LABELS[d.selected] || d.selected}
                                        {!d.correct && <span className="mtr-q__correct"> (correct: {LABELS[q.answer]})</span>}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filter === 'correct' && correctCount > 0 && (
            <div className="mtr-global-view">
              <h3 style={{ margin: '24px 0 12px', fontSize: 16, fontWeight: 700 }}>All Correct Questions ({correctCount})</h3>
              <div className="mtr-qs" style={{ maxHeight: 'none' }}>
                {filteredQuestions.map(d => {
                  const q = Q_LOOKUP[d.qId];
                  const studentResult = results.find(r => r.id === d.studentId);
                  return (
                    <div key={`${d.studentId}-${d.qId}`} className="mtr-q mtr-q--ok">
                      <div className="mtr-q__id">{d.qId}</div>
                      <div className="mtr-q__detail">
                        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginBottom: 4 }}>
                          {d.studentName || studentResult?.studentName || 'Unknown'} · {d.section === 'reading' ? 'Reading' : 'Listening'}
                        </div>
                        {q && <div className="mtr-q__text">{q.text}</div>}
                        <div className="mtr-q__meta">
                          <span>\u2713 {d.pts}/{d.max}pts</span>
                          <span>Answer: {LABELS[d.selected] || d.selected}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .mtr-summary { max-width: 1200px; margin: 0 auto 24px; padding: 0 20px; }
        .mtr-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
        .mtr-stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; text-align: center; }
        .mtr-stat__value { display: block; font-size: 24px; font-weight: 800; color: var(--text); line-height: 1; }
        .mtr-stat__label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.04em; }
        .mtr-stat.success .mtr-stat__value { color: var(--success); }
        .mtr-stat.error .mtr-stat__value { color: var(--error); }
        .mtr-filters { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .mtr-filter-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .mtr-filter-buttons { display: flex; gap: 8px; }
        .mtr-filter-btn { padding: 6px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); font-size: 12px; font-weight: 600; cursor: pointer; transition: background-color 0.15s, border-color 0.15s, color 0.15s; color: var(--text); }
        .mtr-filter-btn:hover { border-color: var(--accent); background: var(--accent-subtle); }
        .mtr-filter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
        .mtr-list { max-width: 1200px; margin: 0 auto; padding: 0 20px 40px; display: flex; flex-direction: column; gap: 8px; }
        .mtr-row { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
        .mtr-row__header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; width: 100%; text-align: left; background: none; border: none; font: inherit; color: inherit; cursor: pointer; }
        .mtr-row__header:hover { background: var(--bg-subtle, #f8f9fa); }
        .mtr-row__header:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
        .mtr-row__student { font-weight: 700; font-size: 15px; color: var(--text); }
        .mtr-row__meta { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--text-muted); }
        .mtr-cefr-badge { padding: 2px 10px; border-radius: 999px; color: #fff; font-weight: 700; font-size: 11px; }
        .mtr-detail { border-top: 1px solid var(--border); padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
        .mtr-block { }
        .mtr-block__title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin: 0 0 8px; }
        .mtr-score-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
        .mtr-score-label { color: var(--text); }
        .mtr-score-value { font-weight: 600; }
        .mtr-writing-row { padding: 6px 0; border-bottom: 1px solid var(--border); }
        .mtr-writing-id { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .mtr-writing-text { font-size: 13px; color: var(--text); margin: 2px 0 0; white-space: pre-wrap; }
        .mtr-qs { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
        .mtr-q { display: flex; gap: 10px; padding: 8px 10px; border-radius: var(--radius-sm); font-size: 13px; }
        .mtr-q--ok { background: var(--success-bg, #ecfdf5); }
        .mtr-q--miss { background: var(--error-bg, #fef2f2); }
        .mtr-q__id { font-weight: 700; color: var(--text-muted); font-size: 11px; min-width: 32px; }
        .mtr-q__detail { flex: 1; }
        .mtr-q__text { color: var(--text); margin-bottom: 4px; }
        .mtr-q__meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); }
        .mtr-q__ans { }
        .mtr-q__correct { color: var(--success); font-weight: 600; }
        .mtr-global-view { max-width: 1200px; margin: 0 auto; padding: 0 20px 40px; }
        .pill { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .pill--accent { background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--accent); }

        .mtr-speaking-task { background: var(--bg-subtle, #f8f9fa); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 8px; }
        .mtr-speaking-task__header { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
        .mtr-speaking-task__label { font-size: 12px; font-weight: 700; color: var(--text); }
        .mtr-speaking-task__actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .mtr-eval-btn { padding: 4px 10px; border-radius: var(--radius-sm); border: 1px solid var(--accent); background: var(--accent-subtle); color: var(--accent); font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .mtr-eval-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .mtr-eval-btn:hover:not(:disabled) { background: var(--accent); color: #fff; }
        .mtr-speaking-eval { margin-top: 8px; }
        .mtr-eval-loading { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); padding: 8px; }
        .mtr-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: mtr-spin 0.6s linear infinite; }
        @keyframes mtr-spin { to { transform: rotate(360deg); } }
        .mtr-eval-error { color: var(--error); font-size: 12px; padding: 8px; background: var(--error-bg, #fef2f2); border-radius: var(--radius-sm); }
        .mtr-eval-transcript { font-size: 13px; color: var(--text); padding: 8px; margin-bottom: 8px; }
        .mtr-eval-transcript p { margin: 4px 0 0; white-space: pre-wrap; line-height: 1.5; }
        .mtr-eval-scores { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 8px; margin-bottom: 8px; }
        .mtr-eval-score { text-align: center; }
        .mtr-eval-score__value { display: block; font-size: 18px; font-weight: 800; color: var(--accent); }
        .mtr-eval-score__label { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.04em; }
        .mtr-eval-cefr { padding: 2px 10px; border-radius: 999px; background: var(--accent); color: #fff; font-weight: 700; font-size: 12px; }
        .mtr-eval-criterion { font-size: 11px; font-weight: 600; color: var(--text); padding: 2px 8px; background: var(--surface); border-radius: var(--radius-sm); }
        .mtr-eval-corrections { padding: 8px; margin-bottom: 8px; }
        .mtr-eval-corrections strong { font-size: 12px; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 6px; }
        .mtr-eval-correction { display: flex; flex-wrap: wrap; gap: 4px 8px; padding: 4px 0; font-size: 12px; border-bottom: 1px solid var(--border); }
        .mtr-eval-original { color: var(--error); text-decoration: line-through; }
        .mtr-eval-arrow { color: var(--text-muted); }
        .mtr-eval-corrected { color: var(--success); font-weight: 600; }
        .mtr-eval-explanation { width: 100%; color: var(--text-muted); font-size: 11px; }
        .mtr-eval-feedback { padding: 8px; background: var(--accent-subtle); border-radius: var(--radius-sm); }
        .mtr-eval-feedback strong { font-size: 12px; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
        .mtr-eval-feedback p { font-size: 13px; color: var(--text); margin: 0; line-height: 1.5; white-space: pre-wrap; }
      `}</style>
    </div>
  );
}

function ScoreSection({ label, score }) {
  if (!score) return null;
  const pct = score.max > 0 ? Math.round((score.total / score.max) * 100) : 0;
  return (
    <div className="mtr-score-row">
      <span className="mtr-score-label">{label}</span>
      <span className="mtr-score-value">{score.total} / {score.max} ({pct}%)</span>
    </div>
  );
}
