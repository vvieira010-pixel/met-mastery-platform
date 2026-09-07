/**
 * Pill.jsx
 */

const PILL_TONE = {
  default:'pill-default', accent:'pill-accent', success:'pill-success',
  warning:'pill-warning', danger:'pill-danger', muted:'pill-muted', info:'pill-info',
  ok:'pill-success', error:'pill-danger', draft:'pill-muted', queued:'pill-info',
  reviewed:'pill-success', overdue:'pill-danger', pending:'pill-warning',
};

export function Pill({ children, tone = 'default', icon, dot, onClick, ...props }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`pill ${PILL_TONE[tone] || 'pill-default'}`} {...props}
      aria-label={typeof children === 'string' ? children : ''}
    >
      {dot && <span className="pill-dot" />}
      {icon}{children}
    </span>
  );
}
