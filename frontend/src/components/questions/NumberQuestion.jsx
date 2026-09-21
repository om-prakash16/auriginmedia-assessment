import React from 'react';
import Input from '../ui/Input';

const NumberQuestion = ({ question, value, onChange, error }) => {
  return (
    <Input
      type="number"
      label={question.label}
      description={question.description}
      required={question.required}
      value={value === '' || value === undefined || value === null ? '' : value}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === '' ? '' : Number(raw));
      }}
      error={error}
    />
  );
};

export default NumberQuestion;
