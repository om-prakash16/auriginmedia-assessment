import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div className={`card ${className}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      {children}
    </div>
  );
};

export default Card;
