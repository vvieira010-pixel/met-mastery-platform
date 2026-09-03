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
  getReadingExercises,
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
  reading: 'Reading Lab',
};

const MODE_SUBTITLES = {
  grammar: '10 grammar questions · B2 level',
  vocab: 'Vocabulary matching & fill-in-the-blank',
  speaking: 'Speaking & writing practice prompts',
  writing: 'Paragraph & short-answer writing tasks',
  listening: 'Interactive listening — 26 new MET 26 conversations + B2 76–100',
  reading: 'Reading comprehension · B2 passages',
};

const MODE_ICONS = {
  grammar: Icon.edit,
  vocab: Icon.star,
  speaking: Icon.mic,
  writing: Icon.edit,
  listening: Icon.headset,
  reading: Icon.book,
};

const KIND_OPTIONS = [
  { id: 'grammar', label: 'Grammar' },
  { id: 'vocab', label: 'Vocabulary' },
  { id: 'reading', label: 'Reading' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'writing', label: 'Writing' },
  { id: 'listening', label: 'Listening' },
];

export default function PracticeStudio({ studentId, onBack, "data-testid": testId }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedKind, setSelectedKind] = useState(null);
  const [selectedListeningFormat, setSelectedListeningFormat] = useState('all');
  const [listeningSearch, setListeningSearch] = useState('');
  const [sessionKey, setSessionKey] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

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
    const level = getScaffoldLevel(selectedKind, selectedTopic, studentId);
    setScaffoldLevelState(level);
  }, [selectedKind, selectedTopic, studentId]);

  useEffect(() => {
    if (!selectedKind) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setFadingVerdict(null);
    setSessionScore(null);
    async function load() {
      let ex = [];
      try {
        if (selectedKind === 'grammar' && selectedTopic) {
          ex = await getGrammarExercises(selectedTopic);
        } else if (selectedKind === 'reading' && selectedTopic) {
          ex = await getReadingExercises(selectedTopic);
        } else if (selectedKind === 'vocab' && selectedTopic) {
          ex = await getVocabExercises(selectedTopic);
        } else if (selectedKind === 'speaking' && selectedTopic) {
          ex = await getSpeakingExercises(selectedTopic);
        } else if (selectedKind === 'writing' && selectedTopic) {
          ex = await getWritingExercises(selectedTopic);
        } else if (selectedKind === 'listening') {
          ex = await getListeningExercises(selectedTopic);
          if (selectedListeningFormat !== 'all') ex = ex.filter(item => (item.listeningFormat || 'multiple_choice') === selectedListeningFormat);
        }
      } catch (e) {
        console.warn('[PracticeStudio] Failed to load exercises:', e);
        if (!cancelled) setLoadError(true);
      }
      if (!cancelled) {
        setExercises(ex);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedKind, selectedTopic, selectedListeningFormat, sessionKey]);

  const showTopicPicker = selectedKind && !selectedTopic;
  const selectedTopicTitle = topics.find(t => t.id === selectedTopic)?.title || '';
  const showLanding = !selectedKind;

  function handleSelectMode(kind) {
    setSelectedKind(kind);
    setSelectedTopic(null);
    setSelectedListeningFormat('all');
    setListeningSearch('');
    setSessionKey(k => k + 1);
    setFadingVerdict(null);
    setSessionScore(null);
  }

  function handleBackToLanding() {
    setSelectedKind(null);
    setSelectedTopic(null);
    setSelectedListeningFormat('all');
    setListeningSearch('');
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
    const quality = score !== null ? classifyRetrieval(maxHintLevel || 0, hintUsed || false, score) : null;
    const correctCount = results?.filter(r => r?.correct === true).length || 0;
    const errorCategories = results?.filter(r => r?.errorCategory).map(r => r.errorCategory) || null;

    if (score !== null && studentId) {
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
      }, studentId);

    }

    if (studentId) savePracticeSession(studentId, {
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
        status: score === null ? 'submitted_for_review' : 'completed',
      });

    if (score !== null && studentId) {
      const result = evaluateFading(selectedKind, selectedTopic, studentId);
      setFadingVerdict(result);

      if (result.verdict === 'reduce' || result.verdict === 'restore') {
        setScaffoldLevel(selectedKind, selectedTopic, result.newLevel, studentId);
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
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{MODE_LABELS[k.id]} {k.id === 'listening' && <span className="pill pill-success" style={{ fontSize: 'var(--text-2xs)', padding: '2px 6px' }}>26 new</span>}</h3>
                  <p>{MODE_SUBTITLES[k.id]}</p>
                </div>
                <Icon.arrowR size={16} className="practice-studio-card-arrow" />
              </button>
            );
          })}
        </div>
      ) : showTopicPicker ? (
        selectedKind === 'listening' ? (
          (() => {
            const q = listeningSearch.trim().toLowerCase();
            const filtered = q ? topics.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) : topics;
            const met26 = filtered.filter(t => t.id.includes('met26'));
            const supplementary = filtered.filter(t => !t.id.includes('met26') && /listening-(7\d|8\d|9\d|100)/.test(t.id));
            const core = filtered.filter(t => !met26.includes(t) && !supplementary.includes(t));
            const Section = ({ title, count, items, badge }) => items.length === 0 ? null : (
              <div style={{ marginBottom: 16, padding: 14, background: 'var(--surface)', border: '1px solid var(--ink-faint)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--ink-faint)' }}>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink)' }}>{title}</h4>
                  <span className="pill pill-default" style={{ fontSize: 'var(--text-2xs)', padding: '2px 8px' }}>{count}</span>
                  {badge && <span className="pill pill-success" style={{ fontSize: 'var(--text-2xs)', padding: '2px 8px' }}>{badge}</span>}
                </div>
                <div className="grid-square">
                  {items.map(t => (
                    <Card key={t.id} className="square-card" onClick={() => setSelectedTopic(t.id)} style={{ cursor: 'pointer' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center' }}>{t.title}</div>
                    </Card>
                  ))}
                </div>
              </div>
            );
            return (
              <div className="practice-studio-topics">
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="search-input-wrap" style={{ flex: '1 1 260px', maxWidth: 420 }}>
                    <span aria-hidden="true" style={{ opacity: 0.6 }}>🔍</span>
                    <input className="search-input" placeholder="Search conversations…" value={listeningSearch} onChange={e => setListeningSearch(e.target.value)} aria-label="Search listening topics" />
                    {listeningSearch && <button type="button" className="search-clear" onClick={() => setListeningSearch('')} aria-label="Clear search">✕</button>}
                  </div>
                  <span className="text-xs text-[var(--muted)]">{filtered.length} of {topics.length}</span>
                </div>
                <Section title="MET 26 Conversations" count={`${met26.length} · two-speaker`} items={met26} badge="New" />
                <Section title="B2 Supplementary 76–100" count={`${supplementary.length} · exam-style`} items={supplementary} />
                <Section title="Core Listening" count={`${core.length}`} items={core} />
                {filtered.length === 0 && <p className="text-sm text-[var(--muted)]" style={{ textAlign: 'center', padding: 24 }}>No matches for “{listeningSearch}”.</p>}
              </div>
            );
          })()
        ) : (
          (() => {
            const q = listeningSearch.trim().toLowerCase();
            const filteredAll = q ? topics.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) : topics;
            let groups;
            if (selectedKind === 'reading') {
              groups = [{ title: 'Reading Passages', ids: ['study_abroad','online_learning'] }];
            } else if (selectedKind === 'grammar') {
              groups = [
                { title: 'Core Grammar', ids: ['gm_common_mistakes','gm_conditionals','gm_passive','gm_modals','gm_inversion','gm_relatives','gm_articles'] },
                { title: 'Structure & Usage', ids: ['gm_pronouns','gm_comparatives','gm_phrasal','gm_agreement','gm_reported','gm_gerunds','gm_quantifiers','gm_connectors','gm_demonstratives','gm_adverbs','gm_infinitives','gm_somewhere'] },
                { title: 'Practice Sets', ids: ['gm_order_fix','gm_grammar_50_more'] },
              ];
            } else {
              groups = [
                { title: 'Work & Study', ids: ['work_career','healthcare','education','technology'] },
                { title: 'Life & Community', ids: ['environment','community','travel_culture','money_consumer','family_relationships','media_news'] },
                { title: 'General', ids: ['general'] },
              ];
            }
            const Group = ({ title, ids }) => {
              const items = filteredAll.filter(t => ids.includes(t.id));
              if (items.length === 0) return null;
              return (
                <div style={{ marginBottom: 16, padding: 14, background: 'var(--surface)', border: '1px solid var(--ink-faint)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--ink-faint)' }}>
                    <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink)' }}>{title}</h4>
                    <span className="pill pill-default" style={{ fontSize: 'var(--text-2xs)', padding: '2px 8px' }}>{items.length}</span>
                  </div>
                  <div className="grid-square">
                    {items.map(t => (
                      <Card key={t.id} className="square-card" onClick={() => setSelectedTopic(t.id)} style={{ cursor: 'pointer' }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center' }}>{t.title}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            };
            const unmatched = filteredAll.filter(t => !groups.flatMap(g => g.ids).includes(t.id));
            return (
              <div className="practice-studio-topics">
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="search-input-wrap" style={{ flex: '1 1 260px', maxWidth: 420 }}>
                    <span aria-hidden="true" style={{ opacity: 0.6 }}>🔍</span>
                    <input className="search-input" placeholder="Search topics…" value={listeningSearch} onChange={e => setListeningSearch(e.target.value)} aria-label="Search topics" />
                    {listeningSearch && <button type="button" className="search-clear" onClick={() => setListeningSearch('')} aria-label="Clear search">✕</button>}
                  </div>
                  <span className="text-xs text-[var(--muted)]">{filteredAll.length} of {topics.length}</span>
                </div>
                {groups.map(g => <Group key={g.title} title={g.title} ids={g.ids} />)}
                {unmatched.length > 0 && (
                  <div style={{ marginBottom: 16, padding: 14, background: 'var(--surface)', border: '1px solid var(--ink-faint)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--ink-faint)' }}>
                      <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink)' }}>Other</h4>
                      <span className="pill pill-default" style={{ fontSize: 'var(--text-2xs)', padding: '2px 8px' }}>{unmatched.length}</span>
                    </div>
                    <div className="grid-square">
                      {unmatched.map(t => (
                        <Card key={t.id} className="square-card" onClick={() => setSelectedTopic(t.id)} style={{ cursor: 'pointer' }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center' }}>{t.title}</div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {filteredAll.length === 0 && <p className="text-sm text-[var(--muted)]" style={{ textAlign: 'center', padding: 24 }}>No matches for “{listeningSearch}”.</p>}
              </div>
            );
          })()
        )
      ) : loading ? (
        <div className="practice-studio-loading">
          <p>Loading exercises…</p>
        </div>
      ) : loadError ? (
        <div title="Exercises unavailable" style={{ textAlign: 'center', padding: '24px' }}>
          <p>We couldn't load this practice set. Please try again.</p>
          <button type="button" onClick={() => setSessionKey(k => k + 1)}>Try again</button>
        </div>
      ) : exercises.length === 0 ? (
        <div title="No exercises available" style={{ textAlign: 'center', padding: '24px' }}>
          <p>There aren't any exercises for this selection yet. Choose another topic or return to all skills.</p>
          <button type="button" onClick={() => setSessionKey(k => k + 1)}>Try again</button>
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
              key={`${selectedKind}-${selectedTopic}-${selectedListeningFormat}-${sessionKey}`}
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
