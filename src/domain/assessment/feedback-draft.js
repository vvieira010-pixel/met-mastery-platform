/**
 * Build an honest, editable student-feedback draft without waiting for AI.
 * It only reflects evidence supplied by the teacher and makes the remaining
 * teacher decisions explicit before anything is shared with a student.
 */
export function buildFeedbackDraft({ student, classEvent, classEvidence, evaluatedSkills = [] } = {}) {
  const focus = String(classEvent?.classFocus || '').trim();
  const transcript = String(classEvidence?.studentTranscript || classEvidence?.studentAnswer || '').trim();
  const teacherNotes = String(classEvidence?.teacherNotes || '').trim();
  const skillLabels = evaluatedSkills.length > 0
    ? evaluatedSkills.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)).join(', ')
    : 'the recorded class';
  const evidenceExcerpt = (transcript || teacherNotes).replace(/\s+/g, ' ').slice(0, 180);
  const studentName = student?.firstName || student?.name || 'there';

  return {
    classFocus: focus
      ? `Today's class focused on ${focus}. This first feedback draft is based on the ${skillLabels} evidence recorded from the lesson.`
      : `This first feedback draft is based on the ${skillLabels} evidence recorded from today's lesson.`,
    whatYouDidWell: [{
      strength: 'A real sample to work from',
      explanation: 'You shared a real sample from today\'s work, so the next feedback can stay connected to what you actually said or wrote. Add the specific strength you want to recognize before sharing this with the student.',
      example: evidenceExcerpt ? `Evidence to review: “${evidenceExcerpt}”` : 'Add a short quote from today\'s work.',
    }],
    whatToImprove: [{
      area: `${skillLabels} focus`,
      insteadOf: 'Add the exact phrase, answer, or behavior to improve.',
      sayInstead: 'Add the corrected phrase or a clearer next version.',
      howToImprove: 'Choose one small next step from the evidence, then edit this section before you share it.',
    }],
    finalNote: `${studentName}, this is an editable first draft. Please review the wording and add your specific teaching note before sending it to the student.`,
  };
}
