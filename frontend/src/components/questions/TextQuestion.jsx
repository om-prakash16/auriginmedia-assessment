import React from 'react';
import Input from '../ui/Input';

const TextQuestion = ({ question, value, onChange, error }) => {
  return (
    <Input
      type="text"
      label={question.label}
      description={question.description}
      required={question.required}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  );
};

export default TextQuestion;
