/**
 * Listening.jsx — Student-facing listening exercise component.
 *
 * TTS priority:
 *   1. Server-side proxy (/api/tts)
 *   2. Browser speechSynthesis (always available, no key needed)
 *
 * Flow:
 *   Student presses ▶ → audio plays (limit: exercise.plays, default 2)
 *   After first play → question + options appear
 *   Student selects an option → submits → instant feedback + explanation
 *
 * Supports multi-speaker dialogues via exercise.script array:
 *   [{ speaker: 'A', text: '...' }, { speaker: 'B', text: '...' }]
 * Each speaker gets a distinct voice.
 */
import { useState, useRef, useCallback, useEffect } from 'react';

const TEAL = '#0D9488';
const NAVY = '#0B1F3A';
// Theme-aware text color (NAVY is near-invisible in dark mode).
const TEXT = 'var(--text)';

/* Map speaker IDs to voice preferences */
function getVoiceForSpeaker(speaker, voices) {
  const speakerIndex = speaker.charCodeAt(0) - 65; // A=0, B=1, etc.
  const filtered = voices.filter(v => v.lang.startsWith('en'));
  if (filtered.length === 0) return null;

  // Alternate between male/female-sounding voices
  const femaleVoices = filtered.filter(v => /female|woman|samantha|victoria|karen|moira|tessa|fiona/i.test(v.name));
  const maleVoices = filtered.filter(v => /male|man|alex|daniel|tom|oliver|arthur|george/i.test(v.name));
  const otherVoices = filtered.filter(v => !femaleVoices.includes(v) && !maleVoices.includes(v));

  const pools = [femaleVoices, maleVoices, otherVoices].filter(p => p.length > 0);
  if (pools.length === 0) return filtered[0];

  const pool = pools[speakerIndex % pools.length];
  return pool[speakerIndex % pool.length] || pool[0];
}

/* ── Component ────────────────────────────────────────────────── */
export default function Listening({ exercise, onComplete }) {
  const {
    audioText = '',
    audioSrc = '',
    question = '',
    options = [],
    correct = null,
    explanation = '',
    listeningFormat = 'multiple_choice',
    gaps = [],
    sequenceItems = [],
    correctOrder = [],
    sourceSentence = '',
    plays = 0,
    pictureHint = '',
    script = null,
  } = exercise;

const [playCount, setPlayCount] = useState(0);
  const [, setError]              = useState('');
  const [playing, setPlaying]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const [gapAnswers, setGapAnswers] = useState({});
  const [orderAnswer, setOrderAnswer] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioUrl, setAudioUrl]   = useState(audioSrc || null);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  const [voices, setVoices] = useState([]);
  const audioRef = useRef(null);
  const utteranceQueueRef = useRef([]);
  const currentUtteranceIndexRef = useRef(0);
  const isPlayingScriptRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, []);

  const maxPlays = plays === 0 ? Infinity : plays;
  const canPlay = !playing && !submitted && playCount < maxPlays;
  const isDialogue = Array.isArray(script) && script.length > 0;

  const speakLine = useCallback((line, voice) => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.voice = voice || null;
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const playScriptSequentially = useCallback(async () => {
    if (!isDialogue || voices.length === 0) return;

    isPlayingScriptRef.current = true;
    setPlaying(true);

    for (let i = 0; i < script.length; i++) {
      if (!isPlayingScriptRef.current) break;
      const line = script[i];
      const voice = getVoiceForSpeaker(line.speaker, voices);
      const text = line.text;
      await speakLine(text, voice);
      await new Promise(r => setTimeout(r, 300));
    }

    isPlayingScriptRef.current = false;
    setPlaying(false);
    setPlayCount(c => c + 1);
  }, [isDialogue, script, voices, speakLine]);

  const stopScript = useCallback(() => {
    isPlayingScriptRef.current = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  const playAudio = useCallback(async () => {
    if (audioUrl) {
      audioRef.current?.play();
      return;
    }

    if (isDialogue && voices.length > 0) {
      await playScriptSequentially();
      return;
    }

    setIsFetchingAudio(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: audioText }),
      });
      const data = await res.json();
      if (data.audioB64) {
        setAudioUrl(data.audioB64);
        setTimeout(() => {
          audioRef.current?.play();
        }, 100);
      } else {
        setError(data.error?.message || 'Failed to fetch audio');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsFetchingAudio(false);
    }
  }, [audioText, audioUrl, isDialogue, voices, playScriptSequentially]);

  const handlePlay = useCallback(async () => {
    if (!canPlay) return;
    if (playing) {
      stopScript();
      return;
    }
    await playAudio();
  }, [canPlay, playAudio, playing, stopScript]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplay = () => setPlaying(true);
      audioRef.current.onpause = () => setPlaying(false);
      audioRef.current.onended = () => {
        setPlaying(false);
        if (!isDialogue) setPlayCount(c => c + 1);
      };
    }
  }, [isDialogue]);

  function handleSubmit() {
    const normalize = value => String(value || '').trim().toLowerCase().replace(/[.!?,;:]+$/g, '').replace(/\s+/g, ' ');
    let isCorrect;
    if (listeningFormat === 'gap_fill') {
      if (!gaps.length || gaps.some((gap, i) => !normalize(gapAnswers[gap.id || i]))) return;
      isCorrect = gaps.every((gap, i) => (gap.acceptableAnswers || []).some(answer => normalize(answer) === normalize(gapAnswers[gap.id || i])));
    } else if (listeningFormat === 'ordering') {
      if (!sequenceItems.length || orderAnswer.length !== sequenceItems.length || orderAnswer.some(value => value === '')) return;
      isCorrect = orderAnswer.every((value, i) => Number(value) === Number(correctOrder[i] ?? i));
    } else {
      if (selected == null) return;
      isCorrect = selected === correct;
    }
    setSubmitted(true);
    if (onComplete) onComplete({ correct: isCorrect });
  }

  const isCorrect = submitted && (listeningFormat === 'gap_fill'
    ? gaps.length > 0 && gaps.every((gap, i) => (gap.acceptableAnswers || []).some(answer => String(answer).trim().toLowerCase() === String(gapAnswers[gap.id || i] || '').trim().toLowerCase()))
    : listeningFormat === 'ordering'
      ? orderAnswer.length === sequenceItems.length && orderAnswer.every((value, i) => Number(value) === Number(correctOrder[i] ?? i))
      : selected === correct);

  function optionStyle(i) {
    const base = {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10,
      border: '1.5px solid', cursor: submitted ? 'default' : 'pointer',
      transition: 'all 0.15s', fontSize: 14.5, lineHeight: 1.5,
      fontFamily: 'var(--font-ui)', textAlign: 'left', width: '100%',
    };
    if (!submitted) {
      return selected === i
        ? { ...base, borderColor: TEAL, background: 'var(--primary-light)', color: TEXT }
        : { ...base, borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' };
    }
    if (i === correct) return { ...base, borderColor: '#3D8C65', background: '#ECFDF5', color: '#065F46' };
    if (i === selected && !isCorrect) return { ...base, borderColor: 'var(--danger)', background: '#FEF2F2', color: '#991B1B' };
    return { ...base, borderColor: 'var(--divider)', background: 'var(--surface)', color: 'var(--muted)', opacity: 0.6 };
  }

  function markerLabel(i) {
    if (!submitted) return selected === i ? '◉' : '○';
    if (i === correct) return '✓';
    if (i === selected && !isCorrect) return '✗';
    return String.fromCharCode(65 + i);
  }

  const playsLeft = maxPlays === Infinity ? null : maxPlays - playCount;

  return (
    <div style={{ padding: '16px 20px' }}>
      <audio
        ref={audioRef}
        src={audioUrl}
        style={{ display: 'none' }}
      />

      {pictureHint && (
        <div style={{
          padding: '8px 12px', marginBottom: 16, borderRadius: 8,
          background: 'var(--accent-subtle)', color: 'var(--muted)',
          fontSize: 13, fontStyle: 'italic', lineHeight: 1.5, border: '1px solid var(--accent-soft)',
        }}>
          🖼 {pictureHint}
        </div>
      )}

      <div style={{
        padding: '20px 16px', borderRadius: 14, marginBottom: 20,
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          color: '#0E5F6B', textTransform: 'uppercase',
        }}>
          🎧 Listening Exercise
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handlePlay}
            disabled={isFetchingAudio || !(audioText || audioSrc || isDialogue) || !canPlay}
            aria-label={isFetchingAudio ? 'Loading audio...' : playing ? 'Pause audio' : 'Play audio'}
            style={{
              width: 64, height: 64, borderRadius: '50%', border: 'none',
              background: isFetchingAudio ? 'var(--border)' : playing ? '#A34E48' : TEAL,
              color: '#fff',
              cursor: (isFetchingAudio || !(audioText || audioSrc || isDialogue) || !canPlay) ? 'not-allowed' : 'pointer',
              fontSize: 24, display: 'grid', placeItems: 'center',
              boxShadow: playing ? '0 0 0 6px rgba(239,68,68,.15)' : '0 4px 14px rgba(13,148,136,.3)',
              transition: 'all 0.18s var(--ease)',
              opacity: (isFetchingAudio || !(audioText || audioSrc || isDialogue) || !canPlay) ? 0.45 : 1,
            }}
          >
            {isFetchingAudio ? '⏳' : playing ? '⏸' : '▶'}
          </button>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
          {isFetchingAudio
            ? 'Loading audio...'
            : playing
              ? isDialogue
                ? 'Playing dialogue…'
                : 'Playing audio…'
              : playCount > 0
                ? playsLeft === 0
                  ? 'Maximum plays reached'
                  : `${playsLeft} play${playsLeft > 1 ? 's' : ''} remaining — click ▶ to replay`
                : isDialogue
                  ? 'Click ▶ to play dialogue'
                  : 'Click ▶ to play audio'}
        </div>
      </div>

      {audioText && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowTranscript(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: showTranscript ? 'var(--accent-subtle)' : 'var(--surface)',
              color: showTranscript ? 'var(--primary)' : 'var(--muted)',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {showTranscript ? '▾ Hide transcript' : '▸ Show transcript'}
          </button>
          {showTranscript && (
            <div style={{
              marginTop: 8, padding: '10px 14px', borderRadius: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              fontSize: 13.5, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-line',
            }}>
              {audioText}
            </div>
          )}
        </div>
      )}

      {playCount > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0E5F6B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{listeningFormat.replace(/_/g, ' ')}</div>
          {sourceSentence && listeningFormat === 'paraphrase' && <div style={{ padding: '10px 12px', marginBottom: 12, borderLeft: '3px solid #0E5F6B', background: 'var(--accent-subtle)', color: TEXT, fontStyle: 'italic' }}>“{sourceSentence}”</div>}
          <p style={{ fontSize: 15.5, fontWeight: 600, color: TEXT, marginBottom: 16, lineHeight: 1.6 }}>{question || (listeningFormat === 'gap_fill' ? 'Complete the missing words.' : listeningFormat === 'ordering' ? 'Put the events in the order you hear them.' : 'Choose the best answer.')}</p>

          {listeningFormat === 'gap_fill' ? (
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>{gaps.map((gap, i) => <label key={gap.id || i} style={{ display: 'grid', gap: 5, fontSize: 13, color: TEXT }}>{gap.prompt || `Blank ${i + 1}`}<input value={gapAnswers[gap.id || i] || ''} disabled={submitted} onChange={e => setGapAnswers(prev => ({ ...prev, [gap.id || i]: e.target.value }))} placeholder="Type what you hear" style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, font: 'inherit' }} /></label>)}</div>
          ) : listeningFormat === 'ordering' ? (
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>{sequenceItems.map((_, i) => <label key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center', fontSize: 13, color: TEXT }}><span>{i + 1}.</span><select value={orderAnswer[i] ?? ''} disabled={submitted} onChange={e => setOrderAnswer(prev => { const next = [...prev]; next[i] = e.target.value; return next; })} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, font: 'inherit' }}><option value="">Choose an event</option>{sequenceItems.map((item, optionIndex) => <option key={optionIndex} value={optionIndex}>{item || `Event ${optionIndex + 1}`}</option>)}</select></label>)}</div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !submitted && setSelected(i)}
                style={optionStyle(i)}
                aria-pressed={selected === i}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'grid', placeItems: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                  background: submitted && i === correct
                    ? '#3D8C65'
                    : submitted && i === selected && !isCorrect
                      ? 'var(--danger)'
                      : 'transparent',
                  color: submitted && (i === correct || (i === selected && !isCorrect))
                    ? '#fff'
                    : 'inherit',
                }}>
                  {markerLabel(i)}
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
          )}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={listeningFormat === 'gap_fill' ? !gaps.length || gaps.some((gap, i) => !gapAnswers[gap.id || i]?.trim()) : listeningFormat === 'ordering' ? orderAnswer.length !== sequenceItems.length || orderAnswer.some(value => value === '') : selected == null}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                cursor: selected == null ? 'not-allowed' : 'pointer',
                background: selected == null
                  ? 'var(--border)'
                  : `linear-gradient(120deg, ${TEAL} 0%, ${NAVY} 100%)`,
                color: '#fff', fontWeight: 600, fontSize: 14,
                fontFamily: 'var(--font-ui)',
                opacity: selected == null ? 0.5 : 1, transition: 'all 0.15s',
              }}
            >
              Submit answer
            </button>
          ) : (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: isCorrect ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${isCorrect ? '#A7F3D0' : '#FECACA'}`,
              fontSize: 14,
            }}>
              <div style={{
                color: isCorrect ? '#065F46' : '#991B1B',
                fontWeight: 600,
                marginBottom: explanation ? 6 : 0,
              }}>
                {isCorrect ? '✓ Correct — well done.' : '✗ Not quite. Review the correct answer above.'}
              </div>
              {explanation && (
                <div style={{ color: '#374151', fontWeight: 400, fontSize: 13.5, lineHeight: 1.65 }}>
                  {explanation}
                </div>
              )}
              {audioText && (
                <details style={{ marginTop: 10, borderTop: '1px solid var(--divider)', paddingTop: 8 }}>
                  <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0E5F6B' }}>
                    Show transcript
                  </summary>
                  <div style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-line' }}>
                    {audioText}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
