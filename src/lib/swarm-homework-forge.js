import { callAI } from '../components/shared.jsx';
import { withSkills } from '../education-skills/active-skills.js';
import { parseAiJson } from '../lib/ai-helpers.js';
import {
  buildHomeworkBlueprintPrompt,
  buildTaskGeneratorPrompt,
  buildFinalRefinementPrompt
} from './prompts.js';
import {
  FALLBACK_TASK_TYPES,
  collectForgedTasks,
  describePartialForge,
} from './homework-forge-tasks.js';

// Re-exported so callers and tests can reach the canonical fallback list without
// importing the orchestrator (which pulls in .jsx modules).
export { FALLBACK_TASK_TYPES, collectForgedTasks };

/**
 * The Homework Forge Swarm Orchestrator
 * Implements a Hierarchical Topology: Architect -> Specialists -> Auditor -> Synthesizer
 *
 * Degradation contract:
 *   - Architect fails            -> throws (there is no set to build without a blueprint)
 *   - some Specialists fail      -> ships the exercises that succeeded
 *   - all Specialists fail       -> throws
 *   - Auditor fails or times out -> accepts the candidate unvalidated (fail-open)
 *   - Synthesizer fails          -> ships the validated exercises without polish
 */
export async function forgeHomework(params) {
  const { student, diagnosis, onProgress } = params;
  const HOMEWORK_AI_OPTIONS = { max_tokens: 2500, temperature: 0.7 };

  try {
    // 1. ARCHITECT PHASE: Create the Strategic Map
    if (onProgress) onProgress('Architect is mapping the lesson strategy...');
    const bpPrompt = buildHomeworkBlueprintPrompt({ student, diagnosis });
    const bpData = await callAI(bpPrompt, await withSkills('homework', HOMEWORK_AI_OPTIONS));
    const blueprint = parseAiJson(bpData.content?.map(b => b.text || '').join('') || '');

    if (!blueprint || !blueprint.taskTypes) throw new Error('Architect failed to create a valid blueprint.');

    // 2. SPECIALIST PHASE: Parallel Forging
    const requestedTypes = blueprint.taskTypes.length ? blueprint.taskTypes : FALLBACK_TASK_TYPES;
    if (onProgress) onProgress(`Specialists are forging ${requestedTypes.length} MET-style exercises...`);

    const taskPromises = requestedTypes.map(async (taskType) => {
      let attempts = 0;
      let lastError = '';
      let bestCandidate = null;

      while (attempts < 2) {
        attempts++;

        // Generate Candidate
        try {
          const genPrompt = buildTaskGeneratorPrompt({
            student,
            diagnosis,
            taskBlueprint: blueprint,
            taskType
          });
          const genData = await callAI(genPrompt, await withSkills('exercise', HOMEWORK_AI_OPTIONS));
          const candidate = parseAiJson(genData.content?.map(b => b.text || '').join('') || '');

          if (candidate && (candidate.instructions || candidate.prompt || candidate.items || candidate.passage)) {
            bestCandidate = candidate;

            // 3. AUDITOR PHASE: Quality Gate
            try {
              const auditorPrompt = `You are the MET Quality Auditor. 
Review this candidate ${taskType} exercise for the MET exam.

Candidate: ${JSON.stringify(candidate)}

Check for:
1. Ambiguity: Is the correct answer definitively correct?
2. Naturalness: Does it sound like a real MET exam item?
3. Alignment: Does it target: ${blueprint.objective}?

Return JSON: { "pass": true, "feedback": "ok" }`;

              const auditData = await callAI(auditorPrompt, { max_tokens: 300, temperature: 0.2 });
              const audit = parseAiJson(auditData.content?.map(b => b.text || '').join('') || '');

              if (audit?.pass !== false) {
                return { taskType, exercise: candidate };
              }
              lastError = audit?.feedback || 'Audit review flagged item';
            } catch {
              // If auditor times out or fails, accept candidate
              return { taskType, exercise: candidate };
            }
          }
        } catch (genErr) {
          lastError = genErr.message || 'Generation error';
        }
      }

      // Exhausted both attempts. Return the failure instead of throwing so the
      // other task types in this batch survive.
      if (bestCandidate) return { taskType, exercise: bestCandidate };
      return { taskType, error: lastError || 'No valid exercise generated' };
    });

    const settled = await Promise.allSettled(taskPromises);
    const { exercises: validatedTasks, failedTaskTypes, firstError } = collectForgedTasks(settled);

    if (validatedTasks.length === 0) {
      throw new Error(
        `No MET exercises could be generated for: ${requestedTypes.join(', ')}.${firstError ? ` ${firstError}` : ''}`,
      );
    }

    const partialNote = describePartialForge(requestedTypes.length, { exercises: validatedTasks, failedTaskTypes });
    if (partialNote) {
      console.warn(`[HomeworkForge] partial set — ${partialNote}`);
      if (onProgress) onProgress(partialNote);
    }

    // 4. SYNTHESIZER PHASE: Final Polish
    // The exercises are already validated at this point, so a failed polish pass
    // must not discard them. `refinement` is read with optional chaining below,
    // which makes null a safe value.
    if (onProgress) onProgress('Synthesizer is polishing the final set...');
    let refinement = null;
    try {
      const refPrompt = buildFinalRefinementPrompt({ student, blueprint, tasks: validatedTasks });
      const refData = await callAI(refPrompt, await withSkills('homework', HOMEWORK_AI_OPTIONS));
      refinement = parseAiJson(refData.content?.map(b => b.text || '').join('') || '');
    } catch (synthErr) {
      console.warn('[HomeworkForge] Synthesizer failed, shipping validated exercises without polish:', synthErr.message);
    }

    return {
      title: blueprint.title,
      objective: blueprint.objective,
      description: refinement?.instructions || '',
      exercises: validatedTasks,
      selfCheck: refinement?.selfCheck || [],
      teacherNotes: refinement?.teacherNotes || '',
      taskTypes: blueprint.taskTypes,
      skippedTaskTypes: failedTaskTypes,
      partialNote,
    };

  } catch (e) {
    console.error('[HomeworkForge] Swarm error:', e);
    throw e;
  }
}
