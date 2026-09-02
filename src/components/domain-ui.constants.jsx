/* ─── STUDENT FLOW ───────────────────────────────────────────── */
export const STUDENT_FLOW = [
  { id:'home', label:'Home' },
  { id:'do', label:'Do homework' },
  { id:'submit', label:'Submit' },
  { id:'review', label:'Review feedback' },
  { id:'improve', label:'Practice Studio' },
];

/* ─── WORKFLOW STAGE STRIP ───────────────────────────────────── */
export const WORKFLOW_STAGES = [
  { id:'diagnose', label:'1 · Diagnose' },
  { id:'feedback', label:'2 · Feedback' },
  { id:'homework', label:'3 · Homework' },
];

/* ─── REVIEW STATUS ──────────────────────────────────────────── */
export const STATUS_TONE = {
  'not-started':'muted', 'in-progress':'info', 'submitted':'warning',
  'corrected':'success', 'revision-requested':'danger', 'completed':'success',
  'draft':'muted', 'queued':'info', 'reviewed':'success', 'overdue':'danger',
};
export const STATUS_LABEL = {
  'not-started':'Not started', 'in-progress':'In progress', 'submitted':'Submitted',
  'corrected':'Corrected', 'revision-requested':'Revision needed', 'completed':'Completed',
  'draft':'Draft', 'queued':'Queued', 'reviewed':'Reviewed', 'overdue':'Overdue',
};