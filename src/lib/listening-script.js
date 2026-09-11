/**
 * Normalize AI-created listening scripts into one stable shape.
 *
 * The transcript stays human-readable in audioText, while audioLines gives
 * the TTS layer a safe way to synthesize one speaker at a time. This is also
 * deliberately tolerant of older library items that only have labelled text.
 */

const clean = value => String(value || '').trim();

function canonicalSpeakerId(value, index = 0) {
  const raw = clean(value).toLowerCase();
  if (/narrator|announcer|host|newsreader/.test(raw)) return 'narrator';
  if (/speaker\s*a|\bwoman\b|\bgirl\b|\bfemale\b|\bdoctor\b|\bnurse\b/.test(raw)) return 'A';
  if (/speaker\s*b|\bman\b|\bboy\b|\bmale\b|\bpatient\b/.test(raw)) return 'B';
  if (/^a$/.test(raw)) return 'A';
  if (/^b$/.test(raw)) return 'B';
  return index === 0 ? 'A' : 'B';
}

function defaultGender(id, index = 0) {
  if (id === 'narrator') return 'female';
  return index % 2 === 0 ? 'female' : 'male';
}

function parseLabelledText(text) {
  return clean(text)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = /^([^:\n]{1,40}):\s*(.+)$/.exec(line);
      if (!match) return null;
      const label = clean(match[1]);
      const speaker = canonicalSpeakerId(label, index);
      return { speaker, label, gender: defaultGender(speaker, index), text: clean(match[2]) };
    })
    .filter(Boolean);
}

function normalizeLine(line, index, speakers) {
  const label = clean(line?.label || line?.name || line?.role || line?.speakerLabel) || `Speaker ${index === 0 ? 'A' : 'B'}`;
  const speaker = canonicalSpeakerId(line?.speaker || line?.speakerId || label, index);
  const speakerInfo = speakers.find(item => item.id === speaker || item.label.toLowerCase() === label.toLowerCase());
  const gender = clean(line?.gender || line?.voiceGender || speakerInfo?.gender).toLowerCase() === 'male' ? 'male' : defaultGender(speaker, index);
  const voice = clean(line?.voice || line?.voiceName || speakerInfo?.voice);
  const text = clean(line?.text || line?.utterance || line?.content);
  return text ? { speaker, label: speakerInfo?.label || label, gender, ...(voice ? { voice } : {}), text } : null;
}

export function normalizeListeningScript(input = {}) {
  const rawSpeakers = Array.isArray(input.speakers) ? input.speakers : [];
  const speakers = rawSpeakers.map((item, index) => {
    const label = clean(item?.label || item?.name || item?.role) || `Speaker ${index === 0 ? 'A' : 'B'}`;
    const id = canonicalSpeakerId(item?.id || item?.speaker || label, index);
    const gender = clean(item?.gender || item?.voiceGender).toLowerCase() === 'male' ? 'male' : defaultGender(id, index);
    const voice = clean(item?.voice || item?.voiceName);
    return { id, label, gender, ...(voice ? { voice } : {}) };
  });

  const providedLines = Array.isArray(input.audioLines)
    ? input.audioLines.map((line, index) => normalizeLine(line, index, speakers)).filter(Boolean)
    : [];
  const parsedLines = providedLines.length ? providedLines : parseLabelledText(input.audioText);
  const requestedMode = clean(input.audioMode).toLowerCase();
  const audioMode = requestedMode === 'dialogue' || (!requestedMode && parsedLines.length >= 2) ? 'dialogue' : 'narration';

  if (audioMode === 'dialogue' && parsedLines.length >= 2) {
    const audioLines = parsedLines;
    const speakerMap = new Map();
    audioLines.forEach(line => {
      if (!speakerMap.has(line.speaker)) speakerMap.set(line.speaker, { id: line.speaker, label: line.label, gender: line.gender, ...(line.voice ? { voice: line.voice } : {}) });
      else if (speakerMap.get(line.speaker).label.startsWith('Speaker ')) speakerMap.get(line.speaker).label = line.label;
    });
    const normalizedSpeakers = Array.from(speakerMap.values());
    return {
      audioMode,
      speakers: normalizedSpeakers,
      audioLines,
      audioText: audioLines.map(line => `${line.label}: ${line.text}`).join('\n'),
    };
  }

  return {
    audioMode: 'narration',
    speakers: [],
    audioLines: [],
    audioText: clean(input.audioText || input.script),
  };
}

export function listeningUtterances(exercise, fallbackGender = 'female') {
  const script = normalizeListeningScript(exercise);
  if (script.audioMode !== 'dialogue') return [];
  return script.audioLines.map(line => ({
    text: line.text,
    gender: line.gender || fallbackGender,
    ...(line.voice ? { voice: line.voice } : {}),
    label: line.label,
  }));
}
