import { callAI } from '../components/shared.jsx';
import { withSkills } from '../education-skills/active-skills.js';
import { parseAiJson } from '../lib/ai-helpers.js';
import { 
  buildHomeworkBlueprintPrompt, 
  buildTaskGeneratorPrompt, 
  buildFinalRefinementPrompt 
} from './prompts.js';

/**
 * The Homework Forge Swarm Orchestrator
 * Implements a Hierarchical Topology: Architect -> Specialists -> Auditor -> Synthesizer
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
    if (onProgress) onProgress(`Specialists are forging ${blueprint.taskTypes.length} MET-style exercises...`);
    
    const taskPromises = (blueprint.taskTypes || ['reading', 'grammar']).map(async (taskType) => {
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
                return candidate;
              }
              lastError = audit?.feedback || 'Audit review flagged item';
            } catch {
              // If auditor times out or fails, accept candidate
              return candidate;
            }
          }
        } catch (genErr) {
          lastError = genErr.message || 'Generation error';
        }
      }
      
      if (bestCandidate) return bestCandidate;
      throw new Error(`Task ${taskType} generation failed: ${lastError || 'No valid exercise generated'}`);
    });

    const validatedTasks = await Promise.all(taskPromises);

    // 4. SYNTHESIZER PHASE: Final Polish
    if (onProgress) onProgress('Synthesizer is polishing the final set...');
    const refPrompt = buildFinalRefinementPrompt({ student, blueprint, tasks: validatedTasks });
    const refData = await callAI(refPrompt, await withSkills('homework', HOMEWORK_AI_OPTIONS));
    const refinement = parseAiJson(refData.content?.map(b => b.text || '').join('') || '');

    return {
      title: blueprint.title,
      objective: blueprint.objective,
      description: refinement?.instructions || '',
      exercises: validatedTasks,
      selfCheck: refinement?.selfCheck || [],
      teacherNotes: refinement?.teacherNotes || '',
      taskTypes: blueprint.taskTypes
    };

  } catch (e) {
    console.error('[HomeworkForge] Swarm error:', e);
    throw e;
  }
}
