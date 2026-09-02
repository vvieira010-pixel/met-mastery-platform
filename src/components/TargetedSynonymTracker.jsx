import { useState, useMemo } from 'react';
import { Icon } from './shared.jsx';

const SYNONYM_TRANSITIONS_DATA = [
  {
    id: 'syn-1',
    b1Word: 'very important',
    b2Equivalents: ['imperative', 'paramount', 'vital', 'crucial'],
    skill: 'Writing',
    homeworkSource: 'Homework #4: Technology in Modern Workplaces',
    exampleB1: 'Security measures are *very important* for cloud storage.',
    exampleB2: 'Implementing robust security protocols is *imperative* for data governance.',
    status: 'adopted',
    usageCount: 4,
  },
  {
    id: 'syn-2',
    b1Word: 'show',
    b2Equivalents: ['demonstrate', 'illustrate', 'exhibit', 'exemplify'],
    skill: 'Writing',
    homeworkSource: 'Homework #3: Environmental Policy Synthesis',
    exampleB1: 'The data *shows* that temperatures increased.',
    exampleB2: 'Empirical records clearly *demonstrate* an upward trajectory in temperature.',
    status: 'adopted',
    usageCount: 3,
  },
  {
    id: 'syn-3',
    b1Word: 'help',
    b2Equivalents: ['facilitate', 'bolster', 'augment', 'expedite'],
    skill: 'Speaking',
    homeworkSource: 'Speaking Sample: 45s Team Decision',
    exampleB1: 'Good communication can *help* the project finish on time.',
    exampleB2: 'Active communication *facilitates* cross-functional alignment and timely delivery.',
    status: 'in-progress',
    usageCount: 1,
  },
  {
    id: 'syn-4',
    b1Word: 'big problem',
    b2Equivalents: ['pressing concern', 'formidable challenge', 'significant obstacle'],
    skill: 'Writing',
    homeworkSource: 'Homework #2: Urban Transit Solutions',
    exampleB1: 'Traffic congestion is a *big problem* in capital cities.',
    exampleB2: 'Traffic congestion represents a *pressing concern* in metropolitan centers.',
    status: 'adopted',
    usageCount: 2,
  },
  {
    id: 'syn-5',
    b1Word: 'a lot of',
    b2Equivalents: ['a substantial volume of', 'numerous', 'considerable', 'an array of'],
    skill: 'Speaking',
    homeworkSource: 'Speaking Sample: Problem-Solving Scenario',
    exampleB1: 'There were *a lot of* people waiting for answers.',
    exampleB2: 'A *substantial volume* of stakeholders requested prompt clarification.',
    status: 'in-progress',
    usageCount: 1,
  },
  {
    id: 'syn-6',
    b1Word: 'good / beneficial',
    b2Equivalents: ['advantageous', 'favorable', 'lucrative', 'meritorious'],
    skill: 'Writing',
    homeworkSource: 'Homework #4: Technology in Modern Workplaces',
    exampleB1: 'Remote collaboration is *good* for employee satisfaction.',
    exampleB2: 'Flexible schedules prove highly *advantageous* for workforce retention.',
    status: 'review-needed',
    usageCount: 0,
  },
  {
    id: 'syn-7',
    b1Word: 'think',
    b2Equivalents: ['posit', 'maintain', 'contend', 'discern'],
    skill: 'Writing',
    homeworkSource: 'Diagnostic Writing Task',
    exampleB1: 'I *think* that education requires more funding.',
    exampleB2: 'I firmly *contend* that secondary institutions require targeted allocations.',
    status: 'adopted',
    usageCount: 3,
  },
  {
    id: 'syn-8',
    b1Word: 'make sure',
    b2Equivalents: ['ensure', 'verify', 'ascertain', 'guarantee'],
    skill: 'Speaking',
    homeworkSource: 'Speaking Sample: 45s Workplace Challenge',
    exampleB1: 'The supervisor wanted to *make sure* everyone understood.',
    exampleB2: 'The project director sought to *ascertain* team readiness.',
    status: 'in-progress',
    usageCount: 2,
  },
  {
    id: 'syn-9',
    b1Word: 'hard / difficult',
    b2Equivalents: ['arduous', 'demanding', 'intricate', 'rigorous'],
    skill: 'Writing',
    homeworkSource: 'Homework #1: Diagnostic Argument Task',
    exampleB1: 'Learning syntax is very *hard* for many adults.',
    exampleB2: 'Mastering grammatical syntax presents an *arduous* yet achievable endeavor.',
    status: 'review-needed',
    usageCount: 0,
  },
  {
    id: 'syn-10',
    b1Word: 'look at',
    b2Equivalents: ['examine', 'scrutinize', 'evaluate', 'investigate'],
    skill: 'Writing',
    homeworkSource: 'Homework #3: Environmental Policy Synthesis',
    exampleB1: 'Researchers must *look at* the long-term trends.',
    exampleB2: 'Policy analysts must *scrutinize* longitudinal patterns with care.',
    status: 'adopted',
    usageCount: 5,
  },
];

export default function TargetedSynonymTracker({
  className = '',
  'data-testid': testId = 'targeted-synonym-tracker',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'adopted' | 'in-progress' | 'review-needed'
  const [userOverrides, setUserOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('vv_synonym_tracker_status');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleAdopted = (id) => {
    setUserOverrides(prev => {
      const current = prev[id] || SYNONYM_TRANSITIONS_DATA.find(s => s.id === id)?.status;
      const next = current === 'adopted' ? 'in-progress' : 'adopted';
      const updated = { ...prev, [id]: next };
      try {
        localStorage.setItem('vv_synonym_tracker_status', JSON.stringify(updated));
      } catch (e) {
        console.warn('[SynonymTracker] save to localStorage failed:', e);
      }
      return updated;
    });
  };

  const processedList = useMemo(() => {
    return SYNONYM_TRANSITIONS_DATA.map((item, idx) => {
      const currentStatus = userOverrides[item.id] || item.status;
      return {
        ...item,
        displayIndex: idx + 1,
        status: currentStatus,
      };
    });
  }, [userOverrides]);

  const filtered = useMemo(() => {
    return processedList.filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.b1Word.toLowerCase().includes(q) ||
        item.b2Equivalents.some(eq => eq.toLowerCase().includes(q)) ||
        item.homeworkSource.toLowerCase().includes(q) ||
        item.skill.toLowerCase().includes(q)
      );
    });
  }, [processedList, filterStatus, searchTerm]);

  const adoptedCount = processedList.filter(s => s.status === 'adopted').length;
  const inProgressCount = processedList.filter(s => s.status === 'in-progress').length;

  return (
    <div
      className={`targeted-synonym-tracker ${className}`}
      data-testid={testId}
      style={{
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
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
                background: 'rgba(139, 92, 246, 0.1)',
                color: '#7c3aed',
              }}
            >
              Vocabulary & Logistics Integration
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
              JSON-Driven Academic Lexicon
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
            Targeted Synonym Tracker: B1 → B2
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted, #64748b)' }}>
            Tracks your active vocabulary upgrade from colloquial B1 phrasing to high-yield B2 equivalents based on your recent homework.
          </p>
        </div>

        {/* Progress Metric Badges */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ padding: '6px 12px', background: 'rgba(22, 163, 74, 0.1)', borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, display: 'block' }}>Adopted</span>
            <strong style={{ fontSize: '1.05rem', color: '#15803d' }}>{adoptedCount} / {processedList.length}</strong>
          </div>
          <div style={{ padding: '6px 12px', background: 'rgba(2, 132, 199, 0.1)', borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 700, display: 'block' }}>Practicing</span>
            <strong style={{ fontSize: '1.05rem', color: '#0369a1' }}>{inProgressCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        {/* Fast Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search B1 phrase, B2 synonym, or homework assignment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: 8,
              border: '1px solid var(--border, #cbd5e1)',
              fontSize: '0.8rem',
              background: 'var(--bg, #f8fafc)',
            }}
            data-testid="synonym-search-input"
          />
          <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--muted, #64748b)' }}>
            <Icon.search size={14} />
          </span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: 10, top: 9, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <Icon.close size={14} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg, #f1f5f9)', padding: 3, borderRadius: 8 }}>
          {[
            { id: 'all', label: 'All (10)' },
            { id: 'adopted', label: 'Adopted' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'review-needed', label: 'New Targets' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterStatus(f.id)}
              style={{
                border: 'none',
                background: filterStatus === f.id ? 'var(--surface, #ffffff)' : 'transparent',
                color: filterStatus === f.id ? 'var(--text, #0f172a)' : 'var(--muted, #64748b)',
                fontWeight: filterStatus === f.id ? 700 : 500,
                fontSize: '0.74rem',
                padding: '5px 10px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numbered List of B1 -> B2 Transitions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(item => {
          const isAdopted = item.status === 'adopted';
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 8,
                background: isAdopted ? 'rgba(22, 163, 74, 0.04)' : 'var(--bg, #f8fafc)',
                border: `1px solid ${isAdopted ? 'rgba(22, 163, 74, 0.3)' : 'var(--border, #e2e8f0)'}`,
                transition: 'all 0.15s ease',
              }}
              data-testid={`synonym-item-${item.id}`}
            >
              {/* Numbered Bullet */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: isAdopted ? '#16a34a' : 'var(--border, #cbd5e1)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {item.displayIndex}
              </div>

              {/* Transition Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  {/* B1 Word */}
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      textDecoration: isAdopted ? 'line-through' : 'none',
                    }}
                  >
                    B1: {item.b1Word}
                  </span>

                  <span style={{ color: 'var(--muted, #64748b)', fontSize: '0.8rem' }}>→</span>

                  {/* B2 Equivalents */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {item.b2Equivalents.map(eq => (
                      <span
                        key={eq}
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#16a34a',
                          background: 'rgba(22, 163, 74, 0.12)',
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {eq}
                      </span>
                    ))}
                  </div>

                  {/* Context Badge */}
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--muted, #64748b)' }}>
                    From: <em>{item.homeworkSource}</em>
                  </span>
                </div>

                {/* Example Comparison Sentence */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-2, #334155)', lineHeight: 1.45, marginTop: 4 }}>
                  <div style={{ fontStyle: 'italic', marginBottom: 2 }}>
                    <span style={{ color: '#059669', fontWeight: 600 }}>Upgraded In Context:</span> {item.exampleB2}
                  </div>
                </div>
              </div>

              {/* Status Action Toggle */}
              <button
                type="button"
                onClick={() => handleToggleAdopted(item.id)}
                title={isAdopted ? 'Mark as still practicing' : 'Mark as adopted in homework'}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: isAdopted ? '#16a34a' : 'rgba(2, 132, 199, 0.1)',
                  color: isAdopted ? '#ffffff' : 'var(--primary, #0284c7)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0,
                  marginTop: 2,
                }}
                data-testid={`toggle-adopted-${item.id}`}
              >
                {isAdopted ? (
                  <>
                    <Icon.check size={13} /> Adopted
                  </>
                ) : (
                  'Mark Adopted'
                )}
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--muted, #64748b)', fontSize: '0.82rem' }}>
            No matching synonym transitions found for "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}
