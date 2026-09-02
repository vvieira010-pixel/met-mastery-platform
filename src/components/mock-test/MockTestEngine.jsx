import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { V3MockTestAdapter } from './application/V3MockTestAdapter.js';
import { MOCK_TEST_1 } from '../../data/mock-test-1/index.js';
import { MOCK_TEST_2 } from '../../data/mock-test-2/index.js';
import { READING_PART1 as MT2_READING_P1, READING_PART2 as MT2_READING_P2, READING_PART3 as MT2_READING_P3 } from '../../data/mock-test-2/reading.js';
import { LISTENING_PART1 as MT2_LISTENING_P1, LISTENING_PART2 as MT2_LISTENING_P2, LISTENING_PART3 as MT2_LISTENING_P3 } from '../../data/mock-test-2/listening.js';
import { SPEAKING_TASKS as MT2_SPEAKING_TASKS } from '../../data/mock-test-2/speaking.js';
import { WRITING_TASKS as MT2_WRITING_TASKS } from '../../data/mock-test-2/writing.js';
import SectionShell from './SectionShell.jsx';
import ReadingSection from './ReadingSection.jsx';
import ListeningSection from './ListeningSection.jsx';
import SpeakingSection from './SpeakingSection.jsx';
import WritingSection from './WritingSection.jsx';
import MockTestThanks from './MockTestThanks.jsx';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../shared.jsx';

const TEST_CONFIGS = {
  'mock-test-1': {
    data: MOCK_TEST_1,
    storagePrefix: 'met:mock1',
  },
  'mock-test-2': {
    data: MOCK_TEST_2,
    storagePrefix: 'met:mock2',
  },
};

const MOCK_TEST_2_DATA = {
  reading: { PART1: MT2_READING_P1, PART2: MT2_READING_P2, PART3: MT2_READING_P3 },
  listening: { PART1: MT2_LISTENING_P1, PART2: MT2_LISTENING_P2, PART3: MT2_LISTENING_P3 },
  speaking: { TASKS: MT2_SPEAKING_TASKS },
  writing: { TASKS: MT2_WRITING_TASKS },
};

function MockTestHome({ sections, completedSections, onStart, onBack, title }) {
  const sectionIcons = {
    book: <Icon.book size={28} />,
    headphones: <Icon.headphones size={28} />,
    mic: <Icon.mic size={28} />,
    edit: <Icon.edit size={28} />,
  };

  return (
    <motion.div 
      className="mte-home" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mte-home__header">
        <Button variant="ghost" size="sm" onClick={onBack} className="mte-home__back">
          <Icon.arrowLeft size={14} /> Back to Dashboard
        </Button>
        <h2 className="mte-home__title">{title}</h2>
        <p className="mte-home__sub">Complete all sections to finalize your mock exam. Each section is timed separately.</p>
      </div>
      <div className="mte-home__grid">
        {sections.map((s, i) => {
          const done = completedSections[s.id];
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`mte-home__card ${done ? 'mte-home__card--done' : ''}`}
              onClick={() => !done && onStart(s.id)}
              disabled={done}
              whileHover={!done ? { scale: 1.02, y: -4 } : {}}
              whileTap={!done ? { scale: 0.98 } : {}}
            >
              <div className="mte-home__card-icon" aria-hidden="true">
                {sectionIcons[s.icon] || <Icon.book size={28} />}
              </div>
              <div className="mte-home__card-name">{s.label}</div>
              <div className="mte-home__card-time">{Math.floor(s.time / 60)} min</div>
              {done && <div className="mte-home__card-check" aria-label="Completed"><Icon.check size={20} /></div>}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function MockTestEngine({ student, onBack, testId = 'mock-test-1' }) {
  const config = TEST_CONFIGS[testId] || TEST_CONFIGS['mock-test-1'];
  const { data: MOCK_TEST, storagePrefix } = config;

  const [phase, setPhase] = useState('home');
  const [activeSection, setActiveSection] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const adapter = useMemo(() => new V3MockTestAdapter(), []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const mockTest = await adapter.startMockTest(student.id, testId);
        
        if (mounted) {
          setSession({
            sections: MOCK_TEST.sections,
            completedSections: {},
            answers: {},
            mockTestId: mockTest.id,
            isAllDone: () => false,
            startSection: (id) => MOCK_TEST.sections.find(s => s.id === id),
          });
        }
      } catch (e) {
        console.error('Failed to initialize mock test engine', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, [student.id, adapter, testId]);

  const startSection = useCallback((sectionId) => {
    const section = session.startSection(sectionId);
    setActiveSection(section);
    setPhase('section');
  }, [session]);

  const handleSectionComplete = useCallback(async (sectionId, sectionAnswers) => {
    try {
      const lastSection = MOCK_TEST.sections[MOCK_TEST.sections.length - 1];
      
      if (sectionId === lastSection.id) {
        const allAnswers = { ...session.answers, ...sectionAnswers };
        const result = await adapter.submitMockTest(session.mockTestId, allAnswers);
        
        setSession(prev => ({
          ...prev,
          answers: allAnswers,
          completedSections: { ...prev.completedSections, [sectionId]: true },
          isAllDone: () => true
        }));
        setPhase('thanks');
      } else {
        setSession(prev => ({
          ...prev,
          completedSections: { ...prev.completedSections, [sectionId]: true },
          answers: { ...prev.answers, ...sectionAnswers }
        }));
        setPhase('home');
        setActiveSection(null);
      }
    } catch (e) {
      console.error('Failed to complete section', e);
    }
  }, [session, adapter, MOCK_TEST]);

  if (loading) {
    return (
      <div className="mte-loading" role="status" aria-label="Loading test">
        <div className="skeleton-card" />
        <div className="skeleton-text-short" />
        <div className="skeleton-text-short" style={{ width: '40%' }} />
        <p className="mte-loading__text" aria-live="polite">Loading your mock test...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mte-error" role="alert">
        <div className="mte-error__icon" aria-hidden="true"><Icon.warning size={32} /></div>
        <h3 className="mte-error__title">Unable to Load Test</h3>
        <p className="mte-error__message">We couldn't load your mock test session. This might be a temporary connection issue.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    );
  }

  const renderSection = (section) => {
    const isMock2 = testId === 'mock-test-2';
    const wrap = (answers) => handleSectionComplete(section.id, answers);
    switch (section.id) {
      case 'reading': return <ReadingSection onComplete={wrap} readingData={isMock2 ? MOCK_TEST_2_DATA.reading : undefined} />;
      case 'listening': return <ListeningSection onComplete={wrap} listeningData={isMock2 ? MOCK_TEST_2_DATA.listening : undefined} />;
      case 'speaking': return <SpeakingSection student={student} onComplete={wrap} speakingData={isMock2 ? MOCK_TEST_2_DATA.speaking : undefined} />;
      case 'writing': return <WritingSection onComplete={wrap} writingData={isMock2 ? MOCK_TEST_2_DATA.writing : undefined} />;
      default: return null;
    }
  };

  return (
    <div className="mte">
      <AnimatePresence mode="wait">
        {phase === 'home' && !session.isAllDone() && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MockTestHome
              sections={MOCK_TEST.sections}
              completedSections={session.completedSections}
              onStart={startSection}
              onBack={onBack}
              title={MOCK_TEST.title}
            />
          </motion.div>
        )}
        {phase === 'home' && session.isAllDone() && (
          <motion.div key="thanks-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MockTestThanks answers={session.answers} student={student} onBack={onBack} testId={testId} />
          </motion.div>
        )}
        {phase === 'section' && activeSection && (
          <motion.div key="section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SectionShell
              section={activeSection}
              timerRunning={phase === 'section'}
              onComplete={handleSectionComplete}
              onBack={() => setPhase('home')}
              student={student}
            >
              {renderSection(activeSection)}
            </SectionShell>
          </motion.div>
        )}
        {phase === 'thanks' && (
          <motion.div key="thanks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MockTestThanks answers={session.answers} student={student} onBack={onBack} testId={testId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}