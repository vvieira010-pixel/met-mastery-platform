import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  MET_SPEAKING_SCALE,
  buildExaminerPrompt,
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
});
