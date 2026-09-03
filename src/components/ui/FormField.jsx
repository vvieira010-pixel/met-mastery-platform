import { useId, isValidElement, cloneElement } from 'react';

/**
 * FormField — labelled form control wrapper.
 *
 * The label and the control are rendered as *siblings*, so the `htmlFor`/`id`
 * pair is the only thing that connects them. Callers historically never passed
 * `htmlFor`, which left every field in the app unlabelled to assistive tech.
 * We now generate the id ourselves and graft it onto the child via
 * cloneElement, so all ~44 call sites are fixed without changing any of them.
 */
export function FormField({ label, htmlFor, error, hint, required, children, className = '', style }) {
  const generatedId = useId().replace(/:/g, '');

  // Precedence: explicit htmlFor > id the child already carries > generated id.
  const existingChildId = isValidElement(children) ? children.props.id : null;
  const inputId = htmlFor || existingChildId || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  // Merge rather than clobber, in case the child already describes itself.
  const child = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? inputId,
        'aria-describedby': [children.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })
    : children;

  return (
    <div className={`field ${error ? 'field-error' : ''} ${className}`.trim()} style={style}>
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}{required && ' *'}
        </label>
      )}
      {child}
      {error && <span id={errorId} className="field-error" role="alert">{error}</span>}
      {hint && !error && <span id={hintId} className="field-hint">{hint}</span>}
    </div>
  );
}
