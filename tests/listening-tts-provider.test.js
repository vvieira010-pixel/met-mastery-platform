import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { normalizeListeningScript, listeningUtterances } from '../src/lib/listening-script.js';

const root = path.resolve(import.meta.dirname, '..');
const ttsSource = fs.readFileSync(path.join(root, 'src', 'lib', 'tts-utils.js'), 'utf8');
const editorSource = fs.readFileSync(path.join(root, 'src', 'components', 'exercise-editor.jsx'), 'utf8');
const settingsSource = fs.readFileSync(path.join(root, 'src', 'pages', 'settings.jsx'), 'utf8');

test('listening creation exposes local and server TTS providers with the right contracts', () => {
  assert.match(editorSource, /value="chatterbox">Local Chatterbox/);
  assert.match(editorSource, /value="deepgram">Deepgram/);
  assert.match(ttsSource, /\/v1\/audio\/speech/);
  assert.match(ttsSource, /JSON\.stringify\(\{ input: text, response_format: 'wav', \.\.\.\(voice/);
  assert.match(ttsSource, /vv:chatterbox_server_url/);
  assert.match(ttsSource, /selected === 'chatterbox'/);
  assert.match(ttsSource, /fetchConversationAudioWithProvider/);
  assert.match(settingsSource, /E:\\chatterbox-tts-api/);
  assert.match(settingsSource, /Save Chatterbox URL/);
});

test('the Piper bridge exists for the endpoint used by the browser', () => {
  const piperServer = fs.readFileSync(path.join(root, 'scripts', 'piper-server.py'), 'utf8');

  assert.match(piperServer, /\/synthesize/);
  assert.match(piperServer, /PiperVoice\.load/);
  assert.match(piperServer, /--female-model/);
  assert.match(piperServer, /--male-model/);
  assert.match(piperServer, /Access-Control-Allow-Origin/);
});

test('listening AI output preserves narration versus dialogue and TTS turns', () => {
  const narration = normalizeListeningScript({ audioMode: 'narration', audioText: 'The library closes at six today.' });
  assert.equal(narration.audioMode, 'narration');
  assert.deepEqual(narration.audioLines, []);

  const dialogue = normalizeListeningScript({
    audioMode: 'dialogue',
    speakers: [{ id: 'A', label: 'Nurse', gender: 'female' }, { id: 'B', label: 'Patient', gender: 'male' }],
    audioLines: [
      { speaker: 'A', label: 'Nurse', gender: 'female', text: 'How are you feeling today?' },
      { speaker: 'B', label: 'Patient', gender: 'male', text: 'Better, but my shoulder still hurts.' },
    ],
  });
  assert.equal(dialogue.audioMode, 'dialogue');
  assert.equal(dialogue.audioText, 'Nurse: How are you feeling today?\nPatient: Better, but my shoulder still hurts.');
  assert.deepEqual(listeningUtterances(dialogue).map(({ text, gender }) => ({ text, gender })), [
    { text: 'How are you feeling today?', gender: 'female' },
    { text: 'Better, but my shoulder still hurts.', gender: 'male' },
  ]);
});
