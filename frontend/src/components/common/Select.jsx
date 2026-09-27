import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  helperText,
  normalRange,
  unit,
  required = false,
  options = [],
  placeholder = 'Select...',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || props.name;

  return (
    <div className={`form-group ${error ? 'form-field-error' : ''} ${className}`}>
      <div className="form-label-row">
        <label htmlFor={selectId} className="form-label">
          <span>{label}</span>
          {required && <span style={{ color: 'var(--text-rose)' }}>*</span>}
        </label>
        {unit && <span className="field-unit-tag">{unit}</span>}
      </div>

      <div className="input-container">
        <select
          ref={ref}
          id={selectId}
          className="form-select"
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="select-chevron" />
      </div>

      {normalRange && !error && (
        <span className="field-normal-guide">
          Ref: <strong>{normalRange}</strong>
        </span>
      )}

      {helperText && !error && !normalRange && (
        <span id={`${selectId}-helper`} className="field-normal-guide">
          {helperText}
        </span>
      )}

      {error && (
        <span id={`${selectId}-error`} className="field-error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
