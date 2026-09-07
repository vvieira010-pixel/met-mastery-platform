import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  MET_WRITING_SCALE,
  rubricToScaled,
  buildExaminerPrompt,
} from '../api/_met-writing-scale.js';
import { parseLLMJson, extractScores } from '../api/_assemblyai-llm.js';

const here = dirname(fileURLToPath(import.meta.url));
const readApi = (name) => readFileSync(join(here, '..', 'api', name), 'utf8');

const CRITERIA = ['grammar', 'vocabulary', 'mechanics', 'organization', 'task'];

describe('MET writing scale — official rubric structure', () => {
  test('has exactly the 5 official criteria', () => {
    assert.deepEqual(Object.keys(MET_WRITING_SCALE).sort(), [...CRITERIA].sort());
  });

  test('every criterion defines levels 0-4 with non-empty text', () => {
    for (const key of CRITERIA) {
      const c = MET_WRITING_SCALE[key];
      assert.ok(c.label, `${key} missing label`);
      assert.ok(Array.isArray(c.dimensions) && c.dimensions.length > 0, `${key} missing dimensions`);
      for (const lvl of [0, 1, 2, 3, 4]) {
        assert.equal(typeof c[lvl], 'string', `${key} level ${lvl} missing`);
        assert.ok(c[lvl].length > 0, `${key} level ${lvl} empty`);
      }
    }
  });

  test('level-0 descriptors match the official 20.02.PDF (one line per criterion, in order)', () => {
    // The official scale's "0" row lists five lines mapping 1:1 to the criteria.
    assert.equal(MET_WRITING_SCALE.grammar[0], 'Language produced is impossible to process for meaning.');
    assert.equal(MET_WRITING_SCALE.vocabulary[0], 'No vocabulary that is relevant to the task.');
    assert.equal(MET_WRITING_SCALE.mechanics[0], 'No legible or decipherable text.');
    assert.equal(MET_WRITING_SCALE.organization[0], 'No clear ideas are expressed.');
    assert.equal(MET_WRITING_SCALE.task[0], 'No response attempted, or test taker produces only his or her name.');
  });

  test('top-level descriptors are verbatim from the official scale', () => {
    assert.equal(
      MET_WRITING_SCALE.grammar[4],
      'Errors are rare, even in complex sentences. There are no errors that prevent the reader from deriving meaning.',
    );
    assert.equal(
      MET_WRITING_SCALE.mechanics[4],
      'No errors with sentence boundaries. Almost no errors with punctuation. Almost no spelling errors.',
    );
    assert.equal(
      MET_WRITING_SCALE.task[4],
      'The response is directly relevant to the task. Supporting detail is clearly developed. The response fully completes the task.',
    );
  });

  test('official criterion labels', () => {
    assert.equal(MET_WRITING_SCALE.grammar.label, 'Grammatical Accuracy');
    assert.equal(MET_WRITING_SCALE.organization.label, 'Cohesion and Organization');
    assert.equal(MET_WRITING_SCALE.task.label, 'Task Completion');
  });
});

describe('MET writing scale — rubricToScaled conversion', () => {
  test('maps whole-level averages to official scaled/CEFR bands', () => {
    assert.deepEqual(rubricToScaled(4), { rubricAvg: 4, scaledRange: [74, 80], scaledScore: 77, cefr: 'C1' });
    assert.deepEqual(rubricToScaled(3), { rubricAvg: 3, scaledRange: [58, 63], scaledScore: 60, cefr: 'B2' });
    assert.deepEqual(rubricToScaled(2), { rubricAvg: 2, scaledRange: [46, 52], scaledScore: 49, cefr: 'B1' });
    assert.deepEqual(rubricToScaled(1), { rubricAvg: 1, scaledRange: [33, 39], scaledScore: 36, cefr: 'A2' });
    assert.deepEqual(rubricToScaled(0), { rubricAvg: 0, scaledRange: [0, 26], scaledScore: 13, cefr: 'Below A2' });
  });

  test('snaps fractional averages to the nearest 0.5 band', () => {
    assert.equal(rubricToScaled(3.7).rubricAvg, 3.5);
    assert.equal(rubricToScaled(2.4).rubricAvg, 2.5);
    assert.equal(rubricToScaled(1.2).rubricAvg, 1.0);
    assert.equal(rubricToScaled(0.1).cefr, 'Below A2');
    assert.equal(rubricToScaled(2.6).cefr, 'B2'); // 2.5 -> B2
  });

  test('never returns undefined for out-of-range input', () => {
    for (const v of [-5, 0, 2, 4, 99]) {
      const r = rubricToScaled(v);
      assert.ok(Number.isFinite(r.scaledScore), `scaledScore not finite for ${v}`);
      assert.ok(typeof r.cefr === 'string' && r.cefr.length > 0, `cefr missing for ${v}`);
    }
  });
});

describe('MET writing scale — examiner prompt', () => {
  const prompt = buildExaminerPrompt({ taskPrompt: 'Argue for or against.', essay: 'My essay text.' });

  test('includes task prompt, essay, and all 5 criteria', () => {
    assert.ok(prompt.includes('Argue for or against.'));
    assert.ok(prompt.includes('My essay text.'));
    for (const key of CRITERIA) {
      assert.ok(prompt.includes(MET_WRITING_SCALE[key].label), `prompt missing ${key} label`);
    }
  });

  test('instructs WHOLE levels 0-4 (official scale has no half-point descriptors)', () => {
    assert.match(prompt, /WHOLE level from 0 to 4/);
  });

  test('de-biases: independent criteria + scoped Mechanics', () => {
    // Guards the anti-halo rules added after the model collapsed all criteria to 1.
    assert.match(prompt, /INDEPENDENTLY/);
    assert.match(prompt, /avoid halo effect/);
    assert.match(prompt, /Mechanics is ONLY about spelling, punctuation, and sentence boundaries/);
  });

  test('requires the exact JSON score keys the endpoint reads', () => {
    for (const key of CRITERIA) assert.ok(prompt.includes(`"${key}"`), `prompt missing JSON key ${key}`);
  });
});

describe('AssemblyAI client — parseLLMJson', () => {
  test('parses plain, fenced, and prose-wrapped JSON', () => {
    assert.deepEqual(parseLLMJson('{"a":1}'), { a: 1 });
    assert.deepEqual(parseLLMJson('```json\n{"a":1}\n```'), { a: 1 });
    assert.deepEqual(parseLLMJson('Sure! {"a":1} hope that helps'), { a: 1 });
  });

  test('returns null for non-JSON instead of throwing', () => {
    assert.equal(parseLLMJson('not json at all'), null);
    assert.equal(parseLLMJson(''), null);
    assert.equal(parseLLMJson(null), null);
  });

  test('handles top-level arrays', () => {
    assert.deepEqual(parseLLMJson('[1,2,3]'), [1, 2, 3]);
  });
});

describe('AssemblyAI client — extractScores validation', () => {
  test('extracts all required numeric keys', () => {
    const s = extractScores({ scores: { task: 2, organization: 2, grammar: 2, vocabulary: 2, mechanics: 2 } }, CRITERIA);
    assert.deepEqual(s, { task: 2, organization: 2, grammar: 2, vocabulary: 2, mechanics: 2 });
  });

  test('rejects missing keys — prevents the NaN-average bug', () => {
    assert.equal(extractScores({ scores: { task: 2 } }, CRITERIA), null);
    assert.equal(extractScores({ scores: {} }, CRITERIA), null);
    assert.equal(extractScores({}, CRITERIA), null);
    assert.equal(extractScores(null, CRITERIA), null);
  });

  test('preserves a legitimate 0 score (official "no response" level)', () => {
    const s = extractScores({ scores: { task: 0, organization: 0, grammar: 0, vocabulary: 0, mechanics: 0 } }, CRITERIA);
    assert.deepEqual(s, { task: 0, organization: 0, grammar: 0, vocabulary: 0, mechanics: 0 });
  });

  test('rejects non-numeric values', () => {
    const bad = { scores: { task: 'abc', organization: 2, grammar: 2, vocabulary: 2, mechanics: 2 } };
    assert.equal(extractScores(bad, CRITERIA), null);
    assert.equal(extractScores({ scores: { task: null, organization: 2, grammar: 2, vocabulary: 2, mechanics: 2 } }, CRITERIA), null);
  });

  test('rejects NaN from truncated/partial objects', () => {
    assert.equal(extractScores({ scores: { task: NaN, organization: 2, grammar: 2, vocabulary: 2, mechanics: 2 } }, CRITERIA), null);
  });

  test('works for the 3 speaking keys too', () => {
    assert.deepEqual(extractScores({ scores: { task: 2, language: 2, delivery: 1.5 } }, ['task', 'language', 'delivery']), { task: 2, language: 2, delivery: 1.5 });
  });
});

describe('evaluate-writing endpoint — contract', () => {
  const src = readApi('evaluate-writing.js');

  test('uses the AssemblyAI gateway as the primary scorer', () => {
    assert.ok(src.includes("import { callAssemblyAILLMJson"), 'must use the hardened AssemblyAI helper');
    assert.ok(src.includes("provider: 'assemblyai-llm'"));
    // Fallbacks still present so evaluation never goes down.
    assert.ok(src.includes("provider: 'gemini'") && src.includes("provider: 'openai'") && src.includes("provider: 'groq'"));
  });

  test('requires an authenticated session (paid AI endpoint)', () => {
    assert.ok(src.includes('verifySupabaseSession'));
    assert.ok(src.includes('Unauthorized'));
  });

  test('validates essay input before calling the model', () => {
    assert.ok(src.includes('MAX_ESSAY_CHARS'));
    assert.match(src, /essay\.trim\(\)\.length < 10/);
  });

  test('computes scores server-side and clamps to the official 0-4 range', () => {
    assert.ok(src.includes('rubricToScaled'));
    assert.match(src, /Math\.min\(4, Math\.max\(0/);
  });
});

describe('evaluate-speaking endpoint — AssemblyAI wiring', () => {
  const src = readApi('evaluate-speaking.js');

  test('AssemblyAI gateway is the first evaluator in the cascade', () => {
    // speaking assigns `evalProvider = 'gemini'` (the log row uses `provider:`).
    const aaiIdx = src.indexOf('callAssemblyAILLMJson');
    const geminiIdx = src.indexOf("evalProvider = 'gemini'");
    assert.ok(aaiIdx > 0, 'AssemblyAI evaluator must be present');
    assert.ok(geminiIdx > aaiIdx, 'AssemblyAI must run before the Gemini fallback');
  });

  test('validates speaking scores the same way as writing', () => {
    assert.ok(src.includes('extractScores(evaluation'), 'speaking must validate scores too');
    assert.ok(src.includes("['task', 'language', 'delivery']"));
  });
});
