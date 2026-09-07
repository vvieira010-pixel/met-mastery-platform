/**
 * Build an honest, editable student-feedback draft without waiting for AI.
 * It only reflects evidence supplied by the teacher and makes the remaining
 * teacher decisions explicit before anything is shared with a student.
 */
export function buildFeedbackDraft({ student, classEvent, classEvidence, evaluatedSkills = [] } = {}) {
  const formatSkillLabel = (skill) => String(skill || 'class evidence')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
  const focus = String(classEvent?.classFocus || '').trim();
  const transcript = String(classEvidence?.studentTranscript || classEvidence?.studentAnswer || '').trim();
  const teacherNotes = String(classEvidence?.teacherNotes || classEvidence?.studentPerformance || classEvidence?.additionalNotes || '').trim();
  const skillLabels = evaluatedSkills.length > 0
    ? evaluatedSkills.map(formatSkillLabel).join(', ')
    : 'the recorded class';
  const evidenceSource = (transcript || teacherNotes).replace(/\s+/g, ' ').trim();
  const evidenceExcerpt = evidenceSource.slice(0, 220);
  const studentName = student?.firstName || student?.name || 'there';
  // Keep the draft reviewable even if the teacher evaluated one skill only.
  // The AI contract requires three strengths, and these explicit placeholders
  // make that same minimum visible for a teacher-created fallback.
  const skillsForFeedback = [
    ...evaluatedSkills.slice(0, 3),
    ...Array(Math.max(0, 3 - evaluatedSkills.length)).fill('class evidence'),
  ];
  const whatYouDidWell = skillsForFeedback.map((skill, index) => {
    const label = formatSkillLabel(skill);
    return {
      strength: evidenceSource ? `${label} evidence to build on` : `A ${label.toLowerCase()} strength to confirm`,
      explanation: evidenceSource
        ? `You produced a real ${label.toLowerCase()} sample in today's lesson. Add the specific reason this worked well — for example, how clearly you expressed the idea, supported it with a reason, or used the target language.`
        : `Add the specific ${label.toLowerCase()} moment you want to recognize, then explain why it worked for the student.`,
      evidence: evidenceSource
        ? (index === 0 ? evidenceExcerpt : `Review the ${label.toLowerCase()} moment in the class notes and add the student's exact words.`)
        : 'Add the student\'s exact words or a short description of the observed moment.',
    };
  });

  return {
    classFocus: focus
      ? `Today's class focused on ${focus}. This first feedback draft is based on the ${skillLabels} evidence recorded from the lesson.`
      : `This first feedback draft is based on the ${skillLabels} evidence recorded from today's lesson.`,
    whatYouDidWell,
    whatToImprove: [{
      area: `${skillLabels} focus`,
      insteadOf: 'Add the exact phrase, answer, or behavior to improve.',
      sayInstead: 'Add the corrected phrase or a clearer next version.',
      howToImprove: 'Choose one small next step from the evidence, then edit this section before you share it.',
    }],
    finalNote: `${studentName}, this is an editable first draft. Please review the wording and add your specific teaching note before sending it to the student.`,
  };
}
