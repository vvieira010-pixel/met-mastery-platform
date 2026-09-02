import { Icon } from '../components/shared.jsx';
import { GRAMMAR_SUBJECT } from '../data/subjects/grammar.js';

export default function StudentGrammar({ onBack, 'data-testid': testId }) {
  return (
    <div className="student-page student-reading-page" data-testid={testId}>
      <button type="button" className="student-reading-back" onClick={onBack}><Icon.arrowL size={15} /> Back to Subjects</button>
      <header className="student-page-header student-reading-header">
        <span className="student-panel-kicker">MET skill · Grammar</span>
        <h1>Grammar foundations</h1>
        <p>{GRAMMAR_SUBJECT.description}</p>
      </header>
      <section className="student-reading-unit-list" aria-label="Grammar units">
        {GRAMMAR_SUBJECT.units.map(unit => (
          <details key={unit.unit} className="student-reading-unit" open={unit.unit === 1}>
            <summary><span className="student-reading-unit-number">{String(unit.unit).padStart(2, '0')}</span><span className="student-reading-unit-title">{unit.title}</span><Icon.chevronDown size={16} /></summary>
            <div className="student-reading-unit-content"><div><strong>What it is</strong><p>{unit.whatItIs}</p></div><div><strong>How to apply it</strong><p>{unit.howToApplyIt}</p></div></div>
          </details>
        ))}
      </section>
    </div>
  );
}
