import { useState } from 'react';
import { SPEAKING_SUBJECT } from '../data/subjects/speaking.js';
import { MET_SPEAKING_PACK } from '../data/metSpeakingPack.js';

function ProgressRing({ value, label }) {

  return (
    <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb), 0.2)' }}>
      <span className="mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</span>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-border" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeDasharray={`${value}, 100`} strokeWidth="3" />
        </svg>
        <span className="font-bold" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{value}</span>
      </div>
    </div>
  );
}

function LiveTranscript({ lines }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold uppercase" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Live Transcript Analysis</h4>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: 'var(--secondary)', opacity: 0.75 }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--secondary)' }} />
        </span>
      </div>
      <div
        className="rounded-xl p-4 overflow-y-auto"
        style={{
          background: 'var(--surface-container)',
          border: '1px solid rgba(var(--border-rgb), 0.2)',
          maxHeight: 200,
          fontSize: 'var(--text-sm)',
          lineHeight: 1.7,
        }}
      >
        {lines.map((line, i) => (
          <p key={i}>
            {line.map((seg, j) => (
              <span
                key={j}
                className="rounded"
                style={seg.highlight ? {
                  background: seg.highlight === 'good' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 171, 123, 0.2)',
                  borderBottom: `2px solid ${seg.highlight === 'good' ? '#3D8C65' : '#FF7A31'}`,
                  padding: '0 4px',
                } : {}}
                title={seg.tip}
              >
                {seg.text}
              </span>
            ))}
          </p>
        ))}
      </div>
      <div className="flex gap-4 mt-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#3D8C65' }} /> Excellent</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#FF7A31' }} /> Needs Vocab Upgrade</div>
      </div>
    </div>
  );
}

function SessionMilestones({ milestones }) {
  return (
    <div
      className="rounded-2xl p-6 mt-auto"
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(9, 150, 171, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 101, 116, 0.05)',
      }}
    >
      <h4 className="font-bold uppercase mb-4" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Session Milestones</h4>
      <div className="space-y-3">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: 'var(--surface-container)',
              border: '1px solid rgba(0, 128, 147, 0.15)',
              opacity: m.earned ? 1 : 0.6,
            }}
          >
            <div className="p-2 rounded-lg" style={{ background: m.earned ? 'rgba(255, 122, 49, 0.1)' : 'var(--surface-container)' }}>
              <span className="material-symbols-outlined" style={{ color: m.earned ? 'var(--secondary)' : 'var(--text-muted)' }}>{m.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{m.title}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.description}</p>
            </div>
            {m.points && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--secondary)' }}>+{m.points}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentSpeaking({ onBack: _onBack, 'data-testid': testId }) {
  const [isRecording, setIsRecording] = useState(false);
  const firstUnit = SPEAKING_SUBJECT.units[0];

  const transcriptLines = [
    [
      { text: 'Well, I think green spaces are vital. ' },
      { text: 'Furthermore', highlight: 'good' },
      { text: ', they provide a place for... um... ' },
      { text: 'relaxing activities', highlight: 'vocab', tip: "Suggestion: 'recreation' or 'leisure'" },
      { text: ', which lowers stress levels across the neighborhood.' },
    ],
  ];

  const milestones = [
    { icon: 'local_fire_department', title: 'Vocabulary Streak', description: 'Used 3 advanced academic words', points: 50, earned: true },
    { icon: 'timer', title: 'Perfect Pacing', description: 'Maintain 110-130 WPM for 2 mins', points: null, earned: false },
  ];

  return (
    <div className="student-page student-speaking-page" data-testid={testId}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulation Environment */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 rounded-full font-bold" style={{ fontSize: 'var(--text-xs)', background: 'rgba(255, 122, 49, 0.1)', color: 'var(--secondary)' }}>Speaking Module</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Task 3/5</span>
              </div>
              <h2
                className="font-bold"
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--ink)',
                }}
              >
                Interactive Dialogue
              </h2>
            </div>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{
                border: '1px solid var(--text-muted)',
                color: 'var(--text-muted)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>pause</span> Pause Session
            </button>
          </div>

          {/* Simulation Canvas */}
          <div
            className="rounded-2xl p-6 flex-1 flex flex-col min-h-[500px] relative overflow-hidden"
            style={{
              background: 'var(--surface-glass)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(9, 150, 171, 0.1)',
              boxShadow: isRecording ? '0 0 15px rgba(255, 171, 123, 0.3)' : '0 4px 24px rgba(0, 101, 116, 0.05)',
            }}
          >
            {/* AI Avatar & Speech Bubble */}
            <div className="flex items-start gap-4 mb-8">
              <div className="relative w-16 h-16 shrink-0">
                <div className="absolute inset-0 rounded-full animate-pulse opacity-20" style={{ background: 'var(--primary-container)' }} />
                <div
                  className="w-full h-full rounded-full relative z-10 flex items-center justify-center"
                  style={{ background: 'var(--primary)', border: '2px solid var(--primary-container)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#fff' }}>smart_toy</span>
                </div>
                <div
                  className="absolute -bottom-1 -right-1 rounded-full p-1 shadow-sm z-20"
                  style={{ background: 'var(--surface)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>volume_up</span>
                </div>
              </div>
              <div
                className="rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-sm relative"
                style={{
                  background: 'var(--surface-container)',
                  border: '1px solid rgba(var(--border-rgb), 0.2)',
                }}
              >
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text)', lineHeight: 1.6 }}>
                  "That's an interesting point about urban planning. How do you think <span className="font-medium" style={{ color: 'var(--primary)' }}>green spaces</span> specifically impact the community's overall well-being?"
                </p>
                {/* Audio wave visualization — synced to speaking hierarchy */}
                <div className="speaking-wave flex items-end gap-1 h-4 mt-3 opacity-50" aria-hidden="true">
                  {[8, 16, 12, 4, 12, 8].map((h, i) => (
                    <div key={i} className="speaking-wave-bar w-1 rounded-full" style={{ height: h, background: 'var(--primary)', animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* User Response Area */}
            <div className="mt-auto">
              {/* Prompt Card */}
              <div
                className="rounded-xl p-4 mb-6 shadow-sm"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid rgba(0, 128, 147, 0.15)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 18 }}>lightbulb</span>
                  <h4 className="font-bold uppercase" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Prompt of the Moment</h4>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                  {firstUnit?.howToApplyIt || 'Provide two concrete examples of community benefits derived from parks, using transition words (e.g., \'Furthermore\', \'Consequently\').'}
                </p>
              </div>

              {/* Recording Control */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className={`speaking-timer ${isRecording ? 'is-recording' : ''}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: isRecording ? 'var(--danger)' : 'var(--text-muted)', marginBottom: 16, transition: 'color var(--transition-fast)' }} aria-live="polite">00:14 / 01:00</div>
                <button
                  className={`speaking-record-btn w-20 h-20 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform relative z-10 ${isRecording ? 'is-recording' : ''}`}
                  style={{
                    background: isRecording ? 'var(--danger)' : 'var(--secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-pressed={isRecording}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#fff' }}>
                    {isRecording ? 'stop' : 'mic'}
                  </span>
                </button>
                <p className="font-medium mt-4" style={{ color: 'var(--secondary)', fontSize: 'var(--text-sm)' }}>
                  {isRecording ? 'Recording...' : 'Click to Start'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Live Feedback Card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'var(--surface-glass)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(9, 150, 171, 0.1)',
              boxShadow: '0 4px 24px rgba(0, 101, 116, 0.05)',
            }}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>analytics</span>
              Real-Time Insights
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ProgressRing value={85} label="Fluency" />
              <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb), 0.2)' }}>
                <span className="mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Speech Rate</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-bold" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>124</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>WPM</span>
                </div>
                <div className="w-full h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full w-[60%] rounded-full" style={{ background: 'var(--secondary)' }} />
                </div>
              </div>
            </div>
            <LiveTranscript lines={transcriptLines} />
          </div>

          {/* Session Milestones */}
          <SessionMilestones milestones={milestones} />
        </div>
      </div>

      {/* MET Speaking Resource Pack — student-facing */}
      <div className="max-w-[1200px] mx-auto mt-8 grid grid-cols-1 gap-6">
        {/* Scoring */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(9,150,171,0.1)', boxShadow: '0 4px 24px rgba(0,101,116,0.05)' }}>
          <h3 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}><span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>grading</span> How MET Speaking Is Scored</h3>
          <p className="mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>3 categories — Task Completion, Language Resources, Intelligibility/Delivery. 0–4 scale by trained raters. Source: Michigan Language Assessment.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {MET_SPEAKING_PACK.categories.map(c => (
              <div key={c.name} className="rounded-xl p-4" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb),0.2)' }}>
                <p className="font-bold" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{c.name}</p>
                <p className="mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.what}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left" style={{ fontSize: 'var(--text-xs)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th className="py-2 px-2">Score</th>
                  <th className="py-2 px-2">Task Completion</th>
                  <th className="py-2 px-2">Language Resources</th>
                  <th className="py-2 px-2">Intelligibility / Delivery</th>
                </tr>
              </thead>
              <tbody>
                {MET_SPEAKING_PACK.scale.map(row => (
                  <tr key={row.score} style={{ borderBottom: '1px solid rgba(var(--border-rgb),0.15)', verticalAlign: 'top' }}>
                    <td className="py-3 px-2 font-bold" style={{ color: 'var(--primary)' }}>{row.score}</td>
                    <td className="py-3 px-2" style={{ color: 'var(--text)', lineHeight: 1.6 }}>{row.taskCompletion}</td>
                    <td className="py-3 px-2" style={{ color: 'var(--text)', lineHeight: 1.6 }}>{row.languageResources}</td>
                    <td className="py-3 px-2" style={{ color: 'var(--text)', lineHeight: 1.6 }}>{row.delivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks */}
        {MET_SPEAKING_PACK.tasks.map(task => (
          <div key={task.id} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(9,150,171,0.1)', boxShadow: '0 4px 24px rgba(0,101,116,0.05)' }}>
            <h4 className="font-bold" style={{ fontSize: 'var(--text-base)', color: 'var(--text)' }}>{task.title}</h4>
            <p className="mt-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{task.goal}</p>
            {task.tips && <ul className="list-disc ml-5 mt-3" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.7 }}>{task.tips.map((t,i) => <li key={i}>{t}</li>)}</ul>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl p-4" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb),0.2)' }}>
                <p className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span> Practice Alone</p>
                <ul className="list-disc ml-5 mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.7 }}>{task.practiceAlone.map((p,i) => <li key={i}>{p}</li>)}</ul>
              </div>
              {task.practiceWithPartner && (
                <div className="rounded-xl p-4" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb),0.2)' }}>
                  <p className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span> With a Partner</p>
                  <ul className="list-disc ml-5 mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.7 }}>{task.practiceWithPartner.map((p,i) => <li key={i}>{p}</li>)}</ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Language Resources */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(9,150,171,0.1)', boxShadow: '0 4px 24px rgba(0,101,116,0.05)' }}>
          <h4 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-base)', color: 'var(--text)' }}><span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>menu_book</span> Language Resources — Build Your Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb),0.2)' }}>
              <p className="font-bold" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BUILDING VOCABULARY</p>
              <ul className="list-disc ml-5 mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.7 }}>{MET_SPEAKING_PACK.languageResources.buildingVocab.map((t,i) => <li key={i}>{t}</li>)}</ul>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb),0.2)' }}>
              <p className="font-bold" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>GRAMMAR ACCURACY</p>
              <ul className="list-disc ml-5 mt-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.7 }}>{MET_SPEAKING_PACK.languageResources.grammarAccuracy.map((t,i) => <li key={i}>{t}</li>)}</ul>
              {MET_SPEAKING_PACK.languageResources.grammarExamples.map((ex,i) => (
                <div key={i} className="mt-3 rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid rgba(var(--border-rgb),0.15)' }}>
                  <p className="font-bold" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>{ex.label}</p>
                  <p className="mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Before: {ex.before}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text)' }}>After: {ex.after}</p>
                </div>
              ))}
              <p className="mt-3 italic" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{MET_SPEAKING_PACK.languageResources.selfCorrection}</p>
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(9,150,171,0.1)', boxShadow: '0 4px 24px rgba(0,101,116,0.05)' }}>
          <h4 className="font-bold flex items-center gap-2" style={{ fontSize: 'var(--text-base)', color: 'var(--text)' }}><span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>record_voice_over</span> Intelligibility / Delivery</h4>
          <p className="mt-1" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{MET_SPEAKING_PACK.delivery.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {MET_SPEAKING_PACK.delivery.techniques.map(t => (
              <div key={t.name} className="rounded-xl p-4" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb),0.2)' }}>
                <p className="font-bold" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{t.name}</p>
                <p className="mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{t.how}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 mt-4" style={{ background: 'var(--surface-container)', border: '1px solid rgba(var(--border-rgb),0.2)' }}>
            <p className="font-bold" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TRANSCRIPT MARKING KEY — use when practicing with a transcript</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {MET_SPEAKING_PACK.delivery.transcriptKey.map(k => (
                <span key={k.symbol} className="px-3 py-1 rounded-full font-mono" style={{ fontSize: 'var(--text-xs)', background: 'var(--surface)', border: '1px solid rgba(var(--border-rgb),0.2)', color: 'var(--text)' }}>{k.symbol} = {k.feature}</span>
              ))}
            </div>
            <p className="mt-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>Mark the transcript as you listen (connected sounds, pauses, stress, tone up/down). Then read aloud with those features, record, and compare to the original.</p>
          </div>
        </div>

        {/* Final tips */}
        <div className="rounded-2xl p-5 flex flex-wrap items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(0,104,119,0.08), rgba(255,122,49,0.08))', border: '1px solid rgba(9,150,171,0.15)' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>lightbulb</span>
          <p className="font-bold" style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Final routine:</p>
          {MET_SPEAKING_PACK.finalTips.map((t,i) => <span key={i} className="px-3 py-1 rounded-full" style={{ fontSize: 'var(--text-xs)', background: 'white', border: '1px solid rgba(var(--border-rgb),0.2)', color: 'var(--text-muted)' }}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}
