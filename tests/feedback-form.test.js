import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  COMMENT_MAX_LENGTH,
  COMMENT_MIN_LENGTH,
  buildFeedbackMessage,
  normalizeFeedback,
  remainingCharacters,
  validateFeedback,
} from '../src/domain/feedback/feedback-form.js';

const root = path.resolve(import.meta.dirname, '..');
const component = fs.readFileSync(path.join(root, 'src', 'components', 'FeedbackForm.jsx'), 'utf8');
const stylesheet = fs.readFileSync(path.join(root, 'src', 'styles', 'feedback-form.css'), 'utf8');
const settings = fs.readFileSync(path.join(root, 'src', 'pages', 'student-settings.jsx'), 'utf8');

const valid = { category: 'lesson', rating: 4, comments: 'The pacing was great today.' };

test('empty feedback fails on all three required fields', () => {
  const { errors, isValid } = validateFeedback({});
  assert.equal(isValid, false);
  assert.ok(errors.category);
  assert.ok(errors.rating);
  assert.ok(errors.comments);
});

test('each field is reported independently', () => {
  assert.deepEqual(Object.keys(validateFeedback({ ...valid, category: '' }).errors), ['category']);
  assert.deepEqual(Object.keys(validateFeedback({ ...valid, rating: 0 }).errors), ['rating']);
  assert.deepEqual(Object.keys(validateFeedback({ ...valid, rating: 6 }).errors), ['rating']);
  assert.deepEqual(Object.keys(validateFeedback({ ...valid, comments: '   ' }).errors), ['comments']);
});

test('comments enforce a minimum and a maximum length', () => {
  const short = validateFeedback({ ...valid, comments: 'ok' });
  assert.equal(short.isValid, false);
  assert.match(short.errors.comments, new RegExp(`${COMMENT_MIN_LENGTH} characters`));

  const long = validateFeedback({ ...valid, comments: 'x'.repeat(COMMENT_MAX_LENGTH + 1) });
  assert.equal(long.isValid, false);
  assert.match(long.errors.comments, /Shorten your comment/);

  assert.equal(validateFeedback({ ...valid, comments: 'x'.repeat(COMMENT_MAX_LENGTH) }).isValid, true);
});

test('unknown categories are rejected and whitespace is trimmed', () => {
  assert.equal(validateFeedback({ ...valid, category: 'made-up' }).isValid, false);
  const { values } = validateFeedback({ ...valid, comments: '  padded comment  ' });
  assert.equal(values.comments, 'padded comment');
});

test('normalizeFeedback survives junk input', () => {
  assert.deepEqual(normalizeFeedback({ rating: '3', comments: 42, category: null }), {
    category: '', rating: 3, comments: '',
  });
  assert.deepEqual(normalizeFeedback(undefined).rating, 0);
});

test('character counter never goes negative', () => {
  assert.equal(remainingCharacters(''), COMMENT_MAX_LENGTH);
  assert.equal(remainingCharacters('x'.repeat(COMMENT_MAX_LENGTH + 50)), 0);
});

test('the submitted message is readable and keeps structured fields', () => {
  const msg = buildFeedbackMessage(valid, { fromStudentId: 'st-1', fromName: 'Ana' });
  assert.equal(msg.type, 'platform-feedback');
  assert.equal(msg.category, 'lesson');
  assert.equal(msg.rating, 4);
  assert.equal(msg.fromStudentId, 'st-1');
  assert.match(msg.body, /Lesson or class/);
  assert.match(msg.body, /4 — Good/);
  assert.match(msg.body, /The pacing was great today\./);
});

test('FeedbackForm exposes an accessible, validated compose → review → confirm flow', () => {
  assert.match(component, /role="status"/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /role="alert"/);
  assert.match(component, /aria-invalid=/);
  assert.match(component, /aria-describedby=/);
  assert.match(component, /<legend className="field-label">Rating/);
  assert.match(component, /type="radio"/);
  assert.match(component, /aria-label="Edit comments"/);
  assert.match(component, /data-testid=\{`\$\{testId\}-confirmation`\}/);
  assert.match(component, /validateFeedback/);
});

test('FeedbackForm keeps focus and error handling on the client', () => {
  assert.match(component, /event\.preventDefault\(\)/);
  assert.match(component, /summaryRef\.current\?\.focus\(\)/);
  assert.match(component, /noValidate/);
});

test('the stylesheet is responsive, token-only and motion-safe', () => {
  assert.match(stylesheet, /@media \(max-width: 640px\)/);
  assert.match(stylesheet, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(stylesheet, /focus-within/);
  assert.doesNotMatch(stylesheet, /#[0-9a-fA-F]{3,6}\b/);
});

test('student settings ships the feedback form', () => {
  assert.match(settings, /<FeedbackForm/);
  assert.match(settings, /buildFeedbackMessage/);
  assert.match(settings, /sendMessage\(/);
});
