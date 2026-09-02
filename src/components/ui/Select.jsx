import { useId } from 'react';

export function Select({ label, error, hint, options, value, onChange, placeholder, className = '', ...props }) {
  const generatedId = useId().replace(/:/g, '');
  const selectId = props.id || `${generatedId}-select`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <label className="field">
      {label && <span className="field-label" id={`${selectId}-label`}>{label}</span>}
      <select
        {...props}
        id={selectId}
        className={`select ${className}`}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        aria-labelledby={label ? `${selectId}-label` : props['aria-labelledby']}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      {error && <p id={errorId} className="field-error" role="alert">{error}</p>}
    </label>
  );
}
