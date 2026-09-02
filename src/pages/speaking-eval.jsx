import { useState, useCallback } from 'react';
import { SectionHeader, Icon } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

const MOCK_TESTS = [
  {
    id: 'mock-test-1',
    label: 'Mock Test 1',
    tasks: [
      { id: 'spk1', label: 'Task 1 — Describe the Picture', prompt: 'Describe the photo. Talk about what you see, the people, the setting, and what might be happening. You have 15 seconds to prepare and 60 seconds to speak.', type: 'describe', time: '60s' },
      { id: 'spk2', label: 'Task 2 — Experience', prompt: 'Talk about a time when you had to make a difficult decision. What was the situation? What did you decide? How did it turn out? You have 15 seconds to prepare and 60 seconds to speak.', type: 'narrative', time: '60s' },
      { id: 'spk3', label: 'Task 3 — Opinion', prompt: 'Some people believe that university education should be free for all students. Others think students should pay tuition fees. Which view do you support? Explain why. You have 15 seconds to prepare and 60 seconds to speak.', type: 'opinion', time: '60s' },
      { id: 'spk4', label: 'Task 4 — Advantages and Disadvantages', prompt: 'Our city is planning to ban private cars from the city center to reduce pollution and traffic. What are the advantages and disadvantages of this plan? You have 20 seconds to prepare and 90 seconds to speak.', type: 'discuss', time: '90s' },
      { id: 'spk5', label: 'Task 5 — Persuade', prompt: 'Your school is considering replacing traditional textbooks with tablets and digital materials entirely. I am the school principal. Convince me that this is or is not a good idea for our students. You have 20 seconds to prepare and 90 seconds to speak.', type: 'persuade', time: '90s' },
    ],
  },
  {
    id: 'mock-test-2',
    label: 'Mock Test 2',
    tasks: [
      { id: 'spk1', label: 'Task 1 — Personal Experience', prompt: 'Describe a memorable celebration you attended. What was the occasion? Who was there? What made it special?', type: 'narrative', time: '60s' },
      { id: 'spk2', label: 'Task 2 — Picture Description', prompt: 'Look at the picture. Describe what you see in as much detail as possible. What are the people doing? What is the setting?', type: 'describe', time: '60s' },
      { id: 'spk3', label: 'Task 3 — Opinion', prompt: 'Some people think that schools should teach practical life skills like cooking and budgeting. Others believe schools should focus only on academic subjects. What is your opinion? Give reasons and examples.', type: 'opinion', time: '60s' },
      { id: 'spk4', label: 'Task 4 — Problem Solving', prompt: 'Your friend wants to study abroad but is worried about the cost and being far from family. What advice would you give? Explain your reasoning.', type: 'discuss', time: '60s' },
      { id: 'spk5', label: 'Task 5 — Advantages and Disadvantages', prompt: 'Many companies now allow employees to work from home. What are the advantages and disadvantages of remote work? Which do you think is better?', type: 'discuss', time: '60s' },
    ],
  },
];

const MET_CRITERIA = [
  { id: 'task', label: 'Task Completion', desc: 'Relevance to task, quantity of language, elaboration with supporting detail', max: 4 },
  { id: 'language', label: 'Language Resources', desc: 'Vocabulary range/appropriacy, grammar accuracy and complexity, fluency', max: 4 },
  { id: 'delivery', label: 'Intelligibility / Delivery', desc: 'Pronunciation, rhythm, hesitation, clarity', max: 4 },
];

function getTaskTypeLabel(type) {
  const labels = { describe: 'Picture Description', narrative: 'Personal Narrative', opinion: 'Opinion', discuss: 'Discussion', persuade: 'Persuasion' };
  return labels[type] || type;
}

export default function SpeakingEvalPage({ 'data-testid': testId }) {
  const [selectedTest, setSelectedTest] = useState('mock-test-1');
  const [selectedTask, setSelectedTask] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [isEvalLoading, setIsEvalLoading] = useState(false);
  const [error, setError] = useState(null);

  const tasks = MOCK_TESTS.find(t => t.id === selectedTest)?.tasks || [];

  const handleEvaluate = useCallback(async () => {
    if (!selectedTask || !transcript.trim()) return;

    setIsEvalLoading(true);
    setError(null);
    setEvalResult(null);

    try {
      const task = tasks.find(t => t.id === selectedTask);

      const prompt = `You are a MET (Michigan English Test) speaking examiner. Evaluate the following student response to a MET speaking task.

## Task Information
- Task type: ${getTaskTypeLabel(task.type)}
- Time limit: ${task.time}
- Prompt: "${task.prompt}"

## Student Response (transcript)
"${transcript.trim()}"

## Evaluation Criteria (MET Speaking Rating Scale)

Score each criterion 0–4 using the MET official rubric:

### 1. Task Completion (0–4)
- 4: fully relevant, extensive supporting detail
- 3: relevant, completes task, general detail only
- 2: mostly relevant, some difficulty completing task
- 1: short/simple, difficulty completing task
- 0: no response or completely irrelevant

### 2. Language Resources (0–4)
- 4: complex grammar controlled, broad appropriate vocab, errors infrequent and not distracting
- 3: some complex structures, appropriate vocab, no errors causing misunderstanding
- 2: simple patterns generally controlled, noticeable errors but intended meaning clear
- 1: simple/short sentences, basic grammar/vocab errors, limited range
- 0: insufficient language to produce meaningful response

### 3. Intelligibility / Delivery (0–4)
- 4: smooth delivery, minimal hesitation, clear and easy to understand
- 3: some hesitation, generally clear, only a few individual words unclear
- 2: sometimes hesitant, pauses/reformulations, listener effort required in stretches
- 1: frequent pauses, false starts, reformulations, speech requires significant listener effort
- 0: not comprehensible even to a sympathetic listener

## Output Format

Return ONLY valid JSON with this structure (no markdown, no code fences):
{
  "scores": { "task": 0, "language": 0, "delivery": 0 },
  "overallScore": 0,
  "cefrEstimate": "B1/B2/C1",
  "rationale": { "task": "...", "language": "...", "delivery": "..." },
  "corrections": [
    { "original": "what student said wrong", "corrected": "correction", "explanation": "why this is an error" }
  ],
  "feedback": "Overall feedback for the student (2-3 sentences)",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}

IMPORTANT: overallScore is the sum of all three criterion scores (out of 12). BE HONEST and accurate in your assessment.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          system: 'You are a MET speaking examiner. Evaluate student responses strictly against the official MET rubric. Return only valid JSON.',
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error (${res.status})`);
      }

      const data = await res.json();
      const text = data?.content?.[0]?.text || data?.text || data?.response || '';
      const parsed = JSON.parse(text.replace(/```(?:json)?\s*|\s*```/g, '').trim());
      setEvalResult(parsed);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsEvalLoading(false);
    }
  }, [selectedTask, selectedTest, transcript, tasks]);

  return (
    <div className="page-shell" data-testid={testId}>
      <SectionHeader
        title="MET Speaking Evaluator"
        sub="Select a speaking task, paste a student transcript, and get AI evaluation against MET rubrics"
      />

      <div className="se-layout">
        <div className="se-left">
          <Card className="mb-4">
            <div style={{ padding: 'var(--space-4)' }}>
              <h3 className="section-title" style={{ marginBottom: 12 }}>1. Select Test & Task</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {MOCK_TESTS.map(t => (
                  <button
                    key={t.id}
                    className={`se-tab${selectedTest === t.id ? ' se-tab--active' : ''}`}
                    onClick={() => { setSelectedTest(t.id); setSelectedTask(null); setEvalResult(null); }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="se-task-list">
                {tasks.map(task => (
                  <button
                    key={task.id}
                    className={`se-task-row${selectedTask === task.id ? ' se-task-row--selected' : ''}`}
                    onClick={() => { setSelectedTask(task.id); setEvalResult(null); }}
                  >
                    <div className="se-task-row__head">
                      <span className="se-task-row__label">{task.label}</span>
                      <span className="se-task-row__meta">
                        <span className="pill pill--accent">{getTaskTypeLabel(task.type)}</span>
                        <span className="pill pill--time">{task.time}</span>
                      </span>
                    </div>
                    <p className="se-task-row__prompt">{task.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ padding: 'var(--space-4)' }}>
              <h3 className="section-title" style={{ marginBottom: 12 }}>2. Student Transcript</h3>
              <textarea
                className="input se-textarea"
                rows={8}
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Paste the student's spoken response as a transcript..."
                disabled={isEvalLoading}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span className="text-xs text-muted">
                  {selectedTask ? `Evaluating: ${tasks.find(t => t.id === selectedTask)?.label}` : 'Select a task first'}
                </span>
                <Button
                  variant="primary"
                  onClick={handleEvaluate}
                  disabled={!selectedTask || !transcript.trim() || isEvalLoading}
                >
                  {isEvalLoading ? 'Evaluating...' : 'Evaluate Response'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="se-right">
          {!evalResult && !isEvalLoading && !error && (
            <Card>
              <div className="se-empty">
                <div className="se-empty-icon">
                  <Icon.mic size={32} />
                </div>
                <h3>No evaluation yet</h3>
                <p>Select a task, paste a student transcript, and click "Evaluate Response"</p>
                <div className="se-rubric-preview">
                  <strong>MET Speaking Rubric</strong>
                  {MET_CRITERIA.map(c => (
                    <div key={c.id} className="se-rubric-item">
                      <span className="se-rubric-label">{c.label}</span>
                      <span className="se-rubric-desc">{c.desc}</span>
                      <span className="se-rubric-max">{c.max}/4</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {isEvalLoading && (
            <Card>
              <div className="se-loading">
                <span className="spinner" />
                <span>Evaluating against MET rubric...</span>
              </div>
            </Card>
          )}

          {error && (
            <Card>
              <div className="se-error">
                <Icon.warning size={16} />
                Evaluation failed: {error}
              </div>
            </Card>
          )}

          {evalResult && !isEvalLoading && (
            <div className="se-results">
              <Card className="mb-4" style={{ border: '2px solid var(--accent)' }}>
                <div style={{ padding: 'var(--space-4)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                    <div className="se-badge">AI EVALUATION</div>
                    <h3 className="section-title" style={{ margin: 0 }}>Speaking Scores</h3>
                  </div>

                  <div className="se-score-grid">
                    <div className="se-score-card se-score-card--total">
                      <span className="se-score-value">{evalResult.overallScore}/12</span>
                      <span className="se-score-label">Overall</span>
                      {evalResult.cefrEstimate && (
                        <span className="se-cefr">{evalResult.cefrEstimate}</span>
                      )}
                    </div>
                    {MET_CRITERIA.map(c => (
                      <div key={c.id} className="se-score-card">
                        <span className="se-score-value">{evalResult.scores?.[c.id] ?? '?'}/4</span>
                        <span className="se-score-label">{c.label}</span>
                        <p className="se-rationale">{evalResult.rationale?.[c.id] || ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {evalResult.strengths?.length > 0 && (
                <Card className="mb-4">
                  <div style={{ padding: 'var(--space-4)' }}>
                    <h4 className="section-title" style={{ marginBottom: 8, color: 'var(--success)' }}>Strengths</h4>
                    <ul className="se-list">
                      {evalResult.strengths.map((s, i) => (
                        <li key={i} className="se-list-item se-list-item--success">{s}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}

              {evalResult.weaknesses?.length > 0 && (
                <Card className="mb-4">
                  <div style={{ padding: 'var(--space-4)' }}>
                    <h4 className="section-title" style={{ marginBottom: 8, color: 'var(--error)' }}>Areas to Improve</h4>
                    <ul className="se-list">
                      {evalResult.weaknesses.map((w, i) => (
                        <li key={i} className="se-list-item se-list-item--warning">{w}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}

              {evalResult.corrections?.length > 0 && (
                <Card className="mb-4">
                  <div style={{ padding: 'var(--space-4)' }}>
                    <h4 className="section-title" style={{ marginBottom: 8 }}>Corrections</h4>
                    {evalResult.corrections.map((c, i) => (
                      <div key={i} className="se-correction">
                        <span className="se-correction__original">{c.original}</span>
                        <span className="se-correction__arrow">&rarr;</span>
                        <span className="se-correction__corrected">{c.corrected}</span>
                        <span className="se-correction__explanation">{c.explanation}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {evalResult.feedback && (
                <Card>
                  <div style={{ padding: 'var(--space-4)' }}>
                    <h4 className="section-title" style={{ marginBottom: 8 }}>Feedback</h4>
                    <p className="se-feedback">{evalResult.feedback}</p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .se-layout { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); align-items: start; margin-top: var(--space-4); }
        @media (max-width: 900px) { .se-layout { grid-template-columns: 1fr; } }
        .se-left { display: flex; flex-direction: column; gap: var(--space-4); }
        .se-right { position: sticky; top: var(--space-4); }
        .se-tab { padding: 6px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); cursor: pointer; font-size: var(--text-xs); font-weight: 700; color: var(--text); transition: background-color 0.15s, border-color 0.15s, color 0.15s; }
        .se-tab:hover { border-color: var(--accent); }
        .se-tab--active { background: var(--accent); color: #fff; border-color: var(--accent); }
        .se-task-list { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
        .se-task-row { display: block; width: 100%; text-align: left; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); cursor: pointer; transition: background-color 0.15s, border-color 0.15s, color 0.15s; font: inherit; color: var(--text); }
        .se-task-row:hover { border-color: var(--accent); background: var(--accent-subtle); }
        .se-task-row--selected { border-color: var(--accent); background: var(--accent-subtle); }
        .se-task-row__head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
        .se-task-row__label { font-size: var(--text-sm); font-weight: 700; }
        .se-task-row__meta { display: flex; gap: 4px; flex-wrap: wrap; }
        .se-task-row__prompt { margin: 0; font-size: var(--text-xs); color: var(--text-2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pill--time { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); padding: 1px 7px; border-radius: 999px; font-size: 10px; font-weight: 700; }
        .se-textarea { width: 100%; min-height: 160px; resize: vertical; font-family: inherit; font-size: var(--text-sm); line-height: 1.7; }
        .se-empty { padding: 40px 24px; text-align: center; color: var(--text-muted); }
        .se-empty-icon { color: var(--text-muted); opacity: 0.4; margin-bottom: 12px; }
        .se-empty h3 { margin: 0 0 8px; font-size: var(--text-base); }
        .se-empty p { margin: 0 0 24px; font-size: var(--text-sm); }
        .se-rubric-preview { text-align: left; background: var(--bg); border-radius: var(--radius-sm); padding: 16px; border: 1px solid var(--border); }
        .se-rubric-preview strong { display: block; font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; }
        .se-rubric-item { display: flex; gap: 8px; align-items: baseline; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: var(--text-sm); }
        .se-rubric-item:last-child { border-bottom: none; }
        .se-rubric-label { font-weight: 700; min-width: 130px; color: var(--text); }
        .se-rubric-desc { flex: 1; color: var(--text-2); font-size: var(--text-xs); }
        .se-rubric-max { font-weight: 700; color: var(--accent); min-width: 24px; text-align: right; }
        .se-loading { display: flex; align-items: center; gap: 10px; padding: 40px 24px; color: var(--text-muted); justify-content: center; }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: se-spin 0.6s linear infinite; }
        @keyframes se-spin { to { transform: rotate(360deg); } }
        .se-error { padding: 16px 20px; color: var(--error); background: var(--error-bg, #fef2f2); border-radius: var(--radius-sm); display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); }
        .se-badge { background: var(--accent); color: white; padding: 2px 8px; border-radius: var(--radius-pill); font-size: var(--text-xs); font-weight: 700; }
        .se-score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
        .se-score-card { text-align: center; padding: 16px; background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--border); }
        .se-score-card--total { border-color: var(--accent); background: var(--accent-subtle); }
        .se-score-value { display: block; font-size: 28px; font-weight: 800; color: var(--text); }
        .se-score-card--total .se-score-value { color: var(--accent); }
        .se-score-label { display: block; font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-top: 2px; letter-spacing: 0.04em; }
        .se-cefr { display: inline-block; margin-top: 6px; padding: 2px 10px; border-radius: 999px; background: var(--accent); color: #fff; font-weight: 700; font-size: 12px; }
        .se-rationale { font-size: var(--text-xs); color: var(--text-2); margin: 8px 0 0; line-height: 1.5; }
        .se-list { list-style: none; padding: 0; margin: 0; }
        .se-list-item { padding: 6px 0 6px 20px; position: relative; font-size: var(--text-sm); line-height: 1.5; }
        .se-list-item::before { content: ''; position: absolute; left: 0; top: 12px; width: 8px; height: 8px; border-radius: 50%; }
        .se-list-item--success::before { background: var(--success); }
        .se-list-item--warning::before { background: var(--warning); }
        .se-correction { display: flex; flex-wrap: wrap; gap: 4px 8px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: var(--text-sm); align-items: center; }
        .se-correction:last-child { border-bottom: none; }
        .se-correction__original { color: var(--error); text-decoration: line-through; }
        .se-correction__arrow { color: var(--text-muted); }
        .se-correction__corrected { color: var(--success); font-weight: 600; }
        .se-correction__explanation { width: 100%; color: var(--text-muted); font-size: var(--text-xs); }
        .se-feedback { font-size: var(--text-sm); line-height: 1.7; color: var(--text); white-space: pre-wrap; margin: 0; padding: 12px; background: var(--bg); border-radius: var(--radius-sm); }
      `}</style>
    </div>
  );
}
