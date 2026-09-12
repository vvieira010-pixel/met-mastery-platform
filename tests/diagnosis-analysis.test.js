import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DIAGNOSIS_EVIDENCE_REQUIRED_MESSAGE,
  generateDiagnosisJson,
  hasUsefulDiagnosis,
} from '../src/domain/assessment/diagnosis-utils.js';

const promptData = {
  student: { name: 'Ana', currentLevel: 'B1', targetLevel: 'B2', examGoal: 'Pass MET B2' },
  targetProfile: { label: 'VisaScreen', overallTarget: 58, speakingTarget: 59 },
  classEvidence: {
    evaluatedSpeaking: true,
    speakingEvidenceCount: 1,
    studentTranscript: 'I work at night and I want improve my English for the exam.',
  },
};

const unevaluatedSkill = {
  evaluated: false,
  evidenceCount: 0,
  score0to80: null,
  scoreConfidenceLevel: 'Not evaluated enough',
};

const usableDiagnosis = {
  skillDiagnosis: {
    speaking: { evaluated: true, evidenceCount: 1, score0to80: 52, scoreConfidenceLevel: 'Limited evidence' },
    writing: { ...unevaluatedSkill },
    reading: { ...unevaluatedSkill },
    listening: { ...unevaluatedSkill },
    grammar: { ...unevaluatedSkill },
    vocabulary: { ...unevaluatedSkill },
    testStrategy: { ...unevaluatedSkill },
  },
  classSummary: 'Ana communicated her main goal clearly, with a provisional speaking estimate from one short response.',
  priorityDiagnosis: [{ rank: 1, urgency: 'Developing', area: 'verb forms', evidence: 'I want improve', whatToImprove: 'Use infinitive forms after want.', howToImprove: 'Practise short exam answers with want to plus a verb.' }],
  targetScoreRelevance: { gapToTarget: 'More evidence needed.', prioritySkillForTarget: 'speaking', estimatedSessionsToTarget: 'Not enough evidence to estimate.', onTrack: 'Needs more samples.' },
  nextClassFocus: { primaryFocus: 'verb forms', suggestedActivities: ['short speaking drill'], warmUp: 'repeat the corrected sentence', successCriteria: 'uses want to correctly' },
  profileUpdateSuggestions: { progressNote: 'Ana communicated her goal clearly.', suggestedLevelChange: 'No change yet.', recurringErrorsToTrack: ['want + infinitive'], masteredItems: [] },
  estimatedOverallScore: { estimate: 'Not evaluated enough', confidence: 'Limited evidence', note: 'Only speaking was sampled.' },
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

test('analysis rejects incomplete provider JSON instead of normalizing missing required sections', async () => {
  const incomplete = {
    skillDiagnosis: usableDiagnosis.skillDiagnosis,
    classSummary: usableDiagnosis.classSummary,
    priorityDiagnosis: [],
    nextClassFocus: { primaryFocus: 'verb forms' },
  };
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    await assert.rejects(
      () => generateDiagnosisJson(promptData, () => {}, async () => ({ content: [{ text: JSON.stringify(incomplete) }] })),
      /incomplete sections/
    );
  } finally {
    console.warn = originalWarn;
  }
});

test('required diagnosis validation rejects missing top-level sections and partial skill maps', () => {
  assert.equal(hasUsefulDiagnosis(usableDiagnosis), true);
  assert.equal(hasUsefulDiagnosis({ ...usableDiagnosis, priorityDiagnosis: [] }), false);
  assert.equal(hasUsefulDiagnosis({ ...usableDiagnosis, estimatedOverallScore: undefined }), false);
  assert.equal(hasUsefulDiagnosis({
    ...usableDiagnosis,
    skillDiagnosis: { speaking: usableDiagnosis.skillDiagnosis.speaking },
  }), false);
});

test('analysis blocks empty evidence before any AI provider is called', async () => {
  let calls = 0;
  await assert.rejects(
    () => generateDiagnosisJson(
      { ...promptData, classEvidence: { evaluatedSpeaking: true, speakingEvidenceCount: 1 } },
      () => {},
      async () => { calls += 1; return { content: [] }; },
    ),
    new RegExp(DIAGNOSIS_EVIDENCE_REQUIRED_MESSAGE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  assert.equal(calls, 0);
});
