/**
 * The product's primary navigation model.
 *
 * Keep route IDs in the consuming shells, but use one shared vocabulary for
 * the work users are trying to complete. This prevents student and teacher
 * navigation from drifting into separate product languages.
 */
export const LEARNING_LOOP = Object.freeze([
  { id: 'class', label: 'Class', tab: 'home' },
  { id: 'feedback', label: 'Teacher feedback', tab: 'feedback' },
  { id: 'exercise', label: 'Exercise', tab: 'homework' },
  { id: 'review', label: 'Review and adjust', tab: 'feedback' },
  { id: 'next-class', label: 'Next class', tab: 'home' },
]);

export const STUDENT_NAV_GROUPS = Object.freeze([
  { id: 'today', label: 'Today', items: ['home'] },
  { id: 'learning', label: 'Learning loop', items: ['practice-studio', 'subjects', 'homework', 'feedback', 'progress'] },
  { id: 'support', label: 'Support', items: ['mock-test', 'resources', 'messages', 'settings'] },
]);

export const TEACHER_NAV_GROUPS = Object.freeze([
  { id: 'today', label: 'Today', items: ['dashboard'] },
  { id: 'learners', label: 'Learners', items: ['students'] },
  { id: 'learning-loop', label: 'Learning loop', items: ['diagnostics', 'homework', 'submissions'] },
  { id: 'plan', label: 'Plan and assess', items: ['calendar', 'mock-test-results', 'risk-dashboard'] },
  { id: 'library', label: 'Library', items: ['library'] },
]);

export function getWorkflowStageForView(view = '') {
  if (view.startsWith('diagnostics')) return 'diagnose';
  // The teacher workflow strip retains its existing route contract. The
  // product vocabulary calls this the practice/assignment phase, while the
  // legacy stage id remains homework for compatibility.
  if (view.startsWith('homework')) return 'homework';
  if (view.startsWith('submissions')) return 'feedback';
  return null;
}
