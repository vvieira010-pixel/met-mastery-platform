/**
 * workflow-roster.js — Barrel file re-exporting from bounded domain modules.
 *
 * Decomposed from the original 555-line god file into focused domains:
 *   domain/inbox.js           — Messages, inbox, notifications
 *   domain/roster.js          — Students, cohorts, progress, reports, seeding
 *   domain/practice.js        — Practice assignments, resources, submissions, error bank
 *   domain/academic-records.js — Target profiles, class events, class evidence,
 *                                 vocabulary bank, progress notes
 *   domain/admin.js           — syncLocalToCloud, exportStudentData
 */

export { updateClassEventStatus } from './workflow-core.js';

/* ─── INBOX / NOTIFICATIONS ─────────────────────────────────── */
export {
  getInbox,
  sendMessage,
  markRead,
  requestInboxNotificationPermission,
} from '../domain/inbox.js';

/* ─── PROGRESS / GOALS ───────────────────────────────────────── */
export {
  getProgress,
  saveProgress,
  getStudentGoal,
  saveStudentGoal,
} from '../domain/roster.js';

/* ─── REPORTS ────────────────────────────────────────────────── */
export {
  getReports,
  saveReport,
} from '../domain/roster.js';

/* ─── STUDENT CRUD ───────────────────────────────────────────── */
export {
  getStudents,
  getStudent,
  saveStudent,
  deleteStudent,
  seedStudentsIfEmpty,
} from '../domain/roster.js';

/* ─── COHORTS ────────────────────────────────────────────────── */
export {
  getCohorts,
  getStudentCohorts,
  setStudentCohort,
} from '../domain/roster.js';

/* ─── PRACTICE ───────────────────────────────────────────────── */
export {
  getPracticeAssignments,
  savePracticeAssignment,
  deletePracticeAssignment,
  getPracticeResources,
  savePracticeResource,
  deletePracticeResource,
  getPracticeSubmissions,
  savePracticeSubmission,
  savePracticeSession,
} from '../domain/practice.js';

/* ─── ERROR BANK ─────────────────────────────────────────────── */
export {
  getErrorBank,
  promoteErrorToLongTerm,
  markErrorPracticed,
  markErrorSolved,
  incrementErrorAppearance,
  seedErrorBankFromProfile,
} from '../domain/practice.js';

/* ─── TARGET PROFILES ────────────────────────────────────────── */
export {
  TARGET_PROFILE_PRESETS,
  getTargetProfiles,
  getActiveTargetProfile,
  saveTargetProfile,
  setActiveTargetProfile,
  deleteTargetProfile,
} from '../domain/academic-records.js';

/* ─── CLASS EVENTS ───────────────────────────────────────────── */
export {
  getClassEvents,
  getClassEvent,
  saveClassEvent,
  deleteClassEvent,
} from '../domain/academic-records.js';

/* ─── CLASS EVIDENCE ─────────────────────────────────────────── */
export {
  getClassEvidence,
  saveClassEvidence,
  updateClassEvidence,
} from '../domain/academic-records.js';

/* ─── VOCABULARY BANK ────────────────────────────────────────── */
export {
  getVocabularyBank,
  saveVocabularyEntry,
  updateVocabularyEntry,
  deleteVocabularyEntry,
} from '../domain/academic-records.js';

/* ─── PROGRESS NOTES ─────────────────────────────────────────── */
export {
  getProgressNotes,
  saveProgressNote,
  deleteProgressNote,
} from '../domain/academic-records.js';

/* ─── PAYMENTS ──────────────────────────────────────────────── */
export {
  getPayments,
  savePayment,
  deletePayment,
  PAYMENT_METHODS,
} from '../domain/payments.js';

/* ─── SYNC / EXPORT ──────────────────────────────────────────── */
export {
  syncLocalToCloud,
  exportStudentData,
} from '../domain/admin.js';
