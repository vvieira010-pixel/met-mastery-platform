import { useState } from 'react';

const PILLARS = [
  { id: 'edu', label: 'Educational', mix: '40%', color: 'var(--primary)', bg: 'var(--primary-light)' },
  { id: 'bts', label: 'Behind Scenes', mix: '20%', color: 'var(--ink)', bg: 'var(--bg-deep)' },
  { id: 'proof', label: 'Social Proof', mix: '15%', color: 'var(--success)', bg: 'var(--success-bg)' },
  { id: 'engage', label: 'Engagement', mix: '15%', color: 'var(--accent)', bg: 'var(--accent-subtle)' },
  { id: 'promo', label: 'Promotional', mix: '10%', color: 'var(--warning-text)', bg: 'var(--warning-bg)' },
];

const WEEKLY = [
  {
    w: 1,
    items: [
      { day: 'Tue • LinkedIn', pillar: 'edu', title: 'Carousel: 4 inversion traps costing B2 nurses 6pts', format: 'Carousel' },
      { day: 'Thu • LinkedIn', pillar: 'bts', title: '22:14 feedback between shifts — how 24h works', format: 'Photo' },
      { day: 'Tue • Poll', pillar: 'engage', title: 'Poll: Scarcely ___ the lecture started?', format: 'Poll' },
      { day: 'Mon • IG Reel', pillar: 'edu', title: '30s: Scarcely had demo', format: 'Reel' },
      { day: 'Wed • IG', pillar: 'edu', title: '5 handover phrases (handover note)', format: 'Carousel' },
      { day: 'Fri • IG', pillar: 'proof', title: 'Ana 78→90% • B2→C1 in 8 weeks', format: 'Proof' },
    ],
  },
  {
    w: 2,
    items: [
      { day: 'Tue • LinkedIn', pillar: 'edu', title: 'Reading vs Listening 82% — why Part 2 fails', format: 'How-to' },
      { day: 'Thu • LinkedIn', pillar: 'engage', title: 'What’s your 12h roster hack for 20min tasks?', format: 'Question' },
      { day: 'Thu • Promo', pillar: 'promo', title: 'Free diagnostic — 3 spots Thu 19:00 (link in comment)', format: 'Promo' },
      { day: 'Mon • IG Reel', pillar: 'edu', title: 'Two-speaker handover trap (12 min)', format: 'Reel' },
      { day: 'Wed • IG', pillar: 'bts', title: 'BTS Story: grading desk', format: 'Story' },
      { day: 'Fri • IG', pillar: 'engage', title: 'Poll graphic: concurrent vs simultaneous', format: 'Poll' },
    ],
  },
  {
    w: 3,
    items: [
      { day: 'Tue • LinkedIn', pillar: 'edu', title: 'Writing: concurrent vs simultaneous', format: 'Tips' },
      { day: 'Thu • LinkedIn', pillar: 'bts', title: 'Our team debated B2 drills — here’s what we learned', format: 'Story' },
      { day: 'Thu • Framework', pillar: 'edu', title: 'Diagnose → Task → Review → Feedback loop', format: 'Carousel' },
      { day: 'Mon • IG', pillar: 'proof', title: 'Annotation: scarcely does the budget allow', format: 'Carousel' },
      { day: 'Wed • IG Reel', pillar: 'edu', title: 'Patient handover note (20 min)', format: 'Reel' },
      { day: 'Fri • IG', pillar: 'proof', title: 'Testimonial: C1 revalidation', format: 'Proof' },
    ],
  },
  {
    w: 4,
    items: [
      { day: 'Tue • LinkedIn', pillar: 'edu', title: 'COREN revalidation: B2→C1 timeline for Nov 14', format: 'Long post' },
      { day: 'Thu • LinkedIn', pillar: 'engage', title: 'Hot take: Streaks shame nurses — feedback ready > streak', format: 'Take' },
      { day: 'Thu • Promo', pillar: 'promo', title: 'Carousel: What 30-min diagnostic includes', format: 'Carousel' },
      { day: 'Mon • IG Reel', pillar: 'edu', title: '12min fits between handovers', format: 'Reel' },
      { day: 'Wed • IG', pillar: 'bts', title: 'Vinícius desk — async 24h', format: 'Reel' },
      { day: 'Fri • IG', pillar: 'proof', title: 'Before/after: 82% → C1', format: 'Proof' },
    ],
  },
];

function copy(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

export default function SocialStudio() {
  const [copied, setCopied] = useState('');
  const onCopy = (t, key) => {
    copy(t);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="page-shell" data-testid="social-studio">
      <div className="page-header">
        <div>
          <p className="v8-label" style={{ color: 'var(--primary)' }}>Social Studio • Build From Scratch</p>
          <h1 className="page-title" style={{ fontFamily: 'var(--font-serif)' }}>Founder LinkedIn + Instagram</h1>
          <p className="page-subtitle">Goal: leads → WhatsApp diagnostic. Bio: MET trainer for hospital nurses since 2018 • 30-min diagnostic → feedback in 24h</p>
          <p className="text-xs text-[var(--ink-muted)] mt-1">Assumptions: no prior presence • 2h Mon batch + 15m daily • external links in first comment (LI)</p>
        </div>
        <div className="page-toolbar">
          <a href={typeof window !== 'undefined' ? `${window.location.pathname}#dashboard` : '#dashboard'} className="btn btn-outline btn-sm">Back to Today</a>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card card-sm">
          <div className="v8-label text-[var(--text-2xs)]">Cadence</div>
          <div className="text-2xl font-bold text-[var(--ink)] mt-1">3× + 3× / week</div>
          <div className="text-xs text-[var(--ink-muted)]">LI Tue-Thu 7-9AM BRT • IG Mon/Wed/Fri</div>
        </div>
        <div className="card card-sm">
          <div className="v8-label text-[var(--text-2xs)]">Target ER</div>
          <div className="text-2xl font-bold text-[var(--primary)] mt-1">&gt;3% LI / &gt;2% IG</div>
          <div className="text-xs text-[var(--ink-muted)]">Promo capped 10% • value first</div>
        </div>
        <div className="card card-sm">
          <div className="v8-label text-[var(--text-2xs)]">Response SLA</div>
          <div className="text-2xl font-bold text-[var(--accent)] mt-1">&lt;2h</div>
          <div className="text-xs text-[var(--ink-muted)]">Pause scheduled posts on crisis • 1:1 engage 5/day</div>
        </div>
      </div>

      {/* Pillars */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--ink)]">5-Pillar Mix</h3>
          <span className="v8-label text-[var(--text-2xs)]">Educational 40 • BTS 20 • Proof 15 • Engage 15 • Promo 10</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map((p) => (
            <span key={p.id} className="pill" style={{ background: p.bg, color: p.color }}>
              {p.label} {p.mix}
            </span>
          ))}
        </div>
        <p className="text-xs text-[var(--ink-muted)] mt-3">Repurposing: 1 diagnostic breakdown → LI carousel + IG Reel + 2 quote graphics (pillar EDU). 100% promo = audience fatigue — this mix earns the right to promote.</p>
      </div>

      {/* 4-week calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {WEEKLY.map((wk) => (
          <div key={wk.w} className="card card-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-[var(--ink)]">Week {wk.w}</h4>
              <button
                type="button"
                onClick={() => onCopy(wk.items.map((i) => `${i.day}: ${i.title}`).join('\n'), `w${wk.w}`)}
                className="v8-tab-btn"
                style={{ minHeight: 32, padding: '4px 10px', fontSize: 'var(--text-2xs)' }}
                aria-label={`Copy week ${wk.w} plan`}
              >
                {copied === `w${wk.w}` ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="stack-list">
              {wk.items.map((it) => {
                const pill = PILLARS.find((p) => p.id === it.pillar);
                return (
                  <div key={it.day + it.title} className="flex items-start justify-between gap-3 p-3 rounded border border-[var(--ink-faint)] bg-[var(--bg)]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="v8-label text-[var(--text-2xs)] text-[var(--ink-muted)]">{it.day}</span>
                        <span className="pill" style={{ background: pill.bg, color: pill.color, fontSize: 'var(--text-2xs)', padding: '2px 8px' }}>{pill.label}</span>
                      </div>
                      <div className="text-sm font-medium text-[var(--ink)] mt-1 leading-snug">{it.title}</div>
                      <div className="text-xs text-[var(--ink-muted)]">{it.format}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCopy(`${it.title} — ${it.day}`, it.title)}
                      className="shrink-0 text-xs font-semibold text-[var(--primary)] hover:underline"
                    >
                      {copied === it.title ? '✓' : 'Copy'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Batch workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card card-sm">
          <h4 className="font-semibold text-[var(--ink)] mb-2">Batch Workflow (2h + 15m)</h4>
          <ol className="text-sm text-[var(--ink)] space-y-1 list-decimal list-inside leading-relaxed">
            <li><b>Fri 30m:</b> plan next week — assign pillars, pick 1 diagnostic to repurpose</li>
            <li><b>Mon 2h:</b> batch-create 6 posts (3 LI + 3 IG), schedule (Buffer/native)</li>
            <li><b>Daily 15m:</b> reply to comments, engage 5 nurse/hospital posts</li>
            <li><b>Fri 30m:</b> review ER, top post why, adjust next week</li>
          </ol>
          <p className="text-xs text-[var(--ink-muted)] mt-3">Stop rule: never maintain a platform &lt;3×/week — dormant hurts brand. Start with 2, master, then expand.</p>
        </div>
        <div className="card card-sm">
          <h4 className="font-semibold text-[var(--ink)] mb-2">Monthly Report Template</h4>
          <div className="text-xs font-mono bg-[var(--bg)] p-3 rounded border border-[var(--ink-faint)] leading-relaxed whitespace-pre-wrap">
{`LI: ___ followers (+__%)  IG: ___ (+__%)  Reach: ___
Posts: 6  Avg ER: __%  Top: [link] (___)
Pillar: EDU __% BTS __% Proof __% Engage __% Promo __%
Clicks to WA: ___  Leads: ___  DMs: ___
Next: [Priority 1] [Priority 2] [Experiment: Reels vs carousel]`}
          </div>
          <button
            type="button"
            onClick={() => onCopy('python scripts/content_calendar_generator.py --platform linkedin --weeks 4', 'cmd')}
            className="mt-3 v8-btn v8-btn-outline text-xs py-2 px-3"
          >
            {copied === 'cmd' ? 'Copied' : 'Copy: content_calendar_generator.py'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 rounded border border-[var(--ink-faint)] bg-[var(--primary-light)] text-xs text-[var(--ink)] leading-relaxed">
        <b>First post to ship (Tue 7AM):</b> Carousel “4 inversion traps costing B2 nurses 6pts” — uses <code>sampleQuestions</code> + annotation <code>landing.jsx:491</code>. Put WhatsApp link in <b>first comment</b> (LI reach rule), not body. Founder personal posts 5-10× company page.
      </div>
    </div>
  );
}
