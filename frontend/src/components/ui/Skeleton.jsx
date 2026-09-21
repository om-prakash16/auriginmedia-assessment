import React from 'react';

const Skeleton = ({ width, height, borderRadius = 'var(--radius-sm)', marginBottom = '1rem' }) => {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, marginBottom }}
    />
  );
};

export default Skeleton;
