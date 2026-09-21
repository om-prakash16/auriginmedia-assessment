import React from 'react';
import QuestionRenderer from './QuestionRenderer';

const DynamicForm = ({ questions, answers, onChange, errors, showIndex = false, useGrid = false }) => {
  return (
    <div className={useGrid ? 'form-grid' : ''} style={{ display: useGrid ? 'grid' : 'flex', flexDirection: useGrid ? 'unset' : 'column', gap: useGrid ? '1.5rem' : '2rem', marginBottom: 0 }}>
      {questions.map((q, idx) => {
        // In grid mode, we want textareas to span full width
        const isFullWidth = useGrid && q.type === 'textarea';
        
        return (
          <div key={q.id} style={{ gridColumn: isFullWidth ? '1 / -1' : 'auto' }}>
            <QuestionRenderer
              index={showIndex ? idx + 1 : null}
              question={q}
              value={answers[q.id]}
              onChange={(val) => onChange(q.id, val)}
              error={errors && errors[q.id]}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DynamicForm;
