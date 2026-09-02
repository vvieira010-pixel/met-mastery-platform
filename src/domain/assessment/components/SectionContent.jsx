import { Icon, Pill } from '../../../components/shared.jsx';
import { StudentFeedbackView } from '../../../components/domain-ui.jsx';

export function camelToLabel(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

export function PrereqIcon({ ok, required }) {
  return (
    <span className={`prereq-icon ${ok ? 'bg-success' : required ? 'bg-danger' : 'bg-muted'}`} style={{ background: ok ? 'var(--success)' : required ? 'var(--danger)' : 'var(--muted)' }}>
      {ok ? <Icon.check size={11} color="#fff" /> : <span className="prereq-icon-text">{required ? '!' : '?'}</span>}
    </span>
  );
}

export function PrereqRow({ done, label }) {
  return (
    <div className={`prereq-row${done ? ' prereq-row-done' : ' prereq-row-pending'}`}>
      <span className="prereq-row-icon">
        {done ? <Icon.check size={12} color="var(--success)" /> : <span className="prereq-row-x">!</span>}
      </span>
      <span className="prereq-row-label">{label}</span>
    </div>
  );
}

function EmptySectionNote({ message }) {
  return (
    <div className="section-note">
      <Icon.refresh size={14} color="var(--warning)" />
      <span className="section-note-text">{message}</span>
    </div>
  );
}

function KeyValueCards({ content }) {
  if (!content || typeof content !== 'object') return null;
  const entries = Array.isArray(content) ? content.map((v, i) => [`${i + 1}`, v]) : Object.entries(content);
  return (
    <div className="kv-card-stack">
      {entries.map(([k, v]) => (
        <div key={k} className="kv-card">
          <div className="kv-card-label">{camelToLabel(String(k))}</div>
          <div className={`kv-card-value ${Array.isArray(v) && v.length === 0 ? 'text-muted text-italic' : ''}`} style={{ lineHeight: 1.6, color: Array.isArray(v) && v.length === 0 ? 'var(--muted)' : 'inherit', fontStyle: Array.isArray(v) && v.length === 0 ? 'italic' : 'normal' }}>
            {typeof v === 'object' ? (Array.isArray(v) ? (v.length === 0 ? 'None identified' : v.map((item, j) => <div key={j}>• {item !== null && typeof item === 'object' ? Object.values(item).join(' — ') : String(item)}</div>)) : Object.entries(v).map(([sk, sv]) => `${camelToLabel(sk)}: ${sv}`).join(' · ')) : String(v)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionContent({ sectionKey, content }) {
  if (!content) return <EmptySectionNote message="Not generated — click Regen to retry this section." />;

  if (typeof content === 'object' && !Array.isArray(content) && Object.keys(content).length === 0) {
    return <EmptySectionNote message="Not generated — click Regen to retry this section." />;
  }

  if (typeof content === 'string' && content.trim() === '') {
    return <EmptySectionNote message="Not generated — click Regen to retry this section." />;
  }

  if (sectionKey === 'classSummary') {
    return <p className="text-sm text-line-height-relaxed">{String(content)}</p>;
  }

  if (sectionKey === 'studentFeedback' && typeof content === 'object') {
    return <StudentFeedbackView feedback={content} />;
  }

  if (sectionKey === 'errorBankSuggestions' && Array.isArray(content)) {
    return (
      <div className="overflow-auto">
        <table className="error-bank-table">
          <thead className="error-bank-thead-row">
            <tr>
              {['Error', 'Correct', 'Category', 'Priority', 'Save?'].map(h => <th key={h} className="error-bank-th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {content.map((err, i) => (
              <tr key={i} className="error-bank-row">
                <td className="error-bank-cell-error">{err.error}</td>
                <td className="error-bank-cell-correct">{err.correct}</td>
                <td className="error-bank-cell-category">{err.category}</td>
                <td className="error-bank-cell-priority"><Pill tone={err.priority === 'high' ? 'danger' : err.priority === 'medium' ? 'warning' : 'muted'}>{err.priority}</Pill></td>
                <td className="error-bank-cell-save">{err.saveToProfile !== false ? <Icon.check size={12} /> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (sectionKey === 'priorityDiagnosis' && Array.isArray(content)) {
    if (content.length === 0) {
      return <EmptySectionNote message="No priority items were generated — click Regen to retry this section." />;
    }
    return (
      <div className="priority-diagnosis-stack">
        {content.map((p, i) => (
          <div key={i} className="priority-item-card">
            <div className="priority-item-header">
              <Pill tone={p.urgency === 'Critical' ? 'danger' : p.urgency === 'Developing' ? 'warning' : 'info'}>{p.urgency}</Pill>
              <strong className="text-sm">{p.area}</strong>
            </div>
            {p.evidence && <div className="priority-item-evidence">Evidence: {p.evidence}</div>}
            <div className="priority-item-what-to-improve">{p.whatToImprove}</div>
            {p.howToImprove && <div className="priority-item-how-to-improve">How: {p.howToImprove}</div>}
          </div>
        ))}
      </div>
    );
  }

  if (sectionKey === 'skillDiagnosis' && typeof content === 'object') {
    return (
      <div className="skill-diagnosis-stack">
        {Object.entries(content).map(([skill, data]) => (
          <div key={skill} className="skill-item-card">
            <div className="skill-item-header">
              <span className="skill-item-name">{skill}</span>
              {data?.evaluated === false ? (
                <Pill tone="muted">Not evaluated</Pill>
              ) : (
                <>
                  {data?.score0to80 != null && <Pill tone={data.score0to80 >= 55 ? 'success' : data.score0to80 >= 40 ? 'warning' : 'danger'}>{data.score0to80}/80</Pill>}
                  {data?.scoreConfidenceLevel && (() => {
                    const isLow = ['Not evaluated enough', 'Limited evidence', 'Provisional estimate'].includes(data.scoreConfidenceLevel);
                    return <span className={`skill-confidence ${isLow ? 'skill-confidence-low' : 'skill-confidence-normal'}`}>{data.scoreConfidenceLevel}</span>;
                  })()}
                  {data?.evidenceCount > 0 && <span className="skill-evidence-count">({data.evidenceCount} ev)</span>}
                </>
              )}
            </div>
            {data?.evaluated === false ? (
              <p className="skill-diagnosis-text">{data.diagnosis || 'Not evaluated — no evidence.'}</p>
            ) : (
              <div className="skill-item-list">
                {data?.strengths?.length > 0 && data.strengths.map((s, j) => (
                  <div key={j} className="skill-strength-item"><Icon.check size={12} /> {s}</div>
                ))}
                {data?.weaknesses?.length > 0 && data.weaknesses.map((w, j) => (
                  <div key={j} className="skill-weakness-item"><Icon.close size={12} /> {w}</div>
                ))}
                {data?.mainIssues?.length > 0 && data.mainIssues.map((iss, j) => (
                  <div key={j} className="skill-issue-item"><Icon.close size={12} /> {iss}</div>
                ))}
                {data?.whatToImproveNext && <div className="skill-next-improvement">Next: {data.whatToImproveNext}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (sectionKey === 'homeworkRecommendation' && typeof content === 'object') {
    return (
      <div className="homework-stack">
        <div>
          <div className="homework-title">{content.title}</div>
          <div className="homework-objective">{content.objective}</div>
        </div>
        {content.instructions && (
          <div className="homework-instructions">{content.instructions}</div>
        )}
        {Array.isArray(content.tasks) && content.tasks.map((t, i) => (
          <div key={i} className="homework-task-card">
            <div className="homework-task-header">
              <span className="homework-task-number">Task {t.taskNumber || i + 1}</span>
              {t.type && <Pill tone="accent">{t.type}</Pill>}
            </div>
            <div className="homework-task-description">{typeof t === 'string' ? t : t.description}</div>
            {t.content && <div className="homework-task-content">{t.content}</div>}
            {t.example && <div className="homework-task-example">Example: {t.example}</div>}
          </div>
        ))}
        {content.teacherNotes && (
          <div className="homework-teacher-notes">
            <strong>Teacher notes:</strong> {content.teacherNotes}
          </div>
        )}
      </div>
    );
  }

  if (sectionKey === 'nextClassFocus' && typeof content === 'object') {
    return (
      <div className="next-class-stack">
        {Object.entries(content).map(([k, v]) => (
          <div key={k} className="next-class-item">
            <div className="next-class-label">{camelToLabel(k)}</div>
            <div className="next-class-value">{String(v)}</div>
          </div>
        ))}
      </div>
    );
  }

  if (sectionKey === 'profileUpdateSuggestions' && typeof content === 'object' && !Array.isArray(content)) {
    return (
      <div className="profile-suggestions-stack">
        {Object.entries(content).map(([k, v]) => (
          <div key={k} className="profile-suggestion-item">
            <div className="profile-suggestion-label">{camelToLabel(k)}</div>
            {Array.isArray(v) ? (
              <ul className="profile-suggestion-list">
                {v.map((item, j) => <li key={j}>{String(item)}</li>)}
              </ul>
            ) : (
              <div className="profile-suggestion-value">{String(v)}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (sectionKey === 'vocabGrammarTargets' && typeof content === 'object') {
    const vocab = Array.isArray(content.vocabularyTargets) ? content.vocabularyTargets : [];
    const grammar = Array.isArray(content.grammarTargets) ? content.grammarTargets : [];
    return (
      <div className="targets-stack">
        {vocab.length > 0 && (
          <div>
            <div className="targets-header">Vocabulary Targets</div>
            {vocab.map((v, i) => (
              <div key={i} className="target-item">
                <div className="target-item-header">
                  <strong className="target-item-word">{v.wordOrPhrase}</strong>
                  {v.category && <Pill tone="muted">{v.category}</Pill>}
                </div>
                {v.meaning && <div className="target-item-meaning">{v.meaning}</div>}
                {v.exampleSentence && <div className="target-item-example">"{v.exampleSentence}"</div>}
              </div>
            ))}
          </div>
        )}
        {grammar.length > 0 && (
          <div>
            <div className="targets-header targets-header-warning">Grammar Targets</div>
            {grammar.map((g, i) => (
              <div key={i} className="target-item">
                <strong className="target-item-word">{g.area}</strong>
                {g.issue && <div className="target-issue">{g.issue}</div>}
                {g.correction && <div className="target-correction">{g.correction}</div>}
                {g.practiceDirection && <div className="target-practice">Practice: {g.practiceDirection}</div>}
              </div>
            ))}
          </div>
        )}
        {vocab.length === 0 && grammar.length === 0 && (
          <EmptySectionNote message="No vocabulary or grammar targets were generated — click Regen to retry this section." />
        )}
      </div>
    );
  }

  if (sectionKey === 'readinessCheck' && typeof content === 'object') {
    const fmt = (v) => {
      if (v === true) return 'Yes';
      if (v === false) return 'No';
      return String(v);
    };
    return (
      <div className="readiness-stack">
        {Object.entries(content).map(([k, v]) => {
          if (Array.isArray(v) && v.length === 0) return null;
          return (
            <div key={k} className="readiness-item">
              <div className="readiness-label">{camelToLabel(k)}</div>
              <div className="readiness-value">
                {Array.isArray(v)
                  ? v.map((item, j) => <div key={j}>• {camelToLabel(String(item))}</div>)
                  : fmt(v)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (sectionKey === 'targetScoreRelevance' && typeof content === 'object') {
    return (
      <div className="relevance-stack">
        {Object.entries(content).map(([k, v]) => (
          <div key={k} className="relevance-item">
            <div className="relevance-label">{camelToLabel(k)}</div>
            <div className="relevance-value">
              {Array.isArray(v) ? v.map((item, j) => <div key={j}>• {typeof item === 'object' ? JSON.stringify(item) : String(item)}</div>) : String(v)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (typeof content === 'object') {
    return <KeyValueCards content={content} />;
  }

  return <p className="text-sm text-line-height-relaxed">{String(content)}</p>;
}
