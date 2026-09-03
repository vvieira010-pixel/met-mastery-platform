import { useState, useCallback, useRef, useEffect } from 'react';
import { SPEAKING_TASKS as DEFAULT_TASKS } from '../../data/mock-test-1/speaking.js';
import { fetchAudio } from '../../lib/tts-utils.js';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../shared.jsx';

export default function SpeakingSection({ onComplete, speakingData }) {
  const SPEAKING_TASKS = speakingData?.TASKS || DEFAULT_TASKS;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [prepRemaining, setPrepRemaining] = useState(0);
  const [speakRemaining, setSpeakRemaining] = useState(0);
  const [recordings, setRecordings] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [promptPlayed, setPromptPlayed] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const startSpeakingRef = useRef(null);

  const task = SPEAKING_TASKS[currentIdx];
  const total = SPEAKING_TASKS.length;

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startPrep = useCallback(() => {
    setPhase('prep');
    setPrepRemaining(task.prepSeconds);
    timerRef.current = setInterval(() => {
      setPrepRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          startSpeakingRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [task.prepSeconds]);

  const startSpeaking = useCallback(async () => {
    setPhase('speak');
    setSpeakRemaining(task.speakSeconds);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Your browser does not support audio recording. Please use a modern browser and ensure you are using HTTPS.';
      window.toast?.(msg, 'warn') || window.alert(msg);
      setPhase('done');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e => { if (e.data.size > 0) chunksRef.current.push(e.data); });
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordings(prev => ({ ...prev, [currentIdx]: URL.createObjectURL(blob) }));
      };
      recorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setSpeakRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (recorder.state !== 'inactive') recorder.stop();
            setIsRecording(false);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      console.error('[SpeakingSection] startSpeaking failed:', e);
      const msg = 'Microphone access denied or not available. Please check your browser permissions.';
      window.toast?.(msg, 'warn') || window.alert(msg);
      setPhase('done');
    }
  }, [currentIdx, task.speakSeconds]);

  useEffect(() => { startSpeakingRef.current = startSpeaking; }, [startSpeaking]);

  const handlePlayPrompt = useCallback(async () => {
    if (narrating) return;
    setNarrating(true);
    const playAndPrep = (url) => {
      const audio = new Audio(url);
      audio.addEventListener('ended', () => startPrep());
      audio.play().then(() => setPromptPlayed(true)).catch(() => {
        // Autoplay blocked — keep the button visible so the user can start manually
        setPromptPlayed(false);
      });
    };
    try {
      const url = await fetchAudio(task.prompt);
      if (url) {
        playAndPrep(url);
      } else if (task.audio) {
        playAndPrep(task.audio);
      } else {
        setPromptPlayed(true);
        startPrep();
      }
    } catch (e) {
      console.warn('[speaking] Deepgram narration failed:', e);
      if (task.audio) playAndPrep(task.audio);
      else { setPromptPlayed(true); startPrep(); }
    } finally {
      setNarrating(false);
    }
  }, [narrating, task.prompt, task.audio, startPrep]);

  const autoStartedRef = useRef(-1);
  useEffect(() => {
    if (phase === 'intro' && autoStartedRef.current !== currentIdx) {
      autoStartedRef.current = currentIdx;
      handlePlayPrompt();
    }
  }, [phase, currentIdx, handlePlayPrompt]);

  const handleNext = useCallback(() => {
    cleanup();
    setPromptPlayed(false);
    if (currentIdx < total - 1) {
      setCurrentIdx(i => i + 1);
      setPhase('intro');
    } else {
      onComplete(recordings);
    }
  }, [currentIdx, total, recordings, onComplete, cleanup]);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="ss">
      <div className="ss__content">
        <div className="ss__task-label">Task {task.id} of {total}</div>
        <h3 className="ss__task-title">{task.label}</h3>

        {phase === 'intro' && (
          <div className="ss__phase">
            <p className="ss__prompt">{task.prompt}</p>
            {!promptPlayed ? (
              <Button variant="primary" onClick={handlePlayPrompt} className="ss__btn" disabled={narrating}>
                <Icon.play size={16} /> {narrating ? 'Generating narration…' : 'Play Prompt & Start Preparation'}
              </Button>
            ) : (
              <div className="ss__prep-count" aria-live="polite">Getting ready...</div>
            )}
          </div>
        )}

        {phase === 'prep' && (
          <div className="ss__phase">
            <div className={`ss__countdown ${prefersReducedMotion ? '' : 'ss__countdown--animated'}`}>
              <div className="ss__countdown-label">Preparation Time</div>
              <div className="ss__countdown-time" aria-live="polite">{prepRemaining}s remaining</div>
              <div className="ss__countdown-bar" role="progressbar" aria-valuenow={prepRemaining} aria-valuemin={0} aria-valuemax={task.prepSeconds} aria-label="Preparation time remaining">
                <div className="ss__countdown-fill" style={{ transform: `scaleX(${prepRemaining / task.prepSeconds})` }} />
              </div>
            </div>
          </div>
        )}

        {phase === 'speak' && (
          <div className="ss__phase">
            <div className={`ss__countdown ${prefersReducedMotion ? '' : 'ss__countdown--animated'}`}>
              <div className="ss__countdown-label">{isRecording ? 'Recording Time' : 'Speaking Time'}</div>
              <div className="ss__countdown-time" aria-live="polite">{speakRemaining}s remaining</div>
              <div className="ss__countdown-bar" role="progressbar" aria-valuenow={speakRemaining} aria-valuemin={0} aria-valuemax={task.speakSeconds} aria-label="Speaking time remaining">
                <div className="ss__countdown-fill" style={{ transform: `scaleX(${speakRemaining / task.speakSeconds})` }} />
              </div>
            </div>
            <div className="ss__waveform" aria-live="polite">
              <Icon.mic size={20} className={isRecording ? 'ss__mic--recording' : ''} />
              {isRecording ? 'Recording in progress...' : 'Preparing microphone...'}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="ss__phase">
             <div className="ss__done-msg" role="status">
                {recordings[currentIdx] ? <Icon.check size={20} className="ss__icon--success" /> : <Icon.warning size={20} className="ss__icon--warning" />}
               Task {task.id} {recordings[currentIdx] ? 'completed' : 'skipped'}
             </div>
            <Button variant="primary" onClick={handleNext} className="ss__btn">
              {currentIdx < total - 1 ? <>Continue to Next Task <Icon.arrowRight size={14} /></> : 'Finish Speaking Section'}
            </Button>
          </div>
        )}
      </div>
      <style>{`
        .ss { display: flex; justify-content: center; padding: var(--space-8) var(--space-5); }
        .ss__content { max-width: 600px; width: 100%; }
        .ss__task-label { font-size: var(--text-xs); font-weight: 700; color: var(--primary); margin-bottom: var(--space-1); }
        .ss__task-title { font-size: var(--text-xl); font-weight: 700; color: var(--text); margin: 0 0 var(--space-5); }
        .ss__phase { display: flex; flex-direction: column; gap: var(--space-5); }
        .ss__prompt { font-size: var(--text-base); line-height: 1.7; color: var(--text); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-4); }
        .ss__btn { align-self: flex-start; }
        .ss__countdown { text-align: center; padding: var(--space-5); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); }
        .ss__countdown--prep { border-color: var(--accent); }
        .ss__countdown--speak { border-color: var(--primary); }
        .ss__countdown-label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--space-1); letter-spacing: 0.05em; }
        .ss__countdown-time { font-size: 36px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; font-family: var(--font-mono); }
        .ss__countdown-bar { height: 6px; background: var(--bg); border-radius: var(--radius-full); margin-top: var(--space-2); overflow: hidden; }
        .ss__countdown-fill { height: 100%; width: 100%; border-radius: var(--radius-full); transform-origin: left; background: var(--primary); transition: transform 1s linear; }
        .ss__countdown--prep .ss__countdown-fill { background: var(--accent); }
        .ss__countdown--animated .ss__countdown-fill { transition: transform 1s linear; }
        @media (prefers-reduced-motion: reduce) { .ss__countdown-fill { transition: none; } }
        .ss__waveform { text-align: center; font-size: var(--text-sm); color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-top: var(--space-4); }
        .ss__mic--recording { color: var(--danger); animation: ss-pulse 1s ease-in-out infinite; }
        @keyframes ss-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (prefers-reduced-motion: reduce) { .ss__mic--recording { animation: none; } }
        .ss__done-msg { font-size: var(--text-base); font-weight: 600; color: var(--text); text-align: center; padding: var(--space-5); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; gap: var(--space-2); }
        .ss__icon--success { color: var(--success); }
        .ss__icon--warning { color: var(--warning); }
        .ss__prep-count { color: var(--text-muted); font-size: var(--text-sm); }
        @media (max-width: 640px) {
          .ss { padding: var(--space-4) var(--space-3); }
          .ss__content { max-width: 100%; }
          .ss__prompt { padding: var(--space-3); font-size: var(--text-sm); }
          .ss__countdown-time { font-size: 28px; }
          .ss__btn { align-self: stretch; min-height: 44px; }
        }
      `}</style>
    </div>
  );
}