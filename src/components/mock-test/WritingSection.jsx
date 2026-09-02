import { useState, useCallback, useEffect } from 'react';
import { WRITING_TASKS as DEFAULT_TASKS } from '../../data/mock-test-1/writing.js';
import { STORAGE_KEYS } from './constants.js';
import NavButtons from './NavButtons.jsx';

export default function WritingSection({ onComplete, writingData }) {
  const WRITING_TASKS = writingData?.TASKS || DEFAULT_TASKS;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [texts, setTexts] = useState({});

  const { task1, task2 } = WRITING_TASKS;
  const pages = [
    ...task1.questions.map((q, i) => ({ type: 'short', ...q, pageIdx: i })),
    { type: 'essay', ...task2, pageIdx: task1.questions.length },
  ];
  const total = pages.length;
  const page = pages[currentIdx];

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SECTION_ANSWERS('writing')) || '{}');
      if (Object.keys(saved).length > 0) setTexts(saved);
    } catch {}
  }, []);

  const persistTexts = useCallback((newTexts) => {
    try { sessionStorage.setItem(STORAGE_KEYS.SECTION_ANSWERS('writing'), JSON.stringify(newTexts)); } catch {}
  }, []);

  const handleChange = useCallback((id, value) => {
    setTexts(prev => {
      const next = { ...prev, [id]: value };
      persistTexts(next);
      return next;
    });
  }, [persistTexts]);

  const wordCount = (id) => {
    const t = texts[id] || '';
    return t.trim() === '' ? 0 : t.trim().split(/\s+/).length;
  };

  const handleFinish = useCallback(() => {
    onComplete(texts);
  }, [texts, onComplete]);

  const isEssay = page.type === 'essay';
  const label = isEssay ? 'Task 2 — Formal Essay' : `Task 1 — Short Response (${page.pageIdx + 1} of 3)`;

  return (
    <div className="ws">
      <div className="ws__main">
        <div className="ws__header">
          <span className="pill pill-primary ws__label">{label}</span>
        </div>

        <p className="ws__prompt">{page.text || page.prompt}</p>

        <textarea
          className="input ws__textarea"
          rows={page.rows || 10}
          value={texts[page.id] || ''}
          onChange={(e) => handleChange(page.id, e.target.value)}
          placeholder="Write your answer here..."
          aria-label={label}
        />

        <div className="ws__wordcount" aria-live="polite">{wordCount(page.id)} words</div>

        <NavButtons
          currentIdx={currentIdx}
          total={total}
          answeredCount={Object.keys(texts).length}
          sectionName="Writing section"
          onPrevious={() => setCurrentIdx(i => i - 1)}
          onNext={() => setCurrentIdx(i => i + 1)}
          onFinish={handleFinish}
        />
      </div>
      <style>{`
        .ws { display: flex; justify-content: center; padding: var(--space-6) var(--space-5); }
        .ws__main { max-width: 720px; width: 100%; display: flex; flex-direction: column; gap: var(--space-4); }
        .ws__label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .ws__prompt { font-size: var(--text-base); line-height: 1.7; color: var(--text); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-4); margin: 0; }
        .ws__textarea { min-height: 200px; }
        .ws__wordcount { font-size: var(--text-sm); color: var(--text-muted); text-align: right; }
      `}</style>
    </div>
  );
}