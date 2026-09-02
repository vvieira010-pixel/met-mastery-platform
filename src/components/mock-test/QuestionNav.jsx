import { useEffect, useRef } from 'react';

export default function QuestionNav({ 
  total, 
  currentIdx, 
  answered, 
  onJump, 
  partBoundaries = [],
  partLabels = { 1: 'Part 1', 2: 'Part 2', 3: 'Part 3' },
  sectionName = 'section',
  ariaLabel = "Question navigation"
}) {
  const gridRef = useRef(null);

  useEffect(() => {
    const btn = gridRef.current?.querySelector(`[data-index="${currentIdx}"]`);
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentIdx]);

  const handleKeyDown = (e, index) => {
    let newIndex = null;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(index + 2, total - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(index - 2, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(index + 1, total - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(index - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = total - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onJump?.(index);
        break;
    }
    if (newIndex !== null) {
      const targetBtn = gridRef.current?.querySelector(`[data-index="${newIndex}"]`);
      targetBtn?.focus();
    }
  };

  return (
    <nav className="qnav" aria-label={ariaLabel} ref={gridRef}>
      <div className="qnav__header">
        <span>{sectionName}</span>
        <span className="qnav__count">{currentIdx + 1} / {total}</span>
      </div>
      <div className="qnav__grid" role="listbox" aria-orientation="vertical">
        {Array.from({ length: total }, (_, i) => {
          const boundary = partBoundaries?.find(b => b.startIdx === i);
          return (
            <div key={i} className="qnav__item">
              {boundary && (
                <div className="qnav__part-label" aria-hidden="true">
                  {partLabels[boundary.part] || `Part ${boundary.part}`}
                </div>
              )}
              <button
                data-index={i}
                className={`qnav__btn ${i === currentIdx ? 'qnav__btn--current' : ''} ${answered[i] ? 'qnav__btn--answered' : ''}`}
                onClick={() => onJump?.(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                role="option"
                aria-selected={i === currentIdx}
                aria-label={`Question ${i + 1}${answered[i] ? ', answered' : ''}${i === currentIdx ? ', current' : ''}`}
                tabIndex={i === currentIdx ? 0 : -1}
              >
                {i + 1}
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        .qnav { width: 64px; background: var(--bg); border-right: 1px solid var(--border); padding: var(--space-3) var(--space-2); overflow-y: auto; flex-shrink: 0; }
        .qnav__header { display: flex; justify-content: space-between; align-items: center; font-size: var(--text-2xs); font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--space-2); letter-spacing: 0.05em; }
        .qnav__count { font-variant-numeric: tabular-nums; font-family: var(--font-mono); }
        .qnav__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-1); }
        .qnav__item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .qnav__part-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); text-align: center; padding: var(--space-1) 0 2px; width: 100%; }
        .qnav__btn { width: 100%; height: 32px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); cursor: pointer; font-size: var(--text-2xs); font-weight: 600; color: var(--text); display: flex; align-items: center; justify-content: center; transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast); }
        .qnav__btn:hover:not(:disabled) { border-color: var(--primary); }
        .qnav__btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .qnav__btn--current { border-color: var(--primary); background: var(--primary); color: #fff; }
        .qnav__btn--answered { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
        .qnav__btn--current.qnav__btn--answered { background: var(--primary); color: #fff; }
        @media (prefers-reduced-motion: reduce) { .qnav__btn { transition: none; } }
      `}</style>
    </nav>
  );
}