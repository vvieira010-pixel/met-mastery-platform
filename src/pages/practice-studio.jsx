import { useState, useEffect } from 'react';
import { Icon, Card } from '../components/shared.jsx';
import ExercisePlayer from '../components/exercises/ExercisePlayer.jsx';
import FadingBanner from '../components/FadingBanner.jsx';
import {
  getGrammarExercises,
  getTopicList,
  getVocabExercises,
  getSpeakingExercises,
  getWritingExercises,
  getListeningExercises,
  getListeningAudioGroups,
  getMetB2MultipleChoiceExercises,
} from '../lib/vocab-homework-bank.js';
import { savePracticeSession } from '../lib/workflow.js';
import { getExamMode, getDaysUntilExam, MODE_SPRINT } from '../lib/exam-window.js';
import { LISTENING_FORMATS } from '../lib/exercise-types.js';
import {
  getScaffoldLevel,
  setScaffoldLevel,
  classifyRetrieval,
  evaluateFading,
  getLevelInfo,
  logSession,
} from '../lib/fading-manager.js';

const MODE_LABELS = {
  grammar: 'Grammar Sprint',
  vocab: 'Vocab Deep-Dive',
  speaking: 'Speaking Mirror',
  writing: 'Writing Studio',
  listening: 'Listening Lab',
  b2_mcq: 'B2 Skills Pack',
};

const MODE_SUBTITLES = {
  grammar: '10 grammar questions · B2 level',
  vocab: 'Vocabulary matching & fill-in-the-blank',
  speaking: 'Speaking & writing practice prompts',
  writing: 'Paragraph & short-answer writing tasks',
  listening: 'Interactive listening & embedded lessons',
  b2_mcq: 'Grammar, vocabulary, reading, listening, writing & speaking',
};

const MODE_ICONS = {
  grammar: Icon.edit,
  vocab: Icon.star,
  speaking: Icon.mic,
  writing: Icon.edit,
  listening: Icon.headset,
  b2_mcq: Icon.book,
};

const KIND_OPTIONS = [
  { id: 'grammar', label: 'Grammar' },
  { id: 'vocab', label: 'Vocabulary' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'writing', label: 'Writing' },
  { id: 'listening', label: 'Listening' },
  { id: 'b2_mcq', label: 'B2 Skills Pack' },
];

export default function PracticeStudio({ studentId, onBack, "data-testid": testId }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedKind, setSelectedKind] = useState(null);
  const [selectedListeningFormat, setSelectedListeningFormat] = useState('all');
  const [sessionKey, setSessionKey] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  const daysLeft = getDaysUntilExam();
  const examMode = getExamMode();
  const [topics, setTopics] = useState([]);

  const [scaffoldLevel, setScaffoldLevelState] = useState(4);
  const [fadingVerdict, setFadingVerdict] = useState(null);
  const [sessionScore, setSessionScore] = useState(null);

  useEffect(() => {
    if (!selectedKind) return;
    async function loadTopics() {
      if (selectedKind === 'listening') {
        const listeningTopics = await getListeningAudioGroups();
        setTopics(listeningTopics);
      } else {
        setTopics(getTopicList(selectedKind));
      }
    }
    loadTopics();
  }, [selectedKind]);

  useEffect(() => {
    if (!selectedKind) return;
    const level = getScaffoldLevel(selectedKind, selectedTopic);
    setScaffoldLevelState(level);
  }, [selectedKind, selectedTopic]);

  useEffect(() => {
    if (!selectedKind) return;
    let cancelled = false;
    setLoading(true);
    setFadingVerdict(null);
    setSessionScore(null);
    async function load() {
      let ex = [];
      try {
        if (selectedKind === 'grammar') {
          ex = await getGrammarExercises();
        } else if (selectedKind === 'vocab' && selectedTopic) {
          ex = await getVocabExercises(selectedTopic);
        } else if (selectedKind === 'speaking' && selectedTopic) {
          ex = await getSpeakingExercises(selectedTopic);
        } else if (selectedKind === 'writing' && selectedTopic) {
          ex = await getWritingExercises(selectedTopic);
        } else if (selectedKind === 'listening') {
          ex = await getListeningExercises(selectedTopic);
          if (selectedListeningFormat !== 'all') ex = ex.filter(item => (item.listeningFormat || 'multiple_choice') === selectedListeningFormat);
        } else if (selectedKind === 'b2_mcq' && selectedTopic) {
          ex = await getMetB2MultipleChoiceExercises(selectedTopic);
        }
      } catch (e) {
        console.warn('[PracticeStudio] Failed to load exercises:', e);
      }
      if (!cancelled) {
        setExercises(ex);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedKind, selectedTopic, selectedListeningFormat, sessionKey]);

  const showTopicPicker = selectedKind && selectedKind !== 'grammar' && !selectedTopic;
  const selectedTopicTitle = topics.find(t => t.id === selectedTopic)?.title || '';
  const showLanding = !selectedKind;

  function handleSelectMode(kind) {
    setSelectedKind(kind);
    setSelectedTopic(null);
    setSelectedListeningFormat('all');
    setSessionKey(k => k + 1);
    setFadingVerdict(null);
    setSessionScore(null);
  }

  function handleBackToLanding() {
    setSelectedKind(null);
    setSelectedTopic(null);
    setSelectedListeningFormat('all');
    setExercises([]);
    setFadingVerdict(null);
    setSessionScore(null);
  }

  function handleTryAnother() {
    setSelectedTopic(null);
    setSessionKey(k => k + 1);
  }

  function handleSessionComplete(summary) {
    const { score, maxHintLevel, hintUsed, results, confidenceBefore } = summary;
    setSessionScore(score);

    if (score !== null && studentId) {
      const quality = classifyRetrieval(maxHintLevel || 0, hintUsed || false, score);
      const correctCount = results?.filter(r => r?.correct === true).length || 0;
      const errorCategories = results?.filter(r => r?.errorCategory).map(r => r.errorCategory) || null;
      logSession(selectedKind, selectedTopic, {
        score,
        maxHintLevel: maxHintLevel || 0,
        hintUsed: hintUsed || false,
        quality,
        unassisted: !hintUsed,
        exerciseCount: exercises.length,
        correctCount,
        totalScored: results?.filter(r => r?.correct !== null && r?.correct !== undefined).length || 0,
        confidenceBefore: confidenceBefore ?? null,
      });

      savePracticeSession(studentId, {
        mode: selectedKind,
        topicId: selectedTopic,
        topicTitle: selectedTopicTitle,
        score,
        maxHintLevel: maxHintLevel || 0,
        hintUsed: hintUsed || false,
        quality,
        exerciseCount: exercises.length,
        correctCount,
        results,
        confidenceBefore: confidenceBefore ?? null,
        errorCategories,
      });

      const result = evaluateFading(selectedKind, selectedTopic);
      setFadingVerdict(result);

      if (result.verdict === 'reduce' || result.verdict === 'restore') {
        setScaffoldLevel(selectedKind, selectedTopic, result.newLevel);
        setScaffoldLevelState(result.newLevel);
      }
    }
  }

  return (
    <div className="student-page" data-testid={testId}>
      <header className="student-page-header">
        <button type="button" className="student-page-back" onClick={showLanding ? onBack : handleBackToLanding}>
          <Icon.arrowL size={16} />
          {showLanding ? 'Home' : 'All skills'}
        </button>
        <h1 className="student-page-title">
          {showLanding ? 'Practice Studio' : MODE_LABELS[selectedKind]}
        </h1>
        {examMode === MODE_SPRINT && (
          <span className="student-pill">{daysLeft}d to exam</span>
        )}
      </header>

      {showLanding ? (
        <div
          className="practice-studio-grid"
          data-tour-target="practice-navigation"
          data-tour-label="Practice navigation"
          data-tour-description="Choose the skill and practice mode that matches the learner's next step."
        >
          {KIND_OPTIONS.map(k => {
            const IconComp = MODE_ICONS[k.id];
            return (
              <button
                key={k.id}
                type="button"
                className="practice-studio-card"
                onClick={() => handleSelectMode(k.id)}
                data-tour-target={k.id === 'grammar' ? 'practice-skill-grammar' : undefined}
                data-tour-label={k.id === 'grammar' ? 'Grammar Sprint' : undefined}
                data-tour-description={k.id === 'grammar' ? 'Choose Grammar Sprint to start a learner-owned grammar practice set.' : undefined}
              >
                <span className="practice-studio-card-icon">
                  <IconComp size={24} />
                </span>
                <div className="practice-studio-card-body">
                  <h3>{MODE_LABELS[k.id]}</h3>
                  <p>{MODE_SUBTITLES[k.id]}</p>
                </div>
                <Icon.arrowR size={16} className="practice-studio-card-arrow" />
              </button>
            );
          })}
        </div>
      ) : showTopicPicker ? (
        <div className="practice-studio-topics">
          <p className="practice-studio-topics-desc">
            Choose a topic to practice.
          </p>
          <div className="grid-square">
            {topics.map(t => (
              <Card
                key={t.id}
                className="square-card"
                onClick={() => setSelectedTopic(t.id)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center' }}>
                  {t.title}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="practice-studio-loading">
          <p>Loading exercises…</p>
        </div>
      ) : (
        <div key={sessionKey} className="practice-studio-exercises">
          {selectedTopicTitle && (
            <p className="practice-studio-topic-label">{selectedTopicTitle}</p>
          )}
          {selectedKind === 'listening' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 14px', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
              Listening format
              <select className="input" value={selectedListeningFormat} onChange={e => setSelectedListeningFormat(e.target.value)} style={{ width: 'auto', minWidth: 230 }}>
                <option value="all">All formats</option>
                {LISTENING_FORMATS.map(format => <option key={format.id} value={format.id}>{format.label}</option>)}
              </select>
            </label>
          )}
          <FadingBanner level={scaffoldLevel} verdict={fadingVerdict?.verdict} reason={fadingVerdict?.reason} />
          <div data-tour-target="practice-session" data-tour-label="Practice session" data-tour-description="The learner reads and answers the first grammar exercise themselves.">
            <ExercisePlayer
              exercises={exercises}
              onSessionComplete={handleSessionComplete}
              scaffoldLevel={scaffoldLevel}
            />
          </div>
          {fadingVerdict && sessionScore !== null && (
            <div className={`fading-verdict fading-verdict--${fadingVerdict.verdict}`} style={{ marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
              {fadingVerdict.verdict === 'reduce' && (
                <>You've progressed to <strong>Level {fadingVerdict.newLevel}</strong> ({getLevelInfo(fadingVerdict.newLevel).label}) for this topic. {fadingVerdict.reason}.</>
              )}
              {fadingVerdict.verdict === 'restore' && (
                <>{fadingVerdict.reason}. You're now at <strong>Level {fadingVerdict.newLevel}</strong>.</>
              )}
              {fadingVerdict.verdict === 'hold' && (
                <>Holding at <strong>Level {fadingVerdict.currentLevel}</strong>. Keep practising — consistency builds confidence.</>
              )}
            </div>
          )}
          {selectedKind !== 'grammar' && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button type="button" className="student-wide-action" onClick={handleTryAnother}>
                ← Try another topic
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
