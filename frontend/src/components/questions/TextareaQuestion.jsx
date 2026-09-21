import React from 'react';

const TextareaQuestion = ({ question, value, onChange, error }) => {
  return (
    <div className="form-group">
      <div style={{ marginBottom: question.description ? '0.25rem' : '0.5rem' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>
          {question.label} {question.required && <span className="required-indicator">*</span>}
        </label>
        {question.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{question.description}</div>}
      </div>
      <textarea
        className="form-textarea"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default TextareaQuestion;
