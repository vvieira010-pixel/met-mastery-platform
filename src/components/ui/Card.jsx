export function Card({ children, style, className = '', small, onClick, padding, ariaLabel, as, bezel: _bezel, ...rest }) {
  const cls = `card ${small ? 'card-sm' : ''} ${className}`.trim();
  const mergedStyle = { ...(padding != null ? { padding } : {}), ...style };

  if (as === 'div' && onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={cls}
        style={mergedStyle}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } }}
        aria-label={ariaLabel}
        {...rest}
      >
        {children}
      </div>
    );
  }

  if (onClick && as !== 'div') {
    return (
      <button type="button" className={cls} style={mergedStyle} onClick={onClick} aria-label={ariaLabel} {...rest}>
        {children}
      </button>
    );
  }

  return <div className={cls} style={mergedStyle} {...rest}>{children}</div>;
}
