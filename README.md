# Job Application Portal - Assignment Submission

## Tech Stack

- **Frontend:** React (Vite), React Router DOM, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (`pg`) with `JSONB` for dynamic job questionnaire schemas
- **Authentication:** JWT and bcryptjs
- **Testing:** Node.js native test runner (`node --test`)

## Bonus Features

- Applicant authentication with JWT and bcryptjs
- HR/Admin dashboard for reviewing applications
- Application status tracking
- Unit tests
- Live deployment

## Live Demo

- **Frontend (Vercel)**: `[INSERT_YOUR_VERCEL_URL_HERE]`
- **Backend API (Render)**: `https://auriginmedia-assessment.onrender.com`

### Admin Dashboard Access
To test the HR/Admin functionality, use the following seeded credentials:
- **Email**: `admin@aurigin.com`
- **Password**: `admin`

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/jobs` | List/search jobs |
| GET | `/api/jobs/:id` | Get job + questions |
| POST | `/api/jobs/:id/apply` | Apply to one job |
| POST | `/api/applications/bulk` | Apply to multiple jobs |
| GET | `/api/applications` | Applicant's applications |
| GET | `/api/admin/applications` | HR applications |
| GET | `/api/admin/applications/:id` | View application |
| PATCH | `/api/admin/applications/:id/status` | Update status |

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm

### Database

Create a PostgreSQL database named `jobflow`:

```sql
CREATE DATABASE jobflow;
```

The backend automatically creates/initializes the required tables and loads the 3 assignment jobs on startup.


1. **Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   (Runs on port 3001 using PostgreSQL and Express)
   *To run backend unit tests (Node 20+ required):* `npm test`

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   (Runs on Vite at http://localhost:5173)

3. **Environment Variables (Optional)**:
   The frontend API URL defaults to `http://localhost:3001/api` for local development. For production deployment, create a `.env` file in the `frontend/` directory:
   ```
   VITE_API_URL=https://your-production-api.com/api
   ```
   The backend connects to PostgreSQL at `postgresql://postgres:postgres@localhost:5432/jobflow` by default. To override, set `DATABASE_URL` in the backend environment.

## User Guide

Here is a visual walkthrough of the Job Application Portal, highlighting the new Application Tracking System (ATS) UI. 

### 1. Browse Jobs
The main portal displays all available jobs. Users can view individual job details or apply directly to a single job.
![Jobs Page](docs/jobs-page.png)

### 2. Bulk Selection
Users can select multiple jobs using the checkboxes. Once two or more jobs are selected, a sticky action bar appears at the bottom of the screen, allowing users to enter the "Apply to All" bulk flow.
![Bulk Selection](docs/jobs-selection.png)

### 3. Apply to All (ATS Flow)
The bulk application workflow has been overhauled into a professional ATS interface:
- **Common Questions**: Questions that appear in multiple jobs are grouped at the top so applicants only need to answer them once.
- **Progress Tracking**: A dynamic sidebar tracks the overall application progress and pinpoints exactly which fields are missing.
- **Collapsible Cards**: Each job maintains its own isolated application card, clearly badged with its completion status (`⚠ Needs information`, `✓ Ready`, `✓ Submitted`).
- **Auto-Scrolling**: The `[Complete]` button in the sidebar will instantly scroll the user directly to the missing fields.
![Apply All Page](docs/apply-all-page.png)

### 4. Admin Dashboard
A dedicated dashboard for administrators (HR/Recruiters) provides a high-level overview of platform metrics and a comprehensive list of all applications. Admins can track applicants, view submitted answers, and update the status of each application.
![Admin Dashboard](docs/admin-dashboard.png)

## Seed Data

The three required seed jobs (Frontend Developer, Content Writer, Sales Associate) are automatically loaded into the PostgreSQL database on backend startup via `db.js`. No manual seeding step is required — simply run `npm start` in the backend directory and ensure your PostgreSQL server is running.

## Design Answers

### Data Model
For `applications`, the relational schema uses `job_id` and `applicant_id` as foreign keys to the respective tables. A `UNIQUE(job_id, applicant_id)` constraint is added to enforce that a user can only apply to a specific job once. The actual application data is stored in an `answers` column using PostgreSQL's native `JSONB` data type (e.g., `{"q1": "John Doe", "q2": true}`). This design provides immediate relational consistency for tracking *who* applied to *what*, while retaining flexibility for storing different answer structures without forcing EAV anti-patterns into SQL. JSONB also allows targeted indexing and querying when needed.

For tracking the user, we generate a JWT after signup/login. The backend automatically associates applications with this authenticated user securely.

### Dynamic Form
The frontend builds forms dynamically based strictly on the `questions` array returned by the API. The `DynamicForm` component maps each question to a specialized UI input (`text`, `textarea`, `dropdown`, `checkbox`, `boolean`, `number`) using a registry pattern in `QuestionRenderer.jsx`. Absolutely zero job-specific logic is hardcoded on the frontend.

**To add a new question type**: Create a new component in `components/questions/`, then register it in the `questionRenderers` map in `QuestionRenderer.jsx`. No other file needs to change.

### Apply to All
In the "Apply to All" bulk flow, the frontend parses the question arrays of all selected jobs to group questions by a composite identity key: `JSON.stringify({ label, type, options })` (case-insensitive label matching, options-aware).
- Questions appearing in more than one job are hoisted to a "Common Questions" section.
- The user inputs the answer *once*, and the component state maps that value to all relevant `jobId: questionId` targets behind the scenes.
- Job-specific questions remain isolated under their respective job headers.
- The backend endpoint (`POST /applications/bulk`) returns HTTP 207 Multi-Status, processing each job independently and reporting per-job results (`created`, `invalid`, `duplicate`, `not_found`).
- Partial success is handled gracefully: successful applications are removed from the selection, and failed ones remain with error feedback.

This provides a highly ergonomic user experience while maintaining complete payload fidelity for the backend.

### Validation
Server-side validation is centralized in a pure `validateAnswers(questions, answers)` function to ensure strict separation of concerns and enable testability outside the Express context.
The function rigorously enforces:
- **Required fields**: rejecting empty strings, `null`, `undefined`, empty arrays, and whitespace-only text.
- **Type correctness**: `text`/`textarea` → `typeof string`, `number` → `typeof number` + `Number.isFinite()`, `boolean` → `typeof boolean` (allows `false` to satisfy required constraint).
- **Constraint validation**: dropdown/checkbox answers must exist within the provided `options` array.
- **Unknown keys**: strictly rejects answer keys that don't correspond to valid question IDs.

Errors are mapped identically to their question IDs (e.g., `{ errors: { q2: "This field is required" } }`) and returned with HTTP 400. Duplicate applications return HTTP 409. Successful applications return HTTP 201.

The frontend converts number inputs to `Number` type before sending, ensuring frontend/backend agreement on types.

### At Scale

At 10,000 jobs and 1,000,000 applications:

- Jobs and applications would use pagination and appropriate database indexes.
- Frequently accessed job definitions could be cached.
- Bulk application processing could move to an asynchronous queue for large workloads.
- PostgreSQL indexing, connection pooling, and query optimization would become important.
- Application history would be paginated instead of loading all records at once.
- If answer-based filtering became common, appropriate JSONB indexes could be added.
