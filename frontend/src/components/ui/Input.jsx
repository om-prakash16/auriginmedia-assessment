import React from 'react';

const Input = ({ label, description, error, required, ...props }) => (
  <div className="form-group">
    {label && (
      <div style={{ marginBottom: description ? '0.25rem' : '0.5rem' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>
          {label} {required && <span className="required-indicator">*</span>}
        </label>
        {description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{description}</div>}
      </div>
    )}
    <input className="form-input" {...props} />
    {error && <div className="error-text">{error}</div>}
  </div>
);

export default Input;
