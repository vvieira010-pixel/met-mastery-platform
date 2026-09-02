import { useState } from 'react';
import { Icon } from '../components/shared.jsx';

const LESSONS = [
  { id: 'foundation', number: '01', title: 'Build your foundation', detail: 'Core sentence control and the language needed for clear answers.', status: 'Complete' },
  { id: 'organize', number: '02', title: 'Organize longer answers', detail: 'Use examples, reasons, and linking language to make ideas easier to follow.', status: 'Complete' },
  { id: 'precision', number: '03', title: 'Improve precision', detail: 'Notice recurring grammar and vocabulary patterns in your own work.', status: 'Current' },
  { id: 'timed', number: '04', title: 'Move into timed practice', detail: 'Transfer the work into focused MET-style tasks with a clear time limit.', status: 'Next' },
  { id: 'ready', number: '05', title: 'Prepare for mock practice', detail: 'Bring your strongest skills together and review remaining gaps.', status: 'Planned' },
];

export default function StudentCurriculum({ 'data-testid': testId }) {
  const [expanded, setExpanded] = useState('precision');

  return (
    <div className="student-curriculum-page" data-testid={testId}>
      <header className="student-page-header student-curriculum-header">
        <div>
          <span className="student-panel-kicker">MET Mastery · Learning path</span>
          <h1>Your curriculum journey</h1>
          <p>A clear view of where your learning cycle has been, where it is now, and what comes next.</p>
        </div>
        <div className="student-curriculum-lesson"><span>Current lesson</span><strong>04</strong><small>Review &amp; adjust</small></div>
      </header>

      <section className="student-curriculum-map" aria-label="Curriculum map">
        {LESSONS.map((lesson, index) => {
          const isExpanded = expanded === lesson.id;
          return (
            <div className={`student-curriculum-step is-${lesson.status.toLowerCase()}${isExpanded ? ' is-expanded' : ''}`} key={lesson.id}>
              <button type="button" onClick={() => setExpanded(isExpanded ? null : lesson.id)} aria-expanded={isExpanded}>
                <span className="student-curriculum-step-number">{lesson.number}</span>
                <span className="student-curriculum-step-copy"><strong>{lesson.title}</strong><small>{lesson.status}</small></span>
                <Icon.chevronD size={15} />
              </button>
              {isExpanded && <p>{lesson.detail}</p>}
              {index < LESSONS.length - 1 && <span className="student-curriculum-connector" aria-hidden="true" />}
            </div>
          );
        })}
      </section>

      <section className="student-curriculum-legend" aria-label="Status legend">
        {['Complete', 'Current', 'Next', 'Planned'].map(status => <span key={status}><i className={`is-${status.toLowerCase()}`} /> {status}</span>)}
      </section>
    </div>
  );
}
