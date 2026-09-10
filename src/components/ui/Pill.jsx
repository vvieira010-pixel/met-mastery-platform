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
  // Only claim the button role / accept focus when there is actually a handler.
  // Previously role="button" + tabIndex={0} were applied unconditionally, so purely
  // decorative status pills polluted the tab order AND announced as buttons that
  // could not be activated (no onKeyDown) — a WCAG 2.1.1 keyboard failure.
  const interactive = typeof onClick === 'function';
  const label = typeof children === 'string' && children ? children : undefined;

  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      className={`pill ${PILL_TONE[tone] || 'pill-default'}`} {...props}
      aria-label={label}
    >
      {dot && <span className="pill-dot" />}
      {icon}{children}
    </span>
  );
}
