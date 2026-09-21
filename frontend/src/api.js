const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getApplicantId = () => {
  let id = localStorage.getItem('applicant_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('applicant_id', id);
  }
  return id;
};

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Applicant-Id': getApplicantId()
  };
};

export const getJobs = async (search = '', location = '') => {
  const params = new URLSearchParams();
  if (search) params.append('q', search);
  if (location) params.append('location', location);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_URL}/jobs${queryString}`, {
    headers: { 'X-Applicant-Id': getApplicantId() }
  });
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
};

export const getJob = async (id) => {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    headers: { 'X-Applicant-Id': getApplicantId() }
  });
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
};

export const applyToJob = async (jobId, applicationData) => {
  const res = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(applicationData),
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || 'Failed to apply');
    error.status = res.status;
    error.details = data.errors || data.details; // handle different formats
    throw error;
  }
  return data;
};

export const submitBulkApplications = async (bulkData) => {
  const res = await fetch(`${API_URL}/applications/bulk`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ applications: bulkData }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to bulk apply');
  return data;
};

export const getApplications = async () => {
  const res = await fetch(`${API_URL}/applications`, {
    headers: { 'X-Applicant-Id': getApplicantId() }
  });
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
};
