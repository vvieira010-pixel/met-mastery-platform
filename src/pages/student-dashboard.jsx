import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Icon, Avatar } from '../components/shared.jsx';
import { getDiagnoses, getReviews } from '../lib/workflow.js';
import { hasVisibleApprovedStudentFeedback, asArray } from './student-helpers.jsx';
import { getStudentSetting, setStudentSetting } from '../lib/supabase-db.js';
import StudentHome from './student-home.jsx';
import StudentSettings from './student-settings.jsx';
import MockTestPage from './mock-test.jsx';
import { StudentInbox, MessageTeacherDock } from '../components/message-center.jsx';
import StudentOnboardingTour from '../components/StudentOnboardingTour.jsx';

const StudentHomework = lazy(() => import('./student-homework.jsx'));
const StudentFeedback = lazy(() => import('./student-feedback.jsx'));
const StudentProgress = lazy(() => import('./student-progress.jsx'));
const StudentResources = lazy(() => import('../components/StudentResources.jsx'));
const PracticeStudio = lazy(() => import('./practice-studio.jsx'));
const StudentSubjects = lazy(() => import('./student-subjects.jsx'));

const PRIMARY_TABS = [
  { id: 'home',           label: 'Home',          icon: <Icon.home size={16} /> },
  { id: 'practice-studio', label: 'Practice',     icon: <Icon.spark size={16} /> },
  { id: 'subjects',        label: 'Subjects',     icon: <Icon.book size={16} /> },
  { id: 'homework',       label: 'Homework',      icon: <Icon.homework size={16} /> },
  { id: 'feedback',       label: 'Feedback',      icon: <Icon.inbox size={16} />, dotKey: 'feedback' },
  { id: 'progress',       label: 'Progress',      icon: <Icon.progress size={16} />, dotKey: 'progress' },
  { id: 'resources',      label: 'Resources',     icon: <Icon.book size={16} /> },
];

const MORE_TABS = [
  { id: 'mock-test',      label: 'Mock Tests',    icon: <Icon.practice size={16} /> },
  { id: 'messages',       label: 'Messages',      icon: <Icon.feedback size={16} />, dotKey: 'messages' },
  { id: 'settings',       label: 'Settings',      icon: <Icon.settings size={16} /> },
];

const BOTTOM_NAV_TABS = [
  { id: 'home',       label: 'Home',          icon: <Icon.home size={18} /> },
  { id: 'practice-studio', label: 'Practice', icon: <Icon.spark size={18} /> },
  { id: 'subjects',        label: 'Subjects', icon: <Icon.book size={18} /> },
  { id: 'homework',   label: 'Homework',      icon: <Icon.homework size={18} /> },
  { id: 'feedback',   label: 'Feedback',      icon: <Icon.inbox size={18} /> },
  { id: 'progress',   label: 'Progress',      icon: <Icon.progress size={18} /> },
];

export default function StudentDashboard({ student, onSignOut, onSwitchRole, "data-testid": testId }) {
  const [activeTab, setActiveTab] = useState('home');
  const [dots, setDots] = useState({});
  const [moreOpen, setMoreOpen] = useState(false);

  const [lastVisited, setLastVisited] = useState({});

  useEffect(() => {
    if (!student?.id) return;
    getStudentSetting(student.id, 'last_visited').then(data => {
      if (data && typeof data === 'object') setLastVisited(data);
    }).catch(() => {});
  }, [student?.id]);

  useEffect(() => {
    if (!student?.id) return;
    (async () => {
      const lv = lastVisited;
      const [diagnoses, reviews] = await Promise.all([getDiagnoses(student.id), getReviews(student.id)]);
      const next = {};

      const approvedDx = (diagnoses || []).filter(hasVisibleApprovedStudentFeedback)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (approvedDx.length > 0) {
        const newestAt = new Date(approvedDx[0].createdAt || 0);
        const seenAt = lv.feedback ? new Date(lv.feedback) : new Date(0);
        if (newestAt > seenAt) next.feedback = true;
      }

      const newestReview = (reviews || []).sort((a, b) => new Date(b.reviewedAt || b.createdAt || 0) - new Date(a.reviewedAt || a.createdAt || 0))[0];
      if (newestReview) {
        const reviewedAt = new Date(newestReview.reviewedAt || newestReview.createdAt || 0);
        const seenAt = lv.homework ? new Date(lv.homework) : new Date(0);
        if (reviewedAt > seenAt) next.homework = true;
      }

      const progressDx = (diagnoses || [])
        .filter(d => d.status === 'approved')
        .filter(d => asArray(d.content?.section_snapshot).some(s => Number(s.score_0_80) > 0))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (progressDx.length > 0) {
        const newestAt = new Date(progressDx[0].createdAt || 0);
        const seenAt = lv.progress ? new Date(lv.progress) : new Date(0);
        if (newestAt > seenAt) next.progress = true;
      }

      setDots(next);
    })();
  }, [student?.id, lastVisited]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMoreOpen(false);
    const next = { ...lastVisited, [tabId]: new Date().toISOString() };
    setLastVisited(next);
    setStudentSetting(student.id, 'last_visited', next).catch(() => {});
  }

  if (!student) {
    return <div className="student-loading" data-testid={testId}><p>Loading your dashboard…</p></div>;
  }

  const tab = activeTab;
  const activeTabLabel = [...PRIMARY_TABS, ...MORE_TABS].find(item => item.id === tab)?.label || 'Student dashboard';

    const firstName = student.firstName || student.name?.split(' ')[0] || 'there';

    return (
      <div className="dash">
        <StudentOnboardingTour />
        <header className="dash-topbar" id="student-main" tabIndex={-1}>
          <button type="button" className="dash-brand" onClick={() => handleTabChange('home')} aria-label="MET Mastery student home">
            <span className="dash-brand-mark" aria-hidden="true">M</span>
            <span><strong>MET Mastery</strong><small>Student space</small></span>
          </button>
          <nav className="dash-top-nav" aria-label="Student navigation">
            {PRIMARY_TABS.map(item => (
              <button
                key={item.id}
                type="button"
                id={`tab-${item.id}`}
                className={`dash-nav-btn tab-${item.id}${tab === item.id ? ' active' : ''}`}
                aria-current={tab === item.id ? 'page' : undefined}
                aria-controls={tab === item.id ? `panel-${item.id}` : undefined}
                data-tour-target={item.id === 'practice-studio' ? 'practice-navigation' : undefined}
                onClick={() => handleTabChange(item.id)}
              >
                {item.icon}
                {item.label}
                {item.dotKey && dots[item.dotKey] && <span className="dash-nav-dot" aria-label={`${item.label} has new updates`} />}
              </button>
            ))}
            <div className="dash-more-menu">
              <button
                type="button"
                className={`dash-nav-btn${MORE_TABS.some(item => item.id === tab) ? ' active' : ''}`}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen(open => !open)}
              >
                More
              </button>
              {moreOpen && (
                <div className="dash-more-popover" role="menu" aria-label="More student options">
                  {MORE_TABS.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      id={`tab-${item.id}`}
                      role="menuitem"
                      className="dash-more-item"
                      aria-controls={`panel-${item.id}`}
                      onClick={() => handleTabChange(item.id)}
                    >
                      {item.icon}<span>{item.label}</span>
                      {item.dotKey && dots[item.dotKey] && <span className="dash-nav-dot" aria-label={`${item.label} has new updates`} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="dash-topbar-right">
            {onSwitchRole && (
              <button
                type="button"
                className="dash-nav-btn"
                data-testid="student-switch-role-btn"
                aria-label="Switch to Teacher View"
                title="Switch to Teacher View"
                onClick={onSwitchRole}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: 'var(--surface-sunken, rgba(0, 0, 0, 0.05))',
                }}
              >
                <Icon.teacher size={14} />
                <span className="hidden sm:inline">Teacher View</span>
              </button>
            )}
            <span className="dash-topbar-name">Hi, {firstName}</span>
            <button
              type="button"
              className="dash-nav-btn"
              aria-label="Sign out"
              title="Sign out"
              onClick={onSignOut}
            >
              <Icon.arrowL size={14} />
            </button>
          </div>
        </header>

        <main id="student-content" className="dash-body" aria-label={`${activeTabLabel} content`}>
            {tab === 'home' && <StudentHome student={student} onTab={handleTabChange} />}
            <Suspense fallback={<div className="student-suspense-fallback">Loading…</div>}>
               {tab === 'practice-studio' && <PracticeStudio studentId={student.id} onBack={() => handleTabChange('home')} />}
               {tab === 'subjects' && <StudentSubjects />}
               {tab === 'homework' && <StudentHomework student={student} />}
               {tab === 'mock-test' && <MockTestPage student={student} />}
               {tab === 'feedback' && <StudentFeedback student={student} onTab={handleTabChange} />}
               {tab === 'progress' && <StudentProgress student={student} />}
              {tab === 'resources' && <StudentResources student={student} onNavigate={handleTabChange} />}
              {tab === 'messages' && <StudentInbox student={student} />}
              {tab === 'settings' && <StudentSettings student={student} onSignOut={onSignOut} onNavigate={handleTabChange} />}
            </Suspense>
        </main>

        <nav className="dash-bottom-nav" aria-label="Student navigation (mobile)">
          {BOTTOM_NAV_TABS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`dash-nav-btn${tab === item.id ? ' active' : ''}`}
              aria-current={tab === item.id ? 'page' : undefined}
              data-tour-target={item.id === 'practice-studio' ? 'practice-navigation' : undefined}
              onClick={() => handleTabChange(item.id)}
            >
              {item.icon}
              <span className="dash-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <MessageTeacherDock student={student} onSent={() => handleTabChange('messages')} />
      </div>
    );
}
