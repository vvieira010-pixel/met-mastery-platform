import { useState, useEffect } from 'react';
import { Icon, SectionHeader, Pill, Modal, Breadcrumb } from '../components/shared.jsx';
import { Card } from '../components/ui/Card.jsx';
import { getDiagnoses, getStudent, saveHomework, updateClassEventStatus, getErrorBank } from '../lib/workflow.js';
import { createExercise, isStructuredExercise } from '../lib/exercise-types.js';
import { getLibraryExercises, saveExerciseToLibrary, deleteLibraryExercise, incrementUsage } from '../lib/exercise-library.js';
import { generateId } from '../lib/utils.js';
import HomeworkSetWizard from '../components/homework-set-wizard.jsx';
import { getUnitsByLevel, getSkillExercises, SUBJECT_OPTIONS } from '../lib/unit-bank.js';
import { getTopicList } from '../lib/vocab-homework-bank.js';
import { getB2ModuleExercises } from '../lib/met-b2-bank.js';
import { getLifestyleModuleExercises } from '../lib/lifestyle-pack.js';
import { getDeepResearchModuleExercises } from '../lib/met-b2-exercises.js';
import { getGrammarModules, getGrammarModuleExercises } from '../lib/met-grammar-bank.js';
import { getDueCount } from '../lib/spaced-repetition.js';
import { buildExercisesFromAiTasks } from '../lib/exercise-ai-helpers.js';
import { HomeworkStepThrough } from '../components/exercise-player.jsx';
import { StepPrebuilt, StepRetrieval, StepBuild } from './homework-create/homework-form.jsx';
import { useHomeworkAI } from './homework-create/prompt-builders.js';

const EMPTY_FORM = {
  title: '', objective: '', description: '',
  exercises: [], attachments: [], selfCheck: [''],
  skillType: 'grammar', dueDate: '', teacherNotes: '',
};

const SKILL_GROUPS = [
  { key: 'speaking',   label: 'Speaking (Comp IV)',   icon: <Icon.mic size={16} /> },
  { key: 'writing',    label: 'Writing (Comp III)',    icon: <Icon.edit size={16} /> },
  { key: 'grammar',    label: 'Grammar (Comp II)',    icon: <Icon.diagnose size={16} /> },
  { key: 'vocabulary', label: 'Vocabulary (Comp II)', icon: <Icon.book size={16} /> },
  { key: 'reading',    label: 'Reading (Comp II)',    icon: <Icon.eye size={16} /> },
  { key: 'listening',  label: 'Listening (Comp I)',  icon: <Icon.headphones size={16} /> },
];

function getPriorityItems(dx) {
  return Array.isArray(dx?.priorityDiagnosis)
    ? dx.priorityDiagnosis
    : Array.isArray(dx?.sections?.priorityDiagnosis?.content)
      ? dx.sections.priorityDiagnosis.content : [];
}

function inferSkillType(priorities) {
  const areas = (Array.isArray(priorities) ? priorities : []).map(p => (p.area || '').toLowerCase());
  if (areas.some(a => /speak/.test(a))) return 'speaking';
  if (areas.some(a => /writ/.test(a))) return 'writing';
  if (areas.some(a => /vocab/.test(a))) return 'vocabulary';
  return 'grammar';
}

export default function HomeworkCreate({ diagnosisId, studentId, students, onNavigate, initialStep = 1, "data-testid": testId }) {
  const [availableDiagnoses, setAvailableDiagnoses] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [student, setStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(studentId || '');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingListening, setGeneratingListening] = useState(false);
  const [generatingReading, setGeneratingReading] = useState(false);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [wizardDone, setWizardDone] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [packFilter, setPackFilter] = useState('all');
  const [unitBankExercises, setUnitBankExercises] = useState([]);
  const [expandedEx, setExpandedEx] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [groupGenConfig, setGroupGenConfig] = useState({});
  const [groupGenStatus, setGroupGenStatus] = useState('');
  const [libVersion, setLibVersion] = useState(0);
  const [libraryExercises, setLibraryExercises] = useState([]);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const reviewDueCount = (studentId || selectedStudentId) ? getDueCount(studentId || selectedStudentId) : 0;
  const [includeReview, setIncludeReview] = useState(false);
  const [generatingRetrieval, setGeneratingRetrieval] = useState(false);
  const [languageDemand, setLanguageDemand] = useState(null);
  const [errorBankItems, setErrorBankItems] = useState([]);
  const [generatingLangDemand, setGeneratingLangDemand] = useState(false);
  const [studentPreview, setStudentPreview] = useState(false);
  const [previewResponses, setPreviewResponses] = useState({});
  const [topicExplanations, setTopicExplanations] = useState([]);
  const [showResourcePicker, setShowResourcePicker] = useState(false);

  const togglePanel = key => {
    setActivePanel(p => p === key ? null : key);
    if (key !== null) setTimeout(() => {
      const toolbar = document.querySelector('.homework-create-toolbar');
      if (toolbar) toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    let cancelled = false;
    getLibraryExercises().then(list => { if (!cancelled) setLibraryExercises(list); }).catch(e => console.warn('[homework-create] failed to load library:', e));
    return () => { cancelled = true; };
  }, [libVersion]);

  useEffect(() => {
    if (!selectedStudentId) { setAvailableDiagnoses([]); setErrorBankItems([]); return; }
    getDiagnoses(selectedStudentId).then(list => { setAvailableDiagnoses(list || []); }).catch(e => console.warn('[homework-create] failed to load diagnoses:', e));
    getErrorBank(selectedStudentId).then(list => { setErrorBankItems(list || []); }).catch(e => console.warn('[homework-create] failed to load error bank:', e));
  }, [selectedStudentId]);

  useEffect(() => {
    let sid = studentId || '';
    if (sid) setSelectedStudentId(sid);
    if (diagnosisId) {
      getDiagnoses(sid).then(allDx => {
        const dx = allDx.find(d => d.id === diagnosisId);
        if (!dx) return;
        setDiagnosis(dx);
        const resolvedSid = sid || dx.studentId || '';
        if (!sid && dx.studentId) setSelectedStudentId(dx.studentId);
        getStudent(resolvedSid).then(s => { setStudent(s || null); populateFromDiagnosis(dx, s || null); });
      });
    } else if (sid) {
      getStudent(sid).then(s => { if (s) setStudent(s); });
    }
  }, [diagnosisId, studentId]);

  function populateFromDiagnosis(dx, s) {
    const hwRec = dx.sections?.homeworkRecommendation?.content;
    const priority = getPriorityItems(dx)[0];
    const title = hwRec?.title || (priority ? `${s?.firstName || 'Student'}, ${priority.area}` : 'Homework from Diagnosis');
    const type = hwRec?.expectedSubmissionType?.split('|')[0] || inferSkillType(getPriorityItems(dx));
    setForm({
      title,
      objective: hwRec?.objective || (priority ? priority.whatToImprove : ''),
      description: hwRec?.instructions || '',
      exercises: buildExercisesFromAiTasks(hwRec?.tasks, []),
      selfCheck: Array.isArray(hwRec?.selfCheck) ? hwRec.selfCheck : [''],
      skillType: type,
      dueDate: '', teacherNotes: '',
    });
  }

  function addExercise(type, count = 1, level = 'B1') {
    const n = Math.max(1, Math.min(20, Number(count) || 1));
    const created = Array.from({ length: n }, () => createExercise(type, level));
    setForm(f => ({ ...f, exercises: [...f.exercises, ...created] }));
    setExpandedEx(created[0].id);
    setActivePanel(null);
    if (n > 1) window.toast?.(`Added ${n} ${level} ${type} exercises.`, 'ok');
  }

  function updateExercise(id, updated) {
    setForm(f => ({ ...f, exercises: f.exercises.map(e => e.id === id ? updated : e) }));
  }

  function removeExercise(id) {
    setForm(f => ({ ...f, exercises: f.exercises.filter(e => e.id !== id) }));
    if (expandedEx === id) setExpandedEx(null);
  }

  function moveExercise(idx, dir) {
    const j = idx + dir;
    if (j < 0 || j >= form.exercises.length) return;
    setForm(f => {
      const next = [...f.exercises];
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...f, exercises: next };
    });
  }

  async function addModuleFromB2Bank(mod) {
    const exercises = await getB2ModuleExercises(mod.id);
    if (!exercises.length) { window.toast?.('No exercises in this module.', 'warn'); return; }
    setForm(f => ({ ...f, exercises: [...f.exercises, ...exercises] }));
    window.toast?.(`Added ${exercises.length} MET B2 exercises from "${mod.label}".`, 'ok');
    setActivePanel(null);
  }

  function addModuleFromLifestylePack(mod) {
    const exercises = getLifestyleModuleExercises(mod.id);
    if (!exercises.length) { window.toast?.('No exercises in this section.', 'warn'); return; }
    setForm(f => ({ ...f, exercises: [...f.exercises, ...exercises] }));
    window.toast?.(`Added ${exercises.length} Everyday English exercises from "${mod.label}".`, 'ok');
    setActivePanel(null);
  }

  function addModuleFromDeepResearch(mod) {
    const exercises = getDeepResearchModuleExercises(mod.id);
    if (!exercises.length) { window.toast?.('No exercises in this module.', 'warn'); return; }
    setForm(f => ({ ...f, exercises: [...f.exercises, ...exercises] }));
    window.toast?.(`Added ${exercises.length} exercises from "${mod.label}".`, 'ok');
    setActivePanel(null);
  }

  function addModuleFromGrammarBank(mod) {
    const exercises = getGrammarModuleExercises(mod.id);
    if (!exercises.length) { window.toast?.('No exercises in this module.', 'warn'); return; }
    setForm(f => ({ ...f, exercises: [...f.exercises, ...exercises] }));
    window.toast?.(`Added ${exercises.length} grammar exercises from "${mod.label}".`, 'ok');
    setActivePanel(null);
  }

  function addUnitBankPack() {
    if (!unitBankExercises.length) { window.toast?.('No unit bank exercises available yet.', 'warn'); return; }
    setForm(f => ({ ...f, exercises: [...f.exercises, ...unitBankExercises.map(ex => ({ ...ex, id: generateId('ub_') }))] }));
    window.toast?.(`Added ${unitBankExercises.length} unit bank exercises.`, 'ok');
  }

  async function saveToLibrary(ex) {
    try { const rec = await saveExerciseToLibrary(ex); setLibVersion(v => v + 1); window.toast?.(rec ? `Saved "${rec.title}" to your library.` : 'Could not save exercise.', rec ? 'ok' : 'warn'); }
    catch (e) { window.toast?.(`Save failed: ${e.message}`, 'warn'); }
  }

  async function addFromLibrary(libEx) {
    const { id, title, ...fields } = libEx;
    const fresh = { ...fields, id: generateId('ex_') };
    setForm(f => ({ ...f, exercises: [...f.exercises, fresh] }));
    window.toast?.(`"${title}" added.`, 'ok');
    try { await incrementUsage(id); } catch {}
  }

  async function removeFromLibrary(libId) {
    try { await deleteLibraryExercise(libId); setLibVersion(v => v + 1); window.toast?.('Removed from your library.', 'info'); }
    catch (e) { window.toast?.(`Remove failed: ${e.message}`, 'warn'); }
  }

  async function autoSaveExercises() {
    const saved = [];
    for (const ex of form.exercises) {
      if (!ex.type) continue;
      try { const rec = await saveExerciseToLibrary(ex); if (rec) saved.push(rec.title); }
      catch (e) { console.warn('[HomeworkCreate] auto-save exercise failed:', e.message); }
    }
    if (saved.length) { setLibVersion(v => v + 1); window.toast?.(`${saved.length} exercise${saved.length === 1 ? '' : 's'} saved to your library.`, 'ok'); }
  }

  async function handleAssign() {
    if (!form.title.trim()) { window.toast?.('Title is required.', 'warn'); return; }
    if (form.exercises.length === 0) { window.toast?.('Add at least one exercise.', 'warn'); return; }
    const resolvedStudentId = studentId || selectedStudentId || student?.id || diagnosis?.studentId || '';
    if (!resolvedStudentId) { window.toast?.('Select or link a student before assigning homework.', 'warn'); return; }
    const resolvedStudent = student || students?.find(s => s.id === resolvedStudentId);
    setSaving(true);
    try {
      await saveHomework({
        studentId: resolvedStudentId, studentName: resolvedStudent?.name || '', diagnosisId,
        title: form.title, objective: form.objective, description: form.description,
        workflowTemplate: 'prebuilt-retrieval-build-revision',
        workflowStages: ['prebuilt', 'retrieval', 'build_revision'],
        activities: form.exercises, topicExplanations,
        selfCheck: form.selfCheck.filter(Boolean), skillType: form.skillType, type: form.skillType,
        dueDate: form.dueDate, teacherNotes: form.teacherNotes, status: 'not-started',
      });
      if (diagnosis?.classEventId) {
        await updateClassEventStatus(diagnosis.classEventId, { homeworkStatus: 'assigned' }).catch(e =>
          console.warn('[HomeworkCreate] updateClassEventStatus failed:', e));
      }
      await autoSaveExercises();
    } catch (e) { console.error('[HomeworkCreate] Save failed:', e); window.toast?.(`Save failed: ${e.message}`, 'error'); setSaving(false); return; }
    setSaving(false);
    window.toast?.('Homework assigned to student!', 'ok');
    onNavigate('homework');
  }

  function handleWizardComplete({ level, skill }) {
    setSelectedLevel(level); setSelectedSkill(skill);
    setUnitBankExercises(getSkillExercises(getUnitsByLevel(level), skill, 12));
    setWizardDone(true);
  }

  function handleResourceSelect(url) {
    if (expandedEx) {
      setForm(f => {
        const nextExercises = f.exercises.map(ex => {
          if (ex.id === expandedEx) {
            if (url.match(/\.(mp3|wav|ogg|m4a)$/i)) return { ...ex, audioSrc: url };
            if (url.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
              if (ex.type === 'speak') return { ...ex, imageUrl: url };
              if (ex.type === 'listen') return { ...ex, pictureHint: url };
              return { ...ex, imageUrl: url };
            }
          }
          return ex;
        });
        return { ...f, exercises: nextExercises };
      });
      window.toast?.('Resource added to exercise!', 'ok');
    } else {
      setForm(f => ({ ...f, attachments: [...(f.attachments || []), url] }));
      window.toast?.('Resource added to homework!', 'ok');
    }
  }

  const ai = useHomeworkAI({
    form, setForm, diagnosis, student,
    selectedLevel,
    setExpandedEx, setLibVersion,
    groupGenConfig, setGroupGenStatus,
    setGenerating, setGeneratingListening, setGeneratingReading,
    setLoadingOptions, setExerciseOptions, setActivePanel,
    setGeneratingRetrieval, setGeneratingLangDemand, setLanguageDemand,
    setTopicExplanations, selectedSkill,
  });

  if (!wizardDone) return <HomeworkSetWizard onComplete={handleWizardComplete} onSkip={() => setWizardDone(true)} />;
  const subjectLabel = SUBJECT_OPTIONS.find(s => s.id === selectedSkill)?.label;
  const exerciseCount = form.exercises.length;
  const retrievalCount = form.exercises.filter(ex => ex.focus === 'retrieval').length;
  const topicBank = [
    ...getGrammarModules().map(m => ({ id: m.id, title: m.label, category: 'Grammar' })),
    ...getTopicList().map(t => ({ id: t.id, title: t.title, category: 'Vocabulary' })),
  ];

  return (
    <div className="homework-create-page" data-testid={testId}>
      <Breadcrumb crumbs={[{ label: 'Homework', onClick: () => onNavigate('homework') }, { label: 'Create' }]} />
      <SectionHeader title="Create Homework" />
      {(selectedLevel || subjectLabel) && (
        <div className="homework-wizard-info">
          {selectedLevel && <Pill tone="info">{selectedLevel}</Pill>}
          {subjectLabel && <Pill tone="info">{subjectLabel}</Pill>}
          <button className="homework-wizard-change" onClick={() => setWizardDone(false)}>Change</button>
        </div>
      )}
      <div className="homework-step-tabs wizard-step">
        {['Prebuilt', 'Retrieval & MET Focus', 'Build'].map((step, i) => (
          <button type="button" key={step}
            className={`homework-step-tab${currentStep === i + 1 ? ' homework-step-tab--active step-active' : ''}`}
            onClick={() => setCurrentStep(i + 1)}>
            {i + 1}. {step}
          </button>
        ))}
      </div>
      <div className="homework-create-grid">
        <div>
          {currentStep === 1 && (
            <StepPrebuilt
              students={students} studentId={studentId} selectedStudentId={selectedStudentId}
              setSelectedStudentId={setSelectedStudentId} diagnosis={diagnosis} setDiagnosis={setDiagnosis}
              student={student} availableDiagnoses={availableDiagnoses} form={form} setForm={setForm}
              errorBankItems={errorBankItems} selectedLevel={selectedLevel} subjectLabel={subjectLabel}
              topicExplanations={topicExplanations} setTopicExplanations={setTopicExplanations}
              showResourcePicker={showResourcePicker} setShowResourcePicker={setShowResourcePicker}
              handleTopicAiGenerate={ai.handleTopicAiGenerate} handleResourceSelect={handleResourceSelect}
              packFilter={packFilter} setPackFilter={setPackFilter}
              unitBankExercises={unitBankExercises}
              addModuleFromB2Bank={addModuleFromB2Bank} addModuleFromLifestylePack={addModuleFromLifestylePack}
              addModuleFromDeepResearch={addModuleFromDeepResearch} addModuleFromGrammarBank={addModuleFromGrammarBank}
              addUnitBankPack={addUnitBankPack}
              onNavigate={onNavigate} setCurrentStep={setCurrentStep}
              populateFromDiagnosis={populateFromDiagnosis} topicBank={topicBank}
            />
          )}
          {currentStep === 2 && (
            <StepRetrieval
              retrievalCount={retrievalCount} handleGenerateRetrieval={ai.handleGenerateRetrieval}
              generatingRetrieval={generatingRetrieval} generating={generating}
              diagnosis={diagnosis} handleGenerateByGroups={ai.handleGenerateByGroups}
              groupGenConfig={groupGenConfig} setGroupGenConfig={setGroupGenConfig}
              SKILL_GROUPS={SKILL_GROUPS} handleAiGenerate={ai.handleAiGenerate}
              handleGenerateListening={ai.handleGenerateListening} generatingListening={generatingListening}
              handleGenerateReading={ai.handleGenerateReading} generatingReading={generatingReading}
              handleGenerateOptions={ai.handleGenerateOptions} loadingOptions={loadingOptions}
              groupGenStatus={groupGenStatus} setCurrentStep={setCurrentStep}
            />
          )}
          {currentStep === 3 && (
            <StepBuild
              form={form} setForm={setForm} togglePanel={togglePanel}
              setShowLibrary={setShowLibrary}
              setPreviewResponses={setPreviewResponses} setStudentPreview={setStudentPreview}
              handleAnalyzeLanguageDemand={ai.handleAnalyzeLanguageDemand}
              generatingLangDemand={generatingLangDemand}
              expandedEx={expandedEx} setExpandedEx={setExpandedEx}
              updateExercise={updateExercise} removeExercise={removeExercise}
              moveExercise={moveExercise} saveToLibrary={saveToLibrary}
              exerciseOptions={exerciseOptions} setExerciseOptions={setExerciseOptions}
              addAiExerciseToList={ai.addAiExerciseToList}
              handleAiGenerateByType={ai.handleAiGenerateByType} addExercise={addExercise}
              activePanel={activePanel} setActivePanel={setActivePanel}
              diagnosis={diagnosis} reviewDueCount={reviewDueCount}
              includeReview={includeReview} setIncludeReview={setIncludeReview}
              studentId={studentId} selectedStudentId={selectedStudentId}
              setSelectedStudentId={setSelectedStudentId} student={student} students={students}
              languageDemand={languageDemand} setLanguageDemand={setLanguageDemand}
              saving={saving} handleAssign={handleAssign} libraryExercises={libraryExercises}
              showLibrary={showLibrary} addFromLibrary={addFromLibrary}
              removeFromLibrary={removeFromLibrary}
            />
          )}
        </div>
        <Card className="homework-create-summary">
          <SectionHeader title="Homework Summary" />
          <div className="homework-create-summary-stats">
            <p>Exercises: <strong style={exerciseCount > 10 ? { color: 'var(--danger)' } : {}}>{exerciseCount} / 10</strong></p>
            <p>Est. time: <strong>~{Math.max(5, exerciseCount * 4)} min</strong></p>
          </div>
        </Card>
      </div>
      <Modal open={studentPreview} onClose={() => setStudentPreview(false)} title="Preview: student view" variant="fullscreen">
        <HomeworkStepThrough
          exercises={form.exercises.filter(isStructuredExercise)}
          responses={previewResponses}
          onResponse={(id, updated) => setPreviewResponses(prev => ({ ...prev, [id]: updated }))}
          onSubmit={() => setStudentPreview(false)}
          onSave={() => {}}
          readOnly={true}
        />
      </Modal>
    </div>
  );
}
