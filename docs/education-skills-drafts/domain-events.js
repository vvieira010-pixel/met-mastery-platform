/**
 * Domain Event Infrastructure
 * 
 * Standardized event schema and publish/subscribe pattern for all bounded contexts.
 * Enables CQRS, temporal debugging, cross-domain reactivity, and auditability.
 * 
 * Event schema: { id, type, aggregateId, timestamp, payload }
 *  - id: UUID v4 string
 *  - type: string (e.g., 'HintSequenceStarted')
 *  - aggregateId: string (e.g., student-problem identifier)
 *  - timestamp: ISO 8601 string
 *  - payload: domain-specific data object
 */

const EventType = {
  // ai-learning-science
  HINT_SEQUENCE_STARTED: 'HintSequenceStarted',
  HINT_REVEALED: 'HintRevealed',
  FADING_ADJUSTED: 'FadingAdjusted',
  SESSION_COMPLETED: 'SessionCompleted',
  ASSESSMENT_SCORED: 'AssessmentScored',

  // student-learning
  SESSION_LOGGED: 'SessionLogged',
  FADING_ADJUSTED: 'FadingAdjusted',
  RETRIEVAL_ATTEMPTED: 'RetrievalAttempted',

  // curriculum-assessment
  PLAN_CREATED: 'PlanCreated',
  RUBRIC_GENERATED: 'RubricGenerated',
  STANDARD_MAPPED: 'StandardMapped',
  GAP_IDENTIFIED: 'GapIdentified',

  // wellbeing-motivation-agency
  MOTIVATION_SESSION_LOGGED: 'MotivationSessionLogged',
  STATE_CHANGED: 'StateChanged',
  DISENGAGEMENT_DETECTED: 'DisengagementDetected',
  GOAL_SET: 'GoalSet',
  SCAFFOLD_ADJUSTED: 'ScaffoldAdjusted',

  // historical-thinking
  TASK_CREATED: 'TaskCreated',
  PHASE_ADVANCED: 'PhaseAdvanced',
  SOURCE_EVALUATED: 'SourceEvaluated',
  BIAS_DETECTED: 'BiasDetected',
  ARGUMENT_CONSTRUCTED: 'ArgumentConstructed',
  TASK_COMPLETED: 'TaskCompleted'
};

let subscribers = {};

/**
 * Subscribe to a specific event type
 * @param {string} eventType - EventType enum value
 * @param {Function} handler - (event) => void
 * @returns {Function} Unsubscribe function
 */
function subscribe(eventType, handler) {
  if (!subscribers[eventType]) {
    subscribers[eventType] = [];
  }
  subscribers[eventType].push(handler);
  return () => {
    subscribers[eventType] = subscribers[eventType].filter(h => h !== handler);
  };
}

/**
 * Publish an event to all subscribed handlers
 * @param {Object} event - { id, type, aggregateId, timestamp, payload }
 * @returns {Promise<void>}
 */
async function publish(event) {
  const type = event.type;
  const handlers = subscribers[type] || [];

  for (const handler of handlers) {
    try {
      const result = handler(event);
      if (result && result.then) {
        await result;
      }
    } catch (error) {
      console.error(`Domain event handler failed for ${type}:`, error);
    }
  }
}

/**
 * Generate a standardized domain event
 * @param {string} type - EventType enum value
 * @param {string} aggregateId - The aggregate identifier (e.g., studentId-problemId)
 * @param {Object} payload - Domain-specific data
 * @param {number} [timestamp] - ISO timestamp; defaults to now
 * @returns {Object} Standardized event object
 */
function makeEvent(type, aggregateId, payload, timestamp) {
  return {
    id: crypto.randomUUID(),
    type,
    aggregateId,
    timestamp: timestamp || new Date().toISOString(),
    payload
  };
}

export {
  EventType,
  subscribe,
  publish,
  makeEvent
};