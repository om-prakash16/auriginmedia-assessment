import React from 'react';

const Select = ({ label, description, error, required, options, ...props }) => (
  <div className="form-group">
    {label && (
      <div style={{ marginBottom: description ? '0.25rem' : '0.5rem' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>
          {label} {required && <span className="required-indicator">*</span>}
        </label>
        {description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{description}</div>}
      </div>
    )}
    <select className="form-select" {...props}>
      <option value="" disabled>Select an option</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <div className="error-text">{error}</div>}
  </div>
);

export default Select;
