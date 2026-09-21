import React from 'react';

const Alert = ({ type = 'error', message }) => {
  const isError = type === 'error';
  return (
    <div style={{
      padding: '1rem',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: isError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
      color: isError ? 'var(--error)' : 'var(--success)',
      border: `1px solid ${isError ? 'rgba(220, 38, 38, 0.2)' : 'rgba(22, 163, 74, 0.2)'}`,
      marginBottom: '1rem'
    }}>
      {message}
    </div>
  );
};

export default Alert;
