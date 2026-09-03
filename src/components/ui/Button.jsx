import React from 'react';

/**
 * Button — pill CTA with the "button-in-button" trailing icon (nested circle)
 * and island hover physics (translate + scale on press). Spring transitions are
 * provided globally via --transition-* tokens. API is backward-compatible with
 * the previous { children, variant, size, icon, onClick, disabled, type, block }.
 *
 * When `icon` is provided it is rendered inside its own circular wrapper
 * (trailing by default) instead of sitting naked next to the label.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  type = 'button',
  block,
  icon,
  iconPosition = 'trailing',
  style,
  className = '',
}) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    block ? 'btn-block' : '',
    icon ? 'btn--has-icon' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconEl = icon ? (
    <span className="btn-icon" aria-hidden="true">{icon}</span>
  ) : null;

  const content = (
    <>
      {iconPosition === 'leading' && iconEl}
      <span className="btn-label">{children}</span>
      {iconPosition === 'trailing' && iconEl}
    </>
  );

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} style={style}>
      {content}
    </button>
  );
}

export default Button;
