import { useState, useEffect } from 'react';
import { Icon, SectionHeader, Pill, Avatar, Modal } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { getHomework, getSubmissions, deleteHomework } from '../lib/workflow.js';

const STATUS_TONE = { 'not-started': 'muted', 'in-progress': 'info', submitted: 'warning', corrected: 'success', reviewed: 'success', completed: 'success' };
const KIND_ORDER = ['grammar', 'vocabulary', 'reading', 'listening', 'speaking', ''];
const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', ''];

function normalizeKind(value) {
  const v = String(value || '').toLowerCase();
  if (!v) return '';
  if (v.includes('gram')) return 'grammar';
  if (v.includes('vocab')) return 'vocabulary';
  if (v.includes('read')) return 'reading';
  if (v.includes('listen')) return 'listening';
  if (v.includes('speak')) return 'speaking';
  return v;
}

function normalizeLevel(value) {
  const v = String(value || '').toUpperCase();
  return LEVEL_ORDER.includes(v) ? v : '';
}

function rankValue(value, order) {
  const idx = order.indexOf(value);
  return idx >= 0 ? idx : order.length;
}

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return null;
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusLabel(status) {
  return status === 'not-started' ? 'Not started'
    : status === 'in-progress' ? 'In progress'
      : status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not started';
}

function activityLabel(activity, index) {
  if (typeof activity === 'string') return activity;
  return activity?.title || activity?.instruction || activity?.prompt || activity?.question || `Exercise ${index + 1}`;
}

export default function HomeworkPage({ students, onNavigate, "data-testid": testId }) {
  const [homework, setHomework] = useState([]);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterKind, setFilterKind] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([getHomework(), getSubmissions()]).then(([assignments, savedSubmissions]) => {
      if (!active) return;
      setHomework(assignments || []);
      setSubmissions(savedSubmissions || []);
    }).catch(error => {
      if (active) window.toast?.(`Could not load homework: ${error.message}`, 'error');
    });
    return () => { active = false; };
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this homework assignment?')) return;
    try {
      await deleteHomework(id);
      setHomework(prev => prev.filter(h => h.id !== id));
      setSubmissions(prev => prev.filter(s => s.homeworkId !== id));
      setSelectedHomework(current => current?.id === id ? null : current);
      window.toast?.('Homework deleted.', 'ok');
    } catch (e) {
      window.toast?.(`Delete failed: ${e.message}`, 'error');
    }
  }

  const sorted = [...homework].sort((a, b) => {
    const kindDiff = rankValue(normalizeKind(a.kind || a.skillType || a.type), KIND_ORDER)
      - rankValue(normalizeKind(b.kind || b.skillType || b.type), KIND_ORDER);
    if (kindDiff) return kindDiff;
    const levelDiff = rankValue(normalizeLevel(a.level || a.currentLevel), LEVEL_ORDER)
      - rankValue(normalizeLevel(b.level || b.currentLevel), LEVEL_ORDER);
    if (levelDiff) return levelDiff;
    return new Date(b.assignedAt || b.createdAt || 0) - new Date(a.assignedAt || a.createdAt || 0);
  });

  const filtered = sorted.filter(h => {
    if (filterStudent && h.studentId !== filterStudent) return false;
    if (filterKind && normalizeKind(h.kind || h.skillType || h.type) !== filterKind) return false;
    if (filterLevel && normalizeLevel(h.level || h.currentLevel) !== filterLevel) return false;
    if (filterStatus && h.status !== filterStatus) return false;
    return true;
  });

  const selectedStudent = selectedHomework ? students.find(s => s.id === selectedHomework.studentId) : null;
  const selectedSubmission = selectedHomework ? submissions.find(s => s.homeworkId === selectedHomework.id) : null;
  const selectedActivities = Array.isArray(selectedHomework?.activities) ? selectedHomework.activities
    : Array.isArray(selectedHomework?.tasks) ? selectedHomework.tasks
      : Array.isArray(selectedHomework?.exercises) ? selectedHomework.exercises : [];
  const selectedAttachments = Array.isArray(selectedHomework?.attachments) ? selectedHomework.attachments : [];

  return (
    <div className="page-shell" data-testid={testId}>
      <SectionHeader
        title="Homework"
        sub={`${homework.length} total · ${homework.filter(h => h.status === 'submitted').length} submitted`}
        action={<Button variant="primary" onClick={() => onNavigate('homework:create', {})}><Icon.plus size={14} /> Create Homework</Button>}
      />

      <div className="page-filters">
        <select className="input page-filter-select" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
          <option value="">All students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="input page-filter-select" value={filterKind} onChange={e => setFilterKind(e.target.value)}>
          <option value="">All kinds</option>
          {KIND_ORDER.filter(k => k).map(kind => <option key={kind} value={kind}>{kind.charAt(0).toUpperCase() + kind.slice(1)}</option>)}
        </select>
        <select className="input page-filter-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="">All levels</option>
          {LEVEL_ORDER.filter(Boolean).map(level => <option key={level} value={level}>{level}</option>)}
        </select>
        <select className="input page-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {[['not-started','Not started'],['in-progress','In progress'],['submitted','Submitted'],['reviewed','Reviewed']].map(([val,label]) => <option key={val} value={val}>{label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="page-empty-state">
          <p style={{ color: 'var(--muted)' }}>No homework assigned yet. Start from a student's approved diagnosis.</p>
        </Card>
      ) : (
        <div className="grid-square">
          {filtered.map(h => {
            const student = students.find(s => s.id === h.studentId);
            const kind = normalizeKind(h.kind || h.skillType || h.type);
            const level = normalizeLevel(h.level || h.currentLevel);
            const submission = submissions.find(s => s.homeworkId === h.id);
            return (
              <Card key={h.id} className="square-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                  <Avatar name={student?.name || '?'} size={24} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{student?.name || 'Student'}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center', marginBottom: 4 }}>
                  {h.title || 'Untitled Homework'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textAlign: 'center', marginBottom: 8 }}>
                  {kind} · {level}
                </div>
                <Pill tone={STATUS_TONE[h.status] || 'muted'} style={{ marginBottom: 12 }}>
                  {statusLabel(h.status)}
                </Pill>
                <div style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: 4, justifyContent: 'center' }}>
                  <Button variant="primary" size="sm" onClick={() => setSelectedHomework(h)}>
                    View
                  </Button>
                  {submission && (
                    <Button variant="secondary" size="sm" onClick={() => onNavigate('submissions:review', { submissionId: submission.id })}>
                      Review
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(h.id)} style={{ color: 'var(--danger)' }}>
                    <Icon.trash size={13} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selectedHomework)}
        onClose={() => setSelectedHomework(null)}
        kicker="Assigned homework"
        title={selectedHomework?.title || 'Untitled Homework'}
        subtitle={selectedStudent?.name || selectedHomework?.studentName || 'Student'}
      >
        {selectedHomework && (
          <div className="stack-list">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <Pill tone={STATUS_TONE[selectedHomework.status] || 'muted'}>{statusLabel(selectedHomework.status)}</Pill>
              {normalizeKind(selectedHomework.kind || selectedHomework.skillType || selectedHomework.type) && (
                <Pill tone="info">{normalizeKind(selectedHomework.kind || selectedHomework.skillType || selectedHomework.type)}</Pill>
              )}
              {normalizeLevel(selectedHomework.level || selectedHomework.currentLevel) && (
                <Pill tone="info">{normalizeLevel(selectedHomework.level || selectedHomework.currentLevel)}</Pill>
              )}
            </div>

            <div className="card-row-meta">
              {formatDate(selectedHomework.assignedAt || selectedHomework.createdAt) && <div>Assigned {formatDate(selectedHomework.assignedAt || selectedHomework.createdAt)}</div>}
              {formatDate(selectedHomework.dueDate) && <div>Due {formatDate(selectedHomework.dueDate)}</div>}
            </div>

            {selectedHomework.objective && (
              <section>
                <strong>Goal</strong>
                <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{selectedHomework.objective}</p>
              </section>
            )}
            {selectedHomework.description && (
              <section>
                <strong>Instructions</strong>
                <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{selectedHomework.description}</p>
              </section>
            )}
            {selectedHomework.teacherNotes && (
              <section>
                <strong>Teacher notes</strong>
                <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{selectedHomework.teacherNotes}</p>
              </section>
            )}

            <section>
              <strong>Exercises ({selectedActivities.length})</strong>
              {selectedActivities.length === 0 ? (
                <p className="card-row-meta" style={{ marginTop: 6 }}>No saved exercises for this assignment.</p>
              ) : (
                <ol style={{ margin: '8px 0 0', paddingLeft: 22 }}>
                  {selectedActivities.map((activity, index) => <li key={activity?.id || index} style={{ marginBottom: 6 }}>{activityLabel(activity, index)}</li>)}
                </ol>
              )}
            </section>

            {selectedAttachments.length > 0 && (
              <section>
                <strong>Resources</strong>
                <div className="stack-list" style={{ marginTop: 8 }}>
                  {selectedAttachments.map((attachment, index) => (
                    <a key={`${attachment}-${index}`} href={attachment} target="_blank" rel="noreferrer" style={{ overflowWrap: 'anywhere' }}>
                      {attachment}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
              {selectedSubmission && (
                <Button variant="primary" onClick={() => {
                  setSelectedHomework(null);
                  onNavigate('submissions:review', { submissionId: selectedSubmission.id });
                }}>
                  Review submission
                </Button>
              )}
              <Button variant="secondary" onClick={() => setSelectedHomework(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
