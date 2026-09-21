const express = require('express');
const cors = require('cors');
const db = require('./db');
const { validateAnswers } = require('./validator');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to extract X-Applicant-Id
const requireApplicantId = (req, res, next) => {
  const applicantId = req.headers['x-applicant-id'];
  if (!applicantId) {
    return res.status(400).json({ error: 'X-Applicant-Id header is required' });
  }
  
  // Upsert applicant silently to ensure foreign key constraint passes
  const upsert = db.prepare('INSERT OR IGNORE INTO applicants (id) VALUES (?)');
  upsert.run(applicantId);
  
  req.applicantId = applicantId;
  next();
};

// 1. GET /jobs — list jobs with search/filter
app.get('/api/jobs', (req, res) => {
  const { q, location } = req.query;
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (q) {
    query += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ?)';
    const search = `%${q}%`;
    params.push(search, search, search);
  }

  if (location) {
    query += ' AND location = ?';
    params.push(location);
  }

  const stmt = db.prepare(query);
  const jobs = stmt.all(...params).map(job => ({ ...job, questions: JSON.parse(job.questions) }));
  res.json(jobs);
});

// 2. GET /jobs/:id — get a single job and its questionnaire
app.get('/api/jobs/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
  const job = stmt.get(req.params.id);
  
  if (!job) return res.status(404).json({ error: 'Job not found' });
  
  res.json({ ...job, questions: JSON.parse(job.questions) });
});

// 3. POST /jobs/:id/apply — apply to one job with answers
app.post('/api/jobs/:id/apply', requireApplicantId, (req, res) => {
  const { answers } = req.body;
  const jobId = req.params.id;
  const applicantId = req.applicantId;

  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const questions = JSON.parse(job.questions);
    const validationResult = validateAnswers(questions, answers || {});
    
    if (validationResult) {
      return res.status(400).json(validationResult);
    }

    try {
      db.prepare('INSERT INTO applications (job_id, applicant_id, answers) VALUES (?, ?, ?)')
        .run(jobId, applicantId, JSON.stringify(answers));
    } catch (dbErr) {
      if (dbErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'You have already applied for this job' });
      }
      throw dbErr;
    }

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST /applications/bulk — apply to multiple jobs at once (HTTP 207 Multi-Status)
app.post('/api/applications/bulk', requireApplicantId, (req, res) => {
  const { applications } = req.body;
  const applicantId = req.applicantId;

  if (!Array.isArray(applications) || applications.length === 0) {
    return res.status(400).json({ error: 'No applications provided' });
  }

  const results = [];

  for (const appData of applications) {
    const { jobId, answers } = appData;
    
    try {
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId);
      if (!job) {
        results.push({ jobId, status: 'not_found' });
        continue;
      }

      const questions = JSON.parse(job.questions);
      const validationResult = validateAnswers(questions, answers || {});
      
      if (validationResult) {
        results.push({ jobId, status: 'invalid', errors: validationResult.errors });
        continue;
      }

      // Use a distinct transaction for each job so one failure doesn't rollback others
      db.transaction(() => {
        try {
          db.prepare('INSERT INTO applications (job_id, applicant_id, answers) VALUES (?, ?, ?)')
            .run(jobId, applicantId, JSON.stringify(answers));
          results.push({ jobId, status: 'created' });
        } catch (dbErr) {
          if (dbErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            results.push({ jobId, status: 'duplicate' });
          } else {
            throw dbErr;
          }
        }
      })();
    } catch (err) {
      results.push({ jobId, status: 'error', message: err.message });
    }
  }

  res.status(207).json({ results });
});

// 5. GET /applications — list an applicant's applications
app.get('/api/applications', requireApplicantId, (req, res) => {
  const applicantId = req.applicantId;
  
  const applications = db.prepare(`
    SELECT app.id, app.answers, app.applied_at, j.id as jobId, j.title, j.company, j.location 
    FROM applications app
    JOIN jobs j ON app.job_id = j.id
    WHERE app.applicant_id = ?
  `).all(applicantId);

  res.json(applications.map(app => ({ ...app, answers: JSON.parse(app.answers) })));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
