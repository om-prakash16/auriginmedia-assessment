const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jobflow',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        questions JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS applicants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'applicant'
      );

      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id TEXT NOT NULL REFERENCES jobs(id),
        applicant_id TEXT NOT NULL REFERENCES applicants(id),
        answers JSONB NOT NULL,
        status TEXT DEFAULT 'Submitted',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, applicant_id)
      );
    `);

    // Seed jobs
    const seedJobs = [
      {
        "id": "job-1",
        "title": "Frontend Developer",
        "company": "Nova Labs",
        "location": "Remote",
        "description": "Build and maintain our React-based dashboard.",
        "questions": [
          { "id": "q1", "label": "Full name", "type": "text", "required": true },
          { "id": "q2", "label": "Years of React experience", "type": "number", "required": true },
          { "id": "q3", "label": "Preferred work mode", "type": "dropdown", "required": true, "options": ["Remote", "Hybrid", "On-site"] },
          { "id": "q4", "label": "Why do you want this role?", "type": "textarea", "required": false }
        ]
      },
      {
        "id": "job-2",
        "title": "Content Writer",
        "company": "Brightside Media",
        "location": "Hybrid",
        "description": "Write long-form articles and marketing copy.",
        "questions": [
          { "id": "q1", "label": "Full name", "type": "text", "required": true },
          { "id": "q2", "label": "Portfolio URL", "type": "text", "required": true },
          { "id": "q3", "label": "Topics you can write about", "type": "checkbox", "required": true, "options": ["Tech", "Finance", "Health", "Travel", "Lifestyle"] },
          { "id": "q4", "label": "Sample pitch", "type": "textarea", "required": true }
        ]
      },
      {
        "id": "job-3",
        "title": "Sales Associate",
        "company": "PeakReach",
        "location": "On-site",
        "description": "Drive outbound sales and manage client relationships.",
        "questions": [
          { "id": "q1", "label": "Full name", "type": "text", "required": true },
          { "id": "q2", "label": "Do you have a driver's license?", "type": "boolean", "required": true },
          { "id": "q3", "label": "Highest education", "type": "dropdown", "required": true, "options": ["High School", "Bachelor's", "Master's", "Other"] },
          { "id": "q4", "label": "Notice period (in days)", "type": "number", "required": false }
        ]
      }
    ];

    console.log("Seeding jobs table...");
    for (const job of seedJobs) {
      await pool.query(`
        INSERT INTO jobs (id, title, company, location, description, questions) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET 
          title = EXCLUDED.title, 
          company = EXCLUDED.company, 
          location = EXCLUDED.location, 
          description = EXCLUDED.description, 
          questions = EXCLUDED.questions
      `, [job.id, job.title, job.company, job.location, job.description, JSON.stringify(job.questions)]);
    }
    console.log("Seeding complete.");

    // Seed Admin User
    console.log("Seeding admin user...");
    const adminEmail = 'admin@aurigin.com';
    const { rows } = await pool.query('SELECT id FROM applicants WHERE email = $1', [adminEmail]);
    
    if (rows.length === 0) {
      const adminPassword = 'admin'; // simple default password
      const adminHash = bcrypt.hashSync(adminPassword, 10);
      await pool.query(
        'INSERT INTO applicants (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
        ['admin-id-1', 'Admin', adminEmail, adminHash, 'admin']
      );
      console.log("Admin seeded.");
    }

  } catch (err) {
    console.error("Database initialization failed:", err);
  }
};

// Start initialization
initDb();

module.exports = pool;
