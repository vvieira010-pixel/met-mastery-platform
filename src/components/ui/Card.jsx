/**
 * Card — surface primitive.
 *
 * `bezel` adds the "Double-Bezel" (Doppelrand) look — a white plate sitting in a
 * thin tinted tray with an outer hairline — using a stacked box-shadow ring.
 * This is DOM-free, so the card's own layout/flow (including flex square-cards)
 * is never disturbed. Interactive cards keep their handlers/aria on the element.
 */
export function Card({
  children,
  style,
  className = '',
  small,
  onClick,
  padding,
  ariaLabel,
  as,
  bezel = false,
  ...rest
}) {
  const baseCls = [
    'card',
    small ? 'card-sm' : '',
    bezel ? 'bezel' : '',
    className,
  ].filter(Boolean).join(' ');

  const mergedStyle = {
    ...(padding != null ? { padding } : {}),
    ...style,
  };

  if (as === 'div' && onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={baseCls}
        style={mergedStyle}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
          }
        }}
        aria-label={ariaLabel}
        {...rest}
      >
        {children}
      </div>
    );
  }

  if (onClick && as !== 'div') {
    return (
      <button type="button" className={baseCls} style={mergedStyle} onClick={onClick} aria-label={ariaLabel} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <div className={baseCls} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
}

export default Card;
