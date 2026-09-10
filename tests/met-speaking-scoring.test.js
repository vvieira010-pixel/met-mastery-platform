import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  MET_SPEAKING_SCALE,
  buildExaminerPrompt,
  B2_EXEMPLAR_TRANSCRIPT,
  B2_EXEMPLAR_SCORES,
  rubricToScaled,
} from '../api/_routes/_met-speaking-scale.js';

const here = dirname(fileURLToPath(import.meta.url));
const readApi = (name) => readFileSync(join(here, '..', 'api', '_routes', name), 'utf8');
const readSrc = (name) => readFileSync(join(here, '..', 'src', 'components', 'exercises', name), 'utf8');
const CRITERIA = ['task_completion', 'language_resources', 'intelligibility_delivery'];

describe('MET speaking scale — prompt evidence boundaries', () => {
  const prompt = buildExaminerPrompt({
    taskPrompt: 'Describe a useful change at your workplace.',
    transcription: 'I think the change is useful because it saves time.',
    fluencyLine: 'Acoustic fluency facts: 12 words in 6s, 1 pause ≥0.5s.',
    asrProvider: 'assemblyai',
    asrConfidence: 0.91,
  });

  test('keeps all three official criteria and half-point descriptors', () => {
    for (const key of CRITERIA) {
      assert.ok(prompt.includes(MET_SPEAKING_SCALE[key].label), `prompt missing ${key} label`);
      for (const level of [4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0]) {
        assert.ok(prompt.includes(`- ${level}: ${MET_SPEAKING_SCALE[key][level]}`), `${key} missing ${level}`);
      }
    }
  });

  test('puts the ASR delivery pass before the transcript pass', () => {
    const deliveryPass = prompt.indexOf('PASS 1 — Delivery evidence');
    const transcriptPass = prompt.indexOf('PASS 2 — Transcript-based evidence');
    assert.ok(deliveryPass >= 0);
    assert.ok(transcriptPass > deliveryPass);
    assert.match(prompt, /Provider: assemblyai/);
    assert.match(prompt, /ASR confidence: 0\.91/);
    assert.match(prompt, /An AssemblyAI transcript or ASR confidence is not direct evidence of pronunciation quality/);
    assert.match(prompt, /Do not lower Task Completion or Language Resources merely because the delivery was hesitant/);
    assert.match(prompt, /A pause alone is not a delivery weakness/);
    assert.match(prompt, /A pause of approximately 1\.2 seconds is not automatically a serious hesitation/);
    assert.match(prompt, /Never convert pause counts or speaking rate into a score mechanically/);
  });

  test('the endpoint passes the actual ASR metadata into the examiner prompt', () => {
    const source = readApi('evaluate-speaking.js');
    const assemblyFirst = source.indexOf('if (useAssemblyAI) {');
    const localFallback = source.indexOf('const localUrl = env(\'LOCAL_WHISPER_URL\')');
    assert.ok(assemblyFirst >= 0);
    assert.ok(localFallback > assemblyFirst, 'AssemblyAI must be attempted before local Whisper for Practice Studio');
    assert.match(source, /let asrProvider = transcription \? 'provided-transcript' : 'unknown'/);
    assert.match(source, /asrProvider = result\?\.asrProvider \|\| asrProvider/);
    assert.match(source, /asrConfidence = result\?\.confidence \?\? null/);
    assert.match(source, /buildExaminerPrompt\(\{ taskPrompt, transcription, fluencyLine, asrProvider, asrConfidence \}\)/);
    assert.match(source, /may vary by approximately ±5 MET scaled points/);
  });

  test('AI evaluation is student-visible only in Practice Studio, not homework', () => {
    const source = readSrc('ShortAnswer.jsx');
    assert.match(source, /practiceStudio && audioPath/);
    assert.match(source, /Homework recordings are submitted for teacher-only evaluation/);
  });

  test('B2 task-completion base is wired to evaluation as illustrative audio + transcript helper', async () => {
    // Transcript must be identical in both single sources of truth
    const { B2_EXEMPLAR_STADIUM } = await import('../src/data/exercises/speaking/image-description.js');
    assert.equal(B2_EXEMPLAR_TRANSCRIPT, B2_EXEMPLAR_STADIUM.transcript);
    assert.equal(B2_EXEMPLAR_TRANSCRIPT, B2_EXEMPLAR_STADIUM.audioTranscript);
    // Reference scores still map canonically (3.0 → 60 B2) but are illustrative, not strict gold
    const conv = rubricToScaled(B2_EXEMPLAR_SCORES.rubricAvg);
    assert.equal(conv.scaledScore, 60);
    assert.equal(conv.cefr, 'B2');
    // Audio placeholder exists and prompt contains the task-completion base
    const audioExists = readFileSync(join(here, '..', 'public', 'audio', 'speaking', 'b2-exemplar-stadium.mp3')).length > 1000;
    assert.ok(audioExists, 'b2-exemplar-stadium.mp3 missing — regenerate via POST /api/tts { text: B2_EXEMPLAR_TRANSCRIPT }');
    const calibratedPrompt = buildExaminerPrompt({
      taskPrompt: B2_EXEMPLAR_STADIUM.prompt,
      transcription: B2_EXEMPLAR_TRANSCRIPT,
      fluencyLine: 'Observed ASR word-timing facts: 145 words in 60s (~145 wpm), 2 pauses ≥0.5s, 0 pauses ≥1.2s.',
      asrProvider: 'assemblyai',
      asrConfidence: 0.92,
    });
    assert.match(calibratedPrompt, /Task-completion base/);
    assert.match(calibratedPrompt, /Do NOT treat its grammar, vocabulary, or delivery as a required gold/);
    assert.match(calibratedPrompt, /illustrative/);
  });
});
