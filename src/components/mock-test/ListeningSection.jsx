import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { LISTENING_PART1 as DEFAULT_PART1, LISTENING_PART2 as DEFAULT_PART2, LISTENING_PART3 as DEFAULT_PART3 } from '../../data/mock-test-1/listening.js';
import { callAI } from '../../lib/callAI.js';
import { fetchConversationAudio, fetchAudioWithGender } from '../../lib/tts-utils.js';
import QuestionNav from './QuestionNav.jsx';
import OptionButton from './OptionButton.jsx';
import NavButtons from './NavButtons.jsx';
import { STORAGE_KEYS } from './constants.js';

const PART3_VOICE_MAP = { 0: 'female', 1: 'male', 2: 'female', 3: 'male' };

const CACHE_PREFIX = 'met:listening:audio:';

async function generateScript(context) {
  const prompt = `Write a very short, natural English conversation (2-4 lines) between two speakers for a listening test. Use "A:" and "B:" prefixes. The conversation should relate to this context: ${context}. Keep each line under 15 words. Output ONLY the script lines, one per line.`;
  const res = await callAI(prompt, { system: 'You write short natural English conversation scripts for language tests. Output only the script lines.', temperature: 0.5, max_tokens: 500 });
  const text = res?.content?.[0]?.text || res?.text || '';
  return text.split('\n').filter(l => l.trim()).map(l => {
    const m = l.trim().match(/^([AB]):\s*(.+)/i);
    if (!m) return null;
    return { speaker: m[1].toUpperCase(), text: m[2] };
  }).filter(Boolean);
}

function utterancesFromScript(script) {
  return script.map(u => ({
    text: u.text,
    gender: u.speaker === 'A' ? 'female' : 'male'
  }));
}

async function generateTalkAudio(context, gender) {
  const prompt = `Write a short English monologue (3-5 sentences) for a listening test. Topic context: ${context}. Keep it natural and under 60 words.`;
  const res = await callAI(prompt, { system: 'You write short natural English monologues for language tests. Output only the monologue text.', temperature: 0.5, max_tokens: 500 });
  const text = res?.content?.[0]?.text || res?.text || '';
  const clean = text.replace(/^["']|["']$/g, '').trim();
  return fetchAudioWithGender(clean, gender);
}

export default function ListeningSection({ onComplete, listeningData }) {
  const PART1 = listeningData?.PART1 || DEFAULT_PART1;
  const PART2 = listeningData?.PART2 || DEFAULT_PART2;
  const PART3 = listeningData?.PART3 || DEFAULT_PART3;

  const { questions: QUESTIONS, partBoundaries: PART_BOUNDARIES } = useMemo(() => {
    const qs = [];
    PART1.questions.forEach(q => qs.push({
      ...q, audio: q.audio, isConversation: true, conversationId: `part1_${q.id}`,
      scriptContext: q.text + ' ' + q.options.join(' '),
      part: 1, partLabel: PART1.label, partInstructions: PART1.instructions
    }));
    PART2.conversations.forEach(c => {
      const ctx = (c.questions || []).map(q => q.text + ' ' + q.options.join(' ')).join(' ');
      c.questions.forEach(q => qs.push({
        ...q, audio: c.audio, isConversation: true, conversationId: c.title,
        scriptContext: ctx,
        part: 2, partLabel: PART2.label, partInstructions: PART2.instructions
      }));
    });
    PART3.talks.forEach((t, i) => {
      const ctx = (t.questions || []).map(q => q.text + ' ' + q.options.join(' ')).join(' ');
      t.questions.forEach(q => qs.push({
        ...q, audio: t.audio, isConversation: false, conversationId: t.title,
        scriptContext: ctx, talkVoice: PART3_VOICE_MAP[i] || 'female',
        part: 3, partLabel: PART3.label, partInstructions: PART3.instructions
      }));
    });
    const boundaries = [];
    qs.forEach((qq, i) => {
      if (i === 0 || qq.part !== qs[i - 1].part) {
        boundaries.push({ part: qq.part, label: qq.partLabel, startIdx: i });
      }
    });
    return { questions: qs, partBoundaries: boundaries };
  }, [PART1, PART2, PART3]);

  const PART_LABELS = useMemo(() => {
    const labels = {};
    if (PART1.questions.length > 0) labels[1] = 'Part 1';
    if (PART2.conversations.length > 0) labels[2] = 'Part 2';
    if (PART3.talks.length > 0) labels[3] = 'Part 3';
    return labels;
  }, [PART1, PART2, PART3]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState({});
  const [answered, setAnswered] = useState({});
  const [playing, setPlaying] = useState(null);
  const [generating, setGenerating] = useState(null);
  const audioRef = useRef(null);

  const q = QUESTIONS[currentIdx];
  const total = QUESTIONS.length;
  const answeredCount = Object.keys(answered).length;

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SECTION_ANSWERS('listening')) || '{}');
      const keys = Object.keys(saved);
      if (keys.length > 0) {
        const sel = {}; const ans = {};
        keys.forEach(k => { sel[k] = saved[k]; ans[k] = true; });
        setSelected(sel); setAnswered(ans);
      }
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const persistAnswer = useCallback((qId, optIdx) => {
    setSelected(prev => ({ ...prev, [qId]: optIdx }));
    setAnswered(prev => ({ ...prev, [qId]: true }));
    try {
      const store = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SECTION_ANSWERS('listening')) || '{}');
      store[qId] = optIdx;
      sessionStorage.setItem(STORAGE_KEYS.SECTION_ANSWERS('listening'), JSON.stringify(store));
    } catch {}
  }, []);

  const playAudio = useCallback(async (src) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(src);

    try {
      const audio = new Audio(src);
      audioRef.current = audio;
      await audio.play();
      audio.addEventListener('ended', () => setPlaying(null));
    } catch {
      setPlaying(null);
    }
  }, []);

  const handlePlay = useCallback(async (question) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    const cacheKey = CACHE_PREFIX + question.id;
    let cachedUrl = null;
    try { cachedUrl = sessionStorage.getItem(cacheKey); } catch {}

    if (cachedUrl) {
      await playAudio(cachedUrl);
      return;
    }

    setGenerating(question.id);

    try {
      let url = null;

      if (question.isConversation) {
        const scriptCacheKey = CACHE_PREFIX + 'script:' + question.conversationId;
        let script = null;
        try {
          const cached = sessionStorage.getItem(scriptCacheKey);
          if (cached) script = JSON.parse(cached);
        } catch {}

        if (!script) {
          script = await generateScript(question.scriptContext);
          if (script && script.length > 0) {
            try { sessionStorage.setItem(scriptCacheKey, JSON.stringify(script)); } catch {}
          }
        }

        if (script && script.length > 0) {
          const utterances = utterancesFromScript(script);
          url = await fetchConversationAudio(utterances);
        }
      } else {
        url = await generateTalkAudio(question.scriptContext, question.talkVoice || 'female');
      }

      if (url) {
        try { sessionStorage.setItem(cacheKey, url); } catch {}
        await playAudio(url);
      } else {
        await playAudio(question.audio);
      }
    } catch {
      await playAudio(question.audio);
    }

    setGenerating(null);
  }, [playAudio]);

  const handleFinish = useCallback(() => {
    const all = {};
    QUESTIONS.forEach(qq => { if (selected[qq.id] !== undefined) all[qq.id] = selected[qq.id]; });
    onComplete(all);
  }, [selected, onComplete]);

  const navigate = (delta) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlaying(null); }
    setCurrentIdx(i => Math.max(0, Math.min(total - 1, i + delta)));
  };

  return (
    <div className="ls">
      <QuestionNav
        total={total}
        currentIdx={currentIdx}
        answered={answered}
        onJump={(idx) => navigate(idx - currentIdx)}
        partBoundaries={PART_BOUNDARIES}
        partLabels={PART_LABELS}
        sectionName="Listening"
        ariaLabel="Listening section questions"
      />
      <div className="ls__main">
        <div className="ls__q-label">Question {currentIdx + 1} of {total} <span className="pill pill-accent">{q.partLabel}</span></div>

        <div className="card ls__part-header">
          <span className="ls__part-header-label">{q.partLabel}</span>
          <span className="ls__part-header-instructions">{q.partInstructions}</span>
        </div>

        <div className="ls__audio-row">
          <button
            className={`btn btn-primary ${playing ? 'btn--playing' : ''}`}
            onClick={() => handlePlay(q)}
            disabled={generating === q.id}
            aria-label={generating === q.id ? 'Generating audio...' : playing ? 'Stop audio' : 'Play audio'}
          >
            {generating === q.id ? (
              <>⏳ Generating...</>
            ) : playing ? (
              <>⏹ Stop</>
            ) : (
              <>▶ Play Audio</>
            )}
          </button>
          {q.isConversation && (
            <span className="pill pill-info">Multi-voice</span>
          )}
        </div>

        <p className="ls__q-text">{q.text}</p>

        <div className="ls__options" role="radiogroup" aria-label={`Question ${currentIdx + 1} options`}>
          {q.options.map((opt, i) => (
            <OptionButton
              key={i}
              letter={'ABCD'[i]}
              selected={selected[q.id] === i}
              onSelect={() => persistAnswer(q.id, i)}
            >
              {opt}
            </OptionButton>
          ))}
        </div>

<NavButtons
          currentIdx={currentIdx}
          total={total}
          answeredCount={answeredCount}
          sectionName="Listening section"
          onPrevious={() => navigate(-1)}
          onNext={() => navigate(1)}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}