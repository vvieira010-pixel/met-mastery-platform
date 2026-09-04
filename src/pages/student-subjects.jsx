import { useState } from 'react';
import { Icon } from '../components/shared.jsx';
import { READING_SUBJECT } from '../data/subjects/reading.js';
import { SPEAKING_SUBJECT } from '../data/subjects/speaking.js';
import { GRAMMAR_SUBJECT } from '../data/subjects/grammar.js';
import { LISTENING_SUBJECT } from '../data/subjects/listening.js';
import { WRITING_SUBJECT } from '../data/subjects/writing.js';
import { VOCABULARY_SUBJECT } from '../data/subjects/vocabulary.js';
import { STUDY_TIPS } from '../data/studyTips.js';

const SUBJECTS = [
  {
    id: 'reading',
    name: 'Reading',
    icon: Icon.book,
    description: READING_SUBJECT.description,
    focus: 'Read for purpose, evidence, and meaning in context.',
    units: READING_SUBJECT.units,
  },
  {
    id: 'listening',
    name: 'Listening',
    icon: Icon.headset,
    focus: 'Listen for the point, the details, and what the speaker intends.',
    description: LISTENING_SUBJECT.description,
    units: LISTENING_SUBJECT.units,
    pageId: 'listening-subject',
  },
  {
    id: 'speaking',
    name: 'Speaking',
    icon: Icon.mic,
    description: SPEAKING_SUBJECT.description,
    focus: 'Plan quickly, speak clearly, and keep your answer moving.',
    units: SPEAKING_SUBJECT.units,
    pageId: 'speaking-subject',
  },
  {
    id: 'writing',
    name: 'Writing',
    icon: Icon.edit,
    focus: 'Make your ideas easy to follow from the first sentence to the last.',
    description: WRITING_SUBJECT.description,
    units: WRITING_SUBJECT.units,
    pageId: 'writing-subject',
  },
  {
    id: 'grammar',
    name: 'Grammar',
    icon: Icon.spark,
    focus: 'Notice how grammar changes meaning, time, and relationships between ideas.',
    description: GRAMMAR_SUBJECT.description,
    units: GRAMMAR_SUBJECT.units,
    pageId: 'grammar-subject',
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary',
    icon: Icon.star,
    focus: 'Learn words in context so you can understand and use them with confidence.',
    description: VOCABULARY_SUBJECT.description,
    units: VOCABULARY_SUBJECT.units,
    pageId: 'vocabulary-subject',
  },
];

const TOTAL_TOPICS = SUBJECTS.reduce((total, subject) => total + subject.units.length, 0);

export default function StudentSubjects({ onOpenSubject, 'data-testid': testId }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [view, setView] = useState('topics');
  const [selectedUnitNumber, setSelectedUnitNumber] = useState(null);
  const selectedSubject = SUBJECTS.find(subject => subject.id === selectedSubjectId);
  const selectedUnit = selectedSubject?.units.find(unit => unit.unit === selectedUnitNumber);

  const openSubject = subject => {
    setSelectedSubjectId(subject.id);
    setSelectedUnitNumber(null);
    setView('topics');
    onOpenSubject?.(subject.pageId || subject.id);
  };

  if (selectedSubject) {
    const SubjectIcon = selectedSubject.icon;
    return (
      <div className="student-page student-subjects-page" data-testid={testId}>
        <button type="button" className="student-reading-back" onClick={() => { setSelectedSubjectId(null); setSelectedUnitNumber(null); }}><Icon.arrowL size={15} /> Back to Subjects</button>
        <header className="student-page-header student-reading-header">
          <span className="student-panel-kicker">MET subject</span>
          <h1><SubjectIcon size={22} /> {selectedSubject.name}</h1>
          <p>{selectedSubject.description}</p>
        </header>
        <nav className="tabs-line" aria-label={`${selectedSubject.name} content`}>
          {['topics', 'explanations'].map(tab => (
            <button
              key={tab}
              type="button"
              className={`tab-line${view === tab ? ' active' : ''}`}
              onClick={() => {
                setView(tab);
                setSelectedUnitNumber(null);
              }}
            >
              {tab === 'topics' ? 'Topics' : 'Explanations'}
            </button>
          ))}
        </nav>
        {view === 'topics' ? (
          <section className="student-reading-unit-list" aria-label={`${selectedSubject.name} topics`}>
            {selectedSubject.units.map(unit => (
              <button
                key={unit.unit}
                type="button"
                className="student-reading-unit"
                onClick={() => {
                  setSelectedUnitNumber(unit.unit);
                  setView('explanations');
                }}
              >
                <span className="student-reading-unit-number">{String(unit.unit).padStart(2, '0')}</span>
                <span className="student-reading-unit-title">{unit.title}</span>
                <Icon.arrowR size={16} />
              </button>
            ))}
          </section>
        ) : (
          <section className="student-reading-unit-list" aria-label={`${selectedSubject.name} explanations`}>
            {selectedUnit ? (
              <>
                <article className="student-reading-unit student-reading-unit--explanation">
                  <div className="student-reading-unit-content">
                    <span className="student-panel-kicker">Topic {String(selectedUnit.unit).padStart(2, '0')}</span>
                    <h2>{selectedUnit.title}</h2>
                    <div><strong>What it is</strong><p>{selectedUnit.whatItIs}</p></div>
                    <div><strong>How to apply it</strong><p>{selectedUnit.howToApplyIt}</p></div>
                  </div>
                </article>
                <button type="button" className="student-subject-all-explanations" onClick={() => setSelectedUnitNumber(null)}>
                  View all {selectedSubject.units.length} topic explanations
                </button>
              </>
            ) : selectedSubject.units.map(unit => (
              <article key={unit.unit} className="student-reading-unit student-reading-unit--explanation">
                <h2>{unit.title}</h2>
                <div className="student-reading-unit-content">
                  <div><strong>What it is</strong><p>{unit.whatItIs}</p></div>
                  <div><strong>How to apply it</strong><p>{unit.howToApplyIt}</p></div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="student-page student-subjects-page" data-testid={testId}>
      <header className="student-page-header student-subjects-hero">
        <div className="student-subjects-hero-copy">
          <span className="student-panel-kicker">MET skills</span>
          <h1>Build your MET map.</h1>
          <p>Use Subjects to understand each skill, learn the strategies behind it, and choose a focused place to practise next.</p>
          <div className="student-subjects-hero-actions" aria-label="Subjects overview">
            <span><strong>{SUBJECTS.length}</strong> MET skills</span>
            <span><strong>{TOTAL_TOPICS}</strong> topic explanations</span>
            <span><strong>B1–B2</strong> study tips</span>
          </div>
        </div>
        <aside className="student-subjects-guide" aria-labelledby="subjects-guide-heading">
          <span className="student-panel-kicker">A simple way to use this page</span>
          <h2 id="subjects-guide-heading">Learn → notice → practise</h2>
          <ol>
            <li><strong>Choose a skill</strong><span>Start with the area you want to understand better.</span></li>
            <li><strong>Open a topic</strong><span>Read what it is and how to apply it on the MET.</span></li>
            <li><strong>Take it to Practice</strong><span>Use a focused exercise when you are ready to try.</span></li>
          </ol>
        </aside>
      </header>

      <div className="student-subjects-section-heading">
        <div>
          <span className="student-panel-kicker">Choose a skill</span>
          <h2>What do you want to work on?</h2>
        </div>
        <p>Each subject includes explanations and topic-by-topic guidance. You can return here whenever you need to refresh a strategy.</p>
      </div>

      <div className="student-subjects-grid">
        {SUBJECTS.map(subject => {
          const SubjectIcon = subject.icon;
          const firstTopic = subject.units[0]?.title;
          return (
            <article key={subject.id} className="student-subject-card">
              <button type="button" className="student-subject-card-action" aria-label={`Open ${subject.name} topics`} onClick={() => openSubject(subject)} />
              <div className="student-subject-card-icon" aria-hidden="true"><SubjectIcon size={22} /></div>
              <div>
                <div className="student-subject-card-link"><h2>{subject.name}</h2><Icon.arrowR size={16} aria-hidden="true" /></div>
                <p>{subject.description}</p>
                <div className="student-subject-card-focus">
                  <strong>Focus</strong>
                  <span>{subject.focus}</span>
                </div>
                <div className="student-subject-card-meta">
                  <span>{subject.units.length} topics</span>
                  <span>Starts with: {firstTopic}</span>
                </div>
                <span className="student-subject-card-units-link">Open {subject.name} reference →</span>
              </div>
            </article>
          );
        })}
      </div>

      <section className="student-study-tips" aria-labelledby="study-tips-heading">
        <div className="student-study-tips-header">
          <span className="student-panel-kicker">How to study</span>
          <h2 id="study-tips-heading">5 Study Tips — B1–B2</h2>
          <p>Short, repeatable habits that make the 62 units stick. Pick one and start today.</p>
        </div>
        <div className="student-study-tips-grid">
          {STUDY_TIPS.map(tip => (
            <article key={tip.id} className="student-study-tip-card">
              <div className="student-study-tip-card-head">
                <h3>{tip.title}</h3>
                <span className="student-study-tip-time">{tip.time}</span>
              </div>
              <p className="student-study-tip-what">{tip.whatItIs}</p>
              <p className="student-study-tip-how">{tip.howToApplyIt}</p>
              <span className="student-study-tip-level">{tip.level}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
