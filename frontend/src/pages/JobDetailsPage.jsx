import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, getJobs, applyToJob } from '../api';
import { useAuth } from '../context/AuthContext';
import DynamicForm from '../components/application/DynamicForm';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import { getJobVisualData } from '../components/jobs/JobCard';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();

  // Pre-fill full name from authenticated user or localStorage if possible
  useEffect(() => {
    if (job) {
      const storedName = user?.name || localStorage.getItem('common_name');
      const nameQ = job.questions.find(q => q.label.trim().toLowerCase() === 'full name' && q.type === 'text');
      if (storedName && nameQ && !formData[nameQ.id]) {
        setFormData(prev => ({ ...prev, [nameQ.id]: storedName }));
      }
    }
  }, [job, user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getJob(id), getJobs()])
      .then(([jobData, jobsData]) => {
        setJob(jobData);
        setAllJobs(jobsData);
      })
      .catch(err => setError(err.message || 'Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDynamicChange = (questionId, value) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
    // Clear field error on change
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
    
    // Auto-save full name to localStorage
    if (job) {
      const q = job.questions.find(q => q.id === questionId);
      if (q && q.label.trim().toLowerCase() === 'full name' && q.type === 'text') {
        localStorage.setItem('common_name', value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setSubmitError(null);
    setErrors({});
    setIsSubmitting(true);
    
    try {
      await applyToJob(id, { answers: formData });
      setIsSuccess(true);
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors(err.details);
        setSubmitError("Please correct the errors in the form below.");
      } else if (err.status === 409) {
        setSubmitError("You have already applied for this position.");
      } else {
        setSubmitError(err.message || "We couldn't submit your application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}><Skeleton width="100%" height="400px" /></div>
          <div style={{ flex: 1 }}><Skeleton width="100%" height="600px" /></div>
        </div>
      </PageContainer>
    );
  }

  if (error || !job) {
    return (
      <PageContainer>
        <EmptyState 
          title="Job not found" 
          description={error || "We couldn't find the job you're looking for."}
          actionText="Browse Jobs"
          onAction={() => navigate('/')}
        />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer>
        <div style={{ maxWidth: '600px', margin: '4rem auto' }}>
          <EmptyState 
            title="Application submitted"
            description={`Your application for ${job.title} has been submitted successfully.`}
            actionText="View My Applications"
            onAction={() => navigate('/applications')}
          />
        </div>
      </PageContainer>
    );
  }

  const visual = getJobVisualData(job.company);
  const similarJobs = allJobs.filter(j => j.id !== job.id).slice(0, 3);

  const requiredQuestions = job.questions.filter(q => q.required);
  const totalRequired = requiredQuestions.length;
  const completedRequired = requiredQuestions.filter(q => {
    const val = formData[q.id];
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;

  return (
    <PageContainer className="page-transition-enter" style={{ maxWidth: '1200px', paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: '500' }}>
        Jobs / {job.title}
      </Link>

      <div className="job-details-layout">
        {/* Left Column: Job Info */}
        <div className="job-details-sidebar">
          <Card style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: visual.avatarBg,
                color: visual.avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: '700'
              }}>
                {visual.initial}
              </div>
              <div>
                <h2 style={{ fontSize: '1.125rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>{job.company}</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>{job.title}</h1>

            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
              {job.description}
            </p>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '2rem 0' }} />

            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>About this position</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem', margin: '0', whiteSpace: 'pre-wrap' }}>
              {job.description}
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '2rem 0' }} />

            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Position details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <span>📍</span> {job.location}
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <span>🏢</span> {job.company}
               </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Application Form */}
        <div>
          <Card style={{ padding: 0, borderRadius: '16px', overflow: 'hidden' }}>
            {/* Header Area */}
            <div style={{ padding: '2rem 2.5rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>Apply for this Position</h2>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please answer the following questions to complete your application.</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)' }}>Application progress</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{completedRequired} of {totalRequired} required fields completed</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: '2rem 2.5rem' }}>
                {submitError && <Alert type="error" message={submitError} style={{ marginBottom: '2rem' }} />}
                
                <DynamicForm 
                  questions={job.questions} 
                  answers={formData} 
                  onChange={handleDynamicChange}
                  errors={errors}
                  showIndex={false}
                />
              </div>

              <div style={{ position: 'sticky', bottom: 0, padding: '1.5rem 2.5rem', background: '#FAFAFA', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                   Secure application
                </div>
                <Button type="submit" variant="primary" disabled={isSubmitting} style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '10px' }}>
                  {isSubmitting ? 'Submitting...' : user ? 'Submit Application →' : 'Log In to Apply →'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Similar Opportunities Section */}
      {similarJobs.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Similar Opportunities</h2>
            <Link to="/" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
              View All Jobs <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {similarJobs.map(sj => {
              const sVisual = getJobVisualData(sj.company);
              return (
                <Card key={sj.id} style={{ flex: '1 1 300px', minWidth: '300px', padding: '1.25rem', cursor: 'pointer' }} onClick={() => navigate(`/jobs/${sj.id}`)}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: sVisual.avatarBg, color: sVisual.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '600', flexShrink: 0 }}>
                      {sVisual.initial}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sj.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sj.company}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {sj.description}
                  </p>
                  <Button variant="secondary" style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    View Position
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default JobDetailsPage;
