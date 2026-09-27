import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  normalRange,
  unit,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className={`form-group ${error ? 'form-field-error' : ''} ${className}`}>
      <div className="form-label-row">
        <label htmlFor={inputId} className="form-label">
          <span>{label}</span>
          {required && <span style={{ color: 'var(--text-rose)' }}>*</span>}
        </label>
        {unit && <span className="field-unit-tag">{unit}</span>}
      </div>

      <div className="input-container">
        <input
          ref={ref}
          id={inputId}
          className="form-input"
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>

      {normalRange && !error && (
        <span className="field-normal-guide">
          Ref: <strong>{normalRange}</strong>
        </span>
      )}

      {helperText && !error && !normalRange && (
        <span id={`${inputId}-helper`} className="field-normal-guide">
          {helperText}
        </span>
      )}

      {error && (
        <span id={`${inputId}-error`} className="field-error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
