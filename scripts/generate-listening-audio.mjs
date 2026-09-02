#!/usr/bin/env node
// Generate American-voice audio for listening exercises
// Backends: deepgram (best, needs DEEPGRAM_API_KEY), piper (local, free), sapi (windows built-in, fallback)
// Usage:
//   DEEPGRAM_API_KEY=xxx node scripts/generate-listening-audio.mjs --backend deepgram
//   node scripts/generate-listening-audio.mjs --backend sapi        # default, uses Microsoft Zira
//   node scripts/generate-listening-audio.mjs --backend piper --voice en_US-amy-medium  # needs piper binary

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dataPath = 'src/data/exercises/listening/gemini-listening-10.json';
const outDir = 'public/exercises/audio/listening';
const backend = process.argv.find(a=>a.startsWith('--backend='))?.split('=')[1] || process.argv[process.argv.indexOf('--backend')+1] || 'sapi';
const voice = process.argv.find(a=>a.startsWith('--voice='))?.split('=')[1] || 'en_US-amy-medium';

const raw = JSON.parse(fs.readFileSync(dataPath,'utf8'));
fs.mkdirSync(outDir, {recursive:true});

console.log(`Backend: ${backend} | Voice: ${voice} | Items: ${raw.items.length}`);

if (backend === 'deepgram') {
  const key = process.env.DEEPGRAM_API_KEY || fs.readFileSync('.env.local','utf8').match(/DEEPGRAM_API_KEY=(.*)/)?.[1]?.trim();
  if (!key) { console.error('DEEPGRAM_API_KEY missing in .env.local'); process.exit(1); }
  for (const it of raw.items) {
    const parts = (it.question||'').split('[Question]');
    const script = (parts[0]||'').replace('[Audio Script]','').replace(/Woman:\s*/g,'').replace(/Man:\s*/g,'').replace(/\n/g,' ').replace(/\s+/g,' ').trim();
    const out = path.join(outDir, `gemini-listening-${it.id}.mp3`);
    console.log(`Deepgram ${it.id} -> ${out}`);
    const res = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
      method:'POST',
      headers:{'Authorization':`Token ${key}`,'Content-Type':'application/json'},
      body: JSON.stringify({text: script})
    });
    if (!res.ok) { console.error('Deepgram error', await res.text()); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(out, buf);
  }
} else if (backend === 'piper') {
  // Requires: pip install piper-tts && download voice model https://huggingface.co/rhasspy/piper-voices
  // Example: piper --model en_US-amy-medium.onnx --output_file out.wav
  console.log('Piper: ensure piper binary and voice model downloaded. Run per item: piper --model voices/'+voice+'.onnx --output_file '+outDir+'/gemini-listening-ID.wav');
  console.log('See https://github.com/rhasspy/piper for model list. American voices: en_US-amy-medium, en_US-ryan-medium, en_US-lessac-medium');
} else {
  // SAPI fallback — generate via PowerShell (already done for current batch)
  console.log('SAPI: run PowerShell: Add-Type -AssemblyName System.Speech; $s=new-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SelectVoice(\"Microsoft Zira Desktop\"); $s.SetOutputToWaveFile($out); $s.Speak($text)');
  console.log('Current 10 WAVs already generated with Zira (en-US female). To regenerate: run powershell script in this file header.');
  // Whisper tip
  console.log('\nWhisper (for speaking practice STT): pip install openai-whisper && whisper audio.wav --model base --language en');
}
console.log('Done.');
