import React from 'react';

const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`page-container ${className}`} style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {children}
    </div>
  );
};

export default PageContainer;
