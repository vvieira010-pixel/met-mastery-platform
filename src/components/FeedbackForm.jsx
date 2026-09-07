import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Icon } from './shared.jsx';
import { Select } from './ui/Select.jsx';
import {
  COMMENT_MAX_LENGTH,
  FEEDBACK_CATEGORIES,
  FIELD_ORDER,
  RATING_OPTIONS,
  categoryLabel,
  createEmptyFeedback,
  normalizeFeedback,
  ratingLabel,
  remainingCharacters,
  validateFeedback,
} from '../domain/feedback/feedback-form.js';

/**
 * FeedbackForm — category + rating + comment submission with a review step.
 *
 * Flow: compose → review (edit any answer) → confirmation. Nothing leaves the
 * browser until the user presses "Submit feedback" on the review step, and the
 * draft is kept in localStorage when `draftKey` is supplied so a half-finished
 * answer can be resumed and edited instead of retyped.
 *
 * Props
 *  - onSubmit(values) → Promise|void. Throwing (or returning false) surfaces an error.
 *  - initialValues: existing feedback to edit before submitting.
 *  - draftKey: localStorage key for draft autosave (optional).
 *  - onDone(): optional callback for the "Done" action on the confirmation.
 */
export default function FeedbackForm({
  onSubmit,
  onDone,
  initialValues,
  draftKey,
  title = 'Share your feedback',
  description = 'Tell us what is working and what should change. You can review everything before it is sent.',
  showTitle = true,
  className = '',
  'data-testid': testId = 'feedback-form',
}) {
  const uid = useId().replace(/:/g, '');
  const titleId = `${uid}-title`;
  const categoryId = `${uid}-category`;
  const commentsId = `${uid}-comments`;
  const [step, setStep] = useState('compose'); // compose | review | success
  const [values, setValues] = useState(() => readInitialValues(initialValues, draftKey));
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  const ratingRefs = useRef({});
  const commentsRef = useRef(null);
  const summaryRef = useRef(null);
  const reviewHeadingRef = useRef(null);
  const successRef = useRef(null);

  // An existing draft/feedback item can be swapped in by the parent; adopt it
  // whenever its content changes (string key keeps this from looping).
  const initialSignature = JSON.stringify(normalizeFeedback(initialValues));
  const syncedSignature = useRef(initialSignature);
  useEffect(() => {
    if (syncedSignature.current === initialSignature) return;
    syncedSignature.current = initialSignature;
    setValues(JSON.parse(initialSignature));
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
    setStep('compose');
  }, [initialSignature]);

  useEffect(() => {
    if (!draftKey || step === 'success') return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(values));
    } catch {
      /* storage full or blocked — the form still works in memory */
    }
  }, [draftKey, step, values]);

  const errorList = FIELD_ORDER.filter(name => errors[name]);
  const remaining = remainingCharacters(values.comments);

  const validate = useCallback((next = values) => {
    const { errors: nextErrors } = validateFeedback(next);
    setErrors(nextErrors);
    return nextErrors;
  }, [values]);

  const setValue = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name] || submitAttempted) setErrors(validateFeedback(next).errors);
  };

  const markTouched = name => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateFeedback(values).errors[name] }));
  };

  const focusField = name => {
    if (name === 'rating') {
      const target = ratingRefs.current[values.rating] || ratingRefs.current[1];
      target?.focus();
      return;
    }
    if (name === 'comments') {
      commentsRef.current?.focus();
      return;
    }
    document.getElementById(categoryId)?.focus();
  };

  const goToCompose = name => {
    setStep('compose');
    focusSoon(() => focusField(name));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setSubmitAttempted(true);

    if (Object.keys(nextErrors).length > 0) {
      if (step !== 'compose') setStep('compose');
      focusSoon(() => summaryRef.current?.focus());
      return;
    }

    if (step === 'compose') {
      setStep('review');
      focusSoon(() => reviewHeadingRef.current?.focus());
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await onSubmit?.({ ...values, comments: values.comments.trim() });
      if (result === false) throw new Error('Your feedback could not be saved.');
      setSubmitted({ ...values, comments: values.comments.trim(), at: new Date().toISOString() });
      setStep('success');
      clearDraft(draftKey);
      window.toast?.('Feedback sent. Thank you!', 'ok');
      focusSoon(() => successRef.current?.focus());
    } catch (err) {
      setSubmitError(err?.message || 'Your feedback could not be sent. Please try again.');
      focusSoon(() => summaryRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  function handleSendAnother() {
    setValues(createEmptyFeedback());
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
    setSubmitError(null);
    setSubmitted(null);
    setStep('compose');
    focusSoon(() => focusField('category'));
  }

  if (step === 'success') {
    return (
      <div className={`fb-form ${className}`.trim()} data-testid={testId}>
        <div
          className="fb-success"
          role="status"
          aria-live="polite"
          tabIndex={-1}
          ref={successRef}
          data-testid={`${testId}-confirmation`}
        >
          <span className="fb-success__badge" aria-hidden="true"><Icon.check size={18} /></span>
          <h3 className="fb-success__title">Thanks — your feedback was sent.</h3>
          <p className="fb-success__copy">
            We received your {categoryLabel(submitted?.category) || 'feedback'} note
            {submitted?.rating ? ` rated ${ratingLabel(submitted.rating).toLowerCase()}` : ''}.
          </p>
          <dl className="fb-review">
            <div className="fb-review__row">
              <dt>Category</dt>
              <dd>{categoryLabel(submitted?.category) || '—'}</dd>
            </div>
            <div className="fb-review__row">
              <dt>Rating</dt>
              <dd>{submitted?.rating ? ratingLabel(submitted.rating) : '—'}</dd>
            </div>
            <div className="fb-review__row">
              <dt>Comments</dt>
              <dd className="fb-review__comments">{submitted?.comments || '—'}</dd>
            </div>
          </dl>
          <div className="fb-actions">
            <button type="button" className="btn btn-primary" onClick={handleSendAnother} data-testid={`${testId}-send-another`}>
              Send more feedback
            </button>
            {onDone && (
              <button type="button" className="btn btn-ghost" onClick={onDone} data-testid={`${testId}-done`}>Done</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const showSummary = submitAttempted && errorList.length > 0;
  const showError = name => Boolean((touched[name] || submitAttempted) && errors[name]);

  return (
    <div className={`fb-form ${className}`.trim()} data-testid={testId}>
      <form
        className="fb-form__body"
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby={showTitle ? titleId : undefined}
        aria-label={showTitle ? undefined : title}
      >
        {showTitle && (
          <div className="fb-form__head">
            <h3 className="fb-form__title" id={titleId}>{title}</h3>
            {description && <p className="fb-form__description">{description}</p>}
          </div>
        )}

        {showSummary && (
          <div className="fb-alert" role="alert" tabIndex={-1} ref={summaryRef} data-testid={`${testId}-error-summary`}>
            <p className="fb-alert__title">
              {errorList.length === 1 ? 'One field needs your attention' : `${errorList.length} fields need your attention`}
            </p>
            <ul className="fb-alert__list">
              {errorList.map(name => (
                <li key={name}>
                  <button type="button" className="fb-alert__link" onClick={() => goToCompose(name)} data-testid={`${testId}-error-link-${name}`}>
                    {errors[name]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {submitError && !showSummary && (
          <div className="fb-alert" role="alert" tabIndex={-1} ref={summaryRef} data-testid={`${testId}-submit-error`}>
            <p className="fb-alert__title">{submitError}</p>
          </div>
        )}

        {step === 'compose' ? (
          <>
            <Select
              id={categoryId}
              label="Category"
              required
              options={FEEDBACK_CATEGORIES.map(option => ({ value: option.value, label: option.label }))}
              placeholder="Choose a category…"
              value={values.category}
              onChange={e => setValue('category', e.target.value)}
              onBlur={() => markTouched('category')}
              error={showError('category') ? errors.category : undefined}
              hint={FEEDBACK_CATEGORIES.find(option => option.value === values.category)?.hint || 'What is your feedback about?'}
              data-testid={`${testId}-category`}
            />

            <fieldset
              className="fb-fieldset"
              aria-invalid={showError('rating') ? 'true' : undefined}
              aria-describedby={[`${uid}-rating-hint`, showError('rating') ? `${uid}-rating-error` : null].filter(Boolean).join(' ') || undefined}
              data-testid={`${testId}-rating`}
            >
              <legend className="field-label">Rating <span aria-hidden="true">*</span></legend>
              <div className="fb-rating">
                {RATING_OPTIONS.map(option => {
                  const checked = Number(values.rating) === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`fb-rating__chip${checked ? ' is-selected' : ''}`}
                      data-testid={`${testId}-rating-${option.value}`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={`${uid}-rating`}
                        value={option.value}
                        checked={checked}
                        ref={node => { ratingRefs.current[option.value] = node; }}
                        onChange={() => { setValue('rating', option.value); setTouched(prev => ({ ...prev, rating: true })); }}
                      />
                      <span className="fb-rating__value" aria-hidden="true">{option.value}</span>
                      <span className="fb-rating__label">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="field-hint" id={`${uid}-rating-hint`}>1 = poor, 5 = excellent.</p>
              {showError('rating') && (
                <p className="field-error" role="alert" id={`${uid}-rating-error`}>{errors.rating}</p>
              )}
            </fieldset>

            <div className="field">
              <label className="field-label" htmlFor={commentsId}>
                Comments <span aria-hidden="true">*</span>
              </label>
              <textarea
                id={commentsId}
                ref={commentsRef}
                className="input fb-textarea"
                rows={5}
                maxLength={COMMENT_MAX_LENGTH}
                value={values.comments}
                placeholder="What worked, what didn't, and what would help next time…"
                onChange={e => setValue('comments', e.target.value)}
                onBlur={() => markTouched('comments')}
                aria-invalid={showError('comments') ? 'true' : undefined}
                aria-describedby={[`${uid}-comments-hint`, showError('comments') ? `${uid}-comments-error` : null].filter(Boolean).join(' ')}
                data-testid={`${testId}-comments`}
              />
              <p className="field-hint" id={`${uid}-comments-hint`}>
                At least 10 characters. {remaining} characters left.
              </p>
              {remaining <= 50 && (
                <p role="status" className="sr-only">{remaining} characters remaining</p>
              )}
              {showError('comments') && (
                <p className="field-error" role="alert" id={`${uid}-comments-error`}>{errors.comments}</p>
              )}
            </div>
          </>
        ) : (
          <div className="fb-review-step">
            <h4 className="fb-review__heading" tabIndex={-1} ref={reviewHeadingRef}>
              Review before you send
            </h4>
            <dl className="fb-review">
              <div className="fb-review__row">
                <dt>Category</dt>
                <dd>{categoryLabel(values.category) || '—'}</dd>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => goToCompose('category')} aria-label="Edit category" data-testid={`${testId}-edit-category`}>Edit</button>
              </div>
              <div className="fb-review__row">
                <dt>Rating</dt>
                <dd>{values.rating ? ratingLabel(values.rating) : '—'}</dd>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => goToCompose('rating')} aria-label="Edit rating" data-testid={`${testId}-edit-rating`}>Edit</button>
              </div>
              <div className="fb-review__row">
                <dt>Comments</dt>
                <dd className="fb-review__comments">{values.comments.trim() || '—'}</dd>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => goToCompose('comments')} aria-label="Edit comments" data-testid={`${testId}-edit-comments`}>Edit</button>
              </div>
            </dl>
            <p className="fb-review__note">Nothing is sent until you choose “Submit feedback”.</p>
          </div>
        )}

        <div className="fb-actions">
          {step === 'review' && (
            <button type="button" className="btn btn-ghost" onClick={() => goToCompose('category')} disabled={submitting} data-testid={`${testId}-back`}>
              Keep editing
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            data-testid={`${testId}-submit`}
          >
            {submitting ? 'Sending…' : step === 'review' ? 'Submit feedback' : 'Review feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Move focus after React has committed the new step/state. */
function focusSoon(fn) {
  setTimeout(fn, 0);
}

function readInitialValues(initialValues, draftKey) {
  if (draftKey && typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) return normalizeFeedback(JSON.parse(raw));
    } catch {
      /* ignore malformed drafts */
    }
  }
  return normalizeFeedback(initialValues ?? createEmptyFeedback());
}

function clearDraft(draftKey) {
  if (!draftKey || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(draftKey);
  } catch {
    /* ignore */
  }
}
