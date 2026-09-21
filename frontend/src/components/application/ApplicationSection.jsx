import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import DynamicForm from './DynamicForm';
import { getJobVisualData } from '../jobs/JobCard';

const ApplicationSection = ({ job, answers, onChange, errors, isReady, serverResult }) => {
  const [isExpanded, setIsExpanded] = useState(!isReady);
  const visual = getJobVisualData(job.title);
  
  // Make sure it expands if there's an error
  React.useEffect(() => {
    if (serverResult && (serverResult.status === 'invalid' || serverResult.status === 'duplicate')) {
      setIsExpanded(true);
    }
  }, [serverResult]);

  return (
    <Card id={`job-card-${job.id}`} className="application-section" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden' }}>
      <div 
        style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
          backgroundColor: isExpanded ? '#FFFFFF' : '#F8FAFC',
          transition: 'background-color 0.2s'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            backgroundColor: visual.avatarBg,
            color: visual.avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '700',
            flexShrink: 0
          }}>
            {visual.initial}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0F172A' }}>{job.title}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: '500', color: '#475569' }}>{job.company}</span>
              <span>&middot;</span>
              <span style={{ fontWeight: '500', color: '#475569' }}>{job.location}</span>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {job.description}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {serverResult?.status === 'created' ? (
             <span style={{ background: '#D1FAE5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.875rem', fontWeight: '600' }}>✓ Submitted</span>
          ) : serverResult?.status === 'invalid' || serverResult?.status === 'duplicate' ? (
             <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.875rem', fontWeight: '600' }}>✕ Error</span>
          ) : isReady ? (
             <span style={{ background: '#D1FAE5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.875rem', fontWeight: '600' }}>✓ Ready</span>
          ) : (
             <span style={{ background: '#FEF3C7', color: '#D97706', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.875rem', fontWeight: '600' }}>⚠ Needs information</span>
          )}
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            style={{ 
              color: 'var(--text-muted)', 
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{ padding: '2rem 1.5rem' }}>
          <DynamicForm 
            questions={job.questions} 
            answers={answers} 
            onChange={onChange} 
            errors={errors} 
            useGrid={true}
          />
        </div>
      )}
    </Card>
  );
};

export default ApplicationSection;
