import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Academic Progress widget — responsive Chart.js line chart (CDN, loaded once).
 *
 * Brand section-coding (matches MetProgressPathGraph.jsx so the two dashboard
 * charts stay visually coherent, and follows the DESIGN.md "section coding" rule):
 *   Reading   → teal   #2D7A8C
 *   Listening → green  #3D8C65
 *   Speaking  → amber  #E08E45
 * No navy / periwinkle / slate — this resolves the D3 "4th palette" brand break.
 *
 * Axis + tooltip colours are resolved from CSS tokens at render time, so the
 * chart follows the active light/dark theme automatically.
 */

const CDN_SRC = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

const SERIES = [
  { label: 'Reading',   color: '#2D7A8C', rgb: '45, 122, 140' },
  { label: 'Listening', color: '#3D8C65', rgb: '61, 140, 101' },
  { label: 'Speaking',  color: '#E08E45', rgb: '224, 142, 69' },
];

const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// TODO: replace with real per-student weekly data.
const WEEKLY_SCORES = {
  Reading:   [72, 78, 75, 82, 80, 85, 88],
  Listening: [65, 70, 68, 72, 75, 73, 79],
  Speaking:  [58, 62, 67, 64, 70, 74, 76],
};

/** Resolve a CSS custom property from :root, with a sane fallback. */
function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** Load Chart.js (UMD) from CDN exactly once per page. */
function loadChartFromCDN() {
  return new Promise((resolve, reject) => {
    if (window.Chart) return resolve(window.Chart);
    const existing = document.querySelector(`script[src="${CDN_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Chart));
      existing.addEventListener('error', () => reject(new Error('Failed to load Chart.js')));
      return;
    }
    const script = document.createElement('script');
    script.src = CDN_SRC;
    script.async = true;
    script.onload = () => resolve(window.Chart);
    script.onerror = () => reject(new Error('Failed to load Chart.js from CDN'));
    document.head.appendChild(script);
  });
}

/** Build Chart.js options, resolving theme colours from CSS tokens. */
function buildOptions() {
  const tickColor = cssVar('--text-2', '#67777B');
  const tooltipBg = cssVar('--ink', '#1A2E35');
  const tooltipText = cssVar('--on-dark', '#FFFFFF');
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: reduceMotion ? false : { duration: 650, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: tickColor, font: { size: 12 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: tickColor,
          font: { size: 12 },
          stepSize: 20,
          callback: (value) => `${value}%`,
        },
      },
    },
  };
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-muted, #67777B)' }}>
      <i style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} aria-hidden="true" />
      {label}
    </span>
  );
}

export default function AcademicProgressChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  const draw = useCallback(() => {
    if (!canvasRef.current || !window.Chart) return;
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: LABELS,
        datasets: SERIES.map((s) => ({
          label: s.label,
          data: WEEKLY_SCORES[s.label],
          borderColor: s.color,
          backgroundColor: `rgba(${s.rgb}, 0.10)`,
          pointBackgroundColor: s.color,
          pointBorderColor: '#ffffff',
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
        })),
      },
      options: buildOptions(),
    });
    setStatus('ready');
  }, []);

  const load = useCallback(() => {
    setStatus('loading');
    loadChartFromCDN()
      .then((Chart) => {
        window.Chart = Chart;
        draw();
      })
      .catch(() => setStatus('error'));
  }, [draw]);

  useEffect(() => {
    let cancelled = false;
    loadChartFromCDN()
      .then((Chart) => {
        if (cancelled || !Chart) return;
        window.Chart = Chart;
        draw();
      })
      .catch(() => { if (!cancelled) setStatus('error'); });

    // Recolour axis/tooltip text when the theme flips (dark mode is a known pain point).
    const observer = new MutationObserver(() => {
      if (!chartRef.current) return;
      const opts = buildOptions();
      const { scales, plugins } = chartRef.current.options;
      scales.x.ticks.color = opts.scales.x.ticks.color;
      scales.y.ticks.color = opts.scales.y.ticks.color;
      plugins.tooltip.backgroundColor = opts.plugins.tooltip.backgroundColor;
      plugins.tooltip.titleColor = opts.plugins.tooltip.titleColor;
      plugins.tooltip.bodyColor = opts.plugins.tooltip.bodyColor;
      chartRef.current.update('none');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    return () => {
      cancelled = true;
      observer.disconnect();
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [draw]);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
        {SERIES.map((s) => (
          <LegendDot key={s.label} color={s.color} label={s.label} />
        ))}
      </div>

      <div style={{ position: 'relative', width: '100%', height: 'clamp(220px, 34vw, 300px)' }}>
        {status === 'loading' && (
          <div
            className="student-chart-skeleton"
            style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'var(--bg-2, rgba(0,0,0,0.04))' }}
            aria-hidden="true"
          />
        )}
        {status === 'error' && (
          <div
            className="student-chart-empty"
            role="alert"
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center' }}
          >
            <span>Chart could not load. Check your connection.</span>
            <button type="button" className="btn btn--secondary" onClick={load} style={{ minHeight: 44 }}>
              Retry
            </button>
          </div>
        )}
        <canvas
          ref={canvasRef}
          aria-label="Academic progress line chart: daily percentage scores for Reading, Listening, and Speaking, Monday through Sunday"
          role="img"
        />
      </div>
    </div>
  );
}
