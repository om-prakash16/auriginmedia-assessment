import React from 'react';

const BooleanQuestion = ({ question, value, onChange, error }) => {
  return (
    <div className="form-group">
      <div style={{ marginBottom: question.description ? '0.25rem' : '0.5rem' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>
          {question.label} {question.required && <span className="required-indicator">*</span>}
        </label>
        {question.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{question.description}</div>}
      </div>
      
      <div className="segmented-control" style={{ width: '100%', maxWidth: '300px' }}>
        <input 
          type="radio" 
          id={`bool-${question.id}-yes`}
          name={`bool-${question.id}`}
          className="segmented-control-input" 
          checked={value === true}
          onChange={() => onChange(true)}
        />
        <label htmlFor={`bool-${question.id}-yes`} className="segmented-control-label">
          Yes
        </label>

        <input 
          type="radio" 
          id={`bool-${question.id}-no`}
          name={`bool-${question.id}`}
          className="segmented-control-input" 
          checked={value === false}
          onChange={() => onChange(false)}
        />
        <label htmlFor={`bool-${question.id}-no`} className="segmented-control-label">
          No
        </label>
      </div>

      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default BooleanQuestion;
