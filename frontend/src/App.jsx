import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplyAllPage from './pages/ApplyAllPage';
import ApplicationsPage from './pages/ApplicationsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ApplicantRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  
  // If not logged in, they can view jobs (public), but wait - the prompt says:
  // "Applicant-only: /jobs, /jobs/:id, /apply-all, /applications"
  // "If an admin tries to access an applicant-only route, redirect to /admin."
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  const [selectedJobs, setSelectedJobs] = useState([]);

  const toggleJobSelection = (job) => {
    setSelectedJobs(prev => {
      const isSelected = prev.some(j => j.id === job.id);
      if (isSelected) {
        return prev.filter(j => j.id !== job.id);
      } else {
        return [...prev, job];
      }
    });
  };

  const clearSelection = () => setSelectedJobs([]);

  const removeJobsFromSelection = (jobIds) => {
    setSelectedJobs(prev => prev.filter(job => !jobIds.includes(job.id)));
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={
            <ApplicantRoute>
              <JobsPage selectedJobs={selectedJobs} toggleJobSelection={toggleJobSelection} clearSelection={clearSelection} />
            </ApplicantRoute>
          } />
          <Route path="/jobs/:id" element={
            <ApplicantRoute>
              <JobDetailsPage />
            </ApplicantRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/apply-all" element={
            <ProtectedRoute>
              <ApplicantRoute>
                <ApplyAllPage selectedJobs={selectedJobs} clearSelection={clearSelection} removeJobsFromSelection={removeJobsFromSelection} />
              </ApplicantRoute>
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute>
              <ApplicantRoute>
                <ApplicationsPage />
              </ApplicantRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
