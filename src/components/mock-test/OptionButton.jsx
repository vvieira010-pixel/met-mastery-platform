export default function OptionButton({ 
  letter, 
  children, 
  selected, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) {
  return (
    <button
      type="button"
      className={`opt-btn ${selected ? 'opt-btn--selected' : ''} ${disabled ? 'opt-btn--disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      {...props}
    >
      <span className="opt-btn__letter" aria-hidden="true">{letter}</span>
      <span className="opt-btn__text">{children}</span>
      <style>{`
        .opt-btn {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          font: inherit;
          font-size: var(--text-base);
          color: var(--text);
          transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .opt-btn:hover:not(.opt-btn--disabled) { border-color: var(--primary); }
        .opt-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .opt-btn--disabled { opacity: 0.5; cursor: not-allowed; }
        .opt-btn--selected { 
          border-color: var(--primary); 
          background: var(--primary-light); 
          color: var(--text);
        }
        .opt-btn__letter { 
          width: 28px; 
          height: 28px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border-radius: 50%; 
          background: var(--bg); 
          font-weight: 700; 
          font-size: var(--text-sm); 
          flex-shrink: 0; 
          border: 1.5px solid var(--border);
          transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
        }
        .opt-btn--selected .opt-btn__letter { 
          background: var(--primary); 
          color: #fff; 
          border-color: var(--primary);
        }
        .opt-btn__text { flex: 1; line-height: 1.5; }
        @media (prefers-reduced-motion: reduce) { .opt-btn, .opt-btn__letter { transition: none; } }
      `}</style>
    </button>
  );
}