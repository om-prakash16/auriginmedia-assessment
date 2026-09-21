import React from 'react';
import TextQuestion from '../questions/TextQuestion';
import TextareaQuestion from '../questions/TextareaQuestion';
import NumberQuestion from '../questions/NumberQuestion';
import DropdownQuestion from '../questions/DropdownQuestion';
import CheckboxQuestion from '../questions/CheckboxQuestion';
import BooleanQuestion from '../questions/BooleanQuestion';

const questionRenderers = {
  text: TextQuestion,
  textarea: TextareaQuestion,
  number: NumberQuestion,
  dropdown: DropdownQuestion,
  checkbox: CheckboxQuestion,
  boolean: BooleanQuestion
};

const questionDescriptions = {
  'Full name': 'Enter your full name as it appears on your documents.',
  'Years of React experience': 'How many years of professional experience do you have with React?',
  'Preferred work mode': 'Select your preferred work arrangement.',
  'Why do you want this role?': 'Tell us what excites you about this opportunity.',
  'Portfolio URL': 'Provide a link to your online portfolio or writing samples.',
  'Topics you can write about': 'Select all the topics you have professional experience writing about.',
  'Sample pitch': 'Write a short 1-paragraph pitch for a potential article.',
  'Do you have a driver\'s license?': 'Required for client visits.',
  'Highest education': 'Select your highest level of completed education.',
  'Notice period (in days)': 'How soon could you start if an offer is made?'
};

const QuestionRenderer = ({ index, question, value, onChange, error }) => {
  const Component = questionRenderers[question.type];
  if (!Component) {
    return <div className="error-text">Unsupported question type: {question.type}</div>;
  }
  
  // Augment question with visual metadata
  const augmentedQuestion = {
    ...question,
    label: index ? `${index}. ${question.label}` : question.label,
    description: questionDescriptions[question.label]
  };

  return <Component question={augmentedQuestion} value={value} onChange={onChange} error={error} />;
};

export default QuestionRenderer;
