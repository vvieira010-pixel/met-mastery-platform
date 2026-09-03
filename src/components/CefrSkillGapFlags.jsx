import { Icon } from './shared.jsx';
import { getCefrTier } from '../lib/cefr-tier.js';

export default function CefrSkillGapFlags({
  snapshot = [],
  diagnoses = [],
  className = '',
  'data-testid': testId = 'cefr-skill-gap-flags',
}) {
  // Extract or normalize skill sections
  const sections = ['listening', 'reading', 'speaking', 'writing'];

  const normalizedScores = sections.map(sec => {
    // Look in snapshot first
    const fromSnap = (snapshot || []).find(s => (s.section || '').toLowerCase() === sec);
    if (fromSnap && Number(fromSnap.score_0_80) > 0) {
      return {
        section: sec,
        label: sec.charAt(0).toUpperCase() + sec.slice(1),
        score: Number(fromSnap.score_0_80),
        nextStep: fromSnap.next_step || '',
      };
    }

    // Look in diagnoses
    for (const dx of diagnoses) {
      const snap = dx?.content?.section_snapshot;
      if (Array.isArray(snap)) {
        const item = snap.find(s => (s.section || '').toLowerCase() === sec);
        if (item && Number(item.score_0_80) > 0) {
          return {
            section: sec,
            label: sec.charAt(0).toUpperCase() + sec.slice(1),
            score: Number(item.score_0_80),
            nextStep: item.next_step || '',
          };
        }
      }
    }

    // Default sample scores if student has no data yet
    const defaults = { listening: 54, reading: 60, speaking: 48, writing: 44 };
    return {
      section: sec,
      label: sec.charAt(0).toUpperCase() + sec.slice(1),
      score: defaults[sec] || 48,
      nextStep: '',
    };
  });

  // Check for skill discrepancies
  // Simple blue for B1 (<53), Emerald green for B2 (>=53)
  const evaluatedItems = normalizedScores.map(item => {
    const tier = getCefrTier(item.score);
    return {
      ...item,
      tier,
      color: tier.isB2 ? '#10b981' : '#0284c7', // emerald green vs simple blue
      colorName: tier.isB2 ? 'emerald' : 'blue',
      badgeBg: tier.isB2 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.12)',
    };
  });

  const b2Skills = evaluatedItems.filter(i => i.tier.isB2);
  const b1Skills = evaluatedItems.filter(i => !i.tier.isB2);

  // Detect discrepancies
  const hasDiscrepancy = b2Skills.length > 0 && b1Skills.length > 0;

  // Find max and min
  const sorted = [...evaluatedItems].sort((a, b) => b.score - a.score);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const scoreDiff = highest.score - lowest.score;

  return (
    <div
      className={`cefr-skill-gap-flags ${className}`}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
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
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--primary, #0284c7)',
              }}
            >
              CEFR Skill Gap Flags
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
              MET 4-Section Comparative Mapping
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
            Skill Profile & Focus Allocation
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted, #64748b)' }}>
            Emerald green denotes MET B2 passing standard (53+); simple blue flags B1 developing sections needing focused effort.
          </p>
        </div>

        {/* Color Legend */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.74rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <strong style={{ color: '#059669' }}>B2 Passing (≥ 53)</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
            <strong style={{ color: '#0284c7' }}>B1 Developing (&lt; 53)</strong>
          </div>
        </div>
      </div>

      {/* Discrepancy Flag Banner */}
      {hasDiscrepancy ? (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            borderLeft: '4px solid #f59e0b',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
          data-testid="skill-gap-alert"
        >
          <div style={{ color: '#d97706', marginTop: 2, flexShrink: 0 }}>
            <Icon.alert size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <strong style={{ fontSize: '0.85rem', color: '#92400e' }}>
                Skill Gap Flag: {highest.tier.code} {highest.label} ({highest.score}) vs {lowest.tier.code} {lowest.label} ({lowest.score})
              </strong>
              <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.2)', color: '#b45309', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                {scoreDiff} pt differential
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#78350f', lineHeight: 1.45 }}>
              Your {highest.label} section ({highest.score}/80) demonstrates solid B2 readiness. However, your {lowest.label} section ({lowest.score}/80) is currently at the {lowest.tier.code} threshold. To pass the MET, focus your immediate practice on {lowest.label} to eliminate this gap.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            borderLeft: '4px solid #10b981',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon.check size={18} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.8rem', color: '#065f46' }}>
            <strong>Balanced Skill Profile:</strong> All sections are progressing evenly across the CEFR spectrum.
          </span>
        </div>
      )}

      {/* 4 Section Progress Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
        {evaluatedItems.map(item => {
          const percent = Math.min(100, Math.round((item.score / 80) * 100));
          const isEmerald = item.tier.isB2;

          return (
            <div
              key={item.section}
              style={{
                background: 'var(--bg, #f8fafc)',
                border: `1px solid ${isEmerald ? 'rgba(16, 185, 129, 0.3)' : 'rgba(2, 132, 199, 0.3)'}`,
                borderRadius: 10,
                padding: '14px',
                position: 'relative',
              }}
            >
              {/* Card Top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: item.badgeBg,
                    color: item.color,
                  }}
                >
                  {item.tier.code}
                </span>
              </div>

              {/* Scaled Score Indicator */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color }}>
                  {item.score}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted, #64748b)' }}>/ 80 scaled</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
                  {item.score >= 53 ? 'Passing Standard Met' : `${53 - item.score} pts to B2`}
                </span>
              </div>

              {/* Progress Bar with Benchmark Line */}
              <div style={{ position: 'relative', width: '100%', height: 8, background: 'var(--border, #e2e8f0)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: 999,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {/* B2 Benchmark Reference Marker */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--muted, #64748b)' }}>
                <span>0</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>53 (B2 Pass)</span>
                <span>80</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
