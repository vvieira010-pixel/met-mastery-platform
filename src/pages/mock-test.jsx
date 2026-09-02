import { useState, useEffect } from 'react';
import { Icon, SectionHeader } from '../components/shared.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import MockTestEngine from '../components/mock-test/MockTestEngine.jsx';
import { getMockTestResults } from '../lib/workflow.js';
import { dbList } from '../lib/supabase-db.js';
import { getCefrColor } from '../components/mock-test/constants.js';

const UNLOCK_KEY_1 = 'vv:mock_test_1_unlocked';
const UNLOCK_KEY_2 = 'vv:mock_test_2_unlocked';

function launchStandaloneMockTest2() {
  try { localStorage.setItem('met:spa:origin', window.location.origin); } catch (_) {}
  window.open('/mock-test-2/sections/mock-home.html', '_blank');
}

function readUnlocked(key) {
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
}
function writeUnlocked(key, v) {
  try { if (v) localStorage.setItem(key, '1'); else localStorage.removeItem(key); } catch {}
}

const TESTS = [
  {
    id: 'mock-test-1',
    title: 'MET Mock Test 1',
    subtitle: 'Full-length practice exam · ~2 h 35 min',
    sections: [
      { label: 'Reading & Grammar', time: '65 min' },
      { label: 'Listening', time: '35 min' },
      { label: 'Speaking', time: '10 min' },
      { label: 'Writing', time: '45 min' },
    ],
    description: 'Complete MET practice exam covering all four competencies.',
    unlockKey: UNLOCK_KEY_1,
  },
  {
    id: 'mock-test-2',
    title: 'MET Mock Test 2',
    subtitle: 'Full-length practice exam · ~2 h 35 min',
    sections: [
      { label: 'Reading & Grammar', time: '65 min' },
      { label: 'Listening', time: '35 min' },
      { label: 'Speaking', time: '10 min' },
      { label: 'Writing', time: '45 min' },
    ],
    description: 'Second full-length MET practice exam with updated content and new question sets.',
    unlockKey: UNLOCK_KEY_2,
  },
];

export default function MockTestPage({ student, students, onNavigate, auth, "data-testid": testId }) {
  const [selectedStudent, setSelectedStudent] = useState(student || null);
  const [activeTest, setActiveTest] = useState(null);
  const [pastResults, setPastResults] = useState([]);
  const [unlocked1, setUnlocked1] = useState(readUnlocked(UNLOCK_KEY_1));
  const [unlocked2, setUnlocked2] = useState(() => readUnlocked(UNLOCK_KEY_2) || auth?.role === 'teacher');

  const isTeacher = !!auth && auth.role === 'teacher';
  const showEngine = activeTest && (activeTest.id === 'mock-test-1' ? unlocked1 : unlocked2);

  useEffect(() => {
    const sid = selectedStudent?.id || selectedStudent?.local_id;
    if (sid) {
      getMockTestResults(sid).then(setPastResults).catch(e => console.warn('[mock-test] failed to load results:', e));
    }
  }, [selectedStudent]);

  useEffect(() => {
    const sid = selectedStudent?.id || selectedStudent?.local_id;
    if (!sid || isTeacher) return;

    dbList('assignments').then(all => {
      const mine = (all || []).filter(a => a.student_id === sid);
      if (mine.some(a => a.mock_test_id === 'mock-test-1')) setUnlocked1(true);
      if (mine.some(a => a.mock_test_id === 'mock-test-2')) setUnlocked2(true);
    }).catch(e => console.warn('[mock-test] failed to check assignments:', e));
  }, [selectedStudent, isTeacher]);

  if (!selectedStudent && Array.isArray(students) && students.length > 0) {
    return (
      <div className="page-shell" data-testid={testId}>
        <SectionHeader title="Mock Tests" sub="Select a student to take or review a mock test" />
        <div className="stack-list" style={{ marginTop: 'var(--space-4)' }}>
          {students.map(s => (
            <Card key={s.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedStudent(s)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {(s.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{s.currentLevel} → {s.targetLevel}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (showEngine) {
    return <MockTestEngine student={selectedStudent} onBack={() => setActiveTest(null)} testId={activeTest.id} />;
  }

  return (
    <div className="page-shell">
      <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
        <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}><Icon.chevronLeft size={14} /> Back to students</Button>
        {onNavigate && <Button variant="ghost" size="sm" onClick={() => onNavigate('mock-test-results')}>All results</Button>}
      </div>
      <div className="hero-section" style={{ marginBottom: 'var(--space-5)' }}>
        <SectionHeader
          title="Mock Tests"
          subtitle={`Full-length MET practice exams · ${selectedStudent?.name || ''}`}
        />
      </div>

      <div className="split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {TESTS.map(test => {
          const unlocked = test.id === 'mock-test-1' ? unlocked1 : unlocked2;
          const setUnlocked = test.id === 'mock-test-1' ? setUnlocked1 : setUnlocked2;
          return (
            <Card key={test.id} className="card-p-5 mock-test-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Icon.practice size={24} />
                <div>
                  <div className="row-title">{test.title}</div>
                  <div className="row-sub">{test.subtitle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                {test.sections.map((s, i) => (
                  <span key={i} className="pill pill--accent">{s.label} ({s.time})</span>
                ))}
              </div>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                {test.description}
              </p>

              {unlocked ? (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button variant="primary" onClick={() => setActiveTest(test)}>
                    <Icon.practice size={14} /> Start {test.title}
                  </Button>
                  {test.id === 'mock-test-2' && (
                    <Button variant="ghost" size="sm" onClick={launchStandaloneMockTest2} title="Opens in a new window">
                      <Icon.arrowL size={14} /> Open standalone
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mock-locked">
                  <div className="mock-locked__head">
                    <span className="mock-locked__icon" aria-hidden="true"><Icon.lock size={18} color="var(--warning)" /></span>
                    <div className="mock-locked__title">Locked</div>
                  </div>
                  <p className="text-sm text-muted mock-locked__body">
                    {test.title} is locked by default. {isTeacher
                      ? 'You can unlock it for your students from this page.'
                      : 'Ask your teacher to unlock it before you start.'}
                  </p>
                  <div className="mock-locked__actions">
                    {isTeacher ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => { writeUnlocked(test.unlockKey, true); setUnlocked(true); window.toast?.(`${test.title} unlocked.`, 'ok'); }}
                      >
                        <Icon.lock size={14} /> Unlock {test.title}
                      </Button>
                    ) : (
                      <span className="pill pill--warning">Locked — teacher access required</span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {pastResults.length > 0 && (
        <div className="mtr-student" style={{ maxWidth: 720, margin: '24px auto 0', padding: '0 20px' }}>
          <h3 className="mtr-student__title">Past Results</h3>
          <div className="mtr-student__list">
            {pastResults.map(r => {
              const score = r.scores?.reading?.total + r.scores?.listening?.total || 0;
              const max = r.scores?.reading?.max + r.scores?.listening?.max || 0;
              const pct = max > 0 ? Math.round((score / max) * 100) : 0;
              return (
                <div key={r.id} className="mtr-student__row">
                  <span className="mtr-student__date">{new Date(r.submittedAt).toLocaleDateString()}</span>
                  <span className="mtr-student__score">{score}/{max} ({pct}%)</span>
                  {r.cefr && <span className="mtr-student__cefr" style={{ background: getCefrColor(r.cefr) }}>{r.cefr}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .mtr-student__title { font-size: 16px; font-weight: 700; color: var(--text); margin: 0 0 12px; }
        .mtr-student__list { display: flex; flex-direction: column; gap: 6px; }
        .mtr-student__row { display: flex; align-items: center; gap: 16px; padding: 10px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 14px; }
        .mtr-student__date { color: var(--text-muted); min-width: 90px; }
        .mtr-student__score { font-weight: 600; color: var(--text); flex: 1; }
        .mtr-student__cefr { padding: 2px 10px; border-radius: 999px; color: #fff; font-weight: 700; font-size: 11px; }
      `}</style>
    </div>
  );
}