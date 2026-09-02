import { useState, useEffect } from 'react';

const navLinks = [
  { href: '#about', label: 'The MET' },
  { href: '#features', label: 'Features' },
  { href: '#platform-preview', label: 'Inside the Platform' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#faq', label: 'FAQ' },
];

const WHATSAPP_URL = 'https://wa.me/5511997801708?text=Hi%20Vin%C3%ADcius%2C%20I%20want%20to%20book%20a%20MET%20diagnostic.';

const featuresList = [
  {
    num: '01',
    title: 'Start with a diagnosis',
    description: 'Identify the skills that need the most attention before deciding what to practise next.',
  },
  {
    num: '02',
    title: 'Practise with purpose',
    description: 'Work on focused reading, listening, writing, speaking, grammar, and vocabulary tasks.',
  },
  {
    num: '03',
    title: 'Use timed practice',
    description: 'Build familiarity with MET-style tasks and use timed practice when it is the right next step.',
  },
  {
    num: '04',
    title: 'Review what matters',
    description: 'Return to useful vocabulary and language points so important work is not forgotten after one session.',
  },
  {
    num: '05',
    title: 'Receive clear feedback',
    description: 'Understand what worked, what needs attention, and which exercise should come next.',
  },
  {
    num: '06',
    title: 'See your next step',
    description: 'Keep homework, feedback, practice, and progress in one calm learning workspace.',
  },
];

const processSteps = [
  {
    num: '01',
    title: 'Diagnose',
    description: 'Start by looking at your current strengths, gaps, and MET goal.',
  },
  {
    num: '02',
    title: 'Practise',
    description: 'Use focused tasks instead of trying to improve every skill at the same time.',
  },
  {
    num: '03',
    title: 'Review',
    description: 'Use feedback to choose the next exercise, then return to the next class.',
  },
  {
    num: '04',
    title: 'Continue',
    description: 'Iterate through the learning loop until you hit your target score.',
  },
];

const faqs = [
  {
    q: 'What is the Michigan English Test (MET)?',
    a: 'The MET is a standardized English proficiency exam developed by Michigan Language Assessment, recognized by universities and employers worldwide. It tests reading, listening, grammar, and writing skills at B1 to C2 levels.',
  },
  {
    q: 'How long does MET preparation take?',
    a: 'It depends on your current level, target level, test date, and how consistently you can practise. A diagnostic is the best place to create a realistic plan.',
  },
  {
    q: 'Which skills can I practise?',
    a: 'MET Mastery supports focused work in reading, listening, writing, speaking, grammar, and vocabulary.',
  },
  {
    q: 'Will I receive teacher feedback?',
    a: 'Teacher feedback is available for work that needs human evaluation. Your next step should always be clear: review, correct, practise, or ask a question.',
  },
  {
    q: 'Can I prepare if I have a test date soon?',
    a: 'Yes. Tell us your test date when you book your diagnostic so the preparation plan can focus on the most useful next steps.',
  },
  {
    q: 'How do I start?',
    a: 'Send a WhatsApp message to book a MET diagnostic. You will discuss your current level, target, and preparation needs before choosing the right next step.',
  },
];

// Sample Interactive Question for the Hero & Platform Preview
const sampleQuestions = [
  {
    id: 'q1',
    skill: 'Grammar (Inversion)',
    level: 'CEFR B2/C1',
    prompt: 'Scarcely ______ the lecture started when the alarm sounded.',
    options: [
      { id: 'a', text: 'had', correct: true },
      { id: 'b', text: 'was', correct: false },
      { id: 'c', text: 'did', correct: false },
      { id: 'd', text: 'would', correct: false },
    ],
    explanation:
      'Correct! After negative or restrictive adverbials like "scarcely" or "hardly", we use inversion with past perfect ("scarcely had + subject + past participle").',
  },
  {
    id: 'q2',
    skill: 'Academic Collocation',
    level: 'CEFR C1',
    prompt: 'The university board reached a ______ decision to approve the revised scholarship guidelines.',
    options: [
      { id: 'a', text: 'unanimous', correct: true },
      { id: 'b', text: 'unified', correct: false },
      { id: 'c', text: 'solitary', correct: false },
      { id: 'd', text: 'singular', correct: false },
    ],
    explanation:
      'Correct! "Reach a unanimous decision" is the standard collocated phrase when all committee members are in complete agreement.',
  },
];

export default function LandingPage({ onMemberSignIn, onDemoAccess, "data-testid": testId }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Hero interactive preview state
  const [heroTab, setHeroTab] = useState('plan'); // 'plan' | 'diagnostic' | 'exercise'
  const [heroSelectedOption, setHeroSelectedOption] = useState(null);
  const [heroAnswerChecked, setHeroAnswerChecked] = useState(false);

  // Showcase section state — distilled to 2 tabs (diagnostic + feedback)
  const [showcaseTab, setShowcaseTab] = useState('feedback'); // 'diagnostic' | 'feedback'
  const [practiceQuestionIdx, setPracticeQuestionIdx] = useState(0);
  const [practiceSelectedOpt, setPracticeSelectedOpt] = useState(null);
  const [practiceChecked, setPracticeChecked] = useState(false);

  // Interactive student checklist inside showcase
  const [studentTasks, setStudentTasks] = useState([
    { id: 't1', title: 'Listening Part 2: Two-speaker conversation', tag: 'Listening', time: '12 min', done: true },
    { id: 't2', title: 'Grammar Drill: Negative inversion structures', tag: 'Grammar', time: '15 min', done: false },
    { id: 't3', title: 'Writing Task 1: Formal academic proposal', tag: 'Writing', time: '25 min', done: false },
    { id: 't4', title: 'Vocabulary Review: 15 spaced repetition items', tag: 'Vocab', time: '8 min', done: false },
  ]);

  const toggleTask = (id) => {
    setStudentTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const target = document.getElementById(id);
    if (target) {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' });
    }
  };

  const currentPracticeQ = sampleQuestions[practiceQuestionIdx];

  return (
    <div className="v8-landing" data-testid={testId}>
      <a href="#main" className="skip-nav">
        Skip to content
      </a>
      {/* --- Navigation --- */}
      <nav className={`v8-nav ${scrolled ? 'shadow-xs' : ''}`} aria-label="Primary">
        <a href="#" className="v8-logo">
          MET <span>Mastery</span>
        </a>

        <div className="v8-nav-links hidden md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(l.href.slice(1));
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            data-testid="landing-preview-teacher-btn"
            onClick={() =>
              onDemoAccess?.({
                role: 'teacher',
                email: 'vvieira010@gmail.com',
                displayName: 'Vinícius (Teacher)',
              })
            }
            className="v8-btn-portal hidden lg:inline-flex"
            title="Preview Teacher Workspace"
          >
            <span>🎓 Teacher Portal</span>
          </button>
          <button
            type="button"
            data-testid="landing-preview-student-btn"
            onClick={() =>
              onDemoAccess?.({
                role: 'student',
                studentId: 'st_1',
                email: 'ana.silva@example.com',
                displayName: 'Ana Silva',
              })
            }
            className="v8-btn-portal hidden lg:inline-flex"
            title="Preview Student Workspace"
          >
            <span>👤 Student Portal</span>
          </button>

          <button
            type="button"
            onClick={onMemberSignIn}
            className="v8-btn v8-btn-outline"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
          >
            Sign in
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2 min-h-[44px] min-w-[44px] bg-transparent border-none cursor-pointer z-50 text-[var(--ink)]"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span
              className={`block w-5 h-0.5 bg-[var(--ink)] transition-transform duration-200 ${
                mobileOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-[var(--ink)] transition-opacity duration-150 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-[var(--ink)] transition-transform duration-200 ${
                mobileOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            id="mobile-nav-drawer"
            className="fixed inset-0 top-[80px] bg-[var(--bg)]/98 backdrop-blur-md z-50 flex flex-col p-6 gap-6 md:hidden border-t border-[var(--ink-faint)] overflow-y-auto"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(l.href.slice(1));
                  }}
                  className="text-lg font-medium text-[var(--ink)] no-underline opacity-80 hover:opacity-100"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--ink-faint)] flex flex-col gap-3">
              <span className="v8-label opacity-60">Portal Previews</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onDemoAccess?.({
                      role: 'teacher',
                      email: 'vvieira010@gmail.com',
                      displayName: 'Vinícius (Teacher)',
                    });
                  }}
                  className="v8-btn-portal justify-center py-2.5"
                >
                  🎓 Teacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onDemoAccess?.({
                      role: 'student',
                      studentId: 'st_1',
                      email: 'ana.silva@example.com',
                      displayName: 'Ana Silva',
                    });
                  }}
                  className="v8-btn-portal justify-center py-2.5"
                >
                  👤 Student
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onMemberSignIn?.();
                }}
                className="v8-btn v8-btn-outline w-full mt-2"
                style={{ padding: '0.8rem 1.5rem' }}
              >
                Sign in to Account
              </button>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Book a MET diagnostic via WhatsApp — from mobile menu"
                className="v8-btn v8-btn-primary w-full text-center mt-1"
                style={{ padding: '0.9rem 1.5rem' }}
              >
                Book a MET diagnostic
              </a>
            </div>
          </div>
        )}
      </nav>

      <main id="main">
        {/* --- Hero --- */}
        <section className="v8-hero">
          <div className="v8-hero-content">
            <div className="v8-label">For nurses on 12-hour rosters • B1–C2</div>
            <h1>
              Pass the MET <em>without quitting shifts</em>
            </h1>
            <p>
              Diagnostic → focused tasks that fit between handovers → teacher feedback in 24h.
              Built for night-shift nurses, not generic prep.
            </p>

            <div className="btn-group flex items-center gap-4 flex-wrap">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Book a MET diagnostic via WhatsApp — from hero"
                className="v8-btn v8-btn-primary"
              >
                Book a MET diagnostic
              </a>
              <a
                href="#platform-preview"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('platform-preview');
                }}
                className="v8-btn v8-btn-outline"
              >
                See the platform
              </a>
            </div>
            <div className="mt-4 text-[var(--text-2xs)] text-[var(--ink-muted)] leading-snug max-w-[42ch]">
              30-min Zoom diagnostic, free — with Vinícius, MET trainer for hospital staff since 2018 • async feedback in 24h, no fixed class
            </div>

            <div className="portal-previews">
              <span className="v8-label" style={{ display: 'block', opacity: 0.5 }}>
                Preview Live Portals:
              </span>
              <button
                type="button"
                data-testid="hero-preview-teacher-btn"
                onClick={() =>
                  onDemoAccess?.({
                    role: 'teacher',
                    email: 'vvieira010@gmail.com',
                    displayName: 'Vinícius (Teacher)',
                  })
                }
                className="v8-btn-portal"
              >
                🎓 Teacher Portal
              </button>
              <button
                type="button"
                data-testid="hero-preview-student-btn"
                onClick={() =>
                  onDemoAccess?.({
                    role: 'student',
                    studentId: 'st_1',
                    email: 'ana.silva@example.com',
                    displayName: 'Ana Silva',
                  })
                }
                className="v8-btn-portal"
              >
                👤 Student Portal
              </button>
            </div>
          </div>

          {/* Interactive Hero Platform Mockup Window */}
          <div className="hero-image">
            <div className="v8-mockup-window">
              {/* Mockup Window Titlebar */}
              <div className="v8-mockup-header">
                <div className="flex items-center gap-3">
                  <div className="v8-window-dots" aria-hidden="true">
                    <span className="v8-window-dot" />
                    <span className="v8-window-dot active" />
                    <span className="v8-window-dot" />
                  </div>
                  <span className="v8-label text-[var(--text-2sm)] text-[var(--ink)] opacity-70 hidden sm:inline">
                    app.met-mastery / student / ana-silva
                  </span>
                </div>

                <span className="v8-label text-[var(--text-2sm)] text-[var(--success)] hidden sm:inline">Feedback in 24h</span>
              </div>

              {/* Mockup Content Area — single Today, shift-aware */}
              <div className="p-5 sm:p-6 bg-[var(--surface)] min-h-[310px] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--ink-faint)]">
                    <div>
                      <div className="text-xs font-semibold text-[var(--ink)]">Ana Silva • Target: C1 • Night-shift nurse</div>
                      <div className="text-[var(--text-2xs)] text-[var(--ink-muted)]">Async feedback within 24h — fits 12h rosters, no fixed class</div>
                    </div>
                    <span className="v8-label text-[var(--text-2xs)] px-2 py-0.5 rounded bg-[var(--success-bg)] text-[var(--success)]">
                      Feedback ready
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded border border-[var(--ink-faint)] bg-[var(--bg)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[var(--success-bg)] text-[var(--success)] flex items-center justify-center text-[var(--text-2sm)] font-bold">
                          ✓
                        </span>
                        <span className="text-[var(--ink)] line-through opacity-60">
                          Part 1 Inversion Drill — 10 min • between handovers
                        </span>
                      </div>
                      <span className="v8-label text-[var(--text-2xs)] text-[var(--ink-muted)]">Done</span>
                    </div>

                    <div className="p-2.5 rounded border border-[var(--primary)]/30 bg-[var(--primary-light)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-[var(--primary)] flex items-center justify-center text-[var(--text-2xs)] text-[var(--primary)] font-bold">
                          •
                        </span>
                        <span className="text-[var(--ink)] font-medium">Listening Part 2: Two-speaker handover — 12 min</span>
                      </div>
                      <span className="v8-label text-[var(--text-2xs)] text-[var(--primary)]">Due Today</span>
                    </div>

                    <div className="p-2.5 rounded border border-[var(--ink-faint)] bg-[var(--bg)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-[var(--ink-faint)] flex items-center justify-center text-[var(--text-2xs)] text-[var(--ink-muted)]">
                          •
                        </span>
                        <span className="text-[var(--ink)] opacity-80">Writing Task: Patient handover note — 20 min</span>
                      </div>
                      <span className="v8-label text-[var(--text-2xs)] text-[var(--ink-muted)]">Tomorrow, async</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-xs text-[var(--ink)] leading-snug">
                    <span className="font-bold text-[var(--accent)]">Teacher note on your last task: </span>
                    <em>"scarcely the budget allows"</em> → <em>"scarcely does the budget allow"</em> — inversion after negative adverbial. Nice use of "concurrent".
                  </div>
                </div>

                {/* Bottom Bar inside Mockup */}
                <div className="pt-3 mt-3 border-t border-[var(--ink-faint)] flex items-center justify-between text-xs">
                  <span className="v8-label text-[var(--text-2sm)] text-[var(--ink-muted)]">
                    Michigan English Test • Level B1–C2
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onDemoAccess?.({
                        role: 'student',
                        studentId: 'st_1',
                        email: 'ana.silva@example.com',
                        displayName: 'Ana Silva',
                      })
                    }
                    className="text-[var(--primary)] hover:underline font-semibold flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-xs"
                  >
                    Open Live Student Workspace →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Platform Experience Showcase Section --- */}
        <section id="platform-preview" className="v8-platform-section">
          <div className="v8-section-intro">
            <div className="v8-label">Interactive Platform Preview</div>
            <h2>Take a Look Inside the Platform</h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base opacity-75 mt-3 text-[var(--ink)]">
              Everything in MET Mastery is organized into a calm, focused workspace. Switch tabs
              below to explore the student view, interactive practice drills, diagnostic analytics,
              and teacher reviews.
            </p>
          </div>

          {/* Showcase Navigation Tabs */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded bg-[var(--ink-faint)]/50 border border-[var(--ink-faint)]">
              {[
                { id: 'diagnostic', label: 'Diagnostic Breakdown', desc: 'CEFR skill levels' },
                { id: 'feedback', label: 'Teacher Annotation', desc: 'Line-by-line feedback' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseTab(tab.id)}
                  className={`v8-tab-btn flex-1 min-w-[140px] text-center py-2.5 px-3 rounded transition-all ${
                    showcaseTab === tab.id ? 'active' : ''
                  }`}
                >
                  <div className="font-semibold text-xs sm:text-sm">{tab.label}</div>
                  <div className="text-[var(--text-2sm)] opacity-60 mt-0.5">{tab.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Showcase Screen Frame */}
          <div className="max-w-5xl mx-auto v8-mockup-window">
            {/* Screen Header */}
            <div className="v8-mockup-header">
              <div className="flex items-center gap-3">
                <div className="v8-window-dots" aria-hidden="true">
                  <span className="v8-window-dot active" />
                  <span className="v8-window-dot" />
                  <span className="v8-window-dot" />
                </div>
                <span className="v8-label text-[var(--text-xs)] text-[var(--ink)]">
                  {showcaseTab === 'diagnostic' && 'DIAGNOSTIC REPORT • Skills & Level Profile'}
                  {showcaseTab === 'feedback' && 'EVALUATION • Teacher Submission Review'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onDemoAccess?.({
                      role: showcaseTab === 'feedback' ? 'teacher' : 'student',
                      studentId: 'st_1',
                      email: showcaseTab === 'feedback' ? 'vvieira010@gmail.com' : 'ana.silva@example.com',
                      displayName: showcaseTab === 'feedback' ? 'Vinícius (Teacher)' : 'Ana Silva',
                    })
                  }
                  className="v8-btn v8-btn-outline text-[0.7rem] py-1 px-3"
                >
                  Launch Full View
                </button>
              </div>
            </div>

            {/* Showcase: distilled — student queue lives in hero Today */}




            {/* Showcase Tab 3: Diagnostic Breakdown */}
            {showcaseTab === 'diagnostic' && (
              <div className="p-6 sm:p-8 bg-[var(--surface)] space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[var(--ink-faint)]">
                  <div>
                    <h4 className="text-base font-semibold text-[var(--ink)]">
                      Comprehensive MET Diagnostic Analysis
                    </h4>
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                      Evaluated on 40 authentic Michigan English Test benchmark items
                    </p>
                  </div>
                  <span className="v8-label text-[0.7rem] px-2.5 py-1 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                    Target: C1 Proficiency
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { skill: 'Reading & Synthesis', score: 90, band: 'C1', desc: 'Strong inference in long academic passages' },
                    { skill: 'Listening Comprehension', score: 82, band: 'B2+', desc: 'Good short dialogues; review multi-speaker lectures' },
                    { skill: 'Grammar & Syntax', score: 74, band: 'B2', desc: 'Focus area: Inversion, conditionals & participle clauses' },
                    { skill: 'Writing Cohesion', score: 78, band: 'B2', desc: 'Accurate vocabulary; enhance transitional paragraph links' },
                  ].map((item) => (
                    <div key={item.skill} className="p-4 rounded border border-[var(--ink-faint)] bg-[var(--bg)]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-xs text-[var(--ink)]">{item.skill}</span>
                        <span className="v8-label text-[var(--text-2sm)] text-[var(--primary)] font-bold">{item.band} ({item.score}%)</span>
                      </div>
                      <div className="h-2 w-full bg-[var(--ink-faint)] rounded-full overflow-hidden my-2">
                        <div
                          className="h-full rounded-full bg-[var(--primary)]"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <p className="text-[0.72rem] text-[var(--ink-muted)] leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded border border-[var(--ink-faint)] bg-[var(--primary-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="v8-label text-[var(--text-2sm)] text-[var(--primary)]">Targeted Recommendation</span>
                    <div className="text-xs sm:text-sm font-medium text-[var(--ink)] mt-0.5">
                      Schedule a 30-minute diagnostic review to lock in your custom study roadmap.
                    </div>
                  </div>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Book a MET diagnostic via WhatsApp — from diagnostic preview"
                    className="v8-btn v8-btn-primary text-xs py-2 px-4 whitespace-nowrap"
                  >
                    Book Diagnostic
                  </a>
                </div>
              </div>
            )}

            {/* Showcase Tab 4: Teacher Feedback */}
            {showcaseTab === 'feedback' && (
              <div className="p-6 sm:p-8 bg-[var(--surface)] space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[var(--ink-faint)]">
                  <div>
                    <h4 className="text-base font-semibold text-[var(--ink)]">
                      Teacher Vinícius's Evaluation & Annotation
                    </h4>
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                      Submission: Writing Task 2 — University Campus Expansion Proposal
                    </p>
                  </div>
                  <span className="v8-label text-[0.7rem] px-2.5 py-1 rounded bg-[var(--success-bg)] text-[var(--success)]">
                    Score: 84 / 100
                  </span>
                </div>

                <div className="p-4 rounded border border-[var(--ink-faint)] bg-[var(--bg)] space-y-3">
                  <div className="text-xs text-[var(--ink)] font-mono leading-relaxed bg-[var(--surface)] p-3 rounded border border-[var(--ink-faint)]">
                    "Although proponents argue that modernizing research facilities will enhance institutional prestige, <mark className="bg-[var(--accent-subtle)] px-1 rounded">scarcely the budget allows</mark> for concurrent dormitory construction."
                  </div>

                  <div className="p-3 rounded bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-xs text-[var(--ink)]">
                    <span className="font-bold text-[var(--accent)]">Teacher Note: </span>
                    Watch the inversion rule with negative adverbials: should be <em>"scarcely does the budget allow"</em>. Excellent use of "concurrent", however!
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded border border-[var(--ink-faint)] bg-[var(--bg)]">
                    <div className="v8-label text-[var(--text-2xs)]">Task Response</div>
                    <div className="font-bold text-sm text-[var(--ink)] mt-1">Band C1</div>
                  </div>
                  <div className="p-3 rounded border border-[var(--ink-faint)] bg-[var(--bg)]">
                    <div className="v8-label text-[var(--text-2xs)]">Lexical Resource</div>
                    <div className="font-bold text-sm text-[var(--ink)] mt-1">Band B2+</div>
                  </div>
                  <div className="p-3 rounded border border-[var(--ink-faint)] bg-[var(--bg)]">
                    <div className="v8-label text-[var(--text-2xs)]">Grammar Range</div>
                    <div className="font-bold text-sm text-[var(--ink)] mt-1">Band B2</div>
                  </div>
                  <div className="p-3 rounded border border-[var(--ink-faint)] bg-[var(--bg)]">
                    <div className="v8-label text-[var(--text-2xs)]">Cohesion</div>
                    <div className="font-bold text-sm text-[var(--ink)] mt-1">Band C1</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- Featured Grid --- */}
        <section id="about" className="v8-features">
          <div id="features" className="v8-section-intro">
            <div className="v8-label">Platform Features</div>
            <h2>Everything You Need to Succeed</h2>
          </div>
          <div className="v8-feature-grid">
            {featuresList.map((f) => (
              <div key={f.num} className="v8-feature-card">
                <div className="v8-label">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Process --- */}
        <section id="how-it-works" className="v8-process">
          <div className="v8-label" style={{ color: 'var(--accent)' }}>
            How It Works
          </div>
          <h2>Four Steps to MET Success</h2>
          <div className="v8-process-grid">
            {processSteps.map((s) => (
              <div key={s.num} className="v8-process-step">
                <span className="v8-step-num">{s.num}</span>
                <h4>{s.title}</h4>
                <p style={{ opacity: 0.65, fontSize: '0.875rem' }}>{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- FAQ --- */}
        <section id="faq" className="v8-faq">
          <div className="v8-section-intro" style={{ textAlign: 'left', marginBottom: '40px' }}>
            <div className="v8-label">FAQ</div>
            <h2 style={{ fontSize: '2.5rem' }}>Common Questions</h2>
          </div>
          <div className="flex flex-col">
            {faqs.map((item, i) => {
              const isOpen = activeFaq === i;
              return (
                <div key={i} className="v8-faq-item">
                  <button
                    type="button"
                    id={`faq-button-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="v8-faq-question"
                  >
                    <span>{item.q}</span>
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 400,
                        marginLeft: '1rem',
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    className={`grid transition-all duration-200 ease-out ${
                      isOpen ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className="m-0 text-sm leading-relaxed"
                        style={{ color: 'var(--ink)', opacity: 0.75 }}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- CTA --- */}
        <section id="cta" className="v8-cta">
          <h2>Ready to make your plan clear?</h2>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Book a MET diagnostic via WhatsApp — final call to action"
            className="v8-btn v8-btn-primary v8-cta-btn"
          >
            Book a MET diagnostic
          </a>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="v8-footer">
        <div className="v8-logo" style={{ fontSize: '1rem' }}>
          MET <span>Mastery</span>
        </div>
        <div className="v8-footer-meta">© 2026 MET MASTERY PLATFORM — REFINED PREPARATION</div>
        <div className="v8-footer-meta">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            WhatsApp Contact: +55 11 99780-1708
          </a>
        </div>
      </footer>
    </div>
  );
}
