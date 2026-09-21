import React from 'react';

const Badge = ({ children, variant = 'default' }) => {
  let bg = 'var(--background)';
  let color = 'var(--text-muted)';
  let border = '1px solid var(--border)';
  
  if (variant === 'success') {
    bg = 'rgba(22, 163, 74, 0.1)';
    color = 'var(--success)';
    border = '1px solid rgba(22, 163, 74, 0.2)';
  } else if (variant === 'warning') {
    bg = 'rgba(217, 119, 6, 0.1)';
    color = 'var(--warning)';
    border = '1px solid rgba(217, 119, 6, 0.2)';
  } else if (variant === 'error') {
    bg = 'rgba(220, 38, 38, 0.1)';
    color = 'var(--error)';
    border = '1px solid rgba(220, 38, 38, 0.2)';
  }

  return (
    <span className="badge" style={{ backgroundColor: bg, color, border }}>
      {children}
    </span>
  );
};

export default Badge;
