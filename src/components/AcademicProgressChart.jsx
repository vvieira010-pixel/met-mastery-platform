import { useEffect, useRef, useState } from 'react';

/**
 * Academic Progress widget — responsive Chart.js line chart (loaded via CDN).
 *
 * Plots daily percentage scores (Mon–Sun) for three skills:
 *   - Reading   → deep navy      #1b2a4a
 *   - Listening → soft slate blue #7d9cc4
 *   - Speaking  → emerald green   #10b981
 *
 * Calm / minimalist tone: no background grid lines, subtle axes, % tooltips.
 * The daily scores below are SAMPLE data — swap `WEEKLY_SCORES` for live values.
 */

const CDN_SRC = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

// Strict blue & emerald palette (no brown / orange / default saturated colors).
const READING = '#1b2a4a';   // deep navy
const LISTENING = '#7d9cc4'; // soft slate blue
const SPEAKING = '#10b981';  // emerald green

const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// TODO: replace with real per-student weekly data.
const WEEKLY_SCORES = {
  Reading: [72, 78, 75, 82, 80, 85, 88],
  Listening: [65, 70, 68, 72, 75, 73, 79],
  Speaking: [58, 62, 67, 64, 70, 74, 76],
};

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

const DATASETS = [
  {
    label: 'Reading',
    color: READING,
    fill: 'rgba(27, 42, 74, 0.08)',
    data: WEEKLY_SCORES.Reading,
  },
  {
    label: 'Listening',
    color: LISTENING,
    fill: 'rgba(125, 156, 196, 0.07)',
    data: WEEKLY_SCORES.Listening,
  },
  {
    label: 'Speaking',
    color: SPEAKING,
    fill: 'rgba(16, 185, 129, 0.08)',
    data: WEEKLY_SCORES.Speaking,
  },
];

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-2, #475569)' }}>
      <i style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} aria-hidden="true" />
      {label}
    </span>
  );
}

export default function AcademicProgressChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    loadChartFromCDN()
      .then(Chart => {
        if (cancelled || !canvasRef.current || !Chart) return;

        chartRef.current = new Chart(canvasRef.current, {
          type: 'line',
          data: {
            labels: LABELS,
            datasets: DATASETS.map(d => ({
              label: d.label,
              data: d.data,
              borderColor: d.color,
              backgroundColor: d.fill,
              pointBackgroundColor: d.color,
              pointBorderColor: '#ffffff',
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1f2a3d',
                titleColor: '#ffffff',
                bodyColor: '#eef1f6',
                padding: 10,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#6b7891', font: { size: 12 } },
              },
              y: {
                min: 0,
                max: 100,
                grid: { display: false },
                border: { display: false },
                ticks: {
                  color: '#6b7891',
                  font: { size: 12 },
                  stepSize: 20,
                  callback: (value) => `${value}%`,
                },
              },
            },
          },
        });

        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
        {DATASETS.map(d => (
          <LegendDot key={d.label} color={d.color} label={d.label} />
        ))}
      </div>

      <div style={{ position: 'relative', width: '100%', height: 260 }}>
        {status === 'error' && (
          <div className="student-chart-empty">Chart could not load. Check your connection.</div>
        )}
        <canvas ref={canvasRef} aria-label="Academic progress line chart: daily percentage scores for Reading, Listening, and Speaking" role="img" />
      </div>
    </div>
  );
}
