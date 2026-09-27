# TaskForge

A full-stack task management web app built from scratch — server-rendered
auth flows, a RESTful API, session-based authentication, a live third-party
API integration, and production-style middleware (logging, caching, and a
background job queue), all running on a minimal Node.js/Express stack.

**Live look:** register an account, add tasks with priority levels, filter
between All / Active / Completed, and pull in a motivational quote from an
external API — all backed by a real REST API under the hood, not mock data.

## Why I built this

I wanted a project that touches every layer of a typical web app, end to
end: HTML forms → client validation → server validation → REST API →
persistence → auth → third-party integration → server-side performance
concerns like caching and background jobs. Each of those is implemented as
its own small, readable module rather than crammed into one file, so the
codebase reads the way a real (if small) production app would.

## Features

- 🔐 **Authentication** — registration and login with bcrypt-hashed
  passwords and cookie-based sessions
- ✅ **Task management** — full CRUD (create, read, update, delete) via a
  RESTful API, with per-user data isolation
- 🎯 **Validation on both ends** — instant client-side feedback (password
  strength, required fields) backed by non-negotiable server-side checks
- 🖥️ **Dynamic, responsive UI** — vanilla JS DOM updates (no framework),
  custom CSS with transitions and mobile-first breakpoints
- 🌐 **External API integration** — live quote fetch from a third-party
  API, with rate limiting and graceful fallback on failure
- ⚙️ **Server internals** — custom request logging middleware, an
  in-memory TTL response cache with invalidation, and a background job
  queue for async work (e.g. notifications)

## Tech stack

| Layer | Tech |
|---|---|
| Server | Node.js, Express |
| Views | EJS (server-side rendering) |
| Auth | express-session, bcryptjs |
| Frontend | Vanilla JavaScript, custom CSS |
| Data | JSON-file store (swappable for MongoDB/MySQL — see below) |
| Extras | express-rate-limit, in-memory caching, custom middleware |

## Getting started

```bash
git clone https://github.com/sangaviasokan-a/cognifyz-fullstack-internship.git
cd cognifyz-fullstack-internship
npm install
npm start
```

Open **http://localhost:3000** — no database setup, API keys, or
environment variables required.

## Project structure

```
server.js                Express app setup, middleware wiring
db.js                     Data layer (single swap-in point for a real DB)
middleware/
  auth.js                   Session guard + route-level authorization
  logger.js                 Custom request logging
  cache.js                   In-memory TTL response cache
  jobQueue.js                 Background job queue
routes/
  auth.js                   Register / login / logout + server validation
  tasks.js                    RESTful CRUD API for tasks
  external.js                  Third-party API proxy + rate limiting
views/                     EJS templates
public/css/style.css       Responsive, animated UI
public/js/                Client-side validation + dashboard interactivity
```

## Swapping in a real database

`db.js` exposes a small repository interface — `findAll`, `findOne`,
`insert`, `update`, `remove`. Swapping the JSON-file backend for MongoDB or
MySQL only means rewriting that one file; nothing in `routes/` or
`middleware/` needs to change.

## What I'd add next

- Persist sessions/data to a real database (Mongo or Postgres)
- Add automated tests (Jest + Supertest) for the API routes
- Deploy a live demo (Render/Railway) and link it here

---

Built by [Sangavi Asokan](https://github.com/sangaviasokan-a) as part of the
Cognifyz Technologies Full Stack Development internship.
