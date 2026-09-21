import React, { useEffect, useState } from 'react';
import { getAdminStats, getAdminApplications, updateApplicationStatus } from '../api';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getAdminStats(), getAdminApplications()])
      .then(([statsData, appsData]) => {
        setStats(statsData);
        setApplications(appsData);
      })
      .catch(err => setError(err.message || 'Failed to load admin data'))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      // Update local state without full refetch
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

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

  if (loading) {
    return (
      <PageContainer style={{ maxWidth: '1200px' }}>
        <Skeleton width="100%" height="100px" style={{ marginBottom: '2rem' }} />
        <Skeleton width="100%" height="400px" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer style={{ maxWidth: '1200px' }}>
        <Alert type="error" message={error} />
      </PageContainer>
    );
  }

  return (
    <PageContainer style={{ maxWidth: '1200px', paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of all platform activity and applications.</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
        <Card style={{ flex: 1, padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>{stats.totalJobs}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Total Jobs</div>
        </Card>
        <Card style={{ flex: 1, padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>{stats.totalApplicants}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Total Applicants</div>
        </Card>
        <Card style={{ flex: 1, padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>{stats.totalApplications}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Total Applications</div>
        </Card>
      </div>

      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Applications</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1rem 2rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Applicant</th>
                <th style={{ padding: '1rem 2rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Position</th>
                <th style={{ padding: '1rem 2rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '1rem 2rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Date</th>
                <th style={{ padding: '1rem 2rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found.</td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem 2rem' }}>
                      <div style={{ fontWeight: '500' }}>{app.applicantName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.applicantEmail}</div>
                    </td>
                    <td style={{ padding: '1rem 2rem' }}>
                      <div style={{ fontWeight: '500' }}>{app.jobTitle}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.company} • {app.location}</div>
                    </td>
                    <td style={{ padding: '1rem 2rem' }}>
                      <span style={{ 
                        background: getStatusBadgeProps(app.status).bg,
                        color: getStatusBadgeProps(app.status).color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 2rem', textAlign: 'right' }}>
                      <Button variant="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setSelectedApp(app)}>
                        View Answers
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedApp && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => setSelectedApp(null)} />
          <div style={{ 
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
            background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '600px', 
            maxHeight: '90vh', overflowY: 'auto', zIndex: 101, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Application Answers</h2>
                <div style={{ color: 'var(--text-muted)' }}>{selectedApp.applicantName} applying for {selectedApp.jobTitle}</div>
              </div>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>Update Application Status</label>
              <select 
                value={selectedApp.status}
                onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1rem', background: 'white' }}
              >
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(selectedApp.answers).map(([questionId, answer]) => (
                <div key={questionId} style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>Question ID: {questionId}</div>
                  <div style={{ fontWeight: '500', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                    {Array.isArray(answer) ? answer.join(', ') : (answer?.toString() || '—')}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setSelectedApp(null)}>Close</Button>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default AdminDashboardPage;
