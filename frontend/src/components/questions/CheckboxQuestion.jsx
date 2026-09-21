import React from 'react';
import CheckboxGroup from '../ui/CheckboxGroup';

const CheckboxQuestion = ({ question, value, onChange, error }) => {
  return (
    <CheckboxGroup
      label={question.label}
      description={question.description}
      required={question.required}
      options={question.options || []}
      selected={Array.isArray(value) ? value : []}
      onChange={onChange}
      error={error}
    />
  );
};

export default CheckboxQuestion;
