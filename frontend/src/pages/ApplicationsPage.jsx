import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications, getJobs } from '../api';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { getJobVisualData } from '../components/jobs/JobCard';

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStatusBadgeProps = (status) => {
    switch (status) {
      case 'Submitted': return { bg: '#EFF6FF', color: '#1E40AF' }; // Blue
      case 'Under Review': return { bg: '#FEF3C7', color: '#92400E' }; // Yellow
      case 'Shortlisted': return { bg: '#E0E7FF', color: '#3730A3' }; // Indigo
      case 'Hired': return { bg: '#D1FAE5', color: '#065F46' }; // Green
      case 'Rejected': return { bg: '#FEE2E2', color: '#991B1B' }; // Red
      default: return { bg: '#F1F5F9', color: '#475569' }; // Gray
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getApplications(), getJobs()])
      .then(([apps, jobsData]) => {
        const jMap = {};
        jobsData.forEach(j => {
          jMap[j.id] = j;
        });
        setJobsMap(jMap);
        setApplications(apps);
      })
      .catch(err => setError(err.message || 'Unable to load applications.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer style={{ maxWidth: '1200px' }}>
        <Skeleton width="100%" height="200px" style={{ marginBottom: '2rem' }} />
        <Skeleton width="100%" height="400px" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState 
          title="Error loading applications" 
          description={error}
          actionText="Try Again"
          onAction={() => window.location.reload()}
        />
      </PageContainer>
    );
  }

  if (applications.length === 0) {
    return (
      <PageContainer style={{ maxWidth: '1200px' }}>
        <EmptyState 
          title="No applications yet" 
          description="You haven't submitted any job applications."
          actionText="Browse Jobs"
          onAction={() => navigate('/')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="page-transition-enter" style={{ maxWidth: '1200px', paddingTop: '2rem', paddingBottom: '6rem' }}>
      
      {/* Header & Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ color: '#2563EB', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Career Journey</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0F172A' }}>My Applications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: 0 }}>Review the opportunities you've applied for.</p>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', 
          borderRadius: '16px', 
          padding: '2rem', 
          display: 'flex', 
          gap: '2rem', 
          alignItems: 'center', 
          border: '1px solid #BFDBFE',
          position: 'relative',
          overflow: 'hidden',
          flex: 1,
          maxWidth: '550px'
        }}>
          {/* Simulated Mountain Graphic via CSS */}
          <div style={{ position: 'absolute', bottom: '-20px', right: '120px', width: '200px', height: '150px', zIndex: 0 }}>
            <div style={{ position: 'absolute', bottom: 0, right: '50px', width: '0', height: '0', borderLeft: '60px solid transparent', borderRight: '60px solid transparent', borderBottom: '120px solid #93C5FD' }}></div>
            <div style={{ position: 'absolute', bottom: 0, right: '10px', width: '0', height: '0', borderLeft: '50px solid transparent', borderRight: '50px solid transparent', borderBottom: '90px solid #60A5FA' }}></div>
            <div style={{ position: 'absolute', bottom: 0, right: '90px', width: '0', height: '0', borderLeft: '70px solid transparent', borderRight: '70px solid transparent', borderBottom: '140px solid #3B82F6' }}></div>
            {/* Flag */}
            <div style={{ position: 'absolute', bottom: '135px', right: '158px', width: '2px', height: '25px', background: '#1E3A8A' }}></div>
            <div style={{ position: 'absolute', bottom: '145px', right: '143px', width: '15px', height: '10px', background: '#1E3A8A' }}></div>
            <div style={{ position: 'absolute', bottom: '155px', right: '143px', width: '15px', height: '10px', background: '#1E3A8A', borderTopRightRadius: '2px', borderBottomRightRadius: '2px' }}></div>
          </div>
          
          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1E3A8A', margin: '0 0 0.25rem 0' }}>Keep going.</h2>
            <h3 style={{ fontSize: '1.15rem', color: '#1E3A8A', margin: '0 0 1rem 0', fontWeight: '500' }}>Great opportunities<br/>take you further.</h3>
            <div style={{ width: '30px', height: '3px', background: '#2563EB', borderRadius: '2px' }}></div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, borderLeft: '1px solid rgba(255,255,255,0.5)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>
            <div>Apply</div>
            <div>Track</div>
            <div>Grow</div>
            <div style={{ color: '#1E3A8A' }}>Succeed</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left Column: Applications List */}
        <div style={{ flex: 1, minWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {applications.map(app => {
            const job = jobsMap[app.jobId];
            if (!job) return null;
            const visual = getJobVisualData(job.company);
            
            return (
              <Card key={app.id} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: visual.avatarBg,
                      color: visual.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {visual.initial}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.125rem', margin: '0 0 0.125rem 0', color: 'var(--text-main)', fontWeight: '600' }}>{job.title}</h2>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{job.company}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                        background: getStatusBadgeProps(app.status).bg,
                        color: getStatusBadgeProps(app.status).color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {app.status === 'Submitted' ? '✓ ' : ''}{app.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {job.location}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button variant="secondary" onClick={() => navigate(`/jobs/${job.id}`)} style={{ padding: '0.5rem 1rem', background: 'var(--badge-bg)', color: 'var(--text-main)', border: 'none', fontWeight: '500' }}>
                    View Job Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <Card style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0F172A' }}>Application Tips</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'Keep your profile updated',
                'Apply to multiple relevant roles',
                'Check back for status updates',
                'Prepare for interviews',
                'Don\'t be discouraged'
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', color: '#475569' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          <Card style={{ background: '#F8FAFC', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
            <div style={{ color: '#94A3B8', fontSize: '2.5rem', lineHeight: '1', fontWeight: 'serif' }}>"</div>
            <div>
              <p style={{ fontStyle: 'italic', color: '#475569', margin: '0 0 1rem 0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                "Every application brings you closer to the right opportunity."
              </p>
              <div style={{ width: '20px', height: '1px', background: '#94A3B8', marginBottom: '1rem' }}></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keep going!</div>
            </div>
          </Card>

        </div>
      </div>
    </PageContainer>
  );
};

export default ApplicationsPage;
