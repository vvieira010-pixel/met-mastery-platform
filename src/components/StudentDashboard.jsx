import { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from './shared.jsx';
import StudentOnboardingTour from './StudentOnboardingTour.jsx';
import MetProgressPathGraph from './MetProgressPathGraph.jsx';
import CefrSkillGapFlags from './CefrSkillGapFlags.jsx';
import {
  getHomework,
  getDiagnoses,
  getClassEvents,
  getReviews,
  getSubmissions,
  getPracticeSubmissions,
  sendMessage,
} from '../lib/workflow.js';
import { getDueCount } from '../lib/spaced-repetition.js';
import { asArray, hasVisibleApprovedStudentFeedback, getSkillTrend } from '../pages/student-helpers.jsx';

/**
 * Maps MET raw/scaled score (0-80) to CEFR band descriptor.
 */
function getCefrBand(score) {
  const num = Number(score) || 0;
  if (num >= 64) return { level: 'C1', label: 'Advanced Operational', color: 'var(--success)' };
  if (num >= 53) return { level: 'B2', label: 'Vantage (Exam Target)', color: 'var(--primary)' };
  if (num >= 40) return { level: 'B1', label: 'Independent Learner', color: 'var(--warning)' };
  return { level: 'A2', label: 'Basic Foundation', color: 'var(--ink-muted)' };
}

/**
 * Format relative date helper
 */
function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.round((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function StudentDashboard({
  student,
  onNavigate,
  onTab,
  'data-testid': testId,
}) {
  const navigate = onNavigate || onTab || (() => {});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [homeworkList, setHomeworkList] = useState([]);
  const [diagnosesList, setDiagnosesList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [classEvents, setClassEvents] = useState([]);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [dueReviewsCount, setDueReviewsCount] = useState(0);

  // Quick feedback interaction state
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [understoodIds, setUnderstoodIds] = useState(new Set());
  const [completedTaskIds, setCompletedTaskIds] = useState(new Set());
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [progressViewMode, setProgressViewMode] = useState('skills'); // 'skills' | 'path'

  const studentId = student?.id;
  const studentName = student?.firstName || student?.name?.split(' ')[0] || 'Learner';

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!studentId) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [hw, dx, ev, rev, subs, practice] = await Promise.all([
        getHomework(studentId).catch(() => []),
        getDiagnoses(studentId).catch(() => []),
        getClassEvents(studentId).catch(() => []),
        getReviews(studentId).catch(() => []),
        getSubmissions(studentId).catch(() => []),
        getPracticeSubmissions({ studentId }).catch(() => []),
      ]);

      setHomeworkList(hw || []);
      setDiagnosesList(dx || []);
      setClassEvents(ev || []);
      setReviewsList(rev || []);
      setSubmissionsCount((subs || []).length);
      setPracticeSessions(practice || []);
      setDueReviewsCount(getDueCount(studentId) || 0);
    } catch (err) {
      console.warn('[StudentDashboard] Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /* ══════════════════════════════════════════════════════════════════
     1. CURRENT PROGRESS COMPUTATIONS
     ══════════════════════════════════════════════════════════════════ */
  const progressMetrics = useMemo(() => {
    const approvedDx = diagnosesList
      .filter(d => d.status === 'approved')
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const latestDx = approvedDx[0];
    const rawSnapshot = asArray(latestDx?.content?.section_snapshot);

    // Fallback standard MET 4-skill structure if empty snapshot
    const defaultSections = [
      { section: 'listening', label: 'Listening', target: 60, icon: '🎧' },
      { section: 'reading', label: 'Reading & Grammar', target: 60, icon: '📖' },
      { section: 'writing', label: 'Writing', target: 60, icon: '✍️' },
      { section: 'speaking', label: 'Speaking', target: 60, icon: '🎙️' },
    ];

    const skillBreakdown = defaultSections.map(def => {
      const snapItem = rawSnapshot.find(
        s => String(s.section).toLowerCase() === def.section ||
             String(s.section).toLowerCase().includes(def.section)
      );
      const score = snapItem ? Number(snapItem.score_0_80) || 0 : 0;
      const target = snapItem?.target ? Number(snapItem.target) : def.target;
      const trend = snapItem ? getSkillTrend(snapItem.section, approvedDx) : { dir: 'none' };

      return {
        ...def,
        score,
        target,
        evaluated: Boolean(snapItem?.evaluated || score > 0),
        trend,
        percent: Math.min(100, Math.round((score / 80) * 100)),
      };
    });

    const evaluatedScores = skillBreakdown.filter(s => s.score > 0).map(s => s.score);
    const overallAverage = evaluatedScores.length > 0
      ? Math.round(evaluatedScores.reduce((a, b) => a + b, 0) / evaluatedScores.length)
      : 52; // Default baseline

    const cefr = getCefrBand(overallAverage);

    // Study activity stats
    const totalPracticeDone = practiceSessions.length;
    const completedHomeworkCount = homeworkList.filter(
      h => ['submitted', 'reviewed', 'completed', 'corrected'].includes(h.status)
    ).length;

    return {
      overallAverage,
      cefr,
      skillBreakdown,
      totalPracticeDone,
      completedHomeworkCount,
      hasDiagnosticData: evaluatedScores.length > 0,
      lastEvaluatedAt: latestDx?.createdAt || null,
    };
  }, [diagnosesList, practiceSessions, homeworkList]);

  /* ══════════════════════════════════════════════════════════════════
     2. UPCOMING STUDY TASKS COMPUTATIONS
     ══════════════════════════════════════════════════════════════════ */
  const upcomingTasks = useMemo(() => {
    const tasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2.1 Homework Tasks
    homeworkList.forEach(hw => {
      const isDone = ['submitted', 'reviewed', 'completed', 'corrected'].includes(hw.status) || completedTaskIds.has(`hw-${hw.id}`);
      const dueDate = hw.dueDate ? new Date(hw.dueDate) : null;
      let urgency = 'normal';
      let dueLabel = 'No due date';

      if (dueDate) {
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          dueLabel = 'Overdue';
          urgency = 'high';
        } else if (diffDays === 0) {
          dueLabel = 'Due today';
          urgency = 'high';
        } else if (diffDays === 1) {
          dueLabel = 'Due tomorrow';
          urgency = 'medium';
        } else {
          dueLabel = `Due in ${diffDays} days (${dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`;
        }
      }

      tasks.push({
        id: `hw-${hw.id}`,
        rawId: hw.id,
        category: 'homework',
        typeLabel: 'Homework Assignment',
        title: hw.title || 'Assigned practice set',
        description: hw.instructions || hw.description || 'Complete the assigned exercises and submit for feedback.',
        dueLabel,
        urgency,
        isDone,
        actionLabel: isDone ? 'Review Submission' : 'Start Homework',
        targetTab: 'homework',
        icon: <Icon.homework size={16} />,
      });
    });

    // 2.2 Spaced Repetition Due Queue
    if (dueReviewsCount > 0) {
      tasks.push({
        id: 'task-spaced-rep',
        category: 'review',
        typeLabel: 'Spaced Repetition',
        title: `${dueReviewsCount} Error Bank Cards Due for Review`,
        description: 'Reinforce past mistakes and active vocabulary before memory decay occurs.',
        dueLabel: 'Recommended Daily',
        urgency: dueReviewsCount > 10 ? 'high' : 'medium',
        isDone: completedTaskIds.has('task-spaced-rep'),
        actionLabel: 'Start Review',
        targetTab: 'home',
        icon: <Icon.spark size={16} />,
      });
    }

    // 2.3 Upcoming Scheduled Classes
    const futureClasses = classEvents
      .filter(e => e.status !== 'cancelled')
      .map(e => ({
        ...e,
        startTimeObj: new Date(`${e.date || new Date().toISOString().slice(0, 10)}T${e.startTime || '12:00'}`),
      }))
      .filter(e => e.startTimeObj >= today)
      .sort((a, b) => a.startTimeObj - b.startTimeObj);

    if (futureClasses.length > 0) {
      const nextClass = futureClasses[0];
      const classDate = nextClass.startTimeObj;
      const timeStr = nextClass.startTime || 'TBD';

      tasks.push({
        id: `class-${nextClass.id}`,
        category: 'class',
        typeLabel: 'Live Class Session',
        title: nextClass.title || `Class: ${nextClass.metSkillFocus || 'MET Strategy Session'}`,
        description: nextClass.notes || `Scheduled with your teacher for ${timeStr}. Prepare your questions and practice notes.`,
        dueLabel: `${classDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at ${timeStr}`,
        urgency: 'medium',
        isDone: false,
        actionLabel: 'View Schedule',
        targetTab: 'home',
        icon: <Icon.calendar size={16} />,
      });
    }

    // 2.4 Quick Daily Practice Recommendation
    tasks.push({
      id: 'task-daily-drill',
      category: 'practice',
      typeLabel: 'Micro-Drill',
      title: 'Daily MET Diagnostic Micro-Practice (10 Mins)',
      description: 'Sharpen exam timing and question pacing with timed authentic questions.',
      dueLabel: 'Daily Target',
      urgency: 'low',
      isDone: completedTaskIds.has('task-daily-drill'),
      actionLabel: 'Open Practice Studio',
      targetTab: 'practice-studio',
      icon: <Icon.practice size={16} />,
    });

    return tasks;
  }, [homeworkList, dueReviewsCount, classEvents, completedTaskIds]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return upcomingTasks.filter(t => !t.isDone);
    if (taskFilter === 'completed') return upcomingTasks.filter(t => t.isDone);
    return upcomingTasks;
  }, [upcomingTasks, taskFilter]);

  /* ══════════════════════════════════════════════════════════════════
     3. RECENT TEACHER FEEDBACK LIST COMPUTATIONS
     ══════════════════════════════════════════════════════════════════ */
  const recentFeedbackList = useMemo(() => {
    const list = [];

    // 3.1 Feedback from Diagnostic Evaluations
    const approvedWithFeedback = diagnosesList
      .filter(hasVisibleApprovedStudentFeedback)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    approvedWithFeedback.slice(0, 4).forEach(dx => {
      const feedbackContent = dx.sections?.studentFeedback?.content || dx.content?.studentFeedback || '';
      list.push({
        id: `dx-${dx.id}`,
        rawDiagnosisId: dx.id,
        sourceType: 'Diagnostic Assessment',
        createdAt: dx.createdAt,
        content: feedbackContent,
        sectionScores: asArray(dx.content?.section_snapshot),
        teacherName: dx.teacherName || 'Teacher',
        focusSkill: dx.metSkillFocus || 'General MET Proficiency',
      });
    });

    // 3.2 Feedback from Homework Reviews
    const sortedReviews = [...reviewsList].sort(
      (a, b) => new Date(b.reviewedAt || b.createdAt || 0) - new Date(a.reviewedAt || a.createdAt || 0)
    );

    sortedReviews.slice(0, 3).forEach(rev => {
      const associatedHw = homeworkList.find(h => h.id === rev.homeworkId);
      list.push({
        id: `rev-${rev.id}`,
        sourceType: 'Homework Review',
        createdAt: rev.reviewedAt || rev.createdAt,
        content: rev.feedback || rev.notes || 'Great work on this submission.',
        score: rev.score,
        teacherName: 'Teacher',
        homeworkTitle: associatedHw?.title || 'Homework Exercise',
        focusSkill: associatedHw?.skill || 'Homework Submission',
      });
    });

    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
  }, [diagnosesList, reviewsList, homeworkList]);

  /* ══════════════════════════════════════════════════════════════════
     HANDLERS & ACTIONS
     ══════════════════════════════════════════════════════════════════ */
  const handleToggleTaskDone = (taskId, e) => {
    if (e) e.stopPropagation();
    setCompletedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleSendFeedbackReply = async (feedbackItem) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await sendMessage({
        fromStudentId: studentId,
        fromName: studentName,
        fromRole: 'student',
        toRole: 'teacher',
        diagnosisId: feedbackItem.rawDiagnosisId || null,
        type: 'feedback-reply',
        body: replyText.trim(),
      });
      window.toast?.('Reply sent to your teacher!', 'ok');
      setReplyText('');
      setReplyOpenId(null);
    } catch (err) {
      console.error('Failed to send reply:', err);
      window.toast?.('Could not send message. Please try again.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleMarkUnderstood = async (feedbackId, rawDiagnosisId) => {
    setUnderstoodIds(prev => new Set([...prev, feedbackId]));
    try {
      if (rawDiagnosisId) {
        await sendMessage({
          fromStudentId: studentId,
          fromName: studentName,
          fromRole: 'student',
          toRole: 'teacher',
          diagnosisId: rawDiagnosisId,
          type: 'feedback-understood',
          body: 'Student marked this feedback as understood.',
        });
      }
      window.toast?.('Marked as understood! Teacher notified.', 'ok');
    } catch {
      // Optimistically marked
    }
  };

  /* ══════════════════════════════════════════════════════════════════
     RENDER SKELETON / LOADING
     ══════════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }} data-testid={testId}>
        <div style={{
          height: 90,
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          marginBottom: 24,
          opacity: 0.6,
          animation: 'pulse 1.5s infinite ease-in-out',
        }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <div style={{ height: 260, background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
          <div style={{ height: 260, background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard-main" style={{ padding: '24px 16px 48px', maxWidth: 1120, margin: '0 auto' }} data-testid={testId}>
      {/* ── ONBOARDING TOUR ── */}
      <StudentOnboardingTour />

      {/* ── HEADER BANNER ── */}
      <section style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: 28,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 'var(--text-2xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: '4px 10px',
            borderRadius: 999,
            marginBottom: 8,
          }}>
            <Icon.spark size={13} /> Student Overview
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Welcome back, {studentName}
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.5, maxWidth: 580 }}>
            Here is your current Michigan English Test preparation progress, upcoming assignments, and recent teacher evaluations.
          </p>
        </div>

        {/* Quick Summary Pill Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('resources')}
            className="tab-resources"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary)',
            }}
            title="Switch to Resources tab"
          >
            <Icon.book size={16} />
            <span>Resources</span>
          </button>

          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>
              Target Readiness
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: progressMetrics.cefr.color }}>
              {progressMetrics.cefr.level} · {progressMetrics.overallAverage}/80
            </div>
          </div>

          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>
              Pending Tasks
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)' }}>
              {upcomingTasks.filter(t => !t.isDone).length}
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              cursor: 'pointer',
              color: 'var(--ink-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .15s ease',
            }}
            title="Refresh dashboard data"
          >
            <Icon.refresh size={16} className={refreshing ? 'spin-anim' : ''} />
          </button>
        </div>
      </section>

      {/* ── 3-COLUMN / MODULAR DASHBOARD GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}>

        {/* ══════════════════════════════════════════════════════════════════
           SECTION 1: CURRENT PROGRESS & SKILL READINESS
           ══════════════════════════════════════════════════════════════════ */}
        <div className="dashboard-overview" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon.progress size={17} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Current Progress
                </h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                  Estimated CEFR: {progressMetrics.cefr.label}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: 2, border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setProgressViewMode('skills')}
                  style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: progressViewMode === 'skills' ? 'var(--surface)' : 'transparent',
                    color: progressViewMode === 'skills' ? 'var(--primary)' : 'var(--ink-muted)',
                    boxShadow: progressViewMode === 'skills' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  Skills
                </button>
                <button
                  type="button"
                  onClick={() => setProgressViewMode('gaps')}
                  style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: progressViewMode === 'gaps' ? 'var(--surface)' : 'transparent',
                    color: progressViewMode === 'gaps' ? 'var(--primary)' : 'var(--ink-muted)',
                    boxShadow: progressViewMode === 'gaps' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  CEFR Flags
                </button>
                <button
                  type="button"
                  onClick={() => setProgressViewMode('path')}
                  style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: progressViewMode === 'path' ? 'var(--surface)' : 'transparent',
                    color: progressViewMode === 'path' ? 'var(--primary)' : 'var(--ink-muted)',
                    boxShadow: progressViewMode === 'path' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  Path Graph
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('progress')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>Full Analytics</span>
                <Icon.arrowR size={12} />
              </button>
            </div>
          </div>

          {progressViewMode === 'path' ? (
            <MetProgressPathGraph student={student} diagnoses={diagnosesList} />
          ) : progressViewMode === 'gaps' ? (
            <CefrSkillGapFlags
              snapshot={progressMetrics.skillBreakdown.map(s => ({ section: s.name, score_0_80: s.score }))}
              diagnoses={diagnosesList}
            />
          ) : (
            <>
              {/* Overall Score Dial / Hero Metric */}
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 18px',
                marginBottom: 20,
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: '0.04em' }}>
                    Overall Scaled Score
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>
                      {progressMetrics.overallAverage}
                    </span>
                    <span style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
                      / 80 pts
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: progressMetrics.cefr.color, fontWeight: 600, marginTop: 4 }}>
                    Band {progressMetrics.cefr.level} · {progressMetrics.overallAverage >= 53 ? 'Ready for Michigan Test' : 'In active training'}
                  </div>
                </div>

                {/* Target 53+ Badge */}
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  textAlign: 'right',
                }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Target Benchmark
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>53 (B2)</strong>
                </div>
              </div>

              {/* Individual MET Skills Progress Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {progressMetrics.skillBreakdown.map(sk => (
                  <div key={sk.section} style={{ fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span>{sk.icon}</span>
                        <span>{sk.label}</span>
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {sk.trend?.dir === 'up' && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--success)', fontWeight: 700 }}>↗ +{sk.trend.diff}</span>
                        )}
                        <span style={{ fontWeight: 700, color: sk.score > 0 ? 'var(--ink)' : 'var(--ink-muted)' }}>
                          {sk.score > 0 ? `${sk.score} / 80` : 'Not tested'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div style={{
                      height: 7,
                      width: '100%',
                      background: 'var(--bg-deep)',
                      borderRadius: 999,
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <div style={{
                        height: '100%',
                        width: '100%',
                        background: sk.score >= 53 ? 'var(--success)' : 'var(--primary)',
                        borderRadius: 999,
                        transform: `scaleX(${sk.percent / 100})`,
                        transformOrigin: 'left center',
                        transition: 'transform .4s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats Footer */}
              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px dashed var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.76rem',
                color: 'var(--ink-muted)',
              }}>
                <span>Completed: <strong>{progressMetrics.completedHomeworkCount}</strong></span>
                <span>Total Submissions: <strong>{submissionsCount}</strong></span>
                <span>Practice Drills: <strong>{progressMetrics.totalPracticeDone}</strong></span>
              </div>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
           SECTION 2: UPCOMING STUDY TASKS
           ══════════════════════════════════════════════════════════════════ */}
        <div className="upcoming-tasks" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--warning-bg)',
                color: 'var(--warning-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon.homework size={17} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Upcoming Study Tasks
                </h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                  {upcomingTasks.filter(t => !t.isDone).length} items remaining
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', padding: 2, borderRadius: 'var(--radius-sm)' }}>
              {['all', 'pending'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTaskFilter(f)}
                  style={{
                    background: taskFilter === f ? 'var(--surface)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: taskFilter === f ? 700 : 500,
                    color: taskFilter === f ? 'var(--ink)' : 'var(--ink-muted)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTasks.map(task => {
              const isUrgent = task.urgency === 'high';
              return (
                <div
                  key={task.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isUrgent && !task.isDone ? 'var(--warning)' : 'var(--border)',
                    background: task.isDone ? 'var(--bg)' : 'var(--surface)',
                    opacity: task.isDone ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    transition: 'all .15s ease',
                  }}
                >
                  {/* Task Completion Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleTaskDone(task.id, e)}
                    style={{
                      marginTop: 2,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: task.isDone ? 'var(--success)' : 'var(--ink-muted)',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={task.isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {task.isDone ? <Icon.check size={18} /> : <Icon.circle size={18} />}
                  </button>

                  {/* Task Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                      <strong style={{
                        fontSize: '0.85rem',
                        color: 'var(--ink)',
                        textDecoration: task.isDone ? 'line-through' : 'none',
                        lineHeight: 1.35,
                      }}>
                        {task.title}
                      </strong>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                        background: isUrgent && !task.isDone ? 'var(--warning-bg)' : 'var(--bg-deep)',
                        color: isUrgent && !task.isDone ? 'var(--warning-text)' : 'var(--ink-muted)',
                      }}>
                        {task.dueLabel}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 8px', fontSize: '0.76rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                      {task.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {task.icon} {task.typeLabel}
                      </span>

                      <button
                        type="button"
                        onClick={() => navigate(task.targetTab)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: '2px 4px',
                        }}
                      >
                        <span>{task.actionLabel}</span>
                        <Icon.arrowR size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--ink-muted)', fontSize: '0.84rem' }}>
                🎉 You are all caught up on study tasks!
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
           SECTION 3: QUICK-ACCESS LIST OF RECENT TEACHER FEEDBACK
           ══════════════════════════════════════════════════════════════════ */}
        <div className="recent-feedback" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon.feedback size={17} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Recent Teacher Feedback
                </h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                  Latest notes, strengths & recommendations
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('feedback')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>All Feedback</span>
              <Icon.arrowR size={12} />
            </button>
          </div>

          {/* Feedback Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recentFeedbackList.map(item => {
              const isUnderstood = understoodIds.has(item.id);
              const isReplying = replyOpenId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    position: 'relative',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        padding: '2px 7px',
                        borderRadius: 4,
                      }}>
                        {item.sourceType}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                        {formatRelativeDate(item.createdAt)}
                      </span>
                    </div>

                    {item.score !== undefined && item.score !== null && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
                        Score: {item.score}/10
                      </span>
                    )}
                  </div>

                  {/* Feedback Text Content */}
                  <div style={{
                    fontSize: '0.84rem',
                    color: 'var(--ink)',
                    lineHeight: 1.5,
                    marginBottom: 12,
                    fontStyle: 'italic',
                    borderLeft: '3px solid var(--accent)',
                    paddingLeft: 10,
                  }}>
                    "{item.content.length > 220 ? item.content.slice(0, 220) + '…' : item.content}"
                  </div>

                  {/* Actions / Reply Box */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleMarkUnderstood(item.id, item.rawDiagnosisId)}
                        disabled={isUnderstood}
                        style={{
                          background: isUnderstood ? 'var(--success-bg)' : 'var(--surface)',
                          border: '1px solid',
                          borderColor: isUnderstood ? 'var(--success)' : 'var(--border)',
                          color: isUnderstood ? 'var(--success)' : 'var(--ink)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: isUnderstood ? 'default' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Icon.check size={12} />
                        <span>{isUnderstood ? 'Understood' : 'Mark Understood'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReplyOpenId(isReplying ? null : item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Icon.edit size={12} />
                        <span>{isReplying ? 'Cancel' : 'Ask Question'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('practice-studio')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--ink-muted)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <span>Practise Skill</span>
                      <Icon.arrowR size={10} />
                    </button>
                  </div>

                  {/* Inline Question / Reply Input */}
                  {isReplying && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your question or clarification for the teacher..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: 'var(--surface)',
                          fontSize: '0.8rem',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleSendFeedbackReply(item)}
                          disabled={sendingReply || !replyText.trim()}
                          style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 12px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Icon.send size={12} />
                          <span>{sendingReply ? 'Sending...' : 'Send to Teacher'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {recentFeedbackList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--ink-muted)', fontSize: '0.84rem' }}>
                No recent feedback yet. Submit homework or complete a mock exam to receive personalized feedback.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
