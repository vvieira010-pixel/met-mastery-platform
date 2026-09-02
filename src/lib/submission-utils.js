export function getFormativeRecommendation(score) {
  if (score === null || score === undefined || isNaN(score)) return null;
  const pct = score * 10;
  if (pct >= 80) {
    return {
      band: 'strong',
      label: 'Strong mastery (8+/10)',
      action: 'Student is ready to move to the next topic or an extension challenge.',
      techniques: [
        'Introduce a related, slightly harder concept or skill in the next session.',
        'Ask the student to self-explain what they did well. Metacognitive reflection consolidates learning.',
        'Schedule a spaced retrieval check in 1 week to confirm long-term retention.',
      ],
    };
  }
  if (pct >= 50) {
    return {
      band: 'partial',
      label: 'Partial mastery (5–7.9/10)',
      action: 'A brief review is recommended before introducing new content.',
      techniques: [
        'Assign 2–3 targeted exercises focusing specifically on the areas that were incorrect.',
        'Show a worked example of a correct response, then ask the student to attempt again.',
        'Go through each error together in the next session. Error analysis is high-leverage.',
      ],
    };
  }
  return {
    band: 'weak',
    label: 'Significant gap (below 5/10)',
    action: 'Re-teaching is needed before moving on. This topic needs more foundation work.',
    techniques: [
      'Return to the core concept with a new, simpler worked example.',
      'Break the skill into smaller sub-steps and practise each one before combining.',
      'Increase practice frequency: shorter daily sessions are more effective than one long session.',
    ],
  };
}

export function buildSubmissionEvidence(submission, homework) {
  const activityById = Object.fromEntries((homework?.activities || []).map(a => [a.id, a]));
  const entries = Object.entries(submission?.responses || {})
    .map(([exId, res], index) => {
      const ex = activityById[exId] || {};
      const transcript = cleanText(res?.transcript);
      const answer = cleanText(res?.text ?? res?.answer ?? res?.value ?? res?.response ?? res?.shortAnswer);
      const prompt = cleanText(ex.prompt || ex.question || ex.instruction || ex.audioText || ex.title);
      const type = ex.type || (res?.audioB64 || res?.audioPath || res?.audioUrl || transcript ? 'speak' : 'response');
      const hasAudio = Boolean(res?.audioB64 || res?.audioPath || res?.audioUrl);
      if (!transcript && !answer && !hasAudio) return null;
      return { id: exId, type, title: `${type === 'speak' ? 'Speaking' : 'Response'} ${index + 1}`, prompt, transcript, answer, hasAudio };
    })
    .filter(Boolean);

  const promptText = entries.length
    ? entries.map((entry, index) => {
      const lines = [
        `Response ${index + 1} (${entry.type})`,
        entry.prompt ? `Prompt: ${entry.prompt}` : null,
        entry.transcript ? `Transcript: ${entry.transcript}` : null,
        entry.answer ? `Written response: ${entry.answer}` : null,
        !entry.transcript && entry.hasAudio ? 'Audio submitted but no transcript is available.' : null,
      ].filter(Boolean);
      return lines.join('\n');
    }).join('\n\n')
    : '(no structured response evidence available)';

  return { entries, promptText };
}

export function cleanText(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join('\n');
  if (typeof value === 'object') return cleanText(JSON.stringify(value));
  return String(value).trim();
}

export const TYPE_SKILL = {
  speak: 'Speaking', listen: 'Listening', read: 'Reading',
  short: 'Writing', fix: 'Grammar', blank: 'Grammar',
  mcq: 'Reading / Listening', flash: 'Vocabulary', order: 'Grammar',
};

export const EMPTY_REVIEW_FORM = {
  whatImproved: '',
  activeErrors: '',
  newErrors: '',
  corrections: [{ id: Math.random().toString(36).slice(2, 9), original: '', improved: '', note: '' }],
  overallNote: '',
  score: '',
  redoRequired: false,
  sendFeedback: true,
};
