import React from 'react';
import Select from '../ui/Select';

const DropdownQuestion = ({ question, value, onChange, error }) => {
  return (
    <Select
      label={question.label}
      description={question.description}
      required={question.required}
      options={question.options || []}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      error={error}
    />
  );
};

export default DropdownQuestion;
