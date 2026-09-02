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

export default function StudentSubjects({ onOpenSubject, 'data-testid': testId }) {
  return (
    <div className="student-page student-subjects-page" data-testid={testId}>
      <header className="student-page-header">
        <div>
          <span className="student-panel-kicker">MET skills</span>
          <h1>Subjects</h1>
          <p>See what each subject asks you to do and where to focus your practice.</p>
        </div>
      </header>

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

      <div className="student-subjects-grid">
        {SUBJECTS.map(subject => {
          const SubjectIcon = subject.icon;
          return (
            <article key={subject.id} className={`student-subject-card${subject.units ? ' is-clickable' : ''}`}>
              <div className="student-subject-card-icon" aria-hidden="true"><SubjectIcon size={22} /></div>
              <div>
                {subject.units ? (
                  <button type="button" className="student-subject-card-link" onClick={() => onOpenSubject?.(subject.pageId || subject.id)}>
                    <h2>{subject.name}</h2><Icon.arrowR size={16} aria-hidden="true" />
                  </button>
                ) : <h2>{subject.name}</h2>}
                <p>{subject.description}</p>
                <div className="student-subject-card-focus">
                  <strong>Focus</strong>
                  <span>{subject.focus}</span>
                </div>
                {subject.units && <span className="student-subject-card-units-link">{subject.units.length} {subject.name} units · Open subject page</span>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
