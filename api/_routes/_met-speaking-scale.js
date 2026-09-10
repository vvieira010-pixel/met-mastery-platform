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
    3.5: 'Directly relevant with strong elaboration; minor gaps in supporting detail.',
    3: 'Directly relevant. Completes the task with general details but not original or extensive supporting detail.',
    2.5: 'Generally relevant; addresses most aspects with some detail.',
    2: 'Generally relevant, some detail on most aspects. May have difficulty completing the task.',
    1.5: 'Partially relevant; response is short and addresses few aspects.',
    1: 'Somewhat relevant but very short and simple. Difficulty completing the task.',
    0.5: 'Minimal relevance; very little language produced.',
    0: 'Little to no response, or not at all relevant.',
  },
  language_resources: {
    label: 'Language Resources',
    dimensions: ['Vocabulary range and appropriacy to task', 'Grammatical accuracy and complexity'],
    4: 'Complex sentences usually controlled; errors infrequent and not distracting; broad appropriate vocabulary.',
    3.5: 'Strong control of complex structures; occasional minor errors. Broad vocabulary with very few imprecise choices.',
    3: 'Some complex structures without consistent control; no mistakes causing misunderstanding; directly appropriate vocabulary.',
    2.5: 'Simple structures are generally controlled; some attempt at complex forms. Vocabulary is adequate but limited.',
    2: 'Simple patterns generally controlled; noticeable errors that tend not to interfere; some relevant vocabulary.',
    1.5: 'Frequent errors in basic structures; meaning sometimes unclear. Narrow vocabulary.',
    1: 'Simple/short sentences; basic grammar and word-choice errors; very limited range.',
    0.5: 'Insufficient language to produce connected speech beyond isolated words.',
    0: 'Insufficient language resources for any meaningful response.',
  },
  intelligibility_delivery: {
    label: 'Intelligibility / Delivery',
    dimensions: ['Fluency', 'Hesitation', 'Pronunciation', 'Rhythm'],
    4: 'Usually smooth with little hesitation; clear and easy to understand.',
    3.5: 'Smooth delivery with only minor hesitation; consistently clear pronunciation.',
    3: 'Some hesitation but no long pauses; generally clear, few individual words unclear.',
    2.5: 'Noticeable hesitation but without major breakdown; mostly clear.',
    2: 'Sometimes hesitant with pauses/reformulations while searching; generally clear but listener effort needed in stretches.',
    1.5: 'Frequent hesitation; requires listener effort throughout.',
    1: 'Frequent pauses, false starts, reformulations; many hesitations; requires listener effort.',
    0.5: 'Mostly unintelligible; sustained effort required for any comprehension.',
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
  const lines = [4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0].map((s) => `- ${s}: ${c[s]}`).join('\n');
  return `${n}. ${title} — ${c.dimensions.join('; ')}.\n${lines}`;
}

// B2 base — 60s Q1 audio + transcript as a task-completion helper, not a strict 3/3/3 gold.
// Use to show sufficient quantity/coverage for 60s (all main elements + general detail, ~145 words).
// Keep this text identical to src/data/exercises/speaking/image-description.js B2_EXEMPLAR_STADIUM.transcript.
export const B2_EXEMPLAR_TRANSCRIPT = `This image depicts a busy football stadium during a match, and it looks quite exciting. In the foreground, a goalkeeper dressed in green is jumping to the left to try to save the ball, while two players — one in a white shirt and another in red — are running close behind him. The player in white has probably just kicked the ball, but it is not completely clear from this angle. On the right side of the picture, there is a camera operator who is recording the game, which suggests that it is an important event, perhaps being shown on television. In the background, I can see hundreds of spectators sitting in the stands; some are standing and cheering. The sky looks a little cloudy, but the atmosphere still feels energetic and competitive. If I had to describe the overall mood, I would say it is tense because a goal is about to happen.`;
export const B2_EXEMPLAR_SCORES = { task: 3, language: 3, delivery: 3, rubricAvg: 3.0, scaledScore: 60, cefr: 'B2' };

export function buildExaminerPrompt({ taskPrompt, transcription, fluencyLine, asrProvider = 'unknown', asrConfidence = null }) {
  return `You are an official MET (Michigan English Test) Speaking Examiner evaluating a candidate's recorded speaking response.

Task Prompt:
${taskPrompt}

Candidate's Transcript / Response:
"${transcription}"

First-pass AssemblyAI transcription / timing information:
Provider: ${asrProvider}
ASR confidence: ${asrConfidence == null ? 'not available' : asrConfidence}
${fluencyLine}

Follow this order and keep the evidence sources separate:

PASS 1 — Delivery evidence from the first-pass AssemblyAI transcription and timing result (or the explicitly named fallback provider):
- Use the supplied word timings, duration, speaking rate, pauses, false starts, and reformulations only when they are explicitly available. Treat these as evidence, not automatic penalties.
- Use this evidence primarily for Fluency and Hesitation within Intelligibility / Delivery.
- An AssemblyAI transcript or ASR confidence is not direct evidence of pronunciation quality. Do not claim that pronunciation, accent, rhythm, stress, or intonation was correct or incorrect from text, spelling, punctuation, or ASR confidence alone.
- If word-timing or direct audio evidence is missing, say so plainly and mark pronunciation, rhythm, and hesitation for teacher review. Do not invent acoustic observations.

Delivery calibration — be fair to normal human speech:
- Natural pauses for breathing, planning, emphasis, or turn-taking are expected at every level, including advanced speech. A pause alone is not a delivery weakness.
- Do not lower the Delivery score because of one isolated pause, a few pauses around 0.5–1.2 seconds, or a single longer pause when communication remains clear and the response continues naturally.
- A pause of approximately 1.2 seconds is not automatically a serious hesitation. Treat it as meaningful only when the pattern is repeated or disruptive, especially with false starts, reformulations, word-searching, broken delivery, or clear listener effort.
- Judge the frequency, pattern, and effect on communication. Never convert pause counts or speaking rate into a score mechanically, and do not treat approximately 150 words per minute as a required target.
- An advanced speaker may pause naturally and still receive a strong Delivery score when the overall response is smooth, clear, and easy to follow.

PASS 2 — Transcript-based evidence:
- Use the task prompt and transcript to judge Task Completion and Language Resources.
- Judge relevance, quantity, elaboration, supporting detail, vocabulary, grammar, and complexity from the response itself.
- Do not lower Task Completion or Language Resources merely because the delivery was hesitant, and do not raise them because the delivery sounded fluent.

Then score all three criteria independently against the official MET Speaking Rating Scale. Score 0.0–4.0 in 0.5 steps. For a half-point, explain the evidence between the two adjacent whole-level descriptors. Keep each rationale evidence-based and concise.

Task-completion base (illustrative, not strict — do not require this exact language or delivery):
Task: Describe the football match. Mention the setting, the players, the goalkeeper, the camera operator, and the spectators.
B2 base transcript (145 words, 60s): "${B2_EXEMPLAR_TRANSCRIPT}"
→ Use ONLY to judge Task Completion quantity/coverage: this covers all main elements with general detail — the kind of completeness that typically aligns with task ~3. A much shorter or partial response (missing 2+ elements, <80 words) is closer to 1.5–2. Do NOT treat its grammar, vocabulary, or delivery as a required gold — score Language and Delivery independently from the candidate's actual transcript and timing evidence.

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
  "feedback": "A complete 2–4 sentence summary for the learner.",
  "strengths": ["At least three specific, evidence-based strengths."],
  "weaknesses": ["At least two specific, evidence-based next steps."]
}

Every rationale, strength, weakness, and the overall feedback must be present
and specific to the candidate's response. Do not invent quotes or observations.
The feedback must explain the most important strengths and next steps for the
learner, while clearly separating transcript evidence from delivery evidence.
Keep each rationale to one short sentence and keep the complete JSON concise.
`;
}
