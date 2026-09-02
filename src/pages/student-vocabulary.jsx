import { useMemo, useState } from 'react';
import { Icon } from '../components/shared.jsx';

const STARTER_WORDS = [
  { word: 'Ubiquitous', meaning: 'Present, appearing, or found everywhere.', level: 'C1', folder: 'Recent words' },
  { word: 'Mitigate', meaning: 'Make less severe, serious, or painful.', level: 'B2', folder: 'Recent words' },
  { word: 'Paradigm', meaning: 'A typical example or pattern of something.', level: 'B2', folder: 'Recent words' },
];

const FOLDERS = ['Recent words', 'Week 3 Phrasal Verbs', 'Academic Collocations', 'Difficult Pronunciation'];

export default function StudentVocabulary({ 'data-testid': testId }) {
  const [folder, setFolder] = useState('Recent words');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);

  const words = useMemo(() => STARTER_WORDS.filter(item => item.folder === folder && item.word.toLowerCase().includes(query.trim().toLowerCase())), [folder, query]);
  const toggleSelected = (word) => setSelected(current => current.includes(word) ? current.filter(item => item !== word) : [...current, word]);

  return (
    <div className="student-vocabulary-page" data-testid={testId}>
      <aside className="student-vocabulary-sidebar" aria-label="Vocabulary folders">
        <span className="student-panel-kicker">Workspace folders</span>
        {FOLDERS.map(item => (
          <button key={item} type="button" className={folder === item ? 'is-active' : ''} onClick={() => setFolder(item)}>
            <Icon.book size={14} /> <span>{item}</span>
          </button>
        ))}
        <button type="button" className="student-vocabulary-new-folder" onClick={() => setFolder('Recent words')}>
          <Icon.plus size={14} /> New folder
        </button>
      </aside>

      <main className="student-vocabulary-main">
        <header className="student-page-header student-vocabulary-header">
          <div>
            <span className="student-panel-kicker">Vocabulary workspace</span>
            <h1>{folder}</h1>
            <p>Keep useful words together and return to them when you have a few focused minutes.</p>
          </div>
          <label className="student-vocabulary-search">
            <Icon.search size={14} />
            <span className="sr-only">Search workspace</span>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search workspace…" />
          </label>
        </header>

        <div className="student-vocabulary-toolbar">
          <label><input type="checkbox" checked={words.length > 0 && selected.length === words.length} onChange={() => setSelected(selected.length === words.length ? [] : words.map(item => item.word))} /> Select all</label>
          <span>{selected.length ? `${selected.length} selected` : `${words.length} words`}</span>
        </div>

        <div className="student-vocabulary-list">
          {words.map(item => (
            <div className={`student-vocabulary-row${selected.includes(item.word) ? ' is-selected' : ''}`} key={item.word}>
              <input type="checkbox" checked={selected.includes(item.word)} onChange={() => toggleSelected(item.word)} aria-label={`Select ${item.word}`} />
              <span className="student-vocabulary-drag" aria-hidden="true">⠿</span>
              <div className="student-vocabulary-word"><strong>{item.word}</strong><span>{item.meaning}</span></div>
              <span className="student-vocabulary-level">{item.level}</span>
              <span className="student-vocabulary-status"><Icon.clock size={12} /> Practice set</span>
            </div>
          ))}
          {!words.length && <div className="student-empty-card">No words match this folder yet. Try another folder or search.</div>}
        </div>
      </main>
    </div>
  );
}
