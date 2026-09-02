import { useState } from 'react';

function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress] = useState(36);

  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 8px 24px -4px rgba(0, 101, 116, 0.12), 0 4px 12px -4px rgba(0, 101, 116, 0.08)',
      }}
    >
      {/* Decorative blur */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0, 128, 147, 0.2)' }} />

      {/* Controls Row */}
      <div className="flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-4">
          <button
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95"
            style={{
              background: 'linear-gradient(to bottom right, var(--primary-container), var(--primary))',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 32, marginLeft: isPlaying ? 0 : 2 }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <div className="flex gap-2">
            <button className="p-2 transition-colors" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} title="Skip back 10s">
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>replay_10</span>
            </button>
            <button className="p-2 transition-colors" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} title="Skip forward 10s">
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>forward_10</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>01:24 <span style={{ margin: '0 4px' }}>/</span> 03:45</span>
          <div className="h-6 w-px" style={{ background: 'var(--border)' }} />
          <button
            className="px-3 py-1 rounded-full font-bold flex items-center gap-1"
            style={{
              fontSize: 'var(--text-xs)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            1.0x <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
          </button>
        </div>
      </div>

      {/* Waveform */}
      <div
        className="w-full h-16 rounded-lg relative flex items-center px-2 overflow-hidden cursor-pointer group"
        style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb), 0.3)' }}
      >
        <div className="flex items-center gap-[2px] h-full w-full opacity-50 group-hover:opacity-80 transition-opacity">
          {Array.from({ length: 60 }, (_, i) => {
            const h = ((i * 37) % 80) + 10;
            const delay = ((i * 13) % 100) / 100;
            const isPlayed = i < Math.floor(60 * progress / 100);
            return (
              <div
                key={i}
                className="w-1.5 rounded-full"
                style={{
                  height: `${h}%`,
                  background: isPlayed ? 'var(--primary)' : 'var(--border)',
                  animationDelay: `-${delay}s`,
                  animationDuration: `${0.5 + (((i * 17) % 50) / 100)}s`,
                }}
              />
            );
          })}
        </div>
        <div className="absolute left-0 top-0 bottom-0 border-r-2" style={{ width: `${progress}%`, background: 'rgba(0, 128, 147, 0.1)', borderColor: 'var(--primary)' }} />
      </div>
    </div>
  );
}

function InteractiveTranscript({ lines }) {
  const [activeWord, setActiveWord] = useState('empirical');

  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-4"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 4px 12px rgba(101, 116, 130, 0.05)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      <div className="flex justify-between items-center mb-2 pb-2" style={{ borderBottom: '1px solid rgba(var(--border-rgb), 0.2)' }}>
        <h3 className="font-semibold flex items-center gap-2" style={{ fontSize: 18, color: 'var(--text)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-muted)' }}>closed_caption</span>
          Interactive Transcript
        </h3>
        <button className="font-bold hover:underline" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Auto-Scroll: ON
        </button>
      </div>
      <div className="space-y-4 overflow-y-auto pr-4" style={{ maxHeight: 256, fontSize: 'var(--text-lg)', lineHeight: 1.7, color: 'var(--text-muted)' }}>
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4" style={line.faded ? { opacity: 0.5 } : {}}>
            <div
              className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm shrink-0 mt-1"
              style={{
                background: line.speaker === 'S' ? 'rgba(0, 128, 147, 0.1)' : 'rgba(255, 122, 49, 0.1)',
                color: line.speaker === 'S' ? 'var(--primary)' : 'var(--secondary)',
              }}
            >
              {line.speaker}
            </div>
            <p>
              {line.words.map((w, j) => (
                <span
                  key={j}
                  className="cursor-pointer transition-all rounded px-1"
                  style={activeWord === w.toLowerCase() ? {
                    background: 'rgba(255, 219, 204, 0.8)',
                    color: '#351000',
                    fontWeight: 500,
                  } : {}}
                  onClick={() => setActiveWord(w.toLowerCase())}
                >
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComprehensionCheck({ questions }) {
  const [answers, setAnswers] = useState({});

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-4" style={{ fontSize: 'var(--text-xl)', color: 'var(--text)' }}>Comprehension Check</h3>
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div
            key={qi}
            className="rounded-xl p-6"
            style={{
              background: 'var(--surface-container)',
              border: '1px solid rgba(var(--border-rgb), 0.2)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex gap-4 items-start mb-4">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 mt-1"
                style={{ fontSize: 'var(--text-xs)', background: 'var(--surface-container)', color: 'var(--text-muted)' }}
              >
                {qi + 1}
              </span>
              <h4 className="font-medium" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{q.question}</h4>
            </div>
            <div className="space-y-3 pl-10">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                return (
                  <label
                    key={oi}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                    style={{
                      border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(var(--border-rgb), 0.3)',
                      background: isSelected ? 'rgba(0, 128, 147, 0.05)' : 'transparent',
                    }}
                    onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                  >
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 rounded" style={{ background: 'var(--primary)' }} />}
                    <input
                      type="radio"
                      name={`q${qi}`}
                      className="w-5 h-5"
                      style={{ accentColor: 'var(--primary)' }}
                      checked={isSelected}
                      onChange={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', color: isSelected ? 'var(--text)' : 'var(--text-muted)' }}>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <button
          className="font-bold py-3 px-8 rounded-lg flex items-center gap-2"
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px -2px rgba(0, 101, 116, 0.3)',
          }}
        >
          Submit Answers <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
        </button>
      </div>
    </div>
  );
}

function KeyVocabulary({ words }) {
  return (
    <div
      className="rounded-xl p-6 flex-1"
      style={{
        background: 'var(--surface-container)',
        border: '1px solid rgba(var(--border-rgb), 0.2)',
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>psychology</span>
          Key Vocabulary
        </h3>
        <button className="hover:text-primary transition-colors" style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }} title="Export List">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
        </button>
      </div>
      <ul className="space-y-3">
        {words.map((w, i) => (
          <li key={i} className="flex flex-col gap-1 p-2 rounded-md transition-colors cursor-pointer group" style={{ hover: { background: 'rgba(0, 128, 147, 0.05)' } }}>
            <div className="flex justify-between items-center">
              <span className="font-bold transition-colors group-hover:text-primary" style={{ color: 'var(--text)' }}>{w.word}</span>
              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: 16, color: 'var(--text-muted)' }}>volume_up</span>
            </div>
            <span style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.4 }}>{w.definition}</span>
          </li>
        ))}
      </ul>
      <button
        className="w-full mt-4 py-2 rounded-lg font-bold"
        style={{ fontSize: 'var(--text-xs)', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', cursor: 'pointer' }}
      >
        View All ({words.length} Words)
      </button>
    </div>
  );
}

export default function StudentListening({ onBack, 'data-testid': testId }) {

  const transcriptLines = [
    { speaker: 'S', words: ['Professor,', 'I', 'wanted', 'to', 'ask', 'about', 'the', 'methodology', 'for', 'the', 'upcoming', 'field', 'study.', 'The', 'syllabus', 'mentions', 'we', 'need', 'to', 'utilize', 'a', 'quantitative', 'approach,', 'but...'] },
    { speaker: 'P', words: ['Yes,', "that's", 'correct.', 'While', 'qualitative', 'observations', 'are', 'valuable,', 'for', 'this', 'specific', 'assignment,', 'we', 'need', 'empirical', 'data', 'to', 'support', 'the', 'hypothesis', 'regarding', 'urban', 'heat', 'islands.', 'Have', 'you', 'reviewed', 'the', 'literature', 'on', 'sensor', 'deployment?'] },
    { speaker: 'S', words: ['I', 'have,', 'but', "I'm", 'struggling', 'with', 'the', 'calibration', 'protocol', 'for', 'the', 'temperature', 'sensors', 'we', 'checked', 'out', 'from', 'the', 'lab', 'yesterday.'], faded: true },
  ];

  const quizQuestions = [
    {
      question: 'What is the primary concern the student has regarding the field study?',
      options: [
        'The theoretical framework of the hypothesis.',
        'The calibration of equipment needed for empirical data collection.',
        'Scheduling a time to deploy the sensors.',
      ],
    },
  ];

  const vocabulary = [
    { word: 'Empirical', definition: 'Based on, concerned with, or verifiable by observation or experience rather than theory.' },
    { word: 'Methodology', definition: 'A system of methods used in a particular area of study or activity.' },
    { word: 'Quantitative', definition: 'Relating to, measuring, or measured by the quantity of something.' },
    { word: 'Calibration', definition: 'The action or process of calibrating an instrument or experimental readings.' },
  ];

  return (
    <div className="student-page student-listening-page" data-testid={testId}>
      {/* Breadcrumb */}
      <div
        className="mb-8 flex items-center gap-2 cursor-pointer w-fit transition-opacity hover:opacity-100"
        style={{ color: 'var(--primary)', opacity: 0.8 }}
        onClick={onBack}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 'var(--text-sm)' }}>arrow_back</span>
        <span className="font-bold uppercase" style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.05em' }}>Back to Subjects</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Primary Practice Area */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold px-2 py-1 rounded uppercase" style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary)', background: 'rgba(255, 122, 49, 0.1)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Listening Section</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-muted)' }}>chevron_right</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Part 1: Short Conversations</span>
            </div>
            <h2 className="font-bold mb-2" style={{ fontSize: 'var(--text-2xl)', color: 'var(--text)', fontFamily: 'var(--font-serif)' }}>
              Module 4: Academic Discussions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Listen carefully to the conversation between a student and a professor regarding a research project, then answer the questions that follow.
            </p>
          </div>

          {/* Audio Player */}
          <AudioPlayer />

          {/* Transcript */}
          <InteractiveTranscript lines={transcriptLines} />

          {/* Comprehension Quiz */}
          <ComprehensionCheck questions={quizQuestions} />
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
          {/* Session Progress */}
          <div
            className="rounded-xl p-6"
            style={{
              background: 'var(--surface-glass)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(9, 150, 171, 0.1)',
              borderTop: '4px solid var(--secondary)',
            }}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>trending_up</span>
              Session Progress
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Completion</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 700 }}>60%</span>
            </div>
            <div className="w-full h-2 rounded-full mb-6 overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: '60%', background: 'linear-gradient(to right, var(--secondary), var(--secondary))' }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb), 0.2)' }}>
                <div className="font-bold uppercase mb-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Accuracy</div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--primary)' }}>85%</div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb), 0.2)' }}>
                <div className="font-bold uppercase mb-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Pace</div>
                <div className="flex justify-center items-baseline gap-1" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-muted)' }}>
                  1.2<span style={{ fontSize: 'var(--text-sm)', fontWeight: 400 }}>x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Vocabulary */}
          <KeyVocabulary words={vocabulary} />
        </div>
      </div>
    </div>
  );
}
