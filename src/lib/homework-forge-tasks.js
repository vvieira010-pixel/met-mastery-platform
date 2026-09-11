/**
 * homework-forge-tasks.js — pure helpers for the Homework Forge swarm.
 *
 * Deliberately dependency-free (no JSX, no browser APIs) so the aggregation
 * rules can be unit-tested by the plain `node --test` runner, which cannot
 * parse the `.jsx` modules the orchestrator itself imports.
 *
 * Extracted from swarm-homework-forge.js.
 */

/**
 * Canonical MET task types used when the Architect blueprint omits `taskTypes`.
 *
 * Every entry MUST be a value that `mapAiType()` (lib/exercise-ai-helpers.js)
 * resolves to *itself* — otherwise the fallback silently forges the wrong skill.
 *
 * The previous value was `['reading', 'grammar']`, which was wrong twice over:
 *   mapAiType('reading') -> 'read'    (accidentally fine)
 *   mapAiType('grammar') -> 'short'   (no branch matches; falls through to the
 *                                      writing default)
 * So a blueprint with no task types produced reading + *writing* instead of
 * reading + grammar, and nothing surfaced the substitution.
 *
 * 'read' and 'fix' are both canonical: reading and error-correction, the two
 * MET skills that carry the widest diagnostic value on their own.
 */
export const FALLBACK_TASK_TYPES = ['read', 'fix'];

/**
 * Reduce settled specialist promises to the exercises that were actually forged.
 *
 * Specialists return a per-task result object rather than rejecting, so one
 * exhausted task type cannot discard the others. Previously the batch was awaited
 * with `Promise.all`, so a single failing task type rejected the whole call — a
 * teacher who asked for six MET task types and got five lost all five.
 *
 * `PromiseSettledResult` shape is still honoured because `withSkills()` and the
 * prompt builders can throw outside the inner try/catch.
 *
 * @param {PromiseSettledResult<{taskType: string, exercise?: object, error?: string}>[]} settled
 * @returns {{ exercises: object[], failedTaskTypes: string[], firstError: string }}
 */
export function collectForgedTasks(settled) {
  const exercises = [];
  const failedTaskTypes = [];
  let firstError = '';

  for (const result of Array.isArray(settled) ? settled : []) {
    const value = result?.status === 'fulfilled' ? result.value : null;

    if (value?.exercise) {
      exercises.push(value.exercise);
      continue;
    }

    failedTaskTypes.push(value?.taskType || 'unknown');
    if (!firstError) {
      firstError = value?.error
        || (result?.status === 'rejected' ? result.reason?.message : '')
        || '';
    }
  }

  return { exercises, failedTaskTypes, firstError };
}

/**
 * Build the teacher-facing summary for a partially successful forge run.
 * Returns null when every requested task type was forged.
 *
 * @param {number} requestedCount
 * @param {{ exercises: object[], failedTaskTypes: string[] }} collected
 * @returns {string|null}
 */
export function describePartialForge(requestedCount, collected) {
  const failed = collected?.failedTaskTypes || [];
  if (!failed.length) return null;
  const forged = collected?.exercises?.length || 0;
  return `Generated ${forged} of ${requestedCount} exercises. Could not generate: ${failed.join(', ')}.`;
}
