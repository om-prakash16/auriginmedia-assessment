import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Keep the deterministic colored avatar based on company name
export const getJobVisualData = (company) => {
  const hash = company.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    { bg: '#1E3A8A', color: 'white' }, // Dark blue
    { bg: '#FECDD3', color: '#881337' }, // Light red/pink
    { bg: '#D1FAE5', color: '#064E3B' }, // Light green
    { bg: '#FEF3C7', color: '#92400E' }, // Light amber
    { bg: '#E0E7FF', color: '#3730A3' }, // Indigo
  ];
  const colorMatch = colors[hash % colors.length];
  
  return {
    avatarBg: colorMatch.bg,
    avatarColor: colorMatch.color,
    initial: company.charAt(0).toUpperCase(),
  };
};

const JobCard = ({ job, isSelected, toggleSelection }) => {
  const navigate = useNavigate();
  const visual = getJobVisualData(job.company);

  const cardStyle = isSelected ? {
    borderColor: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    boxShadow: '0 0 0 1px var(--primary)'
  } : {
    boxShadow: 'none'
  };

  return (
    <Card 
      className={`job-card ${isSelected ? 'selected' : ''}`} 
      onClick={() => toggleSelection(job)}
    >
      <div className="job-card-inner">
        <div className="job-card-left">
          <div className="job-card-checkbox-wrap">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                toggleSelection(job);
              }}
              className="job-card-checkbox"
            />
          </div>

          <div className="job-card-avatar" style={{ backgroundColor: visual.avatarBg, color: visual.avatarColor }}>
            {visual.initial}
          </div>

          <div className="job-card-content">
            <div className="job-card-title-row">
              <h3>{job.title}</h3>
              <span className="job-card-badge">{job.location}</span>
            </div>
            <div className="job-card-meta-row">
              <span className="company-name">{job.company}</span>
              <span className="separator">•</span>
              <span className="description">{job.description}</span>
            </div>
          </div>
        </div>

        <div className="job-card-right">
          <Button 
            variant="secondary" 
            onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}
            className="job-card-button"
          >
            View Position
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
