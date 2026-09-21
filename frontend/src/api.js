const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let currentToken = null;

export const setAuthToken = (token) => {
  currentToken = token;
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
};

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to login');
  return data;
};

export const signup = async (name, email, password) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to signup');
  return data;
};

export const getJobs = async (search = '', location = '') => {
  const params = new URLSearchParams();
  if (search) params.append('q', search);
  if (location) params.append('location', location);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_URL}/jobs${queryString}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
};

export const getJob = async (id) => {
  const res = await fetch(`${API_URL}/jobs/${id}`);
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
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch applications');
  }
  return res.json();
};

export const getAdminStats = async () => {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
};

export const getAdminApplications = async () => {
  const res = await fetch(`${API_URL}/admin/applications`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch admin applications');
  return res.json();
};

export const updateApplicationStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/admin/applications/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update application status');
  return res.json();
};
