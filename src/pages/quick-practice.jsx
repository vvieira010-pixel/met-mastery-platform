import { useState, useEffect } from 'react';
import { Icon } from '../components/shared.jsx';
import ExercisePlayer from '../components/exercises/ExercisePlayer.jsx';
import listeningData from '../data/exercises/listening/b2-listening.json';
import readingData from '../data/exercises/reading/b2-reading.json';
import writingData from '../data/exercises/writing/b2-writing.json';
import speakingData from '../data/exercises/speaking/b2-speaking.json';
import grammarData from '../data/exercises/grammar/b2-grammar.json';
import { vocabTopics } from '../data/exercises/vocabulary/met-vocab-homework-bank.js';

const SKILLS = [
  { id: 'listening', label: 'Listening', icon: Icon.headset, color: 'var(--section-listening)' },
  { id: 'reading', label: 'Reading', icon: Icon.book, color: 'var(--section-reading)' },
  { id: 'writing', label: 'Writing', icon: Icon.edit, color: 'var(--section-writing)' },
  { id: 'speaking', label: 'Speaking', icon: Icon.mic, color: 'var(--section-speaking)' },
  { id: 'vocab', label: 'Vocabulary in Context', icon: Icon.star, color: 'var(--type-grammar)' },
  { id: 'grammar', label: 'Grammar Accuracy', icon: Icon.check, color: 'var(--type-main-idea)' },
];

const EXERCISE_COUNT = 5;

function extractReadingExercises() {
  const items = [];
  for (const mod of readingData.modules || []) {
    for (const item of mod.items || []) {
      if (item.questions) {
        for (const q of item.questions) {
          items.push({
            type: 'mcq',
            skill: 'reading',
            passage: item.passage,
            question: q.stem,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
          });
        }
      }
    }
  }
  return items;
}

function extractListeningExercises() {
  const items = [];
  for (const mod of listeningData.modules || []) {
    for (const item of mod.items || []) {
      if (item.questions) {
        for (const q of item.questions) {
          items.push({
            type: 'mcq',
            skill: 'listening',
            question: q.stem,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            audioUrl: item.audioUrl,
          });
        }
      }
    }
  }
  return items;
}

function extractWritingExercises() {
  const items = [];
  for (const mod of writingData.modules || []) {
    for (const ex of mod.exercises || []) {
      items.push({
        type: 'short',
        skill: 'writing',
        prompt: ex.prompt,
        rubric: ex.rubric || 'Write a clear, well-structured response.',
        targetWords: ex.targetWords || 200,
      });
    }
  }
  return items;
}

function extractSpeakingExercises() {
  const items = [];
  for (const mod of speakingData.modules || []) {
    for (const ex of mod.exercises || []) {
      items.push({
        type: 'speak',
        skill: 'speaking',
        prompt: ex.prompt,
        targetSeconds: ex.targetSeconds || 60,
        metTask: ex.metTask,
      });
    }
  }
  return items;
}

function extractGrammarExercises() {
  const items = [];
  for (const mod of grammarData.modules || []) {
    for (const item of mod.items || []) {
      items.push({
        type: 'mcq',
        skill: 'grammar',
        question: item.question || item.stem,
        options: item.options,
        correct: item.correct,
        explanation: item.explanation,
      });
    }
  }
  return items;
}

function extractVocabExercises() {
  const items = [];
  for (const mod of vocabTopics || []) {
    for (const ex of mod.exercises || []) {
      if (ex.type === 'gap') {
        items.push({
          type: 'blank',
          skill: 'vocab',
          template: ex.sentence,
          blanks: [ex.options[ex.correct]],
          explanation: ex.explanation,
        });
      } else if (ex.type === 'mcq' || ex.type === 'listen') {
        items.push({
          type: 'mcq',
          skill: 'vocab',
          question: ex.question || ex.stem,
          options: ex.options,
          correct: ex.correct,
          explanation: ex.explanation,
        });
      }
    }
  }
  return items;
}

const EXTRACTORS = {
  listening: extractListeningExercises,
  reading: extractReadingExercises,
  writing: extractWritingExercises,
  speaking: extractSpeakingExercises,
  grammar: extractGrammarExercises,
  vocab: extractVocabExercises,
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuickPractice({ onBack, "data-testid": testId }) {
  const [activeSkill, setActiveSkill] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    if (!activeSkill) return;
    const all = EXTRACTORS[activeSkill]?.() || [];
    setExercises(shuffle(all).slice(0, EXERCISE_COUNT));
    setSessionKey(k => k + 1);
  }, [activeSkill]);

  function handleBack() {
    if (activeSkill) {
      setActiveSkill(null);
      setExercises([]);
    } else {
      onBack();
    }
  }

  function handleSessionComplete() {
    setActiveSkill(null);
    setExercises([]);
  }

  const activeSkillData = SKILLS.find(s => s.id === activeSkill);

  return (
    <div className="student-page" data-testid={testId}>
      <header className="student-page-header">
        <button type="button" className="student-page-back" onClick={handleBack}>
          <Icon.arrowL size={16} />
          {activeSkill ? 'All skills' : 'Home'}
        </button>
        <h1 className="student-page-title">
          {activeSkill ? activeSkillData?.label : 'Quick Practice'}
        </h1>
        {!activeSkill && (
          <span className="student-page-subtitle">{EXERCISE_COUNT} exercises per skill</span>
        )}
      </header>

      {!activeSkill ? (
        <div className="quick-practice-grid">
          {SKILLS.map(skill => {
            const IconComp = skill.icon;
            return (
              <button
                key={skill.id}
                type="button"
                className="quick-practice-card"
                onClick={() => setActiveSkill(skill.id)}
              >
                <span className="quick-practice-card-icon" style={{ color: skill.color }}>
                  <IconComp size={28} />
                </span>
                <div className="quick-practice-card-body">
                  <h3>{skill.label}</h3>
                  <span className="quick-practice-card-count">{EXERCISE_COUNT} exercises</span>
                </div>
                <Icon.arrowR size={16} className="quick-practice-card-arrow" />
              </button>
            );
          })}
        </div>
      ) : exercises.length > 0 ? (
        <div key={sessionKey} className="quick-practice-exercises">
          <ExercisePlayer
            exercises={exercises}
            onSessionComplete={handleSessionComplete}
            scaffoldLevel={4}
          />
        </div>
      ) : (
        <div className="practice-studio-loading">
          <p>Loading exercises…</p>
        </div>
      )}
    </div>
  );
}
