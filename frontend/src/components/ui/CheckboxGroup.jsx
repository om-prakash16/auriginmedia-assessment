import React from 'react';

const CheckboxGroup = ({ label, description, error, required, options, selected = [], onChange }) => {
  const handleChange = (e, opt) => {
    const checked = e.target.checked;
    if (checked) {
      onChange([...selected, opt]);
    } else {
      onChange(selected.filter(s => s !== opt));
    }
  };

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
      <div className="form-checkbox-group">
        {options.map((opt) => (
          <label key={opt} className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={selected.includes(opt)}
              onChange={(e) => handleChange(e, opt)}
            />
            {opt}
          </label>
        ))}
      </div>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default CheckboxGroup;
