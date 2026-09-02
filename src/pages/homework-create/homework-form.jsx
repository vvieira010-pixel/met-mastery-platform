import { SectionHeader, Icon, Button, Card } from '../../components/shared.jsx';
import { getB2Modules } from '../../lib/met-b2-bank.js';
import { getLifestyleModules } from '../../lib/lifestyle-pack.js';
import { getDeepResearchModules } from '../../lib/met-b2-exercises.js';
import { getDialogueModules } from '../../lib/dialogue-bank.js';
import { getGrammarModules } from '../../lib/met-grammar-bank.js';
import { isStructuredExercise } from '../../lib/exercise-types.js';
import { getHomeworkCognitiveSufficiencyWarning } from '../../lib/exercise-ai-helpers.js';
import { getDueItems, toMCQ, getAllEntries } from '../../lib/spaced-repetition.js';
import { TopicExplanationsEditor } from '../../components/topic-explanations.jsx';
import ResourcePicker from '../../components/resource-picker.jsx';
import { ExerciseTypePicker } from '../../components/exercise-editor.jsx';
import { ExerciseLibrary } from './exercise-library.jsx';
import ExerciseCard from '../../components/exercises/ExerciseCard.jsx';

function getPriorityItems(dx) {
  return Array.isArray(dx?.priorityDiagnosis)
    ? dx.priorityDiagnosis
    : Array.isArray(dx?.sections?.priorityDiagnosis?.content)
      ? dx.sections.priorityDiagnosis.content
      : [];
}

export function Field({ label, children, style }) {
  return (
    <label className="field" style={style}>
      <span className="section-label">{label}</span>
      {children}
    </label>
  );
}

export function StepPrebuilt({
  students, studentId, selectedStudentId, setSelectedStudentId,
  diagnosis, setDiagnosis, student, availableDiagnoses, form, setForm,
  errorBankItems, selectedLevel, subjectLabel,
  topicExplanations, setTopicExplanations, showResourcePicker, setShowResourcePicker,
  handleTopicAiGenerate, handleResourceSelect,
  packFilter, setPackFilter,
  unitBankExercises, addModuleFromB2Bank, addModuleFromLifestylePack,
  addModuleFromDeepResearch, addModuleFromGrammarBank, addUnitBankPack,
  onNavigate, setCurrentStep, populateFromDiagnosis, topicBank,
}) {
  const SKILLS = ['all','reading','listening','grammar','vocabulary','writing','speaking'];
  const SKILL_LABELS = { all:'All', reading:'Reading (Comp II)', listening:'Listening (Comp I)', grammar:'Grammar (Comp II)', vocabulary:'Vocabulary (Comp II)', writing:'Writing (Comp III)', speaking:'Speaking (Comp IV)' };
  const b2Mods = getB2Modules().map(m => ({ ...m, pack:'MET B2', packLevel:'B2', level:'B2' }));
  const lifeMods = getLifestyleModules().map(m => ({ ...m, pack:'Everyday English', packLevel:'B1-B2', level:'B1-B2' }));
  const drMods = getDeepResearchModules().map(m => ({ ...m, pack:'Extended Practice', packLevel:'B2', level:'B2' }));
  const grMods = getGrammarModules().map(m => ({ ...m, pack:'Grammar Drill Bank', packLevel:'B2', level:'B2' }));
  const dlgMods = getDialogueModules().map(m => ({ ...m, pack:'Dialogue Practice', packLevel:'B2', level:'B2' }));
  const allPrebuilt = [...b2Mods, ...lifeMods, ...drMods, ...dlgMods, ...grMods];
  const filtered = packFilter === 'all' ? allPrebuilt : allPrebuilt.filter(m => m.skill === packFilter);

  return (
    <div className="stack-list" style={{ gap: 'var(--space-4)' }}>
      <SectionHeader title="Step 1: Prebuilt Homework" />
      <Card className="card-sm card-p-5">
        <div className="stack-list" style={{ gap: 'var(--space-4)' }}>
          {studentId || diagnosis?.studentId ? (
            <p style={{ fontSize: 'var(--text-base)' }}>Student: <strong>{student?.name || 'Loading…'}</strong></p>
          ) : (
            <Field label="Student">
              <select className="input" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                <option value="">Choose student before assigning</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          )}
          <Field label="Link Diagnosis">
            <select className="input" value={diagnosis?.id || ''} onChange={e => {
              const dxId = e.target.value;
              const dx = availableDiagnoses.find(d => d.id === dxId);
              if (dx) { setDiagnosis(dx); populateFromDiagnosis(dx, student); }
              else { setDiagnosis(null); }
            }}>
              <option value="">None, create from scratch</option>
              {availableDiagnoses.map(dx => (
                <option key={dx.id} value={dx.id}>{dx.date} — {dx.sections?.priorityDiagnosis?.content?.[0]?.area || 'General Diagnosis'}</option>
              ))}
            </select>
          </Field>
          {diagnosis && (
            <div className="homework-diagnosis-box">
              <div className="homework-diagnosis-label">Diagnostic Focus:</div>
              <div className="homework-diagnosis-text">
                {getPriorityItems(diagnosis)[0]?.area}: {getPriorityItems(diagnosis)[0]?.whatToImprove}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('diagnostics')}>View Full Diagnosis</Button>
            </div>
          )}
          <Field label="Homework Goal">
            <input className="input" value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} placeholder="What this homework targets..." />
          </Field>
        </div>
      </Card>
      {errorBankItems.filter(e => e.status !== 'solved').length > 0 && (
        <Card className="card-sm card-p-5">
          <SectionHeader title="Error Bank: Active Patterns" />
          <div className="stack-list" style={{ gap: 'var(--space-2)' }}>
            {errorBankItems.filter(e => e.status !== 'solved').slice(0, 3).map(entry => (
              <div key={entry.id} className="homework-error-item">
                <div className="homework-error-body">
                  <span className="homework-error-text">{entry.error}</span>
                  <span className="homework-error-arrow">→</span>
                  <span className="homework-error-correct">{entry.correct}</span>
                  {entry.type && <span className="homework-error-type">{entry.type}</span>}
                </div>
                <button className="homework-error-btn"
                  onClick={() => setForm(f => ({ ...f, objective: f.objective ? f.objective : `Fix error: ${entry.error} → ${entry.correct}` }))}
                  title="Use as homework goal">Use as goal</button>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card className="card-sm card-p-5">
        <SectionHeader title="Topic Explanations" sub="Add explanations the student can read before starting exercises." />
        <TopicExplanationsEditor topics={topicExplanations} onChange={setTopicExplanations} onAiGenerate={handleTopicAiGenerate} topicBank={topicBank} />
        <div className="homework-gen-toolbar" style={{ marginTop: 'var(--space-3)' }}>
          <Button variant="ghost" size="sm" onClick={() => setShowResourcePicker(true)}>
            <Icon.image size={12} /> Media Library
          </Button>
        </div>
        {showResourcePicker && (
          <ResourcePicker open={true} onClose={() => setShowResourcePicker(false)} onSelect={handleResourceSelect} tab="images" />
        )}
      </Card>
      <Card className="card-sm card-p-5">
        <SectionHeader title="MET-Aligned Exercise Packs" sub="Browse by skill. Click Add on any module to add its exercises." />
        <div className="homework-pack-filters">
          {SKILLS.map(s => (
            <button key={s} className={`homework-pack-filter-btn${packFilter === s ? ' homework-pack-filter-btn--active' : ''}`} onClick={() => setPackFilter(s)}>
              {SKILL_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="homework-pack-list">
          {filtered.length === 0 && <div className="homework-pack-empty">No prebuilt packs match this skill.</div>}
          {filtered.map(mod => (
            <div key={mod.id} className="homework-pack-module">
              <div className="homework-pack-module-info">
                <div className="homework-pack-module-title">{mod.label}</div>
                <div className="homework-pack-module-meta">
                  <span>{mod.pack}</span>
                  <span className="homework-pack-module-dot">·</span>
                  <span className="homework-pack-module-skill">{mod.skill}</span>
                  <span className="homework-pack-module-dot">·</span>
                  <span>{mod.exercises?.length || mod.exerciseCount || 0} exercises</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                if (mod.pack === 'Everyday English') addModuleFromLifestylePack(mod);
                else if (mod.pack === 'Extended Practice') addModuleFromDeepResearch(mod);
                else if (mod.pack === 'Grammar Drill Bank') addModuleFromGrammarBank(mod);
                else addModuleFromB2Bank(mod);
              }}>Add</Button>
            </div>
          ))}
        </div>
        {unitBankExercises.length > 0 && (
          <div className="homework-unit-bank-row">
            <div className="homework-unit-bank-inner">
              <div>
                <div className="homework-pack-module-title">Unit Bank: {subjectLabel}</div>
                <div className="homework-pack-module-meta">{selectedLevel} · {unitBankExercises.length} exercises available</div>
              </div>
              <Button variant="ghost" size="sm" onClick={addUnitBankPack}>Add all</Button>
            </div>
          </div>
        )}
      </Card>
      <div className="homework-create-actions">
        <Button variant="primary" onClick={() => setCurrentStep(2)}>Next: Retrieval</Button>
      </div>
    </div>
  );
}

export function StepRetrieval({
  retrievalCount, handleGenerateRetrieval, generatingRetrieval,
  generating, diagnosis, handleGenerateByGroups, groupGenConfig,
  setGroupGenConfig, SKILL_GROUPS, handleAiGenerate, handleGenerateListening,
  generatingListening, handleGenerateReading, generatingReading,
  handleGenerateOptions, loadingOptions, groupGenStatus,
  setCurrentStep,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--ink)' }}>Step 2: Retrieval Practice</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 1.25rem 0', lineHeight: 1.6 }}>
          Enhance learning by generating recall questions based on the objective so the student practices remembering target language.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={handleGenerateRetrieval} disabled={generatingRetrieval || generating}>
            <Icon.spark size={14} /> {generatingRetrieval ? 'Generating…' : 'Generate Retrieval Practice'}
          </Button>
          {retrievalCount > 0 && (
            <span className="homework-retrieval-badge">{retrievalCount} retrieval exercise{retrievalCount === 1 ? '' : 's'} added</span>
          )}
        </div>
      </Card>

      <Card style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--ink)' }}>MET Focus: Select Exam Skills</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 1.25rem 0' }}>
          Choose the MET exam skills this homework should target. Each generated item is calibrated for MET format.
        </p>
        <div className="grid-tools" style={{ marginBottom: '1.5rem' }}>
          {SKILL_GROUPS.map(group => (
            <label key={group.key} className="skill-input">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                {group.icon}
                <span>{group.label}</span>
              </span>
              <input className="homework-skill-count" type="number" min="0" max="6"
                value={groupGenConfig[group.key] || 0}
                onChange={e => setGroupGenConfig(cfg => ({ ...cfg, [group.key]: Math.max(0, Math.min(6, Number(e.target.value) || 0)) }))} />
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={handleGenerateByGroups} disabled={generating}>
            <Icon.spark size={14} /> Group Generate
          </Button>
          <Button variant="outline" onClick={handleAiGenerate} disabled={!diagnosis || generating}>
            <Icon.diagnose size={14} /> From Diagnosis
          </Button>
          <Button variant="outline" onClick={handleGenerateListening} disabled={!diagnosis || generatingListening}>
            <Icon.headphones size={14} /> Listening
          </Button>
          <Button variant="outline" onClick={handleGenerateReading} disabled={generatingReading}>
            <Icon.doc size={14} /> Reading
          </Button>
          <Button variant="ghost" onClick={handleGenerateOptions} disabled={!diagnosis || loadingOptions}>
            <Icon.refresh size={14} /> {loadingOptions ? 'Generating…' : 'Suggestions'}
          </Button>
        </div>
        {groupGenStatus && (
          <div className="homework-gen-status" style={{ marginTop: '1rem' }}>
            <span className="homework-gen-spinner" /> {groupGenStatus}
          </div>
        )}
      </Card>

      <footer style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <Button variant="outline" onClick={() => setCurrentStep(1)}>Cancel</Button>
        <Button variant="primary" onClick={() => setCurrentStep(3)}>Proceed to Build</Button>
      </footer>
    </div>
  );
}

export function StepBuild({
  form, setForm, togglePanel, setShowLibrary,
  setPreviewResponses, setStudentPreview, handleAnalyzeLanguageDemand,
  generatingLangDemand, expandedEx, setExpandedEx,
  updateExercise, removeExercise, moveExercise, saveToLibrary,
  exerciseOptions, setExerciseOptions, addAiExerciseToList,
  handleAiGenerateByType, addExercise, activePanel, setActivePanel,
  diagnosis, reviewDueCount, includeReview, setIncludeReview,
  studentId, selectedStudentId, setSelectedStudentId, student, students,
  languageDemand, setLanguageDemand,
  saving, handleAssign, libraryExercises,
  showLibrary, addFromLibrary, removeFromLibrary,
}) {
  const warn = getHomeworkCognitiveSufficiencyWarning(form.exercises, diagnosis);

  return (
    <Card style={{ padding: 'var(--space-5)' }}>
      <SectionHeader title="Step 3: Build" />
      <div style={{ marginTop: 16 }}>
        <div className="homework-create-toolbar">
          <Button variant="primary" size="sm" onClick={() => togglePanel('type-picker')}>
            <Icon.plus size={12} /> Add Exercise
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { setShowLibrary(true); }} disabled={libraryExercises.length === 0}>
            <Icon.book size={12} /> From Library
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { setPreviewResponses({}); setStudentPreview(true); }} disabled={!form.exercises.some(isStructuredExercise)} title="Step through the whole homework exactly as the student will receive it">
            <Icon.play size={12} /> Preview as student
          </Button>
          <Button variant="ghost" size="sm" onClick={handleAnalyzeLanguageDemand} disabled={generatingLangDemand || !form.exercises.length} title="Check vocabulary load and get pre-teaching suggestions">
            <Icon.search size={12} /> {generatingLangDemand ? 'Analysing…' : 'Check Language Demands'}
          </Button>
        </div>

        {activePanel === 'type-picker' && (
          <ExerciseTypePicker
            onSelect={addExercise}
            onClose={() => setActivePanel(null)}
            onAiGenerate={handleAiGenerateByType}
            exerciseOptions={exerciseOptions}
            onAddAiSuggestion={(ex) => { addAiExerciseToList(ex); setExerciseOptions(prev => prev.filter(e => e.id !== ex.id)); }}
          />
        )}

        {showLibrary && (
          <ExerciseLibrary
            libraryExercises={libraryExercises}
            addFromLibrary={addFromLibrary}
            onRemoveFromLibrary={removeFromLibrary}
            diagnosis={diagnosis}
          />
        )}

        {reviewDueCount > 0 && (
          <div className={`homework-review-block${includeReview ? ' homework-review-block--active' : ''}`}>
            <div className="homework-review-row">
              <div>
                <div className="homework-review-title">
                  <span>Error Review ({reviewDueCount} item{reviewDueCount !== 1 ? 's' : ''} due)</span>
                  <span className="homework-review-pill">Spaced repetition</span>
                </div>
                <div className="homework-review-desc">
                  Past errors due for review. Each item becomes an <strong>MCQ</strong> exercise.
                </div>
              </div>
              <label className="homework-review-toggle">
                <input type="checkbox" className="homework-review-checkbox" checked={includeReview}
                  onChange={e => {
                    setIncludeReview(e.target.checked);
                    if (e.target.checked) {
                      const sid = studentId || selectedStudentId || student?.id || diagnosis?.studentId;
                      if (!sid) return;
                      const due = getDueItems(sid);
                      const all = getAllEntries(sid);
                      const reviewExercises = due.map(item => toMCQ(item, all));
                      setForm(f => ({ ...f, exercises: [...f.exercises, ...reviewExercises] }));
                    } else {
                      setForm(f => ({ ...f, exercises: f.exercises.filter(ex => !ex.isReviewItem) }));
                    }
                  }} />
                {includeReview ? 'Added' : `Add ${reviewDueCount} review item${reviewDueCount !== 1 ? 's' : ''}`}
              </label>
            </div>
          </div>
        )}

        <div className="homework-exercise-list">
          {form.exercises.map((ex, i) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              index={i}
              total={form.exercises.length}
              isExpanded={expandedEx === ex.id}
              onToggle={() => setExpandedEx(expandedEx === ex.id ? null : ex.id)}
              onChange={(updated) => updateExercise(ex.id, updated)}
              onRemove={() => removeExercise(ex.id)}
              onMove={(dir) => moveExercise(i, dir)}
              onSaveToLibrary={() => saveToLibrary(ex)}
            />
          ))}
        </div>

        {warn && (
          <div className="homework-warning-note">
            <Icon.spark size={13} className="homework-warning-icon" />
            <span><strong>Cognitive sufficiency note:</strong> {warn}</span>
          </div>
        )}

        {languageDemand && (
          <div className="homework-lang-demand">
            <div className="homework-lang-demand-header">
              <span className="homework-lang-demand-title">Language Demand Analysis</span>
              <span className={`homework-demand-badge homework-demand-badge--${languageDemand.overall_demand === 'high' ? 'high' : languageDemand.overall_demand === 'medium' ? 'medium' : 'low'}`}>{languageDemand.overall_demand} demand</span>
              <button className="homework-lang-demand-dismiss" onClick={() => setLanguageDemand(null)}>×</button>
            </div>
            {languageDemand.teacher_note && (<p className="homework-lang-demand-note">{languageDemand.teacher_note}</p>)}
            <div className="homework-demand-actions">
              {(languageDemand.priority_actions || []).map((action, i) => (
                <div key={i} className="homework-demand-action-card">
                  <div className="homework-demand-action-type">{action.demand_type}</div>
                  <div className="homework-demand-action-desc">{action.description}</div>
                  <div className="homework-demand-action-rec">Recommend: {action.recommendation}</div>
                </div>
              ))}
            </div>
            {(languageDemand.tier2_vocabulary?.length > 0 || languageDemand.tier3_vocabulary?.length > 0) && (
              <div className="homework-demand-vocab">
                {languageDemand.tier2_vocabulary?.length > 0 && (
                  <div>
                    <div className="section-label" style={{ marginBottom: 4 }}>Tier 2 to pre-teach</div>
                    <div className="homework-demand-vocab-group">{languageDemand.tier2_vocabulary.join(' · ')}</div>
                  </div>
                )}
                {languageDemand.tier3_vocabulary?.length > 0 && (
                  <div>
                    <div className="section-label" style={{ marginBottom: 4 }}>Tier 3 to pre-teach</div>
                    <div className="homework-demand-vocab-group">{languageDemand.tier3_vocabulary.join(' · ')}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="homework-assign-section">
          <div className="homework-assign-title">Assign homework</div>
          <div className="homework-assign-fields">
            {studentId || diagnosis?.studentId ? null : (
              <Field label="Student">
                <select className="input" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                  <option value="">Choose student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
            )}
            <div className="homework-assign-grid">
              <Field label="Homework Title">
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </Field>
              <Field label="Due Date">
                <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </Field>
            </div>
          </div>
          <div className="homework-assign-actions">
            <Button variant="primary" onClick={handleAssign} disabled={saving}>
              {saving ? 'Assigning…' : 'Assign Homework'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
