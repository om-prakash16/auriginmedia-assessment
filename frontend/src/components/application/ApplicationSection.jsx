import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import DynamicForm from './DynamicForm';
import { getJobVisualData } from '../jobs/JobCard';

const ApplicationSection = ({ job, answers, onChange, errors, isReady }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const visual = getJobVisualData(job.title);

  return (
    <Card className="application-section" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden' }}>
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
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{job.title}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: '500' }}>{job.company}</span>
              <span style={{ 
                background: visual.locationType === 'Remote' ? '#EFF6FF' : visual.locationType === 'Hybrid' ? '#F5F3FF' : '#ECFDF5', 
                color: visual.locationType === 'Remote' ? '#2563EB' : visual.locationType === 'Hybrid' ? '#7C3AED' : '#059669', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '100px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {visual.locationType}
              </span>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {job.description}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isReady ? (
            <Badge variant="success">✓ Completed</Badge>
          ) : (
            <span style={{ 
              background: '#EFF6FF', 
              color: '#2563EB', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '100px', 
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
              In Progress
            </span>
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
