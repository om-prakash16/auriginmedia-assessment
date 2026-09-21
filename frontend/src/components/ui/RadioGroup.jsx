import React from 'react';

const RadioGroup = ({ label, description, error, required, value, onChange }) => {
  return (
    <div className="form-group">
      {label && (
        <div style={{ marginBottom: description ? '0.25rem' : '0.5rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            {label} {required && <span className="required-indicator">*</span>}
          </label>
          {description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{description}</div>}
        </div>
      )}
      <div className="form-checkbox-group" style={{ flexDirection: 'row', gap: '1rem' }}>
        <label className="radio-label">
          <input
            type="radio"
            className="radio-input"
            checked={value === true}
            onChange={() => onChange(true)}
          />
          Yes
        </label>
        <label className="radio-label">
          <input
            type="radio"
            className="radio-input"
            checked={value === false}
            onChange={() => onChange(false)}
          />
          No
        </label>
      </div>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default RadioGroup;
