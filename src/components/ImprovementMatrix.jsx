import { useState } from 'react';
import { Icon } from './shared.jsx';

const DEFAULT_IMPROVEMENT_ENTRIES = [
  {
    id: 'mat-1',
    skill: 'writing',
    category: 'Lexical Precision & Register',
    currentLanguage: 'I think that this problem is very big and we need to fix it fast.',
    whatToChange: 'Replace informal colloquial phrases ("very big", "fix it fast") with formal academic collocations.',
    howToImprove: 'Try: "This pressing issue warrants immediate intervention." Fantastic clarity in your message—elevating the register will instantly secure B2 points!',
    encouragement: 'High-Yield B2 Upgrade',
  },
  {
    id: 'mat-2',
    skill: 'speaking',
    category: 'Discourse Cohesion',
    currentLanguage: 'And then I went to the manager. And then she said yes. And after that we started.',
    whatToChange: 'Repetitive coordination ("and then... and after that") restricts sentence variety.',
    howToImprove: 'Try: "Having consulted the manager, who promptly approved the initiative, we commenced operations." Great storytelling flow—subordination makes your speech sound natural and effortless!',
    encouragement: 'Fluent Phrasing',
  },
  {
    id: 'mat-3',
    skill: 'writing',
    category: 'Complex Sentence Structure',
    currentLanguage: 'Many people like remote work. It gives them more free time for family.',
    whatToChange: 'Two isolated simple sentences; combine using concession or causal relative clauses.',
    howToImprove: 'Try: "Remote work continues to gain popularity, primarily because it affords professionals greater flexibility for personal commitments." Excellent foundational idea!',
    encouragement: 'Structural Synthesis',
  },
  {
    id: 'mat-4',
    skill: 'speaking',
    category: 'Hesitation & Pacing',
    currentLanguage: 'Um, like, the biggest reason is... um, people want better money.',
    whatToChange: 'Filler words ("um, like") interrupting lexical search during spontaneous delivery.',
    howToImprove: 'Try: "Chief among these factors is financial compensation." You have great pronunciation; pausing silently for one second before speaking projects confidence!',
    encouragement: 'Confidence Booster',
  },
];

export default function ImprovementMatrix({
  feedback = null,
  customEntries = null,
  className = '',
  'data-testid': testId = 'improvement-matrix',
}) {
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'writing' | 'speaking'

  // Extract from feedback prop if provided, or use customEntries, or fallback to default high-yield entries
  const entries = (() => {
    if (Array.isArray(customEntries) && customEntries.length > 0) return customEntries;

    if (feedback && typeof feedback === 'object') {
      const extracted = [];
      const fixes = Array.isArray(feedback.whatToImprove) ? feedback.whatToImprove : [];

      fixes.forEach((f, idx) => {
        if (!f) return;
        const currentLang = f.insteadOf || f.currentLanguage || (f.example ? `"${f.example}"` : 'Identified in recent submission');
        const whatChange = f.area || f.explanation || 'Refine word choice or syntactic structure';
        const howImp = f.sayInstead
          ? `Try: "${f.sayInstead}". ${f.howToImprove || 'Solid effort—this phrasing sharpens your academic precision!'}`
          : (f.howToImprove || 'Practice replacing basic connectors with B2 discourse linkers. Keep up the great momentum!');

        extracted.push({
          id: `dx-${idx}`,
          skill: (f.skill || f.section || (idx % 2 === 0 ? 'writing' : 'speaking')).toLowerCase(),
          category: f.category || f.area || 'Constructive Refinement',
          currentLanguage: currentLang,
          whatToChange: whatChange,
          howToImprove: howImp,
          encouragement: 'Teacher Action Point',
        });
      });

      if (extracted.length > 0) return extracted;
    }

    return DEFAULT_IMPROVEMENT_ENTRIES;
  })();

  const filtered = entries.filter(e => {
    if (selectedFilter === 'all') return true;
    return (e.skill || '').toLowerCase() === selectedFilter;
  });

  return (
    <div
      className={`improvement-matrix-container ${className}`}
      data-testid={testId}
      style={{
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      {/* Header with Title and Skill Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(22, 163, 74, 0.1)',
                color: '#16a34a',
              }}
            >
              Constructive Evaluation UI
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted, #64748b)' }}>
              Writing & Speaking Feedback
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
            Improvement Matrix
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted, #64748b)' }}>
            Categorized breakdown tracking your journey from current production to elevated B2 proficiency.
          </p>
        </div>

        {/* Skill Filter Buttons */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg, #f1f5f9)', padding: 3, borderRadius: 8 }}>
          {[
            { id: 'all', label: 'All Skills' },
            { id: 'writing', label: 'Writing Focus', icon: <Icon.write size={13} /> },
            { id: 'speaking', label: 'Speaking Focus', icon: <Icon.chat size={13} /> },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              style={{
                border: 'none',
                background: selectedFilter === f.id ? 'var(--surface, #ffffff)' : 'transparent',
                color: selectedFilter === f.id ? 'var(--text, #0f172a)' : 'var(--muted, #64748b)',
                fontWeight: selectedFilter === f.id ? 700 : 500,
                fontSize: '0.76rem',
                padding: '5px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: selectedFilter === f.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Encouraging Affirmation Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(22, 163, 74, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)',
          borderLeft: '4px solid #16a34a',
          borderRadius: 6,
          padding: '10px 14px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>🌟</span>
        <div style={{ fontSize: '0.8rem', color: 'var(--text, #1e293b)', lineHeight: 1.45 }}>
          <strong>Constructive growth mindset:</strong> These targets are stepping stones to sharpen your Michigan English Test score. You are demonstrating solid foundations—applying these specific upgrades will noticeably strengthen your fluency!
        </div>
      </div>

      {/* Responsive Table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border, #e2e8f0)' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.82rem',
            lineHeight: 1.5,
          }}
        >
          <thead>
            <tr style={{ background: 'var(--bg, #f8fafc)', borderBottom: '2px solid var(--border, #e2e8f0)' }}>
              <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text, #0f172a)', width: '30%' }}>
                Current Language
              </th>
              <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text, #0f172a)', width: '32%' }}>
                What to Change
              </th>
              <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text, #0f172a)', width: '38%' }}>
                How to Improve
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const isEven = idx % 2 === 0;
              const isSpeaking = row.skill === 'speaking';
              return (
                <tr
                  key={row.id || idx}
                  style={{
                    background: isEven ? 'var(--surface, #ffffff)' : 'rgba(248, 250, 252, 0.5)',
                    borderBottom: '1px solid var(--border, #f1f5f9)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Current Language Column */}
                  <td style={{ padding: '14px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: isSpeaking ? 'rgba(245, 158, 11, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                          color: isSpeaking ? '#d97706' : '#7c3aed',
                          textTransform: 'capitalize',
                        }}
                      >
                        {row.skill}
                      </span>
                      {row.category && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted, #64748b)' }}>
                          {row.category}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        borderLeft: '3px solid #f87171',
                        borderRadius: 4,
                        fontStyle: 'italic',
                        color: 'var(--text-2, #334155)',
                        fontSize: '0.8rem',
                      }}
                    >
                      {row.currentLanguage}
                    </div>
                  </td>

                  {/* What to Change Column */}
                  <td style={{ padding: '14px', verticalAlign: 'top', color: 'var(--text, #1e293b)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: '#0284c7', marginTop: 2, flexShrink: 0 }}>
                        <Icon.alert size={14} />
                      </span>
                      <span style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {row.whatToChange}
                      </span>
                    </div>
                  </td>

                  {/* How to Improve Column */}
                  <td style={{ padding: '14px', verticalAlign: 'top' }}>
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(22, 163, 74, 0.06)',
                        borderLeft: '3px solid #16a34a',
                        borderRadius: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: 'rgba(22, 163, 74, 0.15)',
                            color: '#15803d',
                          }}
                        >
                          {row.encouragement || 'B2 Upgrade'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text, #0f172a)', lineHeight: 1.5 }}>
                        {row.howToImprove}
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
