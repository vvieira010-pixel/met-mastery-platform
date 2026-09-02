import { useState } from 'react';
import { WRITING_SUBJECT } from '../data/subjects/writing.js';

function TaskInstructions({ unit }) {
  return (
    <section
      className="rounded-xl p-6 relative overflow-hidden"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 101, 116, 0.05)',
      }}
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'var(--secondary)' }} />
      <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>assignment</span>
        <h2 className="font-bold" style={{ fontSize: 'var(--text-lg)' }}>Task Instructions</h2>
      </div>
      <div style={{ fontSize: 'var(--text-lg)', lineHeight: 1.7, color: 'var(--text-muted)' }}>
        <p className="font-bold mb-2" style={{ color: 'var(--text)' }}>Writing Prompt: {unit?.title || 'Sustainable Urban Development'}</p>
        <p>{unit?.howToApplyIt || 'Write an argumentative essay (300-400 words) discussing whether cities should prioritize green infrastructure over traditional economic expansion. Support your argument with specific examples.'}</p>
      </div>
    </section>
  );
}

function WritingArea() {
  const [text, setText] = useState('');
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const maxWords = 400;

  return (
    <section
      className="rounded-xl flex flex-col"
      style={{
        height: 500,
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 101, 116, 0.05)',
      }}
    >
      {/* Editor Toolbar */}
      <div
        className="flex flex-wrap gap-2 items-center p-3 rounded-t-xl"
        style={{ borderBottom: '1px solid rgba(var(--border-rgb), 0.2)', background: 'var(--surface-container)' }}
      >
        {['format_bold', 'format_italic', 'format_underlined'].map(icon => (
          <button key={icon} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
          </button>
        ))}
        <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />
        {['format_list_bulleted', 'format_list_numbered'].map(icon => (
          <button key={icon} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(0, 128, 147, 0.1)',
            color: 'var(--primary)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bar_chart</span>
          <span>Word Count: {wordCount} / {maxWords}</span>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        className="flex-1 w-full bg-transparent border-none p-6 resize-none focus:ring-0"
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text)',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
        }}
        placeholder="Start typing your essay here..."
        value={text}
        onChange={e => setText(e.target.value)}
      />

      {/* Footer Actions */}
      <div
        className="p-4 flex justify-end gap-4 rounded-b-xl"
        style={{ borderTop: '1px solid rgba(var(--border-rgb), 0.2)', background: 'var(--surface-container)' }}
      >
        <button
          className="px-6 py-2 rounded-lg font-bold uppercase tracking-wide"
          style={{
            fontSize: 'var(--text-xs)',
            border: '1px solid var(--text)',
            color: 'var(--text)',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Save Draft
        </button>
        <button
          className="px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all uppercase tracking-wide flex items-center gap-2"
          style={{
            fontSize: 'var(--text-xs)',
            background: 'linear-gradient(to right, var(--text), var(--primary-container))',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Submit for Review
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
        </button>
      </div>
    </section>
  );
}

function SessionProgress() {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 0 20px rgba(255, 122, 49, 0.15)',
        borderColor: 'rgba(255, 122, 49, 0.3)',
      }}
    >
      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>timer</span>
        Session Progress
      </h3>
      <div className="flex justify-between items-end mb-2">
        <span className="font-bold uppercase" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Time Spent</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)' }}>12:45</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 128, 147, 0.1)' }}>
        <div className="h-full rounded-full" style={{ width: '33%', background: 'var(--secondary)' }} />
      </div>
    </div>
  );
}

function KeyPoints({ points }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 101, 116, 0.05)',
      }}
    >
      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>checklist</span>
        Key Points to Cover
      </h3>
      <ul className="space-y-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 20, color: 'var(--secondary)' }}>radio_button_unchecked</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SmartSuggestions() {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: 'linear-gradient(to bottom, var(--surface), rgba(0, 128, 147, 0.1))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 101, 116, 0.05)',
        borderTop: '4px solid var(--primary-container)',
      }}
    >
      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--primary)' }}>
        <span className="material-symbols-outlined">lightbulb</span>
        Smart Suggestions
      </h3>
      <div className="mb-4">
        <h4 className="font-bold uppercase mb-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Vocabulary Upgrade</h4>
        <div className="flex flex-wrap gap-2">
          {['Sustainable', 'Integration', 'Viability'].map(word => (
            <span
              key={word}
              className="px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
              style={{
                background: 'rgba(0, 128, 147, 0.05)',
                border: '1px solid rgba(0, 128, 147, 0.2)',
                color: 'var(--primary)',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-bold uppercase mb-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Transition Words</h4>
        <div className="flex flex-wrap gap-2">
          {['Furthermore', 'Consequently', 'Conversely'].map(word => (
            <span
              key={word}
              className="px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
              style={{
                background: 'rgba(255, 122, 49, 0.1)',
                border: '1px solid rgba(255, 122, 49, 0.3)',
                color: 'var(--secondary)',
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentWriting({ onBack: _onBack, 'data-testid': testId }) {
  const firstUnit = WRITING_SUBJECT.units[0];

  const keyPoints = [
    "Define 'green infrastructure' vs 'traditional expansion'.",
    'Provide 2 clear benefits of your chosen stance.',
    'Address one potential counterargument.',
    'Conclude with a strong summarizing statement.',
  ];

  return (
    <div className="student-page student-writing-page" data-testid={testId}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <TaskInstructions unit={firstUnit} />
          <WritingArea />
        </div>

        {/* Right Insight Panel */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <SessionProgress />
          <KeyPoints points={keyPoints} />
          <SmartSuggestions />
        </aside>
      </div>
    </div>
  );
}
