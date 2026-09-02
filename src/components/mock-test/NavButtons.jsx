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
    </div>
  );
}