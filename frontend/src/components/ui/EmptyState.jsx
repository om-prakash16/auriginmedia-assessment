import React from 'react';
import Button from './Button';

const EmptyState = ({ title, description, actionText, onAction }) => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }} className="card">
      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h2>
      <p className="text-muted" style={{ marginBottom: actionText ? '1.5rem' : 0 }}>{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};

export default EmptyState;
