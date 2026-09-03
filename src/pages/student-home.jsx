import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Icon, SkeletonCard, EmptyState, Card } from '../components/shared.jsx';
import { getHomework, getDiagnoses, getClassEvents, getReviews, getSubmissions, getPracticeSubmissions, getStudentSeedsStage } from '../lib/workflow.js';
import { getExamMode, getExamModeLabel, getExamModeDescription, MODE_BUILDING, MODE_SPRINT, MODE_NONE } from '../lib/exam-window.js';
import { getDueCount, getDueItems, toMCQ, getAllEntries } from '../lib/spaced-repetition.js';
import { getTeacherSetting, getStudentSetting, setStudentSetting } from '../lib/supabase-db.js';
import { asArray, getSkillTrend, hasVisibleApprovedStudentFeedback } from './student-helpers.jsx';
import { lazyWithRetry } from '../lib/utils.js';
import { useBodyScrollLock } from '../lib/use-body-scroll-lock.js';
import LiveClassSchedulingGuardrails from '../components/LiveClassSchedulingGuardrails.jsx';
import AcademicProgressChart from '../components/AcademicProgressChart.jsx';

const ReviewSession = lazyWithRetry(() => import('../components/ReviewSession.jsx'));
const ExercisePlayer = lazyWithRetry(() => import('../components/exercises/ExercisePlayer.jsx'));

function TodoRow({ done, label, meta }) {
  return (
    <div className={`todo-row${done ? ' todo-row--done' : ''}`}>
      <span className={`todo-row-icon${done ? ' todo-row-icon--done' : ''}`}>
        {done ? <Icon.check size={16} /> : <Icon.circle size={16} />}
      </span>
      <div className="todo-row-content">
        <div className={`todo-row-label${done ? ' todo-row-label--done' : ''}`}>{label}</div>
        <div className="todo-row-meta">{meta}</div>
      </div>
    </div>
  );
}

function StatChip({ icon, label, value, sub, tone, onClick, muted }) {
  const cls = `stat-chip${tone ? ` stat-chip--${tone}` : ''}${onClick ? ' stat-chip--clickable' : ''}`;
  const content = (
    <>
      <span className="stat-chip-icon">{icon}</span>
      <div className="stat-chip-copy">
        <strong className="stat-chip-value">{value}</strong>
        <span className="stat-chip-label">{sub || label}</span>
      </div>
    </>
  );
  if (onClick) {
    return <button type="button" className={cls} onClick={onClick}>{content}</button>;
  }
  return <div className={cls} style={muted ? { opacity: 0.55 } : undefined} aria-disabled={muted || undefined}>{content}</div>;
}

const LEARNING_LOOP = [
  { id: 'class', label: 'Class', tab: 'home' },
  { id: 'feedback', label: 'Feedback', tab: 'feedback' },
  { id: 'exercise', label: 'Exercise', tab: 'homework' },
  { id: 'review', label: 'Feedback', tab: 'feedback' },
  { id: 'next-class', label: 'Next class', tab: 'home' },
];

function LearningLoop({ active, onTab }) {
  const activeIndex = LEARNING_LOOP.findIndex(step => step.id === active);
  const completedThrough = active === 'next-class' ? -1 : activeIndex - 1;
  return (
    <section className="student-learning-loop" aria-labelledby="learning-loop-title">
      <div className="student-learning-loop-head">
        <div>
          <span className="student-panel-kicker">Your learning cycle</span>
          <h2 id="learning-loop-title">Small steps, repeated well.</h2>
        </div>
        <span className="student-learning-loop-status">Current step: {LEARNING_LOOP[activeIndex]?.label || 'Class'}</span>
      </div>
      <ol className="student-learning-loop-steps">
        {LEARNING_LOOP.map((step, index) => (
          <li key={step.id} className={`student-learning-loop-step${index === activeIndex ? ' is-active' : ''}${index <= completedThrough ? ' is-complete' : ''}`}>
            <button type="button" onClick={() => onTab(step.tab)} aria-current={index === activeIndex ? 'step' : undefined}>
              <span className="student-learning-loop-number">{index <= completedThrough ? <Icon.check size={12} /> : String(index + 1).padStart(2, '0')}</span>
              <strong>{step.label}</strong>
            </button>
            {index < LEARNING_LOOP.length - 1 && <span className="student-learning-loop-arrow" aria-hidden="true">→</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function StudentHome({ student, onTab, "data-testid": testId }) {
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [pendingHw, setPendingHw] = useState([]);
  const [homework, setHomework] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [latestReview, setLatestReview] = useState(null);
  const [snapshot, setSnapshot] = useState([]);
  const [approvedHistory, setApprovedHistory] = useState([]);
  const [nextClass, setNextClass] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [reviewExercises, setReviewExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [memo, setMemo] = useState('');
  const [qpOpen, setQpOpen] = useState(false);
  const [qpSkill, setQpSkill] = useState(null);
  const [qpExercises, setQpExercises] = useState([]);
  const [qpSessionKey, setQpSessionKey] = useState(0);
  const [qpProgress, setQpProgress] = useState({});
  const [reduceMotion, setReduceMotion] = useState(false);

  // recharts is ~127 KB gzip — lazy-load it so it stays out of the entry chunk.
  const [loaded, setLoaded] = useState(false);
  const [Modules, setModules] = useState(null);
  useEffect(() => { import('recharts').then(m => { setModules(m); setLoaded(true); }); }, []);

  // Keep the page from scrolling behind the Quick Practice modal.
  useBodyScrollLock(qpOpen);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    getStudentSeedsStage(student.id).then(() => {});
    getTeacherSetting('general_memo').then(text => {
      if (text) setMemo(text);
    }).catch(e => console.warn('[student-home] failed to load memo:', e));
    const handler = (e) => {
      if (e.detail?.memo != null) setMemo(e.detail.memo);
    };
    window.addEventListener('vv:student-memo-changed', handler);
    return () => window.removeEventListener('vv:student-memo-changed', handler);
  }, []);

  useEffect(() => {
    (async () => {
      try {
      const [hw, diagnoses, classEvents, reviews, subs, practiceSubs, savedQpProgress] = await Promise.all([
        getHomework(student.id),
        getDiagnoses(student.id),
        getClassEvents(student.id),
        getReviews(student.id),
        getSubmissions(student.id),
        getPracticeSubmissions({ studentId: student.id }),
        getStudentSetting(student.id, 'qp_progress'),
      ]);
      setHomework(hw || []);
      setReviews(reviews || []);
      setSubmissions(subs || []);
      setPracticeSessions(practiceSubs || []);
      setReviewCount(getDueCount(student.id));
      if (savedQpProgress && typeof savedQpProgress === 'object') setQpProgress(savedQpProgress);
      const doneStatuses = new Set(['submitted', 'reviewed', 'completed', 'corrected']);
      setPendingHw((hw || []).filter(h => !doneStatuses.has(h.status)));

      const newestReview = (reviews || [])
        .sort((a, b) => new Date(b.reviewedAt || b.createdAt || 0) - new Date(a.reviewedAt || a.createdAt || 0))[0];
      if (newestReview) {
        const reviewedHw = (hw || []).find(item => item.id === newestReview.homeworkId);
        setLatestReview({ ...newestReview, homeworkTitle: reviewedHw?.title || 'Homework review' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = (classEvents || [])
        .filter(e => e.status !== 'cancelled')
        .map(e => ({ ...e, startAt: new Date(`${e.date || new Date().toISOString().slice(0, 10)}T${e.startTime || '00:00'}`) }))
        .filter(e => e.startAt >= today)
        .sort((a, b) => a.startAt - b.startAt);
      setNextClass(upcoming[0] || null);
      setUpcomingClasses(upcoming.slice(0, 4));

      const approvedDx = (diagnoses || [])
        .filter(hasVisibleApprovedStudentFeedback)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (approvedDx.length > 0) {
        setLatestFeedback(approvedDx[0].sections.studentFeedback.content);
      }

      const allApprovedDx = (diagnoses || [])
        .filter(d => d.status === 'approved')
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (allApprovedDx.length > 0) {
        setSnapshot(asArray(allApprovedDx[0].content?.section_snapshot));
        setApprovedHistory(allApprovedDx);
      }
      } catch (e) {
        console.error('[StudentHome] failed to load:', e);
        setLoadError(e.message);
      }
      setLoading(false);
    })();
  }, [student.id]);

  const developmentData = useMemo(() => {
    const points = [];
    homework.forEach(h => {
      const rev = reviews.find(r => r.homeworkId === h.id);
      const sub = submissions.find(s => s.homeworkId === h.id);
      if (rev && rev.score !== null) {
        points.push({
          name: h.title.length > 10 ? h.title.substring(0, 10) + '..' : h.title,
          // ponytail: review form caps at 0-10; guard covers legacy 0-100 rows, drop after data migrated
          development: rev.score <= 10 ? rev.score * 10 : rev.score,
          confidence: sub?.confidence !== null ? (sub.confidence / 3) * 100 : null,
          date: new Date(rev.reviewedAt || h.assignedAt),
          type: 'Homework'
        });
      }
    });
    approvedHistory.forEach(d => {
      const snap = asArray(d.content?.section_snapshot);
      const evaluated = snap.filter(s => s.evaluated && Number(s.score_0_80) > 0);
      if (evaluated.length > 0) {
        const avg = evaluated.reduce((sum, s) => sum + Number(s.score_0_80), 0) / evaluated.length;
        const date = new Date(d.createdAt || 0);
        points.push({
          name: 'Diagnosis ' + date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          development: Math.round((avg / 80) * 100),
          confidence: null,
          date,
          type: 'Diagnosis'
        });
      }
    });
    (practiceSessions || []).filter(s => s.type === 'free_practice' && s.score != null).forEach(s => {
      const date = new Date(s.submittedAt || 0);
      points.push({
        name: 'Practice ' + date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        development: s.score,
        confidence: null,
        date,
        type: 'Practice'
      });
    });
    return points.sort((a, b) => a.date - b.date);
  }, [homework, reviews, submissions, approvedHistory, practiceSessions]);

  function timeOfDay() {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  const pendingTitle = pendingHw[0]?.title || 'No homework pending';
  const snapshotEvaluatedSkills = snapshot.filter(s => s.evaluated || Number(s.score_0_80) > 0);
  const evaluatedSkills = snapshotEvaluatedSkills.length > 0
    ? snapshotEvaluatedSkills
    : approvedHistory
        .flatMap(dx => asArray(dx?.content?.section_snapshot))
        .filter(s => s.evaluated || Number(s.score_0_80) > 0)
        .filter((skill, index, list) => index === list.findIndex(item => item.section === skill.section));
  const fallbackFocus = nextClass?.metSkillFocus || nextClass?.classFocus || student.focusSkill || 'MET speaking organization';
  const focusSkill = String(snapshotEvaluatedSkills[0]?.section || fallbackFocus);
  const focusTrend = snapshotEvaluatedSkills[0] ? getSkillTrend(focusSkill, approvedHistory) : { dir: 'none' };

  function handleOpenReview() {
    const due = getDueItems(student.id);
    if (due.length === 0) { window.toast?.('No items due for review.', 'warn'); return; }
    const all = getAllEntries(student.id);
    const exercises = due.map(e => toMCQ(e, all));
    setReviewExercises(exercises);
    setReviewMode(true);
  }

  const QP_SKILLS = [
    { id: 'listening', label: 'Listening', icon: Icon.headset, color: 'var(--section-listening)' },
    { id: 'reading', label: 'Reading', icon: Icon.book, color: 'var(--section-reading)' },
    { id: 'writing', label: 'Writing', icon: Icon.edit, color: 'var(--section-writing)' },
    { id: 'speaking', label: 'Speaking', icon: Icon.mic, color: 'var(--section-speaking)' },
    { id: 'vocab', label: 'Vocabulary', icon: Icon.star, color: 'var(--type-grammar)' },
    { id: 'grammar', label: 'Grammar', icon: Icon.check, color: 'var(--type-main-idea)' },
  ];

  function getWeekKey() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}`;
  }

  function getQpCompletedCount() {
    const wk = getWeekKey();
    return Object.keys(qpProgress[wk] || {}).length;
  }

  function handleQpSkillClick(skillId) {
    import('../pages/quick-practice.jsx').then(mod => {
      const extractors = mod.EXTRACTORS || {};
      const all = extractors[skillId]?.() || [];
      const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 5);
      setQpSkill(skillId);
      setQpExercises(shuffled);
      setQpSessionKey(k => k + 1);
    });
  }

  function handleQpComplete(skillId) {
    const wk = getWeekKey();
    const next = { ...qpProgress, [wk]: { ...qpProgress[wk], [skillId]: true } };
    setQpProgress(next);
    setStudentSetting(student.id, 'qp_progress', next).catch(() => {});
    setQpSkill(null);
    setQpExercises([]);
  }

  function handleQpClose() {
    setQpOpen(false);
    setQpSkill(null);
    setQpExercises([]);
  }

  const qpDialogRef = useRef(null);
  const handleQpCloseRef = useRef(handleQpClose);

  useEffect(() => {
    handleQpCloseRef.current = handleQpClose;
  });

  useEffect(() => {
    if (!qpOpen) return;
    const dialog = qpDialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement;
    dialog.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleQpCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [qpOpen]);

  if (loadError) {
    return (
      <div className="student-home">
        <section className="student-hero bg-grain fade-up" style={{ '--delay': '0s' }}>
          <div>
            <h1>Could not load dashboard</h1>
            <p>Something went wrong. Please try refreshing the page.</p>
          </div>
        </section>
        <EmptyState
          title="Loading error"
          text={loadError}
          action="Reload page"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const heroAction = pendingHw.length > 0
    ? { label: 'Open homework', tab: 'homework', icon: <Icon.homework size={15} /> }
    : { label: 'View progress', tab: 'progress', icon: <Icon.progress size={15} /> };

  const learningLoopStage = latestReview
    ? 'review'
    : pendingHw.length > 0
      ? 'exercise'
      : latestFeedback
        ? 'feedback'
        : nextClass
          ? 'next-class'
          : 'class';

  const nextDate = nextClass?.startAt
    ? nextClass.startAt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'Not scheduled';
  const nextTime = nextClass?.startAt
    ? nextClass.startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Teacher will confirm';

  const examMode = getExamMode();

  const lowestSkill = evaluatedSkills.length > 1
    ? [...evaluatedSkills].sort((a, b) => (Number(a.score_0_80) || 80) - (Number(b.score_0_80) || 80))[0]
    : null;

  return (
    <div className="student-home">
      <section className="student-hero dashboard-overview bg-grain fade-up" style={{ '--delay': '0s' }}>
        <div>
          <h1>Good {timeOfDay()}, {student.firstName}.</h1>
          <p>{student.currentLevel || student.band || 'Current level'} to {student.targetLevel || student.bandTarget || 'target level'} · Session {student.session || 1}/{student.totalSessions || 24} · <span className="student-pill">{getExamModeLabel(examMode)}</span></p>
        </div>
         <button className="student-hero-action" onClick={() => onTab(heroAction.tab)}>
           {heroAction.icon}
           {heroAction.label}
         </button>
        </section>

      <Card bezel className="memo-board fade-up" style={{ '--delay': '0.1s' }}>
        <div className="memo-board-text">
          <span className="memo-board-kicker">From your teacher</span>
          {memo ? (
            <p>{memo}</p>
          ) : (
            <p className="memo-board-empty">No announcements. Stay focused on your MET goals.</p>
          )}
        </div>
        <div className="memo-board-chips">
          {reviewCount > 0 && (
            <StatChip icon={<Icon.refresh size={15} />} label="Due" value={`${reviewCount}`} sub="spaced repetition" tone="teal" onClick={handleOpenReview} />
          )}
          <StatChip icon={<Icon.homework size={15} />} label="Homework" value={String(pendingHw.length)} sub={pendingHw.length === 1 ? 'task pending' : 'tasks pending'} tone="teal" onClick={() => onTab('homework')} />
          <StatChip icon={<Icon.calendar size={15} />} label="Next class" value={nextDate} sub={nextTime} tone="teal" />
          <StatChip icon={<Icon.progress size={15} />} label="Focus" value={focusSkill.length > 18 ? focusSkill.slice(0, 18) + '…' : focusSkill} sub={focusTrend.dir !== 'none' ? focusTrend.label : 'next practice'} tone="navy" onClick={() => onTab('progress')} />
        </div>
      </Card>

      <LearningLoop active={learningLoopStage} onTab={onTab} />

      <Suspense fallback={null}>
        {reviewMode && (
          <ReviewSession
            exercises={reviewExercises}
            studentId={student.id}
            onClose={() => { setReviewMode(false); setReviewExercises([]); setReviewCount(getDueCount(student.id)); }}
          />
        )}
      </Suspense>

      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', left: '-9999px' }}>
        {loading ? 'Loading dashboard data' : 'Dashboard loaded'}
      </div>

      {loading ? (
        <section className="home-loading fade-up" style={{ '--delay': '0.2s' }} aria-busy="true" aria-label="Loading dashboard">
          <SkeletonCard height={120} lines={3} />
        </section>
      ) : (
        <>
          <div className="home-layout-grid home-primary-grid fade-up" style={{ '--delay': '0.2s' }}>
            <Card bezel className="home-next-steps upcoming-tasks home-primary-action">
              <div className="student-panel-head">
                <div>
                  <span className="student-panel-kicker">Start here</span>
                  <h2>Your next step</h2>
                </div>
              </div>
              <div className="stack-list">
                {latestReview && <TodoRow done={false} label="Teacher review ready" meta={latestReview.homeworkTitle} />}
                <div className="recent-feedback">
                  <TodoRow done={!!latestFeedback} label="Review latest feedback" meta={latestFeedback ? 'Available in the Feedback tab' : 'Waiting for teacher approval'} />
                </div>
                <TodoRow done={pendingHw.length === 0} label={pendingTitle} meta={pendingHw[0]?.dueDate ? `Due ${new Date(pendingHw[0].dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Homework area'} />
              </div>
              <button className="student-wide-action" onClick={() => onTab(heroAction.tab)}>
                {heroAction.label} <Icon.arrowR size={14} />
              </button>
            </Card>

          </div>

          <div className="home-bento fade-up" style={{ '--delay': '0.3s' }}>
            <Card bezel as="section" className="home-bento-cell" style={{ gridColumn: '1 / -1' }} data-testid="academic-progress-chart" aria-labelledby="academic-progress-title">
              <div className="student-panel-head">
                <div>
                  <span className="student-panel-kicker">This week</span>
                  <h2 id="academic-progress-title">Academic Progress</h2>
                </div>
                <span className="student-pill">Daily scores · Mon–Sun</span>
              </div>
              <AcademicProgressChart />
            </Card>

            <Card bezel className="home-bento-cell home-bento-cell--orange home-evidence-card">
              <div className="student-panel-head">
                <div>
                  <h2 className="text-sm" style={{ margin: 0 }}>Learning Insights</h2>
                  <p className="text-caption" style={{ margin: '3px 0 0' }}>Percentage based on evaluated evidence; higher is better.</p>
                </div>
              </div>
              <div className="student-chart-legend" aria-label="Chart legend">
                <span><i className="student-chart-key student-chart-key--development" aria-hidden="true" />Development</span>
                <span><i className="student-chart-key student-chart-key--confidence" aria-hidden="true" />Confidence</span>
              </div>
              <div className="student-chart-wrap">
                {!loaded ? (
                  <div className="student-chart-skeleton" style={{ height: 260, borderRadius: 8, background: 'var(--bg-2, rgba(0,0,0,0.04))' }} aria-hidden="true" />
                ) : developmentData.length > 0 ? (
                  <>
                  <Modules.ResponsiveContainer width="100%" height="100%">
                    <Modules.BarChart data={developmentData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                      <Modules.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                      <Modules.XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <Modules.YAxis fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Modules.Tooltip
                        cursor={{ fill: 'var(--orange-soft)' }}
                        formatter={(value, name) => [value + '%', name]}
                      />
                      <Modules.Bar dataKey="development" name="Development" fill="var(--orange)" radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion} />
                      <Modules.Bar dataKey="confidence" name="Confidence" fill="var(--primary)" fillOpacity={0.7} radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion} />
                    </Modules.BarChart>
                  </Modules.ResponsiveContainer>
                  <table className="sr-only">
                    <caption>Development trend across homework, diagnoses, and practice</caption>
                    <thead><tr><th>Item</th><th>Development</th><th>Confidence</th></tr></thead>
                    <tbody>
                      {developmentData.map(d => (
                        <tr key={d.name}><td>{d.name}</td><td>{d.development}</td><td>{d.confidence != null ? d.confidence : '—'}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  </>
                ) : (
                  <div className="student-chart-empty">
                    Complete homework or get a diagnosis to see your development trend.
                  </div>
                )}
              </div>
            </Card>

            {lowestSkill && Number(lowestSkill.score_0_80) > 0 && (
              <Card bezel className="home-bento-cell home-bento-cell--orange student-focus-callout" onClick={() => onTab('progress')}>
                <div className="student-panel-head">
                  <div>
                    <span className="student-panel-kicker">Focus Area</span>
                    <h2>{lowestSkill.section.replace(/_/g, ' ')}</h2>
                  </div>
                </div>
                <p>
                  This skill needs the most attention. Focus on it in your next class or practice session.
                </p>
                {lowestSkill.next_step && (
                  <p><strong>Next step:</strong> {lowestSkill.next_step}</p>
                )}
              </Card>
            )}

            <div className="home-bento-cell" style={{ gridColumn: '1 / -1' }}>
              <LiveClassSchedulingGuardrails
                classes={upcomingClasses}
                student={student}
                onClassUpdated={() => {
                  // Reload classes
                  getClassEvents(student.id).then(ev => {
                    const upcoming = (ev || [])
                      .map(e => ({ ...e, startAt: new Date(`${e.date || new Date().toISOString().slice(0, 10)}T${e.startTime || '12:00'}`) }))
                      .filter(e => e.startAt >= new Date())
                      .sort((a, b) => a.startAt - b.startAt);
                    setUpcomingClasses(upcoming);
                    setNextClass(upcoming[0] || null);
                  }).catch(() => {});
                }}
                onNavigateToMessages={() => onTab && onTab('messages')}
              />
            </div>

            <Card bezel className="referral-card">
              <div className="referral-card-inner">
                <div className="referral-card-icon">
                  <Icon.group size={20} />
                </div>
                <div className="referral-card-body">
                  <h3 className="referral-card-title">Refer a friend, earn a free class</h3>
                  <p className="referral-card-desc">
                    Share your experience with friends or colleagues preparing for MET. When they book a trial class, you both earn a free session.
                  </p>
                  <div className="referral-card-actions">
                    <a
                      className="referral-btn referral-btn--primary"
                      href="https://wa.me/5511997801708?text=Hi%20Vin%C3%ADcius,%20I%20want%20to%20recommend%20you%20to%20a%20friend%20who%20needs%20MET%20preparation."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icon.send size={14} /> Share on WhatsApp
                    </a>
                    <button
                      type="button"
                      className="referral-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(window.location.origin).then(
                          () => window.toast?.('Link copied!', 'success'),
                          () => window.toast?.('Could not copy link', 'warn')
                        );
                      }}
                    >
                      <Icon.copy size={14} /> Copy link
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {qpOpen && (
        <div className="qp-modal-overlay" ref={qpDialogRef} tabIndex={-1} onClick={handleQpClose} role="dialog" aria-modal="true" aria-label="Quick Practice">
          <div className="qp-modal" onClick={e => e.stopPropagation()}>
            <header className="qp-modal-header">
              <button type="button" className="qp-modal-back" onClick={() => { if (qpSkill) { setQpSkill(null); setQpExercises([]); } else { handleQpClose(); } }}>
                <Icon.arrowL size={16} />
                {qpSkill ? 'All skills' : 'Close'}
              </button>
              <h2 className="qp-modal-title">{qpSkill ? QP_SKILLS.find(s => s.id === qpSkill)?.label : 'Quick Practice'}</h2>
              {!qpSkill && <span className="qp-modal-subtitle">10 exercises per skill, refreshes weekly</span>}
            </header>
            <div className="qp-modal-body">
              {!qpSkill ? (
                <div className="qp-modal-grid">
                  {QP_SKILLS.map(skill => {
                    const IconComp = skill.icon;
                    const done = qpProgress[getWeekKey()]?.[skill.id];
                    return (
                      <button key={skill.id} type="button" className={`qp-modal-card${done ? ' qp-modal-card--done' : ''}`} onClick={() => handleQpSkillClick(skill.id)}>
                        <span className="qp-modal-card-icon" style={{ color: skill.color }}><IconComp size={24} /></span>
                        <div className="qp-modal-card-body">
                          <h3>{skill.label}</h3>
                          <span className="qp-modal-card-count">{done ? 'Completed' : '10 exercises'}</span>
                        </div>
                        {done ? <Icon.check size={16} className="qp-modal-card-check" /> : <Icon.arrowR size={16} className="qp-modal-card-arrow" />}
                      </button>
                    );
                  })}
                </div>
              ) : qpExercises.length > 0 ? (
                <div key={qpSessionKey} className="qp-modal-exercises">
                  <Suspense fallback={<div className="practice-studio-loading"><p>Loading exercises…</p></div>}>
                    <ExercisePlayer
                      exercises={qpExercises}
                      onSessionComplete={() => handleQpComplete(qpSkill)}
                      scaffoldLevel={4}
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="practice-studio-loading"><p>Loading exercises…</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
