import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import LoginScreen from './pages/login.jsx';
import LandingComplete from './pages/landing-complete.jsx';
import StudentDashboard from './pages/student-dashboard.jsx';
import ErrorBoundary from './components/error-boundary.jsx';
import { logError } from './lib/error-logger.js';
import { Icon, Shell } from './components/shared.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import { ToastHost } from './lib/toast-host.jsx';
import { getStudents, requestInboxNotificationPermission } from './lib/workflow-roster.js';
import { getAllSubmissions } from './lib/workflow.js';
import {
  getSupabaseConfig,
  parseSupabaseHashFragment,
  parsePKCECode,
  exchangePKCECode,
  storeSupabaseSession,
  readStoredSupabaseSession,
  clearStoredSupabaseSession,
  fetchSupabaseUser,
  refreshSupabaseSession,
} from './lib/supabase-storage.js';
import { claimStudentByEmail, ensureProfile, setSessionRole, upsertReviewSchedule, loadReviewSchedule, subscribeToTable } from './lib/supabase-db.js';
import { enableSync } from './lib/spaced-repetition.js';
import { lazyWithRetry } from './lib/utils.js'; // Imported from utils.js

// Lazy-loaded pages with retry on chunk load failure (prevents "Page unavailable" after new deployments)
// Removed local lazyWithRetry definition as it's now a shared utility

const TeacherDashboard  = lazyWithRetry(() => import('./pages/teacher-dashboard.jsx'));
const StudentsPage      = lazyWithRetry(() => import('./pages/students.jsx'));
const StudentProfile    = lazyWithRetry(() => import('./pages/student-profile.jsx'));
const CalendarPage      = lazyWithRetry(() => import('./pages/calendar.jsx'));
const ClassRecord       = lazyWithRetry(() => import('./pages/class-record.jsx'));
const DiagnosticsPage   = lazyWithRetry(() => import('./pages/diagnostics.jsx'));
const DiagnosticCreate  = lazyWithRetry(() => import('./pages/diagnostic-create.jsx'));
const HomeworkPage      = lazyWithRetry(() => import('./pages/homework.jsx'));
const HomeworkCreate    = lazyWithRetry(() => import('./pages/homework-create.jsx'));
const SubmissionsPage   = lazyWithRetry(() => import('./pages/submissions.jsx'));
const SubmissionReview  = lazyWithRetry(() => import('./pages/submission-review.jsx'));
const ErrorBankPage     = lazyWithRetry(() => import('./pages/error-bank.jsx'));
const ReportsPage       = lazyWithRetry(() => import('./pages/reports.jsx'));
const SettingsPage      = lazyWithRetry(() => import('./pages/settings.jsx'));

const InboxPage         = lazyWithRetry(() => import('./tools/tool-inbox.jsx'));
const PerspectiveDesigner = lazyWithRetry(() => import('./tools/tool-perspective-designer.jsx'));
const ExercisesPage     = lazyWithRetry(() => import('./pages/exercises.jsx'));
const MockTestPage      = lazyWithRetry(() => import('./pages/mock-test.jsx'));
const MockTestResults   = lazyWithRetry(() => import('./pages/mock-test-results.jsx'));
const TeacherEvaluationPage = lazyWithRetry(() => import('./pages/teacher-evaluation.jsx'));
const MockTestEvalPage = lazyWithRetry(() => import('./pages/mock-test-eval.jsx'));
const WritingPracticePage = lazyWithRetry(() => import('./pages/writing-practice.jsx'));
const SpeakingEvalPage = lazyWithRetry(() => import('./pages/speaking-eval.jsx'));
const CohortsPage = lazyWithRetry(() => import('./pages/cohorts.jsx'));
const RiskDashboard = lazyWithRetry(() => import('./pages/risk-dashboard.jsx'));
const OperationsPage = lazyWithRetry(() => import('./pages/operations.jsx'));
const VisualEditorPage = lazyWithRetry(() => import('./pages/visual-editor.jsx'));
const SocialStudio = lazyWithRetry(() => import('./pages/social-studio.jsx'));

export default function App() {
  const [auth, setAuth] = useState(null);
  const [publicView, setPublicView] = useState('landing');
  // Keep a live ref to auth so the once-mounted realtime subscription below
  // reads the current role instead of the value captured on first render.
  const authRef = useRef(auth);
  useEffect(() => { authRef.current = auth; }, [auth]);

  // Global error handler — catches unhandled rejections and window.onerror
  useEffect(() => {
    const onRejection = (e) => logError(e.reason, { source: 'unhandledRejection' });
    const onError = (e) => {
      if (e.error) logError(e.error, { source: 'window.onerror' });
    };
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  const [view, setView] = useState('dashboard');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  // Sub-view params: { studentId?, classEventId?, diagnosisId?, homeworkId?, submissionId? }
  const [viewParams, setViewParams] = useState({});
  const [darkMode, setDarkMode] = useState(() => window.__theme === 'dark');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);

  const workflowActive = view.startsWith('diagnostics:create') ? 'diagnose'
    : view.startsWith('homework:create') ? 'homework'
    : view.startsWith('submissions:review') ? 'feedback'
    : null;

  /**
   * Resolve auth payload from a verified Supabase user. A user who claims a
   * roster row by email is a student. Otherwise ONLY the configured teacher
   * email(s) get the teacher role, and any other account (e.g. a self-registered
   * or mistyped email) is rejected and signed out, so self-registration can
   * never grant teacher access.
   */
  const resolveAuth = useCallback(async (accessToken, sbUser) => {
    const meta = sbUser?.user_metadata || {};
    const email = sbUser?.email || '';
    let claimed = null;
    try { claimed = await claimStudentByEmail(email); } catch (e) { console.warn('[Auth] claimStudentByEmail failed', e); }
    if (claimed) {
      setSessionRole('student');
      ensureProfile('student', { displayName: meta.display_name || email, studentUuid: claimed.id }).catch(() => {});
      return { role: 'student', studentId: claimed.local_id || claimed.id, email };
    }
    const rawTeacherEmail = import.meta.env.VITE_TEACHER_EMAIL || '';
    // Deployment configuration may add teacher addresses, but it must not
    // accidentally replace the two established teacher accounts.
    const teacherEmails = [...new Set([
      ...rawTeacherEmail.split(','),
      'vvieira010@gmail.com',
      'vvieira010x@gmail.com',
    ].map(e => e.trim().toLowerCase()).filter(Boolean))];
    if (teacherEmails.includes(email.trim().toLowerCase())) {
      setSessionRole('teacher');
      ensureProfile('teacher', { displayName: meta.display_name || email }).catch(() => {});
      return { role: 'teacher', email, displayName: meta.display_name || email };
    }
    try {
      localStorage.setItem('vv:auth_notice', "This email isn't set up for access yet. Ask your teacher to add you to the roster, then register again.");
    } catch {}
    clearStoredSupabaseSession();
    setSessionRole('');
    return null;
  }, []);

  // ── Supabase auth: handle implicit-flow hash redirect + restore stored session ──
  useEffect(() => {
    const { url, anonKey, isConfigured } = getSupabaseConfig();
    if (!isConfigured) return;

    // ── PKCE flow: ?code= in query string (modern Supabase default) ──
    async function handlePKCE() {
      const code = parsePKCECode(window.location.search);
      if (!code) return false;
      // Clean the URL immediately so the code can't be replayed.
      history.replaceState(null, '', window.location.pathname);
      try {
        const session = await exchangePKCECode(url, anonKey, code);
        if (!session?.access_token) { clearStoredSupabaseSession(); return true; }
        const sbUser = session.user || await fetchSupabaseUser(url, anonKey, session.access_token);
        storeSupabaseSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token || '',
          expires_at: session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600),
          user: sbUser,
        });
        const payload = await resolveAuth(session.access_token, sbUser);
        if (payload) setAuth(payload);
      } catch {
        clearStoredSupabaseSession();
      }
      return true;
    }

    // ── Implicit flow: #access_token= in hash (legacy / fallback) ──
    async function handleHash() {
      const fragment = parseSupabaseHashFragment(window.location.hash);
      if (!fragment?.access_token) return false;

      // Always clean the URL first so the token isn't bookmarked or leaked.
      history.replaceState(null, '', window.location.pathname + window.location.search);

      try {
         // Validate by fetching the actual user from Supabase, which rejects forged tokens.

        const sbUser = await fetchSupabaseUser(url, anonKey, fragment.access_token);
        storeSupabaseSession({
          access_token: fragment.access_token,
          refresh_token: fragment.refresh_token,
          expires_at: fragment.expires_at || Math.floor(Date.now() / 1000) + (fragment.expires_in || 3600),
          user: sbUser,
        });
        const payload = await resolveAuth(fragment.access_token, sbUser);
        if (payload) setAuth(payload);
      } catch {
         // Token invalid or Supabase unreachable; do not sign in.

        clearStoredSupabaseSession();
      }
      return true;
    }

    async function restoreSession() {
      let stored = readStoredSupabaseSession();
      if (!stored?.access_token) {
        stored = await refreshSupabaseSession();
        if (!stored?.access_token) return;
      }
      try {
        const sbUser = stored.user || await fetchSupabaseUser(url, anonKey, stored.access_token);
        const payload = await resolveAuth(stored.access_token, sbUser);
        if (payload) setAuth(payload);
      } catch {
        clearStoredSupabaseSession();
      }
    }

    handlePKCE().then(wasPKCE => {
      if (!wasPKCE) handleHash().then(wasHash => { if (!wasHash) restoreSession(); });
    }).catch(() => { clearStoredSupabaseSession(); });
  }, []);

  // Wire spaced-repetition Supabase sync for student sessions
  useEffect(() => {
    if (!auth || auth.role !== 'student' || !auth.studentId) return;
    const { studentId } = auth;
    enableSync((sid, list) => upsertReviewSchedule(sid, list));
    loadReviewSchedule(studentId).then(rows => {
      if (!rows.length) return;
      try {
        localStorage.setItem(`vv:reviewSchedule:${studentId}`, JSON.stringify(rows));
      } catch { /* storage unavailable */ }
    }).catch(e => console.warn('[review schedule] failed to load:', e));
  }, [auth]);

  // Production roster is always loaded from the configured data source.
  // Do not import or seed the local demo roster here: it contains identifiable
  // student data and must stay outside deployment bundles.
  useEffect(() => {
    let active = true;
    setStudentsLoading(true);
    setStudentsError(null);
    getStudents()
      .then((nextStudents) => {
        if (!active) return;
        setStudents(nextStudents);
      })
      .catch((error) => {
        if (!active) return;
        console.warn('[roster] failed to load:', error);
        setStudentsError(error);
      })
      .finally(() => {
        if (active) setStudentsLoading(false);
      });
    return () => { active = false; };
  }, [auth]);

  // Pending submissions badge (teacher shell). Declared here, above the

   // role-based early returns, so the hook order stays stable across the

   // logged-out → logged-in transition (otherwise React throws "Rendered more
   // hooks than during the previous render" and blanks the app on sign in).
  function refreshPending() {
    if (authRef.current?.role !== 'teacher') return;
    getAllSubmissions().then(list => {
      setPendingSubmissions((list || []).filter(s => s.status === 'submitted').length);
    }).catch(e => console.warn('[submissions] failed to load:', e));
  }

  useEffect(() => {
    refreshPending();
    const unsub = subscribeToTable('submissions', () => { refreshPending(); });
    return () => unsub();
  }, []);

  // Re-load students on updates
  useEffect(() => {
    const reload = () => getStudents().then(setStudents);
    window.addEventListener('vv:students-updated', reload);
    return () => window.removeEventListener('vv:students-updated', reload);
  }, []);

  useEffect(() => {
    if (window.__setTheme) window.__setTheme(darkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  function parseHash(hash) {
    const h = (hash || '').replace(/^#/, '');
    if (!h) return null;
    const parts = h.split('?');
    const view = parts[0] || '';
    const params = {};
    if (parts[1]) {
      new URLSearchParams(parts[1]).forEach((v, k) => { params[k] = v; });
    }
    return { view, params };
  }

  function buildHash(target, params = {}) {
    const qs = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return `#${target}${qs}`;
  }

  const navigate = useCallback((target, params = {}) => {
    const hash = buildHash(target, params);
    if (window.location.hash !== hash) {
      history.pushState(null, '', hash);
    }
    setView(target);
    setViewParams(params);
  }, []);
  const onWorkflowStage = (stageId) => {
    if (stageId === 'diagnose') navigate('diagnostics:create');
    else if (stageId === 'homework') navigate('homework:create');
    else if (stageId === 'feedback') navigate('submissions:review');
  };

  const paletteActions = [
    { id: 'dashboard', label: 'Today', target: 'dashboard', icon: <Icon.home size={16} />, keywords: ['home', 'today', 'main'] },
    { id: 'students', label: 'Students', target: 'students', icon: <Icon.student size={16} />, keywords: ['roster', 'list'] },
    { id: 'calendar', label: 'Calendar', target: 'calendar', icon: <Icon.calendar size={16} />, keywords: ['schedule', 'events'] },
    { id: 'diagnostics', label: 'Diagnose', target: 'diagnostics', icon: <Icon.diagnose size={16} />, keywords: ['assessment', 'test'] },
    { id: 'homework', label: 'Homework', target: 'homework', icon: <Icon.homework size={16} />, keywords: ['assignments', 'practice'] },
    { id: 'submissions', label: 'Review Submissions', target: 'submissions', icon: <Icon.doc size={16} />, keywords: ['grade', 'feedback'] },
    { id: 'library', label: 'Resources', target: 'library', icon: <Icon.book size={16} />, keywords: ['library', 'materials'] },
    { id: 'settings', label: 'Settings', target: 'settings', icon: <Icon.settings size={16} />, keywords: ['config', 'profile'] },
    { id: 'operations', label: 'Operations', target: 'operations', icon: <Icon.calendar size={16} />, keywords: ['cohorts', 'payments', 'schedule', 'attendance'] },
    { id: 'errors', label: 'Error Bank', target: 'diagnostics:errors', icon: <Icon.warning size={16} />, keywords: ['mistakes', 'bank'] },
    { id: 'mock-test', label: 'Take Mock Test', target: 'mock-test', icon: <Icon.practice size={16} />, keywords: ['mock test', 'take', 'start', 'exam', 'practice'] },
    { id: 'mock-test-eval', label: 'Question Evaluator', target: 'mock-test-eval', icon: <Icon.diagnose size={16} />, keywords: ['mock test', 'questions', 'evaluate', 'analysis'] },
    { id: 'mock-test-results', label: 'Mock Test Results', target: 'mock-test-results', icon: <Icon.practice size={16} />, keywords: ['mock test', 'submissions', 'results', 'scores'] },
    { id: 'inbox', label: 'Inbox', target: 'inbox', icon: <Icon.inbox size={16} />, keywords: ['messages', 'notifications'] },
    { id: 'writing-practice', label: 'Writing Practice', target: 'library:writing', icon: <Icon.doc size={16} />, keywords: ['writing', 'met', 'essay', 'grammar', 'practice'] },
    { id: 'speaking-eval', label: 'Speaking Evaluator', target: 'speaking-eval', icon: <Icon.mic size={16} />, keywords: ['speaking', 'evaluate', 'speech', 'MET', 'oral'] },
    { id: 'visual-editor', label: 'Visual Editor', target: 'visual-editor', icon: <Icon.edit size={16} />, keywords: ['visual', 'editor', 'grapesjs', 'landing', 'design'] },
    { id: 'social-studio', label: 'Social Studio', target: 'social-studio', icon: <Icon.doc size={16} />, keywords: ['social', 'linkedin', 'instagram', 'calendar', 'content'] },
  ];

  const executePaletteAction = (action) => {
    navigate(action.target);
    setIsPaletteOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }

        if (auth?.role === 'teacher' && !isPaletteOpen) {
          if (e.target.closest('input, textarea, [contenteditable]')) return;
          const key = e.key.toLowerCase();
          if (key === 'd') { navigate('diagnostics'); }
          else if (key === 'h') { navigate('homework'); }
          else if (key === 'r') { navigate('submissions'); }
          else if (key === 's') { navigate('students'); }
        } else if (auth?.role === 'student' && !isPaletteOpen) {
          if (e.target.closest('input, textarea, [contenteditable]')) return;
          const key = e.key.toLowerCase();
          if (key === 'h') { navigate('dashboard'); }
          else if (key === 'm') { navigate('mock-test'); }
          else if (key === 'f') { navigate('submissions'); }
          else if (key === 'p') { navigate('students:profile', { studentId: auth.studentId }); }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [auth, isPaletteOpen, navigate]);


  // Restore view from hash on back/forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash(window.location.hash);
      if (parsed && parsed.view && parsed.view !== view) {
        setView(parsed.view);
        setViewParams(parsed.params);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [view]);

  // Initialize view from URL hash after auth resolves
  useEffect(() => {
    if (!auth) return;
    const parsed = parseHash(window.location.hash);
    if (parsed && parsed.view) {
      setView(parsed.view);
      setViewParams(parsed.params);
    }
  }, [auth]);

  // Move focus to main content area on SPA navigation so screen readers
  // announce the new page without the user having to manually explore.
  useEffect(() => {
    const main = document.querySelector('.shell-main');
    if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
  }, [view]);



  const handleSignIn = async (payload) => {
    const stored = readStoredSupabaseSession() || payload;
    if (!stored?.access_token) return;
    const { url, anonKey } = getSupabaseConfig();
    try {
      const sbUser = stored.user || await fetchSupabaseUser(url, anonKey, stored.access_token);
      const resolved = await resolveAuth(stored.access_token, sbUser);
      if (resolved) setAuth(resolved);
    } catch (e) {
      console.warn('[Auth] sign-in resolution failed:', e);
      clearStoredSupabaseSession();
    }
  };
  const handleSignOut = () => {
    clearStoredSupabaseSession();
    setSessionRole('');
    setAuth(null);
    setView('dashboard');
    setViewParams({});
  };

  // ── Pending submissions badge (must be before conditional returns for hooks rule) ──
  useEffect(() => {
    if (auth?.role !== 'teacher') return;
    requestInboxNotificationPermission();
    refreshPending();
  }, [auth]);

  if (!auth) {
    if (publicView === 'landing') {
      return <LandingComplete
        onMemberSignIn={() => setPublicView('login')}
      />;
    }
    return <LoginScreen onSignIn={handleSignIn} onBack={() => setPublicView('landing')} />;
  }

  if (auth.role === 'student') {
    const student = students.find(s => s.id === auth.studentId) || (students.length > 0 ? students[0] : {
      id: auth.studentId || 'st_1',
      name: auth.displayName || 'Ana Silva',
      firstName: (auth.displayName || 'Ana Silva').split(' ')[0],
      email: auth.email || 'ana.silva@example.com',
      currentLevel: 'B1',
      targetLevel: 'B2',
      examGoal: 'Pass MET B2',
      cohort: 'B2-Alpha',
      band: 'B1',
      bandTarget: 'B2',
    });

    if (studentsLoading && students.length === 0) return <PageLoader label="Loading your student workspace…" />;
    if (studentsError && !student) return <WorkspaceLoadError onRetry={() => window.location.reload()} />;

    return (
      <>
        <OfflineBar />
        <a href="#student-content" className="skip-nav">Skip to content</a>
        <ErrorBoundary label="Dashboard unavailable">
          <Suspense fallback={<PageLoader />}>
            <StudentDashboard 
              student={student} 
              onSignOut={handleSignOut} 
            />
          </Suspense>
        </ErrorBoundary>
      </>
    );
  }

  // ── Teacher shell ──
  const teacherTabs = [
    { id: 'dashboard',   label: 'Today',        icon: <Icon.home size={16} /> },
    { id: 'students',    label: 'Students',     icon: <Icon.student size={16} /> },
    { id: 'calendar',    label: 'Calendar',     icon: <Icon.calendar size={16} /> },
    { id: 'diagnostics', label: 'Diagnose',     icon: <Icon.diagnose size={16} /> },
    { id: 'homework',    label: 'Homework',     icon: <Icon.homework size={16} /> },
    { id: 'submissions', label: 'Review',       icon: <Icon.doc size={16} />,     badge: pendingSubmissions || 0 },
    { id: 'library',     label: 'Resources',    icon: <Icon.book size={16} /> },
    { id: 'mock-test-results', label: 'Mock Tests', icon: <Icon.practice size={16} /> },
    { id: 'risk-dashboard', label: 'Risk', icon: <Icon.warning size={16} /> },
    { id: 'operations', label: 'Operations', icon: <Icon.calendar size={16} /> },
    { id: 'social-studio', label: 'Social', icon: <Icon.doc size={16} /> },
  ];

  const rightSlot = (
    <div className="shell-topbar-right">
      <button
        type="button"
        onClick={() => setDarkMode(v => !v)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className="shell-settings-btn"
        data-testid="dark-mode-toggle"
      >
        {darkMode ? <Icon.sun size={15} /> : <Icon.moon size={15} />}
      </button>
      <button
        type="button"
        onClick={() => navigate('settings')}
        aria-label="Settings"
        title="Settings"
        aria-current={view === 'settings' ? 'page' : undefined}
        className={`shell-settings-btn${view === 'settings' ? ' active' : ''}`}
        data-testid="settings-btn"
      >
        <Icon.settings size={15} />
      </button>
      <button type="button" onClick={handleSignOut} className="shell-settings-btn" aria-label="Sign out" title="Sign out" data-testid="sign-out-btn">
        <Icon.arrowL size={14} />
      </button>
    </div>
  );

  return (
    <>
      <OfflineBar data-testid="offline-bar" />
      <Shell tabs={teacherTabs} active={view} onTab={(id) => navigate(id)} rightSlot={rightSlot} workflowActive={workflowActive} onWorkflowStage={onWorkflowStage} data-testid="shell">
        <ErrorBoundary label="Page unavailable">
          <Suspense fallback={<PageLoader data-testid="page-loader" />}>
            <div key={view} className="page-enter" data-testid="page-enter">
              {renderTeacherPage(view, viewParams, { students, navigate, auth, teacherName: auth.displayName?.split(' ')[0] || 'Vini' })}
            </div>
          </Suspense>
        </ErrorBoundary>
      </Shell>
      <ToastHost data-testid="toast-host" />
      <CommandPalette 
        isOpen={isPaletteOpen} 
        data-testid="command-palette" 
        onClose={() => setIsPaletteOpen(false)} 
        onExecute={executePaletteAction} 
        actions={paletteActions}
      />
    </>
  );
}

function renderTeacherPage(view, params, ctx) {
  const { students, navigate, auth, teacherName } = ctx;

  switch (view) {
    case 'dashboard':
      return <TeacherDashboard students={students} onNavigate={navigate} teacherName={teacherName} data-testid="teacher-dashboard" />;

    case 'students':
      return <StudentsPage students={students} onNavigate={navigate} data-testid="students-page" />;

    case 'cohorts':
      return <CohortsPage onNavigate={navigate} data-testid="cohorts-page" />;

    case 'students:profile':
      return <StudentProfile studentId={params.studentId} students={students} onNavigate={navigate} data-testid="student-profile-page" />;

    case 'calendar':
      return <CalendarPage students={students} onNavigate={navigate} data-testid="calendar-page" />;

    case 'calendar:class':
      return <ClassRecord classEventId={params.classEventId} students={students} onNavigate={navigate} data-testid="class-record-page" />;

    case 'diagnostics':
      return <DiagnosticsPage students={students} onNavigate={navigate} data-testid="diagnostics-page" />;

    case 'diagnostics:create':
      return <DiagnosticCreate
        studentId={params.studentId}
        classEventId={params.classEventId}
        diagnosisId={params.diagnosisId}
        students={students}
        onNavigate={navigate}
        data-testid="diagnostic-create-page"
      />;

     case 'diagnostics:errors':
      return <ErrorBankPage students={students} onNavigate={navigate} data-testid="error-bank-page" />;

    case 'calendar:inbox':
      return <InboxPage students={students} onNavigate={navigate} data-testid="inbox-page" />;

    case 'homework':
      return <HomeworkPage students={students} onNavigate={navigate} data-testid="homework-page" />;

    case 'homework:create':
      return <HomeworkCreate
        diagnosisId={params.diagnosisId}
        studentId={params.studentId}
        students={students}
        onNavigate={navigate}
        data-testid="homework-create-page"
      />;

    case 'submissions':
      return <SubmissionsPage students={students} onNavigate={navigate} data-testid="submissions-page" />;

    case 'submissions:review':
      return <SubmissionReview
        submissionId={params.submissionId}
        students={students}
        onNavigate={navigate}
        data-testid="submission-review-page"
      />;

    case 'inbox':
      return <InboxPage students={students} onNavigate={navigate} data-testid="inbox-page" />;

    case 'error-bank':
      return <ErrorBankPage students={students} onNavigate={navigate} data-testid="error-bank-page" />;

    case 'risk-dashboard':
      return <RiskDashboard onNavigate={navigate} data-testid="risk-dashboard-page" />;

    case 'operations':
      return <OperationsPage onNavigate={navigate} data-testid="operations-page" />;

    case 'reports':
      return <ReportsPage students={students} onNavigate={navigate} data-testid="reports-page" />;

    case 'settings':
      return <SettingsPage onNavigate={navigate} data-testid="settings-page" />;

    case 'exercises':
      return <ExercisesPage onNavigate={navigate} data-testid="exercises-page" />;

    case 'perspective':
      return <PerspectiveDesigner students={students} onNavigate={navigate} data-testid="perspective-designer-page" />;

     case 'mock-test':
      return <MockTestPage students={students} onNavigate={navigate} auth={auth} data-testid="mock-test-page" />;

      case 'evaluation':
        return <TeacherEvaluationPage students={students} onNavigate={navigate} data-testid="evaluation-page" />;

     case 'library:writing':
      return <WritingPracticePage onNavigate={navigate} data-testid="writing-practice-page" />;

    case 'library':
    case 'library:exercises':
      return <ExercisesPage onNavigate={navigate} data-testid="exercises-page" />;

    case 'library:mock-test':
      return <MockTestPage students={students} onNavigate={navigate} auth={auth} data-testid="mock-test-results-page" />;

    case 'mock-test-results':
    case 'library:mock-test-results':
      return <MockTestResults onNavigate={navigate} data-testid="mock-test-results-page" />;

    case 'mock-test-eval':
      return <MockTestEvalPage data-testid="mock-test-eval-page" />;

    case 'library:evaluation':
      return <TeacherEvaluationPage students={students} onNavigate={navigate} data-testid="library-evaluation-page" />;

    case 'speaking-eval':
      return <SpeakingEvalPage data-testid="speaking-eval-page" />;

    case 'library:reports':
      return <ReportsPage students={students} onNavigate={navigate} data-testid="library-reports-page" />;

    case 'visual-editor':
      return <VisualEditorPage onNavigate={navigate} data-testid="visual-editor-page" />;

    case 'social-studio':
      return <SocialStudio data-testid="social-studio-page" />;

    default:
      return <TeacherDashboard students={students} onNavigate={navigate} teacherName={teacherName} data-testid="teacher-dashboard" />;
  }
}

function PageLoader({ label = 'Loading your workspace…' }) {
  return (
    <div className="skeleton-page" data-testid="page-loader" role="status" aria-live="polite">
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-text skeleton-text--wide" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text-short" />
      <p className="sr-only">{label}</p>
    </div>
  );
}

function WorkspaceLoadError({ onRetry, missingStudent = false }) {
  return (
    <main className="skeleton-page workspace-load-error" role="alert">
      <section className="workspace-load-error__card">
        <p className="eyebrow">MET Mastery</p>
        <h1>We couldn’t load your workspace</h1>
        <p>
          {missingStudent
            ? 'Your login worked, but your student profile is not available in the roster yet.'
            : 'Your login worked, but the student workspace could not be loaded right now.'}
        </p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button>
      </section>
    </main>
  );
}

function OfflineBar() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const goOn  = () => setOnline(true);
    const goOff = () => setOnline(false);
    window.addEventListener('online',  goOn);
    window.addEventListener('offline', goOff);
    return () => {
      window.removeEventListener('online',  goOn);
      window.removeEventListener('offline', goOff);
    };
  }, []);
  if (online) return null;
  return (
    <div role="status" aria-live="polite" data-testid="offline-bar" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--warning)', color: '#fff',
      padding: '9px 16px', textAlign: 'center',
      fontSize: 'var(--text-sm)', fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <span aria-hidden="true">⚠</span>
       No internet connection; changes may not save until you're back online

    </div>
  );
}
