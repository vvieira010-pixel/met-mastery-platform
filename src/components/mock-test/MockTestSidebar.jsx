export default function MockTestSidebar({ total, currentIdx, answered, onJump }) {
  return (
    <nav className="mts" aria-label="Question navigation">
      <div className="mts__header">Questions</div>
      <div className="mts__grid" role="listbox" aria-orientation="vertical">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={`mts__btn ${i === currentIdx ? 'mts__btn--current' : ''} ${answered[i] ? 'mts__btn--answered' : ''}`}
            onClick={() => onJump?.(i)}
            role="option"
            aria-selected={i === currentIdx}
            aria-label={`Question ${i + 1}${answered[i] ? ', answered' : ''}${i === currentIdx ? ', current' : ''}`}
            tabIndex={i === currentIdx ? 0 : -1}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <style>{`
        .mts { width: 64px; background: var(--bg); border-right: 1px solid var(--border); padding: var(--space-3) var(--space-2); overflow-y: auto; flex-shrink: 0; }
        .mts__header { font-size: var(--text-2xs); font-weight: 700; text-transform: uppercase; color: var(--text-muted); text-align: center; margin-bottom: var(--space-2); letter-spacing: 0.05em; }
        .mts__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-1); }
        .mts__btn { height: 32px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); cursor: pointer; font-size: var(--text-2xs); font-weight: 600; color: var(--text); padding: 0; display: flex; align-items: center; justify-content: center; transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast); }
        .mts__btn:hover:not(:disabled) { border-color: var(--primary); }
        .mts__btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .mts__btn--current { border-color: var(--primary); background: var(--primary); color: #fff; }
        .mts__btn--answered { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
        .mts__btn--current.mts__btn--answered { background: var(--primary); color: #fff; }
        @media (prefers-reduced-motion: reduce) { .mts__btn { transition: none; } }
      `}</style>
    </nav>
  );
}