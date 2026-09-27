# TaskForge — Cognifyz Full Stack Development Internship Submission

A small, real task-management web app built to cover **all 8 tasks** of the
Cognifyz Full Stack Development internship (Levels 1–4), so it comfortably
clears the "complete at least 5 of 8" requirement.

## Quick start

```bash
npm install
npm start
```

Then open **http://localhost:3000**. No database server, API keys, or
environment variables are required — everything runs out of the box.

- Create an account at `/register`
- Log in at `/login`
- Manage tasks at `/dashboard`

## Project structure

```
server.js            Express app setup, middleware wiring
db.js                 Tiny JSON-file data layer (swap-in point for MongoDB/MySQL)
middleware/
  auth.js              Session auth guard + authorization checks (Task 6)
  logger.js            Custom request logging middleware (Task 8)
  cache.js             In-memory TTL cache for GET endpoints (Task 8)
  jobQueue.js           In-memory background job queue (Task 8)
routes/
  auth.js              Register/login/logout, server-side validation (Tasks 1, 2, 6)
  tasks.js              RESTful CRUD API for tasks (Tasks 4, 5, 6)
  external.js            Third-party API integration + rate limiting (Task 7)
views/                 EJS templates (server-side rendering, Task 1)
public/css/style.css   Responsive, animated UI (Task 3)
public/js/validate.js  Client-side form validation (Task 2)
public/js/dashboard.js  Dynamic DOM updates + client-side view routing (Task 4)
```

## How each task is covered

| Task | Where | What it demonstrates |
|---|---|---|
| **1 — HTML structure & basic server interaction** | `views/register.ejs`, `views/login.ejs`, `routes/auth.js` | HTML forms rendered server-side via EJS, an Express server, and endpoints that handle form submissions. |
| **2 — Inline styles, interaction & server-side validation** | `public/js/validate.js`, `routes/auth.js` (`validateRegistration`), `db.js` | Client-side JS validation, full server-side re-validation, and temporary storage of validated data (JSON files). |
| **3 — Advanced CSS & responsive design** | `public/css/style.css` | Multi-section layout, CSS transitions/animations (`@keyframes float`, `rise`), and mobile-first media queries. |
| **4 — Complex form validation & dynamic DOM** | `routes/tasks.js`, `public/js/dashboard.js` | Password-strength rules, live DOM updates on create/toggle/delete, and a lightweight client-side "router" (the All/Active/Completed tabs, synced to the URL hash). |
| **5 — API integration & front-end interaction** | `routes/tasks.js`, `public/js/dashboard.js` | A RESTful `/api/tasks` API (GET/POST/PUT/DELETE) consumed entirely by the dashboard's own front end. |
| **6 — Database integration & user authentication** | `db.js`, `routes/auth.js`, `middleware/auth.js` | Persistent storage, bcrypt-hashed passwords, sessions, and authorization checks on every `/api/tasks` route. |
| **7 — Advanced API usage & external API integration** | `routes/external.js` | A live third-party API call (Quotable), rate limiting via `express-rate-limit`, and graceful error handling with a fallback response. |
| **8 — Advanced server-side functionality** | `middleware/logger.js`, `middleware/cache.js`, `middleware/jobQueue.js` | Custom logging middleware, an in-memory background job queue (simulating task-created notifications), and a TTL response cache with invalidation on writes. |

## Swapping in a real database

`db.js` exposes `findAll`, `findOne`, `insert`, `update`, and `remove`. To
move to MongoDB or MySQL, replace the implementations inside that one file —
no other file needs to change.

## Notes for graders / LinkedIn submission

- Passwords are hashed with bcrypt; sessions are cookie-based.
- The external API used in Task 7 (`api.quotable.io`) is free and keyless, so
  the demo works without any setup. Swap the URL/headers in
  `routes/external.js` for any API you have credentials for (e.g. OpenWeather,
  GitHub) — the OAuth/rate-limiting/error-handling pattern stays the same.
- `data/*.json` is where registered users and tasks are stored; it's
  git-ignored and safe to delete to reset the app.
