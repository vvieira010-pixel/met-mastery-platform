/**
 * students.jsx — Student roster with add/edit/profile navigation
 */
import { useState, useEffect } from 'react';
import { Icon, SectionHeader, Pill, Avatar } from '../components/shared.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { getStudents, saveStudent, deleteStudent, getDiagnoses, getHomework, getAllSubmissions, getClassEvents } from '../lib/workflow.js';
import { resetPasswordForEmail } from '../lib/supabase-storage.js';
import { getDbContext } from '../lib/supabase-db.js';

export default function StudentsPage({ onNavigate, "data-testid": testId }) {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [createLoginOnSave, setCreateLoginOnSave] = useState(true);
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [studentActions, setStudentActions] = useState({});
  const [setup, setSetup] = useState(null); // { id, pwd, busy, result }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [s, diagnoses, homework, submissions, classEvents] = await Promise.all([
        getStudents(),
        getDiagnoses(),
        getHomework(),
        getAllSubmissions(),
        getClassEvents(),
      ]);
      setStudents(s);
      setStudentActions(buildStudentActions(s, { diagnoses, homework, submissions, classEvents }));
    } catch (e) {
      window.toast?.(`Failed to load students: ${e.message}`, 'warn');
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditStudent(null);
    setForm(EMPTY_FORM);
    setCreateLoginOnSave(true);
    setShowForm(true);
  }

  function openEdit(student) {
    setEditStudent(student);
    setCreateLoginOnSave(false);
    setForm({
      name: student.name || '',
      email: student.email || '',
      currentLevel: student.currentLevel || 'B1',
      targetLevel: student.targetLevel || 'B2',
      examGoal: student.examGoal || 'Pass MET B2',
      professionalContext: student.professionalContext || '',
      cohort: student.cohort || '',
      notes: student.notes || '',
      totalSessions: student.totalSessions || 24,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { window.toast?.('Name is required.', 'warn'); return; }
    if (!form.email.trim()) { window.toast?.('Student email is required for login.', 'warn'); return; }
    const isNewStudent = !editStudent;
    setSaving(true);
    try {
      const student = await saveStudent({ ...form, id: editStudent?.id, session: editStudent?.session || 1 });
      let account = null;
      let accountError = null;

      if (isNewStudent && createLoginOnSave) {
        try {
          const password = genPassword();
          await createStudentAccount(student, password);
          account = { password };
        } catch (error) {
          accountError = error;
        }
      }

      await load();
      window.dispatchEvent(new CustomEvent('vv:students-updated'));
      setShowForm(false);

      if (accountError) {
        window.toast?.(`Student added, but their login was not created: ${accountError.message}`, 'warn');
      } else if (account) {
        setSetup({ id: student.id, pwd: '', busy: false, result: { ok: true, email: student.email, password: account.password } });
        window.toast?.('Student added and login created. Copy the details below to send to them.', 'ok');
      } else {
        window.toast?.(isNewStudent ? 'Student added.' : 'Student updated.', 'ok');
      }
    } catch (error) {
      window.toast?.(`Could not save student: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function createStudentAccount(student, password) {
    const ctx = getDbContext();
    if (!ctx) throw new Error('Sign in as teacher first.');
    const res = await fetch('/api/create-student-account', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId: student.id, email: student.email.trim(), name: student.name, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  function openSetup(student) {
    setSetup({ id: student.id, pwd: genPassword(), busy: false, result: null });
  }

  async function handleCreateAccount(student) {
    if (!setup) return;
    if (setup.pwd.length < 12) {
      setSetup(s => ({ ...s, result: { ok: false, error: 'Use a password with at least 12 characters.' } }));
      return;
    }
    setSetup(s => ({ ...s, busy: true, result: null }));
    try {
      await createStudentAccount(student, setup.pwd);
      setSetup(s => ({ ...s, busy: false, result: { ok: true, email: student.email, password: setup.pwd } }));
      window.toast?.(`Account created for ${student.name}. Copy their details before closing this panel.`, 'ok');
    } catch (err) {
      setSetup(s => ({ ...s, busy: false, result: { ok: false, error: err.message } }));
    }
  }

  async function handleResetPassword(student) {
    if (!student.email) { window.toast?.('Add the student\'s email first.', 'warn'); return; }
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      await resetPasswordForEmail(student.email.trim(), redirectTo);
      window.toast?.(`Password reset link sent to ${student.email}`, 'ok');
    } catch (err) {
      window.toast?.(`Could not send reset link: ${err.message}`, 'error');
    }
  }

  async function handleDelete(student) {
    if (!confirm(`Delete ${student.name} and all related classes, diagnoses, homework, submissions, feedback, messages, notes, and drafts? This cannot be undone. Export a backup first if needed.`)) return;
    await deleteStudent(student.id);
    await load();
    window.dispatchEvent(new CustomEvent('vv:students-updated'));
    window.toast?.('Student deleted.', 'info');
  }

  if (loading) return (
    <div className="page-shell" data-testid={testId}>
      <SectionHeader title="Students" sub="Loading..." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1,2,3].map(i => <SkeletonCard key={i} height={68} />)}
      </div>
    </div>
  );

  const cohorts = [...new Set(students.map(s => s.cohort || 'Unassigned').filter(Boolean))].sort();
  const filtered = students.filter(s => {
    if (search && !(s.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (cohortFilter && (s.cohort || 'Unassigned') !== cohortFilter) return false;
    return true;
  });

  return (
    <div className="page-shell">
      <SectionHeader
        title="Students"
        sub={`${students.length} student${students.length !== 1 ? 's' : ''} in your roster`}
        action={<Button variant="primary" onClick={openAdd}><Icon.plus size={14} /> Add Student</Button>}
      />

      {/* Add/Edit form */}
      {showForm && (
        <Card className="card-form">
          <SectionHeader title={editStudent ? 'Edit Student' : 'New Student'} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Field label="Full name *">
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, firstName: e.target.value.split(' ')[0] }))} placeholder="e.g. Ana Paula" autoFocus />
            </Field>
            <Field label="Email">
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="student@email.com" />
            </Field>
            <Field label="Current level">
              <select className="input" value={form.currentLevel} onChange={e => setForm(f => ({ ...f, currentLevel: e.target.value }))}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Target level">
              <select className="input" value={form.targetLevel} onChange={e => setForm(f => ({ ...f, targetLevel: e.target.value }))}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Exam goal">
              <input className="input" value={form.examGoal} onChange={e => setForm(f => ({ ...f, examGoal: e.target.value }))} placeholder="Pass MET B2" />
            </Field>
            <Field label="Total sessions">
              <input className="input" type="number" min={1} max={100} value={form.totalSessions} onChange={e => setForm(f => ({ ...f, totalSessions: Number(e.target.value) }))} />
            </Field>
            <Field label="Cohort / Group">
              <input className="input" value={form.cohort} onChange={e => setForm(f => ({ ...f, cohort: e.target.value }))} placeholder="e.g. Spring 2026, Group A" />
            </Field>
            <Field label="Professional context" style={{ gridColumn: '1 / -1' }}>
              <input className="input" value={form.professionalContext} onChange={e => setForm(f => ({ ...f, professionalContext: e.target.value }))} placeholder="e.g. Nurse, engineer, student..." />
            </Field>
            <Field label="Notes" style={{ gridColumn: '1 / -1' }}>
              <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." />
            </Field>
          </div>
          {!editStudent && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginTop: 'var(--space-4)', color: 'var(--text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
            checked={createLoginOnSave}
            onChange={e => setCreateLoginOnSave(e.target.checked)}
                style={{ marginTop: 3, accentColor: 'var(--primary)' }}
              />
              <span>
                <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>Create the student’s login now</strong>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                  I’ll show a one-time, copyable message with their email and password for you to send yourself.
                </small>
              </span>
            </label>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
            <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : (editStudent ? 'Save Changes' : 'Add Student')}</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Search + Cohort filter */}
      <div className="page-filters" style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" style={{ maxWidth: 240 }} />
        <select className="input" value={cohortFilter} onChange={e => setCohortFilter(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All cohorts</option>
          {cohorts.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={() => onNavigate('cohorts')}><Icon.group size={13} /> Cohorts</Button>
      </div>

      {/* Student table */}
      {filtered.length === 0 ? (
        <Card className="page-empty-state">
          <p style={{ color: 'var(--muted)' }}>{search ? 'No students match your search.' : 'No students yet. Add your first student above.'}</p>
        </Card>
      ) : (
        <div className="grid-square">
           {filtered.map(student => (
             <StudentRow
               key={student.id}
               student={student}
               nextAction={studentActions[student.id]}
               setupState={setup?.id === student.id ? setup : null}
               onProfile={() => onNavigate('students:profile', { studentId: student.id })}
               onEdit={() => openEdit(student)}
               onDelete={() => handleDelete(student)}
               onOpenSetup={() => openSetup(student)}
               onCloseSetup={() => setSetup(null)}
               onSetupPwd={pwd => setSetup(s => ({ ...s, pwd, result: null }))}
               onCreateAccount={() => handleCreateAccount(student)}
               onResetPassword={() => handleResetPassword(student)}
             />
           ))}

        </div>
      )}
    </div>
  );
}

function genPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const values = new Uint32Array(12);
  crypto.getRandomValues(values);
  let p = 'Met-';
  for (const value of values) p += chars[value % chars.length];
  return p;
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(err => {
    console.error('Clipboard copy failed:', err);
    window.toast?.('Failed to copy to clipboard.', 'warn');
  });
}

function StudentRow({ student, nextAction, setupState, onProfile, onEdit, onDelete, onOpenSetup, onCloseSetup, onSetupPwd, onCreateAccount, onResetPassword }) {
  const action = nextAction || { label: 'Ready for next class', tone: 'success' };
  const isSetupOpen = Boolean(setupState);
  const result = setupState?.result;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <Card
        className="square-card"
        onClick={() => onProfile()}
      >
        <Avatar name={student.name} size={48} />
        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', textAlign: 'center', marginTop: 8 }}>{student.name}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textAlign: 'center' }}>
          {student.currentLevel} → {student.targetLevel}
        </div>
        
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <Pill tone={action.tone}>{action.label}</Pill>
        </div>

         <div style={{ marginTop: 'auto', paddingTop: 12, width: '100%', display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
           <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onProfile(); }}>Profile</Button>
           <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onOpenSetup(); }} title="Setup Account"><Icon.lock size={13} /></Button>
           <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label="Edit"><Icon.edit size={13} /></Button>
           <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ color: 'var(--danger)' }} aria-label="Delete"><Icon.trash size={13} /></Button>
         </div>

      </Card>

      {/* Account setup panel */}
      {isSetupOpen && (
        <Card style={{ padding: 'var(--space-4)', border: '1px solid var(--accent)' }}>
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
            {result?.ok ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--success)', margin: 0 }}>
                  ✓ Account created for {student.name}
                  — ready for you to send
                </p>
                <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', lineHeight: 2 }}>
                  <div><strong>Login (email):</strong> {result.email}</div>
                  <div><strong>Password:</strong> {result.password}</div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <Button variant="primary" size="sm" onClick={() => {
                    copyText(`Login: ${result.email}\nPassword: ${result.password}`);
                    window.toast?.('Credentials copied!', 'ok');
                  }}>
                    Copy credentials
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const msg = `Hi ${student.firstName || student.name.split(' ')[0]}! Here are your login credentials for the MET Proficiency Platform:\n\nWebsite: https://met-mastery.vercel.app\nEmail: ${result.email}\nPassword: ${result.password}\n\nAfter logging in, go to Settings to change your password if you'd like.`;
                    copyText(msg);
                    window.toast?.('WhatsApp message copied!', 'ok');
                  }}>
                    Copy WhatsApp message
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onCloseSetup}>Done</Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', margin: 0 }}>
                  Create a login for <strong>{student.name}</strong> ({student.email}). You can use the generated password or type your own.
                </p>
                 <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                   <input
                     className="input"
                     style={{ maxWidth: 240 }}
                     value={setupState.pwd}
                     onChange={e => onSetupPwd(e.target.value)}
                     placeholder="New password (12+ characters)"
                   />
                   <Button variant="primary" size="sm" onClick={onCreateAccount} disabled={setupState.busy}>
                     {setupState.busy ? 'Creating…' : 'Create'}
                   </Button>
                   <Button variant="ghost" size="sm" onClick={onResetPassword} disabled={setupState.busy}>
                     Reset Password
                   </Button>
                 </div>
                 {result?.error && (
                   <p role="alert" style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', margin: 0 }}>
                     {result.error}
                   </p>
                 )}

              </div>
            )
          }
          </div>
        </Card>
      )}
    </div>
  );
}

function buildStudentActions(students, { diagnoses = [], homework = [], submissions = [], classEvents = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const doneHomeworkStatuses = new Set(['submitted', 'reviewed', 'completed', 'corrected']);
  return Object.fromEntries(students.map(student => {
    const studentId = student.id;
    const hasPendingSubmission = submissions.some(s => s.studentId === studentId && s.status === 'submitted');
    if (hasPendingSubmission) return [studentId, { label: 'Review submission', tone: 'danger' }];

    const hasApprovedDiagnosis = diagnoses.some(dx => dx.studentId === studentId && dx.status === 'approved');
    const hasDraftDiagnosis = diagnoses.some(dx => dx.studentId === studentId && (dx.status || 'draft') !== 'approved');
    if (!hasApprovedDiagnosis && hasDraftDiagnosis) return [studentId, { label: 'Finish diagnosis', tone: 'warning' }];
    if (!hasApprovedDiagnosis) return [studentId, { label: 'Needs diagnosis', tone: 'warning' }];

    const pendingHomework = homework.some(h => h.studentId === studentId && !doneHomeworkStatuses.has(h.status));
    if (pendingHomework) return [studentId, { label: 'Homework pending', tone: 'info' }];

    const nextClass = classEvents
      .filter(e => e.studentId === studentId && e.status !== 'canceled')
      .map(e => ({ ...e, startAt: new Date(`${e.date || new Date().toISOString().slice(0, 10)}T${e.startTime || '00:00'}`) }))
      .filter(e => e.startAt >= today)
      .sort((a, b) => a.startAt - b.startAt)[0];
    if (nextClass) return [studentId, { label: 'Next class set', tone: 'success' }];

    return [studentId, { label: 'Plan next class', tone: 'muted' }];
  }));
}

function Field({ label, children, style }) {
  return (
    <label className="field" style={style}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

const LEVELS = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];
const EMPTY_FORM = { name: '', email: '', currentLevel: 'B1', targetLevel: 'B2', examGoal: 'Pass MET B2', professionalContext: '', notes: '', totalSessions: 24 };

