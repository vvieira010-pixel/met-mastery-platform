import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import './styles/system.css';
import PracticeStudio from './pages/practice-studio.jsx';
import StudentSubjects from './pages/student-subjects.jsx';

function Harness() {
  const [page, setPage] = useState(window.location.hash.replace('#', '') || 'subjects');
  const go = (p) => { window.location.hash = p; setPage(p); };
  return (
    <>
      <div style={{ paddingBottom: 60 }}>
        {page === 'subjects' && <StudentSubjects />}
        {page === 'practice' && <PracticeStudio studentId="st_1" onBack={() => go('subjects')} />}
      </div>
      <div className="__harness-bar">
        <button type="button" aria-pressed={page === 'subjects'} onClick={() => go('subjects')}>Subjects</button>
        <button type="button" aria-pressed={page === 'practice'} onClick={() => go('practice')}>Practice Studio</button>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Harness /></StrictMode>,
);
