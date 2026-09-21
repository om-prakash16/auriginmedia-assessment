import React from 'react';
import Button from '../ui/Button';

const BulkApplyBar = ({ total, readyCount, isSubmitting, onSubmit, onReview }) => {
  const isReady = total > 0 && readyCount === total;

  return (
    <div className="bulk-action-bar page-transition-enter" style={{ 
      opacity: 1, 
      pointerEvents: 'auto', 
      transition: 'opacity 0.2s'
    }}>
      <div>
        <div style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.25rem', color: isReady ? '#059669' : '#D97706' }}>
          {isReady ? `✓ All ${total} applications ready` : `⚠ ${readyCount} of ${total} applications ready`}
        </div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {isReady ? 'All required information is complete.' : 'Complete the remaining required information.'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button 
          variant="primary" 
          disabled={isSubmitting} 
          onClick={isReady ? onSubmit : onReview}
          style={{ padding: '0.875rem 2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: '600' }}
        >
          {isSubmitting ? `Submitting...` : (isReady ? `Submit Applications \u2192` : `Review Missing Information`)}
        </Button>
      </div>
    </div>
  );
};

export default BulkApplyBar;
