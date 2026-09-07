/**
 * diagnostic-create.jsx — Short diagnosis flow: prereqs → feedback first → review/save
 *
 * The most important page. Teacher must:
 * 1. Select target score profile (blocker)
 * 2. Confirm evaluated skills (blocker)
 * 3. Create an honest feedback draft immediately
 * 4. Save each optional, deeper phase only when it is needed
 * 5. Preview, edit, and approve the student-facing feedback
 *
 * Business logic lives in src/domain/assessment/:
 *   constants.js, diagnosis-utils.js, hooks/useSectionApproval.js, components/SectionContent.jsx
 */
import { useState, useEffect } from 'react';
import { Icon, SectionHeader, Pill, Breadcrumb } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { callAI } from '../components/shared.jsx';
import { parseAiJson } from '../lib/ai-helpers.js';
import { refreshForFailedDynamicImport } from '../lib/utils.js';
import { withSkills } from '../education-skills/active-skills.js';
import {
  buildSkillDiagnosisPrompt,
  buildCompactSkillDiagnosisPrompt,
  buildStudentFeedbackPrompt,
  buildHomeworkPrompt,
  buildErrorBankPrompt,
  buildSectionRegenPrompt,
} from '../lib/prompts.js';
import { TARGET_PROFILE_PRESETS } from '../lib/workflow.js';
import {
  getStudent, getStudents,
  getTargetProfiles, saveTargetProfile, setActiveTargetProfile,
  getClassEvent, getClassEvidence,
  getDiagnosis, saveDiagnosis, updateClassEventStatus,
  promoteErrorToLongTerm, saveVocabularyEntry, saveProgressNote,
} from '../lib/workflow.js';

import {
  SECTION_KEYS, SECTION_LABELS,
  DIAGNOSIS_DERIVED_KEYS, SECTION_GROUPS, SKILL_KEYS,
  CAMBRIDGE_FRAMEWORK_CATEGORIES,
} from '../domain/assessment/constants.js';
import {
  friendlyAiError,
  generateDiagnosisJson,
  normalizeDiagnosisJson,
  normalizeErrorTargets,
  normalizeEvidenceCounts, buildSnapshot,
} from '../domain/assessment/diagnosis-utils.js';
import { buildFeedbackDraft } from '../domain/assessment/feedback-draft.js';
import { useSectionApproval } from '../domain/assessment/hooks/useSectionApproval.js';
import { SectionContent, PrereqIcon, PrereqRow } from '../domain/assessment/components/SectionContent.jsx';
import { DiagnosisStepBar, DiagnosisGeneratingProgress, DiagnosisSavedActions } from '../domain/assessment/components/DiagnosisStepBar.jsx';

const DIAGNOSTIC_PHASES = [
  {
    id: 'feedback', number: 1, title: 'Student feedback',
    description: 'Create and save the editable student-facing feedback first.',
    action: 'Create feedback draft',
  },
  {
    id: 'analysis', number: 2, title: 'Evidence analysis', requires: ['feedback'],
    description: 'Generate the teacher analysis, scores, priorities, and next-class focus from the recorded evidence.',
    action: 'Create evidence analysis',
  },
  {
    id: 'targets', number: 3, title: 'Language targets', requires: ['analysis'],
    description: 'Extract errors plus vocabulary and grammar targets from the evidence.',
    action: 'Create language targets',
  },
  {
    id: 'homework', number: 4, title: 'Homework plan', requires: ['targets'],
    description: 'Create three student-ready tasks from the saved priorities and targets.',
    action: 'Create homework plan',
  },
];

function readStudentFeedbackResponse(data, emptyMessage = 'AI returned an empty feedback response. Try again.') {
  const raw = data?.content?.map(block => block.text || '').join('') || '';
  if (!raw.trim()) throw new Error(emptyMessage);
  const parsed = parseAiJson(raw);
  const content = parsed?.studentFeedback ?? parsed;
  if (
    !content || typeof content !== 'object' ||
    typeof content.classFocus !== 'string' ||
    !Array.isArray(content.whatYouDidWell) ||
    content.whatYouDidWell.length < 3 ||
    content.whatYouDidWell.some(item => !item || typeof item.strength !== 'string' || typeof item.explanation !== 'string' || typeof item.evidence !== 'string') ||
    !Array.isArray(content.whatToImprove) ||
    typeof content.finalNote !== 'string'
  ) {
    throw new Error('AI returned feedback without three complete strengths. Try again.');
  }
  return content;
}


export default function DiagnosticCreate({ studentId, classEventId, diagnosisId, students, teacherEmail, canApprove = true, onNavigate, "data-testid": testId }) {
  const [step, setStep] = useState('prereq'); // prereq | generating | review | saved
  const [student, setStudent] = useState(null);
  const [classEvent, setClassEvent] = useState(null);
  const [classEvidence, setClassEvidence] = useState(null);
  const [targetProfile, setTargetProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [savedDiagnosis, setSavedDiagnosis] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('Initializing…');
  const [completedPhases, setCompletedPhases] = useState([]);
  const [runningPhase, setRunningPhase] = useState(null);
  const [regenerationError, setRegenerationError] = useState(null);

  // Student selector (if no studentId passed)
  const [selectedStudentId, setSelectedStudentId] = useState(studentId || '');
  const [selectedClassEventId, setSelectedClassEventId] = useState(classEventId || '');
  const [allStudents, setAllStudents] = useState([]);

  // Teacher's own words (step 3 — write)
  const [teacherMeaning, setTeacherMeaning] = useState({ classSummary: '', studentFeedback: '', homeworkRecommendation: '' });

  // Inquiry fields (optional, for teacher inquiry cycles)
  const [isBaseline, setIsBaseline] = useState(false);
  const [interventionNote, setInterventionNote] = useState('');
  const [inquiryHypothesis, setInquiryHypothesis] = useState('');

  // Cambridge Teaching Framework self-evaluation
  const [cambridgeSelfEval, setCambridgeSelfEval] = useState(
    Object.fromEntries(CAMBRIDGE_FRAMEWORK_CATEGORIES.map(c => [c.id, '']))
  );

  // Section approval state (extracted to domain hook)
  const {
    sections, setSections,
    editingSection, setEditingSection,
    editText, setEditText,
    regenerating, setRegenerating,
    startEdit, saveEdit,
    toggleApprove, toggleHide, approveAll,
    approvedCount, totalSections,
    missingRequiredApprovals, canApproveDiagnosis,
  } = useSectionApproval();

  useEffect(() => {
    getStudents().then(setAllStudents);
  }, []);

  useEffect(() => {
    if (selectedStudentId) loadStudent(selectedStudentId);
  }, [selectedStudentId]);

  useEffect(() => {
    if (selectedClassEventId) loadClassData(selectedClassEventId);
  }, [selectedClassEventId]);

  useEffect(() => {
    if (diagnosisId) loadExistingDiagnosis(diagnosisId);
    else setStep('prereq');
  }, [diagnosisId]);

  async function loadStudent(sid, preferredProfileId = null) {
    const [s, tp] = await Promise.all([getStudent(sid), getTargetProfiles(sid)]);
    setStudent(s || allStudents.find(x => x.id === sid));
    setProfiles(tp);
    setTargetProfile(tp.find(p => p.id === preferredProfileId) || tp.find(p => p.isActive) || tp[0] || null);
  }

  async function loadClassData(ceid) {
    const [ev, evid] = await Promise.all([getClassEvent(ceid), getClassEvidence(ceid)]);
    setClassEvent(ev);
    setClassEvidence(evid);
  }

  async function loadExistingDiagnosis(dxId) {
    if (!dxId) return;
    const dx = await getDiagnosis(dxId);
    if (dx) {
      setSavedDiagnosis(dx);
      if (dx.studentId) {
        setSelectedStudentId(dx.studentId);
        await loadStudent(dx.studentId, dx.targetProfileId);
      }
      if (dx.classEventId) {
        setSelectedClassEventId(dx.classEventId);
        await loadClassData(dx.classEventId);
      }
      if (dx.sections) {
        setSections(dx.sections);
        setAiResult(dx.aiRaw || null);
      }
      // Earlier drafts predate saved phase metadata. They already have feedback
      // and should enter the new staged flow from the next optional phase.
      setCompletedPhases(dx.completedPhases || ['feedback']);
      setTeacherMeaning({
        classSummary: dx.content?.overall_result || dx.classSummary || '',
        studentFeedback: dx.content?.student_friendly_feedback || dx.sections?.studentFeedback?.content || '',
        homeworkRecommendation: dx.content?.homework || '',
      });
      setIsBaseline(dx.isBaseline || false);
      setInterventionNote(dx.interventionNote || '');
      setInquiryHypothesis(dx.inquiryHypothesis || '');
      if (dx.cambridgeSelfEval) setCambridgeSelfEval(dx.cambridgeSelfEval);
      setStep('review');
    } else {
      setError('Could not load that diagnosis; it may have been deleted.');
    }
  }

  // ── Inline evidence (when no class event linked) ──
  const [inlineTranscript, setInlineTranscript] = useState('');
  const [inlineTeacherNotes, setInlineTeacherNotes] = useState('');
  const [inlineSkills, setInlineSkills] = useState({
    evaluatedSpeaking: false, evaluatedWriting: false, evaluatedReading: false,
    evaluatedListening: false, evaluatedGrammar: false, evaluatedVocabulary: false, evaluatedTestStrategy: false,
    speakingEvidenceCount: 0, writingEvidenceCount: 0, readingEvidenceCount: 0,
    listeningEvidenceCount: 0, grammarEvidenceCount: 0, vocabularyEvidenceCount: 0, testStrategyEvidenceCount: 0,
  });

  // ── Prereq validation ──
  const selectedStudent = student || allStudents.find(s => s.id === selectedStudentId);
  const noLinkedEvidence = !classEvidence;
  const inlineEvidenceObj = noLinkedEvidence ? {
    ...inlineSkills,
    teacherNotes: inlineTeacherNotes,
    studentTranscript: inlineTranscript,
    studentAnswer: inlineTranscript,
  } : null;
  const evidence = classEvidence || inlineEvidenceObj;
  const normalizedEvidence = normalizeEvidenceCounts(evidence);

  const evaluatedSkills = normalizedEvidence ? Object.entries({
    speaking: normalizedEvidence.evaluatedSpeaking,
    writing: normalizedEvidence.evaluatedWriting,
    reading: normalizedEvidence.evaluatedReading,
    listening: normalizedEvidence.evaluatedListening,
    grammar: normalizedEvidence.evaluatedGrammar,
    vocabulary: normalizedEvidence.evaluatedVocabulary,
    testStrategy: normalizedEvidence.evaluatedTestStrategy,
  }).filter(([, v]) => v).map(([k]) => k) : [];

  const inlineReady = noLinkedEvidence
    ? (inlineTranscript.trim().length > 0 || inlineTeacherNotes.trim().length > 0) && evaluatedSkills.length > 0
    : evaluatedSkills.length > 0;

  const prereqOk = selectedStudent && targetProfile && inlineReady;

  function buildDiagnosisRecord({
    nextSections = sections,
    nextAiResult = aiResult,
    nextCompletedPhases = completedPhases,
    approve = false,
  } = {}) {
    const feedback = nextSections.studentFeedback || {};
    return {
      id: savedDiagnosis?.id,
      studentId: selectedStudentId || studentId,
      classEventId: selectedClassEventId || classEventId,
      targetProfileId: targetProfile?.id,
      evaluatedSkills: Object.fromEntries(evaluatedSkills.map(k => [k, true])),
      evidenceCounts: {
        speaking: normalizedEvidence?.speakingEvidenceCount || 0,
        writing: normalizedEvidence?.writingEvidenceCount || 0,
        reading: normalizedEvidence?.readingEvidenceCount || 0,
        listening: normalizedEvidence?.listeningEvidenceCount || 0,
        grammar: normalizedEvidence?.grammarEvidenceCount || 0,
        vocabulary: normalizedEvidence?.vocabularyEvidenceCount || 0,
        testStrategy: normalizedEvidence?.testStrategyEvidenceCount || 0,
      },
      // Keep the persisted record usable by older dashboards while retaining
      // the phase state needed to safely resume this flow.
      sections: {
        ...nextSections,
        studentFeedback: { ...feedback, content: feedback.content, approved: approve || Boolean(feedback.approved), hidden: false },
        profileUpdateSuggestions: nextSections.profileUpdateSuggestions || {
          content: { progressNote: '', suggestedLevelChange: 'No change yet.', recurringErrorsToTrack: [], masteredItems: [] },
          approved: approve,
        },
      },
      completedPhases: nextCompletedPhases,
      aiRaw: nextAiResult,
      status: approve ? 'approved' : 'draft',
      teacherApproved: approve,
      approvedBy: approve ? (teacherEmail || null) : (savedDiagnosis?.approvedBy || null),
      approvedAt: approve ? new Date().toISOString() : (savedDiagnosis?.approvedAt || null),
      cycleStage: approve ? 'diagnosed' : 'needs-diagnosis',
      classSummary: typeof nextSections.classSummary?.content === 'string' ? nextSections.classSummary.content : '',
      isBaseline,
      interventionNote,
      inquiryHypothesis,
      cambridgeSelfEval,
      content: {
        overall_result: (typeof nextSections.classSummary?.content === 'string' ? nextSections.classSummary.content : '') || '',
        priorities: nextSections.priorityDiagnosis?.content || [],
        student_friendly_feedback: feedback.content || null,
        homework: nextSections.homeworkRecommendation?.content?.instructions || '',
        error_bank: nextSections.errorBankSuggestions?.content || [],
        section_snapshot: buildSnapshot(nextSections.skillDiagnosis?.content),
      },
    };
  }

  async function persistDiagnosisDraft(options = {}) {
    const dx = await saveDiagnosis(buildDiagnosisRecord(options));
    setSavedDiagnosis(dx);
    return dx;
  }

  // ── Run AI diagnosis ──
  async function handleGenerate() {
    if (!prereqOk) return;
    setStep('generating');
    setGeneratingStatus('Analyzing class evidence…');
    setError('');
    if (!diagnosisId) setSavedDiagnosis(null);

    try {
      const FAILED = { content: 'Not generated. Create the matching phase when you are ready.', approved: false, hidden: false, edited: false };
      const fallbackDiagnosis = normalizeDiagnosisJson({}, normalizedEvidence);
      const feedbackDraft = buildFeedbackDraft({
        student: selectedStudent,
        classEvent,
        classEvidence: normalizedEvidence,
        evaluatedSkills,
      });
      const createSections = ({ diagnosis, feedback = { content: feedbackDraft, approved: false, hidden: false, edited: false }, errorBank, homework = FAILED } = {}) => ({
        skillDiagnosis:           { content: diagnosis.skillDiagnosis ?? null,                                                    approved: false, hidden: false, edited: false },
        studentFeedback:          feedback,
        homeworkRecommendation:   homework,
        errorBankSuggestions:     { content: errorBank?.errorBankSuggestions ?? [],                                              approved: false, hidden: false, edited: false },
        vocabGrammarTargets:      { content: errorBank?.vocabGrammarTargets ?? { vocabularyTargets: [], grammarTargets: [] },    approved: false, hidden: false, edited: false },
        readinessCheck:           { content: { targetProfileSelected: !!targetProfile, evaluatedSkills, notEvaluatedSkills: [], diagnosisAllowed: true }, approved: true, hidden: false, edited: false },
        classSummary:             { content: diagnosis.classSummary || '',                                                        approved: false, hidden: false, edited: false },
        targetScoreRelevance:     { content: diagnosis.targetScoreRelevance || {},                                                approved: false, hidden: false, edited: false },
        estimatedOverallScore:    { content: diagnosis.estimatedOverallScore || {},                                               approved: false, hidden: false, edited: false },
        priorityDiagnosis:        { content: diagnosis.priorityDiagnosis || [],                                                   approved: false, hidden: false, edited: false },
        nextClassFocus:           { content: diagnosis.nextClassFocus || {},                                                      approved: false, hidden: false, edited: false },
        profileUpdateSuggestions: { content: diagnosis.profileUpdateSuggestions || {},                                            approved: false, hidden: false, edited: false },
      });
      // Generate the editable student-facing feedback first. The feedback
      // prompt already contains its teaching, evidence, voice, and JSON rules,
      // so do not add the large optional education-skill attachments here.
      setGeneratingStatus('Writing personalized feedback…');
      let feedbackSection = { content: feedbackDraft, approved: false, hidden: false, edited: false };
      let feedbackWasAiGenerated = false;
      try {
        const aiFeedback = await callAI(buildStudentFeedbackPrompt({
          student: selectedStudent,
          classEvent,
          classEvidence: normalizedEvidence,
          targetProfile,
          diagnosis: fallbackDiagnosis,
        }), { max_tokens: 2600, temperature: 0.3 });
        feedbackSection = {
          content: readStudentFeedbackResponse(aiFeedback),
          approved: false,
          hidden: false,
          edited: false,
        };
        feedbackWasAiGenerated = true;
      } catch (feedbackError) {
        // Keep a truthful, editable draft available when an external provider
        // is unavailable; do not present this fallback as AI feedback.
        console.warn('Initial AI feedback generation failed:', feedbackError);
        window.toast?.('AI feedback was unavailable, so an editable evidence-based draft was created. You can edit it or try Regen later.', 'warn');
      }
      const feedbackSections = createSections({ diagnosis: fallbackDiagnosis, feedback: feedbackSection });
      setAiResult(fallbackDiagnosis);
      setSections(feedbackSections);
      setGeneratingStatus('Saving feedback draft…');
      let feedbackSaved = false;
      try {
        const draft = await persistDiagnosisDraft({
          nextSections: feedbackSections,
          nextAiResult: fallbackDiagnosis,
          nextCompletedPhases: ['feedback'],
        });
        if (draft) {
          setSavedDiagnosis(draft);
          feedbackSaved = true;
        }
      } catch (autoSaveErr) {
        console.warn('Feedback-first draft save failed:', autoSaveErr);
        window.toast?.('The feedback draft could not be saved yet. You can still edit it and retry Save Draft.', 'warn');
      }

      setCompletedPhases(feedbackSaved ? ['feedback'] : []);
      window.toast?.(feedbackWasAiGenerated
        ? 'AI feedback generated. Review, edit, and approve it now; other sections are optional.'
        : 'Feedback draft created. Review it, edit it, and try AI Regen later when the service is available.', 'ok');
      setStep('review');
    } catch (e) {
      console.error(e);
      setError(friendlyAiError(e));
      setStep('prereq');
    }
  }

  // ── Regenerate individual section ──
  async function regenerateSection(key) {
    setRegenerating(key);
    setRegenerationError(null);
    try {
      const existingSections = Object.fromEntries(Object.entries(sections).filter(([k]) => k !== key));
      let prompt;
      const promptData = {
        student: selectedStudent,
        classEvent,
        classEvidence: normalizedEvidence,
        targetProfile,
        diagnosis: aiResult,
        existingSections,
      };

      switch (key) {
        case 'skillDiagnosis':       prompt = buildSkillDiagnosisPrompt(promptData);    break;
        case 'studentFeedback':      prompt = buildStudentFeedbackPrompt(promptData);   break;
        case 'homeworkRecommendation': prompt = buildHomeworkPrompt(promptData);        break;
        case 'errorBankSuggestions':
        case 'vocabGrammarTargets':  prompt = buildErrorBankPrompt(promptData);         break;
        default:
          prompt = DIAGNOSIS_DERIVED_KEYS.has(key)
            ? buildCompactSkillDiagnosisPrompt(promptData)
            : buildSectionRegenPrompt(key, promptData);
      }

      const SECTION_BUDGETS = {
        studentFeedback: 1400, homeworkRecommendation: 3000, skillDiagnosis: 6000,
        priorityDiagnosis: 6000, classSummary: 6000, targetScoreRelevance: 6000,
        nextClassFocus: 6000, profileUpdateSuggestions: 6000, errorBankSuggestions: 2200,
      };
      const skillMap = { skillDiagnosis:'diagnosis', studentFeedback:'feedback', homeworkRecommendation:'homework', errorBankSuggestions:'diagnosis', vocabGrammarTargets:'diagnosis' };
      const maxTokens = key === 'studentFeedback'
        ? 2600
        : DIAGNOSIS_DERIVED_KEYS.has(key)
          ? Math.min(SECTION_BUDGETS[key] || 2500, 3000)
          : SECTION_BUDGETS[key] || 2000;
      // The feedback prompt already contains its precise student-safety and
      // voice rules. Do not append several long optional skill documents here:
      // they make a small retry unreliable and can crowd out the JSON result.
      const aiOptions = key === 'studentFeedback'
        ? { max_tokens: maxTokens, temperature: 0.3 }
        : await withSkills(skillMap[key] || 'diagnosis', { max_tokens: maxTokens });
      const data = await callAI(prompt, aiOptions);
      const raw = data.content?.map(b => b.text || '').join('') || '';
      if (!raw.trim()) throw new Error('AI returned an empty response. Try Regen again.');
      const parsed = DIAGNOSIS_DERIVED_KEYS.has(key)
        ? normalizeDiagnosisJson(parseAiJson(raw), normalizedEvidence)
        : parseAiJson(raw);
      if (!parsed || (typeof parsed === 'object' && Object.keys(parsed).length === 0)) {
        throw new Error('AI returned content that could not be read. Try Regen again.');
      }
      const content = key === 'studentFeedback'
        ? readStudentFeedbackResponse(data, 'AI returned an empty feedback response. Try Regen again.')
        : parsed[key] ?? parsed;
      setSections(s => ({ ...s, [key]: { ...(s[key] || {}), content, approved: false } }));
      window.toast?.('Section regenerated. Review it, then save the diagnosis.', 'ok');
    } catch (e) {
      // An open page can briefly point at an old code-split asset after a
      // deployment. Reload once into the current bundle rather than making
      // the teacher decipher a browser-level import error.
      if (refreshForFailedDynamicImport(e)) return;
      const message = `Regeneration failed: ${e.message}`;
      setRegenerationError({ key, message });
      window.toast?.(message, 'warn');
    } finally {
      setRegenerating(null);
    }
  }

  async function runDiagnosticPhase(phaseId) {
    const phase = DIAGNOSTIC_PHASES.find(item => item.id === phaseId);
    if (!phase || phaseId === 'feedback') return;
    if ((phase.requires || []).some(required => !completedPhases.includes(required))) {
      window.toast?.('Finish and save the earlier phase first.', 'warn');
      return;
    }

    setRunningPhase(phaseId);
    try {
      const promptData = {
        student: selectedStudent,
        classEvent,
        classEvidence: normalizedEvidence,
        targetProfile,
        diagnosis: aiResult,
        existingSections: sections,
        errorBank: sections.errorBankSuggestions?.content,
        vocabTargets: sections.vocabGrammarTargets?.content,
      };
      let nextSections = sections;
      let nextAiResult = aiResult;

      if (phaseId === 'analysis') {
        const { parsed: analysis } = await generateDiagnosisJson(promptData);
        nextAiResult = { ...(aiResult || {}), ...analysis };
        nextSections = { ...sections };
        DIAGNOSIS_DERIVED_KEYS.forEach(key => {
          nextSections[key] = { ...(sections[key] || {}), content: analysis[key], approved: false, hidden: false, edited: false };
        });
      } else if (phaseId === 'targets') {
        const data = await callAI(buildErrorBankPrompt(promptData), await withSkills('diagnosis', { max_tokens: 3000 }));
        const raw = data.content?.map(block => block.text || '').join('') || '';
        if (!raw.trim()) throw new Error('AI returned an empty response. Try the phase again.');
        const targets = normalizeErrorTargets(parseAiJson(raw));
        nextAiResult = { ...(aiResult || {}), ...targets };
        nextSections = {
          ...sections,
          errorBankSuggestions: { ...(sections.errorBankSuggestions || {}), content: targets.errorBankSuggestions, approved: false, hidden: false, edited: false },
          vocabGrammarTargets: { ...(sections.vocabGrammarTargets || {}), content: targets.vocabGrammarTargets, approved: false, hidden: false, edited: false },
        };
      } else if (phaseId === 'homework') {
        const data = await callAI(buildHomeworkPrompt(promptData), await withSkills('homework', { max_tokens: 3000 }));
        const raw = data.content?.map(block => block.text || '').join('') || '';
        if (!raw.trim()) throw new Error('AI returned an empty response. Try the phase again.');
        const homework = parseAiJson(raw);
        if (!homework || (typeof homework === 'object' && Object.keys(homework).length === 0)) {
          throw new Error('AI returned homework that could not be read. Try the phase again.');
        }
        const content = homework.homeworkRecommendation || homework;
        nextAiResult = { ...(aiResult || {}), homeworkRecommendation: content };
        nextSections = {
          ...sections,
          homeworkRecommendation: { ...(sections.homeworkRecommendation || {}), content, approved: false, hidden: false, edited: false },
        };
      }

      const nextCompletedPhases = [...new Set([...completedPhases, phaseId])];
      await persistDiagnosisDraft({ nextSections, nextAiResult, nextCompletedPhases });
      setAiResult(nextAiResult);
      setSections(nextSections);
      setCompletedPhases(nextCompletedPhases);
      window.toast?.(`${phase.title} saved. Review it before approving the diagnosis.`, 'ok');
    } catch (phaseError) {
      if (refreshForFailedDynamicImport(phaseError)) return;
      window.toast?.(`${phase.title} was not saved: ${friendlyAiError(phaseError)}`, 'warn');
    } finally {
      setRunningPhase(null);
    }
  }

  // ── Save diagnosis ──
  async function handleSave(approve = false) {
    setSaving(true);
    try {
      if (approve && canApprove === false) {
        window.toast?.('Only the teacher can approve a diagnosis.', 'warn');
        setSaving(false);
        return;
      }
      if (approve && !canApproveDiagnosis) {
        const missing = missingRequiredApprovals.map(key => SECTION_LABELS[key]).join(', ');
        window.toast?.(`Approve required sections first: ${missing}`, 'warn');
        setSaving(false);
        return;
      }
      const nextCompletedPhases = sections.studentFeedback?.content
        ? [...new Set([...completedPhases, 'feedback'])]
        : completedPhases;
      await persistDiagnosisDraft({ approve, nextCompletedPhases });
      setCompletedPhases(nextCompletedPhases);
      if (selectedClassEventId || classEventId) {
        await updateClassEventStatus(selectedClassEventId || classEventId, { diagnosticStatus: approve ? 'approved' : 'draft' });
      }
      window.toast?.(approve ? 'Diagnosis approved and saved!' : 'Draft saved.', 'ok');
      if (approve) setStep('saved');
    } catch (e) {
      window.toast?.(`Save failed: ${e.message}`, 'warn');
    }
    setSaving(false);
  }

  // ── Post-approval actions ──
  async function saveErrorsToBank() {
    const errors = sections.errorBankSuggestions?.content;
    if (!Array.isArray(errors)) { window.toast?.('No errors to save.', 'warn'); return; }
    let saved = 0;
    for (let i = 0; i < errors.length; i++) {
      const err = errors[i];
      if (err.saveToProfile !== false) {
        await promoteErrorToLongTerm(savedDiagnosis.id, i, selectedStudentId || studentId);
        saved++;
      }
    }
    window.toast?.(`${saved} error${saved !== 1 ? 's' : ''} saved to error bank.`, 'ok');
  }

  async function saveVocabToBank() {
    const vocabTargets = sections.vocabGrammarTargets?.content?.vocabularyTargets;
    if (!Array.isArray(vocabTargets)) { window.toast?.('No vocabulary to save.', 'warn'); return; }
    for (const v of vocabTargets) {
      await saveVocabularyEntry({
        studentId: selectedStudentId || studentId,
        wordOrPhrase: v.wordOrPhrase || v.word,
        category: v.category || 'general',
        meaning: v.meaning || '',
        exampleSentence: v.exampleSentence || '',
        evidenceSource: { diagnosisId: savedDiagnosis?.id },
      });
    }
    window.toast?.(`${vocabTargets.length} words saved to vocabulary bank.`, 'ok');
  }

  async function saveProgressNoteFromDx() {
    const note = sections.profileUpdateSuggestions?.content?.progressNote;
    if (!note) { window.toast?.('No progress note in diagnosis.', 'warn'); return; }
    await saveProgressNote({ studentId: selectedStudentId || studentId, sourceType: 'diagnosis', sourceId: savedDiagnosis?.id, note });
    window.toast?.('Progress note saved.', 'ok');
  }

  // ── Target profile selection ──
  async function selectPreset(key) {
    const preset = TARGET_PROFILE_PRESETS[key];
    const sid = selectedStudentId || studentId;
    let existing = profiles.find(p => p.profileName === preset.profileName);
    if (!existing) {
      existing = await saveTargetProfile({ ...preset, studentId: sid, isActive: true });
    }
    await setActiveTargetProfile(sid, existing.id);
    const updated = await getTargetProfiles(sid);
    setProfiles(updated);
    setTargetProfile(updated.find(p => p.id === existing.id) || existing);
    window.toast?.(`Target profile set: ${preset.label}`, 'ok');
  }

  // ── Render ──
  if (step === 'generating') {
    return <DiagnosisGeneratingProgress generatingStatus={generatingStatus} />;
  }

  if (step === 'saved') {
    return (
      <DiagnosisSavedActions
        onBack={() => setStep('review')}
        onSaveErrors={saveErrorsToBank}
        onSaveVocab={saveVocabToBank}
        onSaveProgressNote={saveProgressNoteFromDx}
        onCreateHomework={() => onNavigate('homework:create', { studentId: selectedStudentId || studentId, diagnosisId: savedDiagnosis?.id })}
        onDoneViewAll={() => onNavigate('diagnostics', {})}
      />
    );
  }

  return (
    <div className="page-shell-md" data-testid={testId}>
      <Breadcrumb crumbs={[{ label: 'Diagnostics', onClick: () => onNavigate('diagnostics') }, { label: 'Create Diagnosis' }]} />

      <SectionHeader
        title="AI Diagnosis"
        sub={selectedStudent
          ? `Diagnosing ${selectedStudent.name || selectedStudent.firstName || 'Student'}`
          : 'Select a student to begin'}
        action={savedDiagnosis && <Pill tone={savedDiagnosis.status === 'approved' ? 'success' : 'warning'}>{savedDiagnosis.status}</Pill>}
      />
      {savedDiagnosis?.approvedBy && (
        <p className="card-row-meta">Approved by {savedDiagnosis.approvedBy}{savedDiagnosis.approvedAt ? ` · ${new Date(savedDiagnosis.approvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p>
      )}

      <DiagnosisStepBar step={step} />

      {/* ── STEP: PREREQ ── */}
      {step === 'prereq' && (
        <div className="stack-list-lg">

          {/* Student selector */}
          {!studentId && (
            <Card className="card-p-4">
              <label className="field-label">Student</label>
              <select
                className="select"
                value={selectedStudentId}
                onChange={e => { setSelectedStudentId(e.target.value); setSelectedClassEventId(''); setClassEvidence(null); setClassEvent(null); }}
              >
                <option value="">– Select student –</option>
                {(students || allStudents).map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.firstName || s.id}</option>
                ))}
              </select>
            </Card>
          )}

          {/* Target profile */}
          {selectedStudent && (
            <Card className="card-p-4">
              <div className="flex-row-gap3 mb-3">
                <PrereqIcon ok={!!targetProfile} required />
                <label className="field-label">Target Score Profile</label>
              </div>
              {profiles.length > 0 ? (
                <select className="select" value={targetProfile?.id || ''} onChange={e => setTargetProfile(profiles.find(p => p.id === e.target.value) || null)}>
                  <option value="">– Select profile –</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.profileName || p.label}</option>)}
                </select>
              ) : (
                <div>
                  <p className="card-row-meta mb-3">No profiles. Pick a preset to create one:</p>
                  <div className="flex-wrap-row">
                    {Object.entries(TARGET_PROFILE_PRESETS).map(([key, preset]) => (
                      <Button key={key} variant="ghost" size="sm" onClick={() => selectPreset(key)}>{preset.label}</Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Class evidence */}
          {selectedStudent && (
            <Card className="card-p-4">
              <div className="flex-row-gap3 mb-3">
                <PrereqIcon ok={evaluatedSkills.length > 0 && inlineReady} required />
                <label className="field-label">Class Evidence</label>
              </div>

              {/* Class event selector */}
              {!classEventId && (
                <div className="mb-3">
                  <label className="field-label">Link a class record (optional)</label>
                  <input
                    className="input mb-2"
                    placeholder="Class event ID (optional)"
                    value={selectedClassEventId}
                    onChange={e => setSelectedClassEventId(e.target.value)}
                  />
                </div>
              )}

              {/* Linked class evidence pills */}
              {classEvidence && (
                <div className="mb-3">
                  <p className="card-row-meta mb-2">Skills evaluated in the linked class:</p>
                  <div className="flex-wrap-row">
                    {SKILL_KEYS.map(({ key, evalKey, countKey }) => {
                      const evaluated = classEvidence[evalKey];
                      const count = countKey ? classEvidence[countKey] : null;
                      return (
                        <Pill key={key} tone={evaluated ? (count === 0 ? 'warning' : 'success') : 'muted'}>
                          {key}{evaluated && count !== null ? ` (${count})` : ''}
                          {evaluated && count === 0 ? <Icon.warning size={12} /> : ''}
                        </Pill>
                      );
                    })}
                  </div>
                  {classEventId && <Button variant="ghost" size="sm" className="mt-3" onClick={() => onNavigate('calendar:class', { classEventId })}>Edit Class Record</Button>}
                </div>
              )}

              {/* No linked class — inline input form */}
              {noLinkedEvidence && (
                <div className="mt-4">
                  <p className="card-row-meta mb-3">
                    No class linked. Paste your transcript and select which skills were covered. The AI will only diagnose what you evaluated.
                  </p>

                  <label className="field-label">Class transcript / student answers *</label>
                  <textarea
                    className="input mb-3"
                    rows={8}
                    value={inlineTranscript}
                    onChange={e => setInlineTranscript(e.target.value)}
                    placeholder="Paste the student's exact words, speaking answer, writing sample, or transcript here. Quote errors directly. This is what the AI will analyze..."
                  />

                  <label className="field-label">Teacher notes (optional)</label>
                  <textarea
                    className="input mb-4"
                    rows={2}
                    value={inlineTeacherNotes}
                    onChange={e => setInlineTeacherNotes(e.target.value)}
                    placeholder="Observations, main difficulty, student mood..."
                  />

                  <label className="field-label mb-2">Skills evaluated in this class *</label>
                  <div className="grid-auto-fill-md">
                    {SKILL_KEYS.map(({ key, evalKey, countKey }) => {
                      const evaluated = inlineSkills[evalKey];
                      return (
                        <div key={key} className="skill-chip-wrapper">
                        <button type="button"
                          className={`skill-chip${evaluated ? ' active' : ''}`}
                          onClick={() => setInlineSkills(s => {
                            const newVal = !s[evalKey];
                            return {
                              ...s,
                              [evalKey]: newVal,
                              ...(countKey ? { [countKey]: newVal ? Math.max(1, Number(s[countKey] || 0)) : 0 } : {}),
                            };
                          })}
                        >
                          <div className="flex-row-gap2">
                            <span className="skill-chip-check">
                              {evaluated && <Icon.check size={10} color="#fff" />}
                            </span>
                            <span className={`text-xs font-semibold ${evaluated ? 'text-primary' : ''}`}>{key}</span>
                          </div>
                        </button>
                        {evaluated && countKey && (
                          <div className="skill-chip-count-wrap">
                            <span className="text-2xs text-muted">Evidence items:</span>
                            <input type="number" min={1} max={30} value={inlineSkills[countKey]}
                              onChange={e => setInlineSkills(s => ({ ...s, [countKey]: Math.max(1, Number(e.target.value) || 1) }))}
                              className="skill-count-input" />
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                  {evaluatedSkills.length === 0 && (
                    <p className="card-row-meta mt-2" style={{ color: 'var(--danger)' }}><Icon.warning size={12} /> Select at least one skill that was covered in class.</p>
                  )}
                  {!inlineTranscript.trim() && !inlineTeacherNotes.trim() && evaluatedSkills.length > 0 && (
                    <p className="card-row-meta mt-2" style={{ color: 'var(--warning)' }}><Icon.warning size={12} /> Paste a transcript or add teacher notes — the AI needs evidence to diagnose.</p>
                  )}
                </div>
              )}
            </Card>
          )}

          {error && (
            <div className="alert-box danger">
              {error}
            </div>
          )}

          {/* ── Prereq checklist ── */}
          {!prereqOk && (
            <Card className="card-p-4 prereq-checklist">
              <div className="text-xs font-bold text-muted text-uppercase letter-spacing-01 mb-3">
                Complete these to run diagnosis
              </div>
              <div className="flex-col-gap2">
                <PrereqRow done={!!selectedStudent} label="Select a student from the dropdown above" />
                <PrereqRow done={!!targetProfile} label="Choose a target score profile (or pick a preset like B1 / C1)" />
                <PrereqRow
                  done={inlineReady}
                  label={noLinkedEvidence
                    ? 'Paste a transcript or teacher notes AND toggle at least one evaluated skill'
                    : 'At least one evaluated skill in the linked class'}
                />
              </div>
            </Card>
          )}

          <div>
            <Button variant="primary" className="text-base" style={{ padding: '12px 24px' }} onClick={handleGenerate} disabled={!prereqOk}>
              <Icon.diagnose size={16} /> Create Feedback Draft
            </Button>
            {!prereqOk && (
              <p className="card-row-meta mt-2">
                {!selectedStudent ? 'Step 1: Select a student →' : ''}
                {!targetProfile ? ' Step 2: Pick a target score profile →' : ''}
                {!inlineReady ? ' Step 3: Add evidence →' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP: WRITE (Teacher writes in own words) ── */}
      {step === 'write' && (
        <div className="mt-5">
          <div className="grid-2col">
            {/* Left: AI data summary */}
            <div>
              <SectionHeader title="AI Diagnosis Data" icon={<Icon.diagnose size={14} />} />
              <Card small className="mt-2">
                {sections.skillDiagnosis?.content && (() => {
                  const skills = buildSnapshot(sections.skillDiagnosis.content);
                  return (
                    <div className="grid-auto-fill-sm">
                      {skills.map(s => {
                        const isLowConf = s.confidenceLabel && !['Diagnostic estimate', 'Mock-test estimate', 'Official score imported manually'].includes(s.confidenceLabel);
                        return (
                          <div key={s.section} className={`dx-skill-card${isLowConf ? ' dx-skill-card--warn' : ''}`}>
                            <div className="text-2xs text-muted text-uppercase">{s.section}</div>
                            <div className="font-bold text-lg">{s.score_0_80 ?? '—'}</div>
                            {s.confidenceLabel && (
                              <div className={`text-2xs mt-1 ${isLowConf ? 'text-warning text-italic' : 'text-muted'}`}>{s.confidenceLabel}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                {sections.priorityDiagnosis?.content?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-2xs font-bold text-muted text-uppercase letter-spacing-01 mb-2">AI Priorities</div>
                    {sections.priorityDiagnosis.content.slice(0, 3).map((p, i) => (
                      <div key={i} className="text-xs priority-row">{p.skill ? <strong>{p.skill}: </strong> : ''}{p.area || p.focus || p.reason || '—'}</div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Teacher writes */}
            <div>
              <SectionHeader title="Your Analysis" icon={<Icon.edit size={14} />} />
              <div className="flex-col-gap4 mt-2">
                <div>
                  <label className="field-label">Class Summary</label>
                  <textarea className="dx-textarea" value={teacherMeaning.classSummary} onChange={e => setTeacherMeaning(t => ({ ...t, classSummary: e.target.value }))}
                    rows={3} placeholder="What happened in class today? Summarize the lesson and the student's general performance…" />
                </div>
                <div>
                  <label className="field-label">Student Feedback</label>
                  <textarea className="dx-textarea" value={teacherMeaning.studentFeedback} onChange={e => setTeacherMeaning(t => ({ ...t, studentFeedback: e.target.value }))}
                    rows={4} placeholder="What will you tell the student? One strength, one improvement focus, one next step…" />
                </div>
                <div>
                  <label className="field-label">Homework Recommendation</label>
                  <textarea className="dx-textarea" value={teacherMeaning.homeworkRecommendation} onChange={e => setTeacherMeaning(t => ({ ...t, homeworkRecommendation: e.target.value }))}
                    rows={2} placeholder="Brief description of what the student should practice next…" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Inquiry fields ── */}
          <div className="mt-6">
            <SectionHeader title="Teacher Inquiry" icon={<Icon.progress size={14} />} />
            <p className="text-xs text-muted mb-3" style={{ marginTop: 4 }}>
              Optional. Use when tracking teaching impact across a cycle of diagnosis → intervention → re-diagnosis.
            </p>
            <Card small>
              <div className="flex-col-gap4">
                <div className="flex-row-gap3">
                  <input type="checkbox" id="isBaseline" checked={isBaseline} onChange={e => setIsBaseline(e.target.checked)}
                    className="dx-checkbox" />
                  <label htmlFor="isBaseline" className="text-sm font-semibold">Mark as baseline diagnosis (first measurement before intervention)</label>
                </div>
                {isBaseline && (
                  <div>
                    <label className="field-label">Inquiry Hypothesis</label>
                    <textarea className="dx-textarea" value={inquiryHypothesis} onChange={e => setInquiryHypothesis(e.target.value)}
                      rows={2} placeholder="What do you think will improve? E.g. Focused vocabulary work will improve task completion score by 10+ points…" />
                  </div>
                )}
                <div>
                  <label className="field-label">Intervention Note</label>
                  <textarea className="dx-textarea" value={interventionNote} onChange={e => setInterventionNote(e.target.value)}
                    rows={2} placeholder="What did you do between the baseline and this diagnosis? E.g. 3 sessions focused on organizing speaking answers using PEEL structure…" />
                </div>
              </div>
            </Card>
          </div>

          {/* ── Cambridge Teaching Framework Self-Evaluation ── */}
          <div className="mt-6">
            <SectionHeader title="Cambridge Teaching Self-Evaluation" icon={<Icon.progress size={14} />} />
            <p className="text-xs text-muted mb-3" style={{ marginTop: 4 }}>
              Rate yourself on each Cambridge English Teaching Framework category. This is saved with the diagnosis for your professional development record.
            </p>
            <Card small>
              <div className="flex-col-gap4">
                {CAMBRIDGE_FRAMEWORK_CATEGORIES.map(cat => (
                  <div key={cat.id} className="cambridge-category">
                    <div className="flex-row-gap3 mb-2">
                      <span className="text-sm font-semibold">{cat.label}</span>
                      {cambridgeSelfEval[cat.id] && (
                        <Pill tone={cat.stages.find(s => s.key === cambridgeSelfEval[cat.id])?.key === 'expert' ? 'success' : cat.stages.find(s => s.key === cambridgeSelfEval[cat.id])?.key === 'proficient' ? 'accent' : cat.stages.find(s => s.key === cambridgeSelfEval[cat.id])?.key === 'developing' ? 'warning' : 'muted'}>
                          {cat.stages.find(s => s.key === cambridgeSelfEval[cat.id])?.label}
                        </Pill>
                      )}
                    </div>
                    <p className="card-row-meta mb-2">{cat.description}</p>
                    <div className="cambridge-stage-selector">
                      {cat.stages.map(stage => {
                        const selected = cambridgeSelfEval[cat.id] === stage.key;
                        return (
                          <button key={stage.key} type="button"
                            className={`cambridge-stage-btn${selected ? ' cambridge-stage-btn--selected' : ''}`}
                            onClick={() => setCambridgeSelfEval(prev => ({ ...prev, [cat.id]: stage.key }))}
                            title={stage.description}
                          >
                            <span className="cambridge-stage-label">{stage.label}</span>
                            <span className="cambridge-stage-desc">{stage.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" size="sm" onClick={() => handleSave(false)} disabled={saving}>Save Draft</Button>
            <Button variant="primary" onClick={() => setStep('review')}>
              <Icon.arrowR size={14} /> Review & Approve
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP: REVIEW ── */}
      {step === 'review' && (
        <div className="mt-5">
          {/* Feedback-first recovery path */}
          <Card className="card-p-4 mb-4" style={{ border: '1px solid var(--accent)', background: 'var(--accent-soft)' }}>
            <div className="flex-row-gap3">
              <Icon.chat size={18} color="var(--accent-text)" />
              <div>
                <div className="card-row-title">Feedback is ready first</div>
                <p className="card-row-meta mt-1">
                  This editable student-facing draft is the first result. Review it, add the specific teaching note, and approve it before using the supporting analysis below. Use Regen on any deeper section when you need more detail.
                </p>
              </div>
            </div>
          </Card>

          <Card className="card-p-4 mb-4">
            <div className="card-row-title">Create this diagnostic in saved phases</div>
            <p className="card-row-meta mt-1 mb-3">
              Each phase saves before the next one becomes available. Feedback stays available even if a later AI request fails.
            </p>
            <div className="stack-list gap-3">
              {DIAGNOSTIC_PHASES.map(phase => {
                const complete = completedPhases.includes(phase.id);
                const ready = (phase.requires || []).every(required => completedPhases.includes(required));
                const isRunning = runningPhase === phase.id;
                const isFeedback = phase.id === 'feedback';
                return (
                  <div key={phase.id} className="flex flex-wrap gap-3" style={{ alignItems: 'center', paddingTop: phase.number === 1 ? 0 : 'var(--space-3)', borderTop: phase.number === 1 ? 'none' : '1px solid var(--divider)' }}>
                    <Pill tone={complete ? 'success' : ready ? 'warning' : 'muted'}>
                      {complete ? <Icon.check size={12} /> : phase.number} {complete ? 'Saved' : ready ? 'Ready' : 'Locked'}
                    </Pill>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Phase {phase.number}: {phase.title}</div>
                      <div className="card-row-meta mt-1">{phase.description}</div>
                    </div>
                    {isFeedback ? (
                      <Button variant="ghost" size="sm" onClick={() => handleSave(false)} disabled={saving || complete}>
                        {complete ? 'Feedback saved' : 'Save feedback'}
                      </Button>
                    ) : (
                      <Button variant={complete ? 'ghost' : 'primary'} size="sm" onClick={() => runDiagnosticPhase(phase.id)} disabled={!ready || Boolean(runningPhase) || saving}>
                        {isRunning ? 'Creating…' : complete ? `Recreate phase ${phase.number}` : phase.action}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Approval status bar */}
          <div className="approval-bar">
            <div className="flex-1">
              <div className="card-row-title text-sm">{approvedCount} of {totalSections} sections approved</div>
              {missingRequiredApprovals.length > 0 && (
                <div className="card-row-meta mt-1">
                  Required before final approval: {missingRequiredApprovals.map(key => SECTION_LABELS[key]).join(', ')}
                </div>
              )}
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '100%', background: approvedCount === totalSections ? 'var(--success)' : 'var(--accent)', transform: `scaleX(${approvedCount / totalSections})` }} />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={approveAll}>Approve All</Button>
            <Button variant="ghost" size="sm" onClick={() => handleSave(false)} disabled={saving}>Save Draft</Button>
            <Button variant="primary" onClick={() => handleSave(true)} disabled={saving || !canApproveDiagnosis || canApprove === false}>
              <Icon.check size={14} /> Approve & Save
            </Button>
          </div>

          {/* Empty draft */}
          {!SECTION_KEYS.some(({ key }) => sections[key]) && (
            <Card className="page-empty-state">
              <p className="card-row-meta mb-4">
                This diagnosis has no generated content. It was saved before the AI analysis completed.
              </p>
              <Button variant="primary" size="sm" onClick={() => onNavigate('diagnostics:create', { studentId: savedDiagnosis?.studentId || selectedStudentId || studentId })}>
                <Icon.diagnose size={13} /> Start a new diagnosis
              </Button>
            </Card>
          )}

          {/* Section cards — grouped by zone */}
          {(() => {
            const renderSection = (key, studentFacing, embedded) => {
              const sec = sections[key];
              if (!sec) return null;
              const label = SECTION_LABELS[key] || key;
              const isEditing = editingSection === key;
              const isRegenning = regenerating === key;

              const header = (
                <div className="section-header-bar" style={{ background: sec.approved ? 'var(--success-bg)' : (studentFacing ? 'var(--accent-soft)' : 'var(--bg)') }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', flex: 1 }}>{label}</span>
                  {studentFacing && <Pill tone="info">Student-facing</Pill>}
                  {sec.edited && <Pill tone="warning">Edited</Pill>}
                  {sec.hidden && <Pill tone="muted">Hidden</Pill>}
                  {sec.approved && <Pill tone="success"><Icon.check size={12} /> Approved</Pill>}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(key)} disabled={isRegenning}><Icon.edit size={12} /> Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => regenerateSection(key)} disabled={isRegenning}><Icon.refresh size={12} /> {isRegenning ? '…' : 'Regen'}</Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleHide(key)} style={{ color: sec.hidden ? 'var(--muted)' : 'var(--text)' }} aria-label="Toggle section visibility"><Icon.eye size={12} /></Button>
                    <Button variant={sec.approved ? 'ghost' : 'primary'} size="sm" onClick={() => toggleApprove(key)} style={sec.approved ? { color: 'var(--danger)' } : {}}>
                      {sec.approved ? <><Icon.close size={12} /> Unapprove</> : <><Icon.check size={12} /> Approve</>}
                    </Button>
                  </div>
                </div>
              );

              const body = (
                <div className="section-body">
                  {regenerationError?.key === key && (
                    <p role="alert" className="text-sm" style={{ margin: '0 0 var(--space-3)', color: 'var(--danger)' }}>
                      {regenerationError.message}
                    </p>
                  )}
                  {isEditing ? (
                    <div>
                      <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={10} className="dx-edit-textarea" />
                      <div className="flex gap-2 mt-2">
                        <Button variant="primary" size="sm" onClick={() => saveEdit(key)}>Save Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <SectionContent sectionKey={key} content={sec.content} />
                  )}
                </div>
              );

              if (embedded) {
                return <div key={key} style={{ borderTop: '1px solid var(--divider)' }}>{header}{body}</div>;
              }
              return (
                <Card key={key} style={{ padding: 0, overflow: 'hidden', border: sec.approved ? '2px solid var(--success)' : (studentFacing ? '2px solid var(--accent)' : '1px solid var(--border)') }}>
                  {header}{body}
                </Card>
              );
            };

            // Put the student-facing result first: feedback is the useful
            // outcome even when optional teacher analysis is unavailable.
            return [...SECTION_GROUPS]
              .sort((a, b) => Number(b.studentFacing) - Number(a.studentFacing))
              .map(zone => {
                const groups = zone.groups.filter(g => g.keys.some(k => sections[k]));
                if (!groups.length) return null;
                return (
                  <div key={zone.zone} className="stack-list" style={{ gap: 'var(--space-4)', marginTop: zone.zone === 'student' ? 'var(--space-2)' : 0 }}>
                    <div>
                      <div className="zone-header" style={{ color: zone.studentFacing ? 'var(--accent-text)' : undefined }}>{zone.title}</div>
                      {zone.caption && <div className="zone-caption">{zone.caption}</div>}
                    </div>
                    {groups.map(group => {
                      const keys = group.keys.filter(k => sections[k]);
                      if (keys.length === 1) return renderSection(keys[0], zone.studentFacing, false);
                      return (
                        <Card key={group.title} style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <div className="zone-header" style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--surface)', letterSpacing: '0.04em', color: 'var(--text-2)' }}>{group.title}</div>
                          {keys.map(k => renderSection(k, zone.studentFacing, true))}
                        </Card>
                      );
                    })}
                  </div>
                );
              });
          })()}

          {/* Bottom actions */}
          <div className="flex flex-wrap gap-3 mt-5">
            <Button variant="ghost" size="sm" onClick={() => handleSave(false)} disabled={saving}>Save Draft</Button>
            <Button variant="primary" onClick={() => handleSave(true)} disabled={saving || !canApproveDiagnosis || canApprove === false}>
              <Icon.check size={14} /> Approve & Save ({approvedCount}/{totalSections})
            </Button>
            {savedDiagnosis && <Button variant="ghost" size="sm" onClick={() => setStep('saved')}>Post-approval actions</Button>}
          </div>
        </div>
      )}
    </div>
  );
}



