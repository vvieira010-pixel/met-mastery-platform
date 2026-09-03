import { Button } from '../ui/Button.jsx';

export default function NavButtons({ 
  currentIdx, 
  total, 
  answeredCount, 
  onPrevious, 
  onNext, 
  onFinish, 
  disabled = false,
  sectionName = 'section',
  previousLabel,
  nextLabel,
  finishLabel
}) {
  const isLast = currentIdx >= total - 1;
  
  const defaultPrevious = `Previous question`;
  const defaultNext = `Next question`;
  const defaultFinish = `Finish ${sectionName}`;

  return (
    <div className="nbtn">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={currentIdx === 0 || disabled}
        className="nbtn__btn"
        aria-label={previousLabel || defaultPrevious}
      >
        {previousLabel || defaultPrevious}
      </Button>
      <div className="nbtn__progress" aria-live="polite" aria-atomic="true">
        {answeredCount} of {total} questions answered
      </div>
      {isLast ? (
        <Button
          variant="accent"
          size="sm"
          onClick={onFinish}
          disabled={disabled}
          className="nbtn__btn nbtn__btn--finish"
          aria-label={finishLabel || defaultFinish}
        >
          {finishLabel || defaultFinish}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onClick={onNext}
          disabled={disabled}
          className="nbtn__btn nbtn__btn--next"
          aria-label={nextLabel || defaultNext}
        >
          {nextLabel || defaultNext}
        </Button>
      )}
      <style>{`
        .nbtn { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding-top: var(--space-4); border-top: 1px solid var(--border); margin-top: auto; }
        .nbtn__progress { flex: 1; text-align: center; font-size: var(--text-sm); color: var(--text-muted); font-variant-numeric: tabular-nums; }
        .nbtn__btn { white-space: nowrap; }
        @media (max-width: 640px) {
          .nbtn { flex-wrap: wrap; gap: var(--space-2); }
          .nbtn__progress { order: -1; flex: 1 0 100%; text-align: left; font-size: var(--text-xs); }
          .nbtn__btn { flex: 1 1 calc(50% - var(--space-1)); min-height: 44px; }
        }
      `}</style>
    </div>
  );
}