const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    questions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applicants (
    id TEXT PRIMARY KEY
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    applicant_id TEXT NOT NULL,
    answers TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id),
    FOREIGN KEY(applicant_id) REFERENCES applicants(id),
    UNIQUE(job_id, applicant_id)
  );
`);

// Seed data
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
const insert = db.prepare(`
  INSERT INTO jobs (id, title, company, location, description, questions) 
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET 
    title=excluded.title, 
    company=excluded.company, 
    location=excluded.location, 
    description=excluded.description, 
    questions=excluded.questions
`);

const insertMany = db.transaction((jobs) => {
  for (const job of jobs) {
    insert.run(
      job.id, 
      job.title, 
      job.company, 
      job.location, 
      job.description, 
      JSON.stringify(job.questions)
    );
  }
});

insertMany(seedJobs);
console.log("Seeding complete.");

module.exports = db;
