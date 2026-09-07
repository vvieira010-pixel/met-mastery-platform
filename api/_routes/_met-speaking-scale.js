/**
 * api/_met-speaking-scale.js — Single source of truth for MET Speaking scoring.
 *
 * Mirrors C:\Users\vviei\.agents\skills\met-evaluation\reference\met-cefr-conversion.json
 * (official 20.02.PDF Speaking Rating Scale, verbatim). evaluate-speaking.js builds
 * its examiner prompt and scaled-score conversion from this file — edit here, not there.
 */

export const MET_SPEAKING_SCALE = {
  task_completion: {
    label: 'Task Completion',
    dimensions: ['Relevance of response to task', 'Quantity of language produced', 'Ability to elaborate and provide relevant supporting detail'],
    4: 'Directly relevant. Fully completes the task with extensive supporting detail.',
    3: 'Directly relevant. Completes the task with general details but not original or extensive supporting detail.',
    2: 'Generally relevant, some detail on most aspects. May have difficulty completing the task.',
    1: 'Somewhat relevant but very short and simple. Difficulty completing the task.',
    0: 'Little to no response, or not at all relevant.',
  },
  language_resources: {
    label: 'Language Resources',
    dimensions: ['Vocabulary range and appropriacy to task', 'Grammatical accuracy and complexity'],
    4: 'Complex sentences usually controlled; errors infrequent and not distracting; broad appropriate vocabulary.',
    3: 'Some complex structures without consistent control; no mistakes causing misunderstanding; directly appropriate vocabulary.',
    2: 'Simple patterns generally controlled; noticeable errors that tend not to interfere; some relevant vocabulary.',
    1: 'Simple/short sentences; basic grammar and word-choice errors; very limited range.',
    0: 'Insufficient language resources for any meaningful response.',
  },
  intelligibility_delivery: {
    label: 'Intelligibility / Delivery',
    dimensions: ['Fluency', 'Hesitation', 'Pronunciation', 'Rhythm'],
    4: 'Usually smooth with little hesitation; clear and easy to understand.',
    3: 'Some hesitation but no long pauses; generally clear, few individual words unclear.',
    2: 'Sometimes hesitant with pauses/reformulations while searching; generally clear but listener effort needed in stretches.',
    1: 'Frequent pauses, false starts, reformulations; many hesitations; requires listener effort.',
    0: 'Not comprehensible even to a sympathetic listener.',
  },
};

// rubric_avg (snapped to 0.5) → [scaledRange, scaledMid, CEFR]
const CONVERSION_TABLE = [
  [4.0, [74, 80], 77, 'C1'],
  [3.5, [64, 73], 68, 'C1'],
  [3.0, [58, 63], 60, 'B2'],
  [2.5, [53, 57], 55, 'B2'],
  [2.0, [46, 52], 49, 'B1'],
  [1.5, [40, 45], 42, 'B1'],
  [1.0, [33, 39], 36, 'A2'],
  [0.5, [27, 32], 29, 'A2'],
  [0.0, [0, 26], 13, 'Below A2'],
];

export function rubricToScaled(avg) {
  const snapped = Math.round(avg * 2) / 2;
  const row = CONVERSION_TABLE.find(([r]) => r === snapped) || CONVERSION_TABLE[CONVERSION_TABLE.length - 1];
  return { rubricAvg: snapped, scaledRange: row[1], scaledScore: row[2], cefr: row[3] };
}

function criterionBlock(key, n, title) {
  const c = MET_SPEAKING_SCALE[key];
  const lines = [4, 3, 2, 1, 0].map((s) => `- ${s}: ${c[s]}`).join('\n');
  return `${n}. ${title} — ${c.dimensions.join('; ')}.\n${lines}`;
}

export function buildExaminerPrompt({ taskPrompt, transcription, fluencyLine }) {
  return `You are an official MET (Michigan English Test) Speaking Examiner evaluating a candidate's recorded speaking response.

Task Prompt:
${taskPrompt}

Candidate's Transcript / Response:
"${transcription}"

${fluencyLine}

Evaluate against the official MET Speaking Rating Scale. Score each criterion 0.0–4.0 in 0.5 steps (half-points = between two whole-level descriptors). Quote the matching descriptor level in each rationale.

${criterionBlock('task_completion', 1, 'Task Completion')}
${criterionBlock('language_resources', 2, 'Language Resources')}
${criterionBlock('intelligibility_delivery', 3, 'Intelligibility / Delivery')}

Return ONLY a valid JSON object formatted as:
{
  "scores": {
    "task": 2.5,
    "language": 2.0,
    "delivery": 1.5
  },
  "rationale": {
    "task": "...",
    "language": "...",
    "delivery": "..."
  },
  "corrections": [
    { "original": "...", "corrected": "...", "explanation": "..." }
  ],
  "feedback": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."]
}`;
}
