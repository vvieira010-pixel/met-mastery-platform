import { useState } from 'react';
import { VOCABULARY_SUBJECT } from '../data/subjects/vocabulary.js';

function Flashcard({ word, type, definition, example, synonyms, isFlipped, onClick }) {
  return (
    <button
      type="button"
      className="vocab-flashcard w-full h-80 cursor-pointer relative z-10"
      onClick={onClick}
      aria-expanded={isFlipped}
      aria-label={isFlipped ? `Hide definition for ${word}` : `Show definition for ${word}`}
      style={{ perspective: 1000 }}
    >
      <div
        className="w-full h-full relative shadow-md rounded-xl"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
        }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full rounded-xl flex flex-col justify-center items-center p-8"
          style={{
            backfaceVisibility: 'hidden',
            background: 'var(--surface-container)',
            border: '1px solid rgba(var(--border-rgb), 0.2)',
          }}
        >
          <span className="mb-4 uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--secondary)' }}>{type}</span>
          <h3 className="text-center mb-6" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-serif)' }}>{word}</h3>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Click to reveal definition and examples</p>
        </div>
        {/* Back */}
        <div
          className="absolute w-full h-full rounded-xl flex flex-col justify-center items-center p-8"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--primary)',
            color: '#fff',
          }}
        >
          <h4 className="mb-4" style={{ fontSize: 'var(--text-2xl)', color: 'rgba(255,255,255,0.9)' }}>Definition</h4>
          <p className="text-center mb-6" style={{ fontSize: 'var(--text-lg)', maxWidth: 500 }}>{definition}</p>
          {example && (
            <div className="w-full max-w-md rounded-lg p-4 mb-4" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
              <p className="italic text-center">"{example}"</p>
            </div>
          )}
          {synonyms && synonyms.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {synonyms.map(s => (
                <span key={s} className="px-3 py-1 rounded-full font-bold" style={{ fontSize: 'var(--text-xs)', background: 'var(--secondary)', color: '#fff' }}>{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function QuickQuiz({ questions }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <section
      className="rounded-xl p-6 shadow-sm"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>bolt</span>
          Quick Quiz
        </h2>
        <div className="flex items-center gap-3 w-1/3">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{current + 1}/{questions.length}</span>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 128, 147, 0.1)' }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--secondary)' }} />
          </div>
        </div>
      </div>
      <div className="rounded-lg p-6 shadow-sm" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb), 0.1)' }}>
        <p className="font-medium mb-6" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{q.question}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className="text-left px-6 py-4 rounded-lg transition-all font-medium"
              style={{
                border: `2px solid ${selected === i ? 'var(--primary)' : 'rgba(var(--border-rgb), 0.2)'}`,
                background: selected === i ? 'rgba(0, 128, 147, 0.05)' : 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
              onClick={() => {
                setSelected(i);
                if (i === q.correct) {
                  setTimeout(() => {
                    setCurrent(c => Math.min(c + 1, questions.length - 1));
                    setSelected(null);
                  }, 1000);
                }
              }}
            >
              <span className="relative z-10">{String.fromCharCode(65 + i)}. {opt}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function WordOfTheDay() {
  return (
    <section
      className="rounded-xl p-6 shadow-lg relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom right, var(--text), var(--primary-container))',
        color: '#fff',
      }}
    >
      {/* Decorative */}
      <div className="absolute -right-10 -top-10 opacity-10">
        <span className="material-symbols-outlined" style={{ fontSize: 120 }}>lightbulb</span>
      </div>
      <h2 className="mb-2 uppercase tracking-wider font-bold relative z-10" style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.8)' }}>Word of the Day</h2>
      <h3 className="mb-1 relative z-10" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Ephemeral</h3>
      <p className="mb-4 relative z-10" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)' }}>/əˈfem(ə)rəl/ • Adjective</p>
      <div className="rounded-lg p-4 mb-4 relative z-10" style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ fontSize: 'var(--text-sm)' }}>Lasting for a very short time; transient.</p>
      </div>
      <p className="italic mb-6 relative z-10" style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.9)' }}>"Fashions are ephemeral, but style is eternal."</p>
      <button
        className="w-full font-bold py-2 rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2 relative z-10"
        style={{ background: '#fff', color: 'var(--text)', border: 'none', cursor: 'pointer' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Add to My List
      </button>
    </section>
  );
}

function RecentWords({ words }) {
  return (
    <section
      className="rounded-xl p-6 shadow-sm flex-grow flex flex-col"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>Recent Words</h2>
        <button className="font-medium hover:underline" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(var(--border-rgb), 0.3)' }}>
              <th className="py-3 px-2 font-bold uppercase" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Word</th>
              <th className="py-3 px-2 font-bold uppercase text-right" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Mastery</th>
            </tr>
          </thead>
          <tbody>
            {words.map((w, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(var(--border-rgb), 0.1)' }}>
                <td className="py-3 px-2 font-medium" style={{ color: 'var(--text)' }}>{w.word}</td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {[1, 2, 3].map(star => (
                      <span
                        key={star}
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 14,
                          color: star <= w.mastery ? 'var(--secondary)' : 'var(--border)',
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StudentVocabularyFoundations({ onBack: _onBack, 'data-testid': testId }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const firstUnit = VOCABULARY_SUBJECT.units[0];

  const flashcard = {
    word: firstUnit?.title || 'Adaptation',
    type: 'Noun',
    definition: 'The process of change by which an organism or species becomes better suited to its environment.',
    example: 'The evolutionary adaptation allowed the species to survive the harsh winter.',
    synonyms: ['Adjustment', 'Modification', 'Evolution'],
  };

  const quizQuestions = [
    {
      question: 'Which word best fits the sentence: "The sheer ___ of the mountain peak made the climb extremely dangerous."',
      options: ['Altruism', 'Precipice', 'Banality', 'Ubiquity'],
      correct: 1,
    },
    {
      question: 'The word "ubiquity" means:',
      options: ['Rare occurrence', 'Being present everywhere', 'Extreme kindness', 'A sharp cliff'],
      correct: 1,
    },
  ];

  const recentWords = [
    { word: 'Paradigm', mastery: 3 },
    { word: 'Cognitive', mastery: 2 },
    { word: 'Empirical', mastery: 1 },
    { word: 'Synthesize', mastery: 3 },
    { word: 'Ambiguous', mastery: 1 },
  ];

  return (
    <div className="student-page student-vocabulary-page" data-testid={testId}>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="mb-2" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-serif)' }}>Vocabulary Builder</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)' }}>Master complex academic terms to elevate your performance.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Flashcard & Quiz */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Flashcard Module */}
          <section
            className="rounded-xl p-6 shadow-lg relative overflow-hidden"
            style={{
              background: 'var(--surface-glass)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 104, 119, 0.1)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom right, rgba(0, 128, 147, 0.05), transparent)' }} />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>style</span>
                Current Deck: Academic Core
              </h2>
              <span className="px-3 py-1 rounded-full" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'var(--text-muted)', color: '#fff' }}>Card 1 / {VOCABULARY_SUBJECT.units.length}</span>
            </div>

            <Flashcard {...flashcard} isFlipped={isFlipped} onClick={() => setIsFlipped(!isFlipped)} />

            <div className="flex justify-between items-center mt-6 relative z-10">
              <button className="flex items-center gap-2 font-medium transition-colors" style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span> Previous
              </button>
              <div className="flex gap-4">
                <button className="px-6 py-2 rounded-lg font-medium transition-colors" style={{ background: 'var(--surface-container)', color: 'var(--text)', border: 'none', cursor: 'pointer' }}>Needs Review</button>
                <button className="px-6 py-2 rounded-lg font-bold shadow-md transition-colors" style={{ background: 'var(--secondary)', color: '#fff', border: 'none', cursor: 'pointer' }}>Mastered</button>
              </div>
              <button className="flex items-center gap-2 font-medium transition-colors" style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Next <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Quick Quiz */}
          <QuickQuiz questions={quizQuestions} />
        </div>

        {/* Right Column: Insight Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <WordOfTheDay />
          <RecentWords words={recentWords} />
        </div>
      </div>
    </div>
  );
}
