import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplyAllPage from './pages/ApplyAllPage';
import ApplicationsPage from './pages/ApplicationsPage';
import './index.css';

function App() {
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
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<JobsPage selectedJobs={selectedJobs} toggleJobSelection={toggleJobSelection} clearSelection={clearSelection} />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/apply-all" element={<ApplyAllPage selectedJobs={selectedJobs} clearSelection={clearSelection} removeJobsFromSelection={removeJobsFromSelection} />} />
            <Route path="/applications" element={<ApplicationsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
