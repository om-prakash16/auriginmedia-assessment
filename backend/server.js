const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { validateAnswers } = require('./validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jobflow_key_123';

const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint for health check
app.get('/', (req, res) => {
  res.json({
    name: 'JobFlow API',
    status: 'online',
    version: '1.0.0',
    message: 'Welcome to the JobFlow backend service.'
  });
});

// Middleware to verify JWT token
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.applicantId = decoded.userId || decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

const requireApplicant = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.userRole === 'admin') {
      return res.status(403).json({ error: 'Admins cannot perform applicant actions' });
    }
    next();
  });
};

// Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  
  try {
    const { rows } = await pool.query('SELECT id FROM applicants WHERE email = $1', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    const id = require('crypto').randomUUID();
    const password_hash = bcrypt.hashSync(password, 10);
    
    await pool.query(
      'INSERT INTO applicants (id, name, email, password_hash) VALUES ($1, $2, $3, $4)',
      [id, name, email, password_hash]
    );
      
    const token = jwt.sign({ userId: id, email, name, role: 'applicant' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email, role: 'applicant' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const { rows } = await pool.query('SELECT * FROM applicants WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = rows[0];
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. GET /jobs — list jobs with search/filter
app.get('/api/jobs', async (req, res) => {
  const { q, location } = req.query;
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (q) {
    query += ` AND (title ILIKE $${paramIndex} OR company ILIKE $${paramIndex+1} OR description ILIKE $${paramIndex+2})`;
    const search = `%${q}%`;
    params.push(search, search, search);
    paramIndex += 3;
  }

  if (location) {
    query += ` AND location = $${paramIndex}`;
    params.push(location);
    paramIndex++;
  }

  try {
    const { rows } = await pool.query(query, params);
    // In pg, JSONB is automatically parsed to JS object! So we don't need JSON.parse.
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /jobs/:id — get a single job and its questionnaire
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /jobs/:id/apply — apply to a specific job
app.post('/api/jobs/:id/apply', requireApplicant, async (req, res) => {
  const { answers } = req.body;
  const jobId = req.params.id;
  const applicantId = req.applicantId;

  try {
    const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Job not found' });

    const job = rows[0];
    const validationResult = validateAnswers(job.questions, answers || {});
    
    if (validationResult) {
      return res.status(400).json(validationResult);
    }

    try {
      await pool.query(
        'INSERT INTO applications (job_id, applicant_id, answers) VALUES ($1, $2, $3)',
        [jobId, applicantId, JSON.stringify(answers)] // pg handles stringification for jsonb if it's an object, but stringify works too. Better to pass object.
      );
    } catch (dbErr) {
      if (dbErr.code === '23505') { // Postgres unique_violation error code
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
app.post('/api/applications/bulk', requireApplicant, async (req, res) => {
  const { applications } = req.body;
  const applicantId = req.applicantId;

  if (!Array.isArray(applications) || applications.length === 0) {
    return res.status(400).json({ error: 'No applications provided' });
  }

  const results = [];

  for (const appData of applications) {
    const { jobId, answers } = appData;
    
    try {
      const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
      if (rows.length === 0) {
        results.push({ jobId, status: 'not_found' });
        continue;
      }

      const job = rows[0];
      const validationResult = validateAnswers(job.questions, answers || {});
      
      if (validationResult) {
        results.push({ jobId, status: 'invalid', errors: validationResult.errors });
        continue;
      }

      try {
        await pool.query(
          'INSERT INTO applications (job_id, applicant_id, answers) VALUES ($1, $2, $3)',
          [jobId, applicantId, answers] // pg will serialize objects into JSONB automatically
        );
        results.push({ jobId, status: 'created' });
      } catch (dbErr) {
        if (dbErr.code === '23505') {
          results.push({ jobId, status: 'duplicate' });
        } else {
          throw dbErr;
        }
      }
    } catch (err) {
      results.push({ jobId, status: 'error', message: err.message });
    }
  }

  res.status(207).json({ results });
});

// 5. GET /applications — get applications for the logged-in applicant
app.get('/api/applications', requireApplicant, async (req, res) => {
  const applicantId = req.applicantId;
  
  try {
    const { rows } = await pool.query(`
      SELECT app.id, app.answers, app.applied_at, app.status, j.id as "jobId", j.title, j.company, j.location 
      FROM applications app
      JOIN jobs j ON app.job_id = j.id
      WHERE app.applicant_id = $1
    `, [applicantId]);

    // pg parses jsonb automatically
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ENDPOINTS ---

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalJobsResult = await pool.query('SELECT COUNT(*) as count FROM jobs');
    const totalApplicantsResult = await pool.query('SELECT COUNT(*) as count FROM applicants WHERE role = $1', ['applicant']);
    const totalApplicationsResult = await pool.query('SELECT COUNT(*) as count FROM applications');
    
    res.json({
      totalJobs: parseInt(totalJobsResult.rows[0].count, 10),
      totalApplicants: parseInt(totalApplicantsResult.rows[0].count, 10),
      totalApplications: parseInt(totalApplicationsResult.rows[0].count, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/applications', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        app.id, app.answers, app.applied_at, app.status,
        j.id as "jobId", j.title as "jobTitle", j.company, j.location,
        a.id as "applicantId", a.name as "applicantName", a.email as "applicantEmail"
      FROM applications app
      JOIN jobs j ON app.job_id = j.id
      JOIN applicants a ON app.applicant_id = a.id
      ORDER BY app.applied_at DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/applications/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Hired'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const { rowCount } = await pool.query('UPDATE applications SET status = $1 WHERE id = $2', [status, id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
