import { useState } from 'react';
import MockTestEngine from './MockTestEngine.jsx';
import MockTestTeacherDashboard from './MockTestTeacherDashboard.jsx';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../shared.jsx';

export default function MockTestDemo() {
  const [view, setView] = useState('selector');
  const student = { id: 'student_123', name: 'John Doe' };

  return (
    <div className="mtd">
      <header className="mtd__header">
        <h1 className="mtd__title">Mock Test DDD Refactor Demo</h1>
        <p className="mtd__subtitle">Choose a view to explore the student or teacher experience</p>
      </header>

      {view === 'selector' && (
        <div className="mtd__selector">
          <Button variant="primary" size="lg" onClick={() => setView('student')} className="mtd__btn">
            <Icon.user size={20} /> Student View (Take Test)
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setView('teacher')} className="mtd__btn">
            <Icon.users size={20} /> Teacher View (Results Dashboard)
          </Button>
        </div>
      )}

      {view === 'student' && (
        <div className="mtd__view">
          <Button variant="ghost" onClick={() => setView('selector')} className="mtd__back">
            <Icon.arrowLeft size={14} /> Back
          </Button>
          <div className="card mtd__card">
            <h2 className="mtd__greeting">Hello, {student.name}</h2>
            <p className="mtd__prompt">Ready to start your mock exam?</p>
            <MockTestEngine student={student} onBack={() => setView('selector')} />
          </div>
        </div>
      )}

      {view === 'teacher' && (
        <div className="mtd__view">
          <MockTestTeacherDashboard onBack={() => setView('selector')} />
        </div>
      )}

      <style>{`
        .mtd { max-width: 1200px; margin: 0 auto; padding: var(--space-8) var(--space-6); }
        .mtd__header { text-align: center; margin-bottom: var(--space-8); }
        .mtd__title { font-size: var(--text-4xl); font-weight: 800; color: var(--primary); margin: 0 0 var(--space-2); }
        .mtd__subtitle { color: var(--text-muted); font-size: var(--text-lg); margin: 0; }
        .mtd__selector { display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap; margin-bottom: var(--space-8); }
        .mtd__btn { min-width: 280px; }
        .mtd__view { animation: mtd-fade-in 0.3s ease; }
        .mtd__back { margin-bottom: var(--space-4); }
        .mtd__card { min-height: 600px; }
        .mtd__greeting { font-size: var(--text-2xl); font-weight: 700; color: var(--text); margin: 0 0 var(--space-1); }
        .mtd__prompt { color: var(--text-muted); margin: 0 0 var(--space-6); }
        @keyframes mtd-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) { .mtd__btn { min-width: 100%; } }
      `}</style>
    </div>
  );
}