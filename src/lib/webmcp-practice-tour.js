import { useEffect, useRef, useState } from 'react';

export const PRACTICE_TOUR_WORKFLOW = 'start_grammar_practice';

export const PRACTICE_TOUR_TARGETS = [
  {
    id: 'practice-navigation',
    label: 'Practice navigation',
    description: 'Opens the student Practice Studio without starting or submitting work.',
    step: 1,
  },
  {
    id: 'practice-skill-grammar',
    label: 'Grammar Sprint',
    description: 'Lets the learner choose the Grammar Sprint practice set.',
    step: 2,
  },
  {
    id: 'practice-session',
    label: 'Practice session',
    description: 'The learner reads and answers the first grammar exercise themselves.',
    step: 3,
  },
];

const TOOL_PREFIX = 'met_practice_tour_';
const EMPTY_SCHEMA = { type: 'object', properties: {} };

function result(value) {
  return JSON.stringify(value);
}

function getRegistry() {
  if (typeof window === 'undefined') return null;
  window.__metMasteryWebMcpTour ??= { registered: new Set(), handlers: {} };
  return window.__metMasteryWebMcpTour;
}

function getModelContext() {
  if (typeof document === 'undefined') return null;
  return document.modelContext ?? null;
}

function targetVisibility(targetId) {
  return [...document.querySelectorAll(`[data-tour-target="${targetId}"]`)].some(target => {
    const rect = target.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
  });
}

function createTools(registry) {
  return [
    {
      name: `${TOOL_PREFIX}list_targets`,
      description: 'List stable, semantic targets for the student Grammar Sprint guided tour. This tool only reads UI metadata.',
      inputSchema: EMPTY_SCHEMA,
      annotations: { readOnlyHint: true },
      execute: async () => result(registry.handlers.listTargets?.() ?? { available: false }),
    },
    {
      name: `${TOOL_PREFIX}read_state`,
      description: 'Read the current student Practice Studio tour state. This tool does not navigate or change practice work.',
      inputSchema: EMPTY_SCHEMA,
      annotations: { readOnlyHint: true },
      execute: async () => result(registry.handlers.readState?.() ?? { available: false }),
    },
    {
      name: `${TOOL_PREFIX}read_instructions`,
      description: 'Read the instructions for guiding a learner to start a Grammar Sprint. The learner must perform all workflow actions.',
      inputSchema: EMPTY_SCHEMA,
      annotations: { readOnlyHint: true },
      execute: async () => result(registry.handlers.readInstructions?.() ?? { available: false }),
    },
    {
      name: `${TOOL_PREFIX}highlight_target`,
      description: 'Highlight one semantic tour target with a short explanation. This is visual guidance only and never clicks or changes the workflow.',
      inputSchema: {
        type: 'object',
        properties: { targetId: { type: 'string', enum: PRACTICE_TOUR_TARGETS.map(target => target.id) } },
        required: ['targetId'],
      },
      annotations: { readOnlyHint: false },
      execute: async ({ targetId }) => result(registry.handlers.highlightTarget?.(targetId) ?? { available: false }),
    },
    {
      name: `${TOOL_PREFIX}dismiss_highlight`,
      description: 'Dismiss the current guided-tour highlight. This only removes visual guidance.',
      inputSchema: EMPTY_SCHEMA,
      annotations: { readOnlyHint: false },
      execute: async () => result(registry.handlers.dismissHighlight?.() ?? { available: false }),
    },
    {
      name: `${TOOL_PREFIX}wait_for_state_change`,
      description: 'Wait for the learner to act, then return the changed Practice Studio state. This tool never performs the action.',
      inputSchema: {
        type: 'object',
        properties: {
          afterRevision: { type: 'number', minimum: 0 },
          timeoutMs: { type: 'number', minimum: 250, maximum: 30000 },
        },
        required: ['afterRevision'],
      },
      annotations: { readOnlyHint: true },
      execute: async ({ afterRevision, timeoutMs = 15000 }, { signal } = {}) => result(await registry.handlers.waitForStateChange?.(afterRevision, timeoutMs, signal) ?? { available: false }),
    },
  ];
}

export function useWebMcpPracticeTour({ state }) {
  const [highlight, setHighlight] = useState(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const registry = getRegistry();
    const modelContext = getModelContext();
    if (!registry || !modelContext?.registerTool) return undefined;

    registry.handlers = {
      listTargets: () => ({ workflow: PRACTICE_TOUR_WORKFLOW, targets: PRACTICE_TOUR_TARGETS.map(target => ({ ...target, visible: targetVisibility(target.id) })) }),
      readState: () => stateRef.current,
      readInstructions: () => ({
        workflow: PRACTICE_TOUR_WORKFLOW,
        goal: 'Help the learner start a Grammar Sprint without answering, submitting, or changing any practice work for them.',
        steps: [
          { targetId: 'practice-navigation', instruction: 'Ask the learner to open Practice, then wait for them to do it.' },
          { targetId: 'practice-skill-grammar', instruction: 'Ask the learner to choose Grammar Sprint, then wait for them to do it.' },
          { targetId: 'practice-session', instruction: 'Confirm that the first grammar exercise is ready. The learner completes it themselves.' },
        ],
        constraints: ['Tour tools only read state or control the highlight.', 'Do not invoke application action tools for this workflow.', 'Respect the current authenticated student session and permissions.'],
      }),
      highlightTarget: (targetId) => {
        const target = PRACTICE_TOUR_TARGETS.find(item => item.id === targetId);
        if (!target) return { ok: false, reason: 'Unknown tour target.' };
        const visible = targetVisibility(targetId);
        setHighlight({ ...target, visible });
        return { ok: true, target, visible, message: visible ? target.description : 'This target is not visible in the current UI state. Ask the learner to complete the current step, then read state again.' };
      },
      dismissHighlight: () => {
        setHighlight(null);
        return { ok: true };
      },
      waitForStateChange: (afterRevision, timeoutMs, signal) => new Promise(resolve => {
        const deadline = Date.now() + Math.min(Math.max(timeoutMs, 250), 30000);
        const check = () => {
          const next = stateRef.current;
          if (next.revision !== afterRevision || Date.now() >= deadline || signal?.aborted) {
            resolve({ changed: next.revision !== afterRevision, canceled: Boolean(signal?.aborted), state: next });
            return;
          }
          window.setTimeout(check, 200);
        };
        check();
      }),
    };

    for (const tool of createTools(registry)) {
      if (registry.registered.has(tool.name)) continue;
      registry.registered.add(tool.name);
      modelContext.registerTool(tool).catch(() => registry.registered.delete(tool.name));
    }

    return () => {
      registry.handlers = {};
    };
  }, []);

  return { highlight, dismissHighlight: () => setHighlight(null) };
}
