/**
 * feedback-form.js — rules for the user-facing feedback form.
 *
 * Kept framework-free on purpose: the React component renders, this module
 * decides. That makes the required-field rules, the rating scale and the
 * payload shape unit-testable without a DOM.
 */

export const FEEDBACK_CATEGORIES = [
  { value: 'lesson', label: 'Lesson or class', hint: 'Pace, explanations, activities' },
  { value: 'homework', label: 'Homework', hint: 'Instructions, difficulty, feedback' },
  { value: 'practice', label: 'Practice and exercises', hint: 'Question quality, variety' },
  { value: 'platform', label: 'The platform itself', hint: 'Bugs, layout, speed' },
  { value: 'progress', label: 'My progress', hint: 'Scores, goals, next steps' },
  { value: 'other', label: 'Something else', hint: 'Anything not listed above' },
];

export const RATING_OPTIONS = [
  { value: 1, label: 'Poor', description: '1 — Poor' },
  { value: 2, label: 'Fair', description: '2 — Fair' },
  { value: 3, label: 'OK', description: '3 — OK' },
  { value: 4, label: 'Good', description: '4 — Good' },
  { value: 5, label: 'Excellent', description: '5 — Excellent' },
];

export const COMMENT_MIN_LENGTH = 10;
export const COMMENT_MAX_LENGTH = 1000;

/** Order used for error messages, focus order and the error summary. */
export const FIELD_ORDER = ['category', 'rating', 'comments'];

export function createEmptyFeedback(overrides = {}) {
  return { category: '', rating: 0, comments: '', ...overrides };
}

/** Coerce anything (localStorage draft, DB row) into a safe form value. */
export function normalizeFeedback(values = {}) {
  const rating = Number(values.rating);
  return {
    category: typeof values.category === 'string' ? values.category : '',
    rating: Number.isFinite(rating) ? Math.trunc(rating) : 0,
    comments: typeof values.comments === 'string' ? values.comments : '',
  };
}

export function validateFeedback(values = {}, { categories = FEEDBACK_CATEGORIES } = {}) {
  const { category, rating, comments } = normalizeFeedback(values);
  const trimmed = comments.trim();
  const errors = {};

  if (!category) {
    errors.category = 'Choose what your feedback is about.';
  } else if (!categories.some(option => option.value === category)) {
    errors.category = 'Choose one of the listed categories.';
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Pick a rating from 1 to 5.';
  }

  if (!trimmed) {
    errors.comments = 'Add a comment so we know what to change.';
  } else if (trimmed.length < COMMENT_MIN_LENGTH) {
    errors.comments = `Add a little more detail — at least ${COMMENT_MIN_LENGTH} characters.`;
  } else if (trimmed.length > COMMENT_MAX_LENGTH) {
    errors.comments = `Shorten your comment to ${COMMENT_MAX_LENGTH} characters or fewer.`;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    // `comments` comes back trimmed so callers submit exactly what was validated.
    values: { category, rating, comments: trimmed },
  };
}

export function categoryLabel(value, categories = FEEDBACK_CATEGORIES) {
  return categories.find(option => option.value === value)?.label || '';
}

export function ratingLabel(value) {
  return RATING_OPTIONS.find(option => option.value === Number(value))?.description || '';
}

/** Remaining characters, never negative. */
export function remainingCharacters(comments = '') {
  return Math.max(0, COMMENT_MAX_LENGTH - String(comments || '').length);
}

/**
 * Shape the submission for the inbox. `body` stays human-readable so the
 * teacher inbox can render the message even if it never learns about
 * `category`/`rating`.
 */
export function buildFeedbackMessage(values, { fromStudentId, fromName, fromRole = 'student', toRole = 'teacher' } = {}) {
  const { category, rating, comments } = normalizeFeedback(values);
  const label = categoryLabel(category) || 'General feedback';
  return {
    fromStudentId: fromStudentId || null,
    fromName: fromName || 'Student',
    fromRole,
    toRole,
    type: 'platform-feedback',
    category,
    rating,
    comments: comments.trim(),
    body: `${label} · ${ratingLabel(rating) || 'No rating'} — ${comments.trim()}`,
  };
}
