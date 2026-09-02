import SectionHeader from './SectionHeader.jsx';
import QuestionNav from './QuestionNav.jsx';
import MockTestTimer from './MockTestTimer.jsx';

export default function SectionShell({ 
  section, 
  children, 
  timerRunning, 
  onTimeUp, 
  onBack, 
  _student,
  _currentIdx,
  _total,
  _answered,
  _onJump,
  _onPrevious,
  _onNext,
  _onFinish,
  _answeredCount,
  _disabled = false
}) {

  return (
    <div className="mts-shell">
      <SectionHeader
        label={section.label}
        onBack={onBack}
        timer={
          <MockTestTimer
            totalSeconds={section.time}
            onTimeUp={onTimeUp}
            running={timerRunning}
            ariaLabel={`Time remaining for ${section.label}`}
          />
        }
      />
      <div className="mts-shell__body">
        <div className="mts-shell__grid">
          <QuestionNav
            total={_total}
            currentIdx={_currentIdx}
            answered={_answered}
            onJump={_onJump}
          />
          <main className="mts-shell__main" role="main">
            {children}
          </main>
        </div>
      </div>

      <style>{`
        .mts-shell { display: flex; flex-direction: column; height: 100%; min-height: 100vh; }
        .mts-shell__body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
        .mts-shell__grid { display: flex; flex: 1; overflow: hidden; min-height: 0; }
        .mts-shell__main { flex: 1; overflow-y: auto; padding: var(--space-6); background: var(--bg); min-width: 0; }
        @media (max-width: 768px) {
          .mts-shell__grid { flex-direction: column; }
          .mts-shell__main { padding: var(--space-4); }
        }
      `}</style>
    </div>
  );
}