import assert from 'node:assert/strict';
import test from 'node:test';
import { generateDiagnosisJson } from '../src/domain/assessment/diagnosis-utils.js';

const promptData = {
  student: { name: 'Ana', currentLevel: 'B1', targetLevel: 'B2', examGoal: 'Pass MET B2' },
  targetProfile: { label: 'VisaScreen', overallTarget: 58, speakingTarget: 59 },
  classEvidence: {
    evaluatedSpeaking: true,
    speakingEvidenceCount: 1,
    studentTranscript: 'I work at night and I want improve my English for the exam.',
  },
};

const usableDiagnosis = {
  skillDiagnosis: { speaking: { evaluated: true, score0to80: 52 } },
  classSummary: 'Ana communicated her main goal clearly, with a provisional speaking estimate from one short response.',
  priorityDiagnosis: [{ rank: 1, urgency: 'Developing', area: 'verb forms', evidence: 'I want improve', whatToImprove: 'Use infinitive forms after want.', howToImprove: 'Practise short exam answers with want to plus a verb.' }],
  nextClassFocus: { primaryFocus: 'verb forms', suggestedActivities: ['short speaking drill'], warmUp: 'repeat the corrected sentence', successCriteria: 'uses want to correctly' },
};

test('analysis retries a compact direct request without loading optional skill documents', async () => {
  const calls = [];
  const statuses = [];
  const requestAI = async (prompt, options) => {
    calls.push({ prompt, options });
    if (calls.length === 1) throw new Error('Request too large');
    return { content: [{ text: JSON.stringify(usableDiagnosis) }] };
  };

  const result = await generateDiagnosisJson(promptData, status => statuses.push(status), requestAI);

  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.max_tokens, 6000);
  assert.equal(calls[1].options.max_tokens, 3200);
  assert.equal(calls[0].options.skills, undefined);
  assert.equal(calls[1].options.skills, undefined);
  assert.match(calls[0].prompt, /Diagnostic Analyst/);
  assert.match(calls[1].prompt, /compact MET diagnosis/);
  assert.equal(result.parsed.classSummary, usableDiagnosis.classSummary);
  assert.match(statuses[0], /smaller diagnosis prompt/);
});

test('analysis rejects instead of saving a placeholder diagnosis when both requests fail', async () => {
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    await assert.rejects(
      () => generateDiagnosisJson(promptData, () => {}, async () => { throw new Error('AI unavailable'); }),
      /AI unavailable/
    );
  } finally {
    console.warn = originalWarn;
  }
});
