import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import ApplicationSection from '../components/application/ApplicationSection';
import BulkApplyBar from '../components/application/BulkApplyBar';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import { submitBulkApplications } from '../api';
import DynamicForm from '../components/application/DynamicForm';

const ApplyAllPage = ({ selectedJobs, clearSelection, removeJobsFromSelection }) => {
  const navigate = useNavigate();
  
  // bulkAnswers[jobId][questionId] = answer
  const [bulkAnswers, setBulkAnswers] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (selectedJobs.length === 0 && !isSuccess && !results) {
      navigate('/');
    }
  }, [selectedJobs, navigate, isSuccess, results]);

  // Group questions into shared and unique
  const { sharedQuestions, jobUniqueQuestions, questionMappings } = useMemo(() => {
    const counts = {};
    const qs = {};
    
    // Pass 1: count label+type combinations
    selectedJobs.forEach(job => {
      job.questions.forEach(q => {
        const key = JSON.stringify({ label: q.label.trim().toLowerCase(), type: q.type, options: q.options || [] });
        if (!counts[key]) counts[key] = 0;
        counts[key]++;
        qs[key] = q;
      });
    });

    const shared = [];
    const mappings = {}; // Map sharedKey -> list of { jobId, questionId }
    
    Object.keys(counts).forEach(key => {
      if (counts[key] > 1) {
        shared.push({ ...qs[key], _sharedKey: key });
      }
    });

    // Pass 2: separate unique questions and build mappings
    const unique = {};
    selectedJobs.forEach(job => {
      unique[job.id] = [];
      job.questions.forEach(q => {
        const key = JSON.stringify({ label: q.label.trim().toLowerCase(), type: q.type, options: q.options || [] });
        if (counts[key] > 1) {
          if (!mappings[key]) mappings[key] = [];
          mappings[key].push({ jobId: job.id, questionId: q.id });
        } else {
          unique[job.id].push(q);
        }
      });
    });

    return { sharedQuestions: shared, jobUniqueQuestions: unique, questionMappings: mappings };
  }, [selectedJobs]);

  // Auto-fill shared answers from localStorage on mount
  useEffect(() => {
    sharedQuestions.forEach(sq => {
      if (sq.label.trim().toLowerCase() === 'full name' && sq.type === 'text') {
        const storedName = localStorage.getItem('common_name');
        if (storedName) {
          handleSharedAnswerChange(sq._sharedKey, storedName);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedQuestions]);

  const handleSharedAnswerChange = (sharedKey, value) => {
    // Save to localStorage if it's "Full name"
    if (sharedKey === JSON.stringify({ label: 'full name', type: 'text', options: [] })) {
      localStorage.setItem('common_name', value);
    }

    setBulkAnswers(prev => {
      const next = { ...prev };
      const targets = questionMappings[sharedKey] || [];
      targets.forEach(({ jobId, questionId }) => {
        if (!next[jobId]) next[jobId] = {};
        next[jobId] = { ...next[jobId], [questionId]: value };
      });
      return next;
    });

    // Clear validation errors for these fields
    setValidationErrors(prev => {
      const next = { ...prev };
      const targets = questionMappings[sharedKey] || [];
      targets.forEach(({ jobId, questionId }) => {
        if (next[jobId] && next[jobId][questionId]) {
          next[jobId] = { ...next[jobId], [questionId]: null };
        }
      });
      return next;
    });
  };

  const handleUniqueAnswerChange = (jobId, questionId, value) => {
    setBulkAnswers(prev => ({
      ...prev,
      [jobId]: {
        ...(prev[jobId] || {}),
        [questionId]: value
      }
    }));
    
    if (validationErrors[jobId] && validationErrors[jobId][questionId]) {
      setValidationErrors(prev => ({
        ...prev,
        [jobId]: {
          ...prev[jobId],
          [questionId]: null
        }
      }));
    }
  };

  // Create an aggregated "shared answers" object for the DynamicForm
  const sharedAnswers = useMemo(() => {
    const ans = {};
    sharedQuestions.forEach(sq => {
      // Find the first job that has this question and grab its answer
      const targets = questionMappings[sq._sharedKey];
      if (targets && targets.length > 0) {
        const firstTarget = targets[0];
        ans[sq.id] = bulkAnswers[firstTarget.jobId]?.[firstTarget.questionId] || '';
      }
    });
    return ans;
  }, [sharedQuestions, questionMappings, bulkAnswers]);

  // Aggregate errors for shared questions
  const sharedErrors = useMemo(() => {
    const errs = {};
    sharedQuestions.forEach(sq => {
      const targets = questionMappings[sq._sharedKey];
      if (targets && targets.length > 0) {
        // Find if any target has an error
        const firstErrorTarget = targets.find(t => validationErrors[t.jobId]?.[t.questionId]);
        if (firstErrorTarget) {
          errs[sq.id] = validationErrors[firstErrorTarget.jobId][firstErrorTarget.questionId];
        }
      }
    });
    return errs;
  }, [sharedQuestions, questionMappings, validationErrors]);

  const calculateProgress = () => {
    const totalJobs = selectedJobs.length;
    let completedJobs = 0;
    const jobStatuses = {};

    selectedJobs.forEach(job => {
      const jobAnswers = bulkAnswers[job.id] || {};
      let isJobComplete = true;
      const missing = [];
      
      job.questions.forEach(q => {
        let isMissing = false;
        const answer = jobAnswers[q.id];
        if (q.required) {
           if (answer === undefined || answer === null || answer === '') isMissing = true;
           else if (q.type === 'checkbox' && Array.isArray(answer) && answer.length === 0) isMissing = true;
           else if ((q.type === 'text' || q.type === 'textarea') && typeof answer === 'string' && answer.trim() === '') isMissing = true;
        }
        
        // Semantic validations (even if not required, but has a value)
        if (answer && typeof answer === 'string') {
          if (q.type === 'text' && q.label && q.label.toLowerCase().includes('url')) {
            try { new URL(answer); } catch(e) { isMissing = true; }
          }
          if (q.type === 'textarea' && answer.trim().length > 0 && answer.trim().length < 20) {
            isMissing = true;
          }
        }
        if (isMissing) {
          isJobComplete = false;
          missing.push(q.label);
        }
      });
      if (isJobComplete) completedJobs++;
      jobStatuses[job.id] = { isComplete: isJobComplete, missingFields: missing };
    });

    return { total: totalJobs, completed: completedJobs, jobStatuses };
  };

  const handleBulkSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors({});

    const payload = selectedJobs.map(job => ({
      jobId: job.id,
      answers: bulkAnswers[job.id] || {}
    }));

    try {
      const data = await submitBulkApplications(payload);
      // data: { results: [{ jobId, status, errors? }] }
      setResults(data.results);
      
      const successfulJobIds = data.results
        .filter(r => r.status === 'created')
        .map(r => r.jobId);
        
      if (successfulJobIds.length === selectedJobs.length) {
        // All succeeded
        clearSelection();
        setIsSuccess(true);
      } else {
        // Partial success or all failed
        if (successfulJobIds.length > 0) {
           removeJobsFromSelection(successfulJobIds);
        }
        
        // Populate field errors
        const newErrors = {};
        let generalErrorCount = 0;
        data.results.forEach(r => {
          if (r.status === 'invalid' && r.errors) {
            newErrors[r.jobId] = r.errors;
          } else if (r.status === 'duplicate') {
            generalErrorCount++;
          }
        });
        
        setValidationErrors(newErrors);
        setSubmitError(`${generalErrorCount > 0 ? `${generalErrorCount} job(s) already applied to. ` : ''}Some applications require attention before submitting.`);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit applications.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess || (results && selectedJobs.length === 0)) {
    return (
      <PageContainer>
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <Card style={{ padding: '3rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', background: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h1 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>Applications Submitted!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0 0 2rem 0' }}>
              You have successfully applied to your selected positions.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/')} 
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'white', fontWeight: '500', cursor: 'pointer' }}
              >
                Back to Jobs
              </button>
              <button 
                onClick={() => navigate('/applications')} 
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '500', cursor: 'pointer' }}
              >
                View Applications
              </button>
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const { total, completed, jobStatuses } = calculateProgress();

  return (
    <PageContainer className="page-transition-enter" style={{ maxWidth: '1200px', paddingTop: '1.5rem', paddingBottom: '8rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: '500' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, font: 'inherit' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Jobs
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
        
        {/* Left Sidebar */}
        <div style={{ flex: '0 0 320px' }}>
          <div style={{ position: 'sticky', top: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', color: '#0F172A' }}>
              {selectedJobs.length === 1 ? 'Complete Application' : 'Apply to All'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>Complete the required fields for your selected positions.</p>
            
            <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Application Progress</span>
                <span style={{ color: 'var(--primary)' }}>{completed} / {total}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${(completed / total) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedJobs.map((job, idx) => {
                  const jobStatus = jobStatuses[job.id] || { isComplete: false, missingFields: [] };
                  const isJobComplete = jobStatus.isComplete;
                  const missingFields = jobStatus.missingFields;
                  const hasStarted = Object.keys(bulkAnswers[job.id] || {}).length > 0;
                  const serverResult = results?.find(r => r.jobId === job.id);
                  
                  let statusColor = isJobComplete ? '#10B981' : (hasStarted ? '#F59E0B' : '#94A3B8');
                  if (serverResult && serverResult.status === 'duplicate') statusColor = '#EF4444';

                  return (
                    <div key={job.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', position: 'relative' }}>
                      {idx !== selectedJobs.length - 1 && (
                        <div style={{ position: 'absolute', left: '9px', top: '24px', bottom: '-12px', width: '2px', background: '#E2E8F0' }}></div>
                      )}
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${statusColor}`, background: isJobComplete ? statusColor : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', zIndex: 1 }}>
                        {isJobComplete && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem', color: isJobComplete ? '#0F172A' : '#475569' }}>{job.title}</div>
                        
                        {serverResult && serverResult.status === 'duplicate' && (
                          <div style={{ fontSize: '0.85rem', color: '#EF4444', marginTop: '0.25rem' }}>Already applied</div>
                        )}
                        {isJobComplete ? (
                          <div style={{ fontSize: '0.85rem', color: '#10B981', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            ✓ Ready
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#F59E0B', marginTop: '0.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
                            <span>⚠</span> <span>Missing {missingFields.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Main Content */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          
          {submitError && (
            <div style={{ marginBottom: '2rem' }}>
              <Alert type="error" message={submitError} />
            </div>
          )}

          {sharedQuestions.length > 0 && (
            <Card style={{ padding: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#F1F5F9', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>1</div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Common Questions</h2>
              </div>
              <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                These questions apply to multiple roles you selected. Answer them once here.
              </div>
              <DynamicForm 
                questions={sharedQuestions.map((q, i) => ({ ...q, _displayIndex: i + 1 }))}
                answers={sharedAnswers}
                errors={sharedErrors}
                onChange={(qId, value) => {
                  const sq = sharedQuestions.find(q => q.id === qId);
                  if (sq) handleSharedAnswerChange(sq._sharedKey, value);
                }}
                showIndex={false}
              />
            </Card>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {selectedJobs.map((job) => {
              const uniqueQs = jobUniqueQuestions[job.id] || [];
              if (uniqueQs.length === 0) return null; // Only show jobs that have unique questions
              return (
                <ApplicationSection
                  key={job.id}
                  job={{ ...job, questions: uniqueQs }}
                  answers={bulkAnswers[job.id] || {}}
                  errors={validationErrors[job.id] || {}}
                  onChange={(questionId, value) => handleUniqueAnswerChange(job.id, questionId, value)}
                  isReady={jobStatuses[job.id]?.isComplete}
                />
              );
            })}
          </div>

        </div>
      </div>

      <BulkApplyBar 
        total={selectedJobs.length} 
        readyCount={completed}
        onSubmit={handleBulkSubmit} 
        isSubmitting={isSubmitting} 
      />
    </PageContainer>
  );
};

export default ApplyAllPage;
