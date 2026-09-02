import { useState } from 'react';
import { READING_SUBJECT } from '../data/subjects/reading.js';

function SessionProgress({ percent = 65 }) {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 0 24px rgba(255, 171, 123, 0.15)',
      }}
    >
      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>trending_up</span>
        Session Progress
      </h3>
      <div className="flex justify-between items-end mb-2">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Reading Complete</span>
        <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--primary)' }}>{percent}%</span>
      </div>
      <div className="h-3 w-full rounded-full overflow-hidden mb-6" style={{ background: 'var(--surface-container)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, background: 'linear-gradient(to right, var(--primary), var(--accent))' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb), 0.2)' }}>
          <span className="block font-bold uppercase mb-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Est. Speed</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--text)' }}>240 WPM</span>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb), 0.2)' }}>
          <span className="block font-bold uppercase mb-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Accuracy</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--text)' }}>92%</span>
        </div>
      </div>
    </div>
  );
}

function SmartDictionary({ word, definition, synonyms }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 104, 119, 0.05)',
        borderTop: '4px solid var(--secondary)',
      }}
    >
      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>dictionary</span>
        Smart Dictionary
      </h3>
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-2.5" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>search</span>
        <input
          className="w-full pl-10 pr-4 py-2 rounded-lg"
          placeholder="Select word or type to search..."
          style={{
            background: 'var(--surface-container)',
            border: '1px solid rgba(var(--border-rgb), 0.3)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)',
          }}
        />
      </div>
      {word ? (
        <div className="p-4 rounded-xl" style={{ background: 'var(--surface-container)' }}>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold" style={{ color: 'var(--primary)' }}>{word}</h4>
            <button className="hover:text-primary transition-colors" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 'var(--text-sm)' }}>volume_up</span>
            </button>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{definition}</p>
          {synonyms && synonyms.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 rounded font-bold" style={{ fontSize: 'var(--text-xs)', background: 'var(--surface-container)', color: 'var(--text)' }}>Synonyms:</span>
              {synonyms.map(s => (
                <span key={s} className="px-2 py-1 rounded" style={{ fontSize: 'var(--text-xs)', background: '#fff', border: '1px solid rgba(var(--border-rgb), 0.3)', color: 'var(--text-muted)' }}>{s}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--surface-container)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Click a highlighted word in the passage to see its definition.</p>
        </div>
      )}
    </div>
  );
}

function ComprehensionQuiz({ question, options, currentIndex, total }) {
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 104, 119, 0.05)',
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>quiz</span>
          Comprehension
        </h3>
        <span
          className="px-2 py-1 rounded"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'rgba(0, 128, 147, 0.1)', color: 'var(--primary)' }}
        >
          {currentIndex + 1} of {total}
        </span>
      </div>
      <p className="font-semibold mb-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{question}</p>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <label
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
            style={{
              border: `1px solid ${selected === i ? 'var(--primary)' : 'rgba(var(--border-rgb), 0.3)'}`,
              background: selected === i ? 'rgba(0, 128, 147, 0.05)' : 'transparent',
            }}
            onClick={() => setSelected(i)}
          >
            <input
              type="radio"
              name="quiz"
              className="w-4 h-4"
              style={{ accentColor: 'var(--primary)' }}
              checked={selected === i}
              onChange={() => setSelected(i)}
            />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function StudentReading({ onBack, 'data-testid': testId }) {
  const [selectedWord, setSelectedWord] = useState(null);

  const firstUnit = READING_SUBJECT.units[0];
  const vocabWords = [
    { word: 'Adaptation', definition: 'The action or process of changing to suit a new environment or situation.', synonyms: ['Modification', 'Adjustment'] },
    { word: 'Sustainable', definition: 'Able to be maintained at a certain rate or level without depleting resources.', synonyms: ['Renewable', 'Viable'] },
    { word: 'Biological', definition: 'Relating to biology or living organisms.', synonyms: ['Organic', 'Natural'] },
  ];

  return (
    <div className="student-page student-reading-page" data-testid={testId}>
      {/* Breadcrumb */}
      <div
        className="mb-8 flex items-center gap-2 cursor-pointer w-fit transition-opacity hover:opacity-100"
        style={{ color: 'var(--primary)', opacity: 0.8 }}
        onClick={onBack}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 'var(--text-sm)' }}>arrow_back</span>
        <span className="font-bold uppercase" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.05em' }}>Back to Subjects</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reading Passage */}
        <article
          className="lg:col-span-8 rounded-2xl p-8 md:p-12 relative overflow-hidden"
          style={{
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(9, 150, 171, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 104, 119, 0.05)',
          }}
        >
          {/* Gradient accent bar */}
          <div
            className="absolute top-0 left-0 w-2 h-full"
            style={{ background: 'linear-gradient(to bottom, var(--primary), var(--primary-container))' }}
          />

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="px-3 py-1 rounded-full font-bold"
                style={{ fontSize: 'var(--text-xs)', background: 'rgba(0, 128, 147, 0.1)', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}
              >
                {firstUnit.title}
              </span>
              <span
                className="px-3 py-1 rounded-full flex items-center gap-1"
                style={{ fontSize: 'var(--text-xs)', background: 'var(--surface-container)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>timer</span>
                8 Min Read
              </span>
            </div>
            <h1
              className="mb-4"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(var(--text-2xl), 4vw, 48px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}
            >
              {firstUnit.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)', fontStyle: 'italic' }}>
              {firstUnit.whatItIs}
            </p>
          </header>

          {/* Prose Content */}
          <div className="space-y-6" style={{ fontSize: 'var(--text-lg)', lineHeight: 1.8, color: 'var(--text)' }}>
            <p>
              In recent years, the architectural landscape has undergone a profound transformation. Moving away from
              the resource-intensive practices of the 20th century, contemporary designers are increasingly prioritizing
              sustainability. This shift is not merely an aesthetic trend but a vital{' '}
              <span
                className="cursor-pointer px-1 rounded transition-colors"
                style={{ background: 'rgba(255, 171, 123, 0.2)', borderBottom: '2px dashed #FFAB7B' }}
                onClick={() => setSelectedWord(vocabWords[0])}
              >
                adaptation
              </span>{' '}
              to escalating environmental crises.
            </p>
            <p>
              One of the most significant advancements is the integration of "living materials" into building
              construction. Unlike traditional concrete and steel, which carry a heavy carbon footprint,{' '}
              <span
                className="cursor-pointer px-1 rounded transition-colors"
                style={{ background: 'rgba(255, 171, 123, 0.2)', borderBottom: '2px dashed #FFAB7B' }}
                onClick={() => setSelectedWord(vocabWords[2])}
              >
                biological
              </span>{' '}
              materials such as engineered timber and mycelium composites offer structural integrity while
              actively sequestering carbon dioxide.
            </p>
            <p>
              Furthermore, building design is becoming highly responsive to local microclimates. Utilizing passive
              design principles, modern structures are oriented to maximize natural light and ventilation, drastically
              reducing reliance on artificial heating and cooling systems.
            </p>
            {firstUnit.howToApplyIt && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{firstUnit.howToApplyIt}</p>
            )}
          </div>

          {/* Mark as Read */}
          <div className="mt-12 pt-8 flex justify-end" style={{ borderTop: '1px solid rgba(var(--border-rgb), 0.2)' }}>
            <button
              className="px-6 py-3 rounded-lg font-bold transition-colors"
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Mark as Read
            </button>
          </div>
        </article>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <SessionProgress percent={65} />
          <SmartDictionary
            word={selectedWord?.word}
            definition={selectedWord?.definition}
            synonyms={selectedWord?.synonyms}
          />
          <ComprehensionQuiz
            question="According to the passage, why are biological materials preferred over traditional concrete?"
            options={[
              'They are cheaper to mass-produce.',
              'They sequester carbon dioxide.',
              'They require less structural engineering.',
            ]}
            currentIndex={0}
            total={5}
          />
        </aside>
      </div>
    </div>
  );
}
