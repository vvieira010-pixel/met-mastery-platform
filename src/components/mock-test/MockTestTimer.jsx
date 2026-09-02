import { useState, useEffect, useRef } from 'react';

export default function MockTestTimer({ 
  totalSeconds, 
  onTimeUp, 
  running = true,
  initialRemaining,
  onTimeChange,
  sectionName = 'section',
}) {
  const [remaining, setRemaining] = useState(initialRemaining ?? totalSeconds);
  const intervalRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);
  const prevRemainingRef = useRef(remaining);

  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  useEffect(() => {
    if (initialRemaining !== undefined) {
      setRemaining(initialRemaining);
    }
  }, [initialRemaining]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    onTimeChange?.(remaining);
  }, [remaining, onTimeChange]);

  // Announce time warnings to screen readers
  useEffect(() => {
    if (remaining <= 60 && remaining > 0 && prevRemainingRef.current > 60) {
      // Time entered warning zone
    }
    if (remaining <= 30 && prevRemainingRef.current > 30) {
      // Time entered critical zone
    }
    if (remaining === 0 && prevRemainingRef.current > 0) {
      // Time up
    }
    prevRemainingRef.current = remaining;
  }, [remaining]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const display = `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const isWarning = remaining <= 60 && remaining > 0;
  const isCritical = remaining <= 30 && remaining > 0;

  const timerLabel = `${sectionName}: ${display} remaining`;

  return (
    <div className="mtt" role="timer" aria-live="polite" aria-label={timerLabel} aria-atomic="true">
      <div className="mtt__bar-wrapper">
        <div className="mtt__bar-bg" aria-hidden="true">
          <div 
            className={`mtt__bar-fill ${isWarning ? 'mtt__bar-fill--warn' : ''} ${isCritical ? 'mtt__bar-fill--critical' : ''}`}
            style={{ transform: `scaleX(${Math.max(0, pct / 100)})` }}
          />
        </div>
      </div>
      <span className={`mtt__time ${isWarning ? 'mtt__time--warn' : ''} ${isCritical ? 'mtt__time--critical' : ''}`}>
        {display}
      </span>
      <style>{`
        .mtt { display: flex; align-items: center; gap: var(--space-3); min-width: 180px; }
        .mtt__bar-wrapper { flex: 1; min-width: 80px; }
        .mtt__bar-bg { height: 6px; background: var(--border); border-radius: var(--radius-full); overflow: hidden; }
        .mtt__bar-fill { height: 100%; width: 100%; background: var(--primary); border-radius: var(--radius-full); transition: transform 1s linear, background-color var(--transition-base); transform-origin: left; }
        .mtt__bar-fill--warn { background: var(--warning); }
        .mtt__bar-fill--critical { background: var(--danger); }
        .mtt__time { font-variant-numeric: tabular-nums; font-weight: 700; font-size: var(--text-base); color: var(--text); min-width: 5.5ch; text-align: right; font-family: var(--font-mono); }
        .mtt__time--warn { color: var(--warning); }
        .mtt__time--critical { color: var(--danger); }
        @media (prefers-reduced-motion: reduce) { .mtt__bar-fill { transition: none; } }
      `}</style>
    </div>
  );
}