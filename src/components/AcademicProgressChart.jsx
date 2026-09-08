import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Academic Progress widget.
 *
 * It uses the Recharts package already bundled with the app instead of adding
 * a remote Chart.js script. The app's CSP intentionally blocks third-party
 * scripts, so keeping this component local means the student dashboard works
 * both online and on restrictive school networks.
 */

const SERIES = [
  { label: 'Reading', color: 'var(--primary)' },
  { label: 'Listening', color: 'var(--success)' },
  { label: 'Speaking', color: 'var(--warning)' },
];

// TODO: replace with real per-student weekly data.
const WEEKLY_SCORES = {
  Reading: [72, 78, 75, 82, 80, 85, 88],
  Listening: [65, 70, 68, 72, 75, 73, 79],
  Speaking: [58, 62, 67, 64, 70, 74, 76],
};

const DATA = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
  day,
  Reading: WEEKLY_SCORES.Reading[index],
  Listening: WEEKLY_SCORES.Listening[index],
  Speaking: WEEKLY_SCORES.Speaking[index],
}));

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-muted, #67777B)' }}>
      <i style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} aria-hidden="true" />
      {label}
    </span>
  );
}

function ProgressTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--ink, #1A2E35)', color: 'var(--on-dark, #fff)', borderRadius: 8, padding: '8px 10px', fontSize: 'var(--text-xs, 0.75rem)', boxShadow: '0 6px 16px rgba(0,0,0,.16)' }}>
      <strong style={{ display: 'block', marginBottom: 4 }}>{label}</strong>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', lineHeight: 1.6 }}>
          <i style={{ width: 8, height: 8, borderRadius: '50%', background: entry.stroke, display: 'inline-block' }} aria-hidden="true" />
          <span>{entry.name}: {entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function AcademicProgressChart() {
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
        {SERIES.map((series) => <LegendDot key={series.label} color={series.color} label={series.label} />)}
      </div>

      <div
        role="img"
        aria-label="Academic progress area chart: daily percentage scores for Reading, Listening, and Speaking, Monday through Sunday"
        style={{ width: '100%', height: 'clamp(220px, 34vw, 300px)' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-2, #67777B)', fontSize: 12 }} />
            <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-2, #67777B)', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<ProgressTooltip />} cursor={{ stroke: 'var(--border, #dce4e7)', strokeWidth: 1 }} />
            {SERIES.map((series) => (
              <Area
                key={series.label}
                type="monotone"
                dataKey={series.label}
                name={series.label}
                stroke={series.color}
                strokeWidth={2.5}
                fill={series.color}
                fillOpacity={0.08}
                dot={{ r: 3, fill: series.color, stroke: 'var(--on-dark)', strokeWidth: 1.5 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
