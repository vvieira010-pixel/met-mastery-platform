import { useState } from 'react';
import { Icon } from './shared.jsx';

const isPlaceholder = (value) => /^(add|identified in recent submission|evidence to review)/i.test(String(value || '').trim());

function buildImprovementEntries(feedback, customEntries) {
  if (Array.isArray(customEntries) && customEntries.length > 0) return customEntries;
  if (!feedback || typeof feedback !== 'object') return [];

  return (Array.isArray(feedback.whatToImprove) ? feedback.whatToImprove : [])
    .flatMap((fix, index) => {
      if (!fix) return [];
      const currentLanguage = fix.insteadOf || fix.currentLanguage || fix.example || '';
      const whatToChange = fix.area || fix.explanation || '';
      const howToImprove = fix.sayInstead
        ? `Try: "${fix.sayInstead}". ${fix.howToImprove || ''}`.trim()
        : (fix.howToImprove || '');

      // Never invent a Writing/Speaking row merely to fill the matrix. The
      // reference experience is useful only when a teacher can point to a
      // real phrase or observed behavior from this student's lesson.
      if (!currentLanguage || !whatToChange || !howToImprove || isPlaceholder(currentLanguage)) return [];

      return [{
        id: fix.id || `dx-${index}`,
        skill: String(fix.skill || fix.section || 'language focus').toLowerCase(),
        category: fix.category || fix.area,
        currentLanguage,
        whatToChange,
        howToImprove,
        encouragement: fix.encouragement || 'Teacher Action Point',
      }];
    });
}

export default function ImprovementMatrix({
  feedback = null,
  customEntries = null,
  className = '',
  'data-testid': testId = 'improvement-matrix',
}) {
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'writing' | 'speaking'

  const entries = buildImprovementEntries(feedback, customEntries);

  const filtered = entries.filter(e => {
    if (selectedFilter === 'all') return true;
    return (e.skill || '').toLowerCase() === selectedFilter;
  });

  if (entries.length === 0) return null;

  return (
    <div
      className={`improvement-matrix-container ${className}`}
      data-testid={testId}
      style={{
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #F6F4EE)',
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
                background: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              Constructive Evaluation UI
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted, #6B7C80)' }}>
              Writing & Speaking Feedback
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text, #1A2E35)' }}>
            Improvement Matrix
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted, #6B7C80)' }}>
            Categorized breakdown tracking your journey from current production to elevated B2 proficiency.
          </p>
        </div>

        {/* Skill Filter Buttons */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg, #FDFCF8)', padding: 3, borderRadius: 8 }}>
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
                color: selectedFilter === f.id ? 'var(--text, #1A2E35)' : 'var(--muted, #6B7C80)',
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
          background: 'var(--bg, #FDFCF8)',
          borderLeft: '3px solid var(--primary)',
          borderRadius: 6,
          padding: '10px 14px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }} aria-hidden="true">●</span>
        <div style={{ fontSize: '0.8rem', color: 'var(--text, #2B454E)', lineHeight: 1.45 }}>
          <strong>Constructive growth mindset:</strong> These targets are stepping stones to sharpen your Michigan English Test score. You are demonstrating solid foundations—applying these specific upgrades will noticeably strengthen your fluency!
        </div>
      </div>

      {/* Responsive Table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border, #F6F4EE)' }}>
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
            <tr style={{ background: 'var(--bg, #FDFCF8)', borderBottom: '2px solid var(--border, #F6F4EE)' }}>
              <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text, #1A2E35)', width: '30%' }}>
                Current Language
              </th>
              <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text, #1A2E35)', width: '32%' }}>
                What to Change
              </th>
              <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text, #1A2E35)', width: '38%' }}>
                How to Improve
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <tr
                  key={row.id || idx}
                  style={{
                    background: isEven ? 'var(--surface, #ffffff)' : 'rgba(248, 250, 252, 0.5)',
                    borderBottom: '1px solid var(--border, #FDFCF8)',
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
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {row.skill}
                      </span>
                      {row.category && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted, #6B7C80)' }}>
                          {row.category}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '8px 10px',
                        background: 'var(--bg, #FDFCF8)',
                        borderLeft: '3px solid var(--border-strong)',
                        borderRadius: 4,
                        fontStyle: 'italic',
                        color: 'var(--text-2, #2B454E)',
                        fontSize: '0.8rem',
                      }}
                    >
                      {row.currentLanguage}
                    </div>
                  </td>

                  {/* What to Change Column */}
                  <td style={{ padding: '14px', verticalAlign: 'top', color: 'var(--text, #2B454E)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: '#2D7A8C', marginTop: 2, flexShrink: 0 }}>
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
                        background: 'var(--primary-light)',
                        borderLeft: '3px solid var(--primary)',
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
                            background: 'var(--surface, #ffffff)',
                            color: 'var(--primary)',
                          }}
                        >
                          {row.encouragement || 'B2 Upgrade'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text, #1A2E35)', lineHeight: 1.5 }}>
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
