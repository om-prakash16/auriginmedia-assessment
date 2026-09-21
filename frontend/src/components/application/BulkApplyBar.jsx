import React from 'react';
import Button from '../ui/Button';

const BulkApplyBar = ({ total, readyCount, isSubmitting, onSubmit }) => {
  const isReady = total > 0 && readyCount === total;

  return (
    <div className="bulk-action-bar page-transition-enter" style={{ 
      opacity: 1, 
      pointerEvents: 'auto', 
      transition: 'opacity 0.2s'
    }}>
      <div>
        <div style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
          {isReady ? `✓ All ${total} applications ready` : `${readyCount} of ${total} applications ready`}
        </div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {isReady ? 'All required information is complete.' : 'Complete all required fields to submit your applications.'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button 
          variant="primary" 
          disabled={isSubmitting || !isReady} 
          onClick={onSubmit}
          style={{ padding: '0.875rem 2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: '600' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          {isSubmitting ? `Submitting...` : (isReady ? `Submit Applications` : `Complete Missing Answers`)}
        </Button>
      </div>
    </div>
  );
};

export default BulkApplyBar;
