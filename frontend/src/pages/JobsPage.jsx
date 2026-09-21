import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs } from '../api';
import JobCard from '../components/jobs/JobCard';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Alert from '../components/ui/Alert';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const JobsPage = ({ selectedJobs, toggleJobSelection, clearSelection }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const locations = ['All Locations', 'Remote', 'Hybrid', 'On-site'];
  const navigate = useNavigate();

  const fetchJobs = useCallback(() => {
    setLoading(true);
    setError(null);
    const loc = locationFilter === 'All Locations' ? '' : locationFilter;
    getJobs(debouncedSearch, loc)
      .then(setJobs)
      .catch(err => setError(err.message || 'Unable to load jobs.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, locationFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <PageContainer className="page-transition-enter" style={{ maxWidth: '1100px', paddingTop: '2rem' }}>
      
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center',
        padding: '3rem 1rem 4rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Find your next opportunity
        </div>
        <h1 style={{ marginBottom: '1.25rem', maxWidth: '600px', margin: '0 auto 1.25rem auto' }}>
          Explore open positions.
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.5' }}>
          Discover roles that match your skills and apply to multiple positions in one streamlined flow.
        </p>

        {/* Search Bar */}
        <div style={{ 
          background: 'var(--surface)', 
          borderRadius: '99px', 
          display: 'flex', 
          padding: '0.375rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto'
        }}>
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', padding: '0 1rem', borderRight: '1px solid var(--border-light)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search jobs, companies, or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', width: '100%', outline: 'none', fontSize: '1rem', color: 'var(--text-main)' }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 1rem', position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div 
              style={{ flex: 1, cursor: 'pointer', color: 'var(--text-main)', fontSize: '1rem', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            >
              {locationFilter}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isLocationDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {isLocationDropdownOpen && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} onClick={() => setIsLocationDropdownOpen(false)}></div>
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(100% + 0.5rem)', 
                  left: 0, 
                  right: 0, 
                  background: 'white', 
                  borderRadius: 'var(--radius-md)', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                  border: '1px solid var(--border-light)',
                  zIndex: 10,
                  overflow: 'hidden'
                }}>
                  {locations.map(loc => (
                    <div 
                      key={loc}
                      onClick={() => {
                        setLocationFilter(loc);
                        setIsLocationDropdownOpen(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        background: locationFilter === loc ? '#EFF6FF' : 'white',
                        color: locationFilter === loc ? '#2563EB' : 'var(--text-main)',
                        fontWeight: locationFilter === loc ? '600' : '400',
                      }}
                      onMouseEnter={(e) => {
                        if (locationFilter !== loc) e.target.style.background = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        if (locationFilter !== loc) e.target.style.background = 'white';
                      }}
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <Button variant="primary" style={{ padding: '0.75rem 2rem', fontWeight: '500', borderRadius: '99px' }} onClick={fetchJobs}>Search</Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>Open Positions</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Explore available opportunities and select the roles you're interested in.</p>
        </div>
        {!loading && <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{jobs.length} opportunities</span>}
      </div>

      <div className="jobs-grid">
        {loading ? (
          <>
            <Skeleton height="140px" />
            <Skeleton height="140px" />
            <Skeleton height="140px" />
          </>
        ) : jobs.length === 0 ? (
          <EmptyState 
            title="No jobs found" 
            description="Try adjusting your search criteria."
          />
        ) : (
          jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              isSelected={selectedJobs.some(j => j.id === job.id)}
              toggleSelection={toggleJobSelection}
            />
          ))
        )}
      </div>

      <div className="bulk-action-bar page-transition-enter" style={{ 
        opacity: selectedJobs.length > 0 ? 1 : 0, 
        pointerEvents: selectedJobs.length > 0 ? 'auto' : 'none', 
        transition: 'opacity 0.2s, transform 0.2s',
        transform: selectedJobs.length > 0 ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)'
      }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
            {selectedJobs.length} {selectedJobs.length === 1 ? 'job' : 'jobs'} selected
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Different jobs may require different application answers.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '500', cursor: 'pointer', fontSize: '0.95rem' }}
            onClick={clearSelection}
          >
            Clear Selection
          </button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/apply-all')}
            disabled={selectedJobs.length === 0}
            style={{ padding: '0.875rem 2rem' }}
          >
            {selectedJobs.length === 1 ? 'Apply \u2192' : 'Apply to All \u2192'}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default JobsPage;
