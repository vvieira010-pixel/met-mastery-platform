/**
 * api/_met-writing-scale.js — Single source of truth for MET Writing scoring.
 *
 * VERBATIM from the official MET Writing Rating Scale
 * (20.02.PDF.MET-Writing-Scale.md — Michigan Assessment, 02/11/2020).
 * 5 criteria, each scored at a WHOLE level 0–4 (the official writing scale uses
 * whole levels; unlike speaking, it does not define half-point descriptors).
 *
 * Official dimension lists per criterion are preserved so the examiner prompt
 * tells the model exactly what to look for.
 *
 * Average of the 5 levels → snapped to 0.5 → scaled 0–80 → CEFR.
 * evaluate-writing.js builds its examiner prompt and scaled-score conversion
 * from this file — edit here, not in the endpoint.
 *
 * ⚠️ Formative estimate only. Official MET scaled scores use IRT + form-specific
 * equating. Report as "Estimated MET band: B1 (rubric avg 2.0)", never as an
 * official scaled score.
 */

export const MET_WRITING_SCALE = {
  grammar: {
    label: 'Grammatical Accuracy',
    dimensions: ['Quantity of error', 'Severity of error', 'Ability of reader to process intended meaning'],
    4: 'Errors are rare, even in complex sentences. There are no errors that prevent the reader from deriving meaning.',
    3: 'Simple constructions are error-free but complex sentences may contain errors. Errors may be distracting but do not interfere with meaning.',
    2: 'Some simple constructions may be error-free. Most sentences contain errors. Some errors are severe enough to obscure meaning.',
    1: 'Pervasive errors in almost every sentence. Errors are severe enough that the reader frequently needs to guess at the intended meaning.',
    0: 'Language produced is impossible to process for meaning.',
  },
  vocabulary: {
    label: 'Vocabulary',
    dimensions: ['Lexical sophistication', 'Appropriate word choice', 'Degree of word misuse'],
    4: 'Sophisticated vocabulary is properly used. Words are carefully chosen to match context. Almost no words are misused.',
    3: 'A combination of simple and more sophisticated words is used. Word choice is generally appropriate. Few words are misused.',
    2: 'Most of the vocabulary used is simple. Some sophisticated vocabulary is attempted but may be unsuccessful. Some words are misused.',
    1: 'Only very simple words are used. Any attempts at more sophisticated vocabulary are unsuccessful. Misused words cause confusion.',
    0: 'No vocabulary that is relevant to the task.',
  },
  mechanics: {
    label: 'Mechanics',
    dimensions: ['Appropriate sentence boundaries', 'Punctuation', 'Spelling'],
    4: 'No errors with sentence boundaries. Almost no errors with punctuation. Almost no spelling errors.',
    3: 'Some errors with sentence boundaries in longer sentences. Minor errors with punctuation. Few spelling errors and none that cause confusion.',
    2: 'Frequent sentence boundary errors. Frequent errors with punctuation. Frequent spelling errors; some may be severe.',
    1: 'Little to no control over sentence boundaries. Little to no correct use of punctuation. Pervasive spelling errors; reader may have to guess at intended word.',
    0: 'No legible or decipherable text.',
  },
  organization: {
    label: 'Cohesion and Organization',
    dimensions: ['Ability to create cohesion', 'Ability to link ideas together', 'Use of connective devices'],
    4: 'The response is very cohesive. Connection of ideas is always successful. Connective devices are used correctly.',
    3: 'The response is generally cohesive. Connection of ideas is usually successful. Connective devices are used, mostly correctly.',
    2: 'Some parts of the response are cohesive. Connection of ideas is partially successful. Use of connective devices is attempted but not always used correctly.',
    1: 'The response is not cohesive. Ideas are not connected together clearly. Only basic connective devices are used, if any.',
    0: 'No clear ideas are expressed.',
  },
  task: {
    label: 'Task Completion',
    dimensions: ['Relevance to the task', 'Degree of supporting detail', 'Successful completion of task'],
    4: 'The response is directly relevant to the task. Supporting detail is clearly developed. The response fully completes the task.',
    3: 'The response is directly relevant to the task. Supporting detail is provided that clearly relates to the task. The response adequately completes the task.',
    2: 'The response is mainly relevant to the task. Some supporting detail is provided. The response minimally completes the task.',
    1: 'The response is very short and simple. The response may be only partially relevant to the task. The response may be difficult to understand.',
    0: 'No response attempted, or test taker produces only his or her name.',
  },
};

// rubric_avg (snapped to 0.5) → [scaledRange, scaledMid, CEFR].
// Mirrors the speaking bands (validated vs scoring-conversion.md); kept here so
// writing stays self-contained.
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

function criterionBlock(key, n) {
  const c = MET_WRITING_SCALE[key];
  const lines = [4, 3, 2, 1, 0].map((s) => `- Level ${s}: ${c[s]}`).join('\n');
  return `${n}. ${c.label} — look for: ${c.dimensions.join('; ')}.\n${lines}`;
}

export function buildExaminerPrompt({ taskPrompt, essay }) {
  return `You are an official MET (Michigan English Test) Writing Examiner evaluating a candidate's written response.

Task Prompt:
${taskPrompt}

Candidate's Essay:
"""
${essay}
"""

Evaluate against the official MET Writing Rating Scale (Michigan Assessment, 20.02.PDF). Score each of the 5 criteria at a WHOLE level from 0 to 4.

CRITICAL SCORING RULES:
1. Rate each criterion INDEPENDENTLY. Do not let a low score on one criterion drag down the others (avoid halo effect) — a response can have weak grammar but strong mechanics, for example.
2. For each criterion, first identify the concrete EVIDENCE in the essay, then choose the level whose descriptor best matches that evidence.
3. Scope each criterion strictly to its listed dimensions:
   - Mechanics is ONLY about spelling, punctuation, and sentence boundaries. Do NOT penalise grammar, vocabulary, or content here.
   - Grammatical Accuracy is ONLY about sentence-level grammar. Do NOT penalise spelling here.
   - Task Completion is about relevance, supporting detail, and whether the task is completed — NOT about language accuracy.
4. In each rationale, keep it to 1–2 sentences: state the level, the evidence, and the matching descriptor.

${criterionBlock('task', 1)}
${criterionBlock('organization', 2)}
${criterionBlock('grammar', 3)}
${criterionBlock('vocabulary', 4)}
${criterionBlock('mechanics', 5)}

Return ONLY a valid JSON object (no markdown fences) formatted exactly as:
{
  "scores": {
    "task": 2,
    "organization": 2,
    "grammar": 2,
    "vocabulary": 2,
    "mechanics": 2
  },
  "rationale": {
    "task": "...",
    "organization": "...",
    "grammar": "...",
    "vocabulary": "...",
    "mechanics": "..."
  },
  "corrections": [
    { "original": "...", "corrected": "...", "explanation": "..." }
  ],
  "feedback": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."]
}`;
}
