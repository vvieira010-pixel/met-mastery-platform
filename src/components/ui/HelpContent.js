export const HELP_CONTENT = {
  'diagnose': {
    title: 'Run a Diagnosis',
    summary: 'Turn class evidence into teacher notes, student feedback, and targeted homework.',
    steps: [
      { label: 'Select student', detail: 'Choose from roster or add new' },
      { label: 'Confirm skills', detail: 'Pick which MET skills were covered in class' },
      { label: 'Run AI', detail: 'Generates skill diagnosis, feedback, homework plan, error bank' },
      { label: 'Review & approve', detail: 'Edit any section, then save to student record' },
    ],
    tips: [
      'Use "Quick Practice" for a focused 5-min skill check',
      'Evidence from today\'s class auto-fills if you scheduled it',
      'Ctrl+D opens Diagnose directly from anywhere',
    ],
    shortcuts: ['D', 'Ctrl+K → "Diagnose"'],
    related: ['homework', 'submissions', 'error-bank'],
  },
  'homework': {
    title: 'Create Homework',
    summary: 'Assign targeted exercises based on diagnosis results.',
    steps: [
      { label: 'Pick diagnosis', detail: 'Links homework to specific skill gaps' },
      { label: 'Choose exercises', detail: 'AI suggests 3-5 exercises; add/remove/reorder' },
      { label: 'Set due date', detail: 'Students see it on their dashboard immediately' },
      { label: 'Assign', detail: 'Student gets notification; you track completion' },
    ],
    tips: [
      'Homework auto-links to the diagnosis that created it',
      'Students can work offline; syncs when they reconnect',
      'Ctrl+H opens Homework from anywhere',
    ],
    shortcuts: ['H', 'Ctrl+K → "Homework"'],
    related: ['diagnose', 'submissions', 'exercises'],
  },
  'submissions': {
    title: 'Review Submissions',
    summary: 'Grade student work, give feedback, and close the loop.',
    steps: [
      { label: 'Open submission', detail: 'See student answers, audio, writing' },
      { label: 'Score & comment', detail: 'Rubric auto-applies for MCQ; free-text for writing/speaking' },
      { label: 'Approve or revise', detail: 'Approved = student sees feedback; Revise = student re-does' },
      { label: 'Track progress', detail: 'Mastery updates auto-calculate per skill' },
    ],
    tips: [
      'R badge = needs review (click to jump straight there)',
      'Bulk actions: select multiple → "Approve all" / "Request revision"',
      'Ctrl+R opens Submissions from anywhere',
    ],
    shortcuts: ['R', 'Ctrl+K → "Review Submissions"'],
    related: ['homework', 'diagnose', 'reports'],
  },
  'mock-test': {
    title: 'Mock Test',
    summary: 'Full MET simulation: Listening, Reading, Writing, Speaking — timed and scored.',
    steps: [
      { label: 'Assign to student', detail: 'Pick test, set due date, student sees it on dashboard' },
      { label: 'Student takes test', detail: 'Timed sections, auto-save, speaking records audio' },
      { label: 'Auto-score + review', detail: 'Listening/Reading auto-scored; Writing/Speaking you evaluate' },
      { label: 'Results & CEFR', detail: 'Section scores, overall CEFR estimate, skill breakdown' },
    ],
    tips: [
      'Two full tests available; more in Library',
      'Speaking uses browser mic — works offline',
      'Ctrl+K → "Mock Test" to jump',
    ],
    shortcuts: ['Ctrl+K → "Mock Test"'],
    related: ['mock-test-results', 'mock-test-eval', 'speaking-eval'],
  },
  'error-bank': {
    title: 'Error Bank',
    summary: 'Track recurring mistakes across diagnoses; turn them into targeted practice.',
    steps: [
      { label: 'View patterns', detail: 'Errors grouped by type (grammar, vocab, pronunciation)' },
      { label: 'Generate practice', detail: 'AI creates fix-it exercises from real student errors' },
      { label: 'Track resolution', detail: 'Mark resolved when student stops making the error' },
    ],
    tips: [
      'Errors auto-extract from approved diagnoses',
      'Connects to Spaced Repetition for long-term retention',
    ],
    shortcuts: ['Ctrl+K → "Error Bank"'],
    related: ['diagnose', 'homework', 'reports'],
  },
  'diagnostics': {
    title: 'Diagnostics Overview',
    summary: 'View all completed diagnoses across your roster.',
    steps: [
      { label: 'Filter & search', detail: 'By student, date, status, skill focus' },
      { label: 'Re-open to edit', detail: 'Teacher notes, feedback, homework plan editable' },
      { label: 'Export', detail: 'PDF for records or parent meetings' },
    ],
    tips: [
      'Click any row to re-open that diagnosis',
      'Filter by "Needs Feedback" to find pending work',
    ],
    shortcuts: ['Ctrl+K → "Diagnostics"'],
    related: ['diagnose', 'reports', 'students'],
  },
  'students': {
    title: 'Student Roster',
    summary: 'Manage your students: add, view progress, schedule classes.',
    steps: [
      { label: 'Add student', detail: 'Email + name; they claim via magic link' },
      { label: 'View profile', detail: 'Mastery heatmap, diagnosis history, payments' },
      { label: 'Schedule class', detail: 'Calendar sync; evidence captured during class' },
    ],
    tips: [
      'Students claim their roster spot by email — no passwords',
      'Ctrl+S opens Students from anywhere',
    ],
    shortcuts: ['S', 'Ctrl+K → "Students"'],
    related: ['diagnose', 'calendar', 'reports'],
  },
  'calendar': {
    title: 'Class Calendar',
    summary: 'Schedule classes, capture evidence during class, link to diagnoses.',
    steps: [
      { label: 'Create event', detail: 'Student, date, time, MET skill focus' },
      { label: 'During class', detail: 'Capture evidence (notes, audio, photos) in real-time' },
      { label: 'Post-class', detail: 'Evidence auto-links to next diagnosis' },
    ],
    tips: [
      'Evidence captured here flows directly into AI diagnosis',
      'Ctrl+K → "Calendar"',
    ],
    shortcuts: ['Ctrl+K → "Calendar"'],
    related: ['diagnose', 'students', 'class-record'],
  },
  'reports': {
    title: 'Reports',
    summary: 'Mastery heatmaps, progress timelines, and exportable summaries.',
    steps: [
      { label: 'Per-student', detail: 'Skill heatmap, diagnosis timeline, CEFR trajectory' },
      { label: 'Class-level', detail: 'Cohort trends, at-risk students, skill coverage' },
      { label: 'Export', detail: 'PDF for admin, parents, or accreditation' },
    ],
    tips: [
      'Risk dashboard (⚠) flags students falling behind',
      'Ctrl+K → "Reports"',
    ],
    shortcuts: ['Ctrl+K → "Reports"'],
    related: ['risk-dashboard', 'students', 'diagnostics'],
  },
};