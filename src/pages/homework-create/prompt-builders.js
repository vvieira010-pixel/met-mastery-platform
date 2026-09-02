import { callAI } from '../../components/shared.jsx';
import { parseAiJson } from '../../lib/ai-helpers.js';
import { withSkills } from '../../education-skills/active-skills.js';
import {
  buildExerciseListPrompt,
  buildHomeworkGroupPrompt,
  buildListeningGeneratorPrompt,
  buildReadingGeneratorPrompt,
  buildRetrievalPracticePrompt,
  buildLanguageDemandPrompt,
} from '../../lib/prompts.js';
import { forgeHomework } from '../../lib/swarm-homework-forge.js';
import { createExercise, getExType } from '../../lib/exercise-types.js';
import { buildCompleteExercises, createCompleteExercise, isStructuredAiExerciseComplete } from '../../lib/exercise-ai-helpers.js';
import { AI_EXERCISE_PROMPTS } from '../../lib/exercise-ai-prompts.js';
import { saveExerciseToLibrary } from '../../lib/exercise-library.js';
import { generateExerciseImage } from '../../lib/image-generation.js';
import { generateId, generateShortId } from '../../lib/utils.js';

const AI_OPTS = {};

export function useHomeworkAI(scope) {
  const {
    form, setForm, diagnosis, student,
    selectedLevel,
    setExpandedEx, setLibVersion,
    groupGenConfig, setGroupGenStatus,
    setGenerating, setGeneratingListening, setGeneratingReading,
    setLoadingOptions, setExerciseOptions, setActivePanel,
    setGeneratingRetrieval, setGeneratingLangDemand, setLanguageDemand,
    setTopicExplanations,
    selectedSkill,
  } = scope;

  async function handleGenerateByGroups() {
    const selectedGroups = Object.entries(groupGenConfig).filter(([, count]) => count > 0);
    if (selectedGroups.length === 0) {
      window.toast?.('Select at least one skill group.', 'warn');
      return;
    }
    setGenerating(true);
    setGroupGenStatus('');
    const allGenerated = [];
    for (const [index, [group, count]] of selectedGroups.entries()) {
      setGroupGenStatus(`Generating ${group} exercises (${index + 1}/${selectedGroups.length})…`);
      try {
        const prompt = buildHomeworkGroupPrompt({ student, diagnosis, group, count: Number(count) });
        const data = await callAI(prompt, await withSkills('exercise', { ...AI_OPTS, max_tokens: 3500, temperature: 0.8 }));
        const raw = data?.content?.map(b => b.text || '').join('') || '';
        const parsed = parseAiJson(raw);
        const items = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.exercises) ? parsed.exercises : []);
        const { exercises, skipped } = buildCompleteExercises(items, { defaultSkillGroup: group });
        allGenerated.push(...exercises);
        window.toast?.(`${group.charAt(0).toUpperCase() + group.slice(1)}: ${exercises.length} complete exercises generated${skipped ? `, ${skipped} skipped` : ''}.`, exercises.length ? 'ok' : 'warn');
      } catch (e) {
        window.toast?.(`${group} exercises failed: ${e.message}`, 'warn');
      }
    }
    if (allGenerated.length > 0) {
      setForm(f => ({ ...f, exercises: [...f.exercises, ...allGenerated] }));
      setExpandedEx(allGenerated[0].id);
      for (const ex of allGenerated) {
        try { await saveExerciseToLibrary(ex); } catch {}
      }
      setLibVersion(v => v + 1);
    }
    setGroupGenStatus('');
    setActivePanel(null);
    setGenerating(false);
    window.toast?.(`${allGenerated.length} complete exercises added across ${selectedGroups.length} skill groups.`, allGenerated.length ? 'ok' : 'warn');
  }

  async function handleGenerateListening() {
    if (!diagnosis) {
      window.toast?.('Link a diagnosis first.', 'warn');
      return;
    }
    setGeneratingListening(true);
    setGroupGenStatus('Creating listening script…');
    try {
      const prompt = buildListeningGeneratorPrompt({ student, diagnosis });
      const data = await callAI(prompt, await withSkills('exercise', { ...AI_OPTS, max_tokens: 2500, temperature: 0.8 }));
      const parsed = parseAiJson(data.content?.map(b => b.text || '').join('') || '');
      if (!parsed || parsed.type !== 'listen') throw new Error('AI returned invalid listening task.');
      const fresh = createExercise('listen');
      const listeningId = generateId('ex_');
      const listeningEx = { ...fresh, ...parsed, id: listeningId };
      setForm(f => ({ ...f, exercises: [...f.exercises, listeningEx] }));
      setExpandedEx(listeningEx.id);
      try { await saveExerciseToLibrary(listeningEx); setLibVersion(v => v + 1); } catch {}
      window.toast?.(`Listening task generated successfully!`, 'ok');
      if (listeningEx.pictureHint) {
        window.toast?.('Generating image for listening task…', 'info');
        generateExerciseImage(listeningEx.pictureHint).then(url => {
          if (url) {
            setForm(f => ({
              ...f,
              exercises: f.exercises.map(ex =>
                ex.id === listeningEx.id ? { ...ex, pictureHint: url } : ex
              )
            }));
          }
        });
      }
    } catch (e) {
      window.toast?.(`Listening generation failed: ${e.message}`, 'warn');
    }
    setGroupGenStatus('');
    setGeneratingListening(false);
  }

  async function handleGenerateReading() {
    setGeneratingReading(true);
    setGroupGenStatus('Creating reading passage…');
    try {
      const prompt = buildReadingGeneratorPrompt({ student, diagnosis, questionCount: 3 });
      const data = await callAI(prompt, await withSkills('exercise', { ...AI_OPTS, max_tokens: 2500, temperature: 0.8 }));
      const parsed = parseAiJson(data.content?.map(b => b.text || '').join('') || '');
      if (!parsed || parsed.type !== 'read') throw new Error('AI returned invalid reading task.');
      const fresh = createExercise('read');
      const readId = generateId('ex_');
      const readEx = {
        ...fresh,
        ...parsed,
        questions: (parsed.questions || []).map(q => ({
          id: generateShortId('rq_'),
          question: q.question || '',
          options: (q.options || ['', '', '', '']).slice(0, 4),
          correct: typeof q.correct === 'number' ? q.correct : null,
          explanation: q.explanation || '',
        })),
        id: readId,
      };
      setForm(f => ({ ...f, exercises: [...f.exercises, readEx] }));
      setExpandedEx(readEx.id);
      try { await saveExerciseToLibrary(readEx); setLibVersion(v => v + 1); } catch {}
      window.toast?.('Reading exercise generated!', 'ok');
    } catch (e) {
      window.toast?.(`Reading generation failed: ${e.message}`, 'warn');
    }
    setGroupGenStatus('');
    setGeneratingReading(false);
  }

  async function handleAiGenerate() {
    if (!diagnosis) {
      window.toast?.('Link a diagnosis first.', 'warn');
      return;
    }
    setGenerating(true);
    try {
      const result = await forgeHomework({ student, diagnosis, onProgress: (msg) => setGroupGenStatus(msg) });
      setForm(f => ({
        ...f,
        title: result.title,
        objective: result.objective,
        description: result.description,
        exercises: result.exercises,
        selfCheck: result.selfCheck,
        teacherNotes: result.teacherNotes,
        skillType: result.taskTypes?.[0] || f.skillType,
      }));
      setExpandedEx(result.exercises[0]?.id);
      for (const ex of result.exercises) {
        try { await saveExerciseToLibrary(ex); } catch {}
      }
      setLibVersion(v => v + 1);
      window.toast?.(`MET Homework forged: ${result.exercises.length} validated exercises.`, 'ok');
    } catch (e) {
      window.toast?.(`Forge failed: ${e.message}`, 'error');
    } finally {
      setGroupGenStatus('');
      setGenerating(false);
    }
  }

  async function handleGenerateOptions() {
    if (!diagnosis) { window.toast?.('No diagnosis linked. Cannot generate exercises.', 'warn'); return; }
    setLoadingOptions(true);
    setExerciseOptions([]);
    try {
      const prompt = buildExerciseListPrompt({ student, diagnosis, level: selectedLevel, skill: selectedSkill });
      const data = await callAI(prompt, await withSkills('exercise', { ...AI_OPTS, max_tokens: 5000, temperature: 0.8 }));
      const raw = data.content?.map(b => b.text || '').join('') || '';
      const parsed = parseAiJson(raw);
      const list = Array.isArray(parsed) ? parsed : parsed.exercises || [];
      const { exercises, skipped } = buildCompleteExercises(list);
      setExerciseOptions(exercises);
      if (exercises.length === 0) window.toast?.('No complete exercises returned. Try again.', 'warn');
      else window.toast?.(`${exercises.length} complete suggestions ready${skipped ? `, ${skipped} skipped` : ''}.`, 'ok');
    } catch (e) {
      window.toast?.(`Exercise generation failed: ${e.message}`, 'warn');
    }
    setLoadingOptions(false);
  }

  async function handleGenerateRetrieval() {
    const topic = form.objective || getPriorityItems(diagnosis)?.[0]?.whatToImprove || '';
    if (!topic) {
      window.toast?.('Add an objective or link a diagnosis first.', 'warn');
      return;
    }
    setGeneratingRetrieval(true);
    const level = selectedLevel || student?.currentLevel || 'B1';
    const prompt = buildRetrievalPracticePrompt({ topic, studentLevel: level, questionCount: 5 });
    try {
      const data = await callAI(prompt, await withSkills('exercise', { ...AI_OPTS, max_tokens: 2000 }));
      const raw = data.content?.map(b => b.text || '').join('') || '';
      const parsed = parseAiJson(raw);
      if (!parsed?.questions?.length) throw new Error('No questions returned');
      const exercises = parsed.questions.map(q => {
        const base = { id: Math.random().toString(36).slice(2, 9), focus: 'retrieval' };
        if (q.type === 'mcq') {
          return { ...base, type: 'mcq', question: q.question || '', options: (q.options || []).slice(0, 4), correct: typeof q.correct === 'number' ? q.correct : 0, explanation: q.explanation || '' };
        }
        if (q.type === 'blank') {
          return { ...base, type: 'blank', template: q.template || '', blanks: Array.isArray(q.blanks) ? q.blanks : [] };
        }
        return { ...base, type: 'short', prompt: q.prompt || '', rubric: q.rubric || 'Recall the key points accurately.', targetWords: q.targetWords || 40 };
      }).filter(ex => isStructuredAiExerciseComplete(ex));
      const spacingNote = parsed.spacing_recommendation ? `\nRetrieval spacing: ${parsed.spacing_recommendation}` : '';
      setForm(f => ({ ...f, exercises: [...f.exercises, ...exercises], teacherNotes: (f.teacherNotes || '') + spacingNote }));
      for (const ex of exercises) {
        try { await saveExerciseToLibrary(ex); } catch {}
      }
      setLibVersion(v => v + 1);
      window.toast?.(`Added ${exercises.length} retrieval practice question${exercises.length !== 1 ? 's' : ''}.`, 'ok');
    } catch (e) {
      window.toast?.(`Retrieval generation failed: ${e.message}`, 'warn');
    }
    setGeneratingRetrieval(false);
  }

  async function handleAnalyzeLanguageDemand() {
    if (!form.exercises.length) {
      window.toast?.('Add some exercises first.', 'warn');
      return;
    }
    setGeneratingLangDemand(true);
    const level = selectedLevel || student?.currentLevel || 'B1';
    const prompt = buildLanguageDemandPrompt({ exercises: form.exercises, studentLevel: level, objective: form.objective });
    try {
      const data = await callAI(prompt, { ...AI_OPTS, max_tokens: 1200 });
      const raw = data.content?.map(b => b.text || '').join('') || '';
      const parsed = parseAiJson(raw);
      if (!parsed?.priority_actions) throw new Error('Invalid response');
      setLanguageDemand(parsed);
      window.toast?.('Language demand analysis complete.', 'ok');
    } catch (e) {
      window.toast?.(`Language demand analysis failed: ${e.message}`, 'warn');
    }
    setGeneratingLangDemand(false);
  }

  async function handleAiGenerateByType(typeId, level) {
    const prompt = AI_EXERCISE_PROMPTS[typeId];
    if (!prompt) { window.toast?.('No AI prompt for this type.', 'warn'); return; }
    const context = form.objective ? ` The student's homework goal is: ${form.objective}.` : '';
    const fullPrompt = prompt + context + ` Level: ${level || selectedLevel || 'B1'}.`;
    try {
      const data = await callAI(fullPrompt, await withSkills('exercise', { ...AI_OPTS, max_tokens: 1500, temperature: 0.7 }));
      const raw = data?.content?.map(b => b.text || '').join('') || '';
      const parsed = parseAiJson(raw);
      if (!parsed || !parsed.type) throw new Error('AI returned invalid exercise');
      const exercise = createCompleteExercise(parsed, { defaultSkillGroup: typeId });
      if (!exercise) throw new Error('AI output was incomplete');
      exercise.aiGenerated = true;
      setForm(f => ({ ...f, exercises: [...f.exercises, exercise] }));
      setExpandedEx(exercise.id);
      window.toast?.(`${getExType(typeId)?.label || typeId} generated.`, 'ok');
    } catch (e) {
      window.toast?.(`AI generate failed: ${e.message}`, 'warn');
    }
  }

  async function handleTopicAiGenerate(topic) {
    if (!topic?.title) { window.toast?.('Add a title first.', 'warn'); return; }
    const level = selectedLevel || 'B1';
    const defaultPrompt = `You are a qualified English teacher creating a topic explanation for a MET student at ${level}.

Topic: "${topic.title}"

Requirements:
- Include at least one common error or misconception students make with this topic, and how to avoid it
- Include a usage note about when NOT to use this form, or a common exception to the rule
- Keep vocabulary at ${level} or below; define any new terms in simpler language
- Average max 18 words per sentence
- Language must be natural and teacher-like, not textbook

Format:
- 2-4 short paragraphs with **bold** for key terms
- Use - for bullet points where helpful`;
    const prompt = topic.aiPrompt?.trim() || defaultPrompt;
    try {
      const data = await callAI(prompt, { ...AI_OPTS, max_tokens: 800 });
      const text = data?.content?.map(b => b.text || '').join('') || '';
      const content = text.replace(/^["']|["']$/g, '').trim();
      setTopicExplanations(prev => prev.map(t => t.id === topic.id ? { ...t, content } : t));
      window.toast?.('Topic explanation generated.', 'ok');
    } catch (e) {
      window.toast?.(`Generation failed: ${e.message}`, 'warn');
    }
  }

  async function addAiExerciseToList(ex) {
    const newEx = createCompleteExercise(ex);
    if (!newEx) {
      window.toast?.('That suggestion is incomplete, so it was not added.', 'warn');
      return;
    }
    newEx.aiGenerated = true;
    setForm(f => ({ ...f, exercises: [...f.exercises, newEx] }));
    setExpandedEx(newEx.id);
    try { await saveExerciseToLibrary(newEx); setLibVersion(v => v + 1); } catch {}
    window.toast?.(`"${newEx.title || 'Exercise'}" added.`, 'ok');
  }

  function getPriorityItems(dx) {
    return Array.isArray(dx?.priorityDiagnosis)
      ? dx.priorityDiagnosis
      : Array.isArray(dx?.sections?.priorityDiagnosis?.content)
        ? dx.sections.priorityDiagnosis.content
        : [];
  }

  return {
    handleGenerateByGroups,
    handleGenerateListening,
    handleGenerateReading,
    handleAiGenerate,
    handleGenerateOptions,
    handleGenerateRetrieval,
    handleAnalyzeLanguageDemand,
    handleAiGenerateByType,
    handleTopicAiGenerate,
    addAiExerciseToList,
  };
}
