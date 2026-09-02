import { useState, useRef, useCallback } from 'react';

const PADDING = { top: 8, right: 8, bottom: 28, left: 32 };

function SimpleBarChart({ data, width = '100%', height = '100%', margin }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const pad = margin
    ? { top: PADDING.top + (margin.top || 0), right: PADDING.right + (margin.right || 0), bottom: PADDING.bottom + (margin.bottom || 0), left: PADDING.left + (Math.abs(margin.left) || 0) }
    : PADDING;

  const handleBarEnter = useCallback((e, item) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 8,
      item,
    });
  }, []);

  if (!data || data.length === 0) return null;

  const maxVal = 100;
  const innerW = 100 - pad.left - pad.right;
  const innerH = 100 - pad.top - pad.bottom;
  const barGap = Math.max(1, Math.min(3, innerW / data.length * 0.15));
  const barW = Math.max(4, (innerW - barGap * (data.length - 1)) / data.length);

  const ticks = [0, 25, 50, 75, 100];
  const gridLines = ticks.map(t => ({ y: pad.top + innerH * (1 - t / maxVal), label: t }));

  return (
    <div style={{ position: 'relative', width, height, minHeight: 140 }}>
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={pad.left} y1={g.y} x2={pad.left + innerW} y2={g.y} stroke="var(--divider)" strokeWidth="0.3" strokeDasharray="2 2" />
            <text x={pad.left - 1.5} y={g.y + 0.8} textAnchor="end" fill="var(--text-muted)" fontSize="3" fontFamily="var(--font-sans)">{g.label}</text>
          </g>
        ))}

        <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="var(--divider)" strokeWidth="0.3" />

        {data.map((item, i) => {
          const x = pad.left + i * (barW + barGap);
          const devH = (item.development / maxVal) * innerH;
          const confH = item.confidence != null ? (item.confidence / maxVal) * innerH : 0;
          const confX = x + barW * 0.5;

          return (
            <g key={i} onMouseEnter={(e) => handleBarEnter(e, item)} style={{ cursor: 'pointer' }}>
              {item.confidence != null && (
                <rect
                  x={confX}
                  y={pad.top + innerH - confH}
                  width={barW * 0.45}
                  height={confH}
                  fill="var(--accent)"
                  rx="0.8"
                  opacity="0.85"
                />
              )}
              <rect
                x={x}
                y={pad.top + innerH - devH}
                width={barW * 0.55}
                height={devH}
                fill="var(--primary)"
                rx="0.8"
              />
              <text
                x={x + barW / 2}
                y={pad.top + innerH + 3.5}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="2.5"
                fontFamily="var(--font-sans)"
              >
                {item.name.length > 8 ? item.name.slice(0, 7) + '..' : item.name}
              </text>
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.item.name}</div>
          <div style={{ color: 'var(--primary)' }}>Development: {tooltip.item.development}%</div>
          {tooltip.item.confidence != null && (
            <div style={{ color: 'var(--accent)' }}>Confidence: {tooltip.item.confidence}%</div>
          )}
          {tooltip.item.type && (
            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{tooltip.item.type}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SimpleBarChart;
